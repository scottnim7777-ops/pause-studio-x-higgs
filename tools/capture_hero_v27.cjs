// 27차 히어로 시안 캡처: drafts/v27/hero/hero.html 을 산돌구름 SD 정체 테스터 페이지 안에 띄워 그 페이지의 웹폰트로 렌더링
// - 한글: 테스터 입력창에 필요한 글자를 100자 이하 묶음으로 입력 → 묶음마다 생기는 서체를 대체 서체 목록으로 이어 붙임(폰트 파일은 내려받지 않음)
// - 영문 Archivo · 숫자 Instrument Serif · 대체 마루 부리: drafts/fonts 의 OFL 파일
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/capture_hero_v27.cjs [stills|video] [초=12]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), { execSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..'), H = path.join(ROOT, 'drafts/v27/hero'), OUT = path.join(ROOT, 'drafts/v27/out');
const mode = process.argv[2] || 'stills', secs = +(process.argv[3] || 12), FPS = 30;
const b64 = (f) => fs.readFileSync(f).toString('base64');
const mime = { jpg: 'image/jpeg', svg: 'image/svg+xml', webm: 'video/webm' };
const page0 = fs.readFileSync(path.join(H, 'hero.html'), 'utf8');
const css = page0.match(/<style id="hero-css">([\s\S]*?)<\/style>/)[1];
let body = page0.match(/<!--HERO-->([\s\S]*?)<!--\/HERO-->/)[1];
body = body.replace(/src="(media\/[^"]+)"/g, (_, f) => `src="data:${mime[f.split('.').pop()]};base64,${b64(path.join(H, f))}"`);
const text = page0.match(/<!--HERO-->([\s\S]*?)<!--\/HERO-->/)[1].replace(/<[^>]+>/g, ' ');
// 산돌 테스터는 입력할 때마다 같은 이름의 서체를 새로 만들어 이전 글자 묶음이 사라짐 → 한글은 한 번에(100자 이하) 입력
const chars = [...new Set([...text].filter((c) => /[\uAC00-\uD7A3.,·]/.test(c)))];
if (chars.length > 100) throw new Error('한글 글자 수가 100자를 넘음: ' + chars.length + ' — 문구를 줄이거나 일부를 다른 서체로');
const chunks = [chars.join('')];
const F = path.join(ROOT, 'drafts/fonts');
const FACES = `@font-face{font-family:'Archivo';src:url(data:font/ttf;base64,${b64(F + '/Archivo-VF.ttf')}) format('truetype');font-weight:100 900;font-stretch:62% 125%}
@font-face{font-family:'Instrument Serif';src:url(data:font/ttf;base64,${b64(F + '/InstrumentSerif-Regular.ttf')}) format('truetype')}
@font-face{font-family:'Instrument Serif';font-style:italic;src:url(data:font/ttf;base64,${b64(F + '/InstrumentSerif-Italic.ttf')}) format('truetype')}
@font-face{font-family:MaruBuri;src:url(data:font/woff2;base64,${b64(F + '/MaruBuri-Regular.woff2')}) format('woff2')}`;
const WANT = ['690', '690i', '530', '630'];

async function families(page) {
  const out = Object.fromEntries(WANT.map((k) => [k, []]));
  for (const ch of chunks) {
    for (let attempt = 0; attempt < 3; attempt++) {
      const inp = page.locator('input.preview-text').first();
      await inp.click(); await inp.fill(ch); await page.keyboard.press('Enter'); await page.waitForTimeout(7000);
      const map = await page.evaluate((text) => {
        const isS = (el) => el.children.length === 0 && el.textContent.trim() === text.trim() && parseFloat(getComputedStyle(el).fontSize) > 20;
        const o = {};
        for (const el of [...document.querySelectorAll('body *')].filter(isS)) {
          let row = el.parentElement; while (row.parentElement && [...row.parentElement.querySelectorAll('*')].filter(isS).length === 1) row = row.parentElement;
          const lab = (row.innerText || '').split('\n').map((t) => t.trim()).filter((t) => t && t !== text.trim())[0] || '';
          if (lab && !o[lab]) o[lab] = getComputedStyle(el).fontFamily;
        } return o;
      }, ch);
      if (WANT.every((k) => map[k])) {
        const ci = chunks.indexOf(ch);
        const names = await page.evaluate(async ({ map, WANT, ci }) => {
          const res = {};
          for (const k of WANT) {
            const fam = map[k].split(',')[0].replace(/["']/g, '').trim();
            const e = [...window.__faces].reverse().find((x) => x.fam.replace(/["']/g, '') === fam);
            if (!e) { res[k] = map[k]; continue; }
            const nf = new window.__OrigFontFace(`PHF_${k}_${ci}`, e.src, e.desc); await nf.load(); document.fonts.add(nf); res[k] = `PHF_${k}_${ci}`;
          } return res;
        }, { map, WANT, ci });
        WANT.forEach((k) => out[k].push(names[k])); break;
      }
      if (attempt === 2) throw new Error('산돌 서체를 못 찾음: ' + Object.keys(map));
    }
  }
  return out;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const ctx = await b.newContext({ viewport: { width: 1920, height: 1700 }, bypassCSP: true, locale: 'ko-KR' });
  await ctx.addInitScript(() => {
    const O = window.FontFace; window.__faces = [];
    window.FontFace = function (fam, src, desc) { const f = new O(fam, src, desc); window.__faces.push({ fam, src, desc }); return f; };
    window.FontFace.prototype = O.prototype; window.__OrigFontFace = O;
  });
  const page = await ctx.newPage();
  await page.goto('https://www.sandollcloud.com/font/21615/SD-Jeongche', { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(7000);
  const fam = await families(page);
  const vars = `--kr-d:${fam['690'].join(',')},MaruBuri,serif;--kr-di:${fam['690i'].join(',')},MaruBuri,serif;--kr-t:${fam['530'].join(',')},MaruBuri,serif;--kr-ui:${fam['630'].join(',')},MaruBuri,serif;`;
  await page.evaluate(({ FACES, css, body, vars }) => {
    const st = document.createElement('style'); st.textContent = FACES; document.head.appendChild(st);
    document.documentElement.style.overflow = 'hidden'; window.scrollTo(0, 0);
    const mk = (id, extra, cls) => {
      const host = document.createElement('div'); host.id = id;
      host.style.cssText = 'all:initial;position:fixed;left:0;top:0;z-index:2147483647;display:block;' + extra;
      const sh = host.attachShadow({ mode: 'open' });
      sh.innerHTML = `<style>:host{all:initial} ${css} .ph-root{${vars}}</style>${body.replace('class="ph-root"', 'class="ph-root ' + cls + '"')}`;
      document.documentElement.appendChild(host); return sh.querySelector('.ph-root');
    };
    window.__d = mk('hd', 'width:1920px;height:1080px;', '');
    window.__m = mk('hm', 'width:390px;height:844px;zoom:2;visibility:hidden;', 'm');
  }, { FACES, css, body, vars });
  await page.evaluate(fs.readFileSync(path.join(H, 'hero.js'), 'utf8') + ';window.__hd=initPauseHero(window.__d,{});window.__hmo=initPauseHero(window.__m,{});');
  await page.evaluate(async () => {
    await document.fonts.ready;
    const vs = [...document.querySelectorAll('#hd,#hm')].flatMap((h) => [...h.shadowRoot.querySelectorAll('video')]);
    await Promise.all(vs.map((v) => v.readyState >= 2 ? 0 : new Promise((r) => { v.addEventListener('loadeddata', r, { once: true }); setTimeout(r, 8000); })));
  });
  const shot = async (file, t, which = 'd') => {
    await page.evaluate(async ({ t, which }) => { await (which === 'd' ? window.__hd : window.__hmo).renderAt(t); }, { t, which });
    await page.waitForTimeout(60);
    const clip = which === 'd' ? { x: 0, y: 0, width: 1920, height: 1080 } : { x: 0, y: 0, width: 780, height: 1688 };
    await page.screenshot({ path: file, clip, type: 'jpeg', quality: 92 });
  };
  if (mode === 'stills') {
    for (const t of [0.6, 1.2, 2.0, 3.5, 9.0]) { await shot(path.join(OUT, `still-${String(t).replace('.', '_')}.jpg`), t); console.log('still', t); }
    await page.evaluate(() => { document.getElementById('hd').style.visibility = 'hidden'; document.getElementById('hm').style.visibility = 'visible'; });
    await shot(path.join(OUT, 'mobile-3_5.jpg'), 3.5, 'm'); console.log('mobile');
  } else {
    const FR = path.join(OUT, 'frames'); fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR);
    const n = Math.round(secs * FPS);
    for (let i = 0; i < n; i++) {
      await page.evaluate(async ({ t, i }) => { await window.__hd.renderAt(t, i); }, { t: i / FPS, i });
      await page.screenshot({ path: path.join(FR, `${String(i).padStart(4, '0')}.jpg`), clip: { x: 0, y: 0, width: 1920, height: 1080 }, type: 'jpeg', quality: 93 });
      if (i % 60 === 0) console.log('frame', i, '/', n);
    }
    const mp4 = path.join(OUT, 'PAUSE_hero_v27.mp4');
    execSync(`ffmpeg -v error -y -framerate ${FPS} -i ${FR}/%04d.jpg -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -movflags +faststart ${mp4}`);
    console.log('video', mp4);
  }
  await b.close();
})();
