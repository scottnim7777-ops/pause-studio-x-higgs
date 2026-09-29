// 숨겨진 원문(FAQ 답변, 법적 고지, 마케팅 분석 버튼, 모바일 메뉴, JSON-LD) 추출
const { chromium } = require('playwright');
const fs = require('fs');
const t0 = Date.now(); const log = (m) => process.stderr.write(`[${((Date.now()-t0)/1000).toFixed(1)}s] ${m}\n`);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run'] });
  const out = {};
  // 데스크톱
  let page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  page.setDefaultTimeout(5000);
  await page.goto('https://pause8studio.com/', { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(3000);
  out.jsonld = await page.evaluate(() => [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent));
  out.head_links = await page.evaluate(() => [...document.querySelectorAll('link[rel]')].map((l) => `${l.rel} ${l.href}`));
  for (let i = 0; i < 40; i++) { await page.evaluate(() => window.scrollBy(0, 800)); await page.waitForTimeout(60); }
  // FAQ: 질문을 하나씩 열고 답변 읽기
  out.faq = await page.evaluate(async () => {
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const faq = document.querySelector('#faq'); if (!faq) return 'no #faq';
    const qs = [...faq.querySelectorAll('button')]; const res = [];
    for (const q of qs) {
      const before = faq.innerText; q.click(); await sleep(700);
      res.push({ q: q.innerText.trim(), after: faq.innerText });
      q.click(); await sleep(500);
    }
    return res;
  });
  log('faq ' + (Array.isArray(out.faq) ? out.faq.length : out.faq));
  // 법적 고지 모달
  out.legal = await page.evaluate(async () => {
    const b = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === '법적 고지'); if (!b) return null;
    b.click(); await new Promise((r) => setTimeout(r, 800)); const t = document.body.innerText; return t.slice(t.indexOf('법적 고지'), t.indexOf('법적 고지') + 900);
  });
  log('legal ' + !!out.legal);
  await page.keyboard.press('Escape').catch(() => {});
  await page.evaluate(() => { const c = [...document.querySelectorAll('button')].find((x) => x.innerText.trim() === 'Close'); if (c) c.click(); });
  // 마케팅 분석 버튼: 클릭 후 URL·텍스트 변화
  const before = page.url();
  const mk = await page.evaluate(() => { const b = [...document.querySelectorAll('button,a')].find((x) => x.innerText.includes('마케팅 분석')); if (!b) return null; const info = { tag: b.tagName, href: b.getAttribute('href'), onclick: !!b.onclick }; b.click(); return info; });
  await page.waitForTimeout(2500);
  out.marketing = { button: mk, url_before: before, url_after: page.url(), text: (await page.evaluate(() => document.body.innerText)).slice(0, 6000) };
  log('marketing ' + JSON.stringify(mk) + ' -> ' + page.url());
  // 모바일 390: 메뉴 열기
  page = await (await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true })).newPage();
  page.setDefaultTimeout(5000);
  await page.goto('https://pause8studio.com/', { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(3000);
  out.mobile_hero = (await page.evaluate(() => document.body.innerText)).slice(0, 700);
  const opened = await page.evaluate(() => { const b = [...document.querySelectorAll('button')].find((x) => x.title === 'Menu' || x.getAttribute('aria-label') === 'Menu' || /menu/i.test(x.innerText)); if (!b) return false; b.click(); return true; });
  await page.waitForTimeout(1200);
  out.mobile_menu = opened ? await page.evaluate(() => document.body.innerText.slice(0, 1500)) : null;
  log('mobile menu ' + opened);
  fs.writeFileSync('content/live/hidden-content.json', JSON.stringify(out, null, 1));
  await browser.close();
})().catch((e) => { process.stderr.write('ERR ' + e.stack + '\n'); process.exit(1); });
