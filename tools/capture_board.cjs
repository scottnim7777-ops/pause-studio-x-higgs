// 보드 HTML → PNG (전체 페이지)
const { chromium } = require('playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const jobs = {
    heroes: [['drafts/board/board.html', 'drafts/board/PAUSE_hero_drafts_board.png', 3520], ['drafts/board/logos.html', 'drafts/board/PAUSE_logo_sheet.png', 2400]],
    fonts: [['drafts/fonts/board.html', 'drafts/fonts/PAUSE_font_candidates.png', 2400]],
    v2: [['drafts/v2/board.html', 'drafts/v2/PAUSE_hero_drafts_v2_board.png', 3520]],
    v4: [['drafts/v4/board.html', 'drafts/v4/PAUSE_v4_storyboard.png', 3000]],
    v5: [['drafts/v5/board.html', 'drafts/v5/PAUSE_v5_storyboard.png', 3000]],
    v6: [['drafts/v6/board.html', 'drafts/v6/PAUSE_v6_storyboard.png', 3000]],
    v7: [['drafts/v7/board.html', 'drafts/v7/PAUSE_v7_storyboard.png', 3000]],
    v8: [['drafts/v8/board.html', 'drafts/v8/PAUSE_v8_storyboard.png', 3000]],
    v9: [['drafts/v9/board.html', 'drafts/v9/PAUSE_v9_storyboard.png', 3000]],
    v10: [['drafts/v10/board.html', 'drafts/v10/PAUSE_v10_storyboard.png', 3000]],
    v11: [['drafts/v11/board.html', 'drafts/v11/PAUSE_v11_storyboard.png', 3000]],
    v12: [['drafts/v12/board.html', 'drafts/v12/PAUSE_v12_storyboard.png', 3000]],
    v13: [['drafts/v13/board.html', 'drafts/v13/PAUSE_v13_storyboard.png', 3000]],
    v14: [['drafts/v14/board.html', 'drafts/v14/PAUSE_v14_storyboard.png', 3000]],
  };
  const which = process.argv[2] || 'heroes'; // 실행: node tools/capture_board.cjs [heroes|fonts|v2|v4|v5|v6|v7|v8|v9|v10|v11|v12|v13|v14]
  for (const [f, out, w] of jobs[which]) {
    const p = await b.newPage({ viewport: { width: w, height: 1000 }, deviceScaleFactor: 1 });
    await p.goto('file://' + path.join(ROOT, f));
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); });
    await p.screenshot({ path: path.join(ROOT, out), fullPage: true });
    console.log(out);
  }
  await b.close();
})();
