/**
 * 방문 통계 대시보드(/admin) — 2026-11-09 사용자: 광고 글을 올리는데 몇 명이 어디서 무슨 링크를 타고 들어왔는지 보고 싶음
 * 같은 날 다시: "내용은 많은데 눈에 안 들어온다, '직접 접속'이 뭔지 모르겠다"
 *   → 위에서부터 '몇 명 → 어디서 → 내 광고 글 → 어느 나라 → 최근 들어온 사람' 다섯 가지만, 쉬운 말로. 단위는 모두 '명'
 *   → 기기·시간대·페이지별 숫자는 맨 아래 '더 자세히'에 접어 둠
 * 숫자는 로그인 뒤 /api/admin?a=stats 에서만 받는다(이 화면 파일 자체에는 아무 정보도 없음)
 */
// 사이트는 CSS를 한 파일로 묶으므로(vite cssCodeSplit: false) 관리자 스타일은 글자로 받아 이 화면에만 넣음(사이트 스타일과 섞이지 않게)
import css from './admin.css?inline';

document.head.append(Object.assign(document.createElement('style'), { textContent: css }));

type Row = { key: string; sessions: number; visitors: number; leads: number; leadPeople: number; submits: number; dur: number; sub?: string };
type Cnt = { key: string; n: number };
type Kpi = { visitors: number; sessions: number; pageviews: number; avgDur: number; leads: number; leadPeople: number; submits: number };
interface Stats {
  ok: boolean; storage: boolean; today: string;
  range: { from: string; to: string; days: number; hourly: boolean };
  kpi: Kpi; prev: Kpi;
  series: { key: string; visitors: number }[];
  sources: Row[]; campaigns: Row[]; countries: Row[]; cities: Row[]; devices: Row[];
  sections: { total: number; list: Cnt[] }; heat: number[][];
  live: { sessions: number };
  recent: { t: number; src: string; cmp?: string; land: string; pages: number; dur: number; c?: string; ct?: string; d?: string; nv: boolean; goals: string[] }[];
}
interface Link { id: string; name: string; url: string; source: string; campaign: string; content: string; created: number }

const SITE = 'https://pause8studio.com';
/** 출처 이름을 대표가 쓰는 말로. '직접 방문'은 사람들이 헷갈려 해서 '어디서 왔는지 모름'으로 */
const UNKNOWN = '직접 방문';
const NAME: Record<string, string> = {
  Instagram: '인스타그램', Facebook: '페이스북', Meta: '메타 광고', Threads: '스레드', KakaoTalk: '카카오톡', KakaoStory: '카카오스토리',
  Google: '구글 검색', 'Google 광고': '구글 광고', Naver: '네이버 검색', 'Naver 블로그·카페': '네이버 블로그·카페', 'Daum·Kakao': '다음 검색',
  Bing: '빙 검색', 'Bing 광고': '빙 광고', Yahoo: '야후 검색', YouTube: '유튜브', TikTok: '틱톡', 'TikTok 광고': '틱톡 광고', WhatsApp: '왓츠앱',
  LINE: '라인', Telegram: '텔레그램', X: 'X(트위터)', LinkedIn: '링크드인', BAND: '밴드', Pinterest: '핀터레스트', Reddit: '레딧',
  [UNKNOWN]: '어디서 왔는지 모름',
};
const srcName = (s: string) => NAME[s] ?? s;
const GOAL: Record<string, string> = { consult_submit: '상담 신청', kakao: '카카오톡 누름', whatsapp: '왓츠앱 누름', email: '이메일 확인', phone: '전화 누름', consult_open: '상담 창 열어 봄' };
const DEV: Record<string, string> = { mobile: '휴대폰', desktop: '컴퓨터', tablet: '태블릿' };
const SEC: [string, string][] = [
  ['top', '첫 화면'], ['work', '포트폴리오'], ['why', 'WHY'], ['who', '추천 대상'], ['website', '웹사이트 소개'], ['compare', 'BEFORE / AFTER'],
  ['pricing', '웹사이트 요금'], ['fee', '관리비 $0'], ['process', '제작 과정'], ['video', 'AI 광고영상 소개'], ['film', '영상 샘플'],
  ['video-pricing', '영상 요금'], ['faq', '자주 묻는 질문'], ['manifesto', '마무리'], ['contact', '문의'],
];
const REGION = new Intl.DisplayNames(['ko'], { type: 'region' });

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fmt = (n: number) => n.toLocaleString('ko-KR');
const share = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)}%` : '');
const dur = (s: number) => (s < 60 ? `${s}초` : `${Math.floor(s / 60)}분${s % 60 ? ` ${s % 60}초` : ''}`);
const country = (c?: string) => { if (!c || c === '??') return '알 수 없음'; try { return REGION.of(c) || c; } catch { return c; } };
const store = (k: string, v?: string | null) => {
  try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* */ }
  return null;
};

/* ── 기간 */
const nzToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
/** [키, 버튼 글자, 문장 속 이름, 비교 기간 이름, 날짜] */
const PRESETS: [string, string, string, string, (t: string) => [string, string]][] = [
  ['today', '오늘', '오늘', '어제', (t) => [t, t]],
  ['yesterday', '어제', '어제', '그저께', (t) => [addDays(t, -1), addDays(t, -1)]],
  ['7d', '7일', '최근 7일', '그 전 7일', (t) => [addDays(t, -6), t]],
  ['30d', '30일', '최근 30일', '그 전 30일', (t) => [addDays(t, -29), t]],
  ['90d', '90일', '최근 90일', '그 전 90일', (t) => [addDays(t, -89), t]],
];
let preset = store('ps_admin_range') || '7d';
if (!PRESETS.some(([k]) => k === preset)) preset = '7d';
const cur = () => PRESETS.find(([k]) => k === preset)!;
let data: Stats | null = null;
let links: Link[] = [];
let timer = 0;
let seq = 0; // 기간을 빨리 바꿀 때 늦게 도착한 이전 응답이 화면을 덮지 않게
let builderOpen = false;

const app = $('#app');

/* ── 서버 */
async function api<T>(url: string, init?: RequestInit): Promise<T | 'login' | 'not_configured'> {
  const res = await fetch(url, { credentials: 'same-origin', ...init });
  if (res.status === 401 || res.status === 503) {
    const j = await res.json().catch(() => ({})) as { code?: string };
    return j.code === 'not_configured' ? 'not_configured' : 'login';
  }
  if (!res.ok) throw new Error(String(res.status));
  return res.json() as Promise<T>;
}

async function load() {
  clearTimeout(timer);
  const my = ++seq;
  const [from, to] = cur()[4](nzToday());
  let r: Stats | 'login' | 'not_configured';
  try { r = await api<Stats>(`/api/admin?a=stats&from=${from}&to=${to}`); }
  catch { app.innerHTML = `<div class="login"><div><p class="err">통계를 불러오지 못했습니다. 잠시 뒤 새로고침해 주세요.</p></div></div>`; return; }
  if (my !== seq) return;
  if (r === 'login' || r === 'not_configured') { login(r === 'not_configured'); return; }
  const l = await api<{ links: Link[] }>('/api/admin?a=links').catch(() => null);
  if (my !== seq) return;
  data = r;
  if (l && typeof l === 'object') links = l.links;
  render();
  // 오늘이 들어간 기간이면 1분마다 새로 받음
  if (to === r.today) timer = window.setTimeout(() => { if (document.visibilityState === 'visible') load(); else timer = window.setTimeout(load, 60000); }, 60000);
}

/* ── 로그인 */
function login(notConfigured = false) {
  document.title = '로그인 · PAUSE Studio';
  app.innerHTML = `<div class="login"><form novalidate>
    <img src="/brand/logo-cream.svg" alt="PAUSE Studio" width="132" height="40">
    <div><h1>방문 통계</h1><p>대표님만 볼 수 있는 화면입니다.</p></div>
    ${notConfigured ? '<p class="err">관리자 비밀번호가 아직 서버에 설정되지 않았습니다(ADMIN_PASSWORD).</p>' : ''}
    <label class="field"><span>비밀번호</span><input type="password" name="pw" autocomplete="current-password" required autofocus></label>
    <p class="err" hidden></p>
    <button class="btn" type="submit">들어가기</button>
  </form></div>`;
  const f = $<HTMLFormElement>('form', app), err = $('.err[hidden]', f) as HTMLElement, btn = $<HTMLButtonElement>('button', f);
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    btn.disabled = true;
    const res = await fetch('/api/admin?a=login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: (f.elements.namedItem('pw') as HTMLInputElement).value }) }).catch(() => null);
    btn.disabled = false;
    if (res?.ok) { store('ps_me', '1'); load(); return; } // 이 기기의 방문은 통계에서 뺌
    const code = res ? ((await res.json().catch(() => ({}))) as { code?: string }).code : 'net';
    err.hidden = false;
    err.textContent = code === 'rate_limited' ? '시도가 너무 많습니다. 15분 뒤에 다시 해 주세요.' : code === 'not_configured' ? '서버에 비밀번호가 설정되지 않았습니다.' : code === 'net' ? '연결이 끊겼습니다. 다시 시도해 주세요.' : '비밀번호가 맞지 않습니다.';
  });
}

/* ── 그리기 도구 */
/** 막대 목록: 이름 · 몇 명 · 비율. 이름 아래 작은 글씨(sub) */
function bars(rows: { name: string; sub?: string; n: number; note?: string }[], total: number, limit = 8) {
  if (!rows.length) return '<p class="empty">아직 없어요.</p>';
  const max = Math.max(...rows.map((r) => r.n), 1);
  const shown = rows.slice(0, limit), rest = rows.slice(limit);
  const items = rest.length ? [...shown, { name: `그 밖 ${rest.length}곳`, n: rest.reduce((a, r) => a + r.n, 0), sub: rest.slice(0, 6).map((r) => r.name).join(', ') }] : shown;
  return `<ul class="bars">${items.map((r) => `<li style="--w:${Math.max((r.n / max) * 100, 2)}%">
    <span class="nm"><b>${esc(r.name)}</b>${r.sub ? `<i>${esc(r.sub)}</i>` : ''}</span>
    <span class="vl">${fmt(r.n)}명${r.note ? `<small>${esc(r.note)}</small>` : ''}</span><span class="sh">${share(r.n, total)}</span></li>`).join('')}</ul>`;
}
const leadNote = (r: Row) => (r.leadPeople ? `연락 ${fmt(r.leadPeople)}명` : '');

/** 날짜별 들어온 사람: 막대 하나(한 값만) */
function drawChart() {
  const box = document.getElementById('trend');
  if (!box || !data) return;
  const s = data.series, W = box.clientWidth, H = box.clientHeight, L = 32, R = 4, T = 12, B = 28;
  const top = niceMax(Math.max(...s.map((x) => x.visitors), 1));
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const ticks = [0, top / 2, top].filter((v, i, a) => a.indexOf(v) === i && Number.isInteger(v));
  const every = Math.ceil(s.length / Math.max(Math.floor((W - L) / 56), 1));
  const label = (k: string) => (data!.range.hourly ? `${Number(k)}시` : `${Number(k.slice(5, 7))}/${Number(k.slice(8))}`);
  const bw = Math.max(Math.min(((W - L - R) / s.length) * 0.62, 28), 2);
  const xb = (i: number) => L + ((i + 0.5) / s.length) * (W - L - R);
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="들어온 사람 수 흐름">
    ${ticks.map((v) => `<line class="${v ? 'gl' : 'base'}" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 8}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join('')}
    ${s.map((d, i) => (i % every === 0 ? `<text class="ax" x="${xb(i)}" y="${H - 6}" text-anchor="middle">${label(d.key)}</text>` : '')).join('')}
    ${s.map((d, i) => { const h = y(0) - y(d.visitors); return h > 0 ? `<path class="bar" d="M${xb(i) - bw / 2},${y(0)} v${-Math.max(h - 3, 0)} q0,-3 3,-3 h${bw - 6} q3,0 3,3 v${Math.max(h - 3, 0)} z"/>` : ''; }).join('')}
    <line class="cross" y1="${T}" y2="${y(0)}" visibility="hidden"/>
  </svg>`;
  const svg = box.querySelector('svg')!, cross = svg.querySelector('.cross')!;
  const show = (cx: number) => {
    const i = Math.min(Math.max(Math.floor(((cx - L) / (W - L - R)) * s.length), 0), s.length - 1);
    const d = s[i], px = xb(i);
    cross.setAttribute('x1', String(px)); cross.setAttribute('x2', String(px)); cross.setAttribute('visibility', 'visible');
    const r = svg.getBoundingClientRect();
    const when = data!.range.hourly ? `${Number(d.key)}시~${Number(d.key) + 1}시` : `${Number(d.key.slice(5, 7))}월 ${Number(d.key.slice(8))}일`;
    tip(`<b>${when}</b><br>${fmt(d.visitors)}명`, r.left + px, r.top + y(d.visitors));
  };
  svg.addEventListener('pointermove', (e) => show(e.clientX - svg.getBoundingClientRect().left));
  svg.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); tip(''); });
}
function niceMax(v: number) {
  if (v <= 4) return 4;
  const p = 10 ** Math.floor(Math.log10(v));
  return ([1, 2, 2.5, 5, 10].map((m) => m * p).find((m) => m >= v) ?? v);
}

/* ── 말풍선 */
const tipEl = document.createElement('div');
tipEl.className = 'tip'; tipEl.hidden = true; tipEl.setAttribute('role', 'tooltip');
document.body.append(tipEl);
function tip(html: string, x = 0, y = 0) {
  if (!html) { tipEl.hidden = true; return; }
  tipEl.innerHTML = html; tipEl.hidden = false;
  const w = tipEl.offsetWidth;
  tipEl.style.left = `${Math.min(Math.max(x, w / 2 + 8), innerWidth - w / 2 - 8)}px`;
  tipEl.style.top = `${Math.max(y, tipEl.offsetHeight + 20)}px`;
}

function toast(msg: string) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.append(t);
  setTimeout(() => t.remove(), 1800);
}
async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); toast('링크를 복사했어요'); } catch { prompt('복사해서 쓰세요', text); }
}

/* ── 맨 위 한 문장: 몇 명이, 어디서 가장 많이, 지난번보다 */
function hero(d: Stats) {
  const [, , name, prevName] = cur();
  const k = d.kpi, p = d.prev;
  if (!k.visitors) return `<section class="hero"><h1>${name}에는 아직 들어온 사람이 없어요.</h1>
    <p>광고 글을 올릴 때 아래 <b>광고 글 링크</b>를 만들어 붙이면, 어느 글을 보고 몇 명이 왔는지 여기에 바로 나와요.</p></section>`;
  const diff = k.visitors - p.visitors;
  const vs = !p.visitors ? `${prevName}에는 0명이었어요.` : diff ? `${prevName}(${fmt(p.visitors)}명)보다 <b>${fmt(Math.abs(diff))}명 ${diff > 0 ? '늘었어요' : '줄었어요'}</b>.` : `${prevName}과 같아요.`;
  const top = d.sources.find((r) => r.key !== UNKNOWN);
  return `<section class="hero">
    <h1>${name} 동안 <strong>${fmt(k.visitors)}명</strong>이 들어왔어요.</h1>
    <p>${top ? `가장 많이 들어온 곳은 <b>${esc(srcName(top.key))}</b>(${fmt(top.visitors)}명)이에요. ` : ''}${vs}</p>
    <dl class="nums">
      <div><dt>들어온 사람</dt><dd>${fmt(k.visitors)}<small>명</small></dd></div>
      <div><dt>연락 버튼 누른 사람</dt><dd>${fmt(k.leadPeople)}<small>명</small></dd><span>카카오톡·상담 신청·왓츠앱·이메일·전화</span></div>
      <div><dt>평균 둘러본 시간</dt><dd>${dur(k.avgDur)}</dd></div>
    </dl>
  </section>`;
}

/* ── 광고 글 링크 */
const SOURCES: [string, string, string][] = [
  ['instagram', '인스타그램 게시물·스토리', 'social'], ['instagram', '인스타그램 광고', 'paid_social'], ['facebook', '페이스북 게시물', 'social'], ['facebook', '페이스북·메타 광고', 'paid_social'],
  ['threads', '스레드', 'social'], ['kakaotalk', '카카오톡(단톡방·채널)', 'messenger'], ['naver', '네이버 블로그·카페', 'blog'], ['google', '구글 검색 광고', 'cpc'],
  ['youtube', '유튜브', 'social'], ['tiktok', '틱톡', 'social'], ['whatsapp', '왓츠앱', 'messenger'], ['email', '이메일', 'email'],
];
const DEST: [string, string][] = [['/', '한국어 첫 화면'], ['/#contact', '한국어 문의 바로'], ['/en', '영어 첫 화면'], ['/en/web-design-los-angeles', 'LA 안내 페이지'], ['/en/web-design-new-york', '뉴욕 안내 페이지'], ['/en/web-design-atlanta', '애틀랜타 안내 페이지']];
function buildUrl(dest: string, src: string, med: string, cmp: string) {
  const [p, hash] = dest.split('#');
  const q = new URLSearchParams({ utm_source: src, utm_medium: med, utm_campaign: cmp });
  return `${SITE}${p}?${q.toString()}${hash ? `#${hash}` : ''}`;
}
/** 저장한 링크와 기록된 캠페인을 하나의 목록으로(저장 안 한 캠페인도 보이게) */
function adRows() {
  const d = data!;
  const byCmp = new Map<string, { visitors: number; lead: number; src: string }>();
  for (const r of d.campaigns) {
    const [c, s] = r.key.split('\t');
    const x = byCmp.get(c) ?? { visitors: 0, lead: 0, src: s };
    x.visitors += r.visitors; x.lead += r.leadPeople; byCmp.set(c, x);
  }
  const rows = links.map((l) => ({ name: l.campaign, where: l.name, url: l.url, id: l.id, ...(byCmp.get(l.campaign) ?? { visitors: 0, lead: 0 }) }));
  for (const [c, x] of byCmp) if (!links.some((l) => l.campaign === c)) rows.push({ name: c, where: srcName(x.src), url: '', id: '', ...x });
  return rows.sort((a, b) => b.visitors - a.visitors);
}
function adsHtml() {
  const rows = adRows();
  return `<section class="sec" id="ads">
    <div class="sec-h"><h2>내 광고 글</h2><button class="btn btn-sm" type="button" id="lb-toggle" aria-expanded="${builderOpen}">${builderOpen ? '닫기' : '+ 광고 글 링크 만들기'}</button></div>
    <div class="builder-box" ${builderOpen ? '' : 'hidden'}>
      <p class="help">글마다 이 링크를 붙이면, 그 글을 보고 들어온 사람이 아래 목록에 따로 세어져요.</p>
      <form class="builder" id="lb" novalidate>
        <label class="field"><span>1. 어디에 올리나요?</span><select name="src">${SOURCES.map(([, n], i) => `<option value="${i}">${esc(n)}</option>`).join('')}<option value="x">직접 입력</option></select></label>
        <label class="field" hidden data-own><span>올릴 곳 이름</span><input name="own" placeholder="예: 헤이코리안"></label>
        <label class="field"><span>2. 이 글의 이름</span><input name="cmp" placeholder="예: 11월 홈페이지 이벤트" required></label>
        <label class="field"><span>3. 눌렀을 때 열릴 페이지</span><select name="dest">${DEST.map(([p, n]) => `<option value="${esc(p)}">${esc(n)}</option>`).join('')}</select></label>
      </form>
      <div class="out"><code id="lb-out">글 이름을 적으면 링크가 만들어져요</code><button class="btn" type="button" id="lb-save" disabled>링크 복사하기</button></div>
      <p class="help">인스타그램은 글 본문 링크가 눌리지 않아요. 프로필 링크나 스토리 링크 스티커에 넣어 주세요.</p>
    </div>
    ${rows.length ? `<ul class="ads">${rows.map((r) => `<li>
        <div class="ad-nm"><b>${esc(r.name)}</b><small>${esc(r.where)}</small></div>
        <div class="ad-n"><strong>${fmt(r.visitors)}<small>명</small></strong>${r.lead ? `<span>연락 ${fmt(r.lead)}명</span>` : ''}</div>
        <div class="ad-act">${r.url ? `<button class="btn btn-line btn-sm" type="button" data-copy="${esc(r.url)}">링크 복사</button><button class="btn-x" type="button" data-del="${esc(r.id)}" aria-label="${esc(r.name)} 지우기">지우기</button>` : ''}</div>
      </li>`).join('')}</ul>` : `<p class="empty">아직 만든 링크가 없어요. 광고 글을 올리기 전에 위 버튼으로 링크를 만들어 붙이세요.</p>`}
  </section>`;
}
function bindLinks() {
  $('#lb-toggle').addEventListener('click', () => { builderOpen = !builderOpen; render(); if (builderOpen) ($('#lb input[name=cmp]') as HTMLInputElement).focus(); });
  const f = document.getElementById('lb') as HTMLFormElement | null;
  if (!f) return;
  const out = $('#lb-out'), sv = $<HTMLButtonElement>('#lb-save');
  const val = (n: string) => ((f.elements.namedItem(n) as HTMLInputElement).value || '').trim();
  let link: { url: string; name: string; source: string; campaign: string; content: string } | null = null;
  const upd = () => {
    const i = val('src'), own = i === 'x';
    ($('[data-own]', f) as HTMLElement).hidden = !own;
    const [src, name, med] = own ? [val('own').toLowerCase().replace(/\s+/g, '_'), val('own'), 'referral'] : SOURCES[Number(i)];
    const cmp = val('cmp');
    link = cmp && src ? { url: buildUrl(val('dest'), src, med, cmp), name, source: src, campaign: cmp, content: '' } : null;
    out.textContent = link?.url ?? '글 이름을 적으면 링크가 만들어져요';
    sv.disabled = !link;
  };
  f.addEventListener('input', upd); f.addEventListener('change', upd);
  f.addEventListener('submit', (e) => e.preventDefault());
  sv.addEventListener('click', async () => {
    if (!link) return;
    copy(link.url);
    const r = await fetch('/api/admin?a=links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(link) }).catch(() => null);
    if (r?.ok) { links.unshift(((await r.json()) as { link: Link }).link); builderOpen = false; render(); } else toast('저장하지 못했어요');
  });
}

/* ── 최근 들어온 사람: 한 사람 = 한 문장 */
function when(t: number) {
  const day = new Date(t).toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
  const hm = new Date(t).toLocaleTimeString('ko-KR', { timeZone: 'Pacific/Auckland', hour: 'numeric', minute: '2-digit' });
  const today = nzToday();
  if (day === today) return `오늘 ${hm}`;
  if (day === addDays(today, -1)) return `어제 ${hm}`;
  return `${Number(day.slice(5, 7))}월 ${Number(day.slice(8))}일 ${hm}`;
}
function recentHtml(d: Stats) {
  const list = d.recent.slice(0, 20);
  if (!list.length) return '<p class="empty">아직 없어요.</p>';
  return `<ul class="people">${list.map((r) => {
    const from = r.src === UNKNOWN ? '어디서 왔는지 모름' : `${srcName(r.src)}${r.cmp ? ` · ${r.cmp}` : ''}에서`;
    const place = [r.c ? country(r.c) : '', r.ct ?? ''].filter(Boolean).join(' ');
    const what = r.dur < 10 && r.pages <= 1 ? '바로 나감' : `${dur(r.dur)} 둘러봄${r.pages > 1 ? ` · ${r.pages}페이지` : ''}`;
    return `<li><time>${esc(when(r.t))}</time>
      <p><b>${esc(from)}</b><span>${esc([place, DEV[r.d ?? ''] ?? '', what].filter(Boolean).join(' · '))}</span></p>
      ${r.goals.length || r.nv ? `<div class="tags">${r.nv ? '' : '<span class="tag">다시 온 사람</span>'}${r.goals.map((g) => `<span class="tag ${g === 'consult_submit' || g === 'kakao' || g === 'whatsapp' ? 'on' : ''}">${esc(GOAL[g] ?? g)}</span>`).join('')}</div>` : ''}</li>`;
  }).join('')}</ul>`;
}

/* ── 더 자세히(접힘): 기기 · 어디까지 봤나 · 언제 들어오나 */
function moreHtml(d: Stats) {
  const devTotal = d.devices.reduce((a, r) => a + r.visitors, 0);
  const secMap = new Map(d.sections.list.map((x) => [x.key, x.n]));
  const heatMax = Math.max(...d.heat.flat(), 1);
  return `<details class="more"><summary>더 자세히 보기 <span>기기 · 첫 화면을 어디까지 봤나 · 언제 많이 들어오나</span></summary>
    <div class="cols">
      <div class="card"><h3>무엇으로 봤나</h3>${bars(d.devices.map((r) => ({ name: DEV[r.key] ?? r.key, n: r.visitors })), devTotal)}</div>
      <div class="card"><h3>첫 화면을 어디까지 봤나 <span>첫 화면에 들어온 ${fmt(d.sections.total)}번 중</span></h3>
        ${d.sections.total ? `<ul class="bars funnel">${SEC.map(([id, n]) => { const v = secMap.get(id) ?? 0; return `<li style="--w:${Math.max((v / d.sections.total) * 100, 1)}%"><span class="nm"><b>${esc(n)}</b></span><span class="vl">${share(v, d.sections.total)}</span></li>`; }).join('')}</ul>
        <p class="help">숫자가 크게 줄어드는 곳에서 사람들이 많이 나가요.</p>` : '<p class="empty">아직 없어요.</p>'}</div>
    </div>
    <div class="card"><h3>언제 많이 들어오나 <span>뉴질랜드 시간</span></h3>
      <div class="heat" role="img" aria-label="요일과 시간대별 방문 수"><span></span>${Array.from({ length: 24 }, (_, h) => `<span class="hx">${h % 3 === 0 ? h : ''}</span>`).join('')}
      ${d.heat.map((row, w) => `<span>${'월화수목금토일'[w]}</span>${row.map((n, h) => `<div class="${n ? '' : 'z'}" style="--a:${(0.12 + (n / heatMax) * 0.88).toFixed(2)}" title="${'월화수목금토일'[w]}요일 ${h}시 · ${n}번"></div>`).join('')}`).join('')}</div>
      <p class="help">진할수록 많이 들어온 시간이에요. 광고 글은 진한 시간 조금 전에 올려 보세요.</p></div>
  </details>`;
}

/* ── 화면 전체 */
function render() {
  const d = data!;
  document.title = '방문 통계 · PAUSE Studio';
  const k = d.kpi;
  const unknown = d.sources.find((r) => r.key === UNKNOWN);
  // 나라마다 많이 들어온 도시 두 곳을 같이
  const citiesOf = (c: string) => d.cities.filter((r) => r.key.endsWith(`, ${c}`)).slice(0, 2).map((r) => r.key.split(', ')[0]).join(', ');

  app.innerHTML = `
  <header class="top"><div class="top-in">
    <div class="brand"><img src="/brand/logo-cream.svg" alt="PAUSE Studio" width="96" height="29"><b>방문 통계</b></div>
    ${d.live.sessions ? `<div class="live"><i></i>지금 ${fmt(d.live.sessions)}명이 보고 있어요</div>` : ''}
    <div class="ranges" role="group" aria-label="기간">${PRESETS.map(([key, n]) => `<button type="button" data-range="${key}" aria-pressed="${preset === key}">${n}</button>`).join('')}</div>
    <button class="btn-x" type="button" id="logout">로그아웃</button>
  </div></header>
  <main>
    ${d.storage ? '' : '<div class="notice"><b>통계 저장소가 아직 연결되지 않았어요.</b><span>지금 보이는 숫자는 곧 사라져요.</span></div>'}
    ${hero(d)}

    ${k.visitors ? `<section class="sec">
      <div class="sec-h"><h2>${d.range.hourly ? '시간별로 들어온 사람' : '날짜별로 들어온 사람'}</h2>${d.range.hourly ? '<p>뉴질랜드 시간</p>' : ''}</div>
      <div class="chart" id="trend"></div>
    </section>` : ''}

    <section class="sec">
      <div class="sec-h"><h2>어디서 보고 들어왔나</h2></div>
      ${bars(d.sources.map((r) => ({ name: srcName(r.key), n: r.visitors, note: leadNote(r) })), k.visitors, 10)}
      ${unknown ? `<p class="help"><b>어디서 왔는지 모름</b>은 주소를 직접 쳤거나, 문자·일부 메신저처럼 어디서 왔는지 알려 주지 않는 곳에서 누른 사람이에요. 광고 글에 아래 <b>광고 글 링크</b>를 붙이면 이런 사람도 어느 글을 보고 왔는지 잡혀요.</p>` : ''}
    </section>

    ${adsHtml()}

    <section class="sec">
      <div class="sec-h"><h2>어느 나라에서</h2></div>
      ${bars(d.countries.map((r) => ({ name: country(r.key), sub: citiesOf(r.key), n: r.visitors, note: leadNote(r) })), k.visitors, 8)}
    </section>

    <section class="sec">
      <div class="sec-h"><h2>최근 들어온 사람</h2><p>최근 20명 · 누구인지는 알 수 없어요</p></div>
      ${recentHtml(d)}
    </section>

    ${k.visitors ? moreHtml(d) : ''}

    <footer class="foot">
      <p>나이·성별은 웹사이트로는 알 수 없어요. 인스타그램·구글 광고를 돌리면 그 광고 관리자 화면에서 볼 수 있어요.</p>
      <p>로봇과 대표님 기기(이 화면에 로그인한 기기)는 세지 않아요. ${store('ps_me') === '1' ? '이 기기는 지금 빠져 있어요.' : ''} <button type="button" id="me">${store('ps_me') === '1' ? '이 기기도 세기(시험용)' : '이 기기 빼기'}</button></p>
    </footer>
  </main>`;

  drawChart();
  bindLinks();
  app.querySelectorAll<HTMLButtonElement>('[data-range]').forEach((b) => b.addEventListener('click', () => { preset = b.dataset.range!; store('ps_admin_range', preset); load(); }));
  $('#logout').addEventListener('click', async () => { await fetch('/api/admin?a=logout', { method: 'POST' }).catch(() => {}); login(); });
  $('#me').addEventListener('click', () => { store('ps_me', store('ps_me') === '1' ? null : '1'); render(); });
  app.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(b.dataset.copy!)));
  app.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('이 링크를 목록에서 지울까요? 이미 들어온 기록은 그대로 남아요.')) return;
    await fetch('/api/admin?a=links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ remove: b.dataset.del }) });
    links = links.filter((l) => l.id !== b.dataset.del); render();
  }));
}

let rz = 0;
addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(drawChart); });
load();
