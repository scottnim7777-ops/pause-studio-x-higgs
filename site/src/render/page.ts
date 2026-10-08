/**
 * 문구(src/content/ko.ts) → 페이지 본문 HTML
 * 검색엔진·JS 꺼진 환경에서도 내용이 그대로 보이도록 빌드 시점에 HTML로 만든다(scripts/render.ts).
 * 순서(2026-10-08 개편): 히어로 → 포트폴리오 → WHY → 추천 대상
 *   → CHAPTER 01 웹사이트(비교 · 요금 · 관리비 $0 · 과정) → CHAPTER 02 AI 광고영상(샘플 · 요금·규격·추가 작업·과정)
 *   → 자주 묻는 질문(탭) → 마무리 선언 → 문의
 */
import fs from 'node:fs';
import path from 'node:path';
import * as C from '../content/ko';
import media from '../content/media.json';
import { signatureOutline, signatureStrokes } from '../assets/signature';

const PUB = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../public');
const exists = (p: string) => fs.existsSync(path.join(PUB, p));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** 문구 안의 '\n' = 의도한 줄바꿈 */
const nl = (s: string) => esc(s).replace(/\n/g, '<br>');

const arrow = (cls = 'ar') => `<svg class="${cls}" viewBox="0 0 30 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 6h28.5M23.5 1l5 5-5 5"/></svg>`;
const smallArrow = `<svg viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 5h13M9 1l4 4-4 4"/></svg>`;
const bubble = `<svg class="kk" viewBox="0 0 20 19" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M10 1.5c4.97 0 9 3.13 9 7s-4.03 7-9 7c-.86 0-1.69-.09-2.47-.27L3.5 17.5l1.06-3.37C2.39 12.86 1 10.83 1 8.5c0-3.87 4.03-7 9-7z"/></svg>`;
const check = `<svg class="ck" viewBox="0 0 14 11" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 5.6 5 9.4 13 1.4"/></svg>`;
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
const big = (base: string): Dim => { const m = M[base]; if (!m) return [1600, 900]; const k = Object.keys(m).sort((a, b) => m[b][0] - m[a][0])[0]; return m[k]; };

/** 통화별 글(ko.ts Txt): 문자열은 그대로, { NZD, USD }는 두 표기를 모두 넣고 CSS가 방문자 통화 하나만 보여 준다(빈 글은 넣지 않음) */
const t = (x: C.Txt) => typeof x === 'string' ? nl(x)
  : (['NZD', 'USD'] as const).filter((c) => x[c]).map((c) => `<span data-c="${c}">${nl(x[c])}</span>`).join('');
const CODE: C.Txt = { NZD: 'NZD', USD: 'USD' };
const isNum = (s: string) => /^\d/.test(s);
/** '1,490' → 통화 표기(작게) + 숫자 + 꼬리(부터, /월). 숫자가 아니면('맞춤 견적') 그대로 */
const priceHtml = (s: string, suffix = '') => isNum(s)
  ? `<span class="cur">${t(CODE)}</span> ${esc(s)}${suffix ? `<small>${esc(suffix)}</small>` : ''}`
  : `${esc(s)}${suffix ? `<small>${esc(suffix)}</small>` : ''}`;
/** 서비스·요금 버튼 → 상담 창에서 종류·상품 미리 선택(ko.ts consultPreset) */
const preset = (key: string) => {
  const p = C.consultPreset[key];
  return p ? ` data-type="${esc(p.type)}"${p.field ? ` data-field="${esc(p.field)}" data-value="${esc(p.value || '')}"` : ''}` : '';
};

const consultBtn = (label: string, cls = 'btn btn-solid', key = '') =>
  `<a class="${cls}" href="#contact" data-consult${key ? preset(key) : ''}><span class="lb">${esc(label)}</span>${arrow()}</a>`;
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
  <nav class="mnav-links" aria-label="모바일 메뉴">${C.nav.map((n, i) => `<a href="${n.href}" style="--i:${i}">${esc(n.label)}</a>`).join('')}<a href="#contact" style="--i:${C.nav.length}">${esc(C.cta.header)}</a></nav>
  <div class="ctas">${consultBtn(C.cta.consult)}${kakaoBtn()}</div>
</div>`;
}

/* ───────── 히어로: 작업물 벽 3줄 × 5개(반복을 위해 두 번) — 실제 고객 사이트 화면 ───────── */
const WALL = [
  ['ref01', 'ref03', 'ref11', 'ref07', 'ref13'],
  ['ref08', 'ref02', 'ref12', 'unframe', 'ref05'],
  ['ref14', 'ref04', 'ref15', 'ref06', 'ref10'],
];
const refNo = (i: number) => `Ref. ${String(i + 1).padStart(2, '0')}`;
const workIndex = (id: string) => C.work.items.findIndex((x) => x.id === id);
function wallCard(id: string) {
  const i = workIndex(id);
  const it = C.work.items[i];
  const b = `/media/work/${id}`;
  const [w, h] = dim(b, '880');
  const pic = `<picture><source type="image/webp" srcset="${b}-880.webp"><img src="${b}-880.jpg" alt="" width="${w}" height="${h}" decoding="async"></picture>`;
  const media = it.video && exists(`${b}.mp4`) ? `${pic}<video data-wall-video muted playsinline loop preload="none" data-src="${b}.mp4"></video>` : pic;
  return `<figure class="card"><div class="scr">${media}</div><figcaption>${refNo(i)}<i>${esc(it.category)}</i></figcaption></figure>`;
}
function hero() {
  const rows = WALL.map((r, i) => `<div class="row r${i}"><div class="track">${[...r, ...r].map(wallCard).join('')}</div></div>`).join('');
  const h = C.hero;
  const svc = h.services.map((s) => `<li><a class="svc-link" href="${s.href}"><span class="ix">${s.index}</span><span class="nm">${esc(s.name)}${smallArrow}</span><span class="d1">${esc(s.lead)}</span><span class="d2">${esc(s.desc)}</span></a></li>`).join('');
  return `<section class="hero" id="top" aria-labelledby="hero-title" data-hero>
  <div class="hero-wall" aria-hidden="true"><div class="stage" data-stage><div class="plane" data-plane>${rows}</div><div class="veil"></div></div></div>
  <div class="hero-in">
    <p class="hero-eb"><span class="rule"></span>${esc(h.eyebrow)}</p>
    <h1 class="hero-title" id="hero-title"><span class="sr">${esc(h.titleLines.join(' '))}</span><span class="tt" aria-hidden="true" data-type-title><span class="l1">${esc(h.titleLinesMobile[0])}</span><span class="l2">${esc(h.titleLinesMobile[1])} </span><span class="l3">${esc(h.titleLinesMobile[2])}</span></span></h1>
    <p class="hero-sub">${esc(h.sub[0])}<br> ${esc(h.sub[1])}</p>
    <div class="ctas">${consultBtn(C.cta.consult)}${kakaoBtn()}</div>
    <ul class="hero-svc" aria-label="서비스">${svc}</ul>
  </div>
  <button class="wall-toggle" type="button" aria-pressed="false" data-wall-toggle><span>움직임 멈추기</span></button>
</section>`;
}

/* ───────── 포트폴리오: 같은 크기 칸, 화면은 자르지 않고(흐린 같은 화면 위에 띄움), 영상은 늘 반복 재생 ───────── */
function work() {
  const w = C.work;
  const items = w.items.map((it, i) => {
    const b = `/media/work/${it.id}`;
    const [iw, ih] = big(b);
    const hasVid = it.video && exists(`${b}.mp4`);
    const vid = hasVid ? `<video class="wk-vid" muted playsinline loop preload="none" data-loop data-src="${b}.mp4" width="${iw}" height="${ih}" aria-hidden="true"></video>` : '';
    return `<li class="wk rv" style="--d:${(i % 4) * 0.06}s"><button class="wk-btn" type="button" data-work="${i}" aria-label="${esc(`${refNo(i)} ${it.category} 크게 보기`)}">
      <span class="wk-media"><img class="wk-bg" src="${b}-880.jpg" alt="" aria-hidden="true" loading="lazy" decoding="async"><span class="wk-fit" style="--ar:${(iw / ih).toFixed(4)}">${img(b, `${refNo(i)} ${it.category} 웹사이트 화면`, '(max-width: 1279px) 46vw, 23vw', 'wk-img')}${vid}</span></span>
      <span class="wk-cap"><span class="wk-ref">${refNo(i)}</span><span class="wk-cat">${esc(it.category)}</span>${arrow()}</span>
    </button></li>`;
  }).join('');
  const next = `<li class="wk-next rv"><a class="wk-next-in" href="#contact" data-consult><span class="kicker">${esc(w.next.kicker)}</span><strong>${nl(w.next.title)}</strong><span class="btn-text">${esc(C.cta.free)}${arrow()}</span></a></li>`;
  const data = JSON.stringify(w.items.map((it, i) => {
    const b = `/media/work/${it.id}`;
    const [iw, ih] = dim(b, '1920');
    return { ref: refNo(i), category: it.category, image: `${b}-1920`, w: iw, h: ih, video: it.video && exists(`${b}.mp4`) ? `${b}.mp4` : '' };
  }));
  return `<section class="sec sec-dark work" id="work" aria-labelledby="work-title">
  <div class="wrap">
    <header class="sec-head work-head"><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="h2 rv" id="work-title">${lines(w.title)}</h2><p class="lead rv" style="--d:.1s">${esc(w.lead)}</p><button class="motion-toggle" type="button" aria-pressed="false" data-motion-toggle><span>움직임 멈추기</span></button></header>
    <ul class="work-grid" data-work-grid>${items}${next}</ul>
  </div>
  <span class="wk-cursor" aria-hidden="true" data-wk-cursor>${esc(w.view)}</span>
  <script type="application/json" id="work-data">${data.replace(/</g, '\\u003c')}</script>
</section>`;
}

function lightbox() {
  return `<dialog class="lightbox" id="lightbox" aria-label="작업물 크게 보기">
  <div class="lb-in">
    <div class="lb-top"><span data-lb-count>01 / ${String(C.work.items.length).padStart(2, '0')}</span><button class="lb-close" type="button" data-lb-close><span>닫기</span><i aria-hidden="true"></i></button></div>
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
  const pillars = w.pillars.map((p, i) => `<li class="rv" style="--d:${(i % 3) * 0.1}s"><span class="idx">0${i + 1}</span><h3 class="h3">${esc(p.title)}</h3><p>${esc(p.desc)}</p></li>`).join('');
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
  const items = w.items.map((x, i) => `<li class="rv" style="--d:${(i % 3) * 0.06}s"><span class="idx">${String(i + 1).padStart(2, '0')}</span><p>${esc(x)}</p></li>`).join('');
  return `<section class="sec sec-paper who" id="who" aria-labelledby="who-title">
  <div class="wrap who-grid">
    <header class="sec-head"><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="h2 rv" id="who-title">${lines(w.title)}</h2><p class="lead rv" style="--d:.1s">${esc(w.lead)}</p></header>
    <ol class="who-list">${items}</ol>
  </div>
</section>`;
}

/* ───────── 장 첫 화면: 아주 큰 영문 단어가 스크롤에 따라 옆으로 천천히 흐름 ───────── */
function chapter(key: 'website' | 'video') {
  const c = C.chapters[key];
  return `<section class="chapter ch-${key}" id="${key}" aria-labelledby="ch-${key}" data-scrub>
  <div class="wrap">
    <p class="ch-index rv">${esc(c.index)}</p>
    <h2 class="ch-word rv" id="ch-${key}"><span class="sr">${esc(c.ko)}</span><span class="ch-move" aria-hidden="true">${esc(c.word)}</span></h2>
    <div class="ch-foot"><p class="ch-ko rv" aria-hidden="true">${esc(c.ko)}</p><p class="ch-lead rv" style="--d:.1s">${nl(c.lead)}</p></div>
  </div>
</section>`;
}

/* ───────── 비교: BEFORE(흔한 템플릿 예시 화면)를 손잡이로 밀어 AFTER(실제 사이트 녹화)와 비교 ───────── */
function mock(m: C.CompareCase['mock']) {
  const b = m.image;
  const has = exists(`${b}-880.jpg`);
  const pic = has ? `<picture><source type="image/webp" srcset="${b}-880.webp"><img src="${b}-880.jpg" alt="" loading="lazy" decoding="async"></picture>` : '';
  return `<div class="mock" style="--acc:${m.accent}${has ? `;--img:url(${b}-880.jpg)` : ''}" aria-hidden="true">
    <div class="m-bar"><b>${esc(m.brand)}</b><span class="m-nav">${m.nav.map((n, i) => `<i${i === 0 ? ' class="on"' : ''}>${esc(n)}</i>`).join('')}</span><span class="m-btn">${esc(m.btn)}</span></div>
    <div class="m-hero">${pic}<div class="m-copy"><span class="m-h">${esc(m.title)}</span><span class="m-p">${esc(m.sub)}</span><span class="m-cta">${esc(m.btn)}</span></div></div>
    <div class="m-sec"><span class="m-st">Our Services</span><span class="m-cards">${m.cards.map(([t, d]) => `<span class="m-card"><span class="m-thumb"></span><b>${esc(t)}</b><span>${esc(d)}</span></span>`).join('')}</span></div>
  </div>`;
}
function compare() {
  const c = C.compare;
  const cases = c.cases.map((cs, i) => {
    const [vw, vh] = dim(cs.media, '880');
    const [bw, bh] = big(cs.media);
    return `<figure class="cmp-case rv"${i ? ' style="--d:.08s"' : ''}>
    <div class="cmp-frame" style="--ar:${bw}/${bh}" data-cmp>
      <div class="cmp-after"><video muted playsinline loop preload="none" data-auto data-src="${cs.media}.mp4" poster="${cs.media}-880.jpg" width="${vw}" height="${vh}" aria-label="${esc(`${cs.label} · PAUSE가 만든 실제 사이트 화면 녹화`)}"></video></div>
      <div class="cmp-before">${mock(cs.mock)}</div>
      <span class="cmp-tag b" aria-hidden="true">${esc(c.before)}</span><span class="cmp-tag a" aria-hidden="true">${esc(c.after)}</span>
      <span class="cmp-handle" aria-hidden="true"><i>${smallArrow}${smallArrow}</i></span>
      <input class="cmp-range" type="range" min="0" max="100" value="50" step="1" aria-label="${esc(`${c.handle} · ${cs.label}`)}">
      ${vctrl()}
    </div>
    <figcaption class="cmp-cap"><span class="b"><b>${esc(c.before)}</b>${esc(c.beforeSub)}</span><span class="cat">${esc(cs.label)}</span><span class="a"><b>${esc(c.after)}</b>${esc(c.afterSub)}</span></figcaption>
  </figure>`;
  }).join('');
  return `<section class="sec sec-paper compare" id="compare" aria-labelledby="compare-title">
  <div class="wrap">
    <div class="cmp-head"><header><p class="eyebrow rv">${esc(c.eyebrow)}</p><h2 class="cmp-title rv" id="compare-title">${esc(c.title)}</h2></header><p class="lead rv">${nl(c.lead)}</p></div>
    ${cases}
  </div>
</section>`;
}

/* ───────── 웹사이트 요금: 견적서 플랜, 이 플랜만의 기능은 위에 크게(+), 기본 포함은 체크 목록으로 또렷하게 ───────── */
function planCard(pl: C.Plan, i: number) {
  const p = C.pricing;
  const adds = pl.base
    ? `<p class="pl-lab add"><span class="plus" aria-hidden="true">+</span>${esc(pl.addsTitle)}</p><ul class="adds">${pl.adds.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
    : `<p class="pl-lab">${esc(pl.addsTitle)}</p><ul class="chk">${pl.adds.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul>`;
  const base = pl.base ? `<div class="pl-base"><p class="pl-lab">${esc(p.baseLabel)}</p><ul class="chk">${pl.base.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul></div>` : '';
  return `<article class="plan${pl.featured ? ' featured' : ''} rv" style="--d:${i * 0.08}s" aria-labelledby="plan-${pl.key}">
      ${pl.featured ? `<span class="badge">${esc(p.featuredBadge)}</span>` : ''}<h3 class="plan-name" id="plan-${pl.key}">${esc(pl.name)}</h3><p class="type">${esc(pl.type)}</p>
      <p class="price">${priceHtml(pl.price)}</p>
      <p class="pl-target"><span>${esc(p.targetLabel)}</span>${esc(pl.target)}</p>
      <div class="pl-body">${adds}${base}</div>
      ${consultBtn(C.cta.free, 'btn btn-solid', pl.key)}
    </article>`;
}
function pricingSec() {
  const p = C.pricing;
  const free = p.free.map((x, i) => `<li><span class="idx">${String(i + 1).padStart(2, '0')}</span><b>${esc(x.title)}</b>${x.note ? `<span class="n">${esc(x.note)}</span>` : ''}</li>`).join('');
  const notes = p.notes.map((n) => `<li>${t(n)}</li>`).join('');
  return `<section class="sec sec-dark pricing" id="pricing" aria-labelledby="pricing-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(p.eyebrow)}<span class="ko"> · ${esc(p.title)}</span></p><h2 class="h2 price-hook rv" id="pricing-title">${lines(p.banner)}</h2><p class="lead rv" style="--d:.12s">${nl(p.bannerLead)}</p><p class="currency rv" style="--d:.15s">${t(C.currencyChip)}</p></header>
    <div class="plans">${p.plans.map(planCard).join('')}</div>
    <div class="free-band rv"><h3 class="fb-title">${esc(p.freeTitle[0])} <br>${esc(p.freeTitle[1])}</h3><ul>${free}</ul></div>
    <div class="pnotes rv"><h3 class="pnotes-title">${esc(p.notesTitle)}</h3><ol>${notes}</ol></div>
  </div>
</section>`;
}

/* ───────── 관리비 $0 + 총비용 계산기 ───────── */
function fee() {
  const f = C.fee;
  const c = f.calc;
  const setup = `$${c.pauseSetup.toLocaleString('en-US')}`;
  const extra = f.extra.map((x) => `<li><b>${esc(x.title)}</b><span>${esc(x.desc)}</span></li>`).join('');
  return `<section class="sec sec-black fee" id="fee" aria-labelledby="fee-title">
  <div class="wrap">
    <div class="fee-top">
      <header class="sec-head" style="margin:0"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 fee-title rv" id="fee-title">${lines(f.title)}</h2><p class="lead rv" style="--d:.1s">${nl(f.lead)}</p></header>
      <figure class="ledger rv" style="--d:.15s" role="img" aria-label="${esc(f.ledger.aria)}" data-ledger>
        <div class="ledger-head" aria-hidden="true"><span>${esc(f.ledger.head[0])}</span><span>${esc(f.ledger.head[1])}</span></div>
        <p class="ledger-zero" aria-hidden="true"><span>$0</span></p>
        <ol class="ledger-months" aria-hidden="true">${f.ledger.months.map((m, i) => `<li style="--i:${i}"><span>${m}</span><b>$0</b></li>`).join('')}</ol>
        <p class="ledger-total" aria-hidden="true"><span>${esc(f.ledger.totalLabel)}</span><b>$0</b></p>
      </figure>
    </div>
    <div class="fee-lists">
      <div class="fl-free rv"><h3>${esc(f.freeTitle)}</h3><ul class="chk">${f.free.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul></div>
      <div class="fl-extra rv" style="--d:.1s"><h3>${esc(f.extraTitle)}</h3><ul>${extra}</ul></div>
    </div>
    <div class="fee-notes">${f.notes.map((n) => `<p class="rv">${nl(n)}</p>`).join('')}</div>
    <div class="calc rv" data-calc data-pause-setup="${c.pauseSetup}">
      <div><h3 class="h3">${esc(c.title)}</h3><p class="calc-lead">${nl(c.lead)}</p></div>
      <div class="calc-form">
        <div class="calc-cols">
          <fieldset><legend>${esc(c.otherLabel)}</legend>
            <label>${esc(c.setupLabel)}<span class="money"><span>$</span><input type="text" inputmode="numeric" autocomplete="off" placeholder="0" data-c="setup" aria-label="${esc(c.otherLabel)} ${esc(c.setupLabel)}"></span></label>
            <label>${esc(c.monthlyLabel)}<span class="money"><span>$</span><input type="text" inputmode="numeric" autocomplete="off" placeholder="0" data-c="monthly" aria-label="${esc(c.otherLabel)} ${esc(c.monthlyLabel)}"></span></label>
          </fieldset>
          <div class="calc-pause"><p class="lbl"><img src="/brand/logo-cream.svg" alt="${esc(c.pauseLabel)}" width="204" height="103"></p>
            <label>${esc(c.setupLabel)}<span class="fixed">${setup}</span></label>
            <label>${esc(c.monthlyLabel)}<span class="fixed">$0</span></label>
          </div>
        </div>
        <label class="calc-years"><span>${esc(c.yearsLabel)}</span><input type="range" min="1" max="10" step="1" value="5" data-c="years"><output data-o="years">5${esc(c.unit)}</output></label>
        <div class="calc-out">
          <p><span>${esc(c.otherLabel)} ${esc(c.totalLabel)}</span><strong data-o="other">$0</strong><i class="bar" data-bar="other"></i></p>
          <p class="pause"><span>${esc(c.pauseLabel)} ${esc(c.totalLabel)}</span><strong data-o="pause">${setup}</strong><i class="bar" data-bar="pause"></i></p>
        </div>
        <p class="calc-save" data-save hidden><span>${esc(c.saveLabel)}</span><strong data-o="save">$0</strong></p>
        <p class="sr" aria-live="polite" data-calc-live></p>
        <p class="calc-note">${t(c.product)} · ${esc(c.note)}</p>
      </div>
    </div>
  </div>
</section>`;
}

function processSec() {
  const p = C.process;
  const steps = p.steps.map((s, i) => `<li class="rv" style="--d:${i * 0.08}s"><span class="idx">${s.id}</span><h3 class="h3">${esc(s.title)}</h3><p class="hl">${esc(s.highlight)}</p><p class="d">${esc(s.desc)}</p></li>`).join('');
  return `<section class="sec sec-paper process" id="process" aria-labelledby="process-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(p.eyebrow)}</p><h2 class="h2 rv" id="process-title">${lines(p.title)}</h2><p class="lead rv" style="--d:.1s">${esc(p.subtitle)}</p></header>
    <ol class="steps">${steps}</ol>
  </div>
</section>`;
}

/* ───────── AI 광고영상 샘플: BEFORE 사진 → AFTER 광고영상, 아래 탭으로 넘김 ───────── */
function film() {
  const f = C.film;
  const ready = f.samples.filter((s) => exists(s.video) && exists(s.before));
  const panels = ready.map((s, i) => `<div class="fs-panel" id="fs-${s.key}" role="tabpanel" aria-labelledby="fs-tab-${s.key}" data-fs-panel${i ? ' hidden' : ''}>
      <figure class="fs-before"><div class="media"><img src="${s.before}" alt="${esc(s.beforeAlt)}" loading="lazy" decoding="async" width="1200" height="900"></div><figcaption><b>${esc(f.before)}</b>${esc(f.beforeSub)}</figcaption></figure>
      <svg class="fs-arrow" viewBox="0 0 60 14" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 7h58M52 1l6 6-6 6"/></svg>
      <figure class="fs-after"><div class="media"><video muted playsinline loop preload="none" data-auto data-fs-video data-src="${s.video}" poster="${s.poster}" width="1280" height="720" aria-label="${esc(`${s.brand} ${s.type}: ${s.videoLabel}`)}"></video>${vctrl()}</div><figcaption><b>${esc(f.after)}</b>${esc(s.type)}<span class="brand">${esc(s.brand)} · ${esc(s.industry)}</span></figcaption></figure>
    </div>`).join('');
  const tabs = ready.map((s, i) => `<button class="fs-tab" type="button" role="tab" id="fs-tab-${s.key}" aria-controls="fs-${s.key}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''} data-fs-tab="${i}"><span class="idx">${String(i + 1).padStart(2, '0')}</span><b>${esc(s.brand)}</b><span class="d">${esc(s.industry)} · ${esc(s.type)}</span><i class="bar" aria-hidden="true"></i></button>`).join('');
  return `<section class="sec sec-black film" id="film" aria-labelledby="film-title">
  <div class="wrap">
    <div class="film-grid"><header class="sec-head" style="margin:0"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 rv" id="film-title">${lines(f.title)}</h2></header><p class="lead rv" style="--d:.1s">${nl(f.lead)}</p></div>
    <div class="fs rv" data-fs>
      <div class="fs-stage">${panels}</div>
      <div class="fs-tabs" role="tablist" aria-label="샘플 광고">${tabs}</div>
    </div>
  </div>
</section>`;
}

/* ───────── AI 광고영상 요금·규격·추가 작업·과정 ───────── */
function videoPlanCard(pl: C.VideoPlan, i: number) {
  const specs = pl.specs.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  return `<article class="vplan${pl.featured ? ' featured' : ''} rv" style="--d:${i * 0.08}s" aria-labelledby="vplan-${pl.key}">
      ${pl.badge ? `<span class="badge">${esc(pl.badge)}</span>` : ''}<h3 class="plan-name" id="vplan-${pl.key}">${esc(pl.name)}</h3>
      <p class="tagline">${esc(pl.tagline)}</p>
      <p class="price">${priceHtml(pl.price, pl.suffix)}</p>
      <dl class="specs">${specs}</dl>
      <p class="desc">${esc(pl.desc)}</p>
      ${consultBtn(C.cta.free, 'btn btn-solid', pl.key)}
    </article>`;
}
function videoPricing() {
  const v = C.videoPricing;
  const fm = v.formats;
  const formats = fm.items.map((x, i) => `<li class="fmt fmt-${i ? 'v' : 'h'}"><span class="frame" aria-hidden="true"><span>${esc(x.ratio)}</span></span><b>${esc(x.name)} <em>${esc(x.ratio)}</em></b><span class="size">${esc(x.size)}</span><span class="use">${esc(x.use)}</span></li>`).join('');
  const mo = v.monthly;
  const rows = v.addons.rows.map(([k, price, unit]) => `<tr><th scope="row">${esc(k)}</th><td>${isNum(price) ? `${t(CODE)} ${esc(price)}${unit ? ` <small>${esc(unit)}</small>` : ''}` : esc(price)}</td></tr>`).join('');
  const steps = v.steps.map((s, i) => `<li class="rv" style="--d:${i * 0.06}s"><span class="idx">${s.id}</span><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></li>`).join('');
  const sched = v.schedule.map(([k, d]) => `<div><dt>${esc(k)}</dt><dd>${esc(d)}</dd></div>`).join('');
  return `<section class="sec sec-dark vpricing" id="video-pricing" aria-labelledby="vpricing-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(v.eyebrow)}<span class="ko"> · ${esc(v.title)}</span></p><h2 class="h2 rv" id="vpricing-title">${lines(v.heading)}</h2><p class="lead rv" style="--d:.12s">${nl(v.lead)}</p><p class="currency rv" style="--d:.15s">${t(C.currencyChip)}</p></header>
    <div class="formats rv">
      <div class="fm-copy"><p class="kicker">${esc(fm.kicker)}</p><h3>${nl(fm.title)}</h3><p>${esc(fm.desc)}</p></div>
      <ul class="fm-list">${formats}</ul>
    </div>
    <div class="vplans">${v.plans.map(videoPlanCard).join('')}</div>
    <div class="v-included rv"><h3>${esc(v.includedTitle)}</h3><ul class="chk">${v.included.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul></div>
    <article class="vmonthly rv" aria-labelledby="vplan-monthly">
      <div class="vm-head"><span class="label">${esc(mo.label)}</span><h3 class="plan-name" id="vplan-monthly">${esc(mo.name)}</h3><p class="tagline">${esc(mo.tagline)}</p></div>
      <div class="vm-body"><p class="price">${priceHtml(mo.price, mo.suffix)}</p><ul class="chk">${mo.specs.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul><p class="desc">${esc(mo.desc)}</p><p class="note">${esc(mo.note)}</p></div>
      <div class="vm-cta">${consultBtn(C.cta.free, 'btn btn-line', 'monthly')}</div>
    </article>
    <p class="v-revisions rv">${esc(v.revisions)}</p>
    <details class="addons rv" data-acc><summary><span>${esc(v.addons.toggle)}</span><span class="ic" aria-hidden="true"></span></summary><div class="acc-body"><div class="acc-in"><table class="addon-table"><caption class="sr">${esc(v.addons.title)}</caption><tbody>${rows}</tbody></table><p class="addon-note">${esc(v.addons.note)}</p></div></div></details>
    <div class="vflow">
      <div><h3 class="vflow-title rv">${esc(v.stepsTitle)}</h3><ol class="vsteps">${steps}</ol></div>
      <div class="vsched rv"><h3 class="vflow-title">${esc(v.scheduleTitle)}</h3><dl>${sched}</dl><p>${esc(v.scheduleNote)}</p></div>
    </div>
    <div class="vnotes rv"><h3 class="pnotes-title">${esc(v.notesTitle)}</h3><ul>${v.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul></div>
  </div>
</section>`;
}

/* ───────── 자주 묻는 질문: 웹사이트 / AI 광고영상 탭 ───────── */
function faqSec() {
  const f = C.faq;
  const tabs = f.tabs.map((tb, i) => `<button class="faq-tab" type="button" role="tab" id="faq-tab-${tb.key}" aria-controls="faq-${tb.key}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''} data-faq-tab><span>${esc(tb.label)}</span><small>${tb.items.length}</small></button>`).join('');
  const panels = f.tabs.map((tb, i) => `<div class="faq-list" id="faq-${tb.key}" role="tabpanel" aria-labelledby="faq-tab-${tb.key}" data-faq-panel${i ? ' hidden' : ''}>${tb.items.map((it) => `<details data-acc><summary><span>${esc(it.q)}</span><span class="ic" aria-hidden="true"></span></summary><div class="acc-body"><div class="acc-in"><p>${esc(it.a)}</p></div></div></details>`).join('')}</div>`).join('');
  const all = f.tabs.flatMap((tb) => tb.items);
  return `<section class="sec sec-paper faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq-grid">
    <header class="sec-head"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 rv" id="faq-title">${lines(f.title)}</h2><div class="faq-tabs rv" role="tablist" aria-label="질문 분류">${tabs}</div></header>
    <div class="faq-panels rv">${panels}</div>
  </div>
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: all.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })) }).replace(/</g, '\\u003c')}</script>
</section>`;
}

/* ───────── 마무리 선언: 스크롤에 따라 단어가 하나씩 밝아짐 ───────── */
function manifesto() {
  const m = C.manifesto;
  let n = 0;
  const words = m.lines.map((ln) => `<span class="ln">${ln.split(' ').map((w, i, all) => `<span class="w" style="--i:${n++}">${esc(w)}</span>${i < all.length - 1 ? ([...w].length === 1 ? '&nbsp;' : ' ') : ''}`).join('')}</span>`).join('');
  return `<section class="manifesto" id="manifesto" aria-labelledby="mf-title" data-manifesto style="--n:${n}">
  <div class="wrap">
    <p class="mf-kicker rv">${esc(m.kicker)}</p>
    <h2 class="mf-big" id="mf-title"><span class="sr">${esc(m.lines.join(' '))}</span><span aria-hidden="true">${words}</span></h2>
    <p class="mf-stmt rv">${esc(m.statement)}</p>
    <p class="mf-sign rv">${esc(m.sign)}</p>
  </div>
</section>`;
}

function contactSec() {
  const c = C.contactSection;
  const [u, d] = C.contact.email.split('@');
  const ph = c.phone;
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
      <article class="ct-card phone rv"><h3>${esc(ph.title)}</h3>
        <button class="big" type="button" aria-expanded="false" aria-controls="ph-menu" data-phone>${esc(C.contact.phoneLabel)}${arrow()}</button>
        <div class="ph-menu" id="ph-menu" hidden data-phone-menu><a href="${C.contact.telHref}">${esc(ph.call)}</a><a href="${C.contact.smsHref}">${esc(ph.sms)}</a><button type="button" data-phone-copy data-copied="${esc(ph.copied)}">${esc(ph.copy)}</button></div>
        <p class="h">${esc(ph.hint)}</p></article>
      <article class="ct-card kakao rv" style="--d:.08s"><h3>${esc(c.kakao.title)}</h3><p class="big">${esc(C.contact.kakaoId)}</p><p class="h">${esc(c.kakao.idLabel)} · ${esc(c.kakao.hint)}</p><a class="btn-text" href="${C.contact.kakaoUrl}" target="_blank" rel="noopener">오픈채팅으로 바로 문의${arrow()}<span class="sr">(새 창)</span></a><img class="qr" src="/media/kakao-qr.png" alt="${esc(c.kakao.qrLabel)}: 카카오톡 아이디 ${esc(C.contact.kakaoId)}" width="233" height="236" loading="lazy"></article>
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
        <div><h3>Contact</h3><ul><li><a href="${C.contact.kakaoUrl}" target="_blank" rel="noopener">카카오톡 오픈채팅</a></li><li><a href="${C.contact.telHref}">${esc(C.contact.phoneLabel)}</a></li><li>${esc(f.emailLabel)} · <button class="reveal-btn" type="button" style="font-size:inherit" data-email-user="${esc(u)}" data-email-domain="${esc(d)}">${esc(f.emailReveal)}</button></li></ul></div>
        <div><h3>Studio</h3><p>${esc(C.contact.address)}</p><p>${esc(C.contact.nzbn)}</p></div>
      </div>
    </div>
    <div class="ft-legal"><details data-acc><summary><span>${esc(f.legalLink)}</span><span class="ic" aria-hidden="true"></span></summary><div class="acc-body"><div class="acc-in body">${f.legal.map((l) => `<p>${esc(l)}</p>`).join('')}</div></div></details></div>
    <div class="ft-bottom"><span>${esc(f.copyright)}</span><span>${esc(C.contact.address)} · ${esc(C.contact.nzbn)}</span></div>
  </div>
</footer>`;
}

function consultDialog() {
  const c = C.consult;
  const f = c.fields;
  const req = `<span class="req">${esc(c.required)}</span>`;
  const types = c.types.map((x, i) => `<label class="cs-type"><input type="radio" name="consultType" value="${esc(x.value)}"${i === 0 ? ' required' : ''}><b>${esc(x.label)}</b><span>${esc(x.desc)}</span></label>`).join('');
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
        <div class="cs-detail" data-detail="film" hidden><h4>AI 광고영상</h4>
          <fieldset class="fld"><legend>${esc(f.videoProduct)}</legend>${chips('videoProduct', f.videoProducts, 'radio')}</fieldset>
          <fieldset class="fld"><legend>${esc(f.videoUse)}</legend>${chips('videoUse', f.videoUses)}</fieldset>
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
      <section class="cs-step cs-state" data-step="done" hidden><span class="cs-ok" aria-hidden="true">${check}</span><h3>${esc(c.success.title)}</h3><p>${esc(c.success.desc)}</p><div class="ctas"><button class="btn btn-solid" type="button" data-cs-close><span class="lb">${esc(c.buttons.done)}</span>${arrow()}</button></div></section>
      <section class="cs-step cs-state" data-step="fail" hidden><h3>${esc(c.failure.title)}</h3><p>${esc(c.failure.desc)}</p><div class="ctas"><a class="btn btn-solid" data-cs-mail href="#"><span class="lb">${esc(c.failure.mail)}</span>${arrow()}</a><button class="btn btn-line" type="button" data-cs-copy><span class="lb">${esc(c.failure.copy)}</span>${arrow()}</button><a class="btn btn-line" href="${C.contact.kakaoUrl}" target="_blank" rel="noopener"><span class="lb">${esc(c.failure.kakao)}</span>${arrow()}</a></div></section>
    </div>
    <div class="cs-foot" data-cs-foot><button class="btn btn-line" type="button" data-cs-prev hidden><span class="lb">${esc(c.buttons.prev)}</span></button><button class="btn btn-solid" type="button" data-cs-next style="margin-left:auto"><span class="lb">${esc(c.buttons.next)}</span>${arrow()}</button><button class="btn btn-solid" type="submit" data-cs-submit hidden style="margin-left:auto"><span class="lb">${esc(c.buttons.submit)}</span>${arrow()}</button></div>
  </form>
</dialog>`;
}

/**
 * 줄바꿈 다듬기(2026-10-08 사용자: 줄바꿈 신경 쓸 것): 한 글자 낱말(쓸·더·웹·월…) 뒤의 공백과 'Full HD MP4'를 붙는 공백으로.
 * 'ㅇㅇ을 쓸 / 곳을'처럼 한 글자만 줄 끝에 남지 않는다. 태그 안(속성 값)과 <script>는 건드리지 않는다.
 */
const glue = (html: string) => html.replace(/(<script[\s\S]*?<\/script>)|(?<=>)([^<]+)(?=<)/g, (m, script, text) => script ? m
  : text.replace(/(?<=^|[\s(\u00A0])([가-힣])[ ](?=[^\s])/g, '$1\u00A0').replace(/Full HD MP4/g, 'Full\u00A0HD\u00A0MP4'));

export function renderBody() {
  return glue([
    header(),
    '<main id="main">',
    hero(), work(), why(), who(),
    chapter('website'), compare(), pricingSec(), fee(), processSec(),
    chapter('video'), film(), videoPricing(),
    faqSec(), manifesto(), contactSec(),
    '</main>',
    footer(), lightbox(), consultDialog(),
  ].join('\n'));
}

export function renderHead() {
  const m = C.meta;
  const ld = {
    '@context': 'https://schema.org', '@type': 'ProfessionalService', name: 'PAUSE Studio', alternateName: '퍼즈 스튜디오',
    description: m.description, url: m.canonical, image: m.ogImage, email: C.contact.email, telephone: '+64-20-488-7198',
    address: { '@type': 'PostalAddress', streetAddress: '75 Victoria Street West', addressLocality: 'Auckland', postalCode: '1010', addressCountry: 'NZ' },
    areaServed: ['NZ', 'US'], serviceType: ['웹사이트 제작', '비즈니스 웹사이트(예약·주문·결제) 제작', 'AI 업무 자동화', 'AI 광고영상 제작'],
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
