// 레퍼런스 페이지를 열어 검토용 캡처(로컬, git 제외)와 텍스트·링크를 저장한다.
// 사용: NODE_PATH=/opt/node22/lib/node_modules node tools/ref-capture.cjs <slug> <url> [--full] [--wait ms] [--scroll n]
const { chromium } = require('playwright');
const fs = require('fs');
const [slug, url, ...rest] = process.argv.slice(2);
const full = rest.includes('--full');
const wait = Number(rest[rest.indexOf('--wait') + 1]) || 3500;
const scroll = rest.includes('--scroll') ? Number(rest[rest.indexOf('--scroll') + 1]) : 0;
(async () => {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--autoplay-policy=no-user-gesture-required'],
  });
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1,
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36',
  });
  const page = await ctx.newPage();
  page.setDefaultTimeout(15000);
  let status = null;
  try { const r = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }); status = r && r.status(); } catch (e) { status = 'ERR ' + e.message.split('\n')[0]; }
  await page.waitForTimeout(wait);
  for (let i = 0; i < scroll; i++) { await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9)); await page.waitForTimeout(700); }
  fs.mkdirSync('research/refs', { recursive: true });
  await page.screenshot({ path: `research/refs/${slug}.png`, fullPage: full }).catch(() => {});
  const info = await page.evaluate(() => ({
    title: document.title,
    text: document.body ? document.body.innerText.slice(0, 5000) : '',
    links: [...document.querySelectorAll('a[href]')].map((a) => ({ t: a.innerText.trim().replace(/\s+/g, ' ').slice(0, 90), h: a.href })).filter((l) => l.t).slice(0, 400),
    images: [...document.querySelectorAll('img')].map((i) => ({ alt: i.alt, src: i.currentSrc || i.src })).slice(0, 120),
    videos: [...document.querySelectorAll('video')].map((v) => v.currentSrc || v.querySelector('source')?.src).filter(Boolean).slice(0, 40),
  })).catch((e) => ({ error: String(e) }));
  fs.writeFileSync(`research/refs/${slug}.json`, JSON.stringify({ url, final_url: page.url(), status, captured_at: new Date().toISOString(), ...info }, null, 1));
  console.log(JSON.stringify({ slug, status, title: info.title, links: info.links?.length, images: info.images?.length, videos: info.videos?.length }));
  await browser.close();
})();
