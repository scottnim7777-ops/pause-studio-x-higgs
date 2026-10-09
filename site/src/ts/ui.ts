/**
 * 화면 동작: 머리줄·모바일 메뉴·등장 움직임·포트폴리오 반복 재생·작업물 크게 보기·비교 손잡이·광고 샘플 탭
 *           ·자동 재생 영상·열고 닫는 목록·질문 탭·관리비 계산기·전화 상담·이메일 보기·스크롤에 따른 큰 글자
 * 움직임은 모두 motion(운영체제 '동작 줄이기')을 따른다.
 */
import { motion, saveData } from './motion';
import { steps } from './hangul';

const $ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => r.querySelector<T>(s);
const $$ = <T extends Element = HTMLElement>(s: string, r: ParentNode = document) => [...r.querySelectorAll<T>(s)];
const pad = (n: number) => String(n).padStart(2, '0');
const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);
const easeIo = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);

/** 숫자를 부드럽게 바꿈(동작 줄이기면 바로). 멈추는 함수를 돌려줌 */
function tween(from: number, to: number, ms: number, step: (v: number) => void): () => void {
  if (motion.reduced || from === to) { step(to); return () => {}; }
  const t0 = performance.now();
  let raf = requestAnimationFrame(function f(now) {
    const k = clamp01((now - t0) / ms);
    step(from + (to - from) * easeOut(k));
    if (k < 1) raf = requestAnimationFrame(f);
  });
  return () => cancelAnimationFrame(raf);
}

/** 창 닫기: 짧게 사라진 뒤 닫음(CSS .closing). Esc도 같은 움직임으로 */
export function closeDialog(dlg: HTMLDialogElement) {
  if (!dlg.open || dlg.classList.contains('closing')) return;
  if (motion.reduced) { dlg.close(); return; }
  dlg.classList.add('closing');
  let done = false;
  const fin = () => {
    if (done) return;
    done = true;
    dlg.removeEventListener('animationend', onEnd);
    dlg.classList.remove('closing');
    dlg.close();
  };
  const onEnd = (e: AnimationEvent) => { if (e.target === dlg) fin(); };
  dlg.addEventListener('animationend', onEnd);
  setTimeout(fin, 450); // 움직임이 막혀도 반드시 닫힘
}
export function animateCancel(dlg: HTMLDialogElement) {
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); closeDialog(dlg); });
}

/** 탭 목록의 방향키(←·→·Home·End) */
function rovingKeys(tabs: HTMLElement[], go: (i: number) => void) {
  tabs.forEach((t, i) => t.addEventListener('keydown', (e) => {
    const n = tabs.length;
    let j = i;
    if (e.key === 'ArrowRight') j = (i + 1) % n;
    else if (e.key === 'ArrowLeft') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    else return;
    e.preventDefault();
    go(j);
  }));
}

/* ── 머리줄: 내려가면 배경이 깔리고, 더 내려가면 숨었다가 올리면 다시 나타남. 지금 보는 장을 메뉴에 표시 */
export function initHeader() {
  const hd = $('[data-header]');
  if (!hd) return;
  const links = $$<HTMLAnchorElement>('.hd-nav a[href^="#"]:not(.hd-cta)');
  const secs = [...links.map((a) => a.getAttribute('href') || ''), '#contact'].map((h) => (h.length > 1 ? $(h) : null));
  let lastY = scrollY;
  let ticking = false;
  const update = () => {
    ticking = false;
    const y = scrollY;
    hd.classList.toggle('scrolled', y > 24);
    const dy = y - lastY;
    if (y <= 480) hd.classList.remove('hide');
    else if (Math.abs(dy) > 6) {
      hd.classList.toggle('hide', dy > 0 && !document.documentElement.classList.contains('menu-open'));
      lastY = y;
    }
    if (y <= 480) lastY = y;
    const line = innerHeight * 0.4;
    let cur = -1;
    secs.forEach((s, i) => { if (s && s.getBoundingClientRect().top <= line) cur = i; });
    links.forEach((a, i) => { if (i === cur) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
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
    $('[data-header]')?.classList.remove('hide');
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

/* ── 자동 재생 영상(비교 화면의 AFTER): 보이면 재생, 버튼으로 멈춤 */
export function initAutoVideos() {
  const vids = $$<HTMLVideoElement>('video[data-auto]:not([data-fs-video])');
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
    const btn = v.closest('[data-cmp], .media')?.querySelector<HTMLButtonElement>('[data-vctrl]') ?? null;
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

/* ── 포트폴리오: 화면 녹화는 마우스를 올리지 않아도 보이는 동안 계속 반복 재생 */
export function initWorkLoops() {
  const vids = $$<HTMLVideoElement>('video[data-loop]');
  if (!vids.length || !('IntersectionObserver' in window)) return;
  const seen = new Map<HTMLVideoElement, boolean>();
  const sync = (v: HTMLVideoElement) => {
    if (seen.get(v) && motion.allowed && !saveData()) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.play().catch(() => { /* 자동 재생이 막히면 사진 그대로 */ });
    } else if (!v.paused) v.pause();
  };
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    seen.set(v, e.isIntersecting);
    sync(v);
  }), { rootMargin: '120px 0px' });
  vids.forEach((v) => {
    v.addEventListener('playing', () => v.classList.add('on'));
    io.observe(v);
  });
  motion.subscribe(() => vids.forEach(sync));
}

/* ── 포트폴리오: 마우스를 따라오는 '보기' 원(PC) */
export function initWorkCursor() {
  const cur = $('[data-wk-cursor]');
  const grid = $('[data-work-grid]');
  if (!cur || !grid) return;
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let x = 0, y = 0, tx = 0, ty = 0, raf = 0, on = false;
  const frame = () => {
    raf = 0;
    const k = motion.reduced ? 1 : 0.2;
    x += (tx - x) * k;
    y += (ty - y) * k;
    cur.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
    if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) raf = requestAnimationFrame(frame);
  };
  const show = (v: boolean) => { if (v !== on) { on = v; cur.classList.toggle('on', v); } };
  grid.addEventListener('pointermove', (e) => {
    if (!fine.matches || e.pointerType !== 'mouse') return;
    const over = !!(e.target as Element).closest('.wk-btn');
    tx = e.clientX; ty = e.clientY;
    if (over && !on) { x = tx; y = ty; } // 그 자리에서 커지기 시작
    show(over);
    if (!raf) raf = requestAnimationFrame(frame);
  });
  grid.addEventListener('pointerleave', () => show(false));
  addEventListener('scroll', () => show(false), { passive: true });
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
  animateCancel(dlg);
  dlg.addEventListener('close', () => {
    fig.replaceChildren();
    document.documentElement.classList.remove('modal-open');
    opener?.focus();
  });

  document.addEventListener('click', (e) => {
    const b = (e.target as Element).closest<HTMLElement>('[data-work]');
    if (b) open(Number(b.dataset.work), b);
  });
  $('[data-lb-close]', dlg)?.addEventListener('click', () => closeDialog(dlg));
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
  fig.addEventListener('click', (e) => { if (e.target === fig && !moved) closeDialog(dlg); });
}

/* ── 비교: 손잡이를 끌거나(마우스·손가락) 방향키로 BEFORE ↔ AFTER. 처음 보일 때 한 번 살짝 움직여 보여 줌 */
export function initCompare() {
  $$('[data-cmp]').forEach((frame) => {
    const range = $<HTMLInputElement>('.cmp-range', frame);
    if (!range) return;
    const set = (v: number) => {
      const p = Math.max(0, Math.min(100, v));
      frame.style.setProperty('--pos', `${p.toFixed(2)}%`);
      frame.classList.toggle('at-start', p < 14);
      frame.classList.toggle('at-end', p > 86);
      const r = Math.round(p);
      range.value = String(r);
      range.setAttribute('aria-valuetext', `BEFORE ${r}%, AFTER ${100 - r}%`);
    };
    set(50);
    let stopHint = () => {};
    const touch = () => stopHint();
    range.addEventListener('input', () => { touch(); set(Number(range.value)); });
    const fromX = (cx: number) => { const r = frame.getBoundingClientRect(); return ((cx - r.left) / r.width) * 100; };
    let drag: { id: number; x0: number; moved: boolean } | null = null;
    const stop = () => { drag = null; frame.classList.remove('dragging'); };
    frame.addEventListener('pointerdown', (e) => {
      if ((e.target as Element).closest('[data-vctrl]') || e.button > 0) return;
      touch();
      const mouse = e.pointerType === 'mouse';
      drag = { id: e.pointerId, x0: e.clientX, moved: mouse };
      if (mouse) {
        e.preventDefault();
        frame.setPointerCapture(e.pointerId);
        frame.classList.add('dragging');
        set(fromX(e.clientX));
      }
    });
    frame.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) { // 손가락: 옆으로 밀 때만(위아래 스크롤은 그대로)
        if (Math.abs(e.clientX - drag.x0) < 6) return;
        drag.moved = true;
        frame.setPointerCapture(e.pointerId);
        frame.classList.add('dragging');
      }
      set(fromX(e.clientX));
    });
    frame.addEventListener('pointerup', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.moved) set(fromX(e.clientX)); // 톡 누르면 그 위치로
      stop();
    });
    frame.addEventListener('pointercancel', (e) => { if (drag && e.pointerId === drag.id) stop(); });

    // 손잡이 안내(2026-10-09 사용자): 화면에 들어오면 바로 한 번, 보이는 동안 7초마다 좌우로 살짝 움직여 끌 수 있음을 알림.
    // 지금 자리에서 출발해 제자리로 돌아오므로 사용자가 맞춘 위치는 그대로. 손대면 10초 동안 쉬고, 동작 줄이기면 하지 않음
    let lastTouch = -Infinity, visible = false, raf = 0, timer = 0;
    const hint = () => {
      cancelAnimationFrame(raf);
      if (!visible || drag || !motion.allowed || performance.now() - lastTouch < 10000) return;
      const p0 = Number(range.value) || 50;
      const K: [number, number][] = [[0, p0], [0.36, Math.max(6, p0 - 20)], [0.76, Math.min(94, p0 + 16)], [1, p0]];
      const at = (k: number) => {
        for (let i = 1; i < K.length; i++) {
          if (k <= K[i][0]) {
            const [ta, va] = K[i - 1], [tb, vb] = K[i];
            return va + (vb - va) * easeIo((k - ta) / (tb - ta));
          }
        }
        return p0;
      };
      const dur = 2200, t0 = performance.now();
      frame.classList.add('hinting');
      raf = requestAnimationFrame(function f(now) {
        const k = clamp01((now - t0) / dur);
        set(at(k));
        if (k < 1) raf = requestAnimationFrame(f);
        else frame.classList.remove('hinting');
      });
    };
    stopHint = () => { cancelAnimationFrame(raf); frame.classList.remove('hinting'); lastTouch = performance.now(); };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      clearInterval(timer);
      if (!visible) { cancelAnimationFrame(raf); frame.classList.remove('hinting'); return; }
      window.setTimeout(hint, 400);
      timer = window.setInterval(hint, 7000);
    }, { threshold: 0.5 });
    io.observe(frame);
  });
}

/* ── AI 광고영상 샘플: 탭으로 넘김. 한 편이 끝나면 다음 샘플로(보이는 동안만). 탭을 눌러 고른 뒤에도 그 영상이 끝나면 다음으로(2026-10-09 사용자).
 *    멈추려면 영상의 일시정지 단추 */
export function initFilmSamples() {
  const root = $('[data-fs]');
  if (!root) return;
  const tabs = $$<HTMLButtonElement>('[data-fs-tab]', root);
  const panels = $$<HTMLElement>('[data-fs-panel]', root);
  if (!tabs.length || tabs.length !== panels.length) return;
  const vids = panels.map((p) => $<HTMLVideoElement>('video', p)!);
  const btns = panels.map((p) => $<HTMLButtonElement>('[data-vctrl]', p));
  let cur = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
  if (cur < 0) cur = 0;
  let inView = false, userPaused = false, raf = 0;
  // 선택된 탭의 선: 재생할 수 있으면 진행률, 아니면 꽉 찬 선
  tabs[cur].style.setProperty('--prog', motion.allowed && !saveData() ? '0' : '1');
  const can = () => inView && motion.allowed && !saveData() && !userPaused;
  const syncBtn = (i: number) => {
    const b = btns[i];
    if (!b) return;
    const playing = !vids[i].paused;
    b.classList.toggle('paused', !playing);
    b.setAttribute('aria-label', playing ? '영상 일시정지' : '영상 재생');
  };
  const progress = () => {
    raf = 0;
    const v = vids[cur];
    if (v.duration) tabs[cur].style.setProperty('--prog', (v.currentTime / v.duration).toFixed(4));
    if (!v.paused) raf = requestAnimationFrame(progress);
  };
  const play = () => {
    const v = vids[cur];
    v.loop = false;
    if (can()) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.play().catch(() => syncBtn(cur));
    } else if (!v.paused) v.pause();
  };
  const select = (i: number, fromUser: boolean, focus = false) => {
    if (fromUser) userPaused = false; // 고른 샘플은 처음부터 재생, 끝나면 다음으로
    if (i !== cur) {
      vids[cur].pause();
      tabs[cur].setAttribute('aria-selected', 'false');
      tabs[cur].tabIndex = -1;
      tabs[cur].style.removeProperty('--prog');
      panels[cur].hidden = true;
      panels[cur].classList.remove('enter');
      cur = i;
      tabs[cur].setAttribute('aria-selected', 'true');
      tabs[cur].tabIndex = 0;
      tabs[cur].style.setProperty('--prog', can() ? '0' : '1');
      panels[cur].hidden = false;
      void panels[cur].offsetWidth;
      panels[cur].classList.add('enter');
      if (vids[cur].readyState > 0) vids[cur].currentTime = 0;
    }
    if (focus) tabs[cur].focus();
    play();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i, true)));
  rovingKeys(tabs, (i) => select(i, true, true));
  vids.forEach((v, i) => {
    v.addEventListener('play', () => { syncBtn(i); if (i === cur && !raf) raf = requestAnimationFrame(progress); });
    v.addEventListener('pause', () => syncBtn(i));
    v.addEventListener('ended', () => {
      if (i !== cur) return;
      if (can()) select((cur + 1) % tabs.length, false);
      else { v.currentTime = 0; play(); }
    });
    btns[i]?.addEventListener('click', () => {
      if (v.paused) { userPaused = false; play(); } else { userPaused = true; v.pause(); }
    });
    syncBtn(i);
  });
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; play(); }, { threshold: 0.35 }).observe(root);
  motion.subscribe(play);
}

/* ── 열고 닫는 목록(details[data-acc]): 높이가 부드럽게. 동작 줄이기면 기본 동작 그대로 */
export function initAccordions() {
  const dur = (h: number) => Math.min(650, Math.max(320, h * 1.1));
  $$<HTMLDetailsElement>('details[data-acc]').forEach((d) => {
    const sum = $(':scope > summary', d);
    const body = $(':scope > .acc-body', d);
    if (!sum || !body || typeof body.animate !== 'function') return;
    let anim: Animation | null = null;
    sum.addEventListener('click', (e) => {
      if (motion.reduced) return;
      e.preventDefault();
      const h = d.open ? body.getBoundingClientRect().height : 0;
      anim?.cancel();
      anim = null;
      if (!d.open || d.classList.contains('closing')) {
        d.classList.remove('closing');
        d.open = true;
        const to = body.scrollHeight;
        anim = body.animate({ height: [`${h}px`, `${to}px`] }, { duration: dur(to - h), easing: 'cubic-bezier(.2,.7,.1,1)' });
        anim.onfinish = () => { anim = null; };
      } else {
        d.classList.add('closing');
        anim = body.animate({ height: [`${h}px`, '0px'] }, { duration: dur(h) * 0.8, easing: 'cubic-bezier(.65,0,.35,1)' });
        anim.onfinish = () => { d.open = false; d.classList.remove('closing'); anim = null; };
      }
    });
  });
}

/* ── 자주 묻는 질문: 웹사이트 / AI 광고영상 탭(선택 표시가 미끄러져 이동) */
export function initFaqTabs() {
  const list = $('.faq-tabs');
  if (!list) return;
  const tabs = $$<HTMLButtonElement>('[data-faq-tab]', list);
  const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls') || ''));
  if (panels.some((p) => !p)) return;
  const place = () => {
    const t = tabs.find((x) => x.getAttribute('aria-selected') === 'true') ?? tabs[0];
    list.style.setProperty('--x', `${t.offsetLeft}px`);
    list.style.setProperty('--w', `${t.offsetWidth}px`);
  };
  const select = (i: number, focus: boolean) => {
    tabs.forEach((t, j) => {
      const on = j === i;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      panels[j]!.hidden = !on;
    });
    place();
    if (focus) tabs[i].focus();
  };
  tabs.forEach((t, i) => t.addEventListener('click', () => select(i, false)));
  rovingKeys(tabs, (i) => select(i, true));
  // 처음 위치는 움직임 없이
  list.classList.add('ready', 'instant');
  place();
  requestAnimationFrame(() => requestAnimationFrame(() => list.classList.remove('instant')));
  new ResizeObserver(place).observe(list);
  document.fonts?.ready.then(place).catch(() => {});
}

/** 가격 앞 통화 표시: 서버가 뉴질랜드 방문자에게만 html.nzd → NZD $, 그 밖은 USD $(같은 숫자, 환율 변환 없음) — ko.ts currencySymbol과 같게 */
const sym = () => (document.documentElement.classList.contains('nzd') ? 'NZD\u00A0$' : 'USD\u00A0$');

/* ── 관리비 계산기: 입력한 견적만으로 계산(임의의 업계 평균 없음). PAUSE 쪽은 고른 상품 가격.
      숫자는 세면서 바뀌고, 화면 읽기는 입력을 멈춘 뒤 결과만 */
export function initCalc() {
  const root = $('[data-calc]');
  if (!root) return;
  const setup = $<HTMLInputElement>('[data-c="setup"]', root)!;
  const monthly = $<HTMLInputElement>('[data-c="monthly"]', root)!;
  const years = $<HTMLInputElement>('[data-c="years"]', root)!;
  const plans = $$<HTMLInputElement>('input[name="calcPlan"]', root);
  const out = { other: $('[data-o="other"]', root)!, pause: $('[data-o="pause"]', root)!, save: $('[data-o="save"]', root)! };
  const pauseSetupEl = $('[data-o="setup"]', root);
  const outYears = $('[data-o="years"]', root)!;
  const bars = { other: $('[data-bar="other"]', root), pause: $('[data-bar="pause"]', root) };
  const saveBox = $('[data-save]', root);
  const live = $('[data-calc-live]', root);
  const labels = $$('.calc-out p > span:first-child, .calc-save > span', root).map((s) => s.textContent || '');
  const unit = (outYears.textContent || '').replace(/[\d\s]/g, '') || '년';
  const num = (s: string) => Number(s.replace(/[^\d]/g, '')) || 0;
  const money = (n: number) => `${sym()}${Math.round(n).toLocaleString('en-US')}`;
  const plan = () => plans.find((p) => p.checked) ?? plans[0];
  const pauseSetup = () => Number(plan()?.value) || 0;
  // 처음 숫자는 빌드 때 기본값(500 · 150 · 5년)으로 계산해 둔 그대로 → 불러올 때 세지 않음
  const other0 = num(setup.value) + num(monthly.value) * 12 * Number(years.value);
  const shown = { other: other0, pause: pauseSetup(), save: Math.max(0, other0 - pauseSetup()) };
  let touched = false; // 화면 읽기 결과 알림은 사용자가 바꾼 뒤에만
  const stops: Partial<Record<keyof typeof shown, () => void>> = {};
  const count = (k: keyof typeof shown, to: number) => {
    stops[k]?.();
    stops[k] = tween(shown[k], to, 700, (v) => { shown[k] = v; out[k].textContent = money(v); });
  };
  let liveTimer = 0;
  const calc = () => {
    const y = Number(years.value);
    const a = num(setup.value), m = num(monthly.value);
    const other = a + m * 12 * y;
    const pause = pauseSetup();
    const save = Math.max(0, other - pause);
    outYears.textContent = `${y}${unit}`;
    if (pauseSetupEl) {
      pauseSetupEl.textContent = money(pause);
      const suffix = plan()?.dataset.suffix;
      if (suffix) { const sm = document.createElement('small'); sm.textContent = suffix; pauseSetupEl.append(sm); }
    }
    count('other', other);
    count('pause', pause);
    const max = Math.max(other, pause, 1);
    bars.other?.style.setProperty('--w', other ? (other / max).toFixed(4) : '0');
    bars.pause?.style.setProperty('--w', other ? (pause / max).toFixed(4) : '0');
    if (saveBox) {
      saveBox.hidden = save <= 0;
      if (save > 0) count('save', save); else { stops.save?.(); shown.save = 0; }
    }
    clearTimeout(liveTimer);
    liveTimer = window.setTimeout(() => {
      if (!live || !touched || !(a || m)) return;
      live.textContent = `${labels[0]} ${money(other)}, ${labels[1]} ${money(pause)}${save > 0 ? `, ${labels[2]} ${money(save)}` : ''}`;
    }, 700);
  };
  // 깜빡이는 입력 표시를 숫자 바로 뒤에(값이 없으면 '금액 입력' 앞): 입력칸과 같은 글꼴의 보이지 않는 글자로 폭을 잼
  const placeCaret = (el: HTMLInputElement) => {
    const box = el.closest<HTMLElement>('.money');
    if (!box) return;
    let mirror = box.querySelector<HTMLElement>('.mirror');
    if (!mirror) { mirror = document.createElement('span'); mirror.className = 'mirror'; mirror.setAttribute('aria-hidden', 'true'); box.append(mirror); }
    mirror.textContent = el.value;
    const w = el.value ? mirror.getBoundingClientRect().width : 0;
    box.style.setProperty('--cx', `${(el.offsetLeft + w + (el.value ? 3 : 0)).toFixed(1)}px`);
  };
  const placeAll = () => [setup, monthly].forEach(placeCaret);
  let edited = false;
  [setup, monthly].forEach((el) => el.addEventListener('input', () => {
    edited = touched = true;
    const n = num(el.value);
    el.value = n ? n.toLocaleString('en-US') : '';
    placeCaret(el);
    calc();
  }));
  placeAll();
  document.fonts?.ready.then(placeAll).catch(() => {});
  addEventListener('resize', placeAll);
  years.addEventListener('input', () => { touched = true; calc(); });
  plans.forEach((p) => p.addEventListener('change', () => { touched = true; calc(); }));
  // 처음 화면에 들어오면 타사 견적 첫 칸 테두리가 두 번 빛나 '고쳐 넣을 수 있는 칸'임을 알림(2026-10-09 사용자)
  const firstBox = setup.closest('.money');
  if (firstBox && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      if (!motion.allowed || edited) return;
      window.setTimeout(() => { firstBox.classList.add('nudge'); firstBox.addEventListener('animationend', () => firstBox.classList.remove('nudge'), { once: true }); }, 500);
    }, { threshold: 0.6 });
    io.observe(firstBox);
  }
  // 통화 표시가 바뀌면(미리보기 전용 전환) 숫자도 같은 표시로
  new MutationObserver(calc).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
  calc();
}

/* ── 큰 $0의 '허리띠' 움직임(사용자): 예시 월 관리비($100)에서 세어 내려가며 숫자가 점점 홀쭉해지고(가변 글꼴 폭·굵기),
      달마다 $0이 하나씩 채워진 뒤 $0에서 허리띠가 한 번 조여짐. 빌드 결과는 마지막 모습이라 JS·움직임이 없으면 그대로 $0 */
export function initLedger() {
  const el = $('[data-ledger]');
  if (!el) return;
  const zero = $('.ledger-zero', el);
  const fig = $('.ld-fig', el);
  const numEl = $('[data-ledger-num]', el);
  if (!zero || !fig || !numEl) return;
  const months = $$('.ledger-months li', el);
  const from = Number(el.dataset.from) || 100;
  const FAT = { wd: 115, wg: 760 }, SLIM = { wd: 70, wg: 500 };
  const shape = (k: number) => { // k: 1 = 처음(두꺼움) → 0 = 끝(홀쭉)
    zero.style.setProperty('--wd', (SLIM.wd + (FAT.wd - SLIM.wd) * k).toFixed(1));
    zero.style.setProperty('--wg', (SLIM.wg + (FAT.wg - SLIM.wg) * k).toFixed(0));
  };
  const fit = () => { // 두꺼운 숫자가 칸을 넘으면 그만큼만 줄여 보여 줌
    zero.style.setProperty('--fit', '1');
    const room = zero.clientWidth - 8, w = fig.scrollWidth;
    const s = w > room && w > 0 ? room / w : 1;
    zero.style.setProperty('--fit', s.toFixed(3));
    zero.style.setProperty('--bw', `${Math.min(room, w * s)}px`);
  };
  if (motion.reduced || !('IntersectionObserver' in window)) { fit(); return; }
  el.classList.add('armed');
  numEl.textContent = String(from);
  shape(1);
  document.fonts?.ready.then(fit).catch(fit);
  fit();
  addEventListener('resize', fit);
  const run = () => {
    const dur = 2600, t0 = performance.now();
    requestAnimationFrame(function f(now) {
      const k = clamp01((now - t0) / dur);
      const v = from * (1 - easeIo(k));
      numEl.textContent = String(Math.ceil(v - 1e-6));
      shape(Math.pow(v / from, 0.85));
      months.forEach((m, i) => m.classList.toggle('on', v <= from * (1 - (i + 1) / months.length) + 1e-6));
      fit();
      if (k < 1) { requestAnimationFrame(f); return; }
      numEl.textContent = '0';
      shape(0);
      fit();
      months.forEach((m) => m.classList.add('on'));
      el.classList.add('done', 'cinch');
    });
  };
  const io = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    io.disconnect();
    setTimeout(run, 1000); // 숫자가 아래에서 올라온 뒤 시작
  }, { threshold: 0.45 });
  io.observe(el);
}

/* ── 전화 상담: 누르면 전화 걸기 · 문자 보내기 · 번호 복사 중에서 고름 */
export function initPhone() {
  const btn = $<HTMLButtonElement>('[data-phone]');
  const menu = $('[data-phone-menu]');
  if (!btn || !menu) return;
  const card = btn.closest('.ct-card') ?? btn.parentElement!;
  const set = (open: boolean) => { menu.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => set(menu.hidden));
  document.addEventListener('click', (e) => { if (!menu.hidden && !card.contains(e.target as Node)) set(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); }
  });
  const copyBtn = $<HTMLButtonElement>('[data-phone-copy]', menu);
  copyBtn?.addEventListener('click', async () => {
    const text = (btn.textContent || '').trim();
    let ok = false;
    try { await navigator.clipboard.writeText(text); ok = true; } catch {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.append(ta); ta.select();
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      ta.remove();
    }
    if (!ok) return;
    const before = copyBtn.textContent;
    copyBtn.textContent = copyBtn.dataset.copied || before;
    copyBtn.classList.add('done');
    setTimeout(() => { copyBtn.textContent = before; copyBtn.classList.remove('done'); }, 2200);
  });
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

/* ── 장 제목 큰 영문: 스크롤에 따라 오른쪽에서 들어와 제자리에(--p). 마무리 선언: 보이면 손글씨처럼 쓰고 서명 */
export function initScrub() {
  const chapters = $$('[data-scrub]');
  // 마무리 선언: 화면에 들어오면 대표가 그 자리에서 치듯 한글 자판 타이핑(생각하며 쓰는 박자, 줄 사이 쉼, 커서) → 다짐 문장 → 서명.
  // 동작 줄이기면 완성된 글을 바로(.static)
  const mf = $('[data-manifesto]');
  if (mf) {
    const type = $('[data-mf-type]', mf);
    const ghost = $('.mf-ghost', mf);
    const sig = $('.sig', mf);
    const lines: string[] = ghost?.dataset.mfLines ? JSON.parse(ghost.dataset.mfLines) : [];
    const finish = () => { mf.classList.add('static', 'go', 'typed'); sig?.classList.add('go'); };
    if (motion.reduced || !type || !lines.length || !('IntersectionObserver' in window)) finish();
    else {
      const wait = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));
      let k = 0;
      const beat = () => 62 + ((k++ * 37) % 41); // 사람 손처럼 타건마다 조금씩 다른 간격(62~102ms)
      const run = async () => {
        mf.classList.add('go');
        await wait(650);
        const caret = document.createElement('i');
        caret.className = 'caret blink';
        for (let li = 0; li < lines.length; li++) {
          const el = document.createElement('span');
          el.className = 'ln';
          const txt = document.createTextNode('');
          el.append(txt, caret);
          type.append(el);
          if (li === 0) await wait(420); // 첫 글자 전에 커서가 한 번 깜빡이고
          caret.classList.remove('blink');
          let done = '';
          for (const ch of lines[li]) {
            for (const st of steps(ch)) { txt.data = done + st; await wait(beat()); }
            done += ch;
            if (ch === ' ') await wait(120);
          }
          if (li < lines.length - 1) { caret.classList.add('blink'); await wait(560); } // 줄을 바꾸기 전 잠깐 생각
        }
        caret.classList.add('blink');
        await wait(700);
        mf.classList.add('typed');
        await wait(1200);
        sig?.classList.add('go');
        await wait(2600);
        caret.classList.add('gone');
      };
      const big = $('.mf-big', mf) ?? mf;
      const mo = new IntersectionObserver(([e]) => { if (e.isIntersecting) { mo.disconnect(); void run(); } }, { threshold: 0.5 });
      mo.observe(big);
    }
  }
  const active = new Set<Element>();
  let raf = 0;
  const frame = () => {
    raf = 0;
    const vh = innerHeight;
    active.forEach((el) => {
      const r = el.getBoundingClientRect();
      (el as HTMLElement).style.setProperty('--p', clamp01((vh - r.top) / (vh + r.height)).toFixed(4));
    });
  };
  const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) active.add(e.target); else active.delete(e.target); });
    req();
  });
  chapters.forEach((el) => io.observe(el));
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
}

/* ── 포인트(2026-10-09 사용자: '심심한 곳에 센스 있게' → '티도 안 난다'): 스크롤에 맞춰 보는 자리에서 진행된다.
 *    - 전/후 제목: 앞줄('비전에서')은 외곽선, 뒷줄('현실로')은 외곽선에서 시작해 스크롤에 따라 왼쪽부터 잉크로 채워짐(--ink)
 *    - 제작 과정: 진행 선과 점이 01 → 05로 나아가고(--p, 되감기 가능) 선이 닿은 단계가 켜지며, 끝에 도착하면 '기본 월 관리비 $0'이 채워짐
 *      PC(한 줄)는 가로 선, 휴대폰(한 칸씩)은 왼쪽 세로 선, 그 사이(3칸)는 선 없이 차례로 켜짐
 *    - 영상 제작 과정: 단계가 읽는 높이에 오면 줄마다 왼쪽부터 켜짐 · 장 소개 약속: 크림색 형광펜(한 번)
 *    html.fx가 붙어야 CSS가 움직임 전 모습을 쓰므로, 여기서 오류가 나면 완성된 모습 그대로 보인다. 동작 줄이기면 처음부터 끝난 모습. */
export function initAccents() {
  const inks = $$('[data-ink]');
  const lines = $$('[data-timeline]');
  const grids = $$('[data-steps]');
  const marks = $$('[data-mark]');
  const whys = $$('[data-why]');
  const sps = $$('[data-sp]'); // 일반 스크롤 진행(--sp): data-sp="시작,끝"(윗변의 화면 높이 비율)
  if (!inks.length && !lines.length && !grids.length && !marks.length && !whys.length && !sps.length) return;
  const root = document.documentElement;
  const mobile = matchMedia('(max-width: 767px)');
  const wide = matchMedia('(min-width: 1280px)');

  const finish = () => {
    inks.forEach((el) => el.style.setProperty('--ink', '1'));
    lines.forEach((ol) => { ol.style.setProperty('--p', '1'); ol.classList.add('arrived'); ol.querySelectorAll('li').forEach((li) => li.classList.add('on')); });
    grids.forEach((ol) => ol.querySelectorAll('li').forEach((li) => li.classList.add('on')));
    marks.forEach((m) => m.classList.add('on'));
    whys.forEach((el) => el.classList.add('go'));
    sps.forEach((el) => el.style.setProperty('--sp', '1'));
  };

  /* 2026-10-09 사용자: '스크롤을 빨리 내리면 확 지나가서 눈치 못 챈다' → 스크롤에 묶지 않고, 화면에 들어오면 정해진 시간 동안 끝까지 재생.
     (휴대폰 제작 과정 세로 선만 읽는 자리를 따라가도록 스크롤에 묶어 둠) */
  const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
  const tweens = new Map<HTMLElement, { t0: number; dur: number; prop: string; step?: (v: number) => void }>();
  let tw = 0;
  const tick = (now: number) => {
    tw = 0;
    tweens.forEach((o, el) => {
      const v = ease(clamp01((now - o.t0) / o.dur));
      el.style.setProperty(o.prop, v.toFixed(4));
      o.step?.(v);
      if (v >= 1) tweens.delete(el);
    });
    if (tweens.size) tw = requestAnimationFrame(tick);
  };
  const play = (el: HTMLElement, prop: string, dur: number, step?: (v: number) => void) => {
    if (el.dataset.played) return;
    el.dataset.played = '1';
    tweens.set(el, { t0: performance.now(), dur, prop, step });
    if (!tw) tw = requestAnimationFrame(tick);
  };
  const lightSteps = (ol: HTMLElement, p: number) => {
    const r = ol.getBoundingClientRect();
    const items = [...ol.querySelectorAll<HTMLElement>(':scope > li')];
    items.forEach((li, i) => {
      let on: boolean;
      if (mobile.matches) on = p * r.height >= li.offsetTop + 14;
      else if (wide.matches) on = p * r.width >= li.offsetLeft + 12;
      else on = p >= (i + 0.2) / items.length;
      li.classList.toggle('on', on);
    });
    ol.classList.toggle('arrived', p >= 0.995);
  };
  const seen = (el: Element, line: number, vh: number) => { const r = el.getBoundingClientRect(); return r.top < vh * line && r.bottom > 0 || r.bottom <= 0; };

  const update = () => {
    raf = 0;
    if (!motion.allowed) { finish(); return; }
    const vh = innerHeight;
    // 전/후 제목('현실로' · '광고가 됩니다.'): 화면 85% 높이에 오면 1.8초 동안 왼쪽부터 채움
    inks.forEach((el) => { if (seen(el, 0.85, vh)) play(el, '--ink', 1800); });
    // 제작 과정 진행 선: PC·태블릿은 단계 윗변이 화면 82% 높이에 오면 3.2초 동안 01 → 05, 휴대폰은 읽는 자리(62%)를 따라감
    lines.forEach((ol) => {
      if (mobile.matches && !ol.dataset.played) {
        const r = ol.getBoundingClientRect();
        const p = clamp01((vh * 0.62 - r.top) / r.height);
        ol.style.setProperty('--p', p.toFixed(4));
        lightSteps(ol, p);
      } else if (seen(ol, 0.82, vh)) play(ol, '--p', 3200, (v) => lightSteps(ol, v));
    });
    // 단계·칸 목록(영상 제작 과정 · WHY 여섯 가지 · 추천 대상 체크): 윗변이 화면의 data-steps 높이(기본 82%)를 지나면 켜짐(한 번).
    // data-stagger면 같은 순간에 켜지는 줄끼리 0.18초씩 차례로
    grids.forEach((ol) => {
      const line = Number(ol.dataset.steps) || 0.82;
      let n = 0;
      ol.querySelectorAll<HTMLElement>(':scope > li').forEach((li) => {
        if (li.classList.contains('on') || li.getBoundingClientRect().top >= vh * line) return;
        if (ol.hasAttribute('data-stagger')) li.style.setProperty('--td', `${(0.2 + n++ * 0.18).toFixed(2)}s`);
        li.classList.add('on');
      });
    });
    // WHY PAUSE?: 화면 85% 높이에 오면 한 번 끝까지 재생(글자가 달려와 급정거 → 일시정지 표시 → 물음표)
    whys.forEach((el) => { if (seen(el, 0.85, vh)) el.classList.add('go'); });
    // 형광펜: 화면 80% 높이를 지나면 한 번
    marks.forEach((m) => { if (seen(m, 0.8, vh)) m.classList.add('on'); });
    // 관리비 지움 · 뷰파인더 · 글자 모임 · 해방: 화면 85% 높이에 오면 data-dur(기본 1.9초) 동안 끝까지
    sps.forEach((el) => { if (seen(el, 0.85, vh)) play(el, '--sp', Number(el.dataset.dur) || 1900); });
  };

  let raf = 0;
  const req = () => { if (!raf) raf = requestAnimationFrame(update); };
  root.classList.add('fx');
  update();
  addEventListener('scroll', req, { passive: true });
  addEventListener('resize', req);
  motion.subscribe(req);
}
