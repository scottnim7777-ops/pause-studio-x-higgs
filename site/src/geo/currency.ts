/**
 * 접속 위치(IP)로 통화 고르기 — 서버 전용
 * 2026-10-08 사용자: 숫자는 같고, 뉴질랜드 = NZD, 뉴질랜드 외 모든 나라(미국 포함) = USD.
 *   예) NZD 1,490 → 뉴질랜드 외에서는 USD 1,490
 * 고르는 순서
 *   1) 확인용 주소: ?cur=usd · ?cur=nzd
 *   2) 배포 환경이 알려 주는 국가(Cloudflare·Vercel·App Engine·CloudFront 등의 국가 헤더)
 *   3) 접속 IP가 뉴질랜드 주소 목록(nz-ip.json — 인터넷 등록기관 할당 자료, scripts/nz-ip.py)에 있는지
 * 알 수 없으면(사설망·로컬 개발 등) NZD. 표기만 바꾸며, 화면은 html의 usd 클래스로 전환한다(main.css).
 */
import nz from './nz-ip.json';

export type Currency = 'NZD' | 'USD';

const V4 = nz.v4 as [number, number][];
const V6 = (nz.v6 as [string, number][]).map(([hex, len]) => {
  const shift = BigInt(128 - len);
  return { shift, prefix: BigInt(`0x${hex}`) >> shift };
});

const GEO_HEADERS = ['cf-ipcountry', 'x-vercel-ip-country', 'x-appengine-country', 'cloudfront-viewer-country', 'x-country-code'];

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

/** 이 방문자에게 보여 줄 통화 */
export function currencyFor(query: unknown, headers: Record<string, string | string[] | undefined>, ip: string | undefined): Currency {
  const q = String(Array.isArray(query) ? query[0] : query ?? '').toUpperCase();
  if (q === 'USD' || q === 'NZD') return q;
  for (const h of GEO_HEADERS) {
    const v = String(headers[h] ?? '').trim().toUpperCase();
    if (/^[A-Z]{2}$/.test(v) && v !== 'XX' && v !== 'ZZ') return v === 'NZ' ? 'NZD' : 'USD';
  }
  return isNZ(ip) === false ? 'USD' : 'NZD';
}

/** 빌드된 페이지(기본 NZD)에 통화 표시를 넣는다 — USD면 <html class="usd"> */
export function withCurrency(html: string, cur: Currency): string {
  if (cur === 'NZD') return html;
  const out = html.replace('<html lang="ko">', '<html lang="ko" class="usd">');
  if (out === html) throw new Error('index.html에 <html lang="ko"> 가 없습니다 — 통화 표시를 넣을 수 없음');
  return out;
}
