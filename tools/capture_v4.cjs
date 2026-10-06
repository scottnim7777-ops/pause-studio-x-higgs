// 4차 첫 화면 스틸 캡처(폰트 3안): drafts/v4/hero-{A,B,C}.html 의 조판을 폰트 회사 공식 테스터 페이지 안에 띄워 그 페이지의 서체로 렌더링 → 1920×1080 PNG
// - 산돌: 미리보기 입력창에 원문에 쓰인 글자(100자 이하)를 입력해 생성되는 미리보기 서체를 사용
// - AG·디나모: 페이지가 테스터용으로 불러온 서체를 사용 · 마루 부리(OFL): 로컬 파일
// 폰트 파일은 내려받지 않는다. 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/capture_v2.cjs [01 02 ...]
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const V2 = path.join(ROOT, 'drafts/v4');
const OUT = path.join(ROOT, 'drafts/v4/composites');
const SOURCES = {
  'sd-gyeokdong-mj2': { url: 'https://www.sandollcloud.com/font/18510/SD-Gyeokdong-MJ2', sandoll: { head: '09 Sb', body: '08 Rg', ui: '08 Rg' }, credit: 'SD 격동명조2 (산돌)' },
  'sd-jeongche': { url: 'https://www.sandollcloud.com/font/21615/SD-Jeongche', sandoll: { head: '690', body: '630', ui: '630' }, credit: 'SD 정체 690·630 (산돌)' },
  'ag-choijeongho': { url: 'https://agfont.com/fonts/ag-choijeongho-minburi-screen', fam: { head: "'AG Choijeongho Screen Family'", body: "'AG Choijeongho Minburi Screen'", ui: "'AG Choijeongho Minburi Screen'", hw: 600 }, credit: 'AG 최정호 스크린(제목)·최정호 민부리 스크린(본문) (AG타이포그라피연구소)' },
};
const b64 = (f) => fs.readFileSync(f).toString('base64');
const MARU = `@font-face{font-family:MaruBuri;src:url(data:font/woff2;base64,${b64(path.join(ROOT, 'drafts/fonts/MaruBuri-Regular.woff2'))}) format('woff2');font-weight:400}
@font-face{font-family:MaruBuri;src:url(data:font/woff2;base64,${b64(path.join(ROOT, 'drafts/fonts/MaruBuri-SemiBold.woff2'))}) format('woff2');font-weight:600}`;

function parse(n) {
  const page = fs.readFileSync(path.join(V2, `hero-${n}.html`), 'utf8');
  const css = page.match(/<style id="hero-css">([\s\S]*?)<\/style>/)[1];
  let body = page.match(/<!--HERO-->([\s\S]*?)<!--\/HERO-->/)[1];
  body = body.replace(/src="(shots\/[^"]+)"/g, (_, f) => `src="data:image/jpeg;base64,${b64(path.join(V2, f))}"`);
  const text = body.replace(/<p class="label">[\s\S]*?<\/p>/, '').replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"');
  const chars = [...new Set(text.replace(/\s+/g, ' '))].join('');
  return { css, body, chars };
}

async function sandollFamilies(page, chars, want) {
  if (chars.length > 100) throw new Error('글자 수 100 초과: ' + chars.length);
  const inp = page.locator('input.preview-text').first();
  await inp.click(); await inp.fill(chars); await page.keyboard.press('Enter');
  await page.waitForTimeout(8000);
  const map = await page.evaluate((text) => {
    const isSample = (el) => el.children.length === 0 && el.textContent.trim() === text.trim() && parseFloat(getComputedStyle(el).fontSize) > 20;
    const out = {};
    for (const el of [...document.querySelectorAll('body *')].filter(isSample)) {
      let row = el.parentElement;
      while (row.parentElement && [...row.parentElement.querySelectorAll('*')].filter(isSample).length === 1) row = row.parentElement;
      const lab = (row.innerText || '').split('\n').map((t) => t.trim()).filter((t) => t && t !== text.trim())[0] || '';
      if (lab && !out[lab]) out[lab] = getComputedStyle(el).fontFamily;
    }
    return out;
  }, chars);
  const fam = {};
  for (const [role, lab] of Object.entries(want)) { if (!map[lab]) throw new Error(`스타일 ${lab} 없음: ${Object.keys(map)}`); fam[role] = map[lab]; }
  return fam;
}

async function inject(page, { css, body }, fam) {
  await page.evaluate(({ css, body, fam, MARU }) => {
    const st = document.createElement('style'); st.textContent = MARU; document.head.appendChild(st);
    document.documentElement.style.overflow = 'hidden'; window.scrollTo(0, 0);
    const host = document.createElement('div');
    host.style.cssText = 'position:fixed;left:0;top:0;width:1920px;height:1080px;z-index:2147483647;all:initial;position:fixed;left:0;top:0;width:1920px;height:1080px;z-index:2147483647;display:block';
    const sh = host.attachShadow({ mode: 'open' });
    sh.innerHTML = `<style>:host{all:initial} ${css} .hero{--head:${fam.head};--body:${fam.body};--ui:${fam.ui};--label:MaruBuri;${fam.hw ? '--hw:' + fam.hw + ';' : ''}}</style>${body}`;
    document.documentElement.appendChild(host);
  }, { css, body, fam, MARU });
  await page.evaluate(async (fam) => {
    const t = '한인 대표님들을 위한 웹사이트 제작 0123456789$';
    const all = [fam.head, fam.body, fam.ui, 'MaruBuri'].join(',').split(',').map((s) => s.trim());
    await Promise.all(all.map((f) => document.fonts.load(`40px ${f}`, t).catch(() => {})));
    await document.fonts.ready;
  }, fam);
  await page.waitForTimeout(1500);
}

(async () => {
  const drafts = JSON.parse(fs.readFileSync(path.join(V2, 'drafts.json'), 'utf8'));
  const only = process.argv.slice(2);
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const log = {};
  for (const [n, d] of Object.entries(drafts)) {
    if (only.length && !only.includes(n)) continue;
    const src = SOURCES[d.fonts];
    const page = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, locale: 'ko-KR' });
    try {
      const parsed = parse(n);
      if (src.local) await page.goto('about:blank');
      else { await page.goto(src.url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(7000); }
      const fam = src.sandoll ? await sandollFamilies(page, parsed.chars, src.sandoll) : src.fam;
      await inject(page, parsed, fam);
      const out = path.join(OUT, `hero-${n}_1920x1080.png`);
      await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1920, height: 1080 } });
      log[n] = { name: d.name, font: src.credit, source: src.url || 'local OFL', chars: parsed.chars.length };
      console.log('ok', n, d.name, src.credit);
    } catch (err) { console.log('FAIL', n, err.message.split('\n')[0]); }
    await page.close();
  }
  const lf = path.join(OUT, 'capture-log.json');
  const prev = fs.existsSync(lf) ? JSON.parse(fs.readFileSync(lf, 'utf8')) : {};
  fs.writeFileSync(lf, JSON.stringify({ ...prev, ...log }, null, 1));
  await b.close();
})();
