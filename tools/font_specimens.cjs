// 한글 폰트 후보 견본 캡처 — 폰트 회사 공식 페이지의 테스터 글꼴로 우리 원문을 같은 레이아웃에 조판해 캡처한다.
// 폰트 파일은 내려받지 않는다(페이지가 테스터용으로 불러온 웹폰트를 그 페이지 안에서만 사용).
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/font_specimens.cjs [id...]
// 결과: drafts/fonts/specimens/<id>.png (1600×640) + specimens.json(사용한 스타일 기록)
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'drafts/fonts/specimens');
const content = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/site-content.ko.json'), 'utf8'));
const { hero, contact } = content;
const LINES = {
  head1: '한인 대표님들을 위한',
  head2: '웹사이트 제작',
  sub: hero.sub,
  pill: hero.pill,
  cta1: contact.cta_primary.label,
  cta2: contact.cta_secondary.label,
};
if (LINES.head1 + ' ' + LINES.head2 !== hero.headline) throw new Error('헤드라인 원문 불일치: ' + hero.headline);
const CHARS = [...new Set([...Object.values(LINES).join('') + '→ '])].join('');

const SPECS = [
  { id: 'favorit-hangul', url: 'https://abcdinamo.com/typefaces/favorit-hangul', mode: 'direct',
    head: "'fv-hgl-md-A','fv-hgl-md-B'", body: "'fv-hgl-rg-A','fv-hgl-rg-B'", cta: "'fv-hgl-md-A','fv-hgl-md-B'", styles: 'Medium / Regular' },
  { id: 'ortank-hangeul', url: 'https://www.lo-ol.design/catalog/ortank-hangeul', mode: 'direct',
    head: "'Ortank Hangeul'", headVar: "'opsz' 900, 'slnt' 0, 'wdth' 900, 'wght' 700",
    body: "'Ortank Hangeul'", bodyVar: "'opsz' 600, 'slnt' 0, 'wdth' 900, 'wght' 400",
    cta: "'Ortank Hangeul'", ctaVar: "'opsz' 600, 'slnt' 0, 'wdth' 900, 'wght' 600", styles: 'wght 700 / 400' },
  { id: 'ag-choijeongho-minburi-screen', url: 'https://agfont.com/fonts/ag-choijeongho-minburi-screen', mode: 'direct',
    head: "'AG Choijeongho Minburi Screen'", body: "'AG Choijeongho Minburi Screen'", cta: "'AG Choijeongho Minburi Screen'", styles: 'Regular (단일 굵기)' },
  { id: 'sd-greta-sans', url: 'https://www.sandollcloud.com/font/18013.html', mode: 'sandoll', head: '13 Sb', body: '09 Rg', cta: '11 Md' },
  { id: 'sd-gyeokdong-gothic2', url: 'https://www.sandollcloud.com/font/15556/Sandoll-GyeokdongG2', mode: 'sandoll', head: null, body: null, cta: null },
  { id: 'sd-gyeokdong-myeongjo2', url: 'https://www.sandollcloud.com/font/18510/SD-Gyeokdong-MJ2', mode: 'sandoll', head: '09 Sb', body: '07 Lt', cta: '08 Rg' },
  { id: 'sd-minburi', url: 'https://www.sandollcloud.com/font/20811/SD-Minburi-Space3', mode: 'sandoll', head: null, body: null, cta: null },
  { id: 'sd-jeongche', url: 'https://www.sandollcloud.com/font/21615/SD-Jeongche', mode: 'sandoll', head: '690', body: '630', cta: '690' },
  { id: 'maru-buri', url: 'https://www.sandollcloud.com/free-font/16193/Maru-Buri', mode: 'sandoll', head: null, body: null, cta: null },
  { id: 'eulyoo1945', url: 'https://www.sandollcloud.com/font/16639.html', mode: 'sandoll', head: null, body: null, cta: null },
  { id: 'sandoll-gothic-neo1', url: 'https://www.sandollcloud.com/font/8/Sandoll-GothicNeo1', mode: 'sandoll', head: null, body: null, cta: null },
];

// 스타일 이름에서 제목·본문·버튼용 행을 고른다(행 이름 예: "07 Bd", "13 Rg Ex").
function chooseRows(labels) {
  if (labels.every((l) => /^\d{3}$/.test(l))) { // 숫자 굵기 이름(예: 100~900)
    const near = (w) => labels.slice().sort((a, b) => Math.abs(a - w) - Math.abs(b - w))[0];
    return { head: near(600), body: near(400), cta: near(500) };
  }
  const plain = labels.filter((l) => !/ (It|Cn|Ex|Cd|Et)\b/.test(l));
  const find = (...keys) => { for (const k of keys) { const hit = plain.find((l) => new RegExp('(^|\\d\\d )' + k + '$').test(l)); if (hit) return hit; } return null; };
  return {
    head: find('Sb', 'SB', 'SemiBold', 'Md', 'Medium', 'M', 'Bd', 'Bold', 'B') || plain[Math.floor(plain.length * 0.6)],
    body: find('Rg', 'Regular', 'R', 'Lt', 'Light', 'L') || plain[Math.floor(plain.length * 0.4)],
    cta: find('Md', 'Medium', 'M', 'Sb', 'SemiBold', 'Rg', 'Regular') || plain[Math.floor(plain.length * 0.5)],
  };
}

async function overlay(page, f) {
  await page.evaluate(({ L, f }) => {
    document.getElementById('__spec')?.remove();
    const d = document.createElement('div');
    d.id = '__spec';
    d.innerHTML = `
      <div class="h" style="font-family:${f.head};font-variation-settings:${f.headVar || 'normal'}">${L.head1}<br>${L.head2}</div>
      <div class="s" style="font-family:${f.body};font-variation-settings:${f.bodyVar || 'normal'}">${L.sub}</div>
      <div class="p" style="font-family:${f.body};font-variation-settings:${f.bodyVar || 'normal'}">${L.pill}</div>
      <div class="c" style="font-family:${f.cta};font-variation-settings:${f.ctaVar || 'normal'}"><span class="b1">${L.cta1} →</span><span class="b2">${L.cta2}</span></div>`;
    const st = document.createElement('style');
    st.textContent = `#__spec{position:fixed;left:0;top:0;width:1600px;height:640px;z-index:2147483647;background:#F2F0EB;color:#141414;padding:66px 84px;box-sizing:border-box;text-align:left;font-synthesis:none;-webkit-font-smoothing:antialiased;word-break:keep-all}
      #__spec *{all:revert;font-synthesis:none}
      #__spec .h{display:block;font-size:96px;line-height:1.14;letter-spacing:-0.02em;font-weight:400;margin:0}
      #__spec .s{display:block;font-size:27px;line-height:1.6;letter-spacing:-0.005em;margin:34px 0 0;font-weight:400}
      #__spec .p{display:block;font-size:21px;line-height:1.5;margin:14px 0 0;color:#555;font-weight:400}
      #__spec .c{display:flex;gap:18px;margin:40px 0 0;font-size:22px;font-weight:400}
      #__spec .b1{display:inline-block;background:#141414;color:#F2F0EB;padding:17px 26px}
      #__spec .b2{display:inline-block;border:1.5px solid #141414;padding:15.5px 24px}`;
    d.appendChild(st);
    document.documentElement.appendChild(d);
  }, { L: LINES, f });
  await page.evaluate(async (f) => {
    const fams = [f.head, f.body, f.cta].join(',').split(',').map((s) => s.trim()).filter(Boolean);
    const txt = document.getElementById('__spec').innerText;
    await Promise.all(fams.map((fam) => document.fonts.load(`40px ${fam}`, txt).catch(() => {})));
    await document.fonts.ready;
  }, f);
  await page.waitForTimeout(1200);
}

async function sandollFamilies(page, spec) {
  const inp = page.locator('input.preview-text').first();
  const maxlen = await inp.getAttribute('maxlength');
  await inp.click();
  await inp.fill(CHARS);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(7000);
  const rows = await page.evaluate((text) => {
    const out = {};
    const isSample = (el) => el.children.length === 0 && el.textContent.trim() === text.trim() && parseFloat(getComputedStyle(el).fontSize) > 20;
    const samples = [...document.querySelectorAll('body *')].filter(isSample);
    for (const el of samples) {
      // 견본 하나만 담은 가장 큰 조상 = 한 행. 그 행에서 견본 문구가 아닌 첫 줄이 스타일 이름.
      let row = el.parentElement;
      while (row.parentElement && [...row.parentElement.querySelectorAll('*')].filter(isSample).length === 1) row = row.parentElement;
      const lab = (row.innerText || '').split('\n').map((t) => t.trim()).filter((t) => t && t !== text.trim())[0] || '';
      if (/^(\d\d \S.*|\d{3}|[A-Za-z][A-Za-z ]{1,20})$/.test(lab) && !out[lab]) out[lab] = getComputedStyle(el).fontFamily;
    }
    return out;
  }, CHARS);
  const labels = Object.keys(rows);
  const auto = chooseRows(labels);
  const use = { head: spec.head || auto.head, body: spec.body || auto.body, cta: spec.cta || auto.cta };
  return { maxlen, labels, use, fam: { head: rows[use.head], body: rows[use.body], cta: rows[use.cta] } };
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const only = process.argv.slice(2);
  const logFile = path.join(OUT, 'specimens.json');
  const log = fs.existsSync(logFile) ? JSON.parse(fs.readFileSync(logFile, 'utf8')) : {};
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const spec of SPECS) {
    if (only.length && !only.includes(spec.id)) continue;
    const page = await browser.newPage({ viewport: { width: 1600, height: 1000 }, locale: 'ko-KR' });
    try {
      await page.goto(spec.url, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForTimeout(7000);
      let f = spec; let note = spec.styles || '';
      if (spec.mode === 'sandoll') {
        const r = await sandollFamilies(page, spec);
        if (!r.fam.head || !r.fam.body) throw new Error('미리보기 글꼴을 찾지 못함: ' + JSON.stringify(r.labels));
        f = { head: r.fam.head, body: r.fam.body, cta: r.fam.cta || r.fam.body };
        note = `${r.use.head} / ${r.use.body} / ${r.use.cta}`;
        log[spec.id + ':rows'] = r.labels;
      }
      await overlay(page, f);
      const out = path.join(OUT, spec.id + '.png');
      await page.screenshot({ path: out, clip: { x: 0, y: 0, width: 1600, height: 640 } });
      log[spec.id] = { url: spec.url, styles: note, captured: new Date().toISOString() };
      console.log('ok', spec.id, note);
    } catch (e) {
      console.log('FAIL', spec.id, e.message.split('\n')[0]);
    }
    await page.close();
  }
  fs.writeFileSync(logFile, JSON.stringify(log, null, 1));
  await browser.close();
})();
