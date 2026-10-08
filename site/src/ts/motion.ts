/**
 * 움직임 설정 한 곳: 운영체제의 '동작 줄이기' + 사이트의 '움직임 멈추기' 버튼(기억됨)
 * 자동으로 움직이는 것(작업물 벽, 자동 재생 영상)은 모두 이 상태를 따른다.
 */
const reduceMq = matchMedia('(prefers-reduced-motion: reduce)');
const KEY = 'ps-motion';

function stored(): boolean {
  try { return localStorage.getItem(KEY) === 'paused'; } catch { return false; }
}

let paused = stored();
const subs = new Set<(paused: boolean) => void>();

export const motion = {
  /** 운영체제에서 동작 줄이기를 켰는지 */
  get reduced() { return reduceMq.matches; },
  /** 사용자가 사이트에서 움직임을 멈췄는지 */
  get paused() { return paused; },
  /** 자동으로 움직여도 되는지 */
  get allowed() { return !reduceMq.matches && !paused; },
  setPaused(v: boolean) {
    paused = v;
    try { if (v) localStorage.setItem(KEY, 'paused'); else localStorage.removeItem(KEY); } catch { /* 저장 불가(사생활 보호 모드 등) — 이번 방문에만 적용 */ }
    subs.forEach((f) => f(v));
  },
  subscribe(f: (paused: boolean) => void) { subs.add(f); return () => subs.delete(f); },
};

reduceMq.addEventListener('change', () => subs.forEach((f) => f(paused)));

/** CSS용 표시: 자동 움직임을 멈춰야 하면 html.still (커서 깜빡임·큰 글자 흐름 등) */
const syncStill = () => document.documentElement.classList.toggle('still', !motion.allowed);
syncStill();
motion.subscribe(syncStill);

/** 데이터 절약 모드(모바일 등)에서는 영상을 미리 받지 않는다 */
export const saveData = (): boolean => {
  const c = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  return !!c?.saveData;
};
