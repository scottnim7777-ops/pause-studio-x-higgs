/**
 * 방문 한 건을 사람이 읽는 말로: 어디서 왔는지(경로·출처), 어떤 기기·브라우저·앱인지 — 서버 전용
 * 2026-11-09 사용자: 광고 글을 올리는데 몇 명이 어디서 무슨 링크를 타고 들어왔는지 알고 싶음
 * 출처를 고르는 순서
 *   1) 추적 링크 표시(utm_source 등) — 대표가 대시보드에서 만든 링크. 가장 정확
 *   2) 광고 클릭 표시(gclid = 구글 광고, fbclid = 페이스북·인스타 링크)
 *   3) 앞 페이지 주소(referrer)
 *   4) 앱 안 브라우저(인스타·카카오톡 등은 앞 페이지 주소를 숨기는 경우가 많아 사용자 에이전트로 앱을 알아냄)
 *   5) 아무것도 없으면 '직접 방문'(주소 입력·즐겨찾기·출처를 숨기는 메신저)
 */
export type Channel = 'ad' | 'search' | 'ai' | 'social' | 'messenger' | 'email' | 'referral' | 'campaign' | 'direct';

/** 주소(호스트) → [이름, 경로] */
const HOSTS: [RegExp, string, Channel][] = [
  // 더 구체적인 주소(AI·메신저·메일)를 먼저: gemini.google.com 이 'Google 검색'으로, open.kakao.com 이 '다음 검색'으로 잡히지 않게
  [/(^|\.)(chatgpt\.com|openai\.com)$/, 'ChatGPT', 'ai'],
  [/(^|\.)perplexity\.ai$/, 'Perplexity', 'ai'],
  [/(^|\.)claude\.ai$/, 'Claude', 'ai'],
  [/^gemini\.google\.com$/, 'Gemini', 'ai'],
  [/(^|\.)copilot\.microsoft\.com$/, 'Copilot', 'ai'],
  [/(^|\.)(open\.kakao\.com|talk\.kakao\.com|pf\.kakao\.com)$/, 'KakaoTalk', 'messenger'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'WhatsApp', 'messenger'],
  [/(^|\.)(line\.me)$/, 'LINE', 'messenger'],
  [/(^|\.)(t\.me|telegram\.org)$/, 'Telegram', 'messenger'],
  [/(^|\.)(mail\.google\.com|outlook\.(live|office)\.com|mail\.naver\.com)$/, '이메일', 'email'],
  [/(^|\.)google\.[a-z.]+$/, 'Google', 'search'],
  [/^(m\.)?(blog|cafe)\.naver\.com$/, 'Naver 블로그·카페', 'social'],
  [/(^|\.)naver\.com$/, 'Naver', 'search'],
  [/(^|\.)daum\.net$|(^|\.)kakao\.com$/, 'Daum·Kakao', 'search'],
  [/(^|\.)bing\.com$/, 'Bing', 'search'],
  [/(^|\.)yahoo\.[a-z.]+$/, 'Yahoo', 'search'],
  [/(^|\.)duckduckgo\.com$/, 'DuckDuckGo', 'search'],
  [/(^|\.)(ecosia\.org|baidu\.com|yandex\.[a-z]+|search\.brave\.com)$/, '기타 검색', 'search'],
  [/(^|\.)instagram\.com$/, 'Instagram', 'social'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'Facebook', 'social'],
  [/(^|\.)threads\.(net|com)$/, 'Threads', 'social'],
  [/(^|\.)(t\.co|x\.com|twitter\.com)$/, 'X', 'social'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'LinkedIn', 'social'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'YouTube', 'social'],
  [/(^|\.)tiktok\.com$/, 'TikTok', 'social'],
  [/(^|\.)pinterest\.[a-z.]+$/, 'Pinterest', 'social'],
  [/(^|\.)reddit\.com$/, 'Reddit', 'social'],
  [/(^|\.)band\.us$/, 'BAND', 'social'],
  [/(^|\.)clutch\.co$/, 'Clutch', 'referral'],
];

/** 앱 안 브라우저 → [이름, 경로] */
const APPS: [RegExp, string, Channel][] = [
  [/Instagram/i, 'Instagram', 'social'],
  [/FBAN|FBAV|FB_IAB|FBIOS/i, 'Facebook', 'social'],
  [/Barcelona/i, 'Threads', 'social'],
  [/KAKAOTALK/i, 'KakaoTalk', 'messenger'],
  [/KAKAOSTORY/i, 'KakaoStory', 'social'],
  [/NAVER\(inapp|NAVER\//i, 'Naver', 'search'],
  [/DaumApps/i, 'Daum·Kakao', 'search'],
  [/ Line\//, 'LINE', 'messenger'],
  [/musical_ly|BytedanceWebview|TikTok/i, 'TikTok', 'social'],
  [/LinkedInApp/i, 'LinkedIn', 'social'],
  [/Pinterest/i, 'Pinterest', 'social'],
  [/Snapchat/i, 'Snapchat', 'social'],
  [/Twitter/i, 'X', 'social'],
  [/WhatsApp/i, 'WhatsApp', 'messenger'],
  [/Telegram/i, 'Telegram', 'messenger'],
];

/** utm_source에 흔히 쓰는 말 → 보기 좋은 이름 */
const SRC_ALIAS: Record<string, string> = {
  ig: 'Instagram', instagram: 'Instagram', insta: 'Instagram', fb: 'Facebook', facebook: 'Facebook', meta: 'Meta',
  google: 'Google', naver: 'Naver', daum: 'Daum·Kakao', kakao: 'KakaoTalk', kakaotalk: 'KakaoTalk', katalk: 'KakaoTalk',
  threads: 'Threads', x: 'X', twitter: 'X', youtube: 'YouTube', yt: 'YouTube', tiktok: 'TikTok', linkedin: 'LinkedIn',
  whatsapp: 'WhatsApp', wa: 'WhatsApp', band: 'BAND', email: '이메일', newsletter: '이메일', clutch: 'Clutch',
  heykorean: 'HeyKorean', koreadaily: 'Korea Daily', nzkorea: 'NZ Korea', danawa: 'Danawa',
};

const PAID = /^(cpc|ppc|paid|paidsocial|paid_social|paid-social|ads?|display|cpm|banner|sponsored)$/i;

export function parseUA(ua: string, touch: boolean) {
  const app = APPS.find(([re]) => re.test(ua));
  const os = /iPhone|iPad|iPod/.test(ua) ? 'iOS' : /Android/.test(ua) ? 'Android' : /Windows/.test(ua) ? 'Windows'
    : /CrOS/.test(ua) ? 'ChromeOS' : /Mac OS X|Macintosh/.test(ua) ? (touch ? 'iOS' : 'macOS') : /Linux/.test(ua) ? 'Linux' : '기타';
  const device = /iPad|Tablet/.test(ua) || (/Android/.test(ua) && !/Mobile/.test(ua)) || (/Macintosh/.test(ua) && touch) ? 'tablet'
    : /Mobi|iPhone|iPod|Android/.test(ua) ? 'mobile' : 'desktop';
  const browser = app ? `${app[1]} 앱` : /Edg\//.test(ua) ? 'Edge' : /SamsungBrowser/.test(ua) ? 'Samsung Internet' : /Whale/.test(ua) ? 'Whale'
    : /OPR\/|Opera/.test(ua) ? 'Opera' : /CriOS|Chrome\//.test(ua) ? 'Chrome' : /FxiOS|Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : '기타';
  return { os, device, browser, app: app ? app[1] : '', appChannel: app ? app[2] : undefined };
}

export const isBot = (ua: string) => !ua || /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|gtmetrix|preview|facebookexternalhit|embedly|python|curl|wget|axios|node-fetch|go-http|java\/|scrapy|phantom|puppeteer|playwright/i.test(ua);

export interface Source { src: string; ch: Channel; host: string; cmp: string; med: string; cnt: string; term: string; click: string }

export function classify(o: { ref: string; ownHost: string; utm: Record<string, string>; click: string; app: string; appChannel?: Channel }): Source {
  const u = o.utm;
  let host = '';
  try { host = o.ref ? new URL(o.ref).hostname.replace(/^www\./, '').toLowerCase() : ''; } catch { host = ''; }
  if (host && (host === o.ownHost || host.endsWith(`.${o.ownHost}`))) host = ''; // 우리 사이트 안에서 옮겨 다닌 것
  const known = host ? HOSTS.find(([re]) => re.test(host)) : undefined;
  const base = { host, cmp: u.campaign || '', med: u.medium || '', cnt: u.content || '', term: u.term || '', click: o.click };

  if (u.source) {
    const key = u.source.toLowerCase().trim();
    const src = SRC_ALIAS[key] ?? u.source.trim().slice(0, 60);
    const fromName = HOSTS.find(([, n]) => n === src)?.[2] ?? APPS.find(([, n]) => n === src)?.[2];
    const med = u.medium || '';
    const ch: Channel = PAID.test(med) ? 'ad' : /^(e-?mail|newsletter)$/i.test(med) ? 'email' : /^(messenger|chat|dm)$/i.test(med) ? 'messenger'
      : /^(social|sns|post|blog|cafe|community|organic_social)$/i.test(med) ? 'social' : fromName ?? 'campaign';
    return { src, ch, ...base };
  }
  if (o.click === 'google') return { src: 'Google 광고', ch: 'ad', ...base };
  if (o.click === 'microsoft') return { src: 'Bing 광고', ch: 'ad', ...base };
  if (o.click === 'tiktok') return { src: 'TikTok 광고', ch: 'ad', ...base };
  if (known) return { src: known[1], ch: known[2], ...base };
  if (o.click === 'meta') return { src: o.app === 'Instagram' ? 'Instagram' : 'Facebook', ch: 'social', ...base };
  if (host) return { src: host, ch: 'referral', ...base };
  if (o.app) return { src: o.app, ch: o.appChannel ?? 'social', ...base };
  return { src: '직접 방문', ch: 'direct', ...base };
}
