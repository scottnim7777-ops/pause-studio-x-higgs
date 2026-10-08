import { initHero } from './ts/hero';
import { initAutoVideos, initCalc, initEmail, initHeader, initLightbox, initMenu, initReveal, initWorkHover } from './ts/ui';
import { initConsult } from './ts/consult';

declare global { interface Window { __ps?: boolean } }
window.__ps = true; // index.html의 안전장치: 스크립트가 실행됐음을 알림

const safe = (name: string, f: () => void) => {
  try { f(); } catch (err) { console.error(`[${name}]`, err); }
};

safe('header', initHeader);
safe('menu', initMenu);
safe('consult', initConsult);
safe('lightbox', initLightbox);
safe('calc', initCalc);
safe('email', initEmail);
safe('work', initWorkHover);
safe('videos', initAutoVideos);
safe('reveal', initReveal);
safe('hero', () => initHero(() => { /* 인트로가 끝나면 html.intro-done */ }));
// 히어로에서 오류가 나도 내용이 가려진 채로 남지 않게
setTimeout(() => document.documentElement.classList.add('intro-done'), 6000);
