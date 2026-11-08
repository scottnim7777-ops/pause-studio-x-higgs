/**
 * 방문 통계 저장소 — 서버 전용
 * - 운영: Upstash Redis(Vercel 마켓플레이스, 무료 월 50만 명령). 환경 변수 KV_REST_API_URL/KV_REST_API_TOKEN
 *   (또는 UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN)이 있으면 REST로 씀. 패키지 없이 fetch만.
 * - 문의 저장소(Blob)와 나눈 이유: Blob 무료 한도가 작아 방문 기록을 같이 쓰면 문의 저장까지 멈출 수 있음(문의 누락 금지)
 * - 저장소가 없으면(로컬 개발) 메모리에 둠. 서버를 끄면 사라짐
 * 키: a:e:<뉴질랜드 날짜> = 그날의 기록(JSON 줄) 목록, 400일 뒤 저절로 지움 · a:links = 대표가 만든 추적 링크
 */
const URL_ = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || '';
const TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || '';
export const hasStore = Boolean(URL_ && TOKEN);
const KEEP_SEC = 400 * 86400;

type Cmd = (string | number)[];
async function pipeline(cmds: Cmd[]): Promise<unknown[]> {
  const res = await fetch(`${URL_}/pipeline`, {
    method: 'POST', headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(cmds), signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`통계 저장소 ${res.status}`);
  const out = await res.json() as { result?: unknown; error?: string }[];
  return out.map((r) => { if (r.error) throw new Error(r.error); return r.result; });
}

const mem = new Map<string, string[]>();
const memHash = new Map<string, Map<string, string>>();
const memCount = new Map<string, { n: number; until: number }>();

/** 뉴질랜드 기준 날짜(YYYY-MM-DD). 하루의 경계를 대표가 사는 곳에 맞춤 */
export const nzDay = (t: number) => new Date(t).toLocaleDateString('en-CA', { timeZone: 'Pacific/Auckland' });

export async function append(t: number, line: string) {
  const key = `a:e:${nzDay(t)}`;
  if (!hasStore) { (mem.get(key) ?? mem.set(key, []).get(key)!).push(line); return; }
  const [len] = await pipeline([['RPUSH', key, line]]);
  if (len === 1) await pipeline([['EXPIRE', key, KEEP_SEC]]); // 그날 첫 기록일 때만(명령 수 절약)
}

/** 여러 날의 기록을 한 번에 */
export async function readDays(days: string[]): Promise<string[][]> {
  if (!hasStore) return days.map((d) => mem.get(`a:e:${d}`) ?? []);
  const out = await pipeline(days.map((d) => ['LRANGE', `a:e:${d}`, 0, -1]));
  return out.map((r) => (Array.isArray(r) ? r.map(String) : []));
}

export async function hashAll(key: string): Promise<Record<string, string>> {
  if (!hasStore) return Object.fromEntries(memHash.get(key) ?? []);
  const [r] = await pipeline([['HGETALL', key]]);
  const arr = Array.isArray(r) ? r.map(String) : [];
  const o: Record<string, string> = {};
  for (let i = 0; i < arr.length; i += 2) o[arr[i]] = arr[i + 1];
  return o;
}
export async function hashSet(key: string, field: string, value: string) {
  if (!hasStore) { (memHash.get(key) ?? memHash.set(key, new Map()).get(key)!).set(field, value); return; }
  await pipeline([['HSET', key, field, value]]);
}
export async function hashDel(key: string, field: string) {
  if (!hasStore) { memHash.get(key)?.delete(field); return; }
  await pipeline([['HDEL', key, field]]);
}

/** 정해진 시간 동안의 횟수(로그인 시도 제한). 서버가 여러 대여도 같이 셈 */
export async function bump(key: string, ttlSec: number): Promise<number> {
  if (!hasStore) {
    const now = Date.now(), c = memCount.get(key);
    const next = c && c.until > now ? { n: c.n + 1, until: c.until } : { n: 1, until: now + ttlSec * 1000 };
    memCount.set(key, next);
    return next.n;
  }
  const [n] = await pipeline([['INCR', key]]);
  if (n === 1) await pipeline([['EXPIRE', key, ttlSec]]);
  return Number(n);
}
