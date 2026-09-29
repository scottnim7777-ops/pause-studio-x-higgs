// drafts/typeset/hero-0N.html → drafts/composites/hero-0N_1920x1080.png
// 폰트(document.fonts.ready)와 모든 이미지·배경 로드가 끝난 뒤 캡처한다.
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/capture_heroes.cjs [번호...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : ['01', '02', '03', '04', '05'];
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  fs.mkdirSync(path.join(ROOT, 'drafts/composites'), { recursive: true });
  for (const id of ids) {
    const file = path.join(ROOT, `drafts/typeset/hero-${id}.html`);
    await page.goto('file://' + file, { waitUntil: 'load' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      const urls = new Set();
      for (const el of document.querySelectorAll('*')) {
        const bg = getComputedStyle(el).backgroundImage;
        for (const m of bg.matchAll(/url\("?([^")]+)"?\)/g)) urls.add(m[1]);
      }
      await Promise.all([...document.images].map((i) => i.decode().catch(() => {})));
      await Promise.all([...urls].map((u) => new Promise((r) => { const im = new Image(); im.onload = im.onerror = r; im.src = u; })));
    });
    const missing = await page.evaluate(() => [...document.fonts].filter((f) => f.status !== 'loaded' && f.status !== 'unloaded').map((f) => f.family));
    await page.waitForTimeout(300);
    const out = path.join(ROOT, `drafts/composites/hero-${id}_1920x1080.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    const used = await page.evaluate(() => [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family + ' ' + f.weight));
    console.log(JSON.stringify({ id, out: path.relative(ROOT, out), fonts_loaded: [...new Set(used)], problems: missing }));
  }
  await browser.close();
})();
