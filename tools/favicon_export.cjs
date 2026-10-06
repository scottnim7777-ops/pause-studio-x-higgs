// 파비콘 SVG → PNG 세트 + 원본과 같은 좌표의 검증 렌더 + 확인 시트
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/favicon_export.cjs  (이후 python3 tools/favicon_verify.py)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const FAV = path.join(ROOT, 'content/assets/logo/new/favicon');
const read = (f) => fs.readFileSync(path.join(FAV, f), 'utf8');
(async () => {
  fs.mkdirSync(path.join(FAV, 'png'), { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const shot = async (svg, w, h, out, vb) => {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    const s = vb ? svg.replace(/viewBox="[^"]+"/, `viewBox="${vb}"`) : svg;
    await p.setContent(`<!doctype html><body style="margin:0;background:transparent">${s.replace('<svg ', `<svg width="${w}" height="${h}" style="display:block" `)}</body>`);
    await p.screenshot({ path: out, omitBackground: true, clip: { x: 0, y: 0, width: w, height: h } });
    await p.close();
  };
  const jobs = [
    ['favicon.svg', [16, 32, 48, 64, 192, 512], 'favicon'],
    ['icon-fullbleed.svg', [180], 'apple-touch-icon'],
    ['icon-maskable.svg', [512], 'icon-maskable'],
  ];
  for (const [f, sizes, name] of jobs) for (const s of sizes) await shot(read(f), s, s, path.join(FAV, 'png', `${name}-${s}.png`));
  // 검증: 원본 webp와 같은 1254×1254 좌표로 렌더
  const m = JSON.parse(read('measure.json'));
  await shot(read('favicon.svg'), m.source_px[0], m.source_px[1], path.join(FAV, 'work/render.png'), `0 0 ${m.source_px[0]} ${m.source_px[1]}`);
  // 확인 시트
  const svg = read('favicon.svg');
  const orig = 'data:image/webp;base64,' + fs.readFileSync(path.join(FAV, 'original/pause-studio-favicon_user-original.webp')).toString('base64');
  const tab = (bg, fg, label) => `<div class="tab" style="background:${bg};color:${fg}"><img src="png/favicon-32.png" style="width:16px;height:16px"><span>${label}</span><i>×</i></div>`;
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><style>
@font-face{font-family:MaruBuri;src:url(../../../../../drafts/fonts/MaruBuri-Regular.woff2)}
@font-face{font-family:MaruBuri;src:url(../../../../../drafts/fonts/MaruBuri-Bold.woff2);font-weight:700}
*{margin:0;box-sizing:border-box} body{width:1800px;padding:70px;background:#E9E7E1;font-family:MaruBuri;color:#151515}
h1{font-size:44px} h2{font-size:26px;margin:44px 0 18px;border-bottom:2px solid #151515;padding-bottom:10px} p{font-size:19px;line-height:1.7;color:#444}
.cmp{display:flex;gap:30px} .cmp div{background:#fff;padding:20px;text-align:center;font-size:17px} .cmp img,.cmp svg{width:520px;height:520px;display:block}
.sizes{display:flex;align-items:flex-end;gap:40px;padding:30px;background:#fff} .sizes div{text-align:center;font-size:15px;color:#888}
.bar{display:flex;gap:2px;padding:10px 10px 0;border-radius:10px 10px 0 0} .tab{display:flex;align-items:center;gap:8px;width:240px;height:36px;padding:0 12px;border-radius:8px 8px 0 0;font:13px sans-serif}
.tab span{flex:1} .tab i{font-style:normal;opacity:.6} .home{display:flex;gap:40px;padding:30px;background:linear-gradient(135deg,#6d7f96,#3b4a5e)} .home div{text-align:center;color:#fff;font:14px sans-serif}
.home img{width:120px;height:120px;border-radius:27px;display:block;margin-bottom:8px}
</style></head><body><h1>Pause Studio 파비콘 — 벡터 변환 확인</h1>
<h2>원본 vs 벡터</h2><div class="cmp"><div><img src="${orig}">원본 webp</div><div>${svg.replace('<svg ', '<svg width="520" height="520" ')}벡터 SVG</div></div>
<h2>실제 크기</h2><div class="sizes">${[16, 32, 48, 64, 192].map((s) => `<div><img src="png/favicon-${s}.png" style="width:${s}px;height:${s}px"><br>${s}px</div>`).join('')}
<div><img src="png/favicon-32.png" style="width:16px;height:16px;image-rendering:auto"><br>16(2배 화면)</div></div>
<h2>브라우저 탭 · 휴대폰 홈 화면</h2>
<div class="bar" style="background:#DEE1E6">${tab('#fff', '#222', 'Pause Studio — 한인 대표님들을 위한 웹사이트')}${tab('#DEE1E6', '#555', '다른 탭')}</div>
<div class="bar" style="background:#202124;margin-top:16px">${tab('#35363A', '#eee', 'Pause Studio — 한인 대표님들을 위한 웹사이트')}${tab('#202124', '#999', '다른 탭')}</div>
<div class="home" style="margin-top:24px"><div><img src="png/apple-touch-icon-180.png">Pause Studio</div><div><img src="png/icon-maskable-512.png" style="border-radius:50%">안드로이드(원형 마스크)</div></div>
</body></html>`;
  fs.writeFileSync(path.join(FAV, 'favicon-check.html'), html);
  const p = await b.newPage({ viewport: { width: 1800, height: 1000 } });
  await p.goto('file://' + path.join(FAV, 'favicon-check.html'));
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
  await p.screenshot({ path: path.join(ROOT, 'drafts/logo/PAUSE_favicon_check.png'), fullPage: true });
  await b.close();
  console.log('ok');
})();
