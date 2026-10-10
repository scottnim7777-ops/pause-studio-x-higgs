/**
 * 문구(src/content/ko.ts) → 페이지 본문 HTML
 * 검색엔진·JS 꺼진 환경에서도 내용이 그대로 보이도록 빌드 시점에 HTML로 만든다(scripts/render.ts).
 * 순서(2026-10-08 개편): 히어로 → 포트폴리오 → WHY → 추천 대상
 *   → CHAPTER 01 웹사이트(비교 · 요금 · 관리비 $0 · 과정) → CHAPTER 02 AI 광고영상(샘플 · 요금·규격·추가 작업·과정)
 *   → 자주 묻는 질문(탭) → 마무리 선언 → 문의
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as C from '../content/ko';
import media from '../content/media.json';
import { signatureOutline, signatureStrokes } from '../assets/signature';

const PUB = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public');
const exists = (p: string) => fs.existsSync(path.join(PUB, p));
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
/** 문구 안의 '\n' = 의도한 줄바꿈 */
/**
 * 구절 단위 줄바꿈(2026-10-09 사용자: 모바일에서도 '웹사이트 제작부터 AI 영상 제작까지,' 뒤에서 줄이 바뀌는 게 보기 좋음):
 * 쉼표·마침표 뒤에서 나눈 구절을 inline-block으로 묶어, 줄 끝에 다 안 들어가면 구절째 다음 줄로 넘어가게. 괄호 안 쉼표는 나누지 않음
 */
const phr = (line: string) => {
  const len = (x: string) => x.replace(/\s/g, '').length;
  const parts: string[] = [];
  let depth = 0, cur = '';
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    cur += ch;
    if (ch === '(') depth++;
    else if (ch === ')') depth = Math.max(0, depth - 1);
    else if ((ch === ',' || ch === '.') && depth === 0 && line[i + 1] === ' ') {
      const rest = line.slice(i + 2);
      const nextItem = rest.split(/[,.]/)[0];
      // 쉼표는 구절이 충분히 길 때만(나열 '예약, 주문, 결제' · '디자인, 개발'은 나누지 않음). 마침표(문장 끝)는 언제나
      const clause = ch === '.' ? len(cur) >= 4 && len(rest) >= 4 : len(cur) >= 9 && len(nextItem) >= 7 && len(rest) >= 7;
      if (clause) { parts.push(cur); cur = ''; i++; }
    }
  }
  if (cur) parts.push(cur);
  return parts.length > 1 ? parts.map((x) => `<span class="cl">${esc(x)}</span>`).join(' ') : esc(line);
};
const nl = (s: string) => s.split('\n').map(phr).join('<br>');

const arrow = (cls = 'ar') => `<svg class="${cls}" viewBox="0 0 30 12" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M0 6h28.5M23.5 1l5 5-5 5"/></svg>`;
const smallArrow = `<svg viewBox="0 0 14 10" fill="none" stroke="currentColor" stroke-width="1.2" aria-hidden="true"><path d="M0 5h13M9 1l4 4-4 4"/></svg>`;
const bubble = `<svg class="kk" viewBox="0 0 20 19" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><path d="M10 1.5c4.97 0 9 3.13 9 7s-4.03 7-9 7c-.86 0-1.69-.09-2.47-.27L3.5 17.5l1.06-3.37C2.39 12.86 1 10.83 1 8.5c0-3.87 4.03-7 9-7z"/></svg>`;
const check = `<svg class="ck" viewBox="0 0 14 11" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M1 5.6 5 9.4 13 1.4"/></svg>`;
/** 제목 줄 나눔. ink = '후'를 말하는 줄(스크롤에 따라 외곽선에서 잉크로 채워짐: '현실로' · '광고가 됩니다.'), 그 앞 줄('전')은 외곽선으로 남음 */
const lines = (arr: string[], ink = -1) => arr.map((l, i) => `<span class="ln" style="--li:${i}"><span>${i === ink ? `<span class="ink" data-ink>${esc(l)}</span>` : ink > i ? `<span class="ol">${esc(l)}</span>` : esc(l)}</span></span>`).join('');
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
/** 가격 앞 통화 표시: 뉴질랜드 NZD $ · 그 외 USD $(2026-10-09 사용자 예시 NZD $1,990 · USD $1,990) */
const SYM: C.Txt = C.currencySymbol;
const isNum = (s: string) => /^\d/.test(s);
/** '1,990' → 통화 표시(작게) + 숫자 + 꼬리(부터, /월). 숫자가 아니면('맞춤 견적') 그대로 */
const priceHtml = (s: string, suffix = '') => isNum(s)
  ? `<span class="cur">${t(SYM)}</span>${esc(s)}${suffix ? `<small>${esc(suffix)}</small>` : ''}`
  : `<span class="txt">${esc(s)}</span>${suffix ? `<small>${esc(suffix)}</small>` : ''}`;
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
    <a class="hd-logo" href="#top" aria-label="PAUSE Studio 처음으로" data-logo>${inlineLogo('hd-svg')}</a>
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
/** 포트폴리오 제목 '웹사이트입니다.'(10차 사용자: 어울리는 효과): 제목이 올라오는 동안 글자 속에서 실제 고객 사이트 화면들이 스크롤되듯 지나가고
 *  끝나면 보통 글자색으로 돌아옴 — 말 그대로 '실제로 만든 웹사이트'. 화면 띠는 밝은 화면 6장을 세로로 이어 붙인 것(strip-640). 화면에 들어올 때마다(data-mark → .on) */
const realWord = (t: string) => `<span class="real" data-mark><span class="rl-base">${esc(t)}</span><span class="rl-fill" aria-hidden="true"${exists('/media/work/strip-640.webp') ? ' style="background-image:url(/media/work/strip-640.webp)"' : ''}>${esc(t)}</span></span>`;
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
    // 칸 = 화면 비율 그대로(--ar). 한 줄의 높이를 맞춰 폭을 꽉 채우고(자르지 않음), 모바일은 한 칸씩 크게(아주 긴 세로 화면만 --arm으로 높이 제한)
    // 세로로 긴 화면(택시 앱 0.69)은 칸 폭이 너무 좁아지지 않게 칸 비율만 1.25까지(사진은 잘리지 않고 칸 안에 그대로)
    const ar = iw / ih;
    return `<li class="wk rv" style="--d:${(i % 4) * 0.06}s;--ar:${Math.max(ar, 1.25).toFixed(4)};--arm:${Math.max(ar, 1).toFixed(4)}"><button class="wk-btn" type="button" data-work="${i}" aria-label="${esc(`${refNo(i)} ${it.category} 크게 보기`)}">
      <span class="wk-media">${img(b, `${refNo(i)} ${it.category} 웹사이트 화면`, '(max-width: 767px) 92vw, (max-width: 1279px) 48vw, 36vw', 'wk-img')}${vid}</span>
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
    <header class="sec-head work-head"><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="h2 rv" id="work-title">${lines(w.title).replace(`>${esc(w.title[1])}<`, `>${realWord(w.title[1])}<`)}</h2><p class="lead rv" style="--d:.1s">${nl(w.lead)}</p></header>
    <ul class="work-grid" data-work-grid>${items}${next}</ul>
  </div>
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

/** 대표 서명(획 순서대로 그려짐). id = 마스크 이름(한 페이지에 두 번 쓰므로 달라야 함), auto = 보이면 스스로 그리기 시작(아니면 다른 코드가 .go를 붙임) */
function signature(id = 'sigm', auto = true) {
  const strokes = signatureStrokes.map((s) => `<path class="st" d="${s.d}" style="--l:${s.l}px;--dur:${s.dur}ms;--off:${s.off}ms;--e:${s.e}"/>`).join('');
  return `<svg class="sig" viewBox="0 0 1363 432" role="img" aria-label="PAUSE STUDIO 대표 서명"${auto ? ' data-sign' : ''}><defs><mask id="${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="1363" height="432">${strokes}</mask></defs><path d="${signatureOutline}" fill="currentColor" fill-rule="evenodd" mask="url(#${id})"/></svg>`;
}

/** 'WHY PAUSE?' 글자마다 순서(--k). 물음표(.q)는 잠깐 쉬었다가 마지막에 */
const whyLetters = (t: string) => [...t].map((ch, k) => ch === ' ' ? '<i class="sp"></i>' : `<i${ch === '?' ? ' class="q"' : ''} style="--k:${k}">${esc(ch)}</i>`).join('');

function why() {
  const w = C.why;
  const pillars = w.pillars.map((p, i) => `<li class="rv" style="--d:${(i % 3) * 0.1}s;--i:${i % 3}"><span class="idx"><b>0${i + 1}</b></span><h3 class="h3">${esc(p.title)}</h3><p>${esc(p.desc)}</p></li>`).join('');
  return `<section class="sec sec-paper why" id="why" aria-labelledby="why-title">
  <div class="wrap why-grid">
    <header><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="why-title rv" id="why-title"><span class="sr">${esc(w.title)}</span><span class="wy" aria-hidden="true" data-why>${whyLetters(w.title)}</span></h2></header>
    <div class="letter">${w.letter.map((p, i) => `<p class="rv" style="--d:${i * 0.08}s">${esc(p)}</p>`).join('')}
      <div class="sign rv">${signature()}<span>${esc(w.signatureLabel)}</span></div>
    </div>
  </div>
  <div class="wrap"><ul class="pillars" data-steps>${pillars}</ul></div>
</section>`;
}

function who() {
  const w = C.who;
  const items = w.items.map((x, i) => `<li class="rv" style="--d:${(i % 3) * 0.06}s"><span class="idx">${String(i + 1).padStart(2, '0')}</span><p>${esc(x)}</p></li>`).join('');
  return `<section class="sec sec-paper who" id="who" aria-labelledby="who-title">
  <div class="wrap who-grid">
    <header class="sec-head"><p class="eyebrow rv">${esc(w.eyebrow)}</p><h2 class="h2 rv" id="who-title">${lines(w.title)}</h2><p class="lead rv" style="--d:.1s">${nl(w.lead)}</p></header>
    <ol class="who-list" data-steps="0.88" data-stagger>${items}</ol>
  </div>
</section>`;
}

/** 문단 안의 한 구절을 굵게 + 보이면 크림색 형광펜(2026-10-09 사용자: '관리비/유지보수 비용 제로' 강조). 구절이 없으면 빌드를 멈춤 */
const inkPhrase = (html: string, em?: string) => {
  if (!em) return html;
  const k = esc(em);
  if (!html.includes(k)) throw new Error(`강조할 구절을 찾지 못함: ${em}`);
  return html.replace(k, `<strong class="mark" data-mark>${k}</strong>`);
};

/** 웹사이트 장 큰 글(10차 사용자: 코드·검사기 효과가 만들다 만 것처럼 어색 → 다시): 디자인 도구의 레이아웃 격자처럼
 *  윗선·바닥선이 그어지고 글자 자리마다 세로 안내선이 내려온 뒤, 흩어져 있던 글자가 한 자씩 제자리에 맞물려 들어감 → 안내선은 사라짐.
 *  글자마다 처음 자리(--dx·--dy·--r)는 정해 둔 값(매번 같은 모양). 화면에 들어올 때마다(data-mark → .on). 움직임 줄이기·JS 없음이면 완성된 글만 */
const GRID_FROM = [[-.05, -.42, -7], [.03, .36, 5], [-.02, -.3, 4], [.04, .44, -6], [-.03, -.38, 6], [.02, .32, -4], [-.04, -.46, 5], [.03, .4, -5]];
const gridWord = (w: string) => `<span class="gw" data-mark><i class="gw-h t"></i><i class="gw-h b"></i>${[...w].map((ch, i) => { const [dx, dy, r] = GRID_FROM[i % GRID_FROM.length]; return `<span class="gc" style="--i:${i};--dx:${dx}em;--dy:${dy}em;--r:${r}deg"><span>${esc(ch)}</span></span>`; }).join('')}</span>`;

/* ───────── 장 첫 화면: 아주 큰 영문 단어가 스크롤에 따라 옆으로 천천히 흐름 ───────── */
function chapter(key: 'website' | 'video') {
  const c = C.chapters[key];
  return `<section class="chapter ch-${key}" id="${key}" aria-labelledby="ch-${key}" data-scrub>
  <div class="wrap">
    <p class="ch-index rv">${esc(c.index)}</p>
    <h2 class="ch-word rv" id="ch-${key}"><span class="sr">${esc(c.ko)}</span><span class="ch-move" aria-hidden="true">${key === 'video' ? `<span class="shot" data-mark><span class="sh-w">${esc(c.word)}</span><i class="sh-vf"></i><i class="sh-cur"></i><i class="sh-flash"></i><i class="sh-rec">REC</i></span>` : gridWord(c.word)}</span></h2>
    <div class="ch-foot"><p class="ch-ko rv" aria-hidden="true">${esc(c.ko)}</p><p class="ch-lead rv" style="--d:.1s">${inkPhrase(nl(c.lead), c.em)}</p></div>
  </div>
</section>`;
}

/* ───────── 비교: BEFORE(흔한 템플릿 예시 화면)를 손잡이로 밀어 AFTER(실제 사이트 녹화)와 비교 ───────── */
function mock(m: C.CompareCase['mock']) {
  const b = m.image;
  const has = exists(`${b}-880.jpg`);
  const pic = has ? `<picture><source type="image/webp" srcset="${b}-880.webp"><img src="${b}-880.jpg" alt="" loading="lazy" decoding="async"></picture>` : '';
  // 사진 주소는 사용자 지정 속성(--img) 대신 칸마다 직접 넣는다: 상대 주소일 때(미리보기 묶음) 일부 브라우저가
  // var() 안의 주소를 CSS 파일 위치 기준으로 풀어 사진이 빠지기 때문
  const thumb = has ? ` style="background-image:url(${b}-880.jpg)"` : '';
  return `<div class="mock" style="--acc:${m.accent}" aria-hidden="true">
    <div class="m-bar"><b>${esc(m.brand)}</b><span class="m-nav">${m.nav.map((n, i) => `<i${i === 0 ? ' class="on"' : ''}>${esc(n)}</i>`).join('')}</span><span class="m-btn">${esc(m.btn)}</span></div>
    <div class="m-hero">${pic}<div class="m-copy"><span class="m-h">${esc(m.title)}</span><span class="m-p">${esc(m.sub)}</span><span class="m-cta">${esc(m.btn)}</span></div></div>
    <div class="m-sec"><span class="m-st">Our Services</span><span class="m-cards">${m.cards.map(([t, d, im]) => `<span class="m-card"><span class="m-thumb"${im && exists(`${im}.jpg`) ? ` style="background-image:url(${im}.jpg)"` : thumb}></span><b>${esc(t)}</b><span>${esc(d)}</span></span>`).join('')}</span></div>
  </div>`;
}
/** 비교 제목(10차 사용자: 대결 카드·손잡이 효과가 허접함 → 다시): 글꼴 대비 자체가 비교 — '흔한 템플릿'은 가는 본문 글꼴, '맞춤 디자인'은 굵은 제목 글꼴.
 *  VS는 작은 네모 꼬리표. 두 줄이 올라온 뒤 '흔한 템플릿'만 조용히 흐려짐(.in) */
const cmpTitle = ([ord, art]: string[]) => `<span class="ln"><span class="ord">${esc(ord)}</span></span> <span class="ln" style="--li:1"><span><span class="vs-tag">VS</span> <span class="art">${esc(art)}</span></span></span>`;

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
    <figcaption class="cmp-cap"><span class="b"><span class="sr">${esc(c.before)}: </span>${esc(c.beforeSub)}</span><span class="cat">${esc(cs.label)}</span><span class="a"><span class="sr">${esc(c.after)}: </span>${esc(c.afterSub)}</span></figcaption>
  </figure>`;
  }).join('');
  return `<section class="sec sec-paper compare" id="compare" aria-labelledby="compare-title">
  <div class="wrap">
    <div class="cmp-head"><header><p class="eyebrow rv">${esc(c.eyebrow)}</p><h2 class="cmp-title rv" id="compare-title">${cmpTitle(c.title)}</h2></header><p class="lead rv">${nl(c.lead)}</p></div>
    ${cases}
  </div>
</section>`;
}

/* ───────── 웹사이트 요금: STARTER · BUSINESS · ENTERPRISE(견적서), 그 플랜만의 기능은 위에 크게(+), 다른 플랜과 같은 기능은 체크 목록으로 또렷하게 ───────── */
function planCard(pl: C.Plan, i: number) {
  const p = C.pricing;
  const adds = pl.base
    ? `<p class="pl-lab add"><span class="plus" aria-hidden="true">+</span>${esc(pl.addsTitle)}</p><ul class="adds">${pl.adds.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
    : `<p class="pl-lab">${esc(pl.addsTitle)}</p><ul class="chk">${pl.adds.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul>`;
  const base = pl.base ? `<div class="pl-base"><p class="pl-lab">${esc(p.baseLabel)}</p><ul class="chk">${pl.base.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul></div>` : '';
  return `<article class="plan${pl.featured ? ' featured' : ''} rv" style="--d:${i * 0.08}s" aria-labelledby="plan-${pl.key}">
      ${pl.featured ? `<span class="badge">${esc(p.featuredBadge)}</span>` : ''}<h3 class="plan-name" id="plan-${pl.key}">${esc(pl.name)}</h3><p class="type">${esc(pl.type)}</p>
      <p class="price">${priceHtml(pl.price, pl.suffix)}</p>
      <p class="pl-target"><span>${esc(p.targetLabel)}</span>${nl(pl.target)}</p>
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
    <header class="sec-head"><p class="eyebrow rv"><span>${esc(p.eyebrow)}<span class="ko"> · ${esc(p.title)}</span></span></p><h2 class="h2 price-hook rv" id="pricing-title">${lines(p.banner).replace('관리비는', '<span class="nobr"><span class="gone" data-sp data-dur="3400"><span class="g-t">관리비</span><span class="g-b" aria-hidden="true">관리비</span></span>는</span>')}</h2><p class="lead rv" style="--d:.12s">${nl(p.bannerLead)}</p><p class="currency rv" style="--d:.15s">${t(C.currencyChip)}</p></header>
    <div class="plans">${p.plans.map(planCard).join('')}</div>
    <div class="free-band rv"><h3 class="fb-title">${esc(p.freeTitle[0])} <br>${esc(p.freeTitle[1])}</h3><ul>${free}</ul></div>
    <div class="pnotes rv"><h3 class="pnotes-title">${esc(p.notesTitle)}</h3><ol>${notes}</ol></div>
  </div>
</section>`;
}

/* ───────── 관리비 $0 + 총비용 계산기 ───────── */
/** 머리줄과 같은 회사 로고를 글 속에 그대로(그려지는 움직임을 위해 인라인) — 링·작은 원·글자에 이름을 붙임 */
function inlineLogo(cls: string) {
  const src = fs.readFileSync(path.join(PUB, 'brand/logo-cream.svg'), 'utf8');
  // 글씨 'Pause Studio'는 한 덩어리 패스 → 글자마다 나눠(속 구멍·i의 점은 그 글자에) 한 자씩 움직일 수 있게. 바닥선 아래는 잘라 둠(글자가 바닥에서 올라옴)
  return src
    .replace(/<svg [^>]*?viewBox="([^"]+)"[^>]*>/, (_m, vb) => `<svg class="${cls}" viewBox="${vb}" aria-hidden="true" focusable="false">`)
    .replace(/<title>.*?<\/title>/, '')
    .replace(/ps-ring-cut/g, `${cls}-cut`)
    .replace('</defs>', `<clipPath id="${cls}-base"><rect x="80" y="300" width="1540" height="292"/></clipPath></defs>`)
    .replace(/<ellipse /g, '<ellipse pathLength="100" ')
    .replace(/<circle /, '<circle class="lg-dot" ')
    .replace(/<path ([^>]*?)d="([^"]+)"\s*\/>/, (_m, attrs: string, d: string) => `<g class="lg-word" ${attrs.trim()} clip-path="url(#${cls}-base)">${splitLetters(d).map((g, i) => `<path class="lg-l" style="--i:${i}" d="${g}"/>`).join('')}</g>`);
}

/** 패스(M/m·l·c·z만 쓰는 로고 글씨)를 하위 패스로 나눠 절대 시작점으로 고친 뒤, 가로 범위가 다른 하위 패스 안에 드는 것(구멍·점)을 그 글자에 묶어 왼쪽부터 돌려줌 */
function splitLetters(d: string): string[] {
  const tk = d.match(/[a-zA-Z]|-?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?/g) ?? [];
  type Sub = { d: string; x0: number; x1: number };
  const subs: Sub[] = [];
  const N: Record<string, number> = { m: 2, l: 2, c: 6, z: 0 };
  let cx = 0, cy = 0, sx = 0, sy = 0, cmd = '', i = 0;
  let cur: Sub | null = null;
  while (i < tk.length) {
    if (/[a-zA-Z]/.test(tk[i])) cmd = tk[i++];
    const lo = cmd.toLowerCase(), rel = cmd === lo;
    if (!(lo in N) || (!cur && lo !== 'm')) throw new Error(`로고 패스를 나누지 못함: ${cmd}`);
    if (lo === 'z') { cur!.d += 'z'; cx = sx; cy = sy; cmd = ''; continue; }
    const a = tk.slice(i, i + N[lo]).map(Number); i += N[lo];
    if (lo === 'm') {
      cx = rel ? cx + a[0] : a[0]; cy = rel ? cy + a[1] : a[1]; sx = cx; sy = cy;
      cur = { d: `M${cx.toFixed(2)},${cy.toFixed(2)}`, x0: cx, x1: cx }; subs.push(cur);
      cmd = rel ? 'l' : 'L';
      continue;
    }
    const s: Sub = cur!;
    s.d += `${cmd}${a.join(',')}`;
    for (let k = 0; k < a.length; k += 2) { const x = rel ? cx + a[k] : a[k]; s.x0 = Math.min(s.x0, x); s.x1 = Math.max(s.x1, x); }
    cx = rel ? cx + a[a.length - 2] : a[a.length - 2]; cy = rel ? cy + a[a.length - 1] : a[a.length - 1];
  }
  const owner = subs.map((s, k) => subs.findIndex((o, j) => j !== k && o.x1 - o.x0 > s.x1 - s.x0 && s.x0 >= o.x0 - 4 && s.x1 <= o.x1 + 4));
  return subs.map((s, k) => ({ s, k })).filter(({ k }) => owner[k] < 0)
    .map(({ s, k }) => ({ x: s.x0, d: s.d + subs.filter((_, j) => owner[j] === k).map((o) => o.d).join('') }))
    .sort((p, q) => p.x - q.x).map((g) => g.d);
}


/** 큰 $0: 빌드 결과는 마지막 모습($0, 홀쭉). JS가 예시 금액에서 세어 내려가는 움직임을 붙인다(ui.ts initLedger) */
function ledger() {
  const l = C.fee.ledger;
  return `<figure class="ledger rv" style="--d:.15s" role="img" aria-label="${esc(l.aria)}" data-ledger data-from="${l.from}">
        <div class="ledger-head" aria-hidden="true"><span>${esc(l.head[0])}</span><span>${esc(l.head[1])}</span></div>
        <p class="ledger-cap" aria-hidden="true"><span class="from"><b class="cf-a">${esc(l.capFrom)}</b><b class="cf-b">${esc(l.capFrom)}</b></span><span class="to">${inlineLogo('cap-logo')}<b>${esc(l.capTo.replace(/^PAUSE Studio\s*/, ''))}</b></span></p>
        <p class="ledger-zero" aria-hidden="true"><span class="ld-fig"><span class="cur">$</span><b data-ledger-num>0</b></span><i class="ld-belt"></i></p>
        <ol class="ledger-months" aria-hidden="true">${l.months.map((m, i) => `<li style="--i:${i}"><span>${m}</span><b>$0</b></li>`).join('')}</ol>
        <p class="ledger-total" aria-hidden="true"><span>${esc(l.totalLabel)}</span><b>$0</b></p>
      </figure>`;
}
/** 입력칸의 연필 표시 */
/** 계산기: 왼쪽(타사 견적, 직접 입력) VS 오른쪽(PAUSE Studio, 상품 선택) — 휴대폰에서도 두 칸이 분명히 구분되게 */
function calc() {
  const c = C.fee.calc;
  const money = (n: number) => `${t(SYM)}${n.toLocaleString('en-US')}`;
  const def = c.plans[0];
  const plans = c.plans.map((pl, i) => `<label class="cp"><input type="radio" name="calcPlan" value="${pl.price}" data-suffix="${esc(pl.suffix || '')}"${i === 0 ? ' checked' : ''}><span>${esc(pl.label)}</span></label>`).join('');
  // 기본값으로 미리 계산해 둠(JS가 없어도 같은 결과): 타사 = 초기 제작비 + 월 관리비 × 12 × 기간
  const d = c.defaults;
  const other0 = d.setup + d.monthly * 12 * d.years, pause0 = def.price, max0 = Math.max(other0, pause0, 1);
  const save0 = Math.max(0, other0 - pause0);
  return `<div class="calc rv" data-calc>
      <div class="calc-intro"><h3 class="h3">${esc(c.title)}</h3><p class="calc-lead">${nl(c.lead)}</p></div>
      <div class="calc-form">
        <div class="calc-vs">
          <fieldset class="calc-side other"><legend><span class="side-tag">${esc(c.otherLabel)}</span><span class="side-hint">${esc(c.inputHint)}</span></legend>
            <label>${esc(c.setupLabel)}<span class="money"><span class="sym">${t(SYM)}</span><i class="caret" aria-hidden="true"></i><input type="text" inputmode="numeric" autocomplete="off" placeholder="${esc(c.placeholder)}" value="${d.setup.toLocaleString('en-US')}" data-c="setup" aria-label="${esc(c.otherLabel)} ${esc(c.setupLabel)}"></span></label>
            <label>${esc(c.monthlyLabel)}<span class="money"><span class="sym">${t(SYM)}</span><i class="caret" aria-hidden="true"></i><input type="text" inputmode="numeric" autocomplete="off" placeholder="${esc(c.placeholder)}" value="${d.monthly.toLocaleString('en-US')}" data-c="monthly" aria-label="${esc(c.otherLabel)} ${esc(c.monthlyLabel)}"></span></label>
          </fieldset>
          <span class="vs" aria-hidden="true">${esc(c.vs)}</span>
          <fieldset class="calc-side pause"><legend><img src="/brand/logo-cream.svg" alt="${esc(c.pauseLabel)}" width="204" height="103"></legend>
            <div class="calc-plans" role="radiogroup" aria-label="${esc(c.pauseLabel)} ${esc(c.planLabel)}">${plans}</div>
            <p class="calc-row"><span>${esc(c.setupLabel)}</span><b class="fixed" data-o="setup">${money(def.price)}</b></p>
            <p class="calc-row"><span>${esc(c.monthlyLabel)}</span><b class="fixed">${money(0)}</b></p>
          </fieldset>
        </div>
        <label class="calc-years"><span>${esc(c.yearsLabel)}</span><input type="range" min="1" max="10" step="1" value="${d.years}" data-c="years"><output data-o="years">${d.years}${esc(c.unit)}</output></label>
        <div class="calc-out">
          <p class="other"><span>${esc(c.otherLabel)} ${esc(c.totalLabel)}</span><strong data-o="other">${money(other0)}</strong><i class="bar" data-bar="other" style="--w:${(other0 / max0).toFixed(4)}"></i></p>
          <p class="pause"><span>${esc(c.pauseLabel)} ${esc(c.totalLabel)}</span><strong data-o="pause">${money(pause0)}</strong><i class="bar" data-bar="pause" style="--w:${(pause0 / max0).toFixed(4)}"></i></p>
        </div>
        <p class="calc-save" data-save${save0 > 0 ? '' : ' hidden'}><span>${esc(c.saveLabel)}</span><strong data-o="save">${money(save0)}</strong></p>
        <p class="sr" aria-live="polite" data-calc-live></p>
        <p class="calc-note">${esc(c.note)}</p>
      </div>
    </div>`;
}
function fee() {
  const f = C.fee;
  const extra = f.extra.map((x) => `<li><b>${esc(x.title)}</b><span>${esc(x.desc)}</span></li>`).join('');
  return `<section class="sec sec-black fee" id="fee" aria-labelledby="fee-title">
  <div class="wrap">
    <div class="fee-top">
      <header class="sec-head" style="margin:0"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 fee-title rv" id="fee-title">${lines(f.title).replace('$0', '<span class="z0">$0</span>')}</h2><p class="lead rv" style="--d:.1s">${nl(f.lead)}</p></header>
      ${ledger()}
    </div>
    <div class="fee-lists">
      <div class="fl-free rv"><h3>${esc(f.freeTitle)}</h3><ul class="chk">${f.free.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul></div>
      <div class="fl-extra rv" style="--d:.1s"><h3>${esc(f.extraTitle)}</h3><ul>${extra}</ul></div>
    </div>
    <div class="fee-notes">${f.notes.map((n) => `<p class="rv">${nl(n)}</p>`).join('')}</div>
    ${calc()}
  </div>
</section>`;
}

function processSec() {
  const p = C.process;
  const steps = p.steps.map((s, i) => `<li class="rv" style="--d:${i * 0.08}s;--i:${i}"><span class="idx">${s.id}</span><h3 class="h3">${esc(s.title)}</h3><p class="hl">${esc(s.highlight)}</p><p class="d">${esc(s.desc)}</p></li>`).join('');
  return `<section class="sec sec-paper process" id="process" aria-labelledby="process-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv">${esc(p.eyebrow)}</p><h2 class="h2 rv" id="process-title">${lines(p.title, 1)}</h2><p class="lead rv" style="--d:.1s">${nl(p.subtitle)}</p></header>
    <ol class="steps" data-timeline>${steps}</ol>
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
    <div class="film-grid"><header class="sec-head" style="margin:0"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 rv" id="film-title">${lines(f.title, 1)}</h2></header><p class="lead rv" style="--d:.1s">${nl(f.lead)}</p></div>
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
      <p class="tagline">${nl(pl.tagline)}</p>
      <p class="price">${priceHtml(pl.price, pl.suffix)}</p>
      <dl class="specs">${specs}</dl>
      <p class="desc">${nl(pl.desc)}</p>
      ${consultBtn(C.cta.free, 'btn btn-solid', pl.key)}
    </article>`;
}
function videoPricing() {
  const v = C.videoPricing;
  const fm = v.formats;
  // 가로형 = 영상 플레이어, 세로형 = 그 앞에 겹쳐 선 휴대폰 숏폼 화면(같은 바닥선). 그림은 화면 읽기에서 숨기고 설명은 아래 목록으로
  const [fh, fv] = fm.items;
  const ico = (d: string) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${d}"/></svg>`;
  const side = [
    'M12 20s-7-4.3-7-9.6A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.4C19 15.7 12 20 12 20z',
    'M4.5 5.5h15v10h-9l-4.5 3.5v-3.5h-1.5z',
    'M13.5 5l7 6.5-7 6.5v-3.8c-4.6 0-7.4 1.2-9.5 4.3.6-5.6 3.6-9 9.5-9.6z',
  ].map(ico).join('');
  const frames = `<span class="frame fr-h"><span class="fr-ratio">${esc(fh.ratio)}</span><i class="fr-play"></i><span class="fr-ctl"><span>0:12</span><span class="fr-bar"><i></i></span><span>0:30</span></span></span>`
    + `<span class="frame fr-v"><i class="fr-island"></i><span class="fr-ratio">${esc(fv.ratio)}</span><span class="fr-side">${side}</span><span class="fr-meta"><span class="fr-who"><i class="fr-avatar"></i><i class="fr-line"></i></span><i class="fr-line"></i><i class="fr-line s"></i></span><span class="fr-bar"><i></i></span></span>`;
  const formats = fm.items.map((x) => `<li class="fmt"><b>${esc(x.name)}<span class="sr"> ${esc(x.ratio)}</span></b><span class="size">${esc(x.size)}</span><span class="use">${esc(x.use)}</span></li>`).join('');
  const mo = v.monthly;
  const rows = v.addons.rows.map(([k, price, unit]) => `<tr><th scope="row">${esc(k)}</th><td>${isNum(price) ? `${t(SYM)}${esc(price)}${unit ? ` <small>${esc(unit)}</small>` : ''}` : esc(price)}</td></tr>`).join('');
  const steps = v.steps.map((s, i) => `<li class="rv" style="--d:${i * 0.06}s;--i:${i % 3}"><span class="idx">${s.id}</span><h4>${esc(s.title)}</h4><p>${esc(s.desc)}</p></li>`).join('');
  const sched = v.schedule.map(([k, d]) => `<div><dt>${esc(k)}</dt><dd>${esc(d)}</dd></div>`).join('');
  return `<section class="sec sec-dark vpricing" id="video-pricing" aria-labelledby="vpricing-title">
  <div class="wrap">
    <header class="sec-head"><p class="eyebrow rv"><span>${esc(v.eyebrow)}<span class="ko"> · ${esc(v.title)}</span></span></p><h2 class="h2 rv" id="vpricing-title">${lines(v.heading).replace('완성된 광고영상을', '<span class="nobr"><span class="vf" data-sp data-dur="1700"><i class="vf-c" aria-hidden="true"></i>완성된 광고영상</span>을</span>')}</h2><p class="lead rv" style="--d:.12s">${nl(v.lead)}</p><p class="currency rv" style="--d:.15s">${t(C.currencyChip)}</p></header>
    <div class="formats rv">
      <div class="fm-copy"><p class="kicker">${esc(fm.kicker)}</p><h3>${nl(fm.title)}</h3><p>${nl(fm.desc)}</p></div>
      <div class="fm-art"><div class="fm-devices" aria-hidden="true">${frames}</div><ul class="fm-list">${formats}</ul></div>
    </div>
    <div class="vplans">${v.plans.map(videoPlanCard).join('')}</div>
    <div class="v-included rv"><h3>${esc(v.includedTitle)}</h3><ul class="chk">${v.included.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul></div>
    <article class="vmonthly rv" aria-labelledby="vplan-monthly">
      <div class="vm-head"><span class="label">${esc(mo.label)}</span><h3 class="plan-name" id="vplan-monthly">${esc(mo.name)}</h3><p class="tagline">${nl(mo.tagline)}</p></div>
      <div class="vm-body"><p class="price">${priceHtml(mo.price, mo.suffix)}</p><ul class="chk">${mo.specs.map((x) => `<li>${check}${esc(x)}</li>`).join('')}</ul><p class="desc">${nl(mo.desc)}</p><p class="note">${nl(mo.note)}</p></div>
      <div class="vm-cta">${consultBtn(C.cta.free, 'btn btn-line', 'monthly')}</div>
    </article>
    <p class="v-revisions rv">${nl(v.revisions)}</p>
    <details class="addons rv" data-acc><summary><span>${esc(v.addons.toggle)}</span><span class="ic" aria-hidden="true"></span></summary><div class="acc-body"><div class="acc-in"><table class="addon-table"><caption class="sr">${esc(v.addons.title)}</caption><tbody>${rows}</tbody></table><p class="addon-note">${esc(v.addons.note)}</p></div></div></details>
    <div class="vflow">
      <div><h3 class="vflow-title rv">${esc(v.stepsTitle)}</h3><ol class="vsteps" data-steps>${steps}</ol></div>
      <div class="vsched rv"><h3 class="vflow-title">${esc(v.scheduleTitle)}</h3><dl>${sched}</dl><p>${nl(v.scheduleNote)}</p></div>
    </div>
    <div class="vnotes rv"><h3 class="pnotes-title">${esc(v.notesTitle)}</h3><ul>${v.notes.map((n) => `<li>${nl(n)}</li>`).join('')}</ul></div>
  </div>
</section>`;
}

/* ───────── 자주 묻는 질문: 웹사이트 / AI 광고영상 탭 ───────── */
function faqSec() {
  const f = C.faq;
  const tabs = f.tabs.map((tb, i) => `<button class="faq-tab" type="button" role="tab" id="faq-tab-${tb.key}" aria-controls="faq-${tb.key}" aria-selected="${i === 0}"${i ? ' tabindex="-1"' : ''} data-faq-tab><span>${esc(tb.label)}</span><small>질문 ${tb.items.length}개</small></button>`).join('');
  const panels = f.tabs.map((tb, i) => `<div class="faq-list" id="faq-${tb.key}" role="tabpanel" aria-labelledby="faq-tab-${tb.key}" data-faq-panel${i ? ' hidden' : ''}>${tb.items.map((it) => `<details data-acc><summary><span>${esc(it.q)}</span><span class="ic" aria-hidden="true"></span></summary><div class="acc-body"><div class="acc-in"><p>${esc(it.a)}</p></div></div></details>`).join('')}</div>`).join('');
  const all = f.tabs.flatMap((tb) => tb.items);
  return `<section class="sec sec-paper faq" id="faq" aria-labelledby="faq-title">
  <div class="wrap faq-grid">
    <header class="sec-head"><p class="eyebrow rv">${esc(f.eyebrow)}</p><h2 class="h2 rv" id="faq-title">${lines(f.title).replace('모았습니다.', /* 질문 제목은 PC에서 화면 위에 붙어 따라오므로(sticky) 끝을 38% 높이로 */ `<span class="sr">모았습니다.</span><span class="gather" aria-hidden="true" data-sp data-dur="1600">${[...'모았습니다.'].map((ch, k) => `<i style="--k:${k}">${ch}</i>`).join('')}</span>`)}</h2><div class="faq-pick rv"><p class="faq-hint" id="faq-hint">${esc(f.tabsHint)}</p><div class="faq-tabs" role="tablist" aria-label="질문 분류" aria-describedby="faq-hint">${tabs}</div></div></header>
    <div class="faq-panels rv">${panels}</div>
  </div>
  <script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: all.map((it) => ({ '@type': 'Question', name: it.q, acceptedAnswer: { '@type': 'Answer', text: it.a } })) }).replace(/</g, '\\u003c')}</script>
</section>`;
}

/* ───────── 마무리 선언(2026-10-09 사용자: 진심이 느껴지게, 빛 번짐·굵은 밑줄은 AI 티가 남 → 다시):
   편지체(마루 부리)로, 대표가 그 자리에서 직접 치듯 한글 자판 타이핑 → 다짐 문장 → 대표 서명.
   ghost = 완성된 글(자리만 차지해 아래가 밀리지 않게, JS가 없으면 이것이 보임) · type = 타이핑되는 글 ───────── */
function manifesto() {
  const m = C.manifesto;
  const ghost = m.lines.map((l) => `<span class="ln">${esc(l)}</span>`).join('');
  // 배경(10차 사용자: 시꺼멓기만 함): 지금까지 만든 실제 고객 사이트 화면이 비스듬히 아주 천천히 흐름 — '사장님'들의 가게가 글 뒤에 깔림. 글 쪽은 어둡게 덮음
  const bg = [['ref02', 'ref06', 'ref09', 'ref13', 'ref04'], ['ref11', 'ref01', 'ref12', 'ref05', 'chillenq'], ['ref15', 'ref07', 'ref03', 'unframe', 'ref08']]
    .map((r, i) => `<div class="mf-row r${i}"><div class="mf-track">${[...r, ...r].map((id) => { const b = `/media/work/${id}`; const [w, h] = dim(b, '880'); return `<picture><source type="image/webp" srcset="${b}-880.webp"><img src="${b}-880.jpg" alt="" width="${w}" height="${h}" loading="lazy" decoding="async"></picture>`; }).join('')}</div></div>`).join('');
  return `<section class="manifesto" id="manifesto" aria-labelledby="mf-title" data-manifesto>
  <div class="mf-bg" aria-hidden="true"><div class="mf-plane">${bg}</div></div>
  <div class="wrap">
    <p class="mf-kicker">${esc(m.kicker)}</p>
    <h2 class="mf-big" id="mf-title"><span class="sr">${esc(m.lines.join(' '))}</span><span class="mf-ghost" aria-hidden="true" data-mf-lines="${esc(JSON.stringify(m.lines))}">${ghost}</span><span class="mf-type" aria-hidden="true" data-mf-type></span></h2>
    <p class="mf-stmt">${nl(m.statement)}</p>
    <div class="mf-sign">${signature('sigm2', false)}<span>${esc(m.sign)}</span></div>
  </div>
</section>`;
}

/** 문의 제목(10차 사용자: 빨간 펜이 완전 어색하고 허접함 → 다시): 짐을 내려놓듯 '웹사이트 관리비,'의 글자가 한 자씩 가라앉으며 흐려지고,
 *  이어서 '해방되세요.'가 한 자씩 가볍게 떠올랐다 내려앉음(숨을 내쉬듯). 글자 단위 움직임이라 화면 읽기용 글은 따로 */
const charSpans = (t: string, cls: string) => `<span class="${cls}" aria-hidden="true">${[...t].map((ch, k) => ch === ' ' ? ' ' : `<i style="--k:${k}">${esc(ch)}</i>`).join('')}</span>`;

function contactSec() {
  const c = C.contactSection;
  const [u, d] = C.contact.email.split('@');
  const ph = c.phone;
  return `<section class="sec sec-dark contact" id="contact" aria-labelledby="contact-title">
  <div class="wrap contact-grid">
    <div class="ct-main">
      <p class="ct-window rv"><span class="dot" aria-hidden="true"></span>${esc(c.windowLabel)} · ${esc(c.status)}</p>
      <h2 class="ct-title rv" id="contact-title" data-mark><span class="sr">${esc([c.title[0], c.title[1], c.title[2] + c.title[3]].join(' ').replace(/\s+/g, ' ').trim())}</span><span class="ln" aria-hidden="true"><span>${esc(c.title[0].trim())}<br class="m-br"> ${charSpans(c.title[1].trim(), 'burden')}</span></span><span class="ln" style="--li:1" aria-hidden="true"><span>${(c.title[2] + c.title[3]).replace(/^(.*?)(해방\s*되세요\.?)$/, (_m, a: string, b: string) => esc(a) + charSpans(b, 'free'))}</span></span></h2>
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
      <a class="ft-logo" href="#top" aria-label="PAUSE Studio 처음으로" data-logo data-mark>${inlineLogo('ft-svg')}</a>
      <div class="ft-cols">
        <div><h3>Menu</h3><ul>${C.nav.map((n) => `<li><a href="${n.href}">${esc(n.label)}</a></li>`).join('')}<li><a href="#contact">${esc(C.cta.header)}</a></li></ul></div>
        <div><h3>Contact</h3><ul><li><a href="${C.contact.kakaoUrl}" target="_blank" rel="noopener">카카오톡 오픈채팅</a></li><li><a href="${C.contact.telHref}">${esc(C.contact.phoneLabel)}</a></li><li>${esc(f.emailLabel)} · <button class="reveal-btn" type="button" style="font-size:inherit" data-email-user="${esc(u)}" data-email-domain="${esc(d)}">${esc(f.emailReveal)}</button></li></ul></div>
        <div><h3>Studio</h3><p>${esc(C.contact.address)}</p><p>${esc(C.contact.nzbn)}</p></div>
      </div>
    </div>
    <div class="ft-legal"><p class="ft-legal-h">${esc(f.legalLink)}</p><div class="body">${f.legal.map((l) => `<p>${esc(l)}</p>`).join('')}</div></div><!-- 2026-10-09 사용자: 법적 고지는 늘 펼쳐 둠 -->
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
 * 'ㅇㅇ을 쓸 / 곳을'처럼 한 글자만 줄 끝에 남지 않고, 가운뎃점으로 이은 말(갤러리·포트폴리오)은 붙어 있다. 태그 안(속성 값)과 <script>는 건드리지 않는다.
 */
const glue = (html: string) => html.replace(/(<script[\s\S]*?<\/script>)|(?<=>)([^<]+)(?=<)/g, (m, script, text) => script ? m
  : text.replace(/(?<=^|[\s(\u00A0])([가-힣])[ ](?=[^\s])/g, '$1\u00A0').replace(/Full HD MP4/g, 'Full\u00A0HD\u00A0MP4')
    // 가운뎃점(·) 양옆에서 줄이 바뀌지 않게('갤러리 / ·포트폴리오' 방지): 보이지 않는 단어 이음표(U+2060)
    .replace(/(?<=\S)·(?=\S)/g, '\u2060·\u2060')
    // 띄어 쓴 가운뎃점('릴스 · 틱톡')은 앞말에 붙여 줄 첫머리가 '·'로 시작하지 않게
    .replace(/ · /g, '\u00A0· ')
    // 브랜드 이름(PAUSE / Studio)과 보조 용언(보여 / 주고, 찾고 / 계신, 제안해 / 드립니다)이 두 줄로 갈라지지 않게(2026-10-09)
    .replace(/PAUSE (Studio|STUDIO)/g, 'PAUSE\u00A0$1')
    .replace(/(?<=[가-힣](?:여|어|아|해|려|워|춰|와|내|줘)) (?=(?:주|드)[가-힣])/g, '\u00A0')
    .replace(/(?<=[가-힣]고) (?=(?:계|있|싶)[가-힣])/g, '\u00A0')
    // 꾸밈말은 뒷말과 함께('모든 / 순간' 방지)
    .replace(/(?<=^|[\s\u00A0(])(모든|어떤|다른|여러) (?=[가-힣])/g, '$1\u00A0')
    .replace(/(?<=\S)\/(?=\S)/g, '/\u2060'));

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
