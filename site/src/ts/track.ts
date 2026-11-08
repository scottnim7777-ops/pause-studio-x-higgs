/**
 * 방문 기록(2026-11-09 사용자: 광고 글을 보고 몇 명이 어디서 들어왔는지 /admin 에서 보고 싶음) — 서버 /api/t 로 보냄
 * - 쿠키를 쓰지 않음. 이 브라우저의 무작위 표시(ps_v)로 같은 사람의 재방문만 알아봄. 이름·연락처·IP는 보내지 않음
 * - 페이지를 열 때 1번(어디서 왔는지), 창을 닫거나 다른 앱으로 갈 때(머문 시간·스크롤·본 섹션), 연락 버튼을 누를 때
 * - 관리자 화면에서 '이 기기 제외'를 켠 브라우저(ps_me)와 자동 프로그램은 보내지 않음
 */
type Payload = Record<string, unknown>;

const store = (s: Storage | undefined, k: string, v?: string) => {
  try { if (v === undefined) return s?.getItem(k) ?? null; s?.setItem(k, v); } catch { /* 사생활 보호 모드 등 */ }
  return null;
};
const rid = () => Array.from(crypto.getRandomValues(new Uint8Array(9)), (b) => (b % 36).toString(36)).join('');
const off = () => navigator.webdriver || store(localStorage, 'ps_me') === '1';

let sid = '', vid = '';
function ids() {
  if (sid) return;
  // 한 번의 방문: 같은 탭에서 30분 넘게 아무 일이 없으면 새 방문
  const now = Date.now(), last = Number(store(sessionStorage, 'ps_st') || 0);
  sid = (now - last < 30 * 60 * 1000 && store(sessionStorage, 'ps_s')) || rid();
  store(sessionStorage, 'ps_s', sid);
  store(sessionStorage, 'ps_st', String(now));
}

function send(k: string, data: Payload) {
  if (off()) return;
  ids();
  store(sessionStorage, 'ps_st', String(Date.now()));
  const body = JSON.stringify({ k, s: sid, v: vid, p: location.pathname, ...data });
  try {
    if (navigator.sendBeacon?.('/api/t', body)) return;
  } catch { /* 아래로 */ }
  fetch('/api/t', { method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'text/plain' } }).catch(() => {});
}

/** 연락으로 이어진 행동(상담 신청 완료 등) */
export const goal = (g: string) => send('goal', { g });

export function initTrack() {
  if (off()) return;
  let nv = false;
  vid = store(localStorage, 'ps_v') || '';
  if (!vid) { vid = rid(); nv = true; store(localStorage, 'ps_v', vid); }

  const u = new URL(location.href);
  const q: Record<string, string> = {};
  for (const key of ['source', 'medium', 'campaign', 'content', 'term']) {
    const v = u.searchParams.get(`utm_${key}`);
    if (v) q[key] = v;
  }
  const has = (k: string) => u.searchParams.has(k);
  const click = has('gclid') || has('gbraid') || has('wbraid') ? 'google' : has('fbclid') ? 'meta' : has('msclkid') ? 'microsoft' : has('ttclid') ? 'tiktok' : '';
  let ref = document.referrer;
  try { if (ref && new URL(ref).host === location.host) ref = ''; } catch { ref = ''; }
  // 같은 방문 안에서 다른 페이지로 옮긴 경우 출처는 첫 페이지 것을 씀(서버도 방문의 첫 페이지 기준으로 셈)
  send('pv', {
    nv, ref, q, click, l: navigator.language, tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    sw: screen.width, touch: navigator.maxTouchPoints > 1,
  });

  // 머문 시간(화면을 보고 있던 시간만) · 가장 깊이 내린 곳 · 본 섹션
  let active = 0, since = document.visibilityState === 'visible' ? performance.now() : 0, maxSc = 0;
  const seen = new Set<string>(), sentSecs = new Set<string>();
  const measure = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    maxSc = Math.max(maxSc, h > 0 ? Math.round((scrollY / h) * 100) : 100);
  };
  addEventListener('scroll', measure, { passive: true });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((list) => list.forEach((en) => { if (en.isIntersecting) { seen.add((en.target as HTMLElement).id); io.unobserve(en.target); } }), { threshold: 0, rootMargin: '-35% 0px -35% 0px' });
    document.querySelectorAll<HTMLElement>('main section[id], section[id]').forEach((s) => io.observe(s));
  }
  const flush = () => {
    if (since) { active += performance.now() - since; since = 0; }
    measure();
    const secs = [...seen].filter((x) => !sentSecs.has(x));
    const dur = Math.round(active / 1000);
    if (!dur && !secs.length) return;
    secs.forEach((x) => sentSecs.add(x));
    active = 0;
    send('leave', { dur, sc: maxSc, secs });
  };
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
    else since = performance.now();
  });
  addEventListener('pagehide', flush);

  // 연락 버튼(카카오톡·WhatsApp·메일·전화·상담 창 열기)
  document.addEventListener('click', (ev) => {
    const a = (ev.target as Element | null)?.closest?.('a, button');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const g = /open\.kakao\.com|pf\.kakao\.com/.test(href) ? 'kakao' : /wa\.me|whatsapp/.test(href) ? 'whatsapp'
      : href.startsWith('mailto:') || a.hasAttribute('data-email-user') ? 'email' : href.startsWith('tel:') ? 'phone'
        : a.hasAttribute('data-consult') ? 'consult_open' : '';
    if (g) goal(g);
  }, { capture: true });
}
