/**
 * 브라우저 점검(빌드 결과를 서버로 띄운 뒤): node tests/smoke.cjs [http://localhost:3000] [출력 폴더]
 * - 화면 폭별 가로 넘침·콘솔 오류, 인트로 끝 상태(타이핑된 제목 = 원문, 문장 끝 커서는 계속 깜빡임)
 * - 상담 신청: 종류별 질문(웹사이트 / AI 광고영상 / 둘 다 / 자동화), 성공·실패 화면(서버 응답은 가짜로 대체: 실제 메일 안 보냄)
 * - 요금 버튼에서 열면 종류·상품이 미리 선택됨, 작업물 크게 보기, 모바일 메뉴, 계산기(세는 숫자), 동작 줄이기
 * - 2026-10-08 개편: 포트폴리오 반복 재생, 비교 손잡이(키보드·끌기), 광고 샘플 탭, 질문 탭·열고 닫기, 전화 상담 메뉴,
 *   이메일(info@), 화면 글에 줄표·하이픈·별표·참고표 없음
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
/** Playwright의 Chromium에는 H.264(MP4) 재생기가 없어, 재생 동작을 볼 때는 .mp4 요청에 작은 WebM(6초)을 대신 보낸다 */
const TINY = fs.readFileSync(path.join(__dirname, 'fixtures/tiny.webm'));
const fakeVideos = (p) => p.route('**/*.mp4', (route) => route.fulfill({ status: 200, contentType: 'video/webm', body: TINY }));
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
      carets: document.querySelectorAll('.hero-title .caret').length,
      endCaret: !!document.querySelector('.hero-title .l3 > .caret.end:last-child'),
      blink: getComputedStyle(document.querySelector('.hero-title .caret.end') || document.body).animationName,
      ws: getComputedStyle(document.querySelector('[data-hero]')).getPropertyValue('--ws'),
    }));
    check(`${vp.width}×${vp.height} 가로 넘침 없음`, st.over <= 0, `넘침 ${st.over}px`);
    check(`${vp.width} 인트로 끝 · 제목 원문 그대로`, st.done && st.typed === '선택받는 브랜드는보여지는 방식이 다릅니다.', `${st.typed} / --ws ${st.ws}`);
    check(`${vp.width} 타이핑이 끝난 뒤에도 문장 끝 커서가 깜빡임`, st.carets === 1 && st.endCaret && st.blink === 'caretBlink', `${st.carets}개 · ${st.blink}`);
    await p.screenshot({ path: path.join(OUT, `hero-${vp.width}.png`) });
    // 아래까지 내려 모든 요소 등장시키기
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 120)); } });
    await p.waitForTimeout(1500);
    const hidden = await p.evaluate(() => [...document.querySelectorAll('.rv')].filter((e) => !e.classList.contains('in')).length);
    check(`${vp.width} 스크롤하면 모든 요소 등장`, hidden === 0, `남은 ${hidden}`);
    const over2 = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    check(`${vp.width} 전체 페이지 가로 넘침 없음`, over2 <= 0, `넘침 ${over2}px`);
    if (vp.width === 1440 || vp.width === 390) {
      await p.evaluate(() => scrollTo({ top: 0, behavior: 'instant' })); // 고정 머리줄이 맨 위에 찍히게
      await p.waitForTimeout(400);
      await p.screenshot({ path: path.join(OUT, `full-${vp.width}.png`), fullPage: true });
    }
    check(`${vp.width} 콘솔 오류 없음`, errors.length === 0, errors.slice(0, 3).join(' | '));
    await ctx.close();
  }

  // 2) 상담 신청 — 종류별 질문과 성공·실패
  const flows = [
    { type: 'AI 광고영상', show: ['film', 'common'], hide: ['web', 'ax'], status: 200, body: { ok: true }, expect: 'done' },
    { type: '웹사이트 제작', show: ['web', 'common'], hide: ['film', 'ax'], status: 502, body: { ok: false }, expect: 'fail' },
    { type: '웹사이트 + AI 광고영상', show: ['web', 'film', 'common'], hide: ['ax'], status: 200, body: { ok: false }, expect: 'fail' },
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
    if (vis.film) { await p.check('input[name="videoUse"][value="SNS 광고"]', { force: true }); await p.check('input[name="videoProduct"][value="AI BRAND AD · 30초"]', { force: true }); }
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
    if (vis.film) check(`상담(${f.type}) 영상 상품 선택이 함께 보내짐`, !!posted && posted.includes('name="videoProduct"') && posted.includes('AI BRAND AD'));
    check(`상담(${f.type}) 응답 ${f.status}/${JSON.stringify(f.body)} → ${f.expect}`, shown, mail ? mail.slice(0, 60) : '');
    if (f.type === 'AI 광고영상') { await p.waitForTimeout(900); await p.screenshot({ path: path.join(OUT, 'consult-done.png') }); }
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
    const closing = await p.evaluate(() => document.querySelector('#consult').classList.contains('closing'));
    await p.waitForTimeout(700);
    const closed = await p.evaluate(() => !document.querySelector('#consult').open && !document.documentElement.classList.contains('modal-open'));
    check('Esc로 상담 창 닫힘(짧게 사라지는 움직임 뒤)', closed && closing, `closing ${closing}`);
    // AI 광고영상 요금 버튼(대표 상품 · 월간)
    for (const [sel, want] of [['.vplan.featured [data-consult]', 'AI BRAND AD · 30초'], ['.vmonthly [data-consult]', 'MONTHLY CREATIVE · 월 4편']]) {
      await p.click(sel);
      await p.waitForSelector('#consult[open]');
      const t2 = await p.evaluate(() => ({ type: document.querySelector('input[name="consultType"]:checked')?.value, product: document.querySelector('input[name="videoProduct"]:checked')?.value }));
      check(`AI 광고영상 요금 버튼 → AI 광고영상 · ${want}`, t2.type === 'AI 광고영상' && t2.product === want, JSON.stringify(t2));
      await p.click('#consult [data-cs-close].cs-x');
      await p.waitForTimeout(700);
    }
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
      free: [...document.querySelectorAll('.free-band b')].map((b) => b.textContent.replace(/\u00a0/g, ' ')),
      base: [...document.querySelectorAll('.plan.featured .pl-base')].map((b) => ({ label: b.querySelector('.pl-lab').textContent, n: b.querySelectorAll('ul.chk li .ck').length, color: getComputedStyle(b.querySelector('li')).color })),
      vplans: [...document.querySelectorAll('.vplan')].map((el) => `${el.querySelector('.plan-name').textContent} ${el.querySelector('.price').innerText}`),
      monthly: document.querySelector('.vmonthly .price')?.innerText,
      formats: [...document.querySelectorAll('.fm-list .fmt b')].map((b) => b.innerText).join(' | '),
      addons: document.querySelectorAll('.addon-table tr').length,
      services: !!document.querySelector('#services, .svc-tabs, .svc-name'),
      ctas: [...document.querySelectorAll('.plan .btn, .vplan .btn, .vmonthly .btn')].map((b) => b.textContent.trim()),
      restaurant: /식당|메뉴판|주방/.test(document.querySelector('#pricing').textContent + document.querySelector('#video-pricing').textContent + document.querySelector('#faq').textContent),
      old: /ONLINE STORE|1,990|4,490/.test(document.body.textContent),
    }));
    check('요금: 견적서 플랜 STARTER NZD 1,490 · BUSINESS NZD 2,900 · ENTERPRISE NZD 5,500+', st.plans.join('|') === 'STARTER NZD 1,490|BUSINESS NZD 2,900|ENTERPRISE NZD 5,500+', st.plans.join(' | '));
    check('요금: BUSINESS만의 기능을 위에 강조(4개)', st.featured === 'BUSINESS' && st.adds.length === 4 && st.adds[0] === '최대 10페이지 구성', st.adds.join(', '));
    check('요금: 모든 플랜 무료 혜택 3가지', st.free.join('|') === '유지보수 무료|관리비 무료|웹 호스팅 무료', st.free.join(', '));
    check('요금: 기본 포함은 체크 표시와 또렷한 글자(BUSINESS 5개)', st.base.length === 1 && st.base[0].label === '기본 포함' && st.base[0].n === 5, JSON.stringify(st.base));
    check('요금: 플랜 버튼은 모두 무료 상담받기', st.ctas.length === 7 && st.ctas.every((t) => t === '무료 상담받기'), st.ctas.join(', '));
    check('요금: 같은 플랜이 두 번 나오지 않음(서비스 칸 없음)', !st.services);
    check('AI 광고영상: SHORT 490 · BRAND 890 · HERO 1,490부터 · 월간 2,490/월', st.vplans.join('|') === 'AI SHORT AD NZD 490|AI BRAND AD NZD 890|AI HERO FILM NZD 1,490부터' && st.monthly === 'NZD 2,490/월', `${st.vplans.join(' | ')} · ${st.monthly}`);
    check('AI 광고영상: 가로 16:9 · 세로 9:16 기본 제공, 추가 작업 14가지', st.formats === '가로형 16:9 | 세로형 9:16' && st.addons === 14, `${st.formats} · ${st.addons}`);
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
        video: [...document.querySelectorAll('.vplan .price, .vmonthly .price')].map((e) => e.innerText).join(' | '),
        calc: document.querySelector('.calc-note').innerText,
        visible: document.querySelector('#pricing').innerText + document.querySelector('#video-pricing').innerText,
      }));
      const C = c.cur, O = C === 'NZD' ? 'USD' : 'NZD';
      const ok = st.usd === (C === 'USD') && st.prices === `${C} 1,490 | ${C} 2,900 | ${C} 5,500+` && st.chip === (C === 'NZD' ? 'NZD 기준 · GST 15% 별도' : 'USD 기준')
        && st.note1.includes(`(${C})`) && (C === 'USD' || st.note1.includes('GST 15%는 별도')) && st.video === `${C} 490 | ${C} 890 | ${C} 1,490부터 | ${C} 2,490/월`
        && st.calc.includes(`STARTER(${C} 1,490`) && !st.visible.includes(O) && (C === 'NZD' || !st.visible.includes('GST'));
      check(`통화: ${c.name}`, ok, `${st.prices} · ${st.video} · ${st.chip}`);
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
    await p.waitForTimeout(600);
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
    await p.waitForTimeout(150);
    const mid = await p.textContent('[data-o="other"]');
    await p.waitForTimeout(1200);
    const out = await p.textContent('[data-o="other"]');
    const setupVal = await p.inputValue('[data-c="setup"]');
    check('계산기: $3,000 + $150×12×5 = $12,000(숫자가 세면서 바뀜)', out === '$12,000' && setupVal === '3,000' && mid !== '$12,000', `${mid} → ${out}, ${setupVal}`);
    const pauseOut = await p.textContent('[data-o="pause"]');
    check('계산기: PAUSE 쪽 = STARTER 제작비 $1,490', pauseOut === '$1,490', pauseOut);
    const sv = await p.evaluate(() => ({ hidden: document.querySelector('[data-save]').hidden, save: document.querySelector('[data-o="save"]').textContent, w: document.querySelector('[data-bar="pause"]').style.getPropertyValue('--w'), live: document.querySelector('[data-calc-live]').textContent, logo: !!document.querySelector('.calc-pause .lbl img[alt="PAUSE Studio"]'), label: document.querySelector('.calc legend').textContent }));
    check('계산기: 아끼는 금액 $10,510 · 막대 비율 · 화면 읽기용 결과 · 로고 · 타사 견적', !sv.hidden && sv.save === '$10,510' && Math.abs(Number(sv.w) - 1490 / 12000) < 0.001 && sv.live.includes('$12,000') && sv.logo && sv.label === '타사 견적', JSON.stringify(sv));
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
      still: document.documentElement.classList.contains('still'),
      caret: !!document.querySelector('.hero-title .caret.end'),
    }));
    await p.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 60)); } });
    await p.waitForTimeout(600);
    const playing2 = await p.evaluate(() => [...document.querySelectorAll('video')].filter((v) => !v.paused).length);
    check('동작 줄이기: 인트로 생략·내용 바로 보임·자동 재생 없음(끝까지 내려도)', st.done && st.toggle && st.op === '1' && st.playing === 0 && playing2 === 0 && st.still && st.caret, JSON.stringify({ ...st, playing2 }));
    check('동작 줄이기 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 8) 움직임 멈추기 버튼
  {
    const { ctx, p } = await page(browser, { width: 1440, height: 900 });
    await fakeVideos(p);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    await p.click('[data-wall-toggle]');
    const a = await p.evaluate(() => document.querySelector('.track').style.transform);
    await p.waitForTimeout(700);
    const b = await p.evaluate(() => document.querySelector('.track').style.transform);
    const pressed = await p.getAttribute('[data-wall-toggle]', 'aria-pressed');
    check('움직임 멈추기 → 벽 정지', a === b && pressed === 'true', `${a} / ${b}`);
    await p.evaluate(() => document.querySelector('#work').scrollIntoView({ behavior: 'instant' }));
    await p.waitForTimeout(1500);
    const w = await p.evaluate(() => ({ still: document.documentElement.classList.contains('still'), toggle: document.querySelector('[data-motion-toggle]').getAttribute('aria-pressed'), playing: [...document.querySelectorAll('video[data-loop]')].filter((v) => !v.paused).length }));
    check('움직임 멈추기 → 포트폴리오 반복 재생도 멈춤 · 포트폴리오 버튼도 같은 상태', w.still && w.toggle === 'true' && w.playing === 0, JSON.stringify(w));
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
    const st = await p.evaluate(() => ({
      h1: document.querySelector('h1').textContent, op: getComputedStyle(document.querySelector('.hero-sub')).opacity,
      faq: [...document.querySelectorAll('.faq-list details')].filter((d) => d.getClientRects().length).length,
      film: [...document.querySelectorAll('.fs-panel')].filter((d) => d.getClientRects().length).length,
    }));
    check('JS 없이도 제목·내용 표시(질문 26개 · 광고 샘플 4개 모두 보임)', st.h1.includes('선택받는 브랜드는') && st.op === '1' && st.faq === 26 && st.film === 4, JSON.stringify(st));
    await ctx.close();
  }

  // 10) 화면 글: 줄표·하이픈·별표·참고표 없음(2026-10-08 사용자), 이메일 info@, 전화 상담 메뉴
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    const bad = await p.evaluate(() => {
      // 보이는 글 + 닫힌 답·숨은 통화 표기까지(스크립트 제외)
      const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('script, style') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
      let t = '';
      while (w.nextNode()) t += `${w.currentNode.nodeValue} `;
      const attrs = [...document.querySelectorAll('[aria-label], [alt], [placeholder]')].map((e) => e.getAttribute('aria-label') || e.getAttribute('alt') || e.getAttribute('placeholder')).join(' ');
      return [...`${t} ${attrs}`.replace(/\s+/g, ' ').matchAll(/.{0,14}[\u2010-\u2015\-*\u203B].{0,14}/g)].map((m) => m[0]);
    });
    check('화면 글에 줄표(—·–)·하이픈(-)·별표(*)·참고표(※) 없음', bad.length === 0, bad.slice(0, 5).join(' | '));
    await p.click('.ct-card .reveal-btn');
    const mail = await p.getAttribute('.ct-card a.reveal-btn', 'href');
    await p.click('.ft .reveal-btn');
    const mail2 = await p.getAttribute('.ft a.reveal-btn', 'href');
    check('이메일 보기 → info@pause8studio.com (문의 · 푸터)', mail === 'mailto:info@pause8studio.com' && mail2 === mail, `${mail} / ${mail2}`);
    await p.click('[data-phone]');
    const ph = await p.evaluate(() => ({ open: !document.querySelector('[data-phone-menu]').hidden, exp: document.querySelector('[data-phone]').getAttribute('aria-expanded'), links: [...document.querySelectorAll('[data-phone-menu] a')].map((a) => a.getAttribute('href')), title: document.querySelector('.ct-card.phone h3').textContent }));
    await p.keyboard.press('Escape');
    const phClosed = await p.evaluate(() => document.querySelector('[data-phone-menu]').hidden);
    check('전화 상담: 누르면 전화 걸기 · 문자 보내기 선택, Esc로 닫힘', ph.open && ph.exp === 'true' && ph.links.join(' ') === 'tel:+64204887198 sms:+64204887198' && ph.title === '전화 상담' && phClosed, JSON.stringify(ph));
    check('글·이메일·전화 점검 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 11) 포트폴리오: 마우스를 올리지 않아도 영상이 반복 재생, 화면은 잘리지 않음(원래 비율)
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await fakeVideos(p);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    await p.evaluate(() => document.querySelector('#work .work-grid').scrollIntoView({ behavior: 'instant' }));
    await p.mouse.move(5, 5);
    await p.waitForTimeout(2500);
    const st = await p.evaluate(() => {
      const vids = [...document.querySelectorAll('video[data-loop]')];
      const inView = vids.filter((v) => { const r = v.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
      const fits = [...document.querySelectorAll('.wk-fit')].map((f) => {
        const img = f.querySelector('img');
        const r = f.getBoundingClientRect(), m = f.parentElement.getBoundingClientRect();
        const ar = img.naturalWidth / img.naturalHeight;
        return { inside: r.left >= m.left - 1 && r.right <= m.right + 1 && r.top >= m.top - 1 && r.bottom <= m.bottom + 1, ratio: Math.abs(r.width / r.height - ar) / ar };
      });
      return { total: vids.length, inView: inView.length, playing: inView.filter((v) => !v.paused && v.classList.contains('on')).length, loop: vids.every((v) => v.loop), fitsInside: fits.every((x) => x.inside), worstRatio: Math.max(...fits.map((x) => x.ratio)), n: fits.length };
    });
    check('포트폴리오: 보이는 영상이 마우스 없이 반복 재생', st.inView > 0 && st.playing === st.inView && st.loop && st.total === 6, JSON.stringify(st));
    check('포트폴리오: 17개 화면이 칸 안에 원래 비율 그대로(잘림 없음)', st.n === 17 && st.fitsInside && st.worstRatio < 0.02, `칸 ${st.n} · 비율 오차 ${(st.worstRatio * 100).toFixed(2)}%`);
    check('포트폴리오 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 12) 비교: 키보드(방향키·Home)와 마우스 끌기로 손잡이 이동, 화면은 영상 비율 그대로
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await p.goto(`${BASE}/#compare`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(400);
    const frame = p.locator('[data-cmp]').first();
    await frame.scrollIntoViewIfNeeded();
    await p.focus('.cmp-range >> nth=0');
    await p.keyboard.press('Home');
    for (let i = 0; i < 3; i++) await p.keyboard.press('ArrowRight');
    const k = await p.evaluate(() => { const f = document.querySelector('[data-cmp]'); return { pos: f.style.getPropertyValue('--pos'), start: f.classList.contains('at-start'), vt: f.querySelector('.cmp-range').getAttribute('aria-valuetext') }; });
    const box = await frame.boundingBox();
    await p.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.5);
    await p.mouse.down();
    await p.mouse.move(box.x + box.width * 0.65, box.y + box.height * 0.5, { steps: 5 });
    await p.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.5, { steps: 5 });
    await p.mouse.up();
    const d = await p.evaluate(() => { const f = document.querySelector('[data-cmp]'); const v = f.querySelector('video'); return { pos: parseFloat(f.style.getPropertyValue('--pos')), clip: getComputedStyle(f.querySelector('.cmp-before')).clipPath, ar: f.getBoundingClientRect().width / f.getBoundingClientRect().height, vw: Number(v.getAttribute('width')) / Number(v.getAttribute('height')) }; });
    check('비교: 방향키·Home으로 손잡이 이동(BEFORE 3%)', k.pos === '3.00%' && k.start && k.vt === 'BEFORE 3%, AFTER 97%', JSON.stringify(k));
    check('비교: 마우스로 끌어 손잡이 이동', Math.abs(d.pos - 80) < 1.5 && d.clip.includes('inset'), JSON.stringify(d));
    check('비교: 틀이 실제 화면 비율 그대로(잘림 없음)', Math.abs(d.ar - d.vw) / d.vw < 0.03, `${d.ar.toFixed(3)} vs ${d.vw.toFixed(3)}`);
    const mock = await p.evaluate(() => ({ cards: document.querySelectorAll('.mock .m-card').length, brand: document.querySelector('.mock .m-bar b').textContent, img: getComputedStyle(document.querySelector('.mock .m-thumb')).backgroundImage }));
    check('비교: BEFORE는 평범한 템플릿 사이트 모양(머리줄·사진 제목·서비스 카드 3개)', mock.cards === 6 && mock.brand === 'Kiwi Journeys' && mock.img.includes('mock-travel'), JSON.stringify(mock));
    check('비교 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 13) AI 광고영상 샘플 탭: 누르기·방향키, 보이면 지금 샘플만 재생
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await fakeVideos(p);
    await p.goto(`${BASE}/#film`, { waitUntil: 'networkidle' });
    await p.evaluate(() => document.querySelector('[data-fs]').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(2500);
    const a = await p.evaluate(() => ({ n: document.querySelectorAll('.fs-tab').length, playing: [...document.querySelectorAll('[data-fs-video]')].map((v) => !v.paused), prog: document.querySelector('.fs-tab[aria-selected="true"]').style.getPropertyValue('--prog') }));
    // 손대지 않으면 한 편이 끝날 때 다음 샘플로
    const advanced = await p.waitForFunction(() => document.querySelector('#fs-tab-ondo').getAttribute('aria-selected') === 'true', null, { timeout: 9000 }).then(() => true).catch(() => false);
    const adv = await p.evaluate(() => ({ vis: [...document.querySelectorAll('.fs-panel')].map((x) => !x.hidden), playing: [...document.querySelectorAll('[data-fs-video]')].map((v) => !v.paused) }));
    check('광고 샘플: 손대지 않으면 한 편이 끝나고 다음 샘플로 넘어감', advanced && adv.vis[1] && adv.playing[1] && !adv.playing[0], JSON.stringify(adv));
    await p.click('.fs-tab >> nth=2');
    await p.waitForTimeout(1200);
    const b = await p.evaluate(() => ({ sel: [...document.querySelectorAll('.fs-tab')].findIndex((t) => t.getAttribute('aria-selected') === 'true'), vis: [...document.querySelectorAll('.fs-panel')].map((x) => !x.hidden), playing: [...document.querySelectorAll('[data-fs-video]')].map((v) => !v.paused) }));
    await p.keyboard.press('ArrowRight');
    const c = await p.evaluate(() => ({ sel: [...document.querySelectorAll('.fs-tab')].findIndex((t) => t.getAttribute('aria-selected') === 'true'), focus: document.activeElement?.id }));
    check('광고 샘플: 4개 · 보이면 첫 샘플 재생(진행 선)', a.n === 4 && a.playing[0] && !a.playing.slice(1).some(Boolean) && Number(a.prog) > 0, JSON.stringify(a));
    check('광고 샘플: 탭 누르면 그 샘플만 보이고 재생', b.sel === 2 && b.vis.join() === 'false,false,true,false' && b.playing[2] && !b.playing[0], JSON.stringify(b));
    check('광고 샘플: 방향키로 다음 탭(초점 이동)', c.sel === 3 && c.focus === 'fs-tab-daon', JSON.stringify(c));
    check('광고 샘플 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 14) 자주 묻는 질문: 탭 전환, 답이 부드럽게 열리고 닫힘
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await p.goto(`${BASE}/#faq`, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    await p.click('#faq-tab-video');
    await p.waitForTimeout(300);
    const t = await p.evaluate(() => ({ web: document.querySelector('#faq-web').hidden, video: document.querySelector('#faq-video').hidden, sel: document.querySelector('#faq-tab-video').getAttribute('aria-selected'), x: document.querySelector('.faq-tabs').style.getPropertyValue('--x') }));
    const q = p.locator('#faq-video summary').first();
    await q.click();
    await p.waitForTimeout(120);
    const midH = await p.evaluate(() => document.querySelector('#faq-video details .acc-body').getBoundingClientRect().height);
    await p.waitForTimeout(900);
    const o = await p.evaluate(() => { const d = document.querySelector('#faq-video details'); return { open: d.open, h: d.querySelector('.acc-body').getBoundingClientRect().height, full: d.querySelector('.acc-in').scrollHeight }; });
    await q.click();
    await p.waitForTimeout(900);
    const closed = await p.evaluate(() => !document.querySelector('#faq-video details').open);
    check('질문: AI 광고영상 탭으로 전환(선택 표시 이동)', t.web && !t.video && t.sel === 'true' && parseFloat(t.x) > 0, JSON.stringify(t));
    check('질문: 답이 부드럽게 열림(중간 높이) · 다시 누르면 닫힘', o.open && midH > 0 && midH < o.full && Math.abs(o.h - o.full) < 2 && closed, JSON.stringify({ midH, ...o, closed }));
    const close = await p.evaluate(() => [...document.querySelectorAll('#faq-web summary')].find((s) => s.textContent.includes('회사가 없어지면'))?.nextElementSibling.textContent || '');
    check('질문: 폐업 시 답변(서비스 차원 혜택 · 소유권은 대표님께)', close.includes('서비스 차원') && close.includes('소유권은 모두 대표님께'), close.slice(0, 60));
    check('질문 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 15) 머리줄: 내려가면 숨고 올리면 나타남, 지금 보는 장 표시
  {
    const { ctx, p } = await page(browser, { width: 1440, height: 900 });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    await p.evaluate(async () => { const y0 = document.querySelector('#website').offsetTop + 200; for (let y = 0; y <= y0; y += 120) { scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 30)); } });
    await p.waitForTimeout(300);
    const down = await p.evaluate(() => ({ hide: document.querySelector('[data-header]').classList.contains('hide'), cur: document.querySelector('.hd-nav a[aria-current]')?.getAttribute('href') }));
    await p.evaluate(async () => { for (let i = 0; i < 4; i++) { scrollBy({ top: -40, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 40)); } });
    await p.waitForTimeout(300);
    const up = await p.evaluate(() => document.querySelector('[data-header]').classList.contains('hide'));
    check('머리줄: 내려가면 숨고 올리면 나타남 · 지금 보는 장(웹사이트 제작) 표시', down.hide && !up && down.cur === '#website', JSON.stringify({ ...down, up }));
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} 통과`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
