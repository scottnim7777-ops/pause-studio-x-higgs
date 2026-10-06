// 벡터 로고를 원본 PNG와 같은 캔버스·좌표로 렌더링(투명 배경) → work/render-ink.png
// 차이 계산은 tools/logo_verify.py. 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/logo_verify.cjs
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const NEW = path.join(ROOT, 'content/assets/logo/new');
(async () => {
  const m = JSON.parse(fs.readFileSync(path.join(NEW, 'measure.json'), 'utf8'));
  const [W, H] = m.source_px;
  const [x, y, w, h] = m.viewBox;
  const svg = fs.readFileSync(path.join(NEW, 'vector/pause-studio-logo-ink.svg'), 'utf8');
  const inner = svg.replace(/^<svg[^>]*>/, `<svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${x} ${y} ${w} ${h}">`);
  const html = `<!doctype html><html><body style="margin:0;background:transparent"><svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" style="display:block">${inner}</svg></body></html>`;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await p.setContent(html);
  await p.screenshot({ path: path.join(NEW, 'work/render-ink.png'), omitBackground: true, clip: { x: 0, y: 0, width: W, height: H } });
  await b.close();
  console.log('rendered');
})();
