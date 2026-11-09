/**
 * 대시보드 숫자 만들기 — 서버 전용. 고른 기간의 기록을 읽어 방문(세션) 단위로 묶은 뒤 출처·지역·기기별로 센다
 * 방문(세션) = 한 사람이 창을 열고 머문 한 번. 출처는 그 방문의 첫 페이지 기준(광고 글 → 들어옴 → 상담 신청까지 한 줄로 봄)
 */
import { nzDay, readDays } from './store';

export interface Ev {
  k: 'pv' | 'leave' | 'goal'; t: number; s: string; v: string; p: string;
  nv?: 1; src?: string; ch?: string; host?: string; ref?: string; cmp?: string; med?: string; cnt?: string; term?: string;
  c?: string; ct?: string; rg?: string; tz?: string; l?: string; d?: string; b?: string; o?: string; app?: string; sw?: number;
  dur?: number; sc?: number; secs?: string[]; g?: string;
}

/** 문의로 이어진 행동(상담 신청 완료 + 연락 버튼) */
export const LEAD_GOALS = ['consult_submit', 'kakao', 'whatsapp', 'email', 'phone'];

interface Sess {
  s: string; v: string; t0: number; t1: number; first?: Ev; pages: string[]; dur: number; sc: number;
  goals: Set<string>; secs: Set<string>; nv: boolean;
}

const HOUR = new Intl.DateTimeFormat('en-GB', { timeZone: 'Pacific/Auckland', hour: '2-digit', hourCycle: 'h23' });
const WDAY = new Intl.DateTimeFormat('en-US', { timeZone: 'Pacific/Auckland', weekday: 'short' });
const WD = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function sessions(lines: string[]): Sess[] {
  const map = new Map<string, Sess>();
  for (const line of lines) {
    let e: Ev;
    try { e = JSON.parse(line) as Ev; } catch { continue; }
    if (!e.s || !e.t) continue;
    let x = map.get(e.s);
    if (!x) { x = { s: e.s, v: e.v, t0: e.t, t1: e.t, pages: [], dur: 0, sc: 0, goals: new Set(), secs: new Set(), nv: false }; map.set(e.s, x); }
    x.t0 = Math.min(x.t0, e.t); x.t1 = Math.max(x.t1, e.t);
    if (e.k === 'pv') {
      x.pages.push(e.p);
      if (!x.first || e.t < x.first.t) x.first = e;
      if (e.nv) x.nv = true;
    } else if (e.k === 'leave') {
      x.dur += Math.min(Math.max(Number(e.dur) || 0, 0), 1800); // 한 번에 30분 넘는 값은 창을 켜 둔 것으로 봄
      x.sc = Math.max(x.sc, Number(e.sc) || 0);
      e.secs?.forEach((id) => x!.secs.add(id));
    } else if (e.k === 'goal' && e.g) x.goals.add(e.g);
  }
  return [...map.values()].filter((x) => x.first); // 첫 페이지 기록이 없는 조각(자정에 걸친 방문의 뒷부분 등)은 앞날에서 셈
}

type Row = { key: string; sessions: number; visitors: number; leads: number; leadPeople: number; submits: number; dur: number; sub?: string };
function group(list: Sess[], keyOf: (x: Sess) => string | undefined, subOf?: (x: Sess) => string): Row[] {
  const m = new Map<string, { sessions: number; v: Set<string>; lv: Set<string>; leads: number; submits: number; dur: number; sub?: string }>();
  for (const x of list) {
    const key = keyOf(x) || '';
    if (!key) continue;
    const r = m.get(key) ?? m.set(key, { sessions: 0, v: new Set(), lv: new Set(), leads: 0, submits: 0, dur: 0, sub: subOf?.(x) }).get(key)!;
    r.sessions++; r.v.add(x.v); r.dur += x.dur;
    if (LEAD_GOALS.some((g) => x.goals.has(g))) { r.leads++; r.lv.add(x.v); }
    if (x.goals.has('consult_submit')) r.submits++;
  }
  // 대표가 보는 단위는 '사람'(같은 사람이 여러 번 와도 한 명)
  return [...m].map(([key, r]) => ({ key, sessions: r.sessions, visitors: r.v.size, leads: r.leads, leadPeople: r.lv.size, submits: r.submits, dur: Math.round(r.dur / r.sessions), sub: r.sub }))
    .sort((a, b) => b.visitors - a.visitors || b.sessions - a.sessions || a.key.localeCompare(b.key));
}
const count = (items: string[]) => {
  const m = new Map<string, number>();
  items.forEach((k) => { if (k) m.set(k, (m.get(k) ?? 0) + 1); });
  return [...m].map(([key, n]) => ({ key, n })).sort((a, b) => b.n - a.n);
};

function kpi(list: Sess[]) {
  const n = list.length;
  const pv = list.reduce((a, x) => a + x.pages.length, 0);
  const leads = list.filter((x) => LEAD_GOALS.some((g) => x.goals.has(g))).length;
  return {
    visitors: new Set(list.map((x) => x.v)).size,
    sessions: n,
    pageviews: pv,
    avgDur: n ? Math.round(list.reduce((a, x) => a + x.dur, 0) / n) : 0,
    bounce: n ? list.filter((x) => x.pages.length === 1 && x.dur < 10).length / n : 0,
    leads,
    leadPeople: new Set(list.filter((x) => LEAD_GOALS.some((g) => x.goals.has(g))).map((x) => x.v)).size,
    submits: list.filter((x) => x.goals.has('consult_submit')).length,
    leadRate: n ? leads / n : 0,
    newShare: n ? list.filter((x) => x.nv).length / n : 0,
  };
}

/** from·to는 뉴질랜드 날짜(포함). 같은 길이의 바로 앞 기간과 비교 */
export async function report(from: string, to: string, now = Date.now()) {
  const days: string[] = [];
  // 날짜 글자만 하루씩 넘김(시간대와 상관없이 달력 계산)
  for (let d = Date.parse(`${from}T00:00:00Z`); new Date(d).toISOString().slice(0, 10) <= to && days.length < 400; d += 86400000) days.push(new Date(d).toISOString().slice(0, 10));
  const prev = days.map((_, i) => new Date(Date.parse(`${days[0]}T00:00:00Z`) - (days.length - i) * 86400000).toISOString().slice(0, 10));
  const raw = await readDays([...prev, ...days]);
  const cur = sessions(raw.slice(prev.length).flat());
  const old = sessions(raw.slice(0, prev.length).flat());
  const f = (x: Sess) => x.first!;

  // 시간 흐름: 하루면 시간별, 그 밖에는 날짜별
  const hourly = days.length === 1;
  const buckets = hourly ? Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0')) : days;
  const series = buckets.map((b) => {
    const inB = cur.filter((x) => (hourly ? HOUR.format(x.t0) : nzDay(x.t0)) === b);
    return { key: b, visitors: new Set(inB.map((x) => x.v)).size, sessions: inB.length, pageviews: inB.reduce((a, x) => a + x.pages.length, 0), leads: inB.filter((x) => LEAD_GOALS.some((g) => x.goals.has(g))).length };
  });

  // 요일 × 시간(뉴질랜드) — 언제 글을 올리면 좋은지
  const heat = WD.map(() => Array<number>(24).fill(0));
  for (const x of cur) heat[WD.indexOf(WDAY.format(x.t0))][Number(HOUR.format(x.t0))]++;

  // 첫 화면에서 섹션별로 본 비율(어디까지 읽고 나갔는지)
  const home = cur.filter((x) => x.secs.size || x.sc);
  const secCount = count(home.flatMap((x) => [...x.secs]));
  const scroll = [25, 50, 75, 100].map((p) => ({ key: `${p}%`, n: home.filter((x) => x.sc >= p).length }));

  const live = cur.filter((x) => now - x.t1 < 5 * 60 * 1000);
  const recent = [...cur].sort((a, b) => b.t0 - a.t0).slice(0, 60).map((x) => ({
    t: x.t0, src: f(x).src, ch: f(x).ch, cmp: f(x).cmp, ref: f(x).ref, land: f(x).p, pages: x.pages.length, dur: x.dur,
    c: f(x).c, ct: f(x).ct, rg: f(x).rg, d: f(x).d, b: f(x).b, o: f(x).o, l: f(x).l, nv: x.nv, goals: [...x.goals],
  }));

  return {
    range: { from, to, days: days.length, hourly, prevFrom: prev[0], prevTo: prev[prev.length - 1] },
    kpi: kpi(cur), prev: kpi(old), series,
    channels: group(cur, (x) => f(x).ch),
    sources: group(cur, (x) => f(x).src, (x) => f(x).ch ?? ''),
    // 캠페인 · 출처 · 글 구분을 탭으로 이어 둠(화면이 나눠 보여 주고, 저장한 추적 링크와 맞춰 봄)
    campaigns: group(cur.filter((x) => f(x).cmp), (x) => [f(x).cmp, f(x).src, f(x).cnt || ''].join('\t')),
    referrers: group(cur.filter((x) => f(x).ref), (x) => f(x).ref),
    landing: group(cur, (x) => f(x).p),
    pages: count(cur.flatMap((x) => x.pages)),
    countries: group(cur, (x) => f(x).c || '??'),
    cities: group(cur.filter((x) => f(x).ct), (x) => [f(x).ct, f(x).rg, f(x).c].filter(Boolean).join(', ')),
    timezones: group(cur.filter((x) => f(x).tz), (x) => f(x).tz),
    languages: group(cur, (x) => (f(x).l || '').split('-')[0].toLowerCase()),
    devices: group(cur, (x) => f(x).d),
    browsers: group(cur, (x) => f(x).b),
    os: group(cur, (x) => f(x).o),
    apps: group(cur.filter((x) => f(x).app), (x) => f(x).app),
    goals: count(cur.flatMap((x) => [...x.goals])),
    newVsReturning: { newer: cur.filter((x) => x.nv).length, returning: cur.filter((x) => !x.nv).length },
    sections: { total: home.length, list: secCount }, scroll,
    heat, live: { sessions: live.length, pages: count(live.map((x) => x.pages[x.pages.length - 1])) },
    recent,
  };
}
