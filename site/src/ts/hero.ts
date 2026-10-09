/**
 * 히어로(32차 승인안)
 * - 인트로 약 3.9초(2026-10-09 타이핑을 사람 손처럼·30% 느리게): 어둠 속 흐릿한 작업물 벽이 다가오며 선명해짐 + 제목을 한글 자판으로 치듯 자모부터 조립(ㅅ → 서 → 선) + 깜빡이는 커서
 * - 타이핑이 끝나도 커서는 문장 끝에서 계속 깜빡임(CSS .caret.end, 움직임을 멈추면 깜빡임도 멈춤)
 * - 이후: 세 줄의 작업물이 서로 반대로 천천히 흐름(24초 주기), 마우스에 따라 살짝 기울어짐, 화면 안의 영상만 재생
 * - 운영체제의 동작 줄이기를 따름(2026-10-09 사용자: '움직임 멈추기' 버튼은 없앰). 인트로 타이밍은 drafts/v32/hero/hero.html 과 같다.
 */
import { motion, saveData } from './motion';
import { steps } from './hangul';

/** 타이핑 시간(2026-10-09 사용자: 실제 사람이 쓰듯 자연스럽게, 30% 느리게 — 1.55초 → 2.02초). 뒤 장면은 늘어난 만큼(LAG) 늦춘다 */
const TYPE = 2.02;
const LAG = TYPE - 1.55;
const INTRO_END = 3.4 + LAG;
const P = 24; // 줄이 한 바퀴 흐르는 시간(초)
const ROW_W = 5 * (440 + 28); // 한 줄 5장의 폭(카드 440 + 간격 28)

const clamp = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
const span = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
const eOut = (x: number) => 1 - Math.pow(1 - clamp(x), 3);
const io = (x: number) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const mod = (a: number, n: number) => ((a % n) + n) % n;

type Base = { ry: number; rx: number; rz: number; s: number };
const DESKTOP: Base = { ry: -24, rx: 9, rz: -3, s: 1 };
const MOBILE: Base = { ry: -16, rx: 24, rz: -7, s: 0.5 };

export function initHero(onIntroDone: () => void) {
  const root = document.documentElement;
  const hero = document.querySelector<HTMLElement>('[data-hero]');
  const finishIntro = () => { root.classList.add('intro-done'); onIntroDone(); };
  if (!hero) { finishIntro(); return; }

  const $ = <T extends Element = HTMLElement>(s: string) => hero.querySelector<T>(s);
  const plane = $('[data-plane]')!;
  const tracks = [...hero.querySelectorAll<HTMLElement>('.track')];
  const imgs = [...hero.querySelectorAll<HTMLImageElement>('.card img')];
  const vids = [...hero.querySelectorAll<HTMLVideoElement>('[data-wall-video]')];
  const header = document.querySelector<HTMLElement>('[data-header]');
  const title = $('[data-type-title]')!;
  const fade = { eb: $('.hero-eb'), sub: $('.hero-sub'), ctas: $('.ctas'), note: $('.hero-note'), svc: $('.hero-svc') };
  const svcItems = [...hero.querySelectorAll<HTMLElement>('.hero-svc > li')];
  const mobileMq = matchMedia('(max-width: 1023px)');
  const fineMq = matchMedia('(hover: hover) and (pointer: fine)');

  /* ── 무대 크기: 설계 좌표계(PC 1920×1080, 모바일 390×1120)를 화면에 맞춤 */
  const fit = () => {
    const w = hero.clientWidth, h = hero.clientHeight;
    // 태블릿(768~1023)은 휴대폰 구도를 0.72배로 — CSS의 .hero-wall 높이·위치와 같은 비율
    const s = mobileMq.matches ? (w / 390) * (w >= 768 ? 0.72 : 1) : Math.max(w / 1920, h / 1080);
    hero.style.setProperty('--ws', s.toFixed(4));
  };
  fit();
  new ResizeObserver(fit).observe(hero);
  mobileMq.addEventListener('change', fit);

  /* ── 타이핑 준비 */
  const lines = [...title.querySelectorAll<HTMLElement>('.l1, .l2, .l3')];
  const texts = lines.map((l) => l.textContent ?? '');
  const seq: { li: number; text: string }[] = [];
  texts.forEach((ln, li) => { let done = ''; for (const ch of ln) { for (const st of steps(ch)) seq.push({ li, text: done + st }); done += ch; } });
  /* 타건 시각표: 사람 손처럼 타건마다 간격이 조금씩 다르고(고정된 의사난수 — 매번 같은 리듬), 띄어쓰기 뒤엔 잠깐 멈칫,
     둘째 줄로 넘어가기 전엔 생각하듯 길게 쉰다. 전체 길이는 TYPE에 맞춘다 */
  const T0 = 0.5, T1 = T0 + TYPE;
  const at: number[] = [];
  {
    let c = 0;
    seq.forEach((q, i) => {
      if (i) {
        const prev = seq[i - 1];
        let g = 0.78 + (((i * 37) % 23) / 23) * 0.55;
        if (q.li !== prev.li && q.li === 1) g += 3.2; // 첫 줄을 다 쓰고 다음 줄로: 길게
        else if (q.li !== prev.li) g += 1.7; // '방식이 | 다릅니다.'(PC는 한 줄): 마지막 말 앞에서 조금 더
        else if (prev.text.endsWith(' ')) g += 1.3;
        c += g;
      }
      at.push(c);
    });
    const k = TYPE / c;
    for (let i = 0; i < at.length; i++) at[i] = T0 + at[i] * k;
  }
  let lastKey = '';
  const caret = () => { const c = document.createElement('i'); c.className = 'caret'; return c; };
  function typing(t: number) {
    const caretOn = t >= 0.2 && ((t >= T0 && t < T1) || Math.floor((t - (t < T0 ? 0.2 : T1)) * 2.6) % 2 === 0);
    let k = -1;
    if (t >= T0) { k = 0; while (k < at.length - 1 && at[k + 1] <= t) k++; }
    const key = `${k}|${caretOn}`;
    if (key === lastKey) return;
    lastKey = key;
    const q = k >= 0 ? seq[k] : null;
    const cur = q ? q.li : 0;
    lines.forEach((el, i) => {
      el.textContent = !q ? '' : i < q.li ? texts[i] : i === q.li ? q.text : '';
      if (caretOn && i === cur) el.appendChild(caret());
    });
  }
  const restoreTitle = () => {
    lines.forEach((el, i) => { el.textContent = texts[i]; });
    title.style.minHeight = '';
    const end = caret();
    end.classList.add('end');
    lines[lines.length - 1].appendChild(end);
  };

  /* ── 상태 */
  const reduced = motion.reduced;
  const skipIntro = reduced || scrollY > 40 || (location.hash !== '' && location.hash !== '#top');
  let introStart = -1; // 인트로가 시작된 시각(ms). -1이면 인트로 없음/끝남
  let wallT = 0; // 벽이 흐른 시간(초) — 멈추면 멈춘다
  let last = 0;
  let mx = 0, my = 0, cx = 0, cy = 0; // 마우스(목표·현재)
  let raf = 0;
  let visible = true;

  const show = (el: HTMLElement | null, o: number, y = 0) => {
    if (!el) return;
    el.style.opacity = o.toFixed(3);
    el.style.transform = y ? `translateY(${y.toFixed(2)}px)` : '';
  };

  function introFrame(t: number) {
    show(header, eOut(span(t, 0.05, 0.95)));
    show(fade.eb, eOut(span(t, 0.25, 0.95)), 10 * (1 - eOut(span(t, 0.25, 0.95))));
    title.style.opacity = '1';
    typing(t);
    const u = t - LAG; // 타이핑 뒤 장면은 늘어난 타이핑 시간만큼 늦게
    show(fade.sub, eOut(span(u, 1.95, 2.7)), 16 * (1 - eOut(span(u, 1.95, 2.7))));
    show(fade.ctas, eOut(span(u, 2.1, 2.85)), 16 * (1 - eOut(span(u, 2.1, 2.85))));
    fade.svc?.style.setProperty('--rl', io(span(u, 2.2, 3.1)).toFixed(4));
    svcItems.forEach((it, i) => show(it, eOut(span(u, 2.35 + i * 0.14, 3.1 + i * 0.14)), 14 * (1 - eOut(span(u, 2.35 + i * 0.14, 3.1 + i * 0.14)))));
    show(fade.note, eOut(span(u, 2.75, 3.4)));
  }

  function endIntro() {
    introStart = -1;
    restoreTitle();
    [header, fade.eb, fade.sub, fade.ctas, fade.note, title, ...svcItems].forEach((el) => { if (el) { el.style.opacity = ''; el.style.transform = ''; } });
    fade.svc?.style.removeProperty('--rl');
    plane.style.opacity = '';
    plane.style.filter = '';
    finishIntro();
  }

  /** 벽: 인트로(흐림·다가옴) + 흐름 + 기울기 */
  function wallFrame(introT: number) {
    const m = mobileMq.matches;
    const B = m ? MOBILE : DESKTOP;
    let z = 0, dry = 0;
    if (introT >= 0) {
      const wallIn = io(span(introT, 0.1, 2.5));
      const blur = (1 - eOut(span(introT, 0.1, 2.3))) * 16;
      z = (1 - wallIn) * -460;
      dry = (1 - wallIn) * -7;
      plane.style.opacity = wallIn.toFixed(4);
      plane.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px)` : 'none';
    }
    cx += (mx - cx) * 0.06;
    cy += (my - cy) * 0.06;
    plane.style.transform = `rotateY(${(B.ry + dry + cx * 6).toFixed(3)}deg) rotateX(${(B.rx - cy * 4).toFixed(3)}deg) rotateZ(${B.rz}deg) translateZ(${z.toFixed(1)}px) scale(${B.s})`;
    const ph = mod(wallT, P);
    const f = (ph / P) * ROW_W;
    tracks.forEach((r, i) => { r.style.transform = `translate3d(${(i % 2 === 0 ? -f : -ROW_W + f).toFixed(2)}px,0,0)`; });
    if (!m) imgs.forEach((im, i) => { im.style.transform = `scale(${(1 + 0.05 * (0.5 - 0.5 * Math.cos(2 * Math.PI * (ph / P) + i))).toFixed(4)})`; });
  }

  function loop(now: number) {
    raf = 0;
    const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
    last = now;
    const introT = introStart >= 0 ? (now - introStart) / 1000 : -1;
    if (introT >= 0) introFrame(introT);
    if (motion.allowed) wallT += dt;
    wallFrame(introT >= 0 && introT < INTRO_END ? introT : -1);
    if (introT >= INTRO_END) endIntro();
    if (introStart >= 0 || (motion.allowed && visible)) raf = requestAnimationFrame(loop);
    else last = 0;
  }
  const kick = () => { if (!raf && !reduced) raf = requestAnimationFrame(loop); };

  /* ── 영상: PC에서만, 화면에 보이는 카드만 재생(모바일·데이터 절약은 사진만) */
  const useVideo = () => !mobileMq.matches && !saveData() && motion.allowed;
  const vidIo = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target as HTMLVideoElement;
    if (e.isIntersecting && useVideo()) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      v.play().catch(() => { /* 자동 재생이 막히면 사진 그대로 */ });
    } else if (!v.paused) v.pause();
  }), { threshold: 0.05 });
  vids.forEach((v) => {
    v.addEventListener('playing', () => v.classList.add('on'));
    vidIo.observe(v);
  });
  const syncVideos = () => vids.forEach((v) => {
    if (!useVideo()) { if (!v.paused) v.pause(); return; }
    // 다시 켜면 관찰을 새로 시작해 보이는 카드만 재생
    vidIo.unobserve(v); vidIo.observe(v);
  });

  /* ── 히어로가 화면 밖이면 멈춤(배터리·성능) */
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible) kick();
  }).observe(hero);

  /* ── 마우스 기울기(PC) */
  addEventListener('pointermove', (e) => {
    if (!fineMq.matches || !visible || !motion.allowed) return;
    mx = e.clientX / innerWidth - 0.5;
    my = e.clientY / innerHeight - 0.5;
  }, { passive: true });

  /* ── 운영체제의 동작 줄이기가 바뀌면 영상·흐름을 다시 맞춤 */
  motion.subscribe(() => { syncVideos(); kick(); });

  /* ── 시작 */
  if (skipIntro) {
    endIntro();
    wallFrame(-1);
    kick();
  } else {
    title.style.minHeight = `${title.offsetHeight}px`; // 타이핑 중에 아래 내용이 흔들리지 않게
    typing(0);
    introStart = performance.now();
    raf = requestAnimationFrame(loop);
  }
}
