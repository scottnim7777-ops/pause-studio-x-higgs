/**
 * 접근성 자동 점검(axe-core, WCAG 2.1 A·AA): node tests/a11y.cjs [http://localhost:3000]
 * 첫 화면·상담 창(열린 상태)·크게 보기 창을 PC와 모바일 폭에서 검사한다.
 * Playwright: NODE_PATH=/opt/node22/lib/node_modules
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE = process.argv[2] || 'http://localhost:3000';
const AXE = fs.readFileSync(path.join(__dirname, '../node_modules/axe-core/axe.min.js'), 'utf8');
const exe = fs.existsSync('/opt/pw-browsers/chromium-1194/chrome-linux/chrome') ? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' : undefined;

async function audit(p, label, include) {
  await p.addScriptTag({ content: AXE });
  const r = await p.evaluate(async (include) => {
    // eslint-disable-next-line no-undef
    const res = await axe.run(include ? { include: [include] } : document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] } });
    return res.violations.map((v) => ({ id: v.id, impact: v.impact, help: v.help, n: v.nodes.length, sample: v.nodes.slice(0, 3).map((x) => x.target.join(' ')) }));
  }, include);
  console.log(`\n[${label}] 위반 ${r.length}종`);
  r.forEach((v) => console.log(`  - ${v.impact} ${v.id} ×${v.n}: ${v.help}\n      ${v.sample.join(' | ')}`));
  return r;
}

(async () => {
  const b = await chromium.launch({ executablePath: exe });
  let total = 0;
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const ctx = await b.newContext({ viewport: vp, reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto(BASE, { waitUntil: 'networkidle' });
    await p.waitForTimeout(500);
    total += (await audit(p, `${vp.width} 전체 페이지`)).length;
    await p.click('.hero [data-consult]');
    await p.waitForSelector('#consult[open]');
    total += (await audit(p, `${vp.width} 상담 창`, '#consult')).length;
    await p.keyboard.press('Escape');
    await p.click('[data-work="0"]');
    await p.waitForSelector('#lightbox[open]');
    total += (await audit(p, `${vp.width} 크게 보기`, '#lightbox')).length;
    await ctx.close();
  }
  await b.close();
  console.log(`\n합계 위반 ${total}종`);
  process.exit(total ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
