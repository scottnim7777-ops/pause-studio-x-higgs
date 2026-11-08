/**
 * 방문 통계 대시보드(/admin) — 2026-11-09 사용자: 광고 글을 올리는데 몇 명이 어디서 무슨 링크를 타고 들어왔는지 보고 싶음
 * 숫자는 로그인 뒤 /api/admin/stats 에서만 받는다(이 화면 파일 자체에는 아무 정보도 없음)
 * 그래프는 크림 한 색(진하기 = 크기)이고, 모든 막대·점에 마우스를 올리면 정확한 숫자가 나온다
 */
// 사이트는 CSS를 한 파일로 묶으므로(vite cssCodeSplit: false) 관리자 스타일은 글자로 받아 이 화면에만 넣음(사이트 스타일과 섞이지 않게)
import css from './admin.css?inline';

document.head.append(Object.assign(document.createElement('style'), { textContent: css }));

type Row = { key: string; sessions: number; visitors: number; leads: number; submits: number; dur: number; sub?: string };
type Cnt = { key: string; n: number };
type Kpi = { visitors: number; sessions: number; pageviews: number; avgDur: number; bounce: number; leads: number; submits: number; leadRate: number; newShare: number };
interface Stats {
  ok: boolean; storage: boolean; today: string;
  range: { from: string; to: string; days: number; hourly: boolean; prevFrom: string; prevTo: string };
  kpi: Kpi; prev: Kpi;
  series: { key: string; visitors: number; sessions: number; pageviews: number; leads: number }[];
  channels: Row[]; sources: Row[]; campaigns: Row[]; referrers: Row[]; landing: Row[]; pages: Cnt[];
  countries: Row[]; cities: Row[]; timezones: Row[]; languages: Row[]; devices: Row[]; browsers: Row[]; os: Row[]; apps: Row[];
  goals: Cnt[]; newVsReturning: { newer: number; returning: number };
  sections: { total: number; list: Cnt[] }; scroll: Cnt[]; heat: number[][];
  live: { sessions: number; pages: Cnt[] };
  recent: { t: number; src: string; ch: string; cmp?: string; ref?: string; land: string; pages: number; dur: number; c?: string; ct?: string; rg?: string; d?: string; b?: string; o?: string; l?: string; nv: boolean; goals: string[] }[];
}
interface Link { id: string; name: string; url: string; source: string; campaign: string; content: string; created: number }

const SITE = 'https://pause8studio.com';
const CH: Record<string, string> = { ad: '광고', search: '검색', ai: 'AI 검색', social: 'SNS', messenger: '메신저', email: '이메일', referral: '다른 사이트', campaign: '추적 링크', direct: '직접 방문' };
const CH_HELP: Record<string, string> = {
  ad: '광고 클릭 표시(gclid 등)나 광고용 추적 링크로 들어온 방문', search: '구글·네이버 등에서 검색해 들어온 방문', ai: 'ChatGPT·Perplexity 등 AI 답변의 링크',
  social: '인스타그램·페이스북·스레드 등', messenger: '카카오톡·WhatsApp 등으로 공유된 링크', email: '메일 속 링크', referral: '다른 웹사이트의 링크',
  campaign: '대표님이 만든 추적 링크(출처 이름이 목록에 없는 것)', direct: '주소를 직접 치거나 즐겨찾기, 또는 출처를 숨기는 앱',
};
const GOAL: Record<string, string> = { consult_open: '상담 창 열기', consult_submit: '상담 신청 완료', kakao: '카카오톡', whatsapp: 'WhatsApp', email: '이메일 보기', phone: '전화' };
const DEV: Record<string, string> = { mobile: '휴대폰', desktop: 'PC', tablet: '태블릿' };
const SEC: [string, string][] = [
  ['top', '첫 화면'], ['work', '포트폴리오'], ['why', 'WHY'], ['who', '추천 대상'], ['website', '웹사이트 장'], ['compare', 'BEFORE / AFTER'],
  ['pricing', '웹사이트 요금'], ['fee', '관리비 $0'], ['process', '제작 과정'], ['video', 'AI 광고영상 장'], ['film', '영상 샘플'],
  ['video-pricing', '영상 요금'], ['faq', '자주 묻는 질문'], ['manifesto', '마무리 선언'], ['contact', '문의'],
];
const PAGE: Record<string, string> = {
  '/': '한국어 첫 화면', '/en': '영어 첫 화면', '/en/web-design-los-angeles': 'LA 안내 페이지', '/en/web-design-new-york': '뉴욕 안내 페이지', '/en/web-design-atlanta': '애틀랜타 안내 페이지',
};
const LANG = new Intl.DisplayNames(['ko'], { type: 'language' });
const REGION = new Intl.DisplayNames(['ko'], { type: 'region' });

const $ = <T extends Element = HTMLElement>(s: string, root: ParentNode = document) => root.querySelector<T>(s)!;
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const fmt = (n: number) => n.toLocaleString('ko-KR');
const pct = (n: number, d = 0) => `${(n * 100).toFixed(d)}%`;
const share = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)}%` : '');
const dur = (s: number) => (s < 60 ? `${s}초` : `${Math.floor(s / 60)}분 ${String(s % 60).padStart(2, '0')}초`);
const country = (c?: string) => { if (!c || c === '??') return '알 수 없음'; try { return REGION.of(c) || c; } catch { return c; } };
const lang = (l: string) => { try { return LANG.of(l) || l; } catch { return l; } };
const page = (p: string) => PAGE[p] ?? p;
const store = (k: string, v?: string | null) => {
  try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch { /* */ }
  return null;
};

/* ── 기간 */
const nzToday = () => new Date().toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 86400000).toISOString().slice(0, 10);
const PRESETS: [string, string, (t: string) => [string, string]][] = [
  ['today', '오늘', (t) => [t, t]], ['yesterday', '어제', (t) => [addDays(t, -1), addDays(t, -1)]],
  ['7d', '7일', (t) => [addDays(t, -6), t]], ['30d', '30일', (t) => [addDays(t, -29), t]], ['90d', '90일', (t) => [addDays(t, -89), t]],
];
let preset = store('ps_admin_range') || '7d';
let custom: [string, string] | null = null;
let metric: 'visitors' | 'pageviews' | 'leads' = 'visitors';
let data: Stats | null = null;
let links: Link[] = [];
let timer = 0;
let seq = 0; // 기간을 빨리 바꿀 때 늦게 도착한 이전 응답이 화면을 덮지 않게

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

function range(): [string, string] {
  if (custom) return custom;
  return (PRESETS.find(([k]) => k === preset) ?? PRESETS[2])[2](nzToday());
}

async function load() {
  clearTimeout(timer);
  const my = ++seq;
  const [from, to] = range();
  let r: Stats | 'login' | 'not_configured';
  try { r = await api<Stats>(`/api/admin/stats?from=${from}&to=${to}`); }
  catch { app.innerHTML = `<div class="login"><div><p class="err">통계를 불러오지 못했습니다. 잠시 뒤 새로고침해 주세요.</p></div></div>`; return; }
  if (my !== seq) return;
  if (r === 'login' || r === 'not_configured') { login(r === 'not_configured'); return; }
  const l = await api<{ links: Link[] }>('/api/admin/links').catch(() => null);
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
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: (f.elements.namedItem('pw') as HTMLInputElement).value }) }).catch(() => null);
    btn.disabled = false;
    if (res?.ok) { store('ps_me', '1'); load(); return; } // 이 기기의 방문은 통계에서 뺌
    const code = res ? ((await res.json().catch(() => ({}))) as { code?: string }).code : 'net';
    err.hidden = false;
    err.textContent = code === 'rate_limited' ? '시도가 너무 많습니다. 15분 뒤에 다시 해 주세요.' : code === 'not_configured' ? '서버에 비밀번호가 설정되지 않았습니다.' : code === 'net' ? '연결이 끊겼습니다. 다시 시도해 주세요.' : '비밀번호가 맞지 않습니다.';
  });
}

/* ── 그리기 도구 */
function delta(cur: number, prev: number) {
  if (!prev && !cur) return '<em>이전 기간과 같음</em>';
  if (!prev) return '<em>이전 기간 <b>0</b>에서 새로</em>';
  const d = (cur - prev) / prev;
  if (Math.abs(d) < 0.005) return '<em>이전 기간과 같음</em>';
  const up = d > 0;
  // 이전 기간이 아주 적으면 % 가 지나치게 커져 읽기 어려움 → 배수로
  if (d >= 4) return `<em>이전 기간 ${fmt(prev)}에서 <b>▲ ${Math.round(cur / prev)}배</b></em>`;
  return `<em>이전 기간보다 <b>${up ? '▲' : '▼'} ${Math.abs(Math.round(d * 100))}%</b></em>`;
}

/** 막대 목록: 이름 · 값 · 비율. 이름 옆 작은 글씨(sub), 마우스를 올리면 자세한 숫자 */
function bars(rows: { name: string; sub?: string; n: number; tip?: string; href?: string }[], total?: number, limit = 8) {
  if (!rows.length) return '<p class="empty">아직 기록이 없습니다.</p>';
  const max = Math.max(...rows.map((r) => r.n), 1);
  const sum = total ?? rows.reduce((a, r) => a + r.n, 0);
  const shown = rows.slice(0, limit), rest = rows.slice(limit);
  const items = rest.length ? [...shown, { name: `그 밖 ${rest.length}곳`, n: rest.reduce((a, r) => a + r.n, 0), tip: rest.slice(0, 12).map((r) => `${esc(r.name)} ${r.n}`).join(' · ') }] : shown;
  return `<ul class="bars">${items.map((r) => `<li style="--w:${Math.max((r.n / max) * 100, 1.5)}%" data-tip="${esc(r.tip ?? `<b>${esc(r.name)}</b><br>${fmt(r.n)} · ${share(r.n, sum)}`)}">
    <span class="nm">${r.href ? `<a href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${esc(r.name)}</a>` : esc(r.name)}${r.sub ? ` <i>${esc(r.sub)}</i>` : ''}</span>
    <span class="vl">${fmt(r.n)}</span><span class="sh">${share(r.n, sum)}</span></li>`).join('')}</ul>`;
}
const rowTip = (name: string, r: Row) => `<b>${esc(name)}</b><br>방문 ${fmt(r.sessions)} · 방문자 ${fmt(r.visitors)}<br>평균 ${dur(r.dur)} · 연락 ${fmt(r.leads)}${r.submits ? ` · 상담 신청 ${fmt(r.submits)}` : ''}`;
const rowBars = (rows: Row[], name: (r: Row) => string, opt: { sub?: (r: Row) => string; href?: (r: Row) => string | undefined; limit?: number } = {}) =>
  bars(rows.map((r) => ({ name: name(r), sub: opt.sub?.(r), n: r.sessions, tip: rowTip(name(r), r), href: opt.href?.(r) })), data!.kpi.sessions, opt.limit);

function sourceTable(rows: Row[]) {
  if (!rows.length) return '<p class="empty">아직 기록이 없습니다.</p>';
  const max = Math.max(...rows.map((r) => r.sessions), 1);
  return `<div class="tbl-wrap"><table><thead><tr><th>출처</th><th>방문</th><th>방문자</th><th>평균 시간</th><th>연락</th><th>연락 비율</th><th>상담 신청</th></tr></thead><tbody>
  ${rows.slice(0, 20).map((r) => `<tr><td class="nm"><b>${esc(r.key)}</b><small>${esc(CH[r.sub ?? ''] ?? '')}</small></td>
    <td><span class="meter" style="width:${Math.max((r.sessions / max) * 48, 2)}px"></span>${fmt(r.sessions)}</td><td>${fmt(r.visitors)}</td><td>${dur(r.dur)}</td>
    <td>${r.leads ? `<b>${fmt(r.leads)}</b>` : '<span class="dim">0</span>'}</td><td>${r.sessions ? pct(r.leads / r.sessions, 1) : ''}</td><td>${r.submits ? `<b>${fmt(r.submits)}</b>` : '<span class="dim">0</span>'}</td></tr>`).join('')}
  </tbody></table></div>`;
}

/** 시간 흐름: 하나의 값만(한 축). 선 + 옅은 면, 마우스를 따라 세로선과 숫자 */
function drawChart() {
  const box = document.getElementById('trend');
  if (!box || !data) return;
  const s = data.series, W = box.clientWidth, H = box.clientHeight, L = 40, R = 8, T = 12, B = 28;
  const vals = s.map((x) => x[metric]);
  const top = niceMax(Math.max(...vals, 1));
  const x = (i: number) => L + (s.length === 1 ? (W - L - R) / 2 : (i / (s.length - 1)) * (W - L - R));
  const y = (v: number) => T + (1 - v / top) * (H - T - B);
  const ticks = [0, top / 2, top].filter((v, i, a) => a.indexOf(v) === i);
  const every = Math.ceil(s.length / Math.max(Math.floor((W - L) / 64), 1));
  const label = (k: string) => (data!.range.hourly ? `${Number(k)}시` : `${Number(k.slice(5, 7))}.${Number(k.slice(8))}`);
  const pts = s.map((d, i) => `${x(i).toFixed(1)},${y(d[metric]).toFixed(1)}`);
  // 날짜가 많지 않으면 막대가 더 읽기 쉬움(30일 이하·시간별)
  const asBars = s.length <= 31;
  const bw = Math.max(Math.min(((W - L - R) / s.length) * 0.62, 28), 2);
  const xb = (i: number) => L + ((i + 0.5) / s.length) * (W - L - R);
  const xx = asBars ? xb : x;
  box.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(METRIC[metric])} 흐름">
    <defs><linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FCEED8" stop-opacity=".22"/><stop offset="1" stop-color="#FCEED8" stop-opacity="0"/></linearGradient></defs>
    ${ticks.map((v) => `<line class="${v ? 'gl' : 'base'}" x1="${L}" x2="${W - R}" y1="${y(v)}" y2="${y(v)}"/><text class="ax" x="${L - 10}" y="${y(v) + 4}" text-anchor="end">${fmt(v)}</text>`).join('')}
    ${s.map((d, i) => (i % every === 0 ? `<text class="ax" x="${xx(i)}" y="${H - 6}" text-anchor="middle">${label(d.key)}</text>` : '')).join('')}
    ${asBars
      ? s.map((d, i) => { const h = y(0) - y(d[metric]); return h > 0 ? `<path class="bar" d="M${xb(i) - bw / 2},${y(0)} v${-Math.max(h - 4, 0)} q0,-4 4,-4 h${bw - 8} q4,0 4,4 v${Math.max(h - 4, 0)} z"/>` : ''; }).join('')
      : `<path class="ar" d="M${x(0)},${y(0)} L${pts.join(' L')} L${x(s.length - 1)},${y(0)} Z"/><polyline class="ln" points="${pts.join(' ')}"/>`}
    <line class="cross" y1="${T}" y2="${y(0)}" visibility="hidden"/>${asBars ? '' : '<circle class="dot" r="5" visibility="hidden"/>'}
  </svg>`;
  const svg = box.querySelector('svg')!, cross = svg.querySelector('.cross')!, dot = svg.querySelector('.dot');
  const show = (cx: number, cy: number) => {
    const span = W - L - R;
    const i = asBars ? Math.min(Math.max(Math.floor(((cx - L) / span) * s.length), 0), s.length - 1) : Math.round(Math.min(Math.max((cx - L) / span, 0), 1) * (s.length - 1));
    const d = s[i], px = xx(i);
    cross.setAttribute('x1', String(px)); cross.setAttribute('x2', String(px)); cross.setAttribute('visibility', 'visible');
    if (dot) { dot.setAttribute('cx', String(px)); dot.setAttribute('cy', String(y(d[metric]))); dot.setAttribute('visibility', 'visible'); }
    const r = svg.getBoundingClientRect();
    tip(`<b>${data!.range.hourly ? `${Number(d.key)}시 대` : d.key}</b><br>방문자 ${fmt(d.visitors)} · 방문 ${fmt(d.sessions)}<br>페이지뷰 ${fmt(d.pageviews)} · 연락 ${fmt(d.leads)}`, r.left + px, r.top + Math.min(y(d[metric]), cy));
  };
  svg.addEventListener('pointermove', (e) => { const r = svg.getBoundingClientRect(); show(e.clientX - r.left, e.clientY - r.top); });
  svg.addEventListener('pointerleave', () => { cross.setAttribute('visibility', 'hidden'); dot?.setAttribute('visibility', 'hidden'); tip(''); });
}
const METRIC = { visitors: '방문자', pageviews: '페이지뷰', leads: '연락으로 이어진 방문' } as const;
function niceMax(v: number) {
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
document.addEventListener('pointerover', (e) => {
  const t = (e.target as Element).closest?.('[data-tip]');
  if (!t) return;
  const r = t.getBoundingClientRect();
  tip(t.getAttribute('data-tip')!, r.left + Math.min(r.width / 2, 160), r.top);
});
document.addEventListener('pointerout', (e) => { if ((e.target as Element).closest?.('[data-tip]')) tip(''); });

function toast(msg: string) {
  const t = document.createElement('div');
  t.className = 'toast'; t.textContent = msg; t.setAttribute('role', 'status');
  document.body.append(t);
  setTimeout(() => t.remove(), 1800);
}
async function copy(text: string) {
  try { await navigator.clipboard.writeText(text); toast('복사했습니다'); } catch { prompt('복사해서 쓰세요', text); }
}

/* ── 한눈에 요약: 대표가 바로 판단할 수 있게 사실만 문장으로 */
function brief(d: Stats) {
  const out: [string, string][] = [];
  const k = d.kpi;
  if (!k.sessions) return '<ul class="brief"><li><small>한눈에</small>이 기간에는 아직 방문 기록이 없습니다. 추적 링크를 만들어 광고 글에 붙여 보세요.</li></ul>';
  const top = d.sources[0];
  out.push(['가장 많이 들어온 곳', `<strong>${esc(top.key)}</strong>에서 방문 ${fmt(top.sessions)}번(${share(top.sessions, k.sessions)})이 들어왔습니다.`]);
  const conv = d.sources.filter((r) => r.sessions >= 5 && r.leads).sort((a, b) => b.leads / b.sessions - a.leads / a.sessions)[0];
  out.push(conv
    ? ['연락으로 가장 잘 이어진 곳', `<strong>${esc(conv.key)}</strong>, 방문 ${fmt(conv.sessions)}번 중 ${fmt(conv.leads)}번(${pct(conv.leads / conv.sessions, 1)})이 상담·연락까지 갔습니다.`]
    : ['연락', k.leads ? `연락으로 이어진 방문 <strong>${fmt(k.leads)}번</strong>. 출처별로 보려면 방문이 더 쌓여야 합니다(출처마다 5번 이상).` : '아직 연락으로 이어진 방문은 없습니다.']);
  const cmp = d.campaigns[0];
  if (cmp) { const [c, s] = cmp.key.split('\t'); out.push(['추적 링크 1위', `<strong>${esc(c)}</strong>(${esc(s)}) 방문 ${fmt(cmp.sessions)}번 · 연락 ${fmt(cmp.leads)}번`]); }
  let best = [0, 0, 0];
  d.heat.forEach((row, w) => row.forEach((n, h) => { if (n > best[0]) best = [n, w, h]; }));
  if (best[0] >= 3) out.push(['많이 들어오는 때', `뉴질랜드 시간 <strong>${'월화수목금토일'[best[1]]}요일 ${best[2]}시 대</strong>에 가장 많이 들어옵니다. 글은 그 조금 전에 올려 보세요.`]);
  const mob = d.devices.find((r) => r.key === 'mobile');
  if (mob) out.push(['기기', `방문의 <strong>${share(mob.sessions, k.sessions)}</strong>가 휴대폰입니다.`]);
  return `<ul class="brief">${out.map(([h, t]) => `<li><small>${h}</small>${t}</li>`).join('')}</ul>`;
}

/* ── 추적 링크 */
const SOURCES: [string, string, string][] = [
  ['instagram', 'Instagram 게시물·스토리', 'social'], ['instagram', 'Instagram 광고', 'paid_social'], ['facebook', 'Facebook 게시물', 'social'], ['facebook', 'Facebook·Meta 광고', 'paid_social'],
  ['threads', 'Threads', 'social'], ['kakaotalk', '카카오톡(단톡방·채널)', 'messenger'], ['naver', '네이버 블로그·카페', 'blog'], ['google', 'Google 검색 광고', 'cpc'],
  ['youtube', 'YouTube', 'social'], ['tiktok', 'TikTok', 'social'], ['whatsapp', 'WhatsApp', 'messenger'], ['email', '이메일', 'email'],
];
const DEST: [string, string][] = [['/', '한국어 첫 화면'], ['/#contact', '한국어 문의 바로'], ['/en', '영어 첫 화면'], ['/en/web-design-los-angeles', 'LA 안내 페이지'], ['/en/web-design-new-york', '뉴욕 안내 페이지'], ['/en/web-design-atlanta', '애틀랜타 안내 페이지']];
function buildUrl(dest: string, src: string, med: string, cmp: string, cnt: string) {
  const [p, hash] = dest.split('#');
  const q = new URLSearchParams({ utm_source: src, utm_medium: med, utm_campaign: cmp });
  if (cnt) q.set('utm_content', cnt);
  return `${SITE}${p}?${q.toString()}${hash ? `#${hash}` : ''}`;
}
function linkStats(l: Link) {
  const rows = data!.campaigns.filter((r) => { const [c, , n] = r.key.split('\t'); return c === l.campaign && (!l.content || n === l.content); });
  return rows.reduce((a, r) => ({ s: a.s + r.sessions, v: a.v + r.visitors, l: a.l + r.leads }), { s: 0, v: 0, l: 0 });
}
function linksHtml() {
  return `<div class="card">
    <h3>추적 링크 만들기</h3>
    <p class="help">광고 글마다 다른 링크를 붙이면 어느 글에서 몇 명이 왔는지 정확히 나눠 볼 수 있습니다.</p>
    <form class="builder" id="lb" novalidate>
      <label class="field"><span>올릴 곳</span><select name="src">${SOURCES.map(([, n], i) => `<option value="${i}">${esc(n)}</option>`).join('')}<option value="x">직접 입력</option></select></label>
      <label class="field" hidden data-own><span>올릴 곳 이름(영문 권장)</span><input name="own" placeholder="heykorean"></label>
      <label class="field"><span>캠페인 이름</span><input name="cmp" placeholder="11월 웹사이트 상담 이벤트" required></label>
      <label class="field"><span>글 구분(선택)</span><input name="cnt" placeholder="영상 글 · 사진 글 · A안"></label>
      <label class="field"><span>연결할 페이지</span><select name="dest">${DEST.map(([p, n]) => `<option value="${esc(p)}">${esc(n)}</option>`).join('')}</select></label>
    </form>
    <div class="out"><code id="lb-out">캠페인 이름을 적으면 링크가 만들어집니다</code><button class="btn btn-sm" type="button" id="lb-copy" disabled>복사</button><button class="btn btn-line btn-sm" type="button" id="lb-save" disabled>복사하고 저장</button></div>
    <p class="help"><b>쓰는 법</b> 광고 글·게시물·카톡 공지에 이 링크를 붙이세요. 인스타그램은 본문 링크가 눌리지 않으니 프로필 링크나 스토리 링크 스티커에 넣습니다. 같은 캠페인이라도 글이 여러 개면 '글 구분'만 바꿔서 따로 만드세요.</p>
  </div>
  <div class="card">
    <h3>저장한 링크 <span>고른 기간의 성과</span></h3>
    ${links.length ? `<div class="tbl-wrap"><table><thead><tr><th>캠페인</th><th>방문</th><th>방문자</th><th>연락</th><th></th></tr></thead><tbody>
      ${links.map((l) => { const s = linkStats(l); return `<tr><td class="nm"><b>${esc(l.campaign)}</b><small>${esc(l.name)}${l.content ? ` · ${esc(l.content)}` : ''} · ${new Date(l.created).toLocaleDateString('ko-KR')}</small></td>
        <td>${fmt(s.s)}</td><td>${fmt(s.v)}</td><td>${s.l ? `<b>${fmt(s.l)}</b>` : '<span class="dim">0</span>'}</td>
        <td><button class="btn btn-line btn-sm" type="button" data-copy="${esc(l.url)}">복사</button> <button class="btn btn-line btn-sm" type="button" data-del="${esc(l.id)}" aria-label="${esc(l.campaign)} 링크 지우기">지우기</button></td></tr>`; }).join('')}
    </tbody></table></div>` : '<p class="empty">아직 저장한 링크가 없습니다.</p>'}
  </div>`;
}
function bindLinks() {
  const f = document.getElementById('lb') as HTMLFormElement | null;
  if (!f) return;
  const out = $('#lb-out'), cp = $<HTMLButtonElement>('#lb-copy'), sv = $<HTMLButtonElement>('#lb-save');
  const val = (n: string) => ((f.elements.namedItem(n) as HTMLInputElement).value || '').trim();
  let cur: { url: string; name: string; source: string; campaign: string; content: string } | null = null;
  const upd = () => {
    const i = val('src'), own = i === 'x';
    ($('[data-own]', f) as HTMLElement).hidden = !own;
    const [src, name, med] = own ? [val('own').toLowerCase().replace(/\s+/g, '_'), val('own'), 'referral'] : SOURCES[Number(i)];
    const cmp = val('cmp'), cnt = val('cnt');
    cur = cmp && src ? { url: buildUrl(val('dest'), src, med, cmp, cnt), name, source: src, campaign: cmp, content: cnt } : null;
    out.textContent = cur?.url ?? '캠페인 이름을 적으면 링크가 만들어집니다';
    cp.disabled = sv.disabled = !cur;
  };
  f.addEventListener('input', upd); f.addEventListener('change', upd);
  f.addEventListener('submit', (e) => e.preventDefault());
  cp.addEventListener('click', () => cur && copy(cur.url));
  sv.addEventListener('click', async () => {
    if (!cur) return;
    copy(cur.url);
    const r = await fetch('/api/admin/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cur) }).catch(() => null);
    if (r?.ok) { links.unshift(((await r.json()) as { link: Link }).link); render(); } else toast('저장하지 못했습니다');
  });
}

/* ── 화면 전체 */
function render() {
  const d = data!;
  document.title = '방문 통계 · PAUSE Studio';
  const k = d.kpi, p = d.prev;
  const [from, to] = [d.range.from, d.range.to];
  const lead = (g: string) => d.goals.find((x) => x.key === g)?.n ?? 0;
  const secMap = new Map(d.sections.list.map((x) => [x.key, x.n]));
  const heatMax = Math.max(...d.heat.flat(), 1);
  const nvTotal = d.newVsReturning.newer + d.newVsReturning.returning;
  const devTotal = d.devices.reduce((a, r) => a + r.sessions, 0);

  app.innerHTML = `
  <header class="top"><div class="top-in">
    <div class="brand"><img src="/brand/logo-cream.svg" alt="PAUSE Studio" width="96" height="29"><b>방문 통계</b></div>
    <div class="live ${d.live.sessions ? '' : 'zero'}" data-tip="${esc(d.live.pages.length ? d.live.pages.map((x) => `${esc(page(x.key))} ${x.n}`).join('<br>') : '최근 5분 안에 움직임이 있던 방문')}"><i></i>지금 ${fmt(d.live.sessions)}명</div>
    <div class="ranges" role="group" aria-label="기간">${PRESETS.map(([key, n]) => `<button type="button" data-range="${key}" aria-pressed="${!custom && preset === key}">${n}</button>`).join('')}</div>
    <label class="custom"><span class="sr">시작일</span><input type="date" id="from" value="${from}" max="${d.today}"> ~ <span class="sr">종료일</span><input type="date" id="to" value="${to}" max="${d.today}"></label>
    <div class="top-actions"><button class="btn btn-line btn-sm" type="button" id="reload">새로고침</button><button class="btn btn-line btn-sm" type="button" id="logout">로그아웃</button></div>
  </div></header>
  <main>
    ${d.storage ? '' : '<div class="notice"><b>통계 저장소가 아직 연결되지 않았습니다.</b><span>지금 보이는 숫자는 서버가 잠시 기억하는 것이라 곧 사라집니다. 저장소(Upstash Redis)를 연결하면 그때부터 400일 동안 쌓입니다.</span></div>'}
    <div class="head"><h1>${from === to ? from : `${from} ~ ${to}`}</h1><p>뉴질랜드 시간 기준 · 비교는 바로 앞 같은 기간(${d.range.prevFrom}${d.range.prevFrom === d.range.prevTo ? '' : ` ~ ${d.range.prevTo}`})</p></div>
    ${brief(d)}
    <section class="kpis" aria-label="핵심 숫자">
      <div class="kpi" data-tip="같은 브라우저는 여러 번 와도 한 명"><span>방문자</span><strong>${fmt(k.visitors)}</strong>${delta(k.visitors, p.visitors)}</div>
      <div class="kpi" data-tip="창을 열고 머문 한 번. 30분 넘게 쉬면 새 방문"><span>방문</span><strong>${fmt(k.sessions)}</strong>${delta(k.sessions, p.sessions)}</div>
      <div class="kpi"><span>페이지뷰</span><strong>${fmt(k.pageviews)}</strong>${delta(k.pageviews, p.pageviews)}</div>
      <div class="kpi" data-tip="화면을 실제로 보고 있던 시간만(다른 앱으로 간 시간 제외)"><span>평균 머문 시간</span><strong>${dur(k.avgDur)}</strong>${delta(k.avgDur, p.avgDur)}</div>
      <div class="kpi" data-tip="상담 신청 완료·카카오톡·WhatsApp·이메일 보기·전화 중 하나라도 한 방문"><span>연락으로 이어진 방문</span><strong>${fmt(k.leads)}<small>${k.sessions ? pct(k.leadRate, 1) : ''}</small></strong>${delta(k.leads, p.leads)}</div>
      <div class="kpi"><span>상담 신청 완료</span><strong>${fmt(k.submits)}</strong>${delta(k.submits, p.submits)}</div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>TREND</small>${d.range.hourly ? '시간별' : '날짜별'} 흐름</h2>
        <div class="tabs" role="group" aria-label="볼 값">${(Object.keys(METRIC) as (keyof typeof METRIC)[]).map((m) => `<button type="button" data-metric="${m}" aria-pressed="${metric === m}">${METRIC[m]}</button>`).join('')}</div></div>
      <div class="chart" id="trend"></div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>SOURCE</small>어디서 들어왔나</h2><p>방문의 첫 페이지 기준. 연락 비율이 높은 곳이 광고비를 쓸 만한 곳입니다</p></div>
      <div class="cols">
        <div class="card"><h3>경로 <span>방문 수</span></h3>${rowBars(d.channels, (r) => CH[r.key] ?? r.key, { sub: (r) => '' + (r.leads ? `연락 ${r.leads}` : ''), limit: 9 })}
          <p class="help">${d.channels.slice(0, 3).map((r) => `<b>${esc(CH[r.key] ?? r.key)}</b> ${esc(CH_HELP[r.key] ?? '')}`).join('<br>')}</p></div>
        <div class="card"><h3>출처별 성과 <span>상위 20곳</span></h3>${sourceTable(d.sources)}</div>
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>CAMPAIGN</small>광고 글 · 추적 링크</h2><p>추적 링크를 붙인 글만 여기서 나눠 보입니다</p></div>
      <div class="cols">${linksHtml()}</div>
      <div class="card"><h3>캠페인별 <span>캠페인 · 출처 · 글 구분</span></h3>
        ${d.campaigns.length ? `<div class="tbl-wrap"><table><thead><tr><th>캠페인</th><th>출처</th><th>글 구분</th><th>방문</th><th>방문자</th><th>평균 머문 시간</th><th>연락</th><th>상담 신청</th></tr></thead><tbody>
        ${d.campaigns.map((r) => { const [c, s, n] = r.key.split('\t'); return `<tr><td class="nm"><b>${esc(c)}</b></td><td>${esc(s)}</td><td class="dim">${esc(n || '')}</td><td>${fmt(r.sessions)}</td><td>${fmt(r.visitors)}</td><td>${dur(r.dur)}</td><td>${r.leads ? `<b>${fmt(r.leads)}</b>` : '<span class="dim">0</span>'}</td><td>${fmt(r.submits)}</td></tr>`; }).join('')}
        </tbody></table></div>` : '<p class="empty">이 기간에 추적 링크로 들어온 방문은 없습니다.</p>'}</div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>LINKS</small>들어온 주소와 첫 페이지</h2><p>앞 페이지 주소는 상대 사이트가 알려 줄 때만 보입니다. 구글·인스타 등은 주소 일부만 알려 줍니다</p></div>
      <div class="cols cols-3">
        <div class="card"><h3>들어온 주소 <span>앞 페이지</span></h3>${rowBars(d.referrers, (r) => r.key.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), { href: (r) => (/^https?:\/\//.test(r.key) ? r.key : undefined), limit: 12 })}</div>
        <div class="card"><h3>처음 본 페이지</h3>${rowBars(d.landing, (r) => page(r.key))}</div>
        <div class="card"><h3>많이 본 페이지 <span>페이지뷰</span></h3>${bars(d.pages.map((x) => ({ name: page(x.key), n: x.n })))}</div>
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>WHERE</small>어디에서 보나</h2><p>접속 위치(IP)로 알아낸 나라·도시. IP 자체는 저장하지 않습니다</p></div>
      <div class="cols cols-3">
        <div class="card"><h3>나라</h3>${rowBars(d.countries, (r) => country(r.key), { sub: (r) => (r.key !== '??' ? r.key : '') })}</div>
        <div class="card"><h3>도시 <span>가까운 대도시 기준</span></h3>${d.cities.length ? rowBars(d.cities, (r) => r.key.replace(/, \d+(?=,)/, '').replace(/, ([A-Z]{2})$/, (_m, c) => `, ${country(c)}`)) : '<p class="empty">아직 도시 정보가 없습니다. 오른쪽 시간대로 지역을 짐작할 수 있습니다.</p>'}</div>
        <div class="card"><h3>시간대 <span>방문자 기기 설정</span></h3>${rowBars(d.timezones, (r) => r.key.replace(/_/g, ' '))}</div>
      </div>
      <div class="cols">
        <div class="card"><h3>브라우저 언어</h3>${rowBars(d.languages, (r) => lang(r.key))}</div>
        <div class="card"><h3>언제 들어오나 <span>요일 × 시간 · 뉴질랜드 시간</span></h3>
          <div class="heat" role="img" aria-label="요일과 시간대별 방문 수"><span></span>${Array.from({ length: 24 }, (_, h) => `<span class="hx">${h % 3 === 0 ? h : ''}</span>`).join('')}
          ${d.heat.map((row, w) => `<span>${'월화수목금토일'[w]}</span>${row.map((n, h) => `<div class="${n ? '' : 'z'}" style="--a:${(0.12 + (n / heatMax) * 0.88).toFixed(2)}" data-tip="<b>${'월화수목금토일'[w]}요일 ${h}시</b><br>방문 ${n}"></div>`).join('')}`).join('')}</div>
          <div class="heat-k">적음<b></b>많음</div></div>
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>DEVICE</small>무엇으로 보나</h2></div>
      <div class="cols">
        <div class="card"><h3>기기</h3>${devTotal ? `<div class="split">${d.devices.map((r) => `<div style="flex:${r.sessions}" data-tip="${esc(rowTip(DEV[r.key] ?? r.key, r))}">${r.sessions / devTotal > 0.12 ? `${esc(DEV[r.key] ?? r.key)} ${share(r.sessions, devTotal)}` : ''}</div>`).join('')}</div>
          <div class="split-k">${d.devices.map((r) => `<span><i></i>${esc(DEV[r.key] ?? r.key)} ${fmt(r.sessions)}</span>`).join('')}</div>` : '<p class="empty">아직 기록이 없습니다.</p>'}
          <h3 style="margin-top:16px">처음 · 다시 온 방문</h3>${nvTotal ? `<div class="split"><div style="flex:${d.newVsReturning.newer}">${d.newVsReturning.newer / nvTotal > 0.15 ? `처음 ${share(d.newVsReturning.newer, nvTotal)}` : ''}</div><div style="flex:${d.newVsReturning.returning}">${d.newVsReturning.returning / nvTotal > 0.15 ? `다시 ${share(d.newVsReturning.returning, nvTotal)}` : ''}</div></div>
          <div class="split-k"><span><i></i>처음 온 방문 ${fmt(d.newVsReturning.newer)}</span><span><i></i>다시 온 방문 ${fmt(d.newVsReturning.returning)}</span></div>` : ''}</div>
        <div class="card"><h3>앱 안에서 연 방문 <span>인스타·카톡 등 앱 속 브라우저</span></h3>${rowBars(d.apps, (r) => r.key)}</div>
      </div>
      <div class="cols">
        <div class="card"><h3>브라우저</h3>${rowBars(d.browsers, (r) => r.key)}</div>
        <div class="card"><h3>운영체제</h3>${rowBars(d.os, (r) => r.key)}</div>
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>ENGAGEMENT</small>얼마나 보고, 무엇을 눌렀나</h2><p>첫 화면에서 각 섹션까지 내려온 방문의 비율. 크게 줄어드는 곳이 손님이 떠나는 곳입니다</p></div>
      <div class="cols">
        <div class="card"><h3>섹션별로 본 비율 <span>첫 화면 방문 ${fmt(d.sections.total)}번 기준</span></h3>
          ${d.sections.total ? `<ul class="bars funnel">${SEC.map(([id, n], i) => { const v = secMap.get(id) ?? 0; return `<li style="--w:${Math.max((v / d.sections.total) * 100, 1)}%" data-tip="<b>${esc(n)}</b><br>${fmt(v)}번 · ${share(v, d.sections.total)}"><span class="no">${String(i + 1).padStart(2, '0')}</span><span class="nm">${esc(n)}</span><span class="vl">${share(v, d.sections.total)}</span><span class="sh">${fmt(v)}</span></li>`; }).join('')}</ul>` : '<p class="empty">아직 기록이 없습니다.</p>'}</div>
        <div class="card"><h3>연락 행동 <span>방문 수</span></h3>${bars(Object.keys(GOAL).map((g) => ({ name: GOAL[g], n: lead(g) })).filter((x) => x.n), k.sessions)}
          <h3 style="margin-top:16px">스크롤 깊이 <span>페이지를 어디까지 내렸나</span></h3>${bars(d.scroll.map((x) => ({ name: `${x.key} 이상`, n: x.n })), d.sections.total)}
          <p class="help">이탈: 한 페이지만 보고 10초 안에 나간 방문 <b>${pct(k.bounce)}</b> · 처음 온 방문 <b>${pct(k.newShare)}</b></p></div>
      </div>
    </section>

    <section class="sec">
      <div class="sec-h"><h2><small>RECENT</small>최근 방문</h2><p>최근 60개 · 개인을 알아볼 수 있는 정보는 없습니다</p></div>
      ${d.recent.length ? `<div class="tbl-wrap"><table class="feed"><thead><tr><th>시각</th><th>출처</th><th>첫 페이지</th><th>위치</th><th>기기</th><th class="n">머문 시간</th><th class="n">페이지</th><th>행동</th></tr></thead><tbody>
      ${d.recent.map((r) => `<tr><td>${new Date(r.t).toLocaleString('ko-KR', { timeZone: 'Pacific/Auckland', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}${r.nv ? ' <span class="tag">처음</span>' : ''}</td>
        <td class="nm"><b>${esc(r.src)}</b><small>${esc([CH[r.ch] === r.src ? '' : CH[r.ch], r.cmp].filter(Boolean).join(' · '))}${r.ref ? ` · ${esc(r.ref.replace(/^https?:\/\/(www\.)?/, '').slice(0, 48))}` : ''}</small></td>
        <td>${esc(page(r.land))}</td><td>${esc([r.ct, r.c ? country(r.c) : ''].filter(Boolean).join(', '))}</td><td>${esc(DEV[r.d ?? ''] ?? '')} <span class="dim">${esc(r.b ?? '')}</span></td>
        <td class="n">${dur(r.dur)}</td><td class="n">${r.pages}</td><td><span class="goals">${r.goals.map((g) => `<span class="tag ${g === 'consult_submit' ? 'on' : ''}">${esc(GOAL[g] ?? g)}</span>`).join('')}</span></td></tr>`).join('')}
      </tbody></table></div>` : '<p class="empty">아직 기록이 없습니다.</p>'}
    </section>

    <footer class="foot">
      <p><b>연령·성별</b>은 보이지 않습니다. 웹사이트는 방문자의 나이를 알 수 없고, 구글·메타도 로그인 정보로 짐작한 값만 광고 관리자 안에서 보여 줍니다. 광고를 집행하면 그 광고 관리자의 '인구 통계'에서 확인하세요.</p>
      <p><b>세지 않는 방문</b>: 검색엔진 로봇·자동 프로그램, 그리고 이 화면에 로그인한 기기(대표님 본인). 이 기기는 지금 ${store('ps_me') === '1' ? '<b>통계에서 빠져 있습니다</b>' : '로그인 쿠키가 있는 동안 빠집니다'}. <button type="button" id="me">${store('ps_me') === '1' ? '이 기기도 세기(테스트용)' : '이 기기 계속 빼기'}</button></p>
      <p>기록은 400일 동안 보관하고 저절로 지워집니다. 광고 차단 프로그램을 쓰는 일부 방문은 빠질 수 있습니다.</p>
    </footer>
  </main>`;

  drawChart();
  bindLinks();
  app.querySelectorAll<HTMLButtonElement>('[data-range]').forEach((b) => b.addEventListener('click', () => { preset = b.dataset.range!; custom = null; store('ps_admin_range', preset); load(); }));
  app.querySelectorAll<HTMLButtonElement>('[data-metric]').forEach((b) => b.addEventListener('click', () => {
    metric = b.dataset.metric as typeof metric;
    app.querySelectorAll('[data-metric]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    drawChart();
  }));
  const onDate = () => {
    const f = $<HTMLInputElement>('#from').value, t = $<HTMLInputElement>('#to').value;
    if (f && t && f <= t) { custom = [f, t]; load(); }
  };
  $('#from').addEventListener('change', onDate); $('#to').addEventListener('change', onDate);
  $('#reload').addEventListener('click', load);
  $('#logout').addEventListener('click', async () => { await fetch('/api/admin/logout', { method: 'POST' }).catch(() => {}); login(); });
  $('#me').addEventListener('click', () => { store('ps_me', store('ps_me') === '1' ? null : '1'); render(); });
  app.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) => b.addEventListener('click', () => copy(b.dataset.copy!)));
  app.querySelectorAll<HTMLButtonElement>('[data-del]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('이 링크를 목록에서 지울까요? 이미 들어온 방문 기록은 그대로 남습니다.')) return;
    await fetch('/api/admin/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ remove: b.dataset.del }) });
    links = links.filter((l) => l.id !== b.dataset.del); render();
  }));
}

let rz = 0;
addEventListener('resize', () => { cancelAnimationFrame(rz); rz = requestAnimationFrame(drawChart); });
load();
