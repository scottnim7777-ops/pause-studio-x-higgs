/**
 * 실제 서체(산돌 SD 그레타산스 · SD 격동고딕2)로 사이트 전체 미리보기 이미지를 만든다.
 * - 산돌 공식 테스터 페이지 안에서만 그린다(서체 파일을 내려받거나 저장하지 않음). 테스터는 한 번에 100자까지만 서체를 만든다.
 * - 그래서 ① 글자마다 실제 서체의 폭을 재고 ② 모든 글자를 그 폭의 칸에 고정해(배치가 패스마다 같게)
 *   ③ 100자 묶음마다 그 글자만 보이게 찍은 뒤 ④ 배경 패스 위에 겹친다.
 * 실행(사이트 서버가 떠 있어야 함): NODE_PATH=/opt/node22/lib/node_modules NODE_USE_ENV_PROXY=1 node site/tests/preview.cjs http://localhost:3100 1440 <출력폴더> [배율]
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const BASE = process.argv[2] || 'http://localhost:3100';
const VW = Number(process.argv[3] || 1440);
const OUT = path.resolve(process.argv[4] || 'site/tests/out/preview');
const DPR = Number(process.argv[5] || (VW < 768 ? 2 : 1));
const VH = VW < 768 ? 844 : 900;
const SLICE = 2000; // 한 번에 찍는 높이(CSS px)
const EXE = '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const SRC = {
  greta: { url: 'https://www.sandollcloud.com/font/18013/SD-Greta-Sans', faces: { 'greta-rg': '09 Rg', 'greta-md': '11 Md' } },
  gd: { url: 'https://www.sandollcloud.com/font/15556.html', faces: { 'gd-rg': '04 Rg' } },
};
const SRC_OF = { 'greta-rg': 'greta', 'greta-md': 'greta', 'gd-rg': 'gd' };
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'pv-'));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

/* ── 1) 사이트를 최종 상태로 열어 본문·CSS를 가져옴(동작 줄이기: 인트로 없이 바로 최종 화면) */
async function snapshot(browser) {
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  await p.goto(BASE, { waitUntil: 'networkidle' });
  await p.waitForTimeout(800);
  const data = await p.evaluate(async () => {
    const toData = async (url) => {
      const r = await fetch(url); const b = await r.blob();
      return await new Promise((res) => { const fr = new FileReader(); fr.onload = () => res(fr.result); fr.readAsDataURL(b); });
    };
    document.querySelectorAll('script, dialog, .skip, .mnav').forEach((e) => e.remove());
    const hero = document.querySelector('.hero');
    if (hero) hero.style.minHeight = `${Math.round(hero.getBoundingClientRect().height)}px`;
    // 영상 → 포스터 사진(정지 화면)
    for (const v of [...document.querySelectorAll('video')]) {
      if (v.closest('.scr, .wk-media')) { v.remove(); continue; }
      const im = document.createElement('img');
      im.className = v.className; im.src = v.poster; im.alt = '';
      v.replaceWith(im);
    }
    document.querySelectorAll('picture source').forEach((s) => s.remove());
    const imgs = [...document.querySelectorAll('img')];
    for (const im of imgs) {
      const src = im.currentSrc || im.src;
      im.removeAttribute('srcset'); im.removeAttribute('sizes'); im.removeAttribute('loading');
      if (src && !src.startsWith('data:')) im.src = await toData(src);
    }
    const css = await (await fetch([...document.querySelectorAll('link[rel=stylesheet]')].map((l) => l.href)[0])).text();
    return { body: document.body.innerHTML, css, bodyClass: document.body.className };
  });
  await ctx.close();
  return data;
}

/* 사이트 CSS를 그림자 영역(shadow root) 안에서 쓰도록 바꿈 */
function shadowCss(css, metrics) {
  // 배치용 서체: 로컬 DejaVu Sans에 산돌 서체의 실제 ascent·descent를 덮어씌움 → 모든 패스에서 줄 높이·기준선이 같고 실제와도 같음
  const faces = Object.entries(metrics).map(([face, m]) =>
    `@font-face{font-family:'PV-${face}';src:local('DejaVu Sans');ascent-override:${(m.a * 100).toFixed(2)}%;descent-override:${(m.d * 100).toFixed(2)}%;line-gap-override:0%}`).join('');
  return faces + css
    .replace(/:root\b/g, ':host')
    .replace(/(^|[}\s,])html\s*\{/g, '$1:host{')
    .replace(/(^|[}\s,])body\s*\{/g, '$1.__body{')
    .replace(/html:not\(\.js\)\s*/g, '')
    + `
/* 미리보기 전용: 머리줄을 맨 위에 고정(스크롤 따라오지 않게), 커서·건너뛰기 숨김 */
.hd{position:absolute!important}
*,*::before,*::after{animation:none!important;transition:none!important}
x-w{white-space:nowrap}
x-c{display:inline-block;line-height:0;vertical-align:baseline;text-align:left;overflow:visible;white-space:pre;text-indent:0}
:host{--font-text:'PV-greta-rg';--font-text-md:'PV-greta-md';--font-display:'PV-gd-rg'}
`;
}

/* ── 테스터 페이지에 사이트를 넣음 */
async function inject(page, snap, locked, metrics) {
  await page.evaluate(({ css, body, VW }) => {
    document.getElementById('__pv')?.remove();
    const host = document.createElement('div');
    host.id = '__pv';
    host.style.cssText = `all:initial;position:fixed;left:0;top:0;width:${VW}px;display:block;z-index:2147483647;pointer-events:none;transform:translateY(0);`;
    const sh = host.attachShadow({ mode: 'open' });
    sh.innerHTML = `<style>${css}</style><style id="vars"></style><style id="pass"></style><div class="__body">${body}</div>`;
    document.documentElement.appendChild(host);
  }, { css: shadowCss(snap.css, metrics), body: locked || snap.body, VW });
  await page.evaluate(async () => {
    const sh = document.getElementById('__pv').shadowRoot;
    await Promise.all([...sh.querySelectorAll('img')].map((i) => i.decode().catch(() => {})));
  });
}
const hidePage = (page, on) => page.evaluate((on) => {
  let st = document.getElementById('__hide');
  if (!st) { st = document.createElement('style'); st.id = '__hide'; document.head.appendChild(st); }
  st.textContent = on ? 'html,body{background:transparent!important;overflow:visible!important}body,body *{visibility:hidden!important}html>:not(#__pv){opacity:0!important}' : '';
}, on);
const setStyle = (page, id, text) => page.evaluate(({ id, text }) => { document.getElementById('__pv').shadowRoot.getElementById(id).textContent = text; }, { id, text });

/* 테스터에 글자를 입력하고, 그 글자로 만들어진 서체 이름(굵기별)을 찾음 */
async function typeBatch(page, src, text) {
  const labels = Object.values(SRC[src].faces);
  await page.setViewportSize(TYPE_VP);
  for (let attempt = 0; attempt < 3; attempt++) {
    await hidePage(page, false);
    const inp = page.locator('input.preview-text:visible').first();
    await inp.fill(''); await inp.fill(text); await inp.press('Enter');
    await page.waitForTimeout(7000);
    const fam = await page.evaluate(({ text, labels }) => {
      const isS = (el) => el.children.length === 0 && el.textContent.trim() === text.trim() && parseFloat(getComputedStyle(el).fontSize) > 20;
      const o = {};
      for (const el of [...document.querySelectorAll('body *')].filter(isS)) {
        let row = el.parentElement;
        while (row.parentElement && [...row.parentElement.querySelectorAll('*')].filter(isS).length === 1) row = row.parentElement;
        const lab = (row.innerText || '').split('\n').map((t) => t.trim()).filter((t) => t && t !== text.trim())[0] || '';
        if (labels.includes(lab) && !o[lab]) o[lab] = getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim();
      }
      return o;
    }, { text, labels });
    if (labels.every((l) => fam[l])) {
      await page.evaluate(async ({ fams, text }) => { for (const f of fams) await document.fonts.load(`40px "${f}"`, text).catch(() => {}); await document.fonts.ready; }, { fams: Object.values(fam), text });
      await hidePage(page, true);
      return Object.fromEntries(Object.entries(SRC[src].faces).map(([face, l]) => [face, fam[l]]));
    }
    log('  재시도', src, JSON.stringify(fam));
  }
  throw new Error(`테스터 서체를 찾지 못함: ${src}`);
}

/* 글자 → 서체 묶음(face) 판정과 글자 모으기: 사이트를 그대로 띄운 화면에서 계산 */
const FACE_FN = `
  function faceOf(cs) {
    const f = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
    if (f === 'SD Gyeokdong Gothic 2') return 'gd-rg';
    if (f === 'SD Greta Sans') return parseInt(cs.fontWeight, 10) >= 500 ? 'greta-md' : 'greta-rg';
    return null;
  }
  function skip(el) { return !el || el.closest('script,style,svg,.sr,.mock,title,dialog,input,textarea,select,option'); }
`;

async function collectChars(browser, snap) {
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH } });
  const p = await ctx.newPage();
  await p.setContent(`<!doctype html><html><head><style>${snap.css}</style></head><body class="${snap.bodyClass}">${snap.body}</body></html>`);
  const chars = await p.evaluate(`(() => { ${FACE_FN}
    const out = {};
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) {
      const t = w.currentNode, el = t.parentElement;
      if (skip(el) || !t.nodeValue.trim()) continue;
      const cs = getComputedStyle(el); const face = faceOf(cs); if (!face) continue;
      const up = cs.textTransform === 'uppercase';
      for (const ch of t.nodeValue) { if (/\\s/.test(ch)) continue; (out[face] = out[face] || new Set()).add(up ? ch.toUpperCase() : ch); }
    }
    return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, [...v].sort().join('')]));
  })()`);
  await ctx.close();
  return chars;
}

/* 100자 이하 묶음으로 나눔(그레타는 Rg·Md를 같은 입력으로 함께 만들므로 합집합으로) */
function makeBatches(chars) {
  const bySrc = { greta: new Set([...(chars['greta-rg'] || ''), ...(chars['greta-md'] || '')]), gd: new Set([...(chars['gd-rg'] || '')]) };
  const out = {};
  for (const [src, set] of Object.entries(bySrc)) {
    const list = [...set];
    out[src] = [];
    for (let i = 0; i < list.length; i += 99) out[src].push(list.slice(i, i + 99).join('')); // + 띄어쓰기 1자
  }
  return out;
}

/* 글자를 고정 폭 칸으로 감싼 본문을 만듦(모든 패스에서 배치가 같도록) */
async function lockLayout(browser, snap, adv, batchOf) {
  const ctx = await browser.newContext({ viewport: { width: VW, height: VH } });
  const p = await ctx.newPage();
  await p.setContent(`<!doctype html><html><head><style>${snap.css}</style></head><body class="${snap.bodyClass}">${snap.body}</body></html>`);
  const html = await p.evaluate(`(({ adv, batchOf }) => { ${FACE_FN}
    const nodes = [];
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (w.nextNode()) nodes.push(w.currentNode);
    const SP = 0.3179; // DejaVu Sans 띄어쓰기 폭(em) — 배치용 서체의 바탕
    // 밑줄은 글자 칸(inline-block) 안으로 전해지지 않으므로 칸마다 직접 줌
    const decoOf = (el) => { for (let a = el; a && a !== document.body; a = a.parentElement) { const c = getComputedStyle(a); if (c.textDecorationLine && c.textDecorationLine !== 'none') return c; if (!/inline/.test(c.display)) break; } return null; };
    for (const t of nodes) {
      const el = t.parentElement;
      if (skip(el)) continue;
      const cs = getComputedStyle(el);
      const face = faceOf(cs);
      const fsz = parseFloat(cs.fontSize);
      const ls = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
      const inlineCtx = !/flex|grid/.test(getComputedStyle(el).display);
      if (!t.nodeValue.trim()) {
        if (!face || !inlineCtx) continue;
        const sp = document.createElement('x-s');
        sp.style.wordSpacing = ((adv[face][' '] || 0.25) * fsz + ls - SP * fsz) + 'px';
        sp.textContent = t.nodeValue; t.replaceWith(sp); continue;
      }
      if (!face) continue;
      const up = cs.textTransform === 'uppercase';
      const deco = decoOf(el);
      const frag = document.createDocumentFragment();
      for (const tok of t.nodeValue.split(/(\\s+)/)) {
        if (!tok) continue;
        if (/^\\s+$/.test(tok)) {
          const sp = document.createElement('x-s');
          sp.style.wordSpacing = ((adv[face][' '] || 0.25) * fsz + ls - SP * fsz) + 'px';
          sp.textContent = tok; frag.append(sp); continue;
        }
        const wd = document.createElement('x-w');
        for (const raw of tok) {
          const ch = up ? raw.toUpperCase() : raw;
          const c = document.createElement('x-c');
          c.dataset.f = face; c.dataset.b = String(batchOf[face][ch] ?? -1);
          const a = adv[face][ch];
          c.style.width = ((a == null ? 0.6 : a) * fsz + ls) + 'px';
          if (deco) { c.style.textDecorationLine = deco.textDecorationLine; c.style.textDecorationThickness = deco.textDecorationThickness; c.style.textUnderlineOffset = deco.textUnderlineOffset; c.style.textDecorationColor = deco.textDecorationColor; }
          c.textContent = raw; wd.append(c);
        }
        frag.append(wd);
      }
      if (!inlineCtx) { const one = document.createElement('x-g'); one.append(frag); t.replaceWith(one); }
      else t.replaceWith(frag);
    }
    return document.body.innerHTML;
  })(${JSON.stringify({ adv, batchOf })})`);
  await ctx.close();
  return html;
}

const TYPE_VP = { width: 1280, height: 900 }; // 테스터 입력창이 보이는 크기
const SHOT_VP = { width: VW, height: SLICE }; // 사이트를 찍는 크기(미디어 쿼리·vw 기준 = VW)
async function shoot(page, H, name, transparent) {
  const files = [];
  for (let y = 0, i = 0; y < H; y += SLICE, i++) {
    const h = Math.min(SLICE, H - y);
    await page.evaluate((y) => { document.getElementById('__pv').style.transform = `translateY(${-y}px)`; }, y);
    await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
    const f = path.join(tmp, `${name}_${String(i).padStart(2, '0')}.png`);
    await page.screenshot({ path: f, clip: { x: 0, y: 0, width: VW, height: h }, omitBackground: !!transparent });
    files.push(f);
  }
  await page.evaluate(() => { document.getElementById('__pv').style.transform = 'translateY(0)'; });
  return files;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: EXE });
  log('사이트 상태 가져오기', BASE, VW);
  const snap = await snapshot(browser);
  const chars = await collectChars(browser, snap);
  for (const [k, v] of Object.entries(chars)) log(`  ${k}: ${v.length}자`);
  const batches = makeBatches(chars);
  log('  묶음:', Object.entries(batches).map(([s, b]) => `${s} ${b.length}개`).join(', '));

  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: DPR, bypassCSP: true, locale: 'ko-KR' });
  const page = await ctx.newPage();

  /* ── 2) 글자 폭 재기(실제 서체) */
  const adv = { 'greta-rg': {}, 'greta-md': {}, 'gd-rg': {} };
  const batchOf = { 'greta-rg': {}, 'greta-md': {}, 'gd-rg': {} };
  const famsBy = { greta: [], gd: [] };
  const metrics = {};
  const metBy = {};
  // 같은 줄 높이 안에서 기준선 위치 = (L + A − D)/2 → 첫 묶음과의 차이만큼 글자를 옮김(em)
  const off = (f, bi) => { const a = metrics[f], b = (metBy[f] || [])[bi] || a; return (((a.a - a.d) - (b.a - b.d)) / 2).toFixed(4); };
  for (const src of ['greta', 'gd']) {
    await page.goto(SRC[src].url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(7000);
    for (let bi = 0; bi < batches[src].length; bi++) {
      const text = batches[src][bi] + ' ';
      const fams = await typeBatch(page, src, text);
      famsBy[src][bi] = fams;
      const m = await page.evaluate(({ fams, text }) => {
        const c = document.createElement('canvas').getContext('2d');
        const o = {}, met = {};
        for (const [face, fam] of Object.entries(fams)) {
          c.font = `1000px "${fam}"`;
          o[face] = Object.fromEntries([...text].map((ch) => [ch, c.measureText(ch).width / 1000]));
          const t = c.measureText(text.trim()[0] || '가');
          met[face] = { a: t.fontBoundingBoxAscent / 1000, d: t.fontBoundingBoxDescent / 1000 };
        }
        return { o, met };
      }, { fams, text });
      for (const [face, mm] of Object.entries(m.met)) { metrics[face] = metrics[face] || mm; (metBy[face] = metBy[face] || [])[bi] = mm; }
      for (const [face, map] of Object.entries(m.o)) {
        for (const [ch, a] of Object.entries(map)) {
          if (ch === ' ') { adv[face][' '] = adv[face][' '] ?? a; continue; }
          if ((chars[face] || '').includes(ch) && batchOf[face][ch] == null) { adv[face][ch] = a; batchOf[face][ch] = bi; }
        }
      }
      log(`  폭 측정 ${src} 묶음 ${bi + 1}/${batches[src].length}`);
    }
  }

  log('  서체 높이(묶음별)', JSON.stringify(metBy));
  /* ── 3) 배치 고정 */
  const locked = await lockLayout(browser, snap, adv, batchOf);

  /* ── 4) 패스별 촬영: 배경(산돌 글자만 투명) → 묶음마다 그 글자만 */
  const layers = []; // [{files, transparent}]
  let H = 0;
  for (const src of ['greta', 'gd']) {
    await page.goto(SRC[src].url, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(7000);
    await inject(page, snap, locked, metrics);
    await hidePage(page, true);
    await page.setViewportSize(SHOT_VP);
    await page.waitForTimeout(400);
    H = await page.evaluate(() => Math.ceil(document.getElementById('__pv').getBoundingClientRect().height));
    if (src === 'greta') {
      await setStyle(page, 'pass', 'x-c{-webkit-text-fill-color:transparent!important}');
      layers.push({ files: await shoot(page, H, 'base', false), transparent: false });
      log('  배경 패스', `${VW}×${H}`);
    }
    for (let bi = 0; bi < batches[src].length; bi++) {
      const fams = await typeBatch(page, src, batches[src][bi] + ' ');
      const faces = Object.keys(SRC[src].faces);
      await setStyle(page, 'vars', faces.map((f) => `x-c[data-f="${f}"][data-b="${bi}"]{font-family:"${fams[f]}"!important}`).join('\n'));
      const show = faces.map((f) => `x-c[data-f="${f}"][data-b="${bi}"]`).join(',');
      await page.setViewportSize(SHOT_VP);
      await setStyle(page, 'pass', `x-c{-webkit-text-fill-color:transparent!important} ${show}{-webkit-text-fill-color:currentColor!important}`);
      await page.evaluate(async () => { await document.fonts.ready; });
      await page.waitForTimeout(300);
      layers.push({ files: await shoot(page, H, `${src}${bi}`, false), transparent: false });
      log(`  글자 패스 ${src} ${bi + 1}/${batches[src].length}`);
    }
  }
  await browser.close();

  /* ── 5) 합성 → 전체 이미지 + 확인용 조각 */
  const spec = path.join(tmp, 'layers.json');
  fs.writeFileSync(spec, JSON.stringify({ layers, out: OUT, vw: VW, dpr: DPR }));
  execFileSync('python3', ['-I', '-c', `
import json, sys
import numpy as np
from PIL import Image
s = json.load(open(sys.argv[1]))
n = len(s['layers'][0]['files'])
slices = []
for i in range(n):
    base = np.asarray(Image.open(s['layers'][0]['files'][i]).convert('RGB'), dtype=np.int32)
    acc = base.copy()
    for L in s['layers'][1:]:
        acc += np.asarray(Image.open(L['files'][i]).convert('RGB'), dtype=np.int32) - base
    slices.append(Image.fromarray(np.clip(acc, 0, 255).astype(np.uint8)))
W = slices[0].width; H = sum(x.height for x in slices)
full = Image.new('RGB', (W, H))
y = 0
for x in slices: full.paste(x, (0, y)); y += x.height
full.save(f"{s['out']}/full-{s['vw']}.png", optimize=True)
print('저장', W, H)
`, spec], { stdio: 'inherit' });
  log('끝', OUT);
})().catch((e) => { console.error(e); process.exit(1); });
