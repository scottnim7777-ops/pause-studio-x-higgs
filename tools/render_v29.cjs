// 29차 히어로 시안 렌더: drafts/v29/hero/hero.html 을 산돌구름 공식 테스터 페이지 안에서 그린다(폰트 파일 추출·저장 없음).
// 산돌 테스터는 한 번에 100자까지만 미리보기 서체를 만들고, 새로 입력하면 같은 이름의 서체가 바뀐다.
// → 글자 묶음([data-g])을 100자 이하 패스로 나눠 각각 투명 배경으로 그리고, 배경 패스 위에 겹쳐 합성한다.
//   (hero.html 은 묶음끼리 위치가 서로 영향을 주지 않도록 절대 위치·고정 폭으로 짜여 있음)
// 실행: NODE_PATH=/opt/node22/lib/node_modules NODE_USE_ENV_PROXY=1 node tools/render_v29.cjs --v a --t 8 [--intro 1] [--name still-a]
//   30차 이후: --dir drafts/v30/hero --out drafts/v30/out [--mobile]  (모바일: 390×844 캔버스를 3배로 렌더 → 1170×2532)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const ROOT = path.resolve(__dirname, '..'), H = path.join(ROOT, arg('dir', 'drafts/v29/hero')), OUT = path.join(ROOT, arg('out', 'drafts/v29/out'));
const MOB = process.argv.includes('--mobile');
const CW = MOB ? 390 : 1920, CH = MOB ? 844 : 1080, Z = MOB ? 3 : 1;  // 캔버스 크기 · 확대 배율
const V = arg('v', 'a'), INTRO = +arg('intro', 1), NAME = arg('name', `still-${V}`);
const FPS = +arg('fps', 0), DUR = +arg('dur', 0);
const TS = FPS ? Array.from({ length: Math.round(FPS * DUR) }, (_, i) => +(i / FPS).toFixed(5)) : arg('t', '8').split(',').map(Number);
const W = CW * Z, HH = CH * Z;
const SRC = {
  greta: { url: 'https://www.sandollcloud.com/font/18013/SD-Greta-Sans', vars: { '--greta-th': '03 Th', '--greta-lt': '07 Lt', '--greta-rg': '09 Rg', '--greta-md': '11 Md' } },
  gd: { url: 'https://www.sandollcloud.com/font/15556.html', vars: { '--gd-ul': '02 Ul', '--gd-lt': '03 Lt', '--gd-rg': '04 Rg', '--gd-bd': '05 Bd' } },
};
const ROLE = { a: { H: 'greta', N: 'greta' }, b: { H: 'gd', N: 'gd' }, c: { H: 'local', N: 'local' } }[V];
const DIGITS = '0123456789$–+';
const b64 = (f) => fs.readFileSync(f).toString('base64');
const MIME = { jpg: 'image/jpeg', svg: 'image/svg+xml', webm: 'video/webm', png: 'image/png' };

const page0 = fs.readFileSync(path.join(H, 'hero.html'), 'utf8');
const css = page0.match(/<style id="hero-css">([\s\S]*?)<\/style>/)[1];
const js = page0.match(/<script id="hero-js">([\s\S]*?)<\/script>/)[1];
let body = page0.match(/<!--HERO-->([\s\S]*?)<!--\/HERO-->/)[1]
  .replace('data-v="a"', `data-v="${V}"`).replace('class="hero" id="hero"', MOB ? 'class="hero m" id="hero"' : 'class="hero" id="hero"')
  .replace(/data-g="H:/g, `data-g="${ROLE.H}:`).replace(/data-g="N:/g, `data-g="${ROLE.N}:`);
const cache = {};
body = body.replace(/(src|poster)="([^"]+\.(jpg|svg|webm|png))"/g, (_, a, f, ext) => {
  const p = path.resolve(H, f); cache[p] = cache[p] || `data:${MIME[ext]};base64,${b64(p)}`; return `${a}="${cache[p]}"`;
});
const LOCAL_FACES = `@font-face{font-family:'Grandiflora One';src:url(data:font/ttf;base64,${b64(path.join(ROOT, 'drafts/fonts/GrandifloraOne-Regular.ttf'))}) format('truetype')}`;

async function inject(page) {
  await page.evaluate(({ LOCAL_FACES, css, body, CW, CH, Z }) => {
    const st = document.createElement('style'); st.textContent = LOCAL_FACES; document.head.appendChild(st);
    const host = document.createElement('div'); host.id = '__h29';
    host.style.cssText = `all:initial;position:fixed;left:0;top:0;width:${CW}px;height:${CH}px;zoom:${Z};z-index:2147483647;display:block;pointer-events:none;`;
    const sh = host.attachShadow({ mode: 'open' });
    sh.innerHTML = `<style>:host{all:initial} ${css}</style><style id="pass"></style>${body}`;
    document.documentElement.appendChild(host);
    window.scrollTo(0, 0);
  }, { LOCAL_FACES, css, body, CW, CH, Z });
  await page.evaluate(js + `;window.__hero=initHero(document.getElementById('__h29').shadowRoot,{mode:'render',intro:${INTRO}});`);
  await page.evaluate(async () => {
    const sh = document.getElementById('__h29').shadowRoot;
    await Promise.all([...sh.querySelectorAll('img')].map((i) => i.decode().catch(() => {})));
    await Promise.all([...sh.querySelectorAll('video')].map((v) => v.readyState >= 2 ? 0 : new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 10000); })));
    await document.fonts.ready;
  });
}
// 테스터 페이지 자체는 캡처할 때만 숨김(입력할 때 숨겨 두면 입력창을 찾지 못함)
const hidePage = (page, on) => page.evaluate((on) => {
  let st = document.getElementById('__hide'); if (!st) { st = document.createElement('style'); st.id = '__hide'; document.head.appendChild(st); }
  st.textContent = on ? 'html,body{background:transparent!important}body,body *{visibility:hidden!important}html>:not(#__h29){opacity:0!important}' : '';
}, on);
const setPass = (page, rule) => page.evaluate((rule) => { document.getElementById('__h29').shadowRoot.getElementById('pass').textContent = rule; }, rule);

async function typeBatch(page, src, text) {
  for (let attempt = 0; attempt < 3; attempt++) {
    await hidePage(page, false);
    const inp = page.locator('input.preview-text:visible').first();
    await inp.fill(''); await inp.fill(text); await inp.press('Enter');
    await page.waitForTimeout(7000);
    const fam = await page.evaluate(({ text, labels }) => {
      const isS = (el) => el.children.length === 0 && el.textContent.trim() === text && parseFloat(getComputedStyle(el).fontSize) > 20;
      const o = {};
      for (const el of [...document.querySelectorAll('body *')].filter(isS)) {
        let row = el.parentElement; while (row.parentElement && [...row.parentElement.querySelectorAll('*')].filter(isS).length === 1) row = row.parentElement;
        const lab = (row.innerText || '').split('\n').map((t) => t.trim()).filter((t) => t && t !== text)[0] || '';
        if (labels.includes(lab) && !o[lab]) o[lab] = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      } return o;
    }, { text, labels: Object.values(SRC[src].vars) });
    if (Object.values(SRC[src].vars).every((l) => fam[l])) {
      await page.evaluate(async ({ map, text }) => { for (const f of Object.values(map)) await document.fonts.load(`40px "${f}"`, text).catch(() => {}); await document.fonts.ready; }, { map: fam, text });
      await hidePage(page, true);
      return Object.fromEntries(Object.entries(SRC[src].vars).map(([v, l]) => [v, fam[l]]));
    }
    console.log('  재시도', src, Object.keys(fam));
  }
  throw new Error('테스터 서체를 찾지 못함: ' + src);
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const LAY = fs.mkdtempSync(path.join(require('os').tmpdir(), 'v29-'));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: Math.max(W, 1280), height: Math.max(HH, 1080) }, deviceScaleFactor: 1, bypassCSP: true, locale: 'ko-KR' });
  const page = await ctx.newPage();
  const srcs = [...new Set([ROLE.H, ROLE.N, 'greta'])].filter((s) => s !== 'local');
  // 묶음별 글자 모으기
  await page.goto('about:blank'); await inject(page);
  const groups = await page.evaluate(() => {
    const o = {};
    for (const el of document.getElementById('__h29').shadowRoot.querySelectorAll('[data-g]')) { const g = el.dataset.g; o[g] = (o[g] || '') + el.textContent; }
    return o;
  });
  const passes = {};
  for (const [g, txt] of Object.entries(groups)) {
    const [src] = g.split(':'); if (src === 'local') continue;
    const chars = new Set([...txt.replace(/\s/g, '')]); if (g.endsWith(':kn')) for (const c of DIGITS) chars.add(c);
    (passes[src] = passes[src] || []).push({ g, chars });
  }
  const batches = {};
  const under = (g) => g.endsWith(':cap');  // 벽 속 캡션은 그라데이션 아래 층
  for (const [src, list] of Object.entries(passes)) {
    batches[src] = [];
    for (const { g, chars } of list) {
      if (chars.size > 100) throw new Error(`${g} 글자 ${chars.size}자 > 100`);
      const fit = batches[src].find((bt) => bt.under === under(g) && new Set([...bt.chars, ...chars]).size <= 100);
      if (fit) { fit.groups.push(g); chars.forEach((c) => fit.chars.add(c)); } else batches[src].push({ groups: [g], chars: new Set(chars), under: under(g) });
    }
  }
  for (const [s, bl] of Object.entries(batches)) console.log(s, bl.map((x) => `${x.groups.join('+')} (${x.chars.size}자${x.under ? ', 아래층' : ''})`).join(' | '));
  const layers = { under: [], over: [] };

  // 패스 0a: 작업물 벽만(불투명) / 0b: 그라데이션·로고·선 + 무료 서체(local) 글자(투명 배경)
  await setPass(page, `.hero>:not(.stage){visibility:hidden!important}[data-g],[data-g] *{visibility:hidden!important}`);
  for (const t of TS) {
    await page.evaluate(async (t) => { await window.__hero.renderAt(t); }, t); await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(LAY, `t${t}_wall.png`), clip: { x: 0, y: 0, width: W, height: HH } });
  }
  await setPass(page, `.hero{background:transparent!important}.stage{visibility:hidden!important}[data-g]:not([data-g^="local:"]),[data-g]:not([data-g^="local:"]) *{visibility:hidden!important}`);
  for (const t of TS) {
    await page.evaluate(async (t) => { await window.__hero.renderAt(t, { noVideo: true }); }, t); await page.waitForTimeout(120);
    await page.screenshot({ path: path.join(LAY, `t${t}_top.png`), clip: { x: 0, y: 0, width: W, height: HH }, omitBackground: true });
  }
  // 산돌 서체 패스
  let li = 1;
  for (const src of srcs) {
    if (!batches[src]) continue;
    await page.goto(SRC[src].url, { waitUntil: 'domcontentloaded', timeout: 90000 }); await page.waitForTimeout(7000);
    await inject(page);
    for (const bt of batches[src]) {
      const vars = await typeBatch(page, src, [...bt.chars].join(''));
      const sel = bt.groups.map((g) => `[data-g="${g}"],[data-g="${g}"] *`).join(',');
      await setPass(page, `.hero{background:transparent!important;${Object.entries(vars).map(([k, v]) => `${k}:"${v}"`).join(';')}} .hero *{visibility:hidden!important} ${sel}{visibility:visible!important}`);
      await page.evaluate(() => document.fonts.ready);
      for (const t of TS) {
        await page.evaluate(async (t) => { await window.__hero.renderAt(t, { noVideo: true }); }, t); await page.waitForTimeout(150);
        await page.screenshot({ path: path.join(LAY, `t${t}_${li}.png`), clip: { x: 0, y: 0, width: W, height: HH }, omitBackground: true });
      }
      layers[bt.under ? 'under' : 'over'].push(li);
      console.log('  패스', li, src, bt.groups.join('+')); li++;
    }
  }
  await b.close();
  // 합성(한 번의 파이썬 실행으로 모든 시점)
  const order = ['wall', ...layers.under, 'top', ...layers.over].join(',');
  const FR = path.join(LAY, 'frames'); if (FPS) fs.mkdirSync(FR);
  const outs = TS.map((t, i) => FPS ? path.join(FR, `${String(i).padStart(4, '0')}.png`) : path.join(OUT, TS.length > 1 ? `${NAME}_t${String(t).replace('.', '_')}.png` : `${NAME}.png`));
  fs.writeFileSync(path.join(LAY, 'jobs.json'), JSON.stringify(TS.map((t, i) => [String(t), outs[i]])));
  execFileSync('python3', ['-c', `
import sys, json
from PIL import Image
lay, order = sys.argv[1:3]
names = order.split(',')
for t, out in json.load(open(lay + '/jobs.json')):
    base = Image.open(f'{lay}/t{t}_{names[0]}.png').convert('RGBA')
    for n in names[1:]:
        base = Image.alpha_composite(base, Image.open(f'{lay}/t{t}_{n}.png').convert('RGBA'))
    base.convert('RGB').save(out)
`, LAY, order]);
  if (FPS) {
    const mp4 = path.join(OUT, `${NAME}.mp4`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-framerate', String(FPS), '-i', path.join(FR, '%04d.png'), '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', mp4]);
    console.log('saved', path.relative(ROOT, mp4));
  } else outs.forEach((o) => console.log('saved', path.relative(ROOT, o)));
  fs.rmSync(LAY, { recursive: true, force: true });
})();
