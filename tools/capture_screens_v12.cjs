// 12차 화면 캡처: drafts/v12/screens/*.html → drafts/v7/screens/out/*.png
// 휴대폰 장면은 PC 화면을 그대로 줄이지 않고, 실제 작업물 요소(사진·로고·문구)로 모바일 레이아웃을 다시 짠 페이지를 390×844 @3x로 캡처
// 실행: NODE_PATH=/opt/node22/lib/node_modules node tools/capture_screens_v7.cjs
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const DIR = path.resolve(__dirname, '../drafts/v12/screens');
const JOBS = [
  ['chat-mobile', 390, 844, 3], ['blooming-mobile', 390, 844, 3], ['dongdaemun-mobile', 390, 844, 3],
  ['chillenq-desktop', 1920, 1080, 1], ['insert-a', 1920, 1080, 1], ['insert-b', 1920, 1080, 1], ['studio-work', 1920, 1080, 1], ['ddm-sign', 2400, 750, 1], ['chillenq-laptop', 1920, 1200, 1], ['chemilife-mobile', 390, 844, 3],
];
(async () => {
  fs.mkdirSync(path.join(DIR, 'out'), { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [n, w, h, s] of JOBS) {
    const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: s });
    await p.goto('file://' + path.join(DIR, n + '.html'), { waitUntil: 'networkidle' });
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
    await p.waitForTimeout(400);
    await p.screenshot({ path: path.join(DIR, 'out', n + '.png') });
    console.log('ok', n);
    await p.close();
  }
  await b.close();
})();
