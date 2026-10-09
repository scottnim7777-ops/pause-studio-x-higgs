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
      formats: [...document.querySelectorAll('.fm-list .fmt b')].map((b) => b.textContent.replace(/\s+/g, ' ').trim()).join(' | '),
      addons: document.querySelectorAll('.addon-table tr').length,
      services: !!document.querySelector('#services, .svc-tabs, .svc-name'),
      ctas: [...document.querySelectorAll('.plan .btn, .vplan .btn, .vmonthly .btn')].map((b) => b.textContent.trim()),
      restaurant: /식당|메뉴판|주방/.test(document.querySelector('#pricing').textContent + document.querySelector('#video-pricing').textContent + document.querySelector('#faq').textContent),
      old: (document.body.textContent.match(/WEBSITE ·|ONLINE STORE|STARTER\s*(?:US\$|NZ\$|NZD|USD)?\s*1,490|2,900|5,500|2,690|\$190|결합\s?상품|패키지 할인|번들/g) || []).join(','),
      gst: /GST/.test(document.body.textContent),
    }));
    check('요금: 견적서 플랜 이름 + 최종 가격 STARTER USD\u00A0$1,990 · BUSINESS USD\u00A0$4,490부터 · ENTERPRISE 맞춤 견적(판별 실패 = USD)', st.plans.join('|') === 'STARTER USD\u00A0$1,990|BUSINESS USD\u00A0$4,490부터|ENTERPRISE 맞춤 견적', st.plans.join(' | '));
    check('요금: BUSINESS만의 기능 4가지를 위에 강조(견적서 그대로)', st.featured === 'BUSINESS' && st.adds.length === 4 && st.adds[0] === '최대 10페이지 구성', st.adds.join(', '));
    check('요금: 모든 플랜 무료 혜택 3가지', st.free.join('|') === '유지보수 무료|관리비 무료|웹 호스팅 무료', st.free.join(', '));
    check('요금: 기본 포함은 체크 표시와 또렷한 글자(BUSINESS 5개)', st.base.length === 1 && st.base[0].label === '기본 포함' && st.base[0].n === 5, JSON.stringify(st.base));
    check('요금: 플랜 버튼은 모두 무료 상담받기', st.ctas.length === 7 && st.ctas.every((t) => t === '무료 상담받기'), st.ctas.join(', '));
    check('요금: 같은 플랜이 두 번 나오지 않음(서비스 칸 없음)', !st.services);
    check('AI 광고영상: SHORT 490 · BRAND 890 · HERO 1,490부터 · 월간 2,490/월', st.vplans.join('|') === 'AI SHORT AD USD\u00A0$490|AI BRAND AD USD\u00A0$890|AI HERO FILM USD\u00A0$1,490부터' && st.monthly === 'USD\u00A0$2,490/월', `${st.vplans.join(' | ')} · ${st.monthly}`);
    check('AI 광고영상: 가로 16:9 · 세로 9:16 기본 제공, 추가 작업 14가지', st.formats === '가로형 16:9 | 세로형 9:16' && st.addons === 14, `${st.formats} · ${st.addons}`);
    check('요금·FAQ에 식당 위주 문구 없음 · 폐지된 가격(1,490·2,900·5,500)·다른 상품 이름(WEBSITE·ONLINE STORE)·결합 상품(2,690·$190 할인) 없음 · GST 문구 없음', !st.restaurant && !st.old && !st.gst, `old: ${st.old || '-'} · GST ${st.gst}`);
    // 가로·세로 그림(2026-10-09 사용자: 원형이 뭔지 모르겠음 → 다시 그림): 가로형 = 플레이어(16:9), 세로형 = 앞에 겹쳐 선 휴대폰(9:16).
    // 같은 바닥선, 휴대폰이 더 높고 플레이어 오른쪽을 덮음, 원형 없음, 설명은 그림 아래(PC는 각 기기의 왼쪽 선에서)
    const fmBox = () => p.evaluate(() => {
      const [h, v] = ['.fr-h', '.fr-v'].map((s) => document.querySelector(`.fm-devices ${s}`).getBoundingClientRect());
      const caps = [...document.querySelectorAll('.fm-list .fmt')].map((c) => c.getBoundingClientRect());
      const box = document.querySelector('.formats').getBoundingClientRect();
      const r = (n) => Math.round(n * 1000) / 1000;
      const front = Number(getComputedStyle(document.querySelector('.fr-v')).zIndex) > 0;
      return { arH: r(h.width / h.height), arV: r(v.width / v.height), bottom: Math.round(Math.abs(h.bottom - v.bottom)), taller: v.height > h.height, overlap: v.left < h.right && front,
        capL: [Math.round(caps[0].left - h.left), Math.round(caps[1].left - v.left)], capsBelow: caps.every((c) => c.top >= Math.max(h.bottom, v.bottom)), inside: h.left >= box.left && v.right <= box.right + 1,
        circle: !!document.querySelector('.fr-subj, .fr-cap'), ui: !!document.querySelector('.fr-h .fr-play') && document.querySelectorAll('.fr-v .fr-side svg').length === 3 };
    });
    await p.evaluate(() => document.querySelector('.formats').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForFunction(() => document.querySelector('.formats').classList.contains('in'), null, { timeout: 3000 }).catch(() => {});
    await p.waitForTimeout(1600);
    const fd = await fmBox();
    const shapeOk = (f) => Math.abs(f.arH - 16 / 9) < 0.02 && Math.abs(f.arV - 9 / 16) < 0.01 && f.bottom <= 1 && f.taller && f.overlap && f.capsBelow && f.inside && !f.circle && f.ui;
    check('AI 광고영상 화면비(1440): 플레이어 16:9 + 앞에 선 휴대폰 9:16, 같은 바닥선, 원형 없음, 설명이 각 기기 아래 같은 선에서', shapeOk(fd) && Math.abs(fd.capL[0]) <= 2 && Math.abs(fd.capL[1]) <= 2, JSON.stringify(fd));
    await p.setViewportSize({ width: 390, height: 844 });
    await p.evaluate(() => document.querySelector('.formats').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForFunction(() => document.querySelector('.formats').classList.contains('in'), null, { timeout: 3000 }).catch(() => {});
    await p.waitForTimeout(1600); // 들어오는 움직임이 끝난 뒤
    const fm = await fmBox();
    check('AI 광고영상 화면비(390): 같은 그림이 상자 안에, 설명은 아래 줄 목록', shapeOk(fm), JSON.stringify(fm));
    await ctx.close();
  }

  // 3-2) 통화(2026-10-08 최종 정책): 뉴질랜드로 판별된 방문자만 NZD, 그 밖의 모든 나라와 판별 실패는 USD, 같은 숫자.
  //      프록시가 알려 주는 접속 주소(X-Forwarded-For)로 흉내. 운영에서는 ?cur·꾸민 국가 헤더로 바꿀 수 없음
  {
    const cases = [
      { name: '로컬(나라를 알 수 없음) → USD', headers: {}, url: '/', cur: 'USD', source: 'none' },
      { name: '뉴질랜드 IP(Spark) → NZD', headers: { 'X-Forwarded-For': '122.56.1.1' }, url: '/', cur: 'NZD', source: 'ip' },
      { name: '미국 IP 8.8.8.8 → USD', headers: { 'X-Forwarded-For': '8.8.8.8' }, url: '/', cur: 'USD', source: 'ip' },
      { name: '한국 IP(KT 168.126.63.1) → USD', headers: { 'X-Forwarded-For': '168.126.63.1' }, url: '/', cur: 'USD', source: 'ip' },
      { name: '호주 IP(Telstra 139.130.4.5) → USD', headers: { 'X-Forwarded-For': '139.130.4.5' }, url: '/', cur: 'USD', source: 'ip' },
      { name: '미국 IPv6 → USD', headers: { 'X-Forwarded-For': '2001:4860:4860::8888' }, url: '/', cur: 'USD', source: 'ip' },
      { name: '운영에서는 ?cur=nzd로 바꿀 수 없음(미국 IP) → USD', headers: { 'X-Forwarded-For': '8.8.8.8' }, url: '/?cur=nzd', cur: 'USD', source: 'ip' },
      { name: '설정하지 않은 국가 헤더(cf-ipcountry: NZ)는 믿지 않음(미국 IP) → USD', headers: { 'X-Forwarded-For': '8.8.8.8', 'cf-ipcountry': 'NZ' }, url: '/', cur: 'USD', source: 'ip' },
    ];
    for (const c of cases) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, extraHTTPHeaders: c.headers });
      const p = await ctx.newPage();
      const res = await p.goto(`${BASE}${c.url}`, { waitUntil: 'networkidle' });
      const st = await p.evaluate(() => ({
        nzd: document.documentElement.classList.contains('nzd'),
        prices: [...document.querySelectorAll('.plan .price')].map((e) => e.innerText).join(' | '),
        video: [...document.querySelectorAll('.vplan .price, .vmonthly .price')].map((e) => e.innerText).join(' | '),
        addon: [...document.querySelectorAll('.addon-table td [data-c]')].find((x) => getComputedStyle(x).display !== 'none')?.textContent || '',
        chip: document.querySelector('.pricing .currency').innerText,
        note1: document.querySelector('.pnotes li').innerText,
        calcSetup: document.querySelector('[data-o="setup"]').textContent,
        visible: document.querySelector('#pricing').innerText + document.querySelector('#video-pricing').innerText + document.querySelector('#fee').innerText,
        gst: /GST/.test(document.body.innerText),
      }));
      const api = await (await ctx.request.get(`${BASE}/api/currency`, { headers: c.headers })).json();
      const C = c.cur, S = C === 'NZD' ? 'NZD\u00A0$' : 'USD\u00A0$', O = C === 'NZD' ? ['USD\u00A0$', 'USD'] : ['NZD\u00A0$', 'NZD'];
      const ok = st.nzd === (C === 'NZD') && st.prices === `${S}1,990 | ${S}4,490부터 | 맞춤 견적`
        && st.video === `${S}490 | ${S}890 | ${S}1,490부터 | ${S}2,490/월` && st.addon === S && st.chip === `${C} 기준`
        && st.note1.includes(`(${C})`) && st.note1.includes('사업장 소재 국가') && st.calcSetup === `${S}1,990`
        && O.every((o) => !st.visible.includes(o)) && !st.gst && api.currency === C && api.source === c.source && !JSON.stringify(api).match(/\d+\.\d+\.\d+/);
      check(`통화: ${c.name}`, ok, `${st.prices} · ${st.video} · ${st.chip} · api ${JSON.stringify(api)}`);
      if (c.cur === 'NZD') check('통화: 첫 화면은 공용 캐시에 저장 안 함(방문자마다 다름)', /private/.test(res.headers()['cache-control'] || ''), res.headers()['cache-control']);
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
    // 기본값(2026-10-09 사용자): 타사 초기 제작비 500 · 월 관리비(유지보수 포함) 150 · 5년 → 타사 USD\u00A0$9,500 · PAUSE USD\u00A0$1,990 · 아끼는 금액 USD\u00A0$7,510
    const d0 = await p.evaluate(() => ({ setup: document.querySelector('[data-c="setup"]').value, monthly: document.querySelector('[data-c="monthly"]').value, other: document.querySelector('[data-o="other"]').textContent, save: document.querySelector('[data-o="save"]').textContent, saveHidden: document.querySelector('[data-save]').hidden, label: [...document.querySelectorAll('.calc-side.other label')][1].childNodes[0].textContent.replace(/\u00a0/g, ' ').trim(), years: getComputedStyle(document.querySelector('[data-o="years"]')).fontSize }));
    check('계산기: 기본값 타사 500 · 월 관리비(유지보수 포함) 150 · 5년 → USD\u00A0$9,500 vs USD\u00A0$1,990, 아끼는 금액 USD\u00A0$7,510 · 기간 글씨 큼', d0.setup === '500' && d0.monthly === '150' && d0.other === 'USD\u00A0$9,500' && d0.save === 'USD\u00A0$7,510' && !d0.saveHidden && d0.label === '월 관리비(유지보수 포함)' && parseFloat(d0.years) >= 24, JSON.stringify(d0));
    await p.fill('[data-c="setup"]', '3000');
    await p.fill('[data-c="monthly"]', '150');
    await p.fill('[data-c="years"]', '5');
    await p.dispatchEvent('[data-c="years"]', 'input');
    await p.waitForTimeout(150);
    const mid = await p.textContent('[data-o="other"]');
    await p.waitForTimeout(1200);
    const out = await p.textContent('[data-o="other"]');
    const setupVal = await p.inputValue('[data-c="setup"]');
    check('계산기: USD\u00A0$3,000 + USD\u00A0$150×12×5 = USD\u00A0$12,000(숫자가 세면서 바뀜)', out === 'USD\u00A0$12,000' && setupVal === '3,000' && mid !== 'USD\u00A0$12,000', `${mid} → ${out}, ${setupVal}`);
    const pauseOut = await p.textContent('[data-o="pause"]');
    check('계산기: PAUSE 쪽 기본 선택 = STARTER USD\u00A0$1,990', pauseOut === 'USD\u00A0$1,990' && await p.isChecked('input[name="calcPlan"][value="1990"]'), pauseOut);
    const sv = await p.evaluate(() => ({ hidden: document.querySelector('[data-save]').hidden, save: document.querySelector('[data-o="save"]').textContent, w: document.querySelector('[data-bar="pause"]').style.getPropertyValue('--w'), live: document.querySelector('[data-calc-live]').textContent, logo: !!document.querySelector('.calc-side.pause legend img[alt="PAUSE Studio"]'), label: document.querySelector('.calc-side.other .side-tag').textContent, vs: !!document.querySelector('.calc-vs .vs') }));
    check('계산기: 아끼는 금액 USD\u00A0$10,010 · 막대 비율 · 화면 읽기용 결과 · 로고 · 타사 견적 VS PAUSE Studio', !sv.hidden && sv.save === 'USD\u00A0$10,010' && Math.abs(Number(sv.w) - 1990 / 12000) < 0.001 && sv.live.includes('USD\u00A0$12,000') && sv.logo && sv.label === '타사 견적' && sv.vs, JSON.stringify(sv));
    await p.check('input[name="calcPlan"][value="4490"]', { force: true });
    await p.waitForTimeout(1200);
    const st2 = await p.evaluate(() => ({ setup: document.querySelector('[data-o="setup"]').textContent, pause: document.querySelector('[data-o="pause"]').textContent, save: document.querySelector('[data-o="save"]').textContent }));
    check('계산기: 플랜을 BUSINESS로 고르면 USD\u00A0$4,490부터 · 총비용 USD\u00A0$4,490 · 아끼는 금액 USD\u00A0$7,510', st2.setup === 'USD\u00A0$4,490부터' && st2.pause === 'USD\u00A0$4,490' && st2.save === 'USD\u00A0$7,510', JSON.stringify(st2));
    await ctx.close();
  }

  // 7) 동작 줄이기: 인트로 없이 바로, 자동 재생 없음(멈춤 버튼은 2026-10-09부터 없음)
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 }, { reduced: true });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(300);
    const st = await p.evaluate(() => ({
      done: document.documentElement.classList.contains('intro-done'),
      toggle: !document.querySelector('[data-wall-toggle], [data-motion-toggle]'),
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

  // 8) 움직임 멈추기 버튼 없음(2026-10-09 사용자) — 예전에 멈춤을 눌러 기억된 브라우저에서도 벽은 흐른다
  {
    const { ctx, p } = await page(browser, { width: 1440, height: 900 });
    await fakeVideos(p);
    await p.addInitScript(() => { try { localStorage.setItem('ps-motion', 'paused'); } catch { /* 저장 불가 */ } });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    const a = await p.evaluate(() => document.querySelector('.track').style.transform);
    await p.waitForTimeout(700);
    const b = await p.evaluate(() => document.querySelector('.track').style.transform);
    const st = await p.evaluate(() => ({
      buttons: document.querySelectorAll('[data-wall-toggle], [data-motion-toggle], .wall-toggle, .motion-toggle').length,
      text: /움직임 멈추기|움직임 재생/.test(document.body.innerText),
      still: document.documentElement.classList.contains('still'),
    }));
    check('움직임 멈추기 버튼 없음 · 예전에 멈춤을 기억해 둔 브라우저에서도 작업물 벽이 흐름', st.buttons === 0 && !st.text && !st.still && a !== b, JSON.stringify({ ...st, a, b }));
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
      zero: document.querySelector('.ledger-zero .ld-fig').textContent,
      mf: getComputedStyle(document.querySelector('.mf-ghost')).visibility === 'visible' && document.querySelector('.mf-ghost').textContent === '사장님보다 더사장님 같은 마음으로' && [...document.querySelectorAll('.mf-stmt, .mf-sign')].every((e) => getComputedStyle(e).opacity === '1'),
    }));
    check('JS 없이도 제목·내용 표시(질문 27개 · 광고 샘플 4개 모두 보임 · 관리비 $0 · 마무리 선언)', st.h1.includes('선택받는 브랜드는') && st.op === '1' && st.faq === 27 && st.film === 4 && st.zero === '$0' && st.mf, JSON.stringify(st));
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
      // 칸(.wk-media)이 화면 비율 그대로 = 여백 틀 없이 꽉 차고 잘리지도 않음. 한 줄의 칸 높이는 같음(줄 폭을 꽉 채움)
      const cells = [...document.querySelectorAll('.wk-media')].map((m) => {
        const img = m.querySelector('img');
        const r = m.getBoundingClientRect();
        const ar = Number(img.getAttribute('width')) / Number(img.getAttribute('height')); // 지연 로딩 전에도 원래 크기
        const want = Math.max(ar, 1.25); // 아주 긴 세로 화면만 칸이 조금 넓고 사진은 칸 안에 그대로
        return { top: Math.round(r.top), h: r.height, w: r.width, ratio: Math.abs(r.width / r.height - want) / want, fill: getComputedStyle(img).objectFit };
      });
      const rows = {};
      cells.forEach((c) => { (rows[c.top] = rows[c.top] || []).push(c.h); });
      const rowSpread = Math.max(...Object.values(rows).map((hs) => Math.max(...hs) - Math.min(...hs)));
      const minW = Math.min(...cells.map((c) => c.w));
      return { total: vids.length, inView: inView.length, playing: inView.filter((v) => !v.paused && v.classList.contains('on')).length, loop: vids.every((v) => v.loop), worstRatio: Math.max(...cells.map((x) => x.ratio)), n: cells.length, rowSpread, minW: Math.round(minW), rows: Object.keys(rows).length, contain: cells.every((c) => c.fill === 'contain') };
    });
    check('포트폴리오: 보이는 영상이 마우스 없이 반복 재생', st.inView > 0 && st.playing === st.inView && st.loop && st.total === 7, JSON.stringify(st));
    check('포트폴리오: 17개 화면이 여백 틀 없이 원래 비율 그대로(잘림 없음), 줄마다 높이가 같게 꽉 채움', st.n === 17 && st.worstRatio < 0.02 && st.rowSpread <= 1.5 && st.contain, `칸 ${st.n} · 비율 오차 ${(st.worstRatio * 100).toFixed(2)}% · 줄 ${st.rows} · 줄 안 높이 차 ${st.rowSpread.toFixed(1)}px · 가장 좁은 칸 ${st.minW}px`);
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
    // 탭을 눌러 고른 뒤에도 그 영상이 끝나면 다음 샘플로(2026-10-09 사용자: 누르면 그 영상만 무한 반복되던 것)
    await p.click('.fs-tab >> nth=1');
    const afterClick = await p.waitForFunction(() => document.querySelectorAll('.fs-tab')[2].getAttribute('aria-selected') === 'true', null, { timeout: 9000 }).then(() => true).catch(() => false);
    const loopOff = await p.evaluate(() => [...document.querySelectorAll('[data-fs-video]')].every((v) => !v.loop));
    check('광고 샘플: 4개 · 보이면 첫 샘플 재생(진행 선)', a.n === 4 && a.playing[0] && !a.playing.slice(1).some(Boolean) && Number(a.prog) > 0, JSON.stringify(a));
    check('광고 샘플: 탭 누르면 그 샘플만 보이고 재생', b.sel === 2 && b.vis.join() === 'false,false,true,false' && b.playing[2] && !b.playing[0], JSON.stringify(b));
    check('광고 샘플: 방향키로 다음 탭(초점 이동)', c.sel === 3 && c.focus === 'fs-tab-daon', JSON.stringify(c));
    check('광고 샘플: 탭을 누른 뒤에도 영상이 끝나면 다음 샘플로(한 편만 반복하지 않음)', afterClick && loopOff, `다음으로 ${afterClick} · 반복 꺼짐 ${loopOff}`);
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

  // 16) 큰 $0 '허리띠' 움직임: 예시 월 관리비 $100에서 세어 내려가며 홀쭉해지고 $0에서 멈춤(달마다 $0이 채워짐). 동작 줄이기면 바로 $0
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3800);
    const before = await p.evaluate(() => ({ armed: document.querySelector('[data-ledger]').classList.contains('armed'), num: document.querySelector('[data-ledger-num]').textContent, wd: document.querySelector('.ledger-zero').style.getPropertyValue('--wd') }));
    await p.evaluate(() => document.querySelector('[data-ledger]').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(2300);
    const mid = await p.evaluate(() => ({ num: Number(document.querySelector('[data-ledger-num]').textContent), on: document.querySelectorAll('.ledger-months li.on').length, wd: Number(document.querySelector('.ledger-zero').style.getPropertyValue('--wd')), from: document.querySelector('.ledger-cap .from').textContent, fromOp: getComputedStyle(document.querySelector('.ledger-cap .from')).opacity }));
    await p.waitForTimeout(2600);
    // 0에 닿으면 '타사 관리비'에 줄이 그어지고 사라진 뒤 'PAUSE Studio라면'이 올라옴
    await p.waitForFunction(() => getComputedStyle(document.querySelector('.ledger-cap .to')).opacity === '1' && getComputedStyle(document.querySelector('.ledger-cap .from')).opacity === '0', null, { timeout: 4000 }).catch(() => {});
    const end = await p.evaluate(() => ({ num: document.querySelector('[data-ledger-num]').textContent, done: document.querySelector('[data-ledger]').classList.contains('done'), on: document.querySelectorAll('.ledger-months li.on').length, wd: document.querySelector('.ledger-zero').style.getPropertyValue('--wd'), cap: getComputedStyle(document.querySelector('.ledger-cap .to')).opacity, capFrom: getComputedStyle(document.querySelector('.ledger-cap .from')).opacity }));
    check('관리비 $0: "타사 관리비" $100에서 시작(두꺼움) → 세어 내려가며 홀쭉해짐 → $0(12달 모두 $0), 글이 "PAUSE Studio라면"으로 바뀜', before.armed && before.num === '100' && Number(before.wd) > 100 && mid.num > 0 && mid.num < 100 && mid.wd < Number(before.wd) && mid.from === '타사 관리비' && mid.fromOp === '1' && end.num === '0' && end.done && end.on === 12 && Number(end.wd) === 70 && end.cap === '1' && end.capFrom === '0', JSON.stringify({ before, mid, end }));
    check('관리비 $0 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
    const r = await page(browser, { width: 1440, height: 900 }, { reduced: true });
    await r.p.goto(BASE, { waitUntil: 'networkidle' });
    const red = await r.p.evaluate(() => ({ armed: document.querySelector('[data-ledger]').classList.contains('armed'), num: document.querySelector('[data-ledger-num]').textContent }));
    check('관리비 $0: 동작 줄이기면 움직임 없이 바로 $0', !red.armed && red.num === '0', JSON.stringify(red));
    await r.ctx.close();
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

  // 17) 2026-10-09 사용자 피드백: 세로로 긴 창의 히어로 벽, 장 제목이 잘리지 않음, 비교 손잡이 안내, 계산기 입력칸, 마무리 선언
  {
    // 세로로 긴 PC 창(미리보기 창 1157×1717): 작업물 벽이 화면 안에 보이고 히어로는 폭의 3/4 높이까지
    const t1 = await page(browser, { width: 1157, height: 1717 });
    await t1.p.goto(BASE, { waitUntil: 'networkidle' });
    await t1.p.waitForTimeout(3800);
    const hw = await t1.p.evaluate(() => {
      const hero = document.querySelector('.hero').getBoundingClientRect();
      const vis = [...document.querySelectorAll('.hero .card .scr')].filter((c) => { const r = c.getBoundingClientRect(); return r.right > innerWidth * 0.5 && r.left < innerWidth - 40 && r.bottom > 0 && r.top < hero.bottom; }).length;
      return { h: Math.round(hero.height), cap: Math.round(innerWidth * 0.75), vis };
    });
    check('히어로(세로로 긴 창 1157×1717): 작업물 벽이 화면 안에 보임, 높이는 폭의 3/4까지', hw.h <= hw.cap + 1 && hw.vis >= 4, JSON.stringify(hw));
    await t1.ctx.close();

    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await fakeVideos(p);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(3600);
    // 장 제목 큰 영문: 스크롤 내내 왼쪽 끝이 잘리지 않음
    const cut = [];
    for (const sel of ['#website', '#video']) {
      for (const k of [-0.6, 0, 0.5, 1]) {
        await p.evaluate(([s, kk]) => { const el = document.querySelector(s); scrollTo({ top: el.getBoundingClientRect().top + scrollY + kk * innerHeight, behavior: 'instant' }); }, [sel, k]);
        await p.waitForTimeout(120);
        cut.push(await p.evaluate((s) => { const w = document.querySelector(`${s} .ch-word`), m = w.querySelector('.ch-move'); return Math.round(m.getBoundingClientRect().left - w.getBoundingClientRect().left); }, sel));
      }
    }
    check('장 제목(WEBSITE · AI VIDEO AD): 스크롤해도 왼쪽으로 밀려 잘리지 않음', cut.every((d) => d >= -2), cut.join(','));
    // 비교 손잡이: 화면에 들어오면 스스로 좌우로 움직이고, 보이는 동안 주기적으로 다시
    await p.evaluate(() => document.querySelector('[data-cmp]').scrollIntoView({ block: 'center', behavior: 'instant' }));
    const watch = (ms) => p.evaluate((dur) => new Promise((res) => { const r = document.querySelector('[data-cmp] .cmp-range'); const vals = []; const t0 = performance.now(); (function f() { vals.push(Number(r.value)); if (performance.now() - t0 < dur) requestAnimationFrame(f); else res({ min: Math.min(...vals), max: Math.max(...vals), last: vals[vals.length - 1] }); })(); }), ms);
    const h1 = await watch(3000);
    const h2 = await watch(7600);
    check('비교 손잡이: 화면에 들어오면 좌우로 움직여 끌 수 있음을 알리고, 7초마다 다시(제자리로 돌아옴)', h1.min < 40 && h1.max > 58 && h2.min < 40 && h2.max > 58 && Math.abs(h2.last - 50) <= 1, JSON.stringify({ h1, h2 }));
    // 계산기 입력칸: 상자·연필·'금액 입력' 안내·깜빡이는 입력 표시, 처음 보이면 빛남
    await p.evaluate(() => document.querySelector('[data-calc]').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(900);
    const ci = await p.evaluate(() => {
      const box = document.querySelector('[data-c="setup"]').closest('.money');
      const cs = getComputedStyle(box);
      const input = box.querySelector('input'), caret = box.querySelector('.caret');
      // 입력 표시가 숫자(500) 바로 뒤에 있는지: 글자 끝 위치 ≈ 표시 위치
      const probe = document.createElement('span'); probe.textContent = input.value; probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre;font-variant-numeric:tabular-nums'; box.append(probe);
      const textEnd = input.getBoundingClientRect().left + probe.getBoundingClientRect().width; probe.remove();
      return { val: input.value, ph: input.placeholder, border: cs.borderTopStyle !== 'none' && parseFloat(cs.borderTopWidth) >= 1, pen: !!box.querySelector('.pen'), caret: getComputedStyle(caret).display, anim: getComputedStyle(caret).animationName, gap: Math.round(caret.getBoundingClientRect().left - textEnd), nudge: box.classList.contains('nudge'), hint: document.querySelector('.side-hint')?.textContent };
    });
    check('계산기: 타사 견적 칸이 입력칸으로 보임(테두리 상자·연필·기본값 500 뒤에서 깜빡이는 입력 표시·처음 보이면 빛남)', ci.val === '500' && ci.ph === '금액 입력' && ci.border && ci.pen && ci.caret === 'block' && ci.anim === 'caretBlink' && ci.gap >= 0 && ci.gap <= 8 && ci.nudge && ci.hint === '직접 입력', JSON.stringify(ci));
    // 마무리 선언(2026-10-09 다시): 편지체(PS Letter)로 대표가 직접 치듯 타이핑 → 다짐 문장 → 대표 서명. 빛 번짐·밑줄 없음, 써지는 동안 아래가 밀리지 않음
    await p.evaluate(() => document.querySelector('.mf-big').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(1500);
    const mfState = () => p.evaluate(() => ({ go: document.querySelector('.manifesto').classList.contains('go'), typed: document.querySelector('.manifesto').classList.contains('typed'), text: [...document.querySelectorAll('.mf-type .ln')].map((l) => l.textContent).join('|'), h: Math.round(document.querySelector('.mf-big').getBoundingClientRect().height), stmt: getComputedStyle(document.querySelector('.mf-stmt')).opacity, sig: document.querySelector('.mf-sign .sig').classList.contains('go'), font: getComputedStyle(document.querySelector('.mf-big')).fontFamily, loaded: document.fonts.check("40px 'PS Letter'", '사장님'), extras: !!document.querySelector('.mf-ink, .mf-big .ch') }));
    const m0 = await mfState();
    await p.waitForTimeout(6800);
    const m1 = await mfState();
    check('마무리 선언: 편지체로 한글 자판처럼 직접 치고(중간엔 일부만), 다 쓰면 다짐 문장·대표 서명. 밑줄·빛 번짐 없음, 아래가 밀리지 않음', m0.go && !m0.typed && m0.text.length > 0 && m0.text.length < 20 && m1.typed && m1.text === '사장님보다 더|사장님 같은 마음으로' && m1.stmt === '1' && m1.sig && m0.h === m1.h && m1.font.includes('PS Letter') && m1.loaded && !m1.extras, JSON.stringify({ m0, m1 }));
    check('피드백 반영 화면 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 18) 2026-10-09 사용자(세 번째): 커스텀 케이크(Ref.02) 화면 녹화 반복 영상, 합계 가운데, 포인트 효과(선·잉크), 'Ordinary' 글꼴
  {
    const { ctx, p, errors } = await page(browser, { width: 1440, height: 900 });
    await fakeVideos(p);
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const r2 = await p.evaluate(() => {
      const card = document.querySelector('[data-work="1"]');
      const im = card.querySelector('img');
      return { w: Number(im.getAttribute('width')), h: Number(im.getAttribute('height')), vid: card.querySelector('video')?.dataset.src || '', wall: !!document.querySelector('[data-wall-video][data-src="/media/work/ref02.mp4"]'), cmp: !!document.querySelector('.cmp-after video[data-src="/media/work/ref02.mp4"]') };
    });
    const v2 = await ctx.request.head(`${BASE}/media/work/ref02.mp4`);
    check('Ref.02 커스텀 케이크: 새 화면 녹화의 반복 영상 · 포트폴리오·히어로 벽·비교 AFTER가 같은 영상 · 녹화 비율(1596×810) 그대로', r2.w === 1596 && r2.h === 810 && r2.vid === '/media/work/ref02.mp4' && r2.wall && r2.cmp && v2.ok() && Number(v2.headers()['content-length']) > 500000, JSON.stringify(r2));
    // 합계는 가운데(1년 합계 $0 · 아끼는 금액)
    await p.evaluate(() => document.querySelector('#fee').scrollIntoView({ behavior: 'instant' }));
    await p.waitForTimeout(400);
    const al = await p.evaluate(() => {
      const mid = (el) => { const r = el.getBoundingClientRect(); return r.left + r.width / 2; };
      const tot = document.querySelector('.ledger-total'), sv = document.querySelector('.calc-save');
      const kids = (el) => [...el.children].filter((c) => getComputedStyle(c).display !== 'none');
      const span = (el) => { const k = kids(el).map((c) => c.getBoundingClientRect()); return (Math.min(...k.map((r) => r.left)) + Math.max(...k.map((r) => r.right))) / 2; };
      return { tot: Math.round(span(tot) - mid(tot)), save: Math.round(span(sv) - mid(sv)), jc: getComputedStyle(tot).justifyContent + '|' + getComputedStyle(sv).justifyContent };
    });
    check('합계 가운데 정렬: \'1년 합계 $0\' · \'PAUSE Studio로 아끼는 금액\'(글과 숫자 묶음이 칸 가운데)', Math.abs(al.tot) <= 2 && Math.abs(al.save) <= 2 && al.jc === 'center|center', JSON.stringify(al));
    // 장 소개의 핵심 약속: 굵게 + 보이면 밝아짐
    await p.evaluate(() => document.querySelector('#website .ch-lead').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(2800);
    const em = await p.evaluate(() => [...document.querySelectorAll('.ch-lead .ink')].map((e) => ({ t: e.textContent.replace(/ /g, ' '), fw: getComputedStyle(e).fontFamily, pos: getComputedStyle(e).backgroundPositionX, clip: getComputedStyle(e).webkitBackgroundClip || getComputedStyle(e).backgroundClip })));
    check('장 소개 강조: \'관리비/유지보수 비용 제로\'(웹사이트) · \'가지고 계신 사진만으로\'(영상) 굵게, 보이면 왼쪽부터 밝아짐', em.length === 2 && em[0].t === '관리비/⁠유지보수 비용 제로' && em[1].t === '가지고 계신 사진만으로' && em[0].fw.includes('PS Text') && parseFloat(em[0].pos) === 0 && em[0].clip === 'text', JSON.stringify(em));
    // 제작 과정(비전에서 현실로): '현실로'에 잉크, 다섯 단계를 잇는 선, 끝에 '기본 월 관리비 $0'이 채워짐
    await p.evaluate(() => document.querySelector('#process').scrollIntoView({ behavior: 'instant' }));
    await p.waitForTimeout(400);
    const pr = () => p.evaluate(() => ({
      ink: getComputedStyle(document.querySelector('#process-title .ink')).backgroundPositionX,
      inkText: document.querySelector('#process-title .ink').textContent,
      lines: [...document.querySelectorAll('.steps li')].map((li) => new DOMMatrix(getComputedStyle(li, '::before').transform).a.toFixed(2)),
      chip: getComputedStyle(document.querySelector('.steps li:last-child .hl')).backgroundColor,
    }));
    const pa = await pr();
    await p.waitForTimeout(3600);
    const pb = await pr();
    check('제작 과정: \'현실로\'에 잉크가 차오르고, 단계를 잇는 선이 01→05 차례로 그어진 뒤 \'기본 월 관리비 $0\'이 채워짐', pa.lines[4] === '0.00' && pa.chip !== pb.chip && pb.inkText === '현실로' && parseFloat(pb.ink) === 0 && pb.lines.every((x) => x === '1.00') && pb.chip === 'rgb(20, 19, 17)', JSON.stringify({ pa, pb }));
    // AI 광고영상 제작 과정: 단계 위 선이 그어짐, 샘플 제목 '광고가 됩니다.'에 잉크
    await p.evaluate(() => document.querySelector('.vsteps').scrollIntoView({ block: 'center', behavior: 'instant' }));
    await p.waitForTimeout(2600);
    const vs = await p.evaluate(() => ({ lines: [...document.querySelectorAll('.vsteps li')].map((li) => new DOMMatrix(getComputedStyle(li, '::before').transform).a.toFixed(2)), film: document.querySelector('#film-title .ink')?.textContent }));
    check('AI 광고영상: 제작 과정 단계 위 선이 그어짐 · 샘플 제목 \'광고가 됩니다.\'에 잉크', vs.lines.length === 6 && vs.lines.every((x) => x === '1.00') && vs.film === '광고가 됩니다.', JSON.stringify(vs));
    // 비교 제목: Ordinary는 흔한 템플릿 글꼴, Artisanal은 PAUSE 제목 글꼴
    const ord = await p.evaluate(() => ({ ord: getComputedStyle(document.querySelector('.cmp-title .ord')).fontFamily, title: getComputedStyle(document.querySelector('.cmp-title')).fontFamily, text: document.querySelector('.cmp-title').textContent, vsBox: getComputedStyle(document.querySelector('.cmp-title .cmp-vs')).borderRadius }));
    check('비교 제목: \'Ordinary\'는 흔한 템플릿 글꼴(Helvetica·Arial), \'Artisanal\'은 PAUSE 제목 글꼴', /Helvetica|Arial/.test(ord.ord) && ord.title.includes('PS Display') && ord.text === 'Ordinary vs. Artisanal' && ord.vsBox === '0px', JSON.stringify(ord));
    check('세 번째 피드백 화면 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }
  // 18-2) 동작 줄이기: 포인트 효과는 처음부터 끝난 모습
  {
    const { ctx, p } = await page(browser, { width: 1440, height: 900 }, { reduced: true });
    await p.goto(BASE, { waitUntil: 'networkidle' });
    const st = await p.evaluate(() => ({ ink: [...document.querySelectorAll('.ink')].map((e) => getComputedStyle(e).backgroundPositionX), line: new DOMMatrix(getComputedStyle(document.querySelector('.steps li:last-child'), '::before').transform).a, chip: getComputedStyle(document.querySelector('.steps li:last-child .hl')).backgroundColor }));
    check('동작 줄이기: 잉크·선·마지막 단계 채움이 처음부터 끝난 모습', st.ink.length === 4 && st.ink.every((x) => parseFloat(x) === 0) && st.line === 1 && st.chip === 'rgb(20, 19, 17)', JSON.stringify(st));
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter((r) => !r.ok);
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} 통과`);
  process.exit(failed.length ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
