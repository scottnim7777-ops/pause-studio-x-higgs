// 3차 시안 녹화: drafts/v3/hero.html 을 디나모 공식 페이지 안에 띄워 ABC Favorit Hangul로 렌더링하고,
// 시간 t를 프레임마다 지정해 PNG로 찍은 뒤 MP4로 묶는다(결정적 렌더 → 반복 이음매 검증 가능). 폰트 파일은 내려받지 않음.
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/record_v3.cjs [fps]
const { chromium } = require('playwright');
const fs = require('fs'); const path = require('path'); const { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..'); const V3 = path.join(ROOT, 'drafts/v3');
const FPS = Number(process.argv[2] || 30);
const FR = path.join(V3, 'work/frames'); fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true });
const page0 = fs.readFileSync(path.join(V3, 'hero.html'), 'utf8');
const mime = (f) => f.endsWith('.webm') ? 'video/webm' : 'image/jpeg';
const inline = (s) => s.replace(/media\/([\w.-]+)/g, (_, f) => `data:${mime(f)};base64,${fs.readFileSync(path.join(V3, 'media', f)).toString('base64')}`);
const css = inline(page0.match(/<style id="hero-css">([\s\S]*?)<\/style>/)[1]);
const body = inline(page0.match(/<!--HERO-->([\s\S]*?)<!--\/HERO-->/)[1]);
const js = page0.match(/<script id="hero-js">([\s\S]*?)<\/script>/)[1];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  p.on('pageerror', (e) => console.log('ERR', e.message));
  await p.goto('https://abcdinamo.com/typefaces/favorit-hangul', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(8000);
  await p.evaluate(({ css, body, js }) => {
    document.documentElement.style.overflow = 'hidden'; scrollTo(0, 0);
    const host = document.createElement('div');
    host.style.cssText = 'all:initial;position:fixed;left:0;top:0;width:1920px;height:1080px;z-index:2147483647;display:block';
    const sh = host.attachShadow({ mode: 'open' });
    sh.innerHTML = `<style>:host{all:initial} ${css} .hero{--f:'fv-hgl-rg-A','fv-hgl-rg-B';--fm:'fv-hgl-md-A','fv-hgl-md-B'}</style>${body}`;
    document.documentElement.appendChild(host);
    window.__hero = (new Function('root', 'opts', js + '\nreturn initHero(root, opts);'))(sh, { mode: 'render' });
  }, { css, body, js });
  await p.evaluate(async () => { await document.fonts.ready; const t = '한인 대표님들을 위한 웹사이트 제작 0원 12월'; for (const f of ['fv-hgl-rg-A','fv-hgl-rg-B','fv-hgl-md-A','fv-hgl-md-B']) await document.fonts.load(`40px ${f}`, t).catch(() => {}); });
  await p.waitForTimeout(2000);
  const { INTRO, P } = await p.evaluate(() => ({ INTRO: window.__hero.INTRO, P: window.__hero.P }));
  const N = Math.round((INTRO + P) * FPS);
  for (let i = 0; i <= N; i++) {
    const t = i / FPS;
    await p.evaluate(async (t) => { await window.__hero.renderAt(t); }, t);
    await p.screenshot({ path: path.join(FR, `f${String(i).padStart(5, '0')}.png`), clip: { x: 0, y: 0, width: 1920, height: 1080 } });
    if (i % 120 === 0) console.log('frame', i, '/', N);
  }
  await b.close();
  const i0 = Math.round(INTRO * FPS), n = Math.round(P * FPS);
  const enc = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });
  // ① 인트로 + 반복 1회(미리보기)  ② 반복 구간만(정확히 한 주기, 무한 반복 재생용)
  enc(['-framerate', String(FPS), '-i', path.join(FR, 'f%05d.png'), '-frames:v', String(i0 + n), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', path.join(V3, 'PAUSE_hero_v3_intro+loop.mp4')]);
  enc(['-framerate', String(FPS), '-start_number', String(i0), '-i', path.join(FR, 'f%05d.png'), '-frames:v', String(n), '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'slow', '-movflags', '+faststart', path.join(V3, 'PAUSE_hero_v3_loop24s.mp4')]);
  fs.writeFileSync(path.join(V3, 'work/record.json'), JSON.stringify({ FPS, INTRO, P, frames: N + 1, loopStart: i0, loopFrames: n }, null, 1));
  console.log('done');
})();
