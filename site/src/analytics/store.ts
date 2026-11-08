/**
 * 방문 통계 저장소 — 서버 전용
 * - 운영: Neon Postgres(Vercel 마켓플레이스 무료 플랜, 0.5GB). DATABASE_URL(또는 POSTGRES_URL)이 있으면 HTTP로 씀(연결을 붙들지 않음)
 *   2026-11-09: 이 계정의 마켓플레이스 Upstash·Redis에는 무료 플랜이 없어 Neon으로 함
 * - Upstash REST(KV_REST_API_URL/TOKEN 또는 UPSTASH_REDIS_REST_URL/TOKEN)가 있으면 그것도 받음
 * - 문의 저장소(Blob)와 나눈 이유: Blob 무료 한도가 작아 방문 기록을 같이 쓰면 문의 저장까지 멈출 수 있음(문의 누락 금지)
 * - 저장소가 없으면(로컬 개발) 메모리에 둠. 서버를 끄면 사라짐
 * 보관: 400일 지난 기록은 가끔(기록 100번에 한 번 꼴) 지움
 */
import { neon } from '@neondatabase/serverless';

const PG_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
const KIND: 'pg' | 'rest' | 'mem' = PG_URL ? 'pg' : URL_ && TOKEN ? 'rest' : 'mem';
export const hasStore = KIND !== 'mem';
const KEEP_DAYS = 400;

/** 뉴질랜드 기준 날짜(YYYY-MM-DD). 하루의 경계를 대표가 사는 곳에 맞춤 */
export const nzDay = (t: number) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });

/* ── Postgres(Neon) */
const sql = PG_URL ? neon(PG_URL) : null;
let ready: Promise<unknown> | null = null;
/** 표가 없으면 만듦(함수 인스턴스마다 한 번) */
function pg() {
  if (!ready) {
    ready = sql!.transaction([
      sql!`CREATE TABLE IF NOT EXISTS ps_events (id bigserial PRIMARY KEY, day date NOT NULL, t bigint NOT NULL, line text NOT NULL)`,
      sql!`CREATE INDEX IF NOT EXISTS ps_events_day ON ps_events (day)`,
      sql!`CREATE TABLE IF NOT EXISTS ps_kv (k text NOT NULL, f text NOT NULL, v text NOT NULL, PRIMARY KEY (k, f))`,
      sql!`CREATE TABLE IF NOT EXISTS ps_counter (k text PRIMARY KEY, n int NOT NULL, until bigint NOT NULL)`,
    ]).catch((err) => { ready = null; throw err; });
  }
  return ready.then(() => sql!);
}

/* ── Upstash REST */
type Cmd = (string | number)[];
async function rest(cmds: Cmd[]): Promise<unknown[]> {
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds), signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`통계 저장소 ${res.status}`);
  const out = await res.json() as { result?: unknown; error?: string }[];
  return out.map((r) => { if (r.error) throw new Error(r.error); return r.result; });
}

/* ── 메모리(로컬) */
const mem = new Map<string, string[]>();
const memHash = new Map<string, Map<string, string>>();
const memCount = new Map<string, { n: number; until: number }>();

export async function append(t: number, line: string) {
  const day = nzDay(t);
  if (KIND === 'pg') {
    const db = await pg();
    await db`INSERT INTO ps_events (day, t, line) VALUES (${day}, ${t}, ${line})`;
    if (Math.random() < 0.01) await db`DELETE FROM ps_events WHERE day < CURRENT_DATE - ${KEEP_DAYS}::int`;
    return;
  }
  const key = `a:e:${day}`;
  if (KIND === 'mem') { (mem.get(key) ?? mem.set(key, []).get(key)!).push(line); return; }
  const [len] = await rest([['RPUSH', key, line]]);
  if (len === 1) await rest([['EXPIRE', key, KEEP_DAYS * 86400]]); // 그날 첫 기록일 때만(명령 수 절약)
}

/** 여러 날의 기록을 한 번에(days와 같은 순서로) */
export async function readDays(days: string[]): Promise<string[][]> {
  if (KIND === 'pg') {
    const db = await pg();
    const rows = await db`SELECT to_char(day, 'YYYY-MM-DD') AS d, line FROM ps_events WHERE day >= ${days[0]} AND day <= ${days[days.length - 1]} ORDER BY t` as { d: string; line: string }[];
    const by = new Map(days.map((d) => [d, [] as string[]]));
    rows.forEach((r) => by.get(r.d)?.push(r.line));
    return days.map((d) => by.get(d)!);
  }
  if (KIND === 'mem') return days.map((d) => mem.get(`a:e:${d}`) ?? []);
  const out = await rest(days.map((d) => ['LRANGE', `a:e:${d}`, 0, -1]));
  return out.map((r) => (Array.isArray(r) ? r.map(String) : []));
}

export async function hashAll(key: string): Promise<Record<string, string>> {
  if (KIND === 'pg') {
    const rows = await (await pg())`SELECT f, v FROM ps_kv WHERE k = ${key}` as { f: string; v: string }[];
    return Object.fromEntries(rows.map((r) => [r.f, r.v]));
  }
  if (KIND === 'mem') return Object.fromEntries(memHash.get(key) ?? []);
  const [r] = await rest([['HGETALL', key]]);
  const arr = Array.isArray(r) ? r.map(String) : [];
  const o: Record<string, string> = {};
  for (let i = 0; i < arr.length; i += 2) o[arr[i]] = arr[i + 1];
  return o;
}
export async function hashSet(key: string, field: string, value: string) {
  if (KIND === 'pg') { await (await pg())`INSERT INTO ps_kv (k, f, v) VALUES (${key}, ${field}, ${value}) ON CONFLICT (k, f) DO UPDATE SET v = EXCLUDED.v`; return; }
  if (KIND === 'mem') { (memHash.get(key) ?? memHash.set(key, new Map()).get(key)!).set(field, value); return; }
  await rest([['HSET', key, field, value]]);
}
export async function hashDel(key: string, field: string) {
  if (KIND === 'pg') { await (await pg())`DELETE FROM ps_kv WHERE k = ${key} AND f = ${field}`; return; }
  if (KIND === 'mem') { memHash.get(key)?.delete(field); return; }
  await rest([['HDEL', key, field]]);
}

/** 정해진 시간 동안의 횟수(로그인 시도 제한). 서버가 여러 대여도 같이 셈 */
export async function bump(key: string, ttlSec: number): Promise<number> {
  const now = Date.now(), until = now + ttlSec * 1000;
  if (KIND === 'pg') {
    const [r] = await (await pg())`INSERT INTO ps_counter (k, n, until) VALUES (${key}, 1, ${until})
      ON CONFLICT (k) DO UPDATE SET n = CASE WHEN ps_counter.until > ${now} THEN ps_counter.n + 1 ELSE 1 END,
        until = CASE WHEN ps_counter.until > ${now} THEN ps_counter.until ELSE ${until} END
      RETURNING n` as { n: number }[];
    return Number(r.n);
  }
  if (KIND === 'mem') {
    const c = memCount.get(key);
    const next = c && c.until > now ? { n: c.n + 1, until: c.until } : { n: 1, until };
    memCount.set(key, next);
    return next.n;
  }
  const [n] = await rest([['INCR', key]]);
  if (n === 1) await rest([['EXPIRE', key, ttlSec]]);
  return Number(n);
}
