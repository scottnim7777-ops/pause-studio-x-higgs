/**
 * 문구(src/content/ko.ts) → 페이지 본문 HTML
 * 검색엔진·JS 꺼진 환경에서도 내용이 그대로 보이도록 빌드 시점에 HTML로 만든다(scripts/render.ts).
 */
import fs from 'node:fs';
import path from 'node:path';
import * as C from '../content/ko';
import media from '../content/media.json';
import { signatureOutline, signatureStrokes } from '../assets/signature';

const PUB = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../public');
const exists = (p: string) => fs.existsSync(path.join(PUB, p));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const arrow = (cls = 'ar') => `<svg class="${cls}" viewBox="0 0 30 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 6h28.5M23.5 1l5 5-5 5"/></svg>`;
const smallArrow = `<svg viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 5h13M9 1l4 4-4 4"/></svg>`;
const bubble = `<svg class="kk" viewBox="0 0 20 19" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M10 1.5c4.97 0 9 3.13 9 7s-4.03 7-9 7c-.86 0-1.69-.09-2.47-.27L3.5 17.5l1.06-3.37C2.39 12.86 1 10.83 1 8.5c0-3.87 4.03-7 9-7z"/></svg>`;
const lines = (arr: string[]) => arr.map((l, i) => `<span class="ln" style="--li:${i}"><span>${esc(l)}</span></span>`).join('');
type Dim = [number, number];
const M = media as unknown as Record<string, Record<string, Dim>>;
/** 크기별 사진(media.json의 실제 픽셀 크기) → <picture> WebP + JPEG */
const img = (base: string, alt: string, sizes: string, cls = '', lazy = true) => {
  const m = M[base];
  if (!m) throw new Error(`media.json에 없는 사진: ${base} (python3 site/scripts/media.py 실행)`);
  const tags = Object.keys(m).sort((a, b) => m[a][0] - m[b][0]);
  const set = (ext: string) => tags.map((t) => `${base}-${t}.${ext} ${m[t][0]}w`).join(', ');
  const [w, h] = m[tags[tags.length - 1]];
  return `<picture><source type="image/webp" srcset="${set('webp')}" sizes="${sizes}"><img${cls ? ` class="${cls}"` : ''} src="${base}-${tags[0]}.jpg" srcset="${set('jpg')}" sizes="${sizes}" alt="${esc(alt)}" width="${w}" height="${h}"${lazy ? ' loading="lazy" decoding="async"' : ' decoding="async" fetchpriority="high"'}></picture>`;
};
const dim = (base: string, tag: string): Dim => M[base]?.[tag] ?? [1600, 900];
const base = (p: string) => p.replace(/\.jpg$/, '');

const consultBtn = (label: string, cls = 'btn btn-solid', type = '') =>
  `<a class="${cls}" href="#contact" data-consult${type ? ` data-type="${esc(type)}"` : ''}><span class="lb">${esc(label)}</span>${arrow()}</a>`;
const kakaoBtn = (cls = 'btn btn-line') =>
  `<a class="${cls}" href="${C.contact.kakaoUrl}" target="_blank" rel="noopener"><span class="lb">${bubble}${esc(C.cta.kakao)}</span>${arrow()}<span class="sr">(새 창)</span></a>`;

/** 자동 재생 영상의 재생·일시정지 버튼(움직임이 5초 넘게 이어지므로 멈출 수 있어야 함) */
const vctrl = () => `<button class="vctrl" type="button" data-vctrl aria-label="${esc(C.film.pause)}"><i aria-hidden="true"></i></button>`;

function header() {
  const links = C.nav.map((n) => `<a href="${n.href}">${esc(n.label)}</a>`).join('');
  return `<a class="skip" href="#main">본문으로 건너뛰기</a>
<header class="hd" data-header>
  <div class="hd-in">
    <a class="hd-logo" href="#top" aria-label="PAUSE Studio 처음으로"><img src="/brand/logo-cream.svg" alt="Pause Studio" width="204" height="103"></a>
    <nav class="hd-nav" aria-label="주요 메뉴">${links}<a class="hd-cta" href="#contact">${esc(C.cta.header)}${smallArrow}</a></nav>
    <button class="hd-menu" type="button" aria-expanded="false" aria-controls="mnav" data-menu><span class="sr">메뉴</span><i></i><i></i></button>
  </div>
</header>
<div class="mnav" id="mnav" hidden>
  <nav class="mnav-links" aria-label="모바일 메뉴">${links}<a href="#contact">${esc(C.cta.header)}</a></nav>
  <div class="ctas">${consultBtn(C.cta.consult)}${kakaoBtn()}</div>
</div>`;
}

/* 히어로 작업물 벽: 3줄 × 5개(반복을 위해 두 번) — 실제 고객 사이트 화면 */
const WALL = [
  ['Ref. 01', 'Ref. 03', 'Ref. 11', 'Ref. 07', 'Ref. 13'],
  ['Ref. 08', 'Ref. 02', 'Ref. 12', 'Ref. 09', 'Ref. 05'],
  ['Ref. 14', 'Ref. 04', 'Ref. 15', 'Ref. 06', 'Ref. 10'],
];
function wallCard(ref: string) {
  const it = C.work.items.find((x) => x.ref === ref)!;
  const b = base(it.image);
  const [w, h] = dim(b, '880');
  const pic = `<picture><source type="image/webp" srcset="${b}-880.webp"><img src="${b}-880.jpg" alt="" width="${w}" height="${h}" decoding="async"></picture>`;
  const media = it.video && exists(`${it.video}.mp4`) ? `${pic}<video data-wall-video muted playsinline loop preload="none" data-src="${it.video}.mp4"></video>` : pic;
  return `<figure class="card"><div class="scr">${media}</div><figcaption>${esc(it.ref)}<i>${esc(it.category)}</i></figcaption></figure>`;
}
function hero() {
  const rows = WALL.map((r, i) => `<div class="row r${i}"><div class="track">${[...r, ...r].map(wallCard).join('')}</div></div>`).join('');
  const h = C.hero;
  const svc = h.services.map((s) => `<li><span class="ix">${s.index}</span><span class="nm">${esc(s.name)}</span><span class="d1">${esc(s.lead)}</span><span class="d2">${esc(s.desc)}</span></li>`).join('');
  return `<section class="hero" id="top" aria-labelledby="hero-title" data-hero>
  <div class="hero-wall" aria-hidden="true"><div class="stage" data-stage><div class="plane" data-plane>${rows}</div><div class="veil"></div></div></div>
  <div class="hero-in">
    <p class="hero-eb"><span class="rule"></span>${esc(h.eyebrow)}</p>
    <h1 class="hero-title" id="hero-title"><span class="sr">${esc(h.titleLines.join(' '))}</span><span class="tt" aria-hidden="true" data-type-title><span class="l1">${esc(h.titleLinesMobile[0])}</span><span class="l2">${esc(h.titleLinesMobile[1])} </span><span class="l3">${esc(h.titleLinesMobile[2])}</span></span></h1>
    <p class="hero-sub">${esc(h.sub[0])}<br> ${esc(h.sub[1])}</p>
    <div class="ctas">${consultBtn(C.cta.consult)}${kakaoBtn()}</div>
    <ul class="hero-svc" aria-label="서비스">${svc}</ul>
    <p class="hero-note">${esc(h.note)}</p>
  </div>
  <button class="wall-toggle" type="button" aria-pressed="false" data-wall-toggle><span>움직임 멈추기</span></button>
</section>`;
}

/* 포트폴리오: 12칸 격자에 넓고 좁은 칸을 번갈아(7·5 / 4·4·4 / 5·7 / 4·4·4 / 7·5 / 3·3·3·3) */
const SPANS = ['s7', 's5', '', '', '', 's5', 's7', '', '', '', 's7', 's5', 's3', 's3', 's3', 's3'];
function work() {
  const w = C.work;
  const items = w.items.map((it, i) => {
    const b = base(it.image);
    const vid = it.video && exists(`${it.video}.mp4`) ? `<video muted playsinline loop preload="none" data-src="${it.video}.mp4" aria-hidden="true"></video>` : '';
    const sizes = SPANS[i] === 's7' ? '(max-width: 1023px) 50vw, 58vw' : '(max-width: 1023px) 50vw, 34vw';
    return `<li class="wk ${SPANS[i] || ''} rv" style="--d:${(i % 3) * 0.08}s"><button class="wk-btn" type="button" data-work="${i}" aria-label="${esc(`${it.ref} ${it.category} 크게 보기`)}"><span class="wk-media">${img(b, `${it.ref} ${it.category} 웹사이트 화면`, sizes)}${vid}</span><span class="wk-cap"><span class="wk-ref">${esc(it.ref)}</span><span class="wk-cat">${esc(it.category)}</span>${arrow()}</span></button></li>`;
  }).join('');
  const data = JSON.stringify(w.items.map((it) => {
    const b = base(it.image);
    const [iw, ih] = dim(b, '1920');
    return { ref: it.ref, category: it.category, image: `${b}-1920`, w: iw, h: ih, video: it.video && exists(`${it.video}.mp4`) ? `${it.video}.mp4` : '' };
  }));
  return `<section class="sec sec-dark work" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="h2 rv" id="work-title">${lines(w.title)}</h2><p class="lead rv" style="--d:.1s">${esc(w.lead)}</p></header>
    <ul class="work-grid">${items}</ul>
  </div>
  <script type="application/json" id="work-data">${data.replace(/</g, '\\u003c')}</script>
</section>`;
}

function lightbox() {
  return `<dialog class="lightbox" id="lightbox" aria-label="작업물 크게 보기">
  <div class="lb-in">
    <div class="lb-top"><span data-lb-count>01 / 16</span><button class="lb-close" type="button" data-lb-close><span>닫기</span><i aria-hidden="true"></i></button></div>
    <div class="lb-fig" data-lb-fig></div>
    <div class="lb-bot"><p class="lb-cap" data-lb-cap></p><div class="lb-nav"><button class="prev" type="button" data-lb-prev aria-label="이전 작업물">${arrow('')}</button><button class="next" type="button" data-lb-next aria-label="다음 작업물">${arrow('')}</button></div></div>
  </div>
</dialog>`;
}

function signature() {
  const strokes = signatureStrokes.map((s) => `<path class="st" d="${s.d}" style="--l:${s.l}px;--dur:${s.dur}ms;--off:${s.off}ms;--e:${s.e}"/>`).join('');
  return `<svg class="sig" viewBox="0 0 1363 432" role="img" aria-label="PAUSE STUDIO 대표 서명" data-sign><defs><mask id="sigm" maskUnits="userSpaceOnUse" x="0" y="0" width="1363" height="432">${strokes}</mask></defs><path d="${signatureOutline}" fill="currentColor" fill-rule="evenodd" mask="url(#sigm)"/></svg>`;
}

function why() {
  const w = C.why;
  const pillars = w.pillars.map((p, i) => `<li class="rv" style="--d:${i * 0.1}s"><span class="idx">0${i + 1}</span><h3 class="h3">${esc(p.title)}</h3><p>${esc(p.desc)}</p></li>`).join('');
  return `<section class="sec sec-paper why" id="why" aria-labelledby="why-title">
  <div class="wrap why-grid">
    <header><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="why-title rv" id="why-title">${esc(w.title)}</h2></header>
    <div class="letter">${w.letter.map((p, i) => `<p class="rv" style="--d:${i * 0.08}s">${esc(p)}</p>`).join('')}
      <div class="sign rv">${signature()}<span>${esc(w.signatureLabel)}</span></div>
    </div>
  </div>
  <div class="wrap"><ul class="pillars">${pillars}</ul></div>
</section>`;
}

function who() {
  const w = C.who;
  const items = w.items.map((t, i) => `<li class="rv" style="--d:${(i % 3) * 0.06}s"><span class="idx">${String(i + 1).padStart(2, '0')}</span><p>${esc(t)}</p></li>`).join('');
  return `<section class="sec sec-paper who" id="who" aria-labelledby="who-title">
  <div class="wrap who-grid">
    <header class="sec-head"><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="h2 rv" id="who-title">${lines(w.title)}</h2><p class="lead rv" style="--d:.1s">${esc(w.lead)}</p></header>
    <ol class="who-list">${items}</ol>
  </div>
</section>`;
}

function services() {
  const s = C.services;
  const tabs = s.items.map((it) => `<a href="#svc-${it.key}"><span class="idx">${it.index}</span><span class="n">${esc(it.name)}</span><span class="p">${esc(it.ko)} · ${esc(it.price)}${esc(it.priceNote || '')}</span></a>`).join('');
  const typeOf: Record<string, string> = { website: '웹사이트 제작', store: '웹사이트 제작', enterprise: 'AI 업무 자동화 · 맞춤 개발', film: 'AI 영상광고' };
  const blocks = s.items.map((it) => {
    const many = it.groups.length > 2;
    const groups = it.groups.map((g) => {
      const wide = !many && g.items.length > 8;
      const off = /포함되지|별도/.test(g.title);
      return `<div class="grp${wide ? ' wide' : ''}${off ? ' off' : ''}"><h4>${esc(g.title)}</h4><ul>${g.items.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>`;
    }).join('');
    const notes = it.footnotes?.length ? `<ul class="svc-notes">${it.footnotes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : '';
    return `<article class="svc" id="svc-${it.key}" aria-labelledby="svc-${it.key}-name">
    <header class="svc-hd rv"><span class="idx">${it.index}</span><h3 class="svc-name" id="svc-${it.key}-name">${esc(it.name)}</h3><p class="svc-ko">${esc(it.ko)}</p><p class="svc-price">${esc(it.price)}${it.priceNote ? `<small>${esc(it.priceNote)}</small>` : ''}</p>
      <a class="btn-text" href="#contact" data-consult data-type="${esc(typeOf[it.key])}"${it.key === 'store' ? ' data-product="ONLINE STORE · 주문과 결제"' : it.key === 'website' ? ' data-product="WEBSITE · 소개와 문의"' : ''}>이 서비스로 상담하기${arrow()}</a></header>
    <div class="svc-body"><p class="svc-headline rv">${esc(it.headline)}</p><p class="svc-purpose rv" style="--d:.08s">${esc(it.purpose)}</p>
      <div class="svc-groups${many ? ' cols-3' : ''} rv" style="--d:.12s">${groups}</div>${notes}</div>
  </article>`;
  }).join('');
  const basics = s.basics.items.map((b, i) => `<li class="rv" style="--d:${(i % 3) * 0.08}s"><span class="idx">${String(i + 1).padStart(2, '0')}</span><h4>${esc(b.title)}${b.tag ? `<span class="tag">${esc(b.tag)}</span>` : ''}</h4><p>${esc(b.desc)}</p></li>`).join('');
  return `<section class="sec sec-dark services" id="services" aria-labelledby="services-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(s.eyebrow)}</p><h2 class="h2 rv" id="services-title">${lines(s.title)}</h2><p class="lead rv" style="--d:.1s">${esc(s.lead)}</p></header>
    <nav class="svc-tabs rv" aria-label="서비스 바로가기">${tabs}</nav>
    ${blocks}
    <div class="basics"><h3 class="h3 rv">${esc(s.basics.title)}</h3><ul class="basics-grid">${basics}</ul></div>
  </div>
</section>`;
}

function film() {
  const f = C.film;
  const hasVid = exists('/media/film/soom.mp4');
  const after = hasVid
    ? `<video muted playsinline loop preload="none" data-auto data-src="/media/film/soom.mp4" poster="/media/film/soom-poster.jpg" width="1600" height="900" aria-label="AI 광고 영상 예시 — 물가에 놓인 SOOM 세럼과 상자"></video>${vctrl()}`
    : `<img src="/media/film/soom-poster.jpg" alt="AI 광고 영상 장면 — 물가의 SOOM 세럼" loading="lazy" decoding="async" width="1600" height="900">`;
  const steps = f.steps.map((s, i) => `<li class="rv" style="--d:${i * 0.1}s"><span class="idx">${s.index}</span><h3 class="h3">${esc(s.title)}</h3><p>${esc(s.desc)}</p></li>`).join('');
  return `<section class="sec sec-black film" id="film" aria-labelledby="film-title">
  <div class="wrap">
    <div class="film-grid"><header class="sec-head" style="margin:0"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 rv" id="film-title">${lines(f.title)}</h2></header><p class="lead rv" style="--d:.1s">${esc(f.lead)}</p></div>
    <div class="film-stage">
      <figure class="film-before rv"><div class="media"><img src="/media/film/before-1200.jpg" alt="책상 위에서 평범하게 찍은 세럼과 상자 사진" loading="lazy" decoding="async" width="1200" height="900"></div><figcaption><span class="idx">BEFORE</span>${esc(f.before)}</figcaption></figure>
      <svg class="film-arrow" viewBox="0 0 60 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 7h58M52 1l6 6-6 6"/></svg>
      <figure class="film-after rv" style="--d:.12s"><div class="media">${after}</div><figcaption><span class="idx">AFTER</span>${esc(f.after)}</figcaption></figure>
    </div>
    <p class="film-sample">${esc(f.sampleLabel)}</p>
    <ol class="film-steps">${steps}</ol>
  </div>
</section>`;
}

function mock(kind: string) {
  const travel = kind === 'travel';
  return `<div class="mock ${kind}" aria-hidden="true"><div class="bar"><b>${travel ? 'TravelAgency' : 'Sweet Bakery'}</b><span><i>Home</i><i>About</i><i>${travel ? 'Tours' : 'Shop'}</i><i>Contact</i></span></div><div class="heroimg"><div><h5>${travel ? 'Welcome to Our Travel Agency' : 'Welcome to Our Bakery'}</h5><p>${travel ? 'Best tours at the best prices' : 'Fresh cakes baked every day'}</p><i>${travel ? 'Book Now' : 'Shop Now'}</i></div></div><div class="tiles"><span></span><span></span><span></span></div></div>`;
}
function compare() {
  const c = C.compare;
  const cases = c.cases.map((cs) => {
    const [pw, ph] = dim(base(cs.after.poster), '880');
    return `<div class="cmp-case">
    <figure class="cmp-before rv"><div class="media">${mock(cs.before.kind)}</div><figcaption><span class="tag">${esc(c.labelBefore)}</span><strong>${esc(cs.before.title)}</strong><span class="d">${esc(cs.before.desc)}</span></figcaption></figure>
    <figure class="cmp-after rv" style="--d:.1s"><div class="media"><video muted playsinline loop preload="none" data-auto data-src="${cs.after.media}.mp4" poster="${base(cs.after.poster)}-880.jpg" width="${pw}" height="${ph}" aria-label="${esc(cs.after.title)} — 실제 고객 사이트 화면 녹화"></video>${vctrl()}</div><figcaption><span class="tag">${esc(c.labelAfter)}</span><strong>${esc(cs.after.title)}</strong><span class="d">${esc(cs.after.desc)}</span></figcaption></figure>
  </div>`;
  }).join('');
  return `<section class="sec sec-paper compare" id="compare" aria-labelledby="compare-title">
  <div class="wrap">
    <div class="cmp-head"><header><p class="eyebrow rv">${esc(c.eyebrow)}</p><h2 class="cmp-title rv" id="compare-title">${esc(c.title)}</h2></header><p class="lead rv">${esc(c.lead)}</p></div>
    ${cases}
    <p class="cmp-note">${esc(c.beforeNote)}</p>
  </div>
</section>`;
}

function fee() {
  const f = C.fee;
  const c = f.calc;
  return `<section class="sec sec-dark fee" id="fee" aria-labelledby="fee-title">
  <div class="wrap">
    <div class="fee-top">
      <header class="sec-head" style="margin:0"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 fee-title rv" id="fee-title">${lines(f.title)}</h2><p class="lead rv" style="--d:.1s">${esc(f.lead)}</p></header>
      <figure class="ledger rv" style="--d:.15s" role="img" aria-label="${esc(f.ledger.aria)}" data-ledger>
        <div class="ledger-head" aria-hidden="true"><span>${esc(f.ledger.head[0])}</span><span>${esc(f.ledger.head[1])}</span></div>
        <p class="ledger-zero" aria-hidden="true"><span>$0</span></p>
        <ol class="ledger-months" aria-hidden="true">${f.ledger.months.map((m, i) => `<li style="--i:${i}"><span>${m}</span><b>$0</b></li>`).join('')}</ol>
        <p class="ledger-total" aria-hidden="true"><span>${esc(f.ledger.totalLabel)}</span><b>$0</b></p>
      </figure>
    </div>
    <div class="fee-lists">
      <div class="grp rv"><h4>${esc(f.freeTitle)}</h4><ul>${f.free.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
      <div class="grp wide off rv" style="--d:.1s"><h4>${esc(f.extraTitle)}</h4><ul>${f.extra.map((x) => `<li>${esc(x)}</li>`).join('')}</ul></div>
    </div>
    <div class="fee-notes"><p>${esc(f.difference)}</p><p>${esc(f.scope)}</p></div>
    <div class="calc rv" data-calc>
      <div><h3 class="h3">${esc(c.title)}</h3><p class="calc-lead">${esc(c.lead)}</p></div>
      <div class="calc-form">
        <div class="calc-cols">
          <fieldset><legend>${esc(c.otherLabel)}</legend>
            <label>${esc(c.setupLabel)}<span class="money"><span>$</span><input type="text" inputmode="numeric" autocomplete="off" placeholder="0" data-c="setup" aria-label="비교할 견적 ${esc(c.setupLabel)}"></span></label>
            <label>${esc(c.monthlyLabel)}<span class="money"><span>$</span><input type="text" inputmode="numeric" autocomplete="off" placeholder="0" data-c="monthly" aria-label="비교할 견적 ${esc(c.monthlyLabel)}"></span></label>
          </fieldset>
          <div class="calc-pause"><p class="lbl">${esc(c.pauseLabel)}</p>
            <label>${esc(c.setupLabel)}<span class="fixed">$1,990</span></label>
            <label>${esc(c.monthlyLabel)}<span class="fixed">$0</span></label>
          </div>
        </div>
        <label class="calc-years"><span>${esc(c.yearsLabel)}</span><input type="range" min="1" max="10" step="1" value="5" data-c="years"><output data-o="years">5${esc(c.unit)}</output></label>
        <div class="calc-out" aria-live="polite"><p>${esc(c.otherLabel)} ${esc(c.totalLabel)}<strong data-o="other">—</strong></p><p>${esc(c.pauseLabel)} ${esc(c.totalLabel)}<strong data-o="pause">$1,990</strong></p></div>
        <p class="calc-note">${esc(c.product)} · ${esc(c.note)}</p>
      </div>
    </div>
  </div>
</section>`;
}

function processSec() {
  const p = C.process;
  const steps = p.steps.map((s, i) => `<li class="rv" style="--d:${i * 0.08}s"><span class="idx">${s.id}</span><h3 class="h3">${esc(s.title)}</h3><p class="hl">${esc(s.highlight)}</p><p class="d">${esc(s.desc)}</p></li>`).join('');
  const c = p.closing;
  return `<section class="sec sec-paper process" id="process" aria-labelledby="process-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(p.eyebrow)}</p><h2 class="h2 rv" id="process-title">${lines(p.title)}</h2><p class="lead rv" style="--d:.1s">${esc(p.subtitle)}</p></header>
    <ol class="steps">${steps}</ol>
    <blockquote class="closing rv"><p class="kicker">${esc(c.kicker)}</p><p class="quote">${esc(c.quote[0])}<em>${esc(c.quote[1])}</em>${esc(c.quote[2])}</p><p class="stmt">${esc(c.statement[0])}<em>${esc(c.statement[1])}</em>${esc(c.statement[2])}</p></blockquote>
  </div>
</section>`;
}

function pricingSec() {
  const p = C.pricing;
  const typeFor: Record<string, [string, string]> = { website: ['웹사이트 제작', 'WEBSITE · 소개와 문의'], store: ['웹사이트 제작', 'ONLINE STORE · 주문과 결제'], enterprise: ['AI 업무 자동화 · 맞춤 개발', ''] };
  const plans = p.plans.map((pl, i) => `<article class="plan${pl.featured ? ' featured' : ''} rv" style="--d:${i * 0.08}s" aria-labelledby="plan-${pl.key}">
      ${pl.featured ? `<span class="badge">${esc(p.featuredBadge)}</span>` : ''}<h3 class="plan-name" id="plan-${pl.key}">${esc(pl.name)}</h3><p class="type">${esc(pl.type)}</p>
      <p class="price">${esc(pl.price)}${pl.priceNote ? `<small>${esc(pl.priceNote)}</small>` : ''}</p>
      <ul>${pl.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      <a class="btn btn-solid" href="#contact" data-consult data-type="${esc(typeFor[pl.key][0])}"${typeFor[pl.key][1] ? ` data-product="${esc(typeFor[pl.key][1])}"` : ''}><span class="lb">${esc(p.planCta)}</span>${arrow()}</a>
    </article>`).join('');
  const terms = p.terms.map((t) => `<li><h4>${esc(t.title)}</h4><p>${esc(t.desc)}</p></li>`).join('');
  const rows = p.restaurant.rows.map((r) => `<tr><th scope="row">${esc(r[0])}</th><td>${esc(r[1])}</td></tr>`).join('');
  return `<section class="sec sec-dark pricing" id="pricing" aria-labelledby="pricing-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(p.eyebrow)}</p><h2 class="h2 rv" id="pricing-title">${lines([p.title])}</h2><p class="price-banner rv" style="--d:.1s">${p.banner.map((l) => `<span class="ln">${esc(l)}</span>`).join('')}</p><p class="currency rv" style="--d:.15s">${esc(p.currency)}</p></header>
    <div class="plans">${plans}</div>
    <div class="plan-film rv"><h3 class="plan-name">${esc(p.filmPlan.name)}</h3><p class="d">${esc(p.filmPlan.desc)}</p><div><p class="price">${esc(p.filmPlan.price)}</p><a class="btn-text" href="#contact" data-consult data-type="AI 영상광고">${esc(p.planCta)}${arrow()}</a></div></div>
    <p class="currency-note">${esc(p.currencyNote)}</p>
    <ul class="terms">${terms}</ul>
    <div class="restaurant"><div><h3 class="h3">${esc(p.restaurant.title)}</h3><p class="d">${esc(p.restaurant.desc)}</p></div><table class="rtable"><caption class="sr">식당 웹사이트 기능별 상품</caption><tbody>${rows}</tbody></table></div>
  </div>
</section>`;
}

function faqSec() {
  const f = C.faq;
  const items = f.items.map((it) => `<details><summary><span>${esc(it.q)}</span><span class="ic" aria-hidden="true"></span></summary><div class="a"><p>${esc(it.a)}</p></div></details>`).join('');
  return `<section class="sec sec-paper faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq-grid">
    <header class="sec-head"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 rv" id="faq-title">${lines(f.title)}</h2></header>
    <div class="faq-list rv">${items}</div>
  </div>
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: f.items.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })) }).replace(/</g, '\\u003c')}</script>
</section>`;
}

function contactSec() {
  const c = C.contactSection;
  const [u, d] = C.contact.email.split('@');
  return `<section class="sec sec-dark contact" id="contact" aria-labelledby="contact-title">
  <div class="wrap contact-grid">
    <div class="ct-main">
      <p class="ct-window rv"><span class="dot" aria-hidden="true"></span>${esc(c.windowLabel)} · ${esc(c.status)}</p>
      <h2 class="ct-title rv" id="contact-title"><span class="ln"><span>${esc(c.title[0].trim())}<br class="m-br"> <em>${esc(c.title[1])}</em></span></span><span class="ln" style="--li:1"><span>${esc(c.title[2])}${esc(c.title[3])}</span></span></h2>
      <p class="ct-desc rv" style="--d:.1s">${esc(c.desc[0])}${esc(c.desc[1])}<em>${esc(c.desc[2])}</em>${esc(c.desc[3])}</p>
      <div class="ctas rv" style="--d:.15s">${consultBtn(C.cta.consult)}${kakaoBtn()}</div>
      <p class="ct-note">${esc(c.channelsNote[0])}<em>${esc(c.channelsNote[1])}</em>${esc(c.channelsNote[2])}</p>
    </div>
    <div class="ct-cards">
      <article class="ct-card rv"><h3>${esc(c.sms.title)}</h3><a class="big" href="${C.contact.smsHref}">${esc(C.contact.smsLabel)}${arrow()}</a><p class="h">${esc(c.sms.label)} · ${esc(c.sms.hint)}</p></article>
      <article class="ct-card kakao rv" style="--d:.08s"><h3>${esc(c.kakao.title)}</h3><p class="big">${esc(C.contact.kakaoId)}</p><p class="h">${esc(c.kakao.idLabel)} · ${esc(c.kakao.hint)}</p><a class="btn-text" href="${C.contact.kakaoUrl}" target="_blank" rel="noopener">오픈채팅으로 바로 문의${arrow()}<span class="sr">(새 창)</span></a><img class="qr" src="/media/kakao-qr.png" alt="${esc(c.kakao.qrLabel)} — 카카오톡 아이디 ${esc(C.contact.kakaoId)}" width="233" height="236" loading="lazy"></article>
      <article class="ct-card rv" style="--d:.16s"><h3>${esc(c.email.title)}</h3><button class="reveal-btn" type="button" data-email-user="${esc(u)}" data-email-domain="${esc(d)}">${esc(c.email.label)}</button><p class="h">${esc(c.email.hint)}</p></article>
    </div>
  </div>
</section>`;
}

function footer() {
  const f = C.footer;
  const [u, d] = C.contact.email.split('@');
  return `<footer class="ft">
  <div class="wrap">
    <div class="ft-top">
      <a class="ft-logo" href="#top" aria-label="PAUSE Studio 처음으로"><img src="/brand/logo-cream.svg" alt="Pause Studio" width="210" height="106" loading="lazy"></a>
      <div class="ft-cols">
        <div><h3>Menu</h3><ul>${C.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}<li><a href="#contact">${esc(C.cta.header)}</a></li></ul></div>
        <div><h3>Contact</h3><ul><li><a href="${C.contact.kakaoUrl}" target="_blank" rel="noopener">카카오톡 오픈채팅</a></li><li><a href="${C.contact.smsHref}">${esc(C.contact.smsLabel)}</a></li><li>${esc(f.emailLabel)} · <button class="reveal-btn" type="button" style="font-size:inherit" data-email-user="${esc(u)}" data-email-domain="${esc(d)}">${esc(f.emailReveal)}</button></li></ul></div>
        <div><h3>Studio</h3><p>${esc(C.contact.address)}</p><p>${esc(C.contact.nzbn)}</p></div>
      </div>
    </div>
    <div class="ft-legal"><details><summary>${esc(f.legalLink)}</summary><div class="body">${f.legal.map((l) => `<p>${esc(l)}</p>`).join('')}</div></details></div>
    <div class="ft-bottom"><span>${esc(f.copyright)}</span><span>${esc(C.contact.address)} · ${esc(C.contact.nzbn)}</span></div>
  </div>
</footer>`;
}

function consultDialog() {
  const c = C.consult;
  const f = c.fields;
  const req = `<span class="req">${esc(c.required)}</span>`;
  const types = c.types.map((t, i) => `<label class="cs-type"><input type="radio" name="consultType" value="${esc(t.value)}"${i === 0 ? ' required' : ''}><b>${esc(t.label)}</b><span>${esc(t.desc)}</span></label>`).join('');
  const chips = (name: string, opts: string[], type = 'checkbox') => `<div class="chips">${opts.map((o) => `<label><input type="${type}" name="${name}" value="${esc(o)}">${esc(o)}</label>`).join('')}</div>`;
  const input = (name: string, label: string, type = 'text', required = false, extra = '') => `<label class="fld"><span>${esc(label)}${required ? req : ''}</span><input type="${type}" name="${name}"${required ? ' required' : ''}${extra}><span class="err" hidden></span></label>`;
  const text = (name: string, label: string, hint = '') => `<label class="fld"><span>${esc(label)}</span><textarea name="${name}"${hint ? ` placeholder="${esc(hint)}"` : ''}></textarea></label>`;
  return `<dialog class="cs" id="consult" aria-labelledby="cs-title">
  <form method="dialog" novalidate data-consult-form>
    <div class="hp" aria-hidden="true"><label>회사 홈페이지(비워 두세요)<input type="text" name="_hp" tabindex="-1" autocomplete="off"></label></div>
    <div class="cs-head"><h2 class="cs-title" id="cs-title">${esc(c.title)}</h2><button class="cs-x" type="button" data-cs-close aria-label="${esc(c.buttons.close)}"></button></div>
    <ol class="cs-prog" aria-label="진행 단계">${c.steps.map((s, i) => `<li${i === 0 ? ' aria-current="step"' : ''}>${String(i + 1).padStart(2, '0')} ${esc(s)}</li>`).join('')}</ol>
    <div class="cs-body">
      <section class="cs-step" data-step="0"><h3>어떤 상담이 필요하신가요?</h3><div class="cs-types" role="radiogroup" aria-label="상담 종류">${types}</div><p class="fld"><span class="err" data-err="type" hidden></span></p></section>
      <section class="cs-step" data-step="1" hidden>
        <div class="grid2">${input('company', f.company)}${input('name', f.name, 'text', true, ' autocomplete="name"')}</div>
        <div class="grid2">${input('email', f.email, 'email', true, ' autocomplete="email"')}${input('phone', f.phone, 'tel', false, ' autocomplete="tel"')}</div>
        <fieldset class="fld"><legend>${esc(f.country)}</legend>${chips('country', f.countries, 'radio')}</fieldset>
        <div class="grid2">${input('industry', f.industry)}${input('currentSite', f.currentSite, 'url', false, ' placeholder="https://"')}</div>
      </section>
      <section class="cs-step" data-step="2" hidden>
        <div class="cs-detail" data-detail="web"><h4>웹사이트</h4>
          <fieldset class="fld"><legend>${esc(f.product)}</legend>${chips('product', f.products, 'radio')}</fieldset>
          <fieldset class="fld"><legend>${esc(f.needs)}</legend>${chips('needs', f.needOptions)}</fieldset>
          <div class="grid2">${input('itemCount', f.itemCount)}${input('bookingPay', f.bookingPay)}</div>
          ${input('integrations', f.integrations)}
        </div>
        <div class="cs-detail" data-detail="film" hidden><h4>AI 영상광고</h4>
          <fieldset class="fld"><legend>${esc(f.videoUse)}</legend>${chips('videoUse', f.videoUses)}</fieldset>
          <fieldset class="fld"><legend>${esc(f.videoLength)}</legend>${chips('videoLength', f.videoLengths, 'radio')}</fieldset>
          ${input('photos', f.photos, 'text', false, ` placeholder="${esc(f.photosHint)}"`)}
          ${input('mood', f.mood)}
        </div>
        <div class="cs-detail" data-detail="ax" hidden><h4>AI 업무 자동화 · 맞춤 개발</h4>
          ${text('automation', f.automation)}
          ${input('systems', f.systems)}
        </div>
        <div class="cs-detail" data-detail="common">
          ${input('timeline', f.timeline)}
          ${text('message', f.message)}
          <label class="fld"><span>${esc(f.files)}</span><input type="file" name="attachment" multiple accept="image/*,.pdf,.doc,.docx,.ppt,.pptx,.zip"><span class="err" data-err="files" hidden></span><span class="h" style="font-size:13px;color:var(--on-paper-3)">${esc(f.filesHint)}</span></label>
        </div>
      </section>
      <section class="cs-step" data-step="3" hidden><h3>보내실 내용을 확인해 주세요</h3><dl class="cs-summary" data-summary></dl><p class="cs-privacy">${esc(f.privacy)}</p></section>
      <section class="cs-step cs-state" data-step="done" hidden><h3>${esc(c.success.title)}</h3><p>${esc(c.success.desc)}</p><div class="ctas"><button class="btn btn-solid" type="button" data-cs-close><span class="lb">${esc(c.buttons.done)}</span>${arrow()}</button></div></section>
      <section class="cs-step cs-state" data-step="fail" hidden><h3>${esc(c.failure.title)}</h3><p>${esc(c.failure.desc)}</p><div class="ctas"><a class="btn btn-solid" data-cs-mail href="#"><span class="lb">${esc(c.failure.mail)}</span>${arrow()}</a><button class="btn btn-line" type="button" data-cs-copy><span class="lb">${esc(c.failure.copy)}</span>${arrow()}</button><a class="btn btn-line" href="${C.contact.kakaoUrl}" target="_blank" rel="noopener"><span class="lb">${esc(c.failure.kakao)}</span>${arrow()}</a></div></section>
    </div>
    <div class="cs-foot" data-cs-foot><button class="btn btn-line" type="button" data-cs-prev hidden><span class="lb">${esc(c.buttons.prev)}</span></button><button class="btn btn-solid" type="button" data-cs-next style="margin-left:auto"><span class="lb">${esc(c.buttons.next)}</span>${arrow()}</button><button class="btn btn-solid" type="submit" data-cs-submit hidden style="margin-left:auto"><span class="lb">${esc(c.buttons.submit)}</span>${arrow()}</button></div>
  </form>
</dialog>`;
}

export function renderBody() {
  return [
    header(),
    '<main id="main">',
    hero(), work(), why(), who(), services(), film(), compare(), fee(), processSec(), pricingSec(), faqSec(), contactSec(),
    '</main>',
    footer(), lightbox(), consultDialog(),
  ].join('\n');
}

export function renderHead() {
  const m = C.meta;
  const ld = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'PAUSE Studio', alternateName: '퍼즈 스튜디오',
    description: m.description, url: m.canonical, image: m.ogImage, email: C.contact.email, telephone: '+64-20-488-7198',
    address: { '@type': 'PostalAddress', streetAddress: '75 Victoria Street West', addressLocality: 'Auckland', postalCode: '1010', addressCountry: 'NZ' },
    areaServed: ['NZ', 'US'], serviceType: ['웹사이트 제작', '온라인 스토어 제작', 'AI 업무 자동화', 'AI 영상광고'],
  };
  return `<title>${esc(m.title)}</title>
<meta name="description" content="${esc(m.description)}">
<meta name="keywords" content="${esc(m.keywords)}">
<link rel="canonical" href="${m.canonical}">
<meta name="google-site-verification" content="${m.googleSiteVerification}">
<meta property="og:type" content="website"><meta property="og:url" content="${m.canonical}"><meta property="og:title" content="${esc(m.ogTitle)}"><meta property="og:description" content="${esc(m.ogDescription)}"><meta property="og:image" content="${m.ogImage}"><meta property="og:locale" content="ko_KR">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(m.ogTitle)}"><meta name="twitter:description" content="${esc(m.ogDescription)}"><meta name="twitter:image" content="${m.ogImage}">
<meta name="theme-color" content="#0C0C0B">
<link rel="icon" href="/favicon.svg" type="image/svg+xml"><link rel="icon" href="/favicon.ico" sizes="any"><link rel="apple-touch-icon" href="/apple-touch-icon.png"><link rel="manifest" href="/site.webmanifest">
<script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}
