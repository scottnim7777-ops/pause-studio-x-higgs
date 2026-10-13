/**
 * 영어 페이지(/en) 점검: node tests/en.cjs [http://localhost:3000] [출력 폴더]
 * - 화면 글·대체 텍스트·aria·placeholder·title·#ui-text·JSON-LD에 한글이 없는지(언어 버튼 '한국어'와 브랜드 별칭만 예외)
 * - 줄표·하이픈·별표·참고표 없음(사용자 표기 규칙을 영어에도), 효과 요소 개수가 한국어 페이지와 같음
 * - 언어 버튼(두 페이지 오가기·섹션 유지), 상담 창 영어 흐름(가짜 응답), 통화 표시, 콘솔 오류
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
const check = (name, ok, info = '') => { results.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? ` — ${info}` : ''}`); };

(async () => {
  const browser = await chromium.launch({ executablePath: exe });
  const mk = async (url, vp = { width: 1440, height: 900 }, opts = {}) => {
    const ctx = await browser.newContext({ viewport: vp, ...opts });
    const p = await ctx.newPage();
    const errors = [];
    p.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    p.on('pageerror', (e) => errors.push(String(e)));
    await p.goto(url, { waitUntil: 'networkidle' });
    await p.waitForTimeout(1500);
    return { ctx, p, errors };
  };

  // 1) 한글·표기 규칙
  {
    const { ctx, p, errors } = await mk(`${BASE}/en`);
    const r = await p.evaluate(() => {
      const text = document.body.innerText;
      const attrs = [...document.querySelectorAll('[alt],[aria-label],[placeholder],[title]')].flatMap((e) => ['alt', 'aria-label', 'placeholder', 'title'].map((a) => e.getAttribute(a)).filter(Boolean));
      const hidden = [...document.querySelectorAll('.sr, [hidden], dialog *')].map((e) => e.textContent || '').join(' ');
      const all = text + ' ' + attrs.join(' ') + ' ' + hidden + ' ' + document.title + ' ' + (document.querySelector('meta[name=description]')?.content || '') + ' ' + (document.getElementById('ui-text')?.textContent || '');
      const bad = [...new Set(all.replace(/한국어/g, ' ').match(/\S{0,12}[가-힣ㄱ-ㅎㅏ-ㅣ]+\S{0,12}/g) || [])].filter((w) => w !== '한국어');
      const ld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent).join(' ');
      const allowed = ['퍼즈 스튜디오', '비즈니스 웹사이트(예약·주문·결제) 제작', 'AI 광고영상 제작', 'AI 업무 자동화', '웹사이트 제작'];
      const ldRest = allowed.reduce((t, a) => t.split(a).join(' '), ld);
      const ldBad = [...new Set(ldRest.match(/\S*[가-힣]+\S*/g) || [])];
      const dash = (text.match(/[—–※*]/g) || []).length + (text.match(/[A-Za-z]-[A-Za-z]/g) || []).length;
      return { bad: bad.slice(0, 8), ldBad, dash, lang: document.documentElement.lang, title: document.title };
    });
    check('영어 페이지: html lang="en"', r.lang === 'en', r.title);
    check('영어 페이지: 화면 글·대체 텍스트·aria·#ui-text에 한글 없음(언어 버튼 제외)', r.bad.length === 0, r.bad.join(' | '));
    check('영어 페이지: JSON-LD에는 브랜드 별칭·서비스 한글 이름 외 한글 없음', r.ldBad.length === 0, r.ldBad.join(' | '));
    check('영어 페이지: 줄표·하이픈·별표·참고표 없음', r.dash === 0, String(r.dash));
    check('영어 페이지: 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 2) 효과 요소 개수가 한국어와 같음
  {
    const count = async (url) => {
      const { ctx, p } = await mk(url);
      const r = await p.evaluate(() => Object.fromEntries(['.rv', '[data-mark]', '[data-sp]', '[data-ink]', '.gone', '.vf', '.gather i', '.burden i', '.free i', '.load', '.cd-c', '.shot', '.wy i', '.sig', '[data-ledger]', '[data-manifesto]', '[data-steps] > li', '.fs-tab', '.faq-tab', '.plan', '.vplan', '.wk', '.cmp-case', '.lang a.lg-opt'].map((s) => [s, document.querySelectorAll(s).length])));
      await ctx.close(); return r;
    };
    const ko = await count(`${BASE}/`), en = await count(`${BASE}/en`);
    const skip = ['.gather i', '.burden i', '.free i', '.cd-c', '.wy i', '.lang a.lg-opt'];
    const diff = Object.keys(ko).filter((k) => ko[k] !== en[k] && !skip.includes(k)).map((k) => `${k}: ko ${ko[k]} / en ${en[k]}`);
    check('효과·구성 요소 개수가 한국어 페이지와 같음', diff.length === 0, diff.join(' | '));
    check('글자 단위 효과가 영어에도 있음(관리비 눌림·해방·모임·WHY)', en['.gather i'] >= 6 && en['.burden i'] >= 10 && en['.free i'] >= 8 && en['.wy i'] === 10, JSON.stringify({ g: en['.gather i'], b: en['.burden i'], f: en['.free i'], w: en['.wy i'] }));
  }

  // 3) 언어 버튼
  {
    const { ctx, p } = await mk(`${BASE}/en#pricing`);
    await p.waitForTimeout(800);
    const a = await p.evaluate(() => ({ cur: document.querySelector('.lang-hd a[aria-current]')?.lang, other: document.querySelector('.lang-hd a:not([aria-current])')?.getAttribute('href'), label: document.querySelector('.lang-hd')?.getAttribute('aria-label') }));
    check('언어 버튼(영어 페이지): 지금 언어 표시 · 다른 언어는 한국어 페이지로, 보던 섹션 유지', a.cur === 'en' && /^\//.test(a.other) && a.other.includes('#pricing'), JSON.stringify(a));
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(900);
    await p.click('.lang-hd a[lang="ko"]');
    await p.waitForURL(/\/#pricing$|\/$/, { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(800);
    check('언어 버튼: 누르면 한국어 페이지로 이동', new URL(p.url()).pathname === '/' && (await p.evaluate(() => document.documentElement.lang)) === 'ko', p.url());
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(900);
    await p.click('.lang-hd a[lang="en"]');
    await p.waitForURL(/\/en/, { timeout: 5000 }).catch(() => {});
    await p.waitForTimeout(500);
    check('언어 버튼: 다시 영어 페이지로', new URL(p.url()).pathname === '/en' && (await p.evaluate(() => document.documentElement.lang)) === 'en', p.url());
    await ctx.close();
    const m = await mk(`${BASE}/en`, { width: 390, height: 844 }, { isMobile: true, hasTouch: true });
    const mv = await m.p.evaluate(() => ({ single: document.querySelectorAll('.lang-hd-m a').length, shown: getComputedStyle(document.querySelector('.lang-hd-m')).display }));
    await m.p.click('.hd-menu'); await m.p.waitForTimeout(700);
    const mn = await m.p.evaluate(() => ({ two: document.querySelectorAll('.lang-mnav a').length, vis: !!document.querySelector('.lang-mnav').getClientRects().length }));
    check('언어 버튼(휴대폰): 머리줄엔 다른 언어 한 칸, 메뉴엔 두 칸', mv.single === 1 && mv.shown !== 'none' && mn.two === 2 && mn.vis, JSON.stringify({ mv, mn }));
    await m.p.screenshot({ path: path.join(OUT, 'en-mobile-menu.png') });
    await m.ctx.close();
  }

  // 4) 상담 창(영어)
  {
    const { ctx, p, errors } = await mk(`${BASE}/en`);
    let posted = '';
    await p.route('**/api/contact', async (route) => { posted = route.request().postData() || ''; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }); });
    await p.waitForTimeout(3500);
    await p.click('.hero [data-consult]');
    await p.waitForSelector('#consult[open]');
    const t0 = await p.evaluate(() => ({ title: document.querySelector('#cs-title').textContent, types: [...document.querySelectorAll('.cs-type b')].map((b) => b.textContent), next: document.querySelector('[data-cs-next] .lb').textContent }));
    await p.click('[data-cs-next]');
    const typeErr = await p.textContent('[data-err="type"]');
    await p.check('input[name="consultType"][value="AI video ads"]', { force: true });
    await p.click('[data-cs-next]'); await p.click('[data-cs-next]');
    const nameErr = await p.evaluate(() => document.querySelector('input[name="name"]').closest('.fld').querySelector('.err').textContent);
    await p.fill('input[name="name"]', 'Test Person'); await p.fill('input[name="email"]', 'test@example.com');
    const code = await p.inputValue('select[name="phoneCode"]');
    await p.click('[data-cs-next]');
    await p.fill('textarea[name="message"]', 'Hello from the English page');
    await p.click('[data-cs-next]');
    const summary = await p.textContent('[data-summary]');
    await p.click('[data-cs-submit]');
    await p.waitForSelector('[data-step="done"]:not([hidden])', { timeout: 8000 }).catch(() => {});
    const done = await p.evaluate(() => ({ shown: !document.querySelector('[data-step="done"]').hidden, h: document.querySelector('[data-step="done"] h3').textContent }));
    check('상담 창(영어): 제목·종류·버튼이 영어', t0.title === 'Free consultation request' && t0.types.includes('AI video ads') && t0.next === 'Next', JSON.stringify(t0));
    check('상담 창(영어): 오류 문구가 영어', /choose a type/i.test(typeErr) && /name/i.test(nameErr), `${typeErr} | ${nameErr}`);
    check('상담 창(영어): 국가번호 처음 선택(미국 접속 +1 · 뉴질랜드 +64)', code === '+1' || code === '+64', code);
    check('상담 창(영어): 요약이 영어, 접수 완료 문구가 영어', /Type/.test(summary) && /AI video ads/.test(summary) && done.shown && /received/i.test(done.h), done.h);
    check('상담 창(영어): 보낸 내용에 lang=en · 영어 종류 · 말씀', posted.includes('name="lang"') && posted.includes('AI video ads') && posted.includes('Hello from the English page'));
    await p.screenshot({ path: path.join(OUT, 'en-consult-done.png') });
    check('상담 창(영어) 콘솔 오류 없음', errors.length === 0, errors.slice(0, 2).join(' | '));
    await ctx.close();
  }

  // 5) 통화·계산기(영어)
  {
    const { ctx, p } = await mk(`${BASE}/en`);
    const r = await p.evaluate(() => ({ chip: document.querySelector('.currency')?.innerText.trim(), price: document.querySelector('.plan .price')?.innerText.replace(/\s+/g, ' ').trim(), years: document.querySelector('[data-o="years"]')?.textContent }));
    check('통화(영어): 칩·가격이 영어로 · 계산기 기간이 years', /Prices\sin\s(USD|NZD)/.test(r.chip) && /(USD|NZD)/.test(r.price) && /years/.test(r.years), JSON.stringify(r));
    await p.evaluate(() => { const y = document.querySelector('input[data-c="years"]'); y.value = '1'; y.dispatchEvent(new Event('input', { bubbles: true })); });
    await p.waitForTimeout(400);
    const one = (await p.textContent('[data-o="years"]')).trim();
    check('계산기(영어): 1년이면 단수(1 year)', one === '1 year', one);
    await ctx.close();
  }

  await browser.close();
  const fail = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - fail}/${results.length} 통과`);
  process.exit(fail ? 1 : 0);
})();
