/**
 * 화면 동작: 머리줄·모바일 메뉴·등장 움직임·작업물 크게 보기·자동 재생 영상·관리비 계산기·이메일 보기·서명
 */
import { motion, saveData } from './motion';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const pad = (n: number) => String(n).padStart(2, '0');

/* ── 머리줄: 내려가면 배경이 깔림 */
export function initHeader() {
  const hd = $('[data-header]');
  if (!hd) return;
  const on = () => hd.classList.toggle('scrolled', scrollY > 24);
  addEventListener('scroll', on, { passive: true });
  on();
}

/* ── 모바일 메뉴 */
export function initMenu() {
  const btn = $<HTMLButtonElement>('[data-menu]');
  const nav = $('#mnav');
  if (!btn || !nav) return;
  const label = $('.sr', btn);
  const outside = [$('#main'), $('.ft')].filter(Boolean) as HTMLElement[];
  const set = (open: boolean, focusBtn = true) => {
    btn.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? '메뉴 닫기' : '메뉴';
    nav.hidden = !open;
    document.documentElement.classList.toggle('menu-open', open);
    outside.forEach((el) => { el.inert = open; });
    if (open) $('a', nav)?.focus();
    else if (focusBtn) btn.focus();
  };
  btn.addEventListener('click', () => set(nav.hidden));
  nav.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) set(false, false); });
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && !nav.hidden) set(false); });
  matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches && !nav.hidden) set(false, false); });
}
export const closeMenu = () => {
  const btn = $<HTMLButtonElement>('[data-menu]');
  if (btn?.getAttribute('aria-expanded') === 'true') btn.click();
};

/* ── 등장 움직임: 화면에 들어오면 한 번 */
export function initReveal() {
  const els = $$('.rv');
  if (!('IntersectionObserver' in window)) { els.forEach((el) => el.classList.add('in')); return; }
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('in');
    io.unobserve(e.target);
  }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el) => io.observe(el));

  // 서명: 보이면 그리기 시작
  const sig = $('[data-sign]');
  if (sig) {
    const so = new IntersectionObserver(([e]) => { if (e.isIntersecting) { sig.classList.add('go'); so.disconnect(); } }, { threshold: 0.3 });
    so.observe(sig);
  }
}

/* ── 자동 재생 영상(디자인 비교·영상광고 예시): 보이면 재생, 버튼으로 멈춤 */
export function initAutoVideos() {
  const vids = $$<HTMLVideoElement>('video[data-auto]');
  const state = new Map<HTMLVideoElement, { seen: boolean; userPaused: boolean; btn: HTMLButtonElement | null }>();
  const syncBtn = (v: HTMLVideoElement) => {
    const s = state.get(v)!;
    if (!s.btn) return;
    const playing = !v.paused;
    s.btn.classList.toggle('paused', !playing);
    s.btn.setAttribute('aria-label', playing ? '영상 일시정지' : '영상 재생');
  };
  const load = (v: HTMLVideoElement) => { if (!v.src && v.dataset.src) { v.src = v.dataset.src; } };
  const play = (v: HTMLVideoElement) => { load(v); v.play().catch(() => syncBtn(v)); };
  const want = (v: HTMLVideoElement) => { const s = state.get(v)!; return s.seen && !s.userPaused && motion.allowed && !saveData(); };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    state.get(v)!.seen = e.isIntersecting;
    if (want(v)) play(v); else if (!v.paused) v.pause();
  }), { threshold: 0.35 });
  vids.forEach((v) => {
    const btn = v.parentElement?.querySelector<HTMLButtonElement>('[data-vctrl]') ?? null;
    state.set(v, { seen: false, userPaused: false, btn });
    v.addEventListener('play', () => syncBtn(v));
    v.addEventListener('pause', () => syncBtn(v));
    btn?.addEventListener('click', () => {
      const s = state.get(v)!;
      if (v.paused) { s.userPaused = false; play(v); } else { s.userPaused = true; v.pause(); }
    });
    syncBtn(v);
    io.observe(v);
  });
  motion.subscribe(() => vids.forEach((v) => { if (want(v)) play(v); else if (!v.paused) v.pause(); }));
}

/* ── 포트폴리오: PC에서 마우스를 올리면 영상 재생 */
export function initWorkHover() {
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  $$<HTMLButtonElement>('.wk-btn').forEach((b) => {
    const v = $<HTMLVideoElement>('video[data-src]', b);
    if (!v) return;
    const media = v.parentElement!;
    v.addEventListener('playing', () => media.classList.add('playing'));
    const start = () => {
      if (!fine.matches || motion.reduced) return;
      if (!v.src) v.src = v.dataset.src!;
      v.play().catch(() => { /* 사진 그대로 */ });
    };
    const stop = () => { v.pause(); media.classList.remove('playing'); };
    b.addEventListener('pointerenter', start);
    b.addEventListener('pointerleave', stop);
    b.addEventListener('focus', start);
    b.addEventListener('blur', stop);
  });
}

/* ── 작업물 크게 보기 */
type Work = { ref: string; category: string; image: string; w: number; h: number; video: string };
export function initLightbox() {
  const dlg = $<HTMLDialogElement>('#lightbox');
  const dataEl = $('#work-data');
  if (!dlg || !dataEl || typeof dlg.showModal !== 'function') return;
  const items = JSON.parse(dataEl.textContent || '[]') as Work[];
  const fig = $('[data-lb-fig]', dlg)!;
  const cap = $('[data-lb-cap]', dlg)!;
  const count = $('[data-lb-count]', dlg)!;
  let idx = 0;
  let opener: HTMLElement | null = null;

  const render = () => {
    const it = items[idx];
    let media: HTMLElement;
    if (it.video) {
      const v = document.createElement('video');
      v.src = it.video; v.poster = `${it.image}.jpg`; v.muted = true; v.loop = true; v.playsInline = true; v.controls = true;
      v.width = it.w; v.height = it.h;
      v.setAttribute('aria-label', `${it.ref} ${it.category} 웹사이트 화면 녹화`);
      if (!motion.reduced) v.autoplay = true;
      media = v;
    } else {
      const pic = document.createElement('picture');
      const src = document.createElement('source');
      src.type = 'image/webp'; src.srcset = `${it.image}.webp`;
      const im = document.createElement('img');
      im.src = `${it.image}.jpg`; im.alt = `${it.ref} ${it.category} 웹사이트 화면`; im.width = it.w; im.height = it.h; im.decoding = 'async';
      pic.append(src, im);
      media = pic;
    }
    fig.replaceChildren(media);
    const r = document.createElement('span');
    r.className = 'r'; r.textContent = it.ref;
    cap.replaceChildren(r, document.createTextNode(it.category));
    count.textContent = `${pad(idx + 1)} / ${pad(items.length)}`;
    // 다음 사진 미리 받기
    const next = items[(idx + 1) % items.length];
    if (!next.video) { const pre = new Image(); pre.src = `${next.image}.jpg`; }
  };
  const go = (d: number) => { idx = (idx + d + items.length) % items.length; render(); };
  const open = (i: number, from: HTMLElement) => {
    idx = i; opener = from; render();
    dlg.showModal();
    document.documentElement.classList.add('modal-open');
  };
  dlg.addEventListener('close', () => {
    fig.replaceChildren();
    document.documentElement.classList.remove('modal-open');
    opener?.focus();
  });

  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-work]');
    if (b) open(Number(b.dataset.work), b);
  });
  $('[data-lb-close]', dlg)?.addEventListener('click', () => dlg.close());
  $('[data-lb-prev]', dlg)?.addEventListener('click', () => go(-1));
  $('[data-lb-next]', dlg)?.addEventListener('click', () => go(1));
  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
  });
  // 빈 곳을 누르면 닫기, 옆으로 밀면 넘기기
  let x0 = 0, y0 = 0, t0 = 0, moved = false;
  fig.addEventListener('pointerdown', (e) => { x0 = e.clientX; y0 = e.clientY; t0 = e.timeStamp; moved = false; });
  fig.addEventListener('pointerup', (e) => {
    const dx = e.clientX - x0, dy = e.clientY - y0;
    moved = Math.hypot(dx, dy) > 10;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && e.timeStamp - t0 < 600) go(dx < 0 ? 1 : -1);
  });
  fig.addEventListener('click', (e) => { if (e.target === fig && !moved) dlg.close(); });
}

/* ── 관리비 계산기: 입력한 견적만으로 계산(임의의 업계 평균 없음) */
export function initCalc() {
  const root = $('[data-calc]');
  if (!root) return;
  const setup = $<HTMLInputElement>('[data-c="setup"]', root)!;
  const monthly = $<HTMLInputElement>('[data-c="monthly"]', root)!;
  const years = $<HTMLInputElement>('[data-c="years"]', root)!;
  const outOther = $('[data-o="other"]', root)!;
  const outPause = $('[data-o="pause"]', root)!;
  const outYears = $('[data-o="years"]', root)!;
  const unit = (outYears.textContent || '').replace(/[\d\s]/g, '') || '년';
  const num = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0;
  const money = (n: number) => `$${n.toLocaleString('en-US')}`;
  const PAUSE_SETUP = Number(root.dataset.pauseSetup) || 0; // 문구 파일(fee.calc.pauseSetup) 값
  const calc = () => {
    const y = Number(years.value);
    const a = num(setup.value), m = num(monthly.value);
    outYears.textContent = `${y}${unit}`;
    outOther.textContent = a || m ? money(a + m * 12 * y) : '—';
    outPause.textContent = money(PAUSE_SETUP);
  };
  [setup, monthly].forEach((el) => el.addEventListener('input', () => {
    const n = num(el.value);
    el.value = n ? n.toLocaleString('en-US') : '';
    calc();
  }));
  years.addEventListener('input', calc);
  calc();
}

/* ── 이메일 주소는 누르면 보여줌(수집 프로그램이 바로 읽지 못하게) */
export function initEmail() {
  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLButtonElement>('button[data-email-user]');
    if (!b) return;
    const addr = `${b.dataset.emailUser}@${b.dataset.emailDomain}`;
    const a = document.createElement('a');
    a.href = `mailto:${addr}`;
    a.textContent = addr;
    a.className = 'reveal-btn';
    b.replaceWith(a);
    a.focus();
  });
}
