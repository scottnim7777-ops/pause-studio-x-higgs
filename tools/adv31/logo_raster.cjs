// 로고 SVG → 흰색(알파) PNG. node logo_raster.cjs <svg> <out.png> <width> [part: all|rings|word|dot]
const { chromium } = require('playwright');
const fs = require('fs');
const [SVG, OUT, W = '4000', PART = 'all'] = process.argv.slice(2);
(async () => {
  let s = fs.readFileSync(SVG, 'utf8').replace(/#FCEED8/gi, '#FFFFFF');
  const vb = s.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
  const w = Number(W), h = Math.round(w * vb[3] / vb[2]);
  s = s.replace(/<svg /, `<svg width="${w}" height="${h}" `);
  let css = '';
  if (PART === 'rings') css = 'path, circle { display:none }';
  if (PART === 'word') css = 'g, circle { display:none }';
  if (PART === 'dot') css = 'g, path { display:none }';
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent(`<html><body style="margin:0;background:transparent"><style>${css}</style>${s}</body></html>`);
  await (await p.$('svg')).screenshot({ path: OUT, omitBackground: true });
  await b.close();
  console.log(OUT, w, h);
})();
