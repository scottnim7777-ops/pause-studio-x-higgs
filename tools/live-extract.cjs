// 라이브 사이트(pause8studio.com)의 렌더링 텍스트·링크·동작만 추출한다. 디자인 캡처 없음.
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/live-extract.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const t0 = Date.now();
const log = (m) => process.stderr.write(`[${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}\n`);

(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run'],
  });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'ko-KR' });
  const page = await ctx.newPage();
  page.setDefaultTimeout(5000);
  const media = new Set();
  page.on('request', (r) => { const u = r.url(); if (/imgur|\.(png|jpe?g|gif|mp4|webp|svg|woff2?)(\?|$)/i.test(u)) media.add(u); });

  await page.goto('https://pause8studio.com/', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  log('loaded');

  const scrollAll = async () => {
    for (let i = 0; i < 40; i++) { await page.evaluate(() => window.scrollBy(0, 800)); await page.waitForTimeout(90); }
    await page.waitForTimeout(600);
  };
  // 아코디언(FAQ 등)처럼 aria-expanded=false 인 버튼을 모두 연다 — DOM에서 직접 클릭
  const expandAll = () => page.evaluate(() => {
    let n = 0;
    document.querySelectorAll('#faq button, [aria-expanded="false"]').forEach((b) => { try { b.click(); n++; } catch (e) {} });
    return n;
  });
  const grab = () => page.evaluate(() => ({
    text: document.body.innerText,
    html_lang: document.documentElement.lang,
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].map((h) => `${h.tagName}: ${h.innerText.trim().replace(/\s+/g, ' ')}`),
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ text: a.innerText.trim().replace(/\s+/g, ' ').slice(0, 80), href: a.getAttribute('href') })),
    buttons: [...document.querySelectorAll('button')].map((b) => (b.innerText.trim() || b.getAttribute('aria-label') || b.title || '').replace(/\s+/g, ' ')).filter(Boolean),
    images: [...document.querySelectorAll('img')].map((i) => ({ alt: i.alt, src: i.currentSrc || i.src })),
    videos: [...document.querySelectorAll('video')].map((v) => v.currentSrc || v.src || v.querySelector('source')?.src).filter(Boolean),
    meta: [...document.querySelectorAll('title,meta[name],meta[property],link[rel="canonical"]')].map((m) => [m.tagName === 'TITLE' ? 'title' : m.getAttribute('name') || m.getAttribute('property') || m.rel, m.content || m.href || m.innerText]),
    jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
  }));

  const out = { url: page.url(), fetched_at: new Date().toISOString(), langs: {}, modals: {} };
  await scrollAll();
  log('expanded ' + (await expandAll()));
  await page.waitForTimeout(800);
  out.langs.ko = await grab();
  log('ko ' + out.langs.ko.text.length);

  // 문의 모달(정밀 상담신청) 텍스트
  const openedModal = await page.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find((x) => /정밀 상담신청|상담신청/.test(x.innerText));
    if (b) { b.click(); return b.innerText.trim(); } return null;
  });
  if (openedModal) {
    await page.waitForTimeout(1500);
    out.modals.application_step1 = await page.evaluate(() => document.body.innerText);
    log('modal opened: ' + openedModal);
    await page.keyboard.press('Escape').catch(() => {});
    await page.evaluate(() => { const c = [...document.querySelectorAll('button')].find((x) => /취소|닫기|Close/.test(x.innerText) || x.getAttribute('aria-label') === 'Close'); if (c) c.click(); });
    await page.waitForTimeout(800);
  }

  // 언어 전환: 헤더의 언어 선택 버튼 → 목록에서 언어 선택
  for (const [code, label] of [['en', 'English'], ['zh', '中文'], ['ja', '日本語']]) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(300);
    const ok = await page.evaluate((label) => {
      const header = document.querySelector('header') || document.body;
      const toggle = [...header.querySelectorAll('button')].find((b) => /한국어|English|中文|日本語/.test(b.innerText) || b.title === 'Select Language');
      if (!toggle) return 'no-toggle';
      toggle.click();
      return 'toggled';
    }, label);
    await page.waitForTimeout(400);
    const picked = await page.evaluate((label) => {
      const opt = [...document.querySelectorAll('button, [role="option"], li, a')].find((b) => b.innerText.trim() === label);
      if (!opt) return false; opt.click(); return true;
    }, label);
    await page.waitForTimeout(1200);
    await scrollAll();
    await expandAll();
    await page.waitForTimeout(600);
    out.langs[code] = await grab();
    log(`${code} toggle=${ok} picked=${picked} len=${out.langs[code].text.length}`);
  }

  out.media_requests = [...media].sort();
  fs.mkdirSync('content/live', { recursive: true });
  fs.writeFileSync('content/live/pause8studio-live.json', JSON.stringify(out, null, 1));
  for (const [k, v] of Object.entries(out.langs)) fs.writeFileSync(`content/live/innerText.${k}.txt`, v.text);
  if (out.modals.application_step1) fs.writeFileSync('content/live/modal.application.ko.txt', out.modals.application_step1);
  log(`media ${out.media_requests.length}`);
  await browser.close();
})().catch((e) => { process.stderr.write('ERR ' + e.stack + '\n'); process.exit(1); });
