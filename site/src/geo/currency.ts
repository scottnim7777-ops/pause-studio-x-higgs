/**
 * 접속 위치(공인 IP)로 표시 통화 고르기 — 서버 전용
 * 2026-10-08 사용자 최종 정책(docs/PRICING_CURRENCY_POLICY_2026-10-08.md):
 *   뉴질랜드로 판별된 방문자만 NZD, 그 밖의 모든 나라와 판별 실패는 USD. 숫자는 같고 환율로 바꾸지 않는다.
 *   위치 권한(GPS)은 묻지 않고, 방문자가 고르는 버튼도 없다. IP는 판별에만 쓰고 저장하거나 기록하지 않는다.
 * 고르는 순서
 *   1) 배포 환경이 알려 주는 국가 헤더(신뢰할 수 있는 것만): GEO_HEADER 환경 변수로 지정
 *      예) Cloudflare 앞단 → GEO_HEADER=cf-ipcountry
 *          구글 부하분산기 사용자 지정 헤더 'X-Client-Geo-Location:{client_region}' → GEO_HEADER=x-client-geo-location
 *      지정이 없으면 Vercel(x-vercel-ip-country)·App Engine(x-appengine-country)에서만 자동으로 씀.
 *      (그 밖의 곳에서는 방문자가 헤더를 직접 꾸며 보낼 수 있으므로 믿지 않는다)
 *   2) 접속 IP가 뉴질랜드 주소 목록(nz-ip.json — 인터넷 등록기관 APNIC 등의 공개 할당 자료, scripts/nz-ip.py)에 있는지
 *   3) 둘 다 아니면 USD
 * 화면: 빌드된 페이지는 USD가 기본이고, 뉴질랜드면 서버가 <html class="nzd">를 넣는다(main.css가 NZD 표기만 보여 줌).
 *   그래서 서버를 거치지 않은 복사본·캐시도 정책의 '판별 실패 = USD'와 같다.
 */
import nz from './nz-ip.json';

export type Currency = 'NZD' | 'USD';
export type Source = 'header' | 'ip' | 'none';
type Headers = Record<string, string | string[] | undefined>;

const V4 = nz.v4 as [number, number][];
const V6 = (nz.v6 as [string, number][]).map(([hex, len]) => {
  const shift = BigInt(128 - len);
  return { shift, prefix: BigInt(`0x${hex}`) >> shift };
});

/** 믿을 수 있는 국가 헤더 목록(소문자). 지정이 없으면 플랫폼이 직접 덮어쓰는 헤더만 */
export function geoHeaders(env: Record<string, string | undefined> = process.env): string[] {
  if (env.GEO_HEADER) return env.GEO_HEADER.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (env.VERCEL) return ['x-vercel-ip-country'];
  if (env.GAE_ENV) return ['x-appengine-country'];
  return [];
}

function v4ToInt(ip: string): number | null {
  const p = ip.split('.');
  if (p.length !== 4 || p.some((x) => !/^\d{1,3}$/.test(x) || Number(x) > 255)) return null;
  return p.reduce((a, x) => a * 256 + Number(x), 0);
}

function v6ToBig(ip: string): bigint | null {
  let s = ip.split('%')[0].toLowerCase();
  const tail4 = /^(.*:)(\d+\.\d+\.\d+\.\d+)$/.exec(s); // ::ffff:1.2.3.4 형태
  if (tail4) {
    const n = v4ToInt(tail4[2]);
    if (n === null) return null;
    s = `${tail4[1]}${Math.floor(n / 65536).toString(16)}:${(n % 65536).toString(16)}`;
  }
  const halves = s.split('::');
  if (halves.length > 2) return null;
  const head = halves[0] ? halves[0].split(':') : [];
  const tail = halves.length === 2 && halves[1] ? halves[1].split(':') : [];
  const fill = halves.length === 2 ? 8 - head.length - tail.length : 0;
  if (fill < 0) return null;
  const parts = [...head, ...Array<string>(fill).fill('0'), ...tail];
  if (parts.length !== 8 || parts.some((x) => !/^[0-9a-f]{1,4}$/.test(x))) return null;
  return parts.reduce((v, x) => (v << 16n) | BigInt(parseInt(x, 16)), 0n);
}

const cidr4 = (a: string, len: number): [number, number] => {
  const start = v4ToInt(a)!;
  return [start, start + 2 ** (32 - len) - 1];
};
/** 사설망·공유 주소(로컬 개발, 사내망, 통신사 내부망 등) — 나라를 알 수 없음 */
const PRIVATE_V4 = [cidr4('0.0.0.0', 8), cidr4('10.0.0.0', 8), cidr4('100.64.0.0', 10), cidr4('127.0.0.0', 8), cidr4('169.254.0.0', 16), cidr4('172.16.0.0', 12), cidr4('192.168.0.0', 16)];

/** 뉴질랜드 주소면 true, 다른 나라 주소면 false, 알 수 없으면(사설망·형식 오류) null */
export function isNZ(ip: string | undefined | null): boolean | null {
  if (!ip) return null;
  let s = ip.trim();
  if (s.toLowerCase().startsWith('::ffff:') && s.includes('.')) s = s.slice(7);
  if (s.includes('.') && !s.includes(':')) {
    const n = v4ToInt(s);
    if (n === null || PRIVATE_V4.some(([a, b]) => n >= a && n <= b)) return null;
    let lo = 0, hi = V4.length - 1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (n < V4[mid][0]) hi = mid - 1;
      else if (n > V4[mid][1]) lo = mid + 1;
      else return true;
    }
    return false;
  }
  const v = v6ToBig(s);
  if (v === null) return null;
  const top = v >> 112n;
  if (v <= 1n || (top & 0xfe00n) === 0xfc00n || (top & 0xffc0n) === 0xfe80n) return null; // ::1 · fc00::/7 · fe80::/10
  return V6.some(({ shift, prefix }) => v >> shift === prefix);
}

/** 헤더 값의 첫 부분이 두 글자 국가 코드면 돌려줌('US,Mountain View' 같은 값도 처리). 알 수 없음(XX·ZZ·T1)은 null */
function countryOf(value: string | string[] | undefined): string | null {
  const v = String(Array.isArray(value) ? value[0] : value ?? '').split(',')[0].trim().toUpperCase();
  return /^[A-Z]{2}$/.test(v) && v !== 'XX' && v !== 'ZZ' ? v : null;
}

/** 이 방문자에게 보여 줄 통화와, 무엇으로 판별했는지 */
export function detectCurrency(headers: Headers, ip: string | undefined, trusted: string[] = geoHeaders()): { currency: Currency; source: Source } {
  for (const h of trusted) {
    const c = countryOf(headers[h]);
    if (c) return { currency: c === 'NZ' ? 'NZD' : 'USD', source: 'header' };
  }
  const nzIp = isNZ(ip);
  if (nzIp === true) return { currency: 'NZD', source: 'ip' };
  if (nzIp === false) return { currency: 'USD', source: 'ip' };
  return { currency: 'USD', source: 'none' }; // 판별 실패 = USD
}

/**
 * 개발·점검용 덮어쓰기(?cur=nzd|usd). 운영에서는 CURRENCY_OVERRIDE=1일 때만 — 방문자가 통화를 고를 수 없게
 */
export function overrideFrom(query: unknown, allowed: boolean): Currency | null {
  if (!allowed) return null;
  const q = String(Array.isArray(query) ? query[0] : query ?? '').toUpperCase();
  return q === 'USD' || q === 'NZD' ? q : null;
}

/** 빌드된 페이지(기본 USD)에 통화 표시를 넣는다 — 뉴질랜드면 <html class="nzd"> */
export function withCurrency(html: string, cur: Currency): string {
  if (cur === 'USD') return html;
  const out = html.replace('<html lang="ko">', '<html lang="ko" class="nzd">');
  if (out === html) throw new Error('index.html에 <html lang="ko"> 가 없습니다 — 통화 표시를 넣을 수 없음');
  return out;
}
