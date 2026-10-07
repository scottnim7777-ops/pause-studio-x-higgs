/* PAUSE STUDIO 히어로 v27 — 실제 작업물 벽(무한 순환) + 등장 연출.
   모든 상태는 시간 t의 순수 함수(renderAt) → 시안 영상은 프레임 단위로 정확히 캡처, 실제 사이트에서는 requestAnimationFrame으로 재생.
   initPauseHero(root, {live:true|false}) → {renderAt(t), P} */
function initPauseHero(root, opts) {
  opts = opts || {};
  const $ = (s) => root.querySelector(s), $$ = (s) => [...root.querySelectorAll(s)];
  const P = 24;                     // 벽이 한 바퀴 도는 주기(초) — 정확히 반복되므로 이음매 없음
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const eOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
  const eExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(x)));
  const span = (t, a, b) => clamp((t - a) / (b - a));
  const mod = (a, n) => ((a % n) + n) % n;

  const wall = $('[data-wall]'), sheen = $('[data-sheen]'), em = $('[data-em]');
  const cols = $$('[data-col]').map((c) => {
    const cards = [...c.children];
    const unit = cards[0].offsetHeight + parseFloat(getComputedStyle(cards[0]).marginBottom);
    for (let k = 0; k < 3; k++) cards.forEach((n) => c.appendChild(n.cloneNode(true)));
    return { el: c, dir: +c.dataset.dir, cycle: cards.length * unit, phase: (+c.dataset.col * 0.37) % 1 };
  });
  const vids = $$('video');
  vids.forEach((v) => { v.muted = true; if (opts.live) v.play().catch(() => {}); });

  // 필름 그레인(프레임마다 다른 노이즈, 시드 고정 → 캡처가 재현 가능)
  const cv = $('[data-grain]'), cx = cv.getContext('2d'), img = cx.createImageData(cv.width, cv.height);
  function grain(seed) {
    let s = (seed * 9301 + 49297) % 233280 || 1;
    const d = img.data;
    for (let i = 0; i < d.length; i += 4) { s = (s * 16807) % 2147483647; const g = s & 255; d[i] = d[i + 1] = d[i + 2] = g; d[i + 3] = 255; }
    cx.putImageData(img, 0, 0);
  }

  const parts = { head: [0.5, 1.2, 0], eyebrow: [0.75, 1.4, 0], sub: [1.55, 2.3, 14], ctas: [1.7, 2.45, 14], facts: [1.95, 2.75, 10], note: [2.2, 2.9, 0], tag: [2.2, 2.9, 0] };
  const inEls = $$('[data-in]').map((el) => ({ el, p: parts[el.dataset.in] }));
  const lines = $$('[data-line]');
  let mx = 0, my = 0;
  if (opts.live) root.addEventListener('pointermove', (e) => { const r = root.getBoundingClientRect(); mx = (e.clientX - r.left) / r.width - 0.5; my = (e.clientY - r.top) / r.height - 0.5; });

  function frame(t) {
    const mobile = root.classList.contains('m');
    // 벽: 어둠에서 떠오르며 살짝 뒤로 물러남, 이후 아주 느리게 숨 쉬듯 기울어짐
    const wi = eOut(span(t, 0.15, 1.7));
    const drift = Math.sin((2 * Math.PI * t) / P);
    const ry = (mobile ? -8 : -27) + drift * 1.4 + mx * 3, rx = (mobile ? 30 : 9) - my * 2, rz = mobile ? -10 : -5;
    wall.style.opacity = wi;
    wall.style.transform = `rotateY(${ry}deg) rotateX(${rx}deg) rotateZ(${rz}deg) scale(${1.07 - 0.07 * wi})`;
    cols.forEach((c) => {
      const u = mod(t / P + c.phase, 1) * c.cycle;
      const y = c.dir < 0 ? -u : -c.cycle + u;
      c.el.style.transform = `translate3d(0,${y.toFixed(2)}px,0)`;
    });
    // 벽 위를 지나가는 빛(9초마다 한 번)
    const sw = mod(t - 1.2, 9) / 3.2;
    sheen.style.opacity = sw < 1 ? Math.sin(Math.PI * sw) : 0;
    sheen.style.transform = `translateX(${(-60 + 120 * clamp(sw)).toFixed(1)}%)`;
    // 카피 등장
    inEls.forEach(({ el, p }) => { const k = eOut(span(t, p[0], p[1])); el.style.opacity = k; el.style.transform = p[2] ? `translateY(${(1 - k) * p[2]}px)` : ''; });
    lines.forEach((l, i) => { const k = eExpo(span(t, 0.85 + i * 0.16, 1.85 + i * 0.16)); l.style.transform = `translateY(${(1 - k) * 105}%)`; });
    // '돋보이게.'를 스치는 빛: 등장 직후 한 번, 이후 12초마다
    const es = t < 6 ? span(t, 1.75, 3.0) : span(mod(t - 3.0, 12), 0, 1.25);
    em.style.backgroundPosition = `${(100 - 100 * es).toFixed(1)}% 0`;
    return t;
  }

  if (opts.live) {
    const t0 = performance.now();
    (function loop() { const t = (performance.now() - t0) / 1000; frame(t); grain(Math.floor(t * 24)); requestAnimationFrame(loop); })();
  }
  return {
    P,
    async renderAt(t, fi) {
      frame(t); grain(fi || Math.floor(t * 30));
      await Promise.all(vids.map((v) => new Promise((res) => {
        const tt = mod(t + (+v.dataset.off || 0), v.duration || 8) + 1e-4;
        if (Math.abs(v.currentTime - tt) < 1e-3 && v.readyState >= 2) return res();
        const done = () => { v.removeEventListener('seeked', done); res(); };
        v.addEventListener('seeked', done); v.currentTime = tt; setTimeout(res, 1500);
      })));
    },
  };
}
