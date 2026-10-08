/**
 * 브라우저 점검(빌드 결과를 서버로 띄운 뒤): node tests/smoke.cjs [http://localhost:3000] [출력 폴더]
 * - 화면 폭별 가로 넘침·콘솔 오류, 인트로 끝 상태(타이핑된 제목 = 원문)
 * - 상담 신청: 종류별 질문(웹사이트 / AI 영상광고 / 둘 다 / 자동화), 성공·실패 화면(서버 응답은 가짜로 대체 — 실제 메일 안 보냄)
 * - 요금 버튼에서 열면 종류·상품이 미리 선택됨, 작업물 크게 보기, 모바일 메뉴, 계산기, 동작 줄이기
 * Playwright: NODE_PATH=/opt/node22/lib/node_modules
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:3000';
const OUT = path.resolve(process.argv[3] || 'tests/out');
fs.mkdirSync(OUT, { recursive: true });
const exe = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined;

const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? ` — ${info}` : ''}`); };

async function page(browser, vp, opts = {}) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: opts.reduced ? 'reduce' : 'no-preference', hasTouch: !!opts.touch, isMobile: !!opts.touch });
  const p = await ctx.newPage();
  const errors = [];
  p.on('pageerror', (e) => errors.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error' && !(opts.allow502 && /status of 502/.test(m.text()))) errors.push(m.text()); });
  return { ctx, p, errors };
}

(async () => {
  const browser = await chromium.launch({ executablePath: exe });

  // 1) 화면 폭별: 넘침·오류·인트로
  for (const vp of [{ width: 1920, height: 1080 }, { width: 1440, height: 900 }, { width: 1280, height: 720 }, { width: 1024, height: 768 }, { width: 834, height: 1194 }, { width: 390, height: 844 }, { width: 360, height: 740 }]) {
    const { ctx, p, errors } = await page(browser, vp, { touch: vp.width < 1024 });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(4200);
    const st = await p.evaluate(() => ({
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      done: document.documentElement.classList.contains('intro-done'),
      typed: [...document.querySelectorAll('[data-type-title] span')].map((s) => s.textContent).join(''),
      caret: !!document.querySelector('.hero-title .caret'),
      ws: getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--ws'),
    }));
    check(`${vp.width}×${vp.height} 가로 넘침 없음`, st.over <= 0, `넘침 ${st.over}px`);
    check(`${vp.width} 인트로 끝 · 제목 원문 그대로`, st.done && st.typed === '선택받는 브랜드는보여지는 방식이 다릅니다.' && !st.caret, `${st.typed} / --ws ${st.ws}`);
    await p.screenshot({ path: path.join(OUT, `hero-${vp.width}.png`) });
    // 아래까지 내려 모든 요소 등장시키기
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } });
    await p.waitForTimeout(1500);
    const hidden = await p.evaluate(() => [...document.querySelectorAll('.rv')].filter((e) => !e.classList.contains('in')).length);
    check(`${vp.width} 스크롤하면 모든 요소 등장`, hidden === 0, `남은 ${hidden}`);
    const over2 = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${vp.width} 전체 페이지 가로 넘침 없음`, over2 <= 0, `넘침 ${over2}px`);
    if (vp.width === 1440 || vp.width === 390) {
      await p.evaluate(() => scrollTo(0, 0)); // 고정 머리줄이 맨 위에 찍히게
      await p.waitForTimeout(400);
      await p.screenshot({ path: path.join(OUT, `full-${vp.width}.png`), fullPage: true });
    }
    check(`${vp.width} 콘솔 오류 없음`, errors.length === 0, errors.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // 2) 상담 신청 — 종류별 질문과 성공·실패
  const flows = [
    { type: 'AI 영상광고', show: ['film', 'common'], hide: ['web', 'ax'], status: 200, body: { ok: true }, expect: 'done' },
    { type: '웹사이트 제작', show: ['web', 'common'], hide: ['film', 'ax'], status: 502, body: { ok: false }, expect: 'fail' },
    { type: '웹사이트 + AI 영상광고', show: ['web', 'film', 'common'], hide: ['ax'], status: 200, body: { ok: false }, expect: 'fail' },
    { type: 'AI 업무 자동화 · 맞춤 개발', show: ['ax', 'common'], hide: ['web', 'film'], status: 200, body: { ok: true }, expect: 'done' },
  ];
  for (const f of flows) {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 }, { allow502: f.status === 502 });
    let posted = null;
    await p.route('**/api/contact', async (route) => { posted = route.request().postData() || ''; await route.fulfill({ status: f.status, contentType: 'application/json', body: JSON.stringify(f.body) }); });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3600);
    await p.click('.hero [data-consult]');
    await p.waitForSelector('#consult[open]');
    await p.click('[data-cs-next]');
    const typeErr = await p.isVisible('[data-err="type"]');
    await p.check(`input[name="consultType"][value="${f.type}"]`, { force: true });
    await p.click('[data-cs-next]');
    await p.click('[data-cs-next]'); // 이름·이메일 비움 → 오류
    const nameErr = await p.evaluate(() => document.querySelector('input[name="name"]').getAttribute('aria-invalid'));
    await p.fill('input[name="name"]', '테스트');
    await p.fill('input[name="email"]', 'test@example.com');
    await p.click('[data-cs-next]');
    const vis = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-detail]')].map((d) => [d.dataset.detail, !d.hidden])));
    const okDetails = f.show.every((k) => vis[k]) && f.hide.every((k) => !vis[k]);
    if (vis.film) { await p.check('input[name="videoUse"][value="SNS 광고"]', { force: true }); await p.check('input[name="videoLength"][value="15초 이하"]', { force: true }); }
    if (vis.web) await p.check('input[name="product"][value="BUSINESS · 비즈니스형"]', { force: true });
    if (vis.ax) await p.fill('textarea[name="automation"]', '견적서 자동화');
    await p.fill('textarea[name="message"]', '테스트 문의');
    await p.click('[data-cs-next]');
    const summary = await p.textContent('[data-summary]');
    await p.click('[data-cs-submit]');
    await p.waitForSelector(`[data-step="${f.expect}"]:not([hidden])`, { timeout: 8000 }).catch(() => {});
    const shown = await p.evaluate((e) => !document.querySelector(`[data-step="${e}"]`).hidden, f.expect);
    const mail = f.expect === 'fail' ? await p.getAttribute('[data-cs-mail]', 'href') : '';
    check(`상담(${f.type}) 종류 미선택 오류`, typeErr);
    check(`상담(${f.type}) 필수 칸 오류`, nameErr === 'true');
    check(`상담(${f.type}) 종류별 질문`, okDetails, JSON.stringify(vis));
    check(`상담(${f.type}) 요약에 종류 표시`, summary.includes(f.type));
    check(`상담(${f.type}) 보낸 내용에 종류·이름`, !!posted && posted.includes(f.type) && posted.includes('테스트'));
    check(`상담(${f.type}) 숨긴 질문은 보내지 않음`, !!posted && (vis.web || !posted.includes('name="product"')) && (vis.film || !posted.includes('name="videoUse"')));
    check(`상담(${f.type}) 응답 ${f.status}/${JSON.stringify(f.body)} → ${f.expect}`, shown, mail ? mail.slice(0, 60) : '');
    if (f.type === 'AI 영상광고') await p.screenshot({ path: path.join(OUT, 'consult-done.png') });
    if (f.expect === 'fail' && f.status === 502) await p.screenshot({ path: path.join(OUT, 'consult-fail.png') });
    check(`상담(${f.type}) 콘솔 오류 없음`, errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 3) 요금 버튼 → 종류·상품 미리 선택, 모바일 화면에서 모달
  {
    const { ctx, p } = await page(browser, { width: 390, height: 844 }, { touch: true });
    await p.goto(`${BASE}/#pricing`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(800);
    await p.click('.plan.featured [data-consult]');
    await p.waitForSelector('#consult[open]');
    const st = await p.evaluate(() => ({
      type: document.querySelector('input[name="consultType"]:checked')?.value,
      product: document.querySelector('input[name="product"]:checked')?.value,
      step: [...document.querySelectorAll('[data-step]')].find((s) => !s.hidden)?.dataset.step,
    }));
    check('요금(BUSINESS) 버튼 → 종류·플랜 미리 선택, 2단계부터', st.type === '웹사이트 제작' && st.product === 'BUSINESS · 비즈니스형' && st.step === '1', JSON.stringify(st));
    await p.screenshot({ path: path.join(OUT, 'consult-mobile.png') });
    await p.keyboard.press('Escape');
    const closed = await p.evaluate(() => !document.querySelector('#consult').open);
    check('Esc로 상담 창 닫힘', closed);
    // 영상광고 요금 버튼
    await p.click('.plan-film [data-consult]');
    const t2 = await p.evaluate(() => document.querySelector('input[name="consultType"]:checked')?.value);
    check('AI 영상광고 요금 버튼 → AI 영상광고 선택', t2 === 'AI 영상광고', t2);
    await ctx.close();
  }

  // 3-1) 요금·서비스 = 견적서 플랜(2026.10.07), 무료 혜택, 예전 상품명·식당 문구 없음
  {
    const { ctx, p } = await page(browser, { width: 1440, height: 900 });
    await p.goto(`${BASE}/#pricing`, { waitUntil: 'networkidle' });
    const st = await p.evaluate(() => ({
      plans: [...document.querySelectorAll('.plan')].map((el) => `${el.querySelector('.plan-name').textContent} ${el.querySelector('.price').innerText}`),
      featured: document.querySelector('.plan.featured .plan-name')?.textContent,
      adds: [...document.querySelectorAll('.plan.featured ul.adds li')].map((li) => li.textContent),
      free: [...document.querySelectorAll('.free-band b')].map((b) => b.textContent),
      svc: [...document.querySelectorAll('.svc-name')].map((h) => h.textContent),
      restaurant: /식당|메뉴판|주방/.test(document.querySelector('#pricing').textContent + document.querySelector('#services').textContent + document.querySelector('#faq').textContent),
      old: /ONLINE STORE|1,990|4,490/.test(document.body.textContent),
    }));
    check('요금: 견적서 플랜 STARTER NZD 1,490 · BUSINESS NZD 2,900 · ENTERPRISE NZD 5,500+', st.plans.join('|') === 'STARTER NZD 1,490|BUSINESS NZD 2,900|ENTERPRISE NZD 5,500+', st.plans.join(' | '));
    check('요금: BUSINESS만의 기능을 위에 강조(4개)', st.featured === 'BUSINESS' && st.adds.length === 4 && st.adds[0] === '최대 10페이지 구성', st.adds.join(', '));
    check('요금: 모든 플랜 무료 혜택 3가지', st.free.join('|') === '웹사이트 유지보수 무료|웹사이트 관리비 무료|웹 호스팅 무료', st.free.join(', '));
    check('서비스: STARTER · BUSINESS · ENTERPRISE · AI 영상광고', st.svc.join('|') === 'STARTER|BUSINESS|ENTERPRISE|AI VIDEO AD', st.svc.join(', '));
    check('요금·서비스·FAQ에 식당 위주 문구 없음, 예전 상품명·가격 없음', !st.restaurant && !st.old);
    await ctx.close();
  }

  // 3-2) 통화: 같은 숫자, 접속 위치로 표기 — 뉴질랜드 NZD(GST 포함) / 그 밖의 나라(미국 포함) USD. 프록시가 알려 주는 접속 주소(X-Forwarded-For)로 흉내
  {
    const cases = [
      { name: '로컬(알 수 없음) → NZD', headers: {}, url: '/', cur: 'NZD' },
      { name: '미국 IP 8.8.8.8 → USD', headers: { 'X-Forwarded-For': '8.8.8.8' }, url: '/', cur: 'USD' },
      { name: '뉴질랜드 IP(Spark) → NZD', headers: { 'X-Forwarded-For': '122.56.1.1' }, url: '/', cur: 'NZD' },
      { name: '미국 IPv6 → USD', headers: { 'X-Forwarded-For': '2001:4860:4860::8888' }, url: '/', cur: 'USD' },
      { name: '확인용 ?cur=usd → USD', headers: {}, url: '/?cur=usd', cur: 'USD' },
    ];
    for (const c of cases) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: c.headers });
      const p = await ctx.newPage();
      const res = await p.goto(`${BASE}${c.url}`, { waitUntil: 'networkidle' });
      const st = await p.evaluate(() => ({
        usd: document.documentElement.classList.contains('usd'),
        prices: [...document.querySelectorAll('.plan .price')].map((e) => e.innerText).join(' | '),
        chip: document.querySelector('.pricing .currency').innerText,
        note1: document.querySelector('.pnotes li').innerText,
        tab: document.querySelector('.svc-tabs .p').innerText,
        calc: document.querySelector('.calc-note').innerText,
        visible: document.querySelector('#pricing').innerText + document.querySelector('#services').innerText,
      }));
      const C = c.cur, O = C === 'NZD' ? 'USD' : 'NZD';
      const ok = st.usd === (C === 'USD') && st.prices === `${C} 1,490 | ${C} 2,900 | ${C} 5,500+` && st.chip === (C === 'NZD' ? 'NZD 기준 · GST 포함' : 'USD 기준')
        && st.note1.includes(`(${C})`) && st.tab === `기본형 · ${C} 1,490` && st.calc.includes(`STARTER(${C} 1,490`) && !st.visible.includes(O) && (C === 'NZD' || !st.visible.includes('GST'));
      check(`통화: ${c.name}`, ok, `${st.prices} · ${st.chip}`);
      if (c.cur === 'USD' && c.url === '/') check('통화: 첫 화면은 공용 캐시에 저장 안 함(방문자마다 다름)', /private/.test(res.headers()['cache-control'] || ''), res.headers()['cache-control']);
      await ctx.close();
    }
  }

  // 4) 작업물 크게 보기·키보드
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await p.goto(`${BASE}/#work`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(600);
    await p.click('[data-work="2"]');
    await p.waitForSelector('#lightbox[open]');
    const c1 = await p.textContent('[data-lb-count]');
    await p.keyboard.press('ArrowRight');
    const c2 = await p.textContent('[data-lb-count]');
    await p.waitForTimeout(500);
    await p.screenshot({ path: path.join(OUT, 'lightbox.png') });
    await p.keyboard.press('Escape');
    const focusBack = await p.evaluate(() => document.activeElement?.dataset?.work);
    check('크게 보기 열림·다음·닫힘·초점 복귀', c1.startsWith('03') && c2.startsWith('04') && focusBack === '2', `${c1} → ${c2}, 초점 ${focusBack}`);
    check('크게 보기 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 5) 모바일 메뉴
  {
    const { ctx, p } = await page(browser, { width: 390, height: 844 }, { touch: true });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    await p.click('[data-menu]');
    const open = await p.isVisible('#mnav');
    await p.screenshot({ path: path.join(OUT, 'menu-390.png') });
    await p.click('#mnav a[href="#faq"]');
    await p.waitForTimeout(900);
    const st = await p.evaluate(() => ({ hidden: document.querySelector('#mnav').hidden, y: scrollY, faq: Math.round(document.querySelector('#faq').getBoundingClientRect().top) }));
    check('모바일 메뉴 열기 → 링크 누르면 닫히고 이동', open && st.hidden && st.y > 1000, JSON.stringify(st));
    await ctx.close();
  }

  // 6) 계산기
  {
    const { ctx, p } = await page(browser, { width: 1440, height: 900 });
    await p.goto(`${BASE}/#fee`, { waitUntil: 'networkidle' });
    await p.fill('[data-c="setup"]', '3000');
    await p.fill('[data-c="monthly"]', '150');
    await p.fill('[data-c="years"]', '5');
    await p.dispatchEvent('[data-c="years"]', 'input');
    const out = await p.textContent('[data-o="other"]');
    const setupVal = await p.inputValue('[data-c="setup"]');
    check('계산기: $3,000 + $150×12×5 = $12,000', out === '$12,000' && setupVal === '3,000', `${out}, ${setupVal}`);
    const pauseOut = await p.textContent('[data-o="pause"]');
    check('계산기: PAUSE 쪽 = STARTER 제작비 $1,490', pauseOut === '$1,490', pauseOut);
    await ctx.close();
  }

  // 7) 동작 줄이기: 인트로 없이 바로, 벽 멈춤 버튼 숨김, 자동 재생 없음
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 }, { reduced: true });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const st = await p.evaluate(() => ({
      done: document.documentElement.classList.contains('intro-done'),
      toggle: document.querySelector('[data-wall-toggle]').hidden,
      op: getComputedStyle(document.querySelector('.hero-sub')).opacity,
      playing: [...document.querySelectorAll('video')].filter((v) => !v.paused).length,
    }));
    check('동작 줄이기: 인트로 생략·내용 바로 보임·자동 재생 없음', st.done && st.toggle && st.op === '1' && st.playing === 0, JSON.stringify(st));
    check('동작 줄이기 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 8) 움직임 멈추기 버튼
  {
    const { ctx, p } = await page(browser, { width: 1440, height: 900 });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    await p.click('[data-wall-toggle]');
    const a = await p.evaluate(() => document.querySelector('.track').style.transform);
    await p.waitForTimeout(700);
    const b = await p.evaluate(() => document.querySelector('.track').style.transform);
    const pressed = await p.getAttribute('[data-wall-toggle]', 'aria-pressed');
    check('움직임 멈추기 → 벽 정지', a === b && pressed === 'true', `${a} / ${b}`);
    await p.reload({ waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    const kept = await p.getAttribute('[data-wall-toggle]', 'aria-pressed');
    check('멈춤 설정 기억(새로고침 후)', kept === 'true');
    await ctx.close();
  }

  // 9) JS 꺼진 환경: 내용이 그대로 보임
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, javaScriptEnabled: false });
    const p = await ctx.newPage();
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const st = await p.evaluate(() => ({ h1: document.querySelector('h1').textContent, op: getComputedStyle(document.querySelector('.hero-sub')).opacity, faq: document.querySelectorAll('.faq-list details').length }));
    check('JS 없이도 제목·내용 표시', st.h1.includes('선택받는 브랜드는') && st.op === '1' && st.faq === 14, JSON.stringify(st));
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} 통과`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
