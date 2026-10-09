/**
 * PAUSE STUDIO 사이트 문구(한국어) — 한 곳에서 관리
 * 기준: 기존 사이트 원문(content/site-content.ko.json) + 사업 정책(docs/BUSINESS_POLICY_2026-10.md)
 *       + 웹사이트 플랜(이름·기능·설명) = 사용자 견적서(docs/QUOTATION_2026-10-07.md) STARTER · BUSINESS · ENTERPRISE 그대로
 *       + 가격·통화·GST = 사용자 최종 정책(docs/PRICING_CURRENCY_POLICY_2026-10-08.md): STARTER 1,990 · BUSINESS 4,490부터 · ENTERPRISE 맞춤 견적,
 *         뉴질랜드 IP만 NZD $ · 그 외 USD $(같은 숫자), GST 미등록(별도 청구·포함 표시 없음), 결합 상품 없음
 *       + AI 광고영상 상품·포함 조건·운영 = 사용자 정책(docs/AI_VIDEO_POLICY_2026-10.md)
 * 표기 규칙(2026-10-08 사용자): 화면 글에 줄표·하이픈·별표·참고표(※)를 쓰지 않는다. 문장 안의 '\n'은 의도한 줄바꿈(page.ts가 <br>로).
 * 원문과 달라진 곳은 docs/CONTENT_MAP.md 에 이유와 함께 기록한다.
 */

export const contact = {
  kakaoUrl: 'https://open.kakao.com/o/s58WfSEi',
  kakaoId: 'cosmic0809',
  phoneLabel: '+64 20 488 7198',
  telHref: 'tel:+64204887198',
  smsHref: 'sms:+64204887198',
  email: 'info@pause8studio.com',
  address: 'New Zealand, 75 Victoria Street West, Auckland CBD 1010',
  nzbn: 'NZBN: 9429053533340',
};

export const meta = {
  lang: 'ko',
  title: 'PAUSE Studio | 퍼즈 스튜디오 · 한인 비즈니스를 위한 브랜딩 스튜디오',
  description:
    '선택받는 브랜드는 보여지는 방식이 다릅니다. 웹사이트 제작부터 AI 광고영상까지, 뉴질랜드·미국 한인 비즈니스를 위한 브랜드 맞춤 제작. 제작비는 한 번, PAUSE Studio 기본 월 관리비 $0.',
  keywords: 'pausestudio, pause8studio, pause studio, 퍼즈스튜디오, 퍼즈 스튜디오, 웹사이트 제작, AI 광고영상, AI 영상 제작, 오클랜드 웹사이트 제작, 뉴질랜드 웹 제작, 한인 비즈니스',
  canonical: 'https://pause8studio.com/',
  ogTitle: 'PAUSE Studio | 한인 비즈니스를 위한 브랜딩 스튜디오',
  ogDescription: '브랜드는 더 돋보이게. 매달 관리비는 없게. 웹사이트 제작부터 AI 광고영상까지, 브랜드가 고객에게 보여지는 모든 순간을 만듭니다.',
  ogImage: 'https://pause8studio.com/og.jpg',
  googleSiteVerification: 'YRTNSno7nYptgfm08ZthTl09DUbhS9NT6hKgg9iOQ4U',
};

/** 메뉴: 서비스 두 장(웹사이트 · AI 광고영상)으로 묶어 이동(2026-10-08 사용자: 배치가 뒤죽박죽) */
export const nav = [
  { href: '#work', label: '포트폴리오' },
  { href: '#website', label: '웹사이트 제작' },
  { href: '#video', label: 'AI 광고영상' },
  { href: '#faq', label: '자주 묻는 질문' },
];

export const cta = {
  header: '문의하기',
  consult: '브랜딩 무료 상담 신청',
  kakao: '카카오톡 1:1 실시간 상담',
  /** 플랜·상품 버튼: 어떤 구성이 맞는지는 상담에서 정함(2026-10-08 사용자) */
  free: '무료 상담받기',
};

export const hero = {
  eyebrow: '한인 비즈니스를 위한 브랜딩 스튜디오',
  titleLines: ['선택받는 브랜드는', '보여지는 방식이 다릅니다.'],
  titleLinesMobile: ['선택받는 브랜드는', '보여지는 방식이', '다릅니다.'],
  sub: ['웹사이트 제작부터 AI 영상 제작까지,', '브랜드가 고객에게 보여지는 모든 순간을 만듭니다.'],
  services: [
    { index: '01', name: '웹사이트 제작', lead: '제작비는 한 번, 기본 월 관리비는 $0', desc: '유지보수·웹 호스팅까지 무료', href: '#website' },
    { index: '02', name: 'AI 광고영상', lead: '촬영 없이, 가지고 계신 사진만으로', desc: '가로·세로 광고영상을 함께 드립니다', href: '#video' },
  ],
};

/**
 * 포트폴리오: 실제 고객 작업물만. 번호는 보이는 순서대로(Ref. 01~). id = 미디어 파일 이름(바뀌지 않음)
 * 2026-10-08 사용자: 동대문(id ref03)은 사진 대신 받은 화면 녹화로, 컨템퍼러리 타투 스튜디오(unframe)를 중간 순서에 추가,
 * 영상은 마우스를 올리지 않아도 계속 반복 재생, 화면이 잘려 보이지 않게
 * 2026-10-09 사용자: 레퍼런스 8번(미용실)과 9번(타투 스튜디오) 자리 바꿈 → 번호는 보이는 순서대로 다시 매김
 */
export type WorkItem = { id: string; category: string; video?: boolean };
export const work = {
  eyebrow: 'PORTFOLIO',
  title: ['실제로 만든', '웹사이트입니다.'],
  lead: '모든 화면은 고객 사이트의 실제 화면입니다. 눌러서 크게 보세요.',
  view: '보기',
  items: [
    { id: 'ref01', category: '여행 / 유학원', video: true },
    { id: 'ref02', category: '홈메이드 케이크', video: true },
    { id: 'ref03', category: '한식당', video: true },
    { id: 'ref04', category: '오클랜드 현지 여행사', video: true },
    { id: 'ref05', category: '패스트푸드 프랜차이즈' },
    { id: 'ref06', category: '패스트푸드 프랜차이즈' },
    { id: 'ref07', category: '호스피스', video: true },
    { id: 'unframe', category: '컨템퍼러리 타투 스튜디오', video: true },
    { id: 'ref08', category: '미용실 / 헤어 살롱' },
    { id: 'ref09', category: '건강식품' },
    { id: 'ref10', category: '택시 호출 및 배차 플랫폼 개발' },
    { id: 'ref11', category: '여행사' },
    { id: 'ref12', category: '여행사' },
    { id: 'ref13', category: '토스 핀테크 파트너 앱 개발' },
    { id: 'ref14', category: '토스 핀테크 파트너 앱 개발' },
    { id: 'ref15', category: '토스 핀테크 파트너 앱 개발' },
    { id: 'chillenq', category: '냉장·냉동 설비', video: true }, // 2026-10-09 사용자가 보낸 화면 녹화(끊김 없이 반복)
  ] as WorkItem[],
  /** 마지막 줄을 채우는 상담 칸 */
  next: { kicker: 'NEXT REFERENCE', title: '다음 레퍼런스는\n대표님의 브랜드입니다.' },
};

export const why = {
  eyebrow: 'PHILOSOPHY & VALUE',
  title: 'WHY PAUSE?',
  letter: [
    '큰 회사에 맡기면, 당신 사이트는 수많은 프로젝트 중 하나가 됩니다. 저는 대표가 직접, 처음부터 끝까지 만듭니다. 담당자가 바뀌거나 하청으로 넘어가지 않습니다.',
    '그리고 제작비는 한 번이면 됩니다. PAUSE Studio에 매달 내는 기본 관리비는 없습니다.',
    "'한 번 받았으니 이제 남'이라는 뜻이 아닙니다. 오히려 그 반대입니다. 계약된 기능에 오류가 나거나 서버에 문제가 생기면 추가 비용 없이 제가 직접 챙깁니다. 제작비는 한 번만 받되, 대표님 사이트는 제 일처럼 꼼꼼히 봐드립니다.",
  ],
  signatureLabel: 'PAUSE STUDIO 대표',
  /** 사업 정책 §2 '고객이 PAUSE를 선택해야 할 이유' */
  pillars: [
    { title: '브랜드 맞춤 디자인', desc: '템플릿을 조립하지 않습니다. 브랜드의 분위기와 특성을 담아 화면을 처음부터 설계합니다.' },
    { title: '기본 월 관리비 $0', desc: '제작 후 PAUSE Studio에 매달 내는 관리비가 없습니다. 유지보수와 웹 호스팅도 모든 플랜에 무료로 포함됩니다.' },
    { title: '대표 직접 제작', desc: '상담부터 디자인, 개발, 최종 검수까지 대표가 직접 참여합니다. 담당자가 바뀌거나 하청으로 넘어가지 않습니다.' },
    { title: '직접 관리하는 웹사이트', desc: '블로그나 인스타그램처럼 쉽습니다. 지정된 텍스트, 이미지, 상품과 가격을 직접 수정하세요.' },
    { title: '명확한 소유권', desc: '도메인은 가능한 대표님 명의로 등록하고, 콘텐츠·데이터와 계약된 제작 결과물의 권리를 명확히 드립니다.' },
    { title: '웹사이트와 광고영상을 한 곳에서', desc: '웹사이트와 AI 광고영상을 같은 브랜드 방향으로 만듭니다. 업체를 따로 찾지 않으셔도 됩니다.' },
  ],
};

export const who = {
  eyebrow: 'FOR YOU',
  title: ['이런 대표님께', '강력히 추천합니다'],
  lead: '매달 지출되는 고정비 부담을 줄이고, 내 비즈니스만의 브랜드 가치를 제대로 보여 주고 싶으신 분들을 위한 제작 방식입니다.',
  items: [
    '웹사이트의 첫인상이 브랜드의 신뢰도를 결정한다고 생각하시는 분',
    '매년 청구되는 관리비, 유지비, 호스팅비에 지치신 분',
    '템플릿이 아닌, 우리 브랜드만의 디자인을 원하시는 분',
    '한국어와 영어 모두 자연스러운 디자인이 필요하신 분',
    '길게 함께 갈 비즈니스 파트너를 찾고 계신 분',
    '가지고 있는 사진으로 광고영상을 만들고 싶으신 분',
  ],
};

/** 서비스 두 장의 첫 화면(큰 제목) */
export const chapters = {
  // em = 소개 안에서 굵게 + 보이면 밝아지는 핵심 약속(2026-10-09 사용자: '관리비/유지보수 비용 제로' 강조, 영상 장도 같은 방식으로 한 구절)
  website: { index: 'CHAPTER 01', word: 'WEBSITE', ko: '웹사이트 제작', lead: '어디서도 찾아 볼 수 없는 관리비/유지보수\u00A0비용 제로 솔루션.\n보여지는 첫 화면부터 문의로 이어지는 마지막 버튼까지,\n브랜드에 맞춰 처음부터 설계합니다.', em: '관리비/유지보수\u00A0비용 제로' },
  video: { index: 'CHAPTER 02', word: 'AI VIDEO AD', ko: 'AI 광고영상 제작', lead: '촬영 없이, 가지고 계신 사진만으로.\n기획부터 편집과 사운드까지 완성된 광고영상을 드립니다.', em: '가지고 계신 사진만으로' },
};

/**
 * 통화(2026-10-08 사용자 최종): 숫자는 같고 접속 위치(공인 IP)로 표기만 — 뉴질랜드로 판별될 때만 NZD $, 그 밖의 모든 나라와 판별 실패는 USD $.
 * 환율로 바꾸지 않는다. 실제 계약 통화는 사업장 소재 국가 기준(견적서에서 확정).
 * GST: PAUSE Studio는 GST 미등록 사업자 → GST를 더하거나 포함했다고 쓰지 않는다(화면에 GST 문구 없음).
 * Txt = 통화와 관계없는 글 또는 { NZD, USD } 두 가지 글(빈 글이면 그 통화에서는 보이지 않음)
 */
export type Cur = 'NZD' | 'USD';
export type Txt = string | Record<Cur, string>;
export const byCur = (f: (c: Cur) => string): Record<Cur, string> => ({ NZD: f('NZD'), USD: f('USD') });
export const currencyChip: Txt = { NZD: 'NZD 기준', USD: 'USD 기준' };
/** 가격 앞 통화 표시(2026-10-09 사용자: 'US$1,990 말고 USD $1,990 · NZD $1,990'). 코드와 $ 사이는 줄이 바뀌지 않는 공백 */
export const currencySymbol: Record<Cur, string> = { NZD: 'NZD\u00A0$', USD: 'USD\u00A0$' };

/** 비교(BEFORE / AFTER): 같은 내용을 흔한 템플릿으로 만들었다면 vs. PAUSE가 만든 실제 사이트 */
export type CompareCase = {
  label: string; media: string;
  mock: { brand: string; nav: string[]; title: string; sub: string; btn: string; image: string; accent: string; cards: [string, string, string][] };
};
export const compare = {
  eyebrow: 'BEFORE / AFTER',
  // 2026-10-09 사용자: 'Ordinary vs. Artisanal'을 더 이해하기 쉬운 말로, 'VS'는 점 없이
  title: ['흔한 템플릿', '맞춤 디자인'],
  lead: '같은 내용도 어떻게 보여 주느냐에 따라 브랜드의 가치가 달라집니다.\n가운데 손잡이를 좌우로 밀어 비교해 보세요.',
  before: 'BEFORE',
  beforeSub: '흔한 템플릿으로 만들었다면',
  after: 'AFTER',
  afterSub: 'PAUSE가 만든 실제 사이트',
  handle: '비교 위치',
  cases: [
    {
      label: '여행 / 유학원', media: '/media/work/ref01',
      mock: { brand: 'Kiwi Journeys', nav: ['Home', 'Tours', 'Study', 'About', 'Contact'], title: 'Discover New Zealand', sub: 'Tours and study programs for every traveler', btn: 'Book a Tour', image: '/media/compare/mock-travel', accent: '#1f7a8c', cards: [['Popular Tours', 'Our most loved day trips', '/media/compare/mock-travel-c1'], ['Study Abroad', 'Programs for every age', '/media/compare/mock-travel-c2'], ['Travel Tips', 'Plan your next adventure', '/media/compare/mock-travel-c3']] },
    },
    {
      label: '홈메이드 케이크', media: '/media/work/ref02',
      mock: { brand: 'Sweet Moments Cakes', nav: ['Home', 'Menu', 'Gallery', 'Order', 'Contact'], title: 'Handmade Cakes for Every Occasion', sub: 'Freshly baked with love, made to order', btn: 'Order Now', image: '/media/compare/mock-cake', accent: '#a8506f', cards: [['Birthday Cakes', 'Custom cakes for any party', '/media/compare/mock-cake-c1'], ['Wedding Cakes', 'Elegant tiers for your day', '/media/compare/mock-cake-c2'], ['Cupcakes', 'Sweet treats by the dozen', '/media/compare/mock-cake-c3']] },
    },
  ] as CompareCase[],
};

/**
 * 웹사이트 플랜 = 사용자 견적서(2026.10.07)의 이름·기능·설명 그대로(2026-10-08 사용자: 'WEBSITE·ONLINE STORE·ENTERPRISE가 아니라 STARTER·BUSINESS·ENTERPRISE 그대로').
 * 가격만 최종 정책: STARTER 1,990 · BUSINESS 4,490부터 · ENTERPRISE 맞춤 견적(예전 1,490 · 2,900 · 5,500+는 폐지).
 * only = 이 플랜만의 기능(위·강조) · base = 다른 플랜과 같은 기본 기능(아래, 체크 표시로 분명히)
 * 2026-10-08 사용자: '기본 포함'이 너무 안 보여 포함 안 된 것처럼 읽힘 → 체크 목록으로 또렷하게
 */
export const plans = {
  starter: {
    name: 'STARTER', ko: '기본형', price: '1,990',
    target: '브랜드와 서비스를 효과적으로 소개하고, 고객 문의로 이어질 수 있도록 설계된 맞춤형 웹사이트가 필요한 경우',
    features: ['최대 5페이지 구성', '반응형 디자인 (모바일 최적화)', '브랜드 맞춤 디자인', '회사소개 / 서비스 소개 / 오시는 길 등 기본 페이지 구성', '문의 폼 / 이메일 연동', '기본 SEO 설정', 'SSL 보안 인증서 적용'],
  },
  business: {
    name: 'BUSINESS', ko: '비즈니스형', price: '4,490', suffix: '부터',
    target: '제품·재고 관리부터 예약, 주문, 온라인 결제까지 통합하여 고객 응대와 판매 과정을 효율적으로 운영할 수 있는 비즈니스 웹사이트가 필요한 경우',
    only: ['최대 10페이지 구성', '제품·재고 관리 시스템', '예약 / 주문 / 온라인 결제 기능', '고객 관리 시스템 (주문 내역, 회원 관리)'],
    base: ['반응형 디자인 (모바일 최적화)', '브랜드 맞춤 디자인', '문의 폼 / 이메일 연동', '기본 SEO 설정', 'SSL 보안 인증서 적용'],
  },
  enterprise: {
    name: 'ENTERPRISE', ko: '기업형', price: '맞춤 견적',
    target: 'AI 기반 업무 자동화(AX)와 외부 시스템 연동 등 복잡한 비즈니스 운영에 필요한 다양한 기능을 맞춤형으로 구축하는 기업용 웹사이트가 필요한 경우',
    only: ['맞춤 페이지 구성 (무제한 가능)', 'AI 기반 업무 자동화 (AX)', '회원 관리 및 고객 데이터 관리', '외부 시스템 연동 (ERP, POS, CRM 등)', '맞춤형 기능 개발'],
    base: ['반응형 디자인 (모바일 최적화)', '브랜드 맞춤 디자인', '문의 폼 / 이메일 연동', '고급 SEO 설정', 'SSL 보안 인증서 적용'],
  },
};
const P = plans;

/** 서비스·요금 버튼 → 상담 창에서 미리 고를 종류와 상품(consult.types · consult.fields 값과 같아야 함) */
export const consultPreset: Record<string, { type: string; field?: string; value?: string }> = {
  starter: { type: '웹사이트 제작', field: 'product', value: 'STARTER · 기본형' },
  business: { type: '웹사이트 제작', field: 'product', value: 'BUSINESS · 비즈니스형' },
  enterprise: { type: 'AI 업무 자동화 · 맞춤 개발' },
  short: { type: 'AI 광고영상', field: 'videoProduct', value: 'AI SHORT AD · 15초' },
  brand: { type: 'AI 광고영상', field: 'videoProduct', value: 'AI BRAND AD · 30초' },
  hero: { type: 'AI 광고영상', field: 'videoProduct', value: 'AI HERO FILM · 60초' },
  monthly: { type: 'AI 광고영상', field: 'videoProduct', value: 'MONTHLY CREATIVE · 월 4편' },
  video: { type: 'AI 광고영상' },
};

export type Plan = { key: string; name: string; type: string; price: string; suffix?: string; target: string; featured?: boolean; addsTitle: string; adds: string[]; base?: string[] };
export const pricing = {
  eyebrow: 'PRICING',
  title: '웹사이트 제작 비용',
  /** 사업 정책 §13·§20 확정 후킹 */
  banner: ['브랜드는 더 돋보이게.', '매달 관리비는 없게.'],
  /** 견적서 머리말 */
  bannerLead: '브랜드의 방향과 비즈니스 목표에 맞는 웹사이트를 제작합니다.\n기획부터 디자인, 개발까지 모든 과정을 한 번에 진행합니다.',
  targetLabel: '추천 대상',
  baseLabel: '기본 포함',
  plans: [
    { key: 'starter', name: P.starter.name, type: P.starter.ko, price: P.starter.price, target: P.starter.target, addsTitle: '포함 기능', adds: P.starter.features },
    { key: 'business', name: P.business.name, type: P.business.ko, price: P.business.price, suffix: P.business.suffix, target: P.business.target, featured: true, addsTitle: 'BUSINESS만의 기능', adds: P.business.only, base: P.business.base },
    { key: 'enterprise', name: P.enterprise.name, type: P.enterprise.ko, price: P.enterprise.price, target: P.enterprise.target, addsTitle: 'ENTERPRISE만의 기능', adds: P.enterprise.only, base: P.enterprise.base },
  ] as Plan[],
  featuredBadge: '예약·주문·결제가 필요하다면',
  freeTitle: ['모든 플랜에 포함되는', '무료 혜택'],
  free: [
    { title: '유지보수 무료', note: '계약된 기능이 계속 잘 동작하도록' },
    { title: '관리비 무료', note: '매달 내는 관리비 없이' },
    { title: '웹 호스팅 무료', note: '트래픽이 크게 늘어날 때만 미리 협의' },
  ],
  notesTitle: '추가 안내사항',
  /** 견적서 추가 안내 그대로 + 외부 서비스 비용. 1번만 최종 정책(표시 통화와 실제 계약 통화 = 사업장 소재 국가, GST 문구 없음) */
  notes: [
    { NZD: '위 금액은 뉴질랜드 달러(NZD) 기준입니다. 실제 계약 통화는 사업장 소재 국가를 기준으로 하며, 견적서에서 적용 통화와 총액을 먼저 확인해 드립니다.', USD: '위 금액은 미국 달러(USD) 기준입니다. 실제 계약 통화는 사업장 소재 국가를 기준으로 하며, 견적서에서 적용 통화와 총액을 먼저 확인해 드립니다.' },
    '페이지 추가, 특정 기능 개발, 외부 시스템 연동 등은 별도 견적이 적용될 수 있습니다.',
    '제작 기간은 프로젝트 규모에 따라 다르며, 보통 2~6주 안에 진행됩니다.',
    '호스팅은 기본적으로 무료로 제공되며, 트래픽과 서버 사용량이 무상 제공 범위를 크게 넘는 경우에만 호스팅 환경과 추가 비용을 협의합니다.',
    '자세한 상담을 통해 비즈니스에 맞는 최적의 구성을 제안드립니다.',
    '도메인 등 외부 서비스 비용은 별도입니다.',
  ] as Txt[],
};

export const fee = {
  eyebrow: 'MONTHLY FEE',
  title: ['PAUSE Studio', '기본 월 관리비 $0'],
  lead: '웹사이트를 만든 뒤 PAUSE Studio에 매달 내는 관리비가 없습니다.\n무엇이 무료이고 언제 비용이 생기는지, 숨김없이 알려드립니다.',
  freeTitle: '모두 무료',
  free: ['웹사이트 유지보수', '웹사이트 관리비', '웹 호스팅', '서버 문제 확인', '관리자 기능 사용 안내'],
  /** 2026-10-08 사용자: 10가지가 너무 많아 보임 → 같은 내용을 4가지로 묶음 */
  extraTitle: '필요할 때만 별도',
  extra: [
    { title: '도메인', desc: '등록·갱신 비용' },
    { title: '외부 서비스 이용료', desc: '카드 결제 수수료, 유료 플랫폼·API, 추가 서버' },
    { title: '새로 만드는 작업', desc: '새 페이지·새 기능, 큰 폭의 디자인 변경이나 전체 재설계' },
    { title: '콘텐츠 등록 대행', desc: '글과 사진 등록을 계속 맡기실 때' },
  ],
  notes: [
    '기존 기능을 고치는 보수와 새 기능을 만드는 개발은 다른 작업입니다.\n추가 비용이 필요한 경우에는 반드시 미리 협의합니다.',
    '웹 호스팅은 일반적인 웹사이트 운영 범위에서 무료입니다.\n무제한 트래픽·저장공간, 24시간 긴급 대응은 기본에 포함되지 않습니다.',
  ],
  calc: {
    title: '총비용 직접 계산해 보기',
    lead: '다른 업체에서 받은 견적을 넣어 보세요.\n기간을 늘릴수록 차이가 커집니다.',
    otherLabel: '타사 견적',
    /** 입력칸임을 알 수 있게(2026-10-09 사용자: 직접 입력하는 칸인지 잘 모르겠음) */
    inputHint: '직접 입력',
    placeholder: '금액 입력',
    pauseLabel: 'PAUSE Studio',
    setupLabel: '초기 제작비',
    /** 2026-10-09 사용자: '월 관리비(유지보수 포함)'으로, 타사 칸 기본값 초기 제작비 500 · 월 관리비 150(바로 고쳐 넣을 수 있음) */
    monthlyLabel: '월 관리비(유지보수 포함)',
    defaults: { setup: 500, monthly: 150, years: 5 },
    yearsLabel: '기간',
    totalLabel: '총비용',
    saveLabel: 'PAUSE Studio로 아끼는 금액',
    unit: '년',
    /** PAUSE 쪽 초기 제작비: 플랜을 고를 수 있게, 기본 선택 = STARTER(2026-10-08 사용자) */
    planLabel: '플랜 선택',
    plans: [
      { key: 'starter', label: 'STARTER', price: 1990 },
      { key: 'business', label: 'BUSINESS', price: 4490, suffix: '부터' },
    ] as { key: string; label: string; price: number; suffix?: string }[],
    vs: 'VS',
    note: 'PAUSE Studio 쪽은 고르신 플랜의 가격 기준이며, BUSINESS는 시작 가격입니다. 도메인 등 외부 서비스 비용은 양쪽 모두 별도라 계산에서 뺐습니다.',
  },
  /** 사진 대신 글자로 보여주는 1년치 관리비 내역(사용자: 영수증 사진 사용 안 함) */
  ledger: {
    head: ['PAUSE STUDIO', 'BASIC MONTHLY FEE'],
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    totalLabel: '1년 합계',
    aria: 'PAUSE Studio 기본 월 관리비: 1월부터 12월까지 매달 $0, 1년 합계 $0',
    /** 큰 $0의 '허리띠' 움직임(사용자): 예시 월 관리비 $100에서 세어 내려가며 숫자가 홀쭉해지고 $0에서 멈춤(달마다 $0이 하나씩 채워짐). 예시임을 글로 밝힘 */
    from: 100,
    capFrom: '타사 관리비',
    capTo: 'PAUSE Studio라면',
  },
};

export const process = {
  eyebrow: 'PROCESS',
  title: ['비전에서', '현실로'],
  subtitle: '웹사이트 제작 과정',
  steps: [
    { id: '01', title: '1:1 기획 및 상담', highlight: '핵심 가치 분석', desc: '사장님의 비즈니스 상황을 깊이 이해하고, 가장 필요한 해결책을 함께 고민하는 대화로 시작합니다.' },
    { id: '02', title: '투명한 안심 결제', highlight: '선금 결제', desc: '작업 범위로 견적을 확정한 뒤, 제작비를 선금으로 결제하시면 바로 제작을 시작합니다.' },
    { id: '03', title: '맞춤형 디자인 및 개발', highlight: '정교한 맞춤 개발', desc: '브랜드의 분위기와 강점을 화면과 코드에 그대로 담아냅니다.' },
    { id: '04', title: '꼼꼼한 검수 및 피드백', highlight: '정식 디자인 수정 2회', desc: '작은 디테일까지 함께 다듬습니다. 제작 오류나 계약된 기능의 누락은 횟수와 관계없이 바로잡습니다.' },
    { id: '05', title: '안전한 인계 및 완성', highlight: '기본 월 관리비 $0', desc: '직접 수정할 수 있는 관리자 기능과 함께 계약된 자료를 정리해 전달합니다. 이후 매달 내는 관리비는 없습니다.' },
  ],
};

/**
 * AI 광고영상 샘플(가상 브랜드 · PAUSE 기획). BEFORE = 사장님이 보내 주실 법한 평범한 사진, AFTER = 광고영상
 * 2026-10-08 사용자: SOOM은 '쇼핑몰 상세페이지 영상', 샘플 4개, 고퀄리티 광고처럼(글씨는 좋은 서체로)
 */
export type FilmSample = { key: string; brand: string; industry: string; type: string; before: string; beforeAlt: string; video: string; poster: string; videoLabel: string };
export const film = {
  eyebrow: 'SAMPLE WORKS',
  title: ['평범한 사진 한 장이,', '광고가 됩니다.'],
  lead: '사장님이 보내 주시는 평범한 사진이 이렇게 바뀝니다.\n아래 샘플은 PAUSE가 가상의 브랜드로 직접 기획하고 만든 광고입니다.',
  before: 'BEFORE',
  beforeSub: '보내주신 사진',
  after: 'AFTER',
  samples: [
    { key: 'soom', brand: 'SOOM', industry: '스킨케어 쇼핑몰', type: '쇼핑몰 상세페이지 영상', before: '/media/film/before-1200.jpg', beforeAlt: '책상 위에서 평범하게 찍은 세럼과 상자 사진', video: '/media/film/soom.mp4', poster: '/media/film/soom-poster.jpg', videoLabel: '물가에 놓인 SOOM 세럼과 상자, 잔잔한 물결과 빛' },
    { key: 'ondo', brand: 'ONDO COFFEE', industry: '카페', type: 'SNS 광고영상', before: '/media/film/ondo-before.jpg', beforeAlt: '카페 테이블에서 평범하게 찍은 라떼 사진', video: '/media/film/ondo.mp4', poster: '/media/film/ondo-poster.jpg', videoLabel: '아침 햇살 속 라떼 위로 피어오르는 김과 라떼아트를 붓는 장면, 마지막에 ONDO COFFEE 로고' },
    { key: 'route', brand: 'SOUTHERN ROUTE', industry: '여행사', type: '투어 상품 광고영상', before: '/media/film/route-before.jpg', beforeAlt: '전망대에서 휴대폰으로 찍은 흐린 날의 호수 사진', video: '/media/film/route.mp4', poster: '/media/film/route-poster.jpg', videoLabel: '뉴질랜드 남섬의 빙하 호수와 설산, 아침 안개 속 호숫가의 두 여행자, 마지막에 남섬 투어 문구' },
    { key: 'daon', brand: 'DAON HONEY', industry: '건강식품', type: '제품 광고영상', before: '/media/film/daon-before.jpg', beforeAlt: '주방 조리대에서 평범하게 찍은 꿀 병 사진', video: '/media/film/daon.mp4', poster: '/media/film/daon-poster.jpg', videoLabel: '천천히 흘러내리는 꿀과 햇살에 빛나는 꿀 병, 마지막에 DAON HONEY 로고' },
  ] as FilmSample[],
  play: '재생',
  pause: '일시정지',
};

/**
 * AI 광고영상 상품·가격(사용자 정책 2026-10-08, docs/AI_VIDEO_POLICY_2026-10.md · 최종 가격 정책 docs/PRICING_CURRENCY_POLICY_2026-10-08.md)
 * 가격 숫자는 웹사이트와 같은 통화 규칙(뉴질랜드 NZD $ · 그 외 USD $, GST 없음). 결합 상품 없음: 함께 의뢰하면 각 정상 가격을 더해 견적
 */
export type VideoPlan = { key: string; name: string; tagline: string; desc: string; price: string; suffix?: string; featured?: boolean; badge?: string; specs: [string, string][] };
export const videoPricing = {
  eyebrow: 'PRICING',
  title: 'AI 광고영상 제작 비용',
  heading: ['AI 생성 횟수가 아니라,', '완성된 광고영상을 드립니다.'],
  lead: '사업과 제품을 이해하고 광고 콘셉트와 메시지를 기획한 뒤,\nAI 생성 기술과 전문 편집으로 실제로 쓸 수 있는 광고영상을 만듭니다.',
  formats: {
    kicker: '모든 영상 상품 기본 제공',
    title: '가로 영상도, 세로 영상도\n추가 비용 없이 함께 드립니다.',
    desc: '같은 광고를 각 화면에 맞게 다시 구성합니다. 단순히 잘라내지 않고, 중요한 피사체와 문구가 잘리지 않도록 화면 구성과 자막 위치를 따로 맞춥니다.',
    items: [
      { ratio: '16:9', name: '가로형', size: '1920 × 1080', use: '웹사이트 · 유튜브 · 가로형 광고' },
      { ratio: '9:16', name: '세로형', size: '1080 × 1920', use: '릴스 · 틱톡 · 쇼츠 · 스토리' },
    ],
  },
  plans: [
    {
      key: 'short', name: 'AI SHORT AD', price: '490',
      tagline: '15초 안에 브랜드의 핵심을 전달하는 광고영상',
      desc: 'SNS 광고, 제품·서비스 홍보에 알맞은 짧은 영상. 기획부터 AI 제작과 편집까지 포함합니다.',
      specs: [['길이', '최대 15초'], ['화면', '가로·세로 2종'], ['숏버전', '없음'], ['수정', '정식 수정 1회'], ['결과물', 'MP4 2개']],
    },
    {
      key: 'brand', name: 'AI BRAND AD', price: '890', featured: true, badge: '대표 상품',
      tagline: '브랜드의 메시지를 더 완성도 있게 전달하는 30초 광고',
      desc: '브랜드·제품·서비스 홍보를 위한 기획형 광고영상. 스토리보드부터 사운드까지, 15초 숏버전도 함께 드립니다.',
      specs: [['길이', '최대 30초'], ['화면', '가로·세로 2종'], ['숏버전', '15초 1개'], ['수정', '정식 수정 2회'], ['결과물', 'MP4 3개']],
    },
    {
      key: 'hero', name: 'AI HERO FILM', price: '1,490', suffix: '부터',
      tagline: '브랜드의 이미지를 담아내는 프리미엄 AI 영상',
      desc: '홈페이지 메인, 브랜드 소개, 신제품 캠페인을 위한 영상. 브랜드 콘셉트 기획부터 색보정과 사운드까지 제공합니다.',
      specs: [['길이', '최대 60초'], ['화면', '가로·세로 2종'], ['숏버전', '30초 1개'], ['수정', '정식 수정 2회'], ['결과물', 'MP4 3개']],
    },
  ] as VideoPlan[],
  includedTitle: '세 상품 모두 포함',
  included: ['광고 콘셉트와 카피, 스크립트 기획', 'AI 이미지·영상 생성과 장면 편집', '색감·음악·사운드 편집', '필요하면 AI 보이스오버와 자막', '로고와 CTA 삽입', 'Full HD MP4 납품', '계약된 범위의 상업적 사용 권한'],
  monthly: {
    key: 'monthly', name: 'MONTHLY CREATIVE', price: '2,490', suffix: '/월', label: '선택형 월간 서비스',
    tagline: '꾸준히 필요한 광고영상, 매달 정해진 가격으로',
    desc: '한 브랜드를 위한 AI 광고영상을 매달 4편 제작합니다. 웹사이트 관리비($0)와는 별개로, 원하실 때만 선택하는 정기 영상 제작 상품입니다.',
    specs: ['매달 4편 · 편당 최대 30초', '편마다 가로·세로 (매달 MP4 8개)', '영상마다 정식 수정 1회', '월 단위 선결제 · 최소 계약 기간 없음'],
    note: '다음 결제 전에 말씀하시면 이후 제작을 종료합니다. 쓰지 않은 편수는 다음 달로 넘어가지 않습니다.',
  },
  revisions: '수정 1회는 한 번의 검토 단계에서 모아 주신 피드백을 뜻합니다. 가로·세로 영상은 함께 수정되어 횟수가 두 배로 늘지 않고, PAUSE의 실수는 횟수와 관계없이 바로잡습니다.',
  addons: {
    title: '추가 작업 가격',
    toggle: '추가 작업 가격 보기',
    note: '기본 가로·세로 제공에는 추가 요금이 없습니다. 어려운 작업은 계약 전에 견적을 먼저 안내합니다.',
    /** [작업, 가격(숫자면 통화 표기), 단위] */
    rows: [
      ['1:1 또는 4:5 규격 추가 편집', '90', '/규격'],
      ['자막 없는 클린 버전', '50', '부터'],
      ['기존 장면을 활용한 다른 오프닝', '150', '부터'],
      ['새 장면 생성이 필요한 오프닝', '250', '부터'],
      ['기존 영상으로 숏버전 추가 제작', '150', '부터'],
      ['추가 언어 버전', '150', '부터'],
      ['AI SHORT AD 추가 수정 1회', '100', ''],
      ['AI BRAND AD · HERO FILM 추가 수정 1회', '150', ''],
      ['4K 업스케일 출력', '120', '부터'],
      ['복잡한 제품·인물 일관성 작업', '250', '부터'],
      ['48시간 긴급 제작(가능한 경우)', '제작비 +30%', ''],
      ['복잡한 립싱크·언어별 장면 재생성', '맞춤 견적', ''],
      ['광고 언어·시장별 완전한 재기획', '맞춤 견적', ''],
      ['실제 성우 녹음 · 실제 촬영 · 고난도 신규 장면', '별도 견적', ''],
    ] as [string, string, string][],
  },
  stepsTitle: '제작 과정',
  steps: [
    { id: '01', title: '제작 상담', desc: '브랜드와 제품, 광고 목적, 영상을 쓸 곳을 확인합니다.' },
    { id: '02', title: '견적·범위 확정', desc: '길이, 콘셉트, 언어, 화면 규격, 숏버전, 수정 횟수, 비용과 일정을 정합니다.' },
    { id: '03', title: '스크립트 승인', desc: '핵심 메시지와 광고 내용을 먼저 확인받고, 필요하면 스토리보드를 드립니다.' },
    { id: '04', title: 'AI 영상 제작', desc: '브랜드 자료를 바탕으로 장면을 만들고 편집합니다.' },
    { id: '05', title: '시안 검토·수정', desc: '검토용 영상을 보내 드리고, 계약된 횟수만큼 수정합니다.' },
    { id: '06', title: '최종 파일 전달', desc: '가로·세로 완성본과 숏버전을 Full HD MP4로 드립니다.' },
  ],
  scheduleTitle: '1차 시안까지',
  schedule: [['AI SHORT AD', '영업일 5~7일'], ['AI BRAND AD', '영업일 7~10일'], ['AI HERO FILM', '영업일 10~15일'], ['MONTHLY CREATIVE', '월별 일정 협의']] as [string, string][],
  scheduleNote: '자료와 콘셉트가 확정된 뒤의 예상 기간입니다. 피드백과 장면 난이도에 따라 달라질 수 있어, 행사일처럼 꼭 맞춰야 하는 날짜는 계약 전에 확정합니다.',
  notesTitle: '알아두실 점',
  notes: [
    '광고 계정 운영과 광고비 집행은 별도 서비스입니다. 조회수나 매출 증가를 보장하지는 않습니다.',
    '기본 결과물은 최종 MP4 파일입니다. 편집 프로젝트 파일과 생성 원본은 기본 제공에 포함되지 않습니다.',
    '실제 제품의 로고와 형태를 정확히 보여 주려면 제품 사진이 필요합니다. 보내 주신 실제 사진과 로고를 먼저 사용합니다.',
    '실존 인물의 얼굴이나 목소리는 사용 동의를 받은 경우에만 쓰고, 실제 후기처럼 보이는 AI 증언 영상은 만들지 않습니다.',
    '최종 영상은 계약된 범위에서 디지털 상업적으로 사용하실 수 있습니다. 음악과 외부 소스, 인물 초상은 각 라이선스 조건을 따릅니다.',
  ],
};

export type Faq = { q: string; a: string };
export const faq = {
  eyebrow: 'FAQ',
  title: ['궁금하신 점들을', '모았습니다.'],
  tabs: [
    {
      key: 'web', label: '웹사이트',
      items: [
        { q: '정말 나중에 추가로 나가는 비용이 없나요?', a: '유지보수, 관리비, 웹 호스팅이 모든 플랜에 무료로 포함되어 PAUSE Studio에 매달 내는 관리비가 없습니다. 도메인 등록·갱신, 카드 결제 수수료, 유료 외부 서비스, 새 페이지·새 기능 개발처럼 비용이 생길 수 있는 경우는 견적 단계에서 미리 안내해 드립니다.' },
        { q: '정말 제작비 한 번만 내면 되나요?', a: '네, 제작비는 선금으로 한 번 결제하시면 됩니다. 웹 호스팅은 무상 제공 범위 안에서 무료이고, 텍스트나 사진 등 지정된 콘텐츠는 관리자 기능으로 직접 수정하실 수 있어 매달 관리비를 낼 필요가 없습니다.' },
        { q: '어떤 플랜을 골라야 하나요?', a: '브랜드와 서비스를 소개하고 고객 문의를 받는 웹사이트라면 STARTER, 제품·재고 관리와 예약·주문·온라인 결제까지 운영하려면 BUSINESS, AI 업무 자동화(AX)나 외부 시스템(ERP, POS, CRM 등) 연동이 필요하다면 ENTERPRISE가 맞습니다. 잘 모르시겠다면 무료 상담에서 비즈니스에 맞는 구성을 제안드립니다.' },
        { q: '웹사이트와 광고영상을 함께 맡길 수 있나요?', a: '네. 같은 브랜드 방향으로 웹사이트와 AI 광고영상을 함께 만들 수 있습니다. 견적은 각 상품의 가격을 더해 안내해 드립니다.' },
        { q: '제작 기간은 얼마나 걸리나요?', a: '프로젝트 규모에 따라 다르며, 보통 2~6주 안에 진행됩니다.' },
        { q: '무료 유지보수와 관리비, 혹시 회사가 없어지면 어떻게 되나요?', a: '실제로 가장 많이 받는 질문입니다. 무료 유지보수와 관리비 면제는 계약상 기본으로 드리는 것이 아니라, PAUSE Studio가 서비스 차원에서 제공해 드리는 혜택입니다. 만에 하나 PAUSE Studio가 문을 닫게 되더라도 웹사이트의 콘텐츠와 데이터, 계약된 제작 결과물의 소유권은 모두 대표님께 있으니, 인계 자료로 다른 개발자나 호스팅 업체를 통해 그대로 유지보수하며 운영하시면 됩니다. 물론 그런 일이 없도록 오래 곁에 있겠습니다.' },
        { q: '사이트 소유권은 누구에게 있나요?', a: '웹사이트는 대표님의 자산입니다. 대표님의 콘텐츠와 데이터, 계약된 제작 결과물에 대한 권리를 명확하게 안내하고, 필요한 경우 다른 개발자에게 운영을 맡길 수 있도록 인계 범위를 제공합니다. 공통 개발 코드, 오픈소스, 외부 플랫폼, 유료 라이선스는 각 계약과 라이선스 조건을 따릅니다.' },
        { q: '나중에 다른 곳에 맡기거나 직접 관리하고 싶어지면요?', a: '도메인은 가능한 대표님 명의로 등록해 드리고, 다른 개발자에게 운영을 맡기실 수 있도록 계약된 자료를 인계해 드립니다. 물론 그럴 일이 없도록 끝까지 함께하겠습니다.' },
        { q: '디자인 수정은 몇 번까지 가능한가요?', a: '계약 범위 안에서 정식 디자인 수정 2회를 제공합니다. 여러 의견을 모아 전달해 주시는 한 번의 피드백을 수정 1회로 봅니다. PAUSE Studio의 제작 오류나 계약된 기능의 누락·오작동은 횟수와 관계없이 바로잡습니다. 승인한 디자인의 전면 변경, 새 페이지·기능, 전체 구조 변경은 별도 비용입니다.' },
        { q: '해외에서도 의뢰할 수 있나요?', a: '네. 오클랜드를 기반으로 뉴질랜드와 미국 등 해외 한인 사장님들의 웹사이트와 광고영상을 만듭니다. 홈페이지의 가격은 접속하신 나라에 맞는 통화로 같은 숫자를 보여 드리며, 환율로 바꾸지 않습니다. 실제 계약 통화는 사업장이 있는 나라를 기준으로 견적서에서 확정해 드립니다.' },
        { q: '해외(뉴질랜드, 미국 등)인데 소통에 문제가 없을까요?', a: '전혀 걱정하지 않으셔도 됩니다. Zoom 화상 미팅, 전화, 카카오톡, 이메일 등 사장님께 가장 편한 방식으로 소통하며, 모든 기획과 커뮤니케이션은 한국어로 진행됩니다.' },
        { q: '다국어 사이트 제작도 가능한가요?', a: '네, 다국어 레이아웃과 서체를 고려해 디자인할 수 있습니다. 기본 가격은 한 가지 콘텐츠 언어 기준이며, 추가 언어 페이지와 전문 번역, 원어민 검수는 범위에 따라 별도 견적으로 진행합니다.' },
        { q: '검색 엔진(SEO) 최적화도 포함되나요?', a: '네, 모든 플랜에 포함됩니다. STARTER와 BUSINESS는 구글과 네이버에 잘 노출되도록 메타데이터, 사이트맵, 구조화 데이터 등 기본 SEO를 설정해 드리고, ENTERPRISE는 고급 SEO 설정이 포함됩니다.' },
        { q: '도메인과 호스팅은 어떻게 되나요?', a: '도메인은 가능한 대표님 명의로 등록하며, 도메인 등록·갱신 비용은 별도입니다. 웹 호스팅은 모든 플랜에 무료로 제공되며, 트래픽과 서버 사용량이 무상 제공 범위를 크게 넘는 경우에만 호스팅 환경과 추가 비용을 협의합니다.' },
      ] as Faq[],
    },
    {
      key: 'video', label: 'AI 광고영상',
      items: [
        { q: 'AI로 만든 영상인가요?', a: '네. AI 생성 기술과 전문적인 기획·편집으로 광고영상을 만듭니다. AI가 만든 원본을 그대로 전달하는 것이 아니라, 광고에 맞는 콘셉트와 메시지를 구성하고 최종 영상을 편집해 드립니다.' },
        { q: '모바일 버전도 받을 수 있나요?', a: '네. 모든 영상 상품에 가로형(16:9)과 세로형(9:16) 영상이 함께 포함됩니다. 웹사이트나 유튜브에 쓰실 가로 영상과 릴스·쇼츠에 쓰실 세로 영상을 같이 받으실 수 있습니다.' },
        { q: '인스타그램 릴스에 사용할 수 있나요?', a: '네. 함께 드리는 세로형 영상을 릴스, 쇼츠 등 세로형 콘텐츠에 바로 쓰실 수 있습니다. 광고 플랫폼의 개별 승인과 광고 집행은 별도입니다.' },
        { q: '가로형과 세로형은 서로 다른 영상인가요?', a: '같은 광고 콘셉트와 메시지를 각 화면에 맞게 구성한 두 가지 버전입니다. 광고 내용까지 다른 영상을 원하시면 별도 제작이 필요할 수 있습니다.' },
        { q: '완성 후에도 수정할 수 있나요?', a: '네. 상품에 따라 정식 수정 1회 또는 2회를 드립니다. 가로·세로 영상은 함께 수정되어 횟수가 두 배로 늘지 않습니다. 승인한 광고 콘셉트를 전면 변경하는 경우에는 별도 견적이 필요할 수 있습니다.' },
        { q: '실제 제품 사진이 없어도 제작할 수 있나요?', a: '제품 종류와 필요한 정확도에 따라 다릅니다. 간단한 콘셉트 영상은 AI로 만들 수 있지만, 판매 제품의 모양과 로고를 정확하게 보여 줘야 한다면 제품 사진이나 자료가 필요합니다.' },
        { q: 'AI 영상을 광고로 상업적으로 써도 되나요?', a: '계약에서 정한 최종 결과물의 디지털 상업적 사용을 제공합니다. 다만 음악, 외부 소스, 인물 초상 등은 각 라이선스 조건을 따릅니다.' },
        { q: '영상에 음악과 목소리도 들어가나요?', a: '네. 필요한 경우 음악과 AI 보이스오버, 자막을 포함합니다. 실제 성우 녹음이나 특별한 음성 연출은 별도 견적이 적용될 수 있습니다.' },
        { q: '한국어 광고도 만들 수 있나요?', a: '네. 한국어나 영어 등 계약에서 정한 한 가지 언어로 제작하며, 추가 언어 버전은 별도 견적으로 드립니다.' },
        { q: '4K 영상인가요?', a: '기본 납품 규격은 Full HD입니다. 4K가 필요하시면 원본 해상도와 제작 방식에 따라 업스케일 작업을 따로 안내해 드립니다.' },
        { q: '촬영도 해 주시나요?', a: 'AI 광고영상 상품에는 현장 촬영이 포함되지 않습니다. 보내 주신 촬영 자료는 활용할 수 있으며, 별도 촬영이 필요한 프로젝트는 맞춤 견적으로 안내합니다.' },
        { q: '광고를 대신 집행해 주시나요?', a: '기본 상품은 광고영상 제작 서비스입니다. 광고 계정 운영과 광고비 집행은 별도 서비스로 견적을 드립니다.' },
        { q: 'MONTHLY CREATIVE는 웹사이트 관리비와 다른가요?', a: '네, 전혀 다른 서비스입니다. 웹사이트 기본 월 관리비는 그대로 $0이고, MONTHLY CREATIVE는 광고영상이 꾸준히 필요하신 분이 원할 때만 선택하는 정기 영상 제작 상품입니다.' },
      ] as Faq[],
    },
  ],
};

/** 마무리 선언(2026-10-08 사용자: 평범하고 임팩트가 없음 → 스크롤에 따라 글자가 차오르는 큰 문장) */
export const manifesto = {
  kicker: '단순히 시키는 대로만 만들지 않습니다',
  lines: ['사장님보다 더', '사장님 같은 마음으로'],
  statement: '무엇이 진짜 필요한지 먼저 고민하고, 먼저 제안합니다.',
  sign: 'PAUSE STUDIO 대표',
};

export const contactSection = {
  windowLabel: '비공개 1:1 상담실',
  status: '신규 프로젝트 상담 가능',
  title: ['매달 나가는 ', '웹사이트 관리비,', '스트레스에서 해방', '되세요.'],
  desc: ['현재 지출 중인 웹사이트 비용을 투명하게 진단하고,', ' 기본 월 관리비 없는 ', '자체 운영 방식', '으로의 전환 방안을 제안해 드립니다. 웹사이트와 AI 광고영상 상담 모두 가능합니다.'],
  channelsNote: ['시차와 거리에 구애받지 않고 ', 'Zoom 화상회의, 전화상담, 카카오톡, 이메일', ' 등 사장님께 가장 편안한 방식으로 소통합니다.'],
  phone: { title: '전화 상담', hint: '누르시면 전화 걸기와 문자 보내기를 고를 수 있습니다.', call: '전화 걸기', sms: '문자 보내기', copy: '번호 복사', copied: '번호를 복사했습니다' },
  kakao: { title: '카카오톡 문의안내', idLabel: '카카오톡 아이디', qrLabel: '카카오 QR 스캔', hint: '아이디 추가 후 문의하시거나 QR을 스캔해 주세요.' },
  email: { title: '이메일', label: '이메일 주소 보기', hint: '견적·자료는 이메일로도 보내주실 수 있습니다.' },
};

/** 상담 신청 모달: 웹사이트 상담 + AI 광고영상 상담 */
export const consult = {
  title: '브랜딩 무료 상담 신청',
  steps: ['상담 종류', '기본 정보', '상세 내용', '확인'],
  types: [
    { value: '웹사이트 제작', label: '웹사이트 제작', desc: 'STARTER · BUSINESS · 브랜드 소개부터 예약·주문·결제까지' },
    { value: 'AI 광고영상', label: 'AI 광고영상', desc: '가지고 계신 사진으로 만드는 광고영상, 가로·세로 함께' },
    { value: '웹사이트 + AI 광고영상', label: '둘 다 함께', desc: '웹사이트와 광고영상을 같은 톤으로' },
    { value: 'AI 업무 자동화 · 맞춤 개발', label: 'AI 업무 자동화 · 맞춤 개발', desc: 'ENTERPRISE · AI 자동화(AX) · 외부 시스템 연동' },
  ],
  fields: {
    company: '회사 / 브랜드명', name: '성함', email: '이메일', phone: '연락처', country: '사업장 소재 국가', industry: '업종', currentSite: '기존 웹사이트 주소',
    countries: ['뉴질랜드', '미국', '기타'],
    product: '관심 있는 플랜', products: ['STARTER · 기본형', 'BUSINESS · 비즈니스형', 'ENTERPRISE · 기업형', '잘 모르겠어요'],
    needs: '필요한 페이지·기능', needOptions: ['회사·서비스 소개', '오시는 길', '갤러리·포트폴리오', '문의 폼·이메일 연동', '예약', '온라인 주문·결제', '제품·재고 관리', '회원·고객 관리', '추가 언어 페이지', '관리자 기능'],
    itemCount: '페이지·상품 수(대략)', bookingPay: '사용 중인 예약·결제 서비스', integrations: '추가 연동이 필요한 시스템',
    videoProduct: '관심 있는 영상 상품', videoProducts: ['AI SHORT AD · 15초', 'AI BRAND AD · 30초', 'AI HERO FILM · 60초', 'MONTHLY CREATIVE · 월 4편', '잘 모르겠어요'],
    videoUse: '영상을 쓸 곳', videoUses: ['웹사이트', 'SNS 광고', '매장 모니터', '기타'],
    photos: '보유하신 사진·이미지', photosHint: '대략적인 수량이나 종류(제품, 매장, 패키지 등)',
    mood: '원하는 분위기·참고 영상',
    automation: '자동화하고 싶은 업무', systems: '사용 중인 시스템(POS, CRM 등)',
    timeline: '원하는 시작·오픈 시기', message: '남기실 말씀',
    files: '참고 자료 첨부', filesHint: '이미지·PDF·문서·ZIP, 합계 25MB까지',
    privacy: '보내주신 정보는 상담과 견적 안내에만 사용합니다.',
  },
  buttons: { next: '다음', prev: '이전', submit: '상담 신청 보내기', close: '닫기', done: '확인' },
  required: '필수',
  sending: '보내는 중…',
  success: { title: '상담 신청이 접수되었습니다.', desc: '보내주신 내용을 확인한 뒤 남겨주신 연락처로 직접 연락드리겠습니다.' },
  failure: {
    title: '전송에 실패했습니다.',
    desc: '네트워크 문제로 보내지 못했습니다. 아래 방법으로 같은 내용을 보내주세요.',
    mail: '메일 앱으로 보내기', copy: '내용 복사하기', copied: '복사했습니다', kakao: '카카오톡으로 문의하기',
  },
  errors: { name: '성함을 입력해 주세요.', email: '이메일 주소를 확인해 주세요.', type: '상담 종류를 선택해 주세요.', files: '첨부 파일은 합계 25MB까지 보낼 수 있습니다.' },
};

export const footer = {
  emailLabel: 'Email',
  emailReveal: '이메일 보기',
  legalLink: '법적 고지',
  legal: [
    '법적 고지: Pause Studio는 전문적인 웹 디자인·개발과 광고영상 제작 서비스를 제공합니다. 특정 비즈니스 결과, 트래픽 또는 수익을 보장하지 않습니다. 웹사이트가 배포된 이후에는 모든 판매가 확정되며 환불이 불가합니다.',
    '무료 유지보수는 회사가 서비스를 운영하는 기간에 한하며, 별도로 대가를 받지 않는 부가 서비스입니다. 서비스 종료 시에도 고객의 콘텐츠와 데이터, 계약된 제작 결과물에 대한 권리는 영향받지 않습니다.',
  ],
  copyright: '© 2026 PAUSE STUDIO. All Rights Reserved.',
};
