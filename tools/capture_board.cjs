// drafts/board/*.html → PNG (전체 페이지)
const { chromium } = require('playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [f, out, w] of [['board.html', 'PAUSE_hero_drafts_board.png', 3520], ['logos.html', 'PAUSE_logo_sheet.png', 2400]]) {
    const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1 });
    await p.goto('file://' + path.join(ROOT, 'drafts/board', f));
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
    await p.screenshot({ path: path.join(ROOT, 'drafts/board', out), fullPage: true });
    console.log(out);
  }
  await b.close();
})();
