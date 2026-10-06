// 새 로고 SVG → 투명 PNG(여러 폭) + 로고 키트 시트 캡처
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/logo_export.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const V = path.join(ROOT, 'content/assets/logo/new/vector');
const PNG = path.join(ROOT, 'content/assets/logo/new/png');
(async () => {
  fs.mkdirSync(PNG, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const jobs = [];
  for (const tone of ['ink', 'cream']) for (const w of [400, 800, 1600, 3200]) jobs.push([`pause-studio-logo-${tone}.svg`, w, `pause-studio-logo-${tone}_${w}w.png`]);
  for (const f of ['favicon-A-rings-ink', 'favicon-A-rings-dark', 'favicon-B-P-ink', 'favicon-B-P-dark']) for (const w of [32, 180, 512]) jobs.push([`${f}.svg`, w, `${f}_${w}.png`]);
  for (const [src, w, out] of jobs) {
    const svg = fs.readFileSync(path.join(V, src), 'utf8');
    const [, , vw, vh] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const h = Math.round((w * vh) / vw);
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await p.setContent(`<!doctype html><body style="margin:0;background:transparent">${svg.replace('<svg ', `<svg width="${w}" height="${h}" style="display:block" `)}</body>`);
    await p.screenshot({ path: path.join(PNG, out), omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
  }
  const p = await b.newPage({ viewport: { width: 2400, height: 1000 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(ROOT, 'drafts/logo/logo-kit.html'));
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  await p.screenshot({ path: path.join(ROOT, 'drafts/logo/PAUSE_logo_kit.png'), fullPage: true });
  await b.close();
  console.log(jobs.length, 'png + kit sheet');
})();
