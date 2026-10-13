/**
 * 스크립트가 쓰는 짧은 글: 페이지에 실려 온 #ui-text(그 페이지 언어)를 읽는다. 없으면(오래된 묶음) 한국어
 * 문구 원본: src/content/ko.ts · en.ts 의 ui · consult · fee.calc (render/page.ts uiText가 골라 담음)
 */
export type UiText = {
  lang: string; menu: string; menuClose: string; videoPause: string; videoPlay: string; workShot: string; workVideo: string; unit: string; unitOne: string;
  c: { title: string; stepType: string; interest: string; errors: { name: string; email: string; type: string; files: string }; sending: string; copied: string; sentFrom: string };
};

const FALLBACK: UiText = {
  lang: 'ko', menu: '메뉴', menuClose: '메뉴 닫기', videoPause: '영상 일시정지', videoPlay: '영상 재생',
  workShot: '{ref} {cat} 웹사이트 화면', workVideo: '{ref} {cat} 웹사이트 화면 녹화', unit: '년', unitOne: '년',
  c: {
    title: '브랜딩 무료 상담 신청', stepType: '상담 종류', interest: '관심 상품', sending: '보내는 중…', copied: '복사했습니다', sentFrom: '보낸 곳',
    errors: { name: '성함을 입력해 주세요.', email: '이메일 주소를 확인해 주세요.', type: '상담 종류를 선택해 주세요.', files: '첨부 파일은 합계 4MB까지 보낼 수 있습니다. 더 큰 파일은 이메일로 보내 주세요.' },
  },
};

let parsed: UiText | null = null;
try {
  const el = document.getElementById('ui-text');
  if (el?.textContent) parsed = JSON.parse(el.textContent) as UiText;
} catch { /* 아래 기본값 */ }
export const T: UiText = parsed ?? FALLBACK;
export const fillT = (tpl: string, v: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_m, k: string) => String(v[k] ?? ''));
