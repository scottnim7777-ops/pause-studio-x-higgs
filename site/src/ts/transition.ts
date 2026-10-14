/**
 * 페이지 전환(2026-10-14 사용자: 머리줄을 눌렀을 때 스크롤이 쭉 내려가는 건 허접 → 로고 애니메이션을 쓴 멋진 전환):
 * 화면 전체를 검은 막이 아래에서 위로 덮고(0.4초), 그 안에서 머리줄과 같은 로고가 그려지는 동안(두 고리 + 글자가 한 자씩) 보이지 않게 목적지로 건너뛰고,
 * 로고가 완성되면 막이 위로 걷힘(0.5초). 쓰는 곳: 머리줄·메뉴·푸터·본문의 #섹션 링크, 언어 전환(한국어 ↔ 영어: 다음 페이지가 덮인 채 열렸다가 걷힘).
 * 동작 줄이기·새 탭(⌘/Ctrl 클릭)은 전환 없이 바로. 막 마크업은 render/page.ts transitionOverlay(), 모양은 main.css '페이지 전환'.
 * 언어 자동 선택(브라우저 언어가 한국어가 아니면 /en)은 index.template.html 머리의 작은 스크립트가 그림이 나오기 전에 처리하고, 여기서는 안내 표시만.
 */
import { motion } from './motion';
import { T } from './i18n';

const $ = <E extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<E>(s);
const $$ = <E extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<E>(s)];
const root = document.documentElement;
const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
const COVER = 420, DRAW = 540, LIFT = 560;

let busy = false;

/** 막이 덮이고 로고가 그려진 뒤(약 1초) mid()를 실행하고, 이어서 막을 걷음. mid가 페이지를 떠나는 일이면 걷지 않음(return 'leave') */
async function curtain(mid: () => void | 'leave') {
  const pt = $('.pt');
  if (!pt || busy) { mid(); return; }
  busy = true;
  pt.classList.remove('lift', 'play');
  void pt.getBoundingClientRect();
  pt.classList.add('cover');
  await wait(120);
  pt.classList.add('play');
  await wait(COVER - 120);
  const r = mid();
  if (r === 'leave') return; // 새 페이지가 열리는 중 — 막은 덮인 채 둠(새 페이지가 걷음)
  await wait(DRAW);
  pt.classList.remove('cover');
  pt.classList.add('lift');
  await wait(LIFT);
  pt.classList.remove('lift', 'play');
  busy = false;
  document.dispatchEvent(new Event('ps:resume')); // 광고 샘플 영상 등을 이어서 재생
}

/** 새 페이지가 덮인 채 열렸다면(html.pt-hold) 로고를 잠깐 보여 준 뒤 걷음 */
async function openCurtain() {
  const pt = $('.pt');
  if (!pt || !root.classList.contains('pt-hold')) return;
  pt.classList.add('play', 'done');
  await wait(260);
  pt.classList.add('lift');
  await wait(LIFT);
  root.classList.remove('pt-hold');
  pt.classList.remove('lift', 'play', 'done');
  document.dispatchEvent(new Event('ps:resume'));
}

function jumpTo(hash: string) {
  const el = hash === '#top' ? document.body : $(hash);
  root.style.scrollBehavior = 'auto';
  if (hash === '#top' || !el) window.scrollTo(0, 0);
  else {
    const hh = parseFloat(getComputedStyle(root).getPropertyValue('--header-h')) || 0;
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - hh + 1);
  }
  history.pushState(null, '', hash === '#top' ? location.pathname + location.search : hash);
  if (el && el !== document.body) { el.setAttribute('tabindex', '-1'); (el as HTMLElement).focus({ preventScroll: true }); }
  root.style.scrollBehavior = '';
}

export function initTransition() {
  // 뒤로 가기로 돌아왔을 때 막이 덮인 채 남지 않게
  addEventListener('pageshow', (e) => {
    if (e.persisted) { busy = false; root.classList.remove('pt-hold'); $('.pt')?.classList.remove('cover', 'lift', 'play', 'done'); }
  });
  void openCurtain();

  // 1) 같은 페이지 안 #섹션 링크
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    if (!a || a.hasAttribute('data-consult') || a.classList.contains('skip')) return;
    const hash = a.getAttribute('href') || '';
    if (hash.length < 2 || (hash !== '#top' && !$(hash))) return;
    e.preventDefault();
    if (motion.reduced) { jumpTo(hash); return; }
    void curtain(() => { jumpTo(hash); });
  });

  // 2) 언어 전환: 선택을 기억(다음에 오면 그 언어로) + 막이 덮은 뒤 이동
  $$<HTMLAnchorElement>('.lang a.lg-opt').forEach((a) => a.addEventListener('click', (e) => {
    try { localStorage.setItem('ps-lang', a.lang); } catch { /* 저장 불가여도 이동은 됨 */ }
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    if (a.classList.contains('on')) { e.preventDefault(); return; }
    e.preventDefault();
    const href = a.href;
    if (motion.reduced) { location.href = href; return; }
    try { sessionStorage.setItem('ps-pt', '1'); } catch { /* 없어도 이동은 됨 */ }
    void curtain(() => { location.href = href; return 'leave'; });
  }));

  // 3) 언어 링크의 #섹션을 지금 보는 곳으로(눌러도 보던 자리에서 이어 봄)
  const links = $$<HTMLAnchorElement>('.lang a.lg-opt');
  const base = links.map((a) => a.getAttribute('href') || '/');
  const secs = $$('main > section[id]');
  let ticking = false;
  const update = () => {
    ticking = false;
    const line = innerHeight * 0.4;
    let cur = '';
    secs.forEach((sec) => { if (sec.getBoundingClientRect().top <= line) cur = sec.id; });
    links.forEach((a, i) => a.setAttribute('href', base[i] + (cur && cur !== 'top' ? `#${cur}` : '')));
  };
  if (links.length) {
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  // 4) 자동으로 영어 페이지를 보여 준 경우: 한국어로 돌아갈 길을 알림(머리 스크립트가 sessionStorage 'ps-auto')
  let auto = false;
  try { auto = sessionStorage.getItem('ps-auto') === '1'; sessionStorage.removeItem('ps-auto'); } catch { /* 안내만 생략 */ }
  const ko = $<HTMLAnchorElement>('.lang-hd a[lang="ko"]');
  if (auto && ko && T.lang === 'en') {
    const n = document.createElement('div');
    n.className = 'lang-toast';
    n.setAttribute('role', 'status');
    const t = document.createElement('span');
    t.textContent = T.autoNote;
    const link = document.createElement('a');
    link.href = ko.getAttribute('href') || '/';
    link.lang = 'ko';
    link.textContent = '한국어';
    link.addEventListener('click', () => { try { localStorage.setItem('ps-lang', 'ko'); } catch { /* */ } });
    n.append(t, link);
    document.body.append(n);
    window.setTimeout(() => n.classList.add('on'), 900);
    window.setTimeout(() => n.classList.remove('on'), 9000);
    window.setTimeout(() => n.remove(), 9800);
  }
}
