/**
 * PAUSE STUDIO 사이트 문구(한국어) — 한 곳에서 관리
 * 기준: 기존 사이트 원문(content/site-content.ko.json) + 사업 정책(docs/BUSINESS_POLICY_2026-10.md)
 *       + 원문 대조표(docs/CONTENT_POLICY_AUDIT.md) + 32차 히어로(사용자 확정 문구)
 *       + 플랜(상품명·가격·기능) = 사용자 견적서(docs/QUOTATION_2026-10-07.md) — 정책 문서의 상품명·가격보다 우선(2026-10-08 사용자)
 * 원문과 달라진 곳은 docs/CONTENT_MAP.md 에 이유와 함께 기록한다.
 */

export const contact = {
  kakaoUrl: 'https://open.kakao.com/o/s58WfSEi',
  kakaoId: 'cosmic0809',
  smsLabel: '+64 020-488-7198',
  smsHref: 'sms:+640204887198',
  email: 'scottnim7777@gmail.com',
  address: 'New Zealand, 75 Victoria Street West, Auckland CBD 1010',
  nzbn: 'NZBN: 9429053533340',
};

export const meta = {
  lang: 'ko',
  title: 'PAUSE Studio | 퍼즈 스튜디오 — 한인 비즈니스를 위한 브랜딩 스튜디오',
  description:
    '선택받는 브랜드는 보여지는 방식이 다릅니다. 웹사이트 제작부터 AI 영상광고까지 — 뉴질랜드·미국 한인 비즈니스를 위한 브랜드 맞춤 웹사이트. 제작비는 한 번, PAUSE Studio 기본 월 관리비 $0.',
  keywords: 'pausestudio, pausestudio.com, pause studio, 퍼즈스튜디오, 퍼즈 스튜디오, 웹사이트 제작, AI 영상광고, 오클랜드 웹사이트 제작, 뉴질랜드 웹 제작, 한인 비즈니스',
  canonical: 'https://pause8studio.com/',
  ogTitle: 'PAUSE Studio | 한인 비즈니스를 위한 브랜딩 스튜디오',
  ogDescription: '브랜드는 더 돋보이게. 매달 관리비는 없게. 웹사이트 제작부터 AI 영상광고까지, 브랜드가 고객에게 보여지는 모든 순간을 만듭니다.',
  ogImage: 'https://pause8studio.com/og.jpg',
  googleSiteVerification: 'YRTNSno7nYptgfm08ZthTl09DUbhS9NT6hKgg9iOQ4U',
};

export const nav = [
  { href: '#work', label: '포트폴리오' },
  { href: '#services', label: '서비스' },
  { href: '#pricing', label: '요금' },
  { href: '#faq', label: '자주 묻는 질문' },
];

export const cta = {
  header: '문의하기',
  consult: '브랜딩 무료 상담 신청',
  kakao: '카카오톡 1:1 실시간 상담',
};

export const hero = {
  eyebrow: '한인 비즈니스를 위한 브랜딩 스튜디오',
  titleLines: ['선택받는 브랜드는', '보여지는 방식이 다릅니다.'],
  titleLinesMobile: ['선택받는 브랜드는', '보여지는 방식이', '다릅니다.'],
  sub: ['웹사이트 제작부터 AI 영상 제작까지,', '브랜드가 고객에게 보여지는 모든 순간을 만듭니다.'],
  services: [
    { index: '01', name: '웹사이트 제작', lead: '제작비는 한 번, 기본 월 관리비는 $0*', desc: '유지보수·웹 호스팅까지 무료' },
    { index: '02', name: 'AI 영상광고', lead: '촬영 없이, 가지고 계신 사진만으로', desc: '브랜드 광고 영상을 만들어 드립니다' },
  ],
  note: '* 도메인·결제 수수료 등 외부 서비스 비용은 별도입니다.',
};

/** 포트폴리오: 실제 고객 작업물만(기존 사이트 Ref. 번호·업종 그대로). Ref.16~39는 소유 확인 전이라 제외 */
export type WorkItem = { ref: string; category: string; image: string; video?: string; w: number; h: number };
export const work = {
  eyebrow: 'PORTFOLIO',
  title: ['실제로 만든', '웹사이트입니다.'],
  lead: '모든 화면은 고객 사이트의 실제 화면입니다. 눌러서 크게 보세요.',
  hint: '클릭하여 탐색',
  items: [
    { ref: 'Ref. 01', category: '여행 / 유학원', image: '/media/work/ref01.jpg', video: '/media/work/ref01', w: 1280, h: 672 },
    { ref: 'Ref. 02', category: '홈메이드 케이크', image: '/media/work/ref02.jpg', video: '/media/work/ref02', w: 800, h: 448 },
    { ref: 'Ref. 03', category: '한식당', image: '/media/work/ref03.jpg', w: 2156, h: 1155 },
    { ref: 'Ref. 04', category: '오클랜드 현지 여행사', image: '/media/work/ref04.jpg', video: '/media/work/ref04', w: 1280, h: 720 },
    { ref: 'Ref. 05', category: '패스트푸드 프랜차이즈', image: '/media/work/ref05.jpg', w: 1450, h: 766 },
    { ref: 'Ref. 06', category: '패스트푸드 프랜차이즈', image: '/media/work/ref06.jpg', w: 1446, h: 950 },
    { ref: 'Ref. 07', category: '호스피스', image: '/media/work/ref07.jpg', video: '/media/work/ref07', w: 1280, h: 744 },
    { ref: 'Ref. 08', category: '미용실 / 헤어 살롱', image: '/media/work/ref08.jpg', w: 1254, h: 836 },
    { ref: 'Ref. 09', category: '건강식품', image: '/media/work/ref09.jpg', w: 1555, h: 1300 },
    { ref: 'Ref. 10', category: '택시 호출 및 배차 플랫폼 개발', image: '/media/work/ref10.jpg', w: 3510, h: 5064 },
    { ref: 'Ref. 11', category: '여행사', image: '/media/work/ref11.jpg', w: 1737, h: 904 },
    { ref: 'Ref. 12', category: '여행사', image: '/media/work/ref12.jpg', w: 1565, h: 1200 },
    { ref: 'Ref. 13', category: '토스 핀테크 파트너 앱 개발', image: '/media/work/ref13.jpg', w: 1906, h: 891 },
    { ref: 'Ref. 14', category: '토스 핀테크 파트너 앱 개발', image: '/media/work/ref14.jpg', w: 3362, h: 1175 },
    { ref: 'Ref. 15', category: '토스 핀테크 파트너 앱 개발', image: '/media/work/ref15.jpg', w: 1908, h: 905 },
    { ref: 'ChillenQ', category: '냉장·냉동 설비', image: '/media/work/chillenq.jpg', w: 1735, h: 842 },
  ] as WorkItem[],
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
    { title: '기본 월 관리비 $0', desc: '제작 후 PAUSE Studio에 매달 내는 관리비가 없습니다. 웹사이트 유지보수와 웹 호스팅도 모든 플랜에 무료로 포함됩니다.' },
    { title: '대표 직접 제작', desc: '상담부터 디자인, 개발, 최종 검수까지 대표가 직접 참여합니다. 담당자가 바뀌거나 하청으로 넘어가지 않습니다.' },
    { title: '직접 관리하는 웹사이트', desc: '블로그나 인스타그램처럼 쉽습니다. 지정된 텍스트, 이미지, 상품과 가격을 직접 수정하세요.' },
    { title: '명확한 소유권', desc: '도메인은 가능한 대표님 명의로 등록하고, 콘텐츠·데이터와 계약된 제작 결과물의 권리와 인계 범위를 명확히 드립니다.' },
    { title: '비즈니스 솔루션 개발', desc: '웹사이트를 넘어 온라인 주문, AI 업무 자동화, 고객·재고 관리, 외부 시스템 연동까지 개발합니다.' },
  ],
};

export const who = {
  eyebrow: 'CHAPTER 01',
  title: ['이런 대표님께', '강력히 추천합니다'],
  lead: '매달 지출되는 고정비 부담을 줄이고, 내 비즈니스의 독보적인 브랜드 가치를 웹상에 구축하고 싶으신 모든 분들을 위한 최적의 제작 방식입니다.',
  items: [
    '웹사이트의 첫인상이 브랜드의 신뢰도를 결정한다고 생각하시는 분',
    '매년 청구되는 관리비, 유지비, 호스팅비에 지치신 분',
    '템플릿이 아닌, 우리 브랜드만의 디자인을 원하시는 분',
    '한국어와 영어 모두 자연스러운 디자인이 필요하신 분',
    '길게 함께 갈 비즈니스 파트너를 찾고 계신 분',
    '가지고 있는 사진으로 브랜드 광고 영상을 만들고 싶으신 분',
  ],
};

/**
 * 플랜 = 사용자 견적서(PAUSE Studio 웹사이트 제작 견적서, 2026.10.07) 그대로 — 요금 카드와 서비스 상세가 모두 이 값을 쓴다.
 * 2026-10-08 사용자: "기존에 만든 견적서 안의 플랜 내용으로 교체" → 사업 정책 문서의 WEBSITE·ONLINE STORE 대신 STARTER·BUSINESS·ENTERPRISE.
 * only = 이 플랜만의 기능(위·강조) · base = 다른 플랜과 같은 기본 기능(아래·작게, 강조 없이)
 */
export const plans = {
  starter: {
    name: 'STARTER', ko: '기본형', price: 'NZD 1,490',
    target: '브랜드와 서비스를 효과적으로 소개하고, 고객 문의로 이어질 수 있도록 설계된 맞춤형 웹사이트가 필요한 경우',
    features: ['최대 5페이지 구성', '반응형 디자인 (모바일 최적화)', '브랜드 맞춤 디자인', '회사소개 / 서비스 소개 / 오시는 길 등 기본 페이지 구성', '문의 폼 / 이메일 연동', '기본 SEO 설정', 'SSL 보안 인증서 적용'],
  },
  business: {
    name: 'BUSINESS', ko: '비즈니스형', price: 'NZD 2,900',
    target: '제품·재고 관리부터 예약, 주문, 온라인 결제까지 통합하여 고객 응대와 판매 과정을 효율적으로 운영할 수 있는 비즈니스 웹사이트가 필요한 경우',
    only: ['최대 10페이지 구성', '제품·재고 관리 시스템', '예약 / 주문 / 온라인 결제 기능', '고객 관리 시스템 (주문 내역, 회원 관리)'],
    base: ['반응형 디자인 (모바일 최적화)', '브랜드 맞춤 디자인', '문의 폼 / 이메일 연동', '기본 SEO 설정', 'SSL 보안 인증서 적용'],
  },
  enterprise: {
    name: 'ENTERPRISE', ko: '기업형', price: 'NZD 5,500+',
    target: 'AI 기반 업무 자동화(AX)와 외부 시스템 연동 등 복잡한 비즈니스 운영에 필요한 다양한 기능을 맞춤형으로 구축하는 기업용 웹사이트가 필요한 경우',
    only: ['맞춤 페이지 구성 (무제한 가능)', 'AI 기반 업무 자동화 (AX)', '회원 관리 및 고객 데이터 관리', '외부 시스템 연동 (ERP, POS, CRM 등)', '맞춤형 기능 개발'],
    base: ['반응형 디자인 (모바일 최적화)', '브랜드 맞춤 디자인', '문의 폼 / 이메일 연동', '고급 SEO 설정', 'SSL 보안 인증서 적용'],
  },
  /** 견적서: 모든 플랜에 포함되는 무료 혜택 */
  free: ['웹사이트 유지보수 무료', '웹사이트 관리비 무료', '웹 호스팅 무료'],
  /** 견적서: 추가 안내사항(1~5) + 외부 서비스 비용 안내(히어로 주석과 같은 문장) */
  notes: [
    '위 금액은 뉴질랜드 달러(NZD) 기준이며, GST가 포함된 금액입니다.',
    '페이지 추가, 특정 기능 개발, 외부 시스템 연동 등은 별도 견적이 적용될 수 있습니다.',
    '제작 기간은 프로젝트 규모에 따라 상이하며, 보통 2~6주 내에 진행됩니다.',
    '호스팅은 기본적으로 무료로 제공되지만, 트래픽 및 서버 자원 사용량이 무상 제공 범위를 초과할 경우 호스팅 환경 및 추가 비용은 별도 협의가 필요할 수 있습니다.',
    '자세한 상담을 통해 비즈니스에 맞는 최적의 구성을 제안드립니다.',
    '도메인·결제 수수료 등 외부 서비스 비용은 별도입니다.',
  ],
};
const P = plans;

/** 서비스·요금 버튼 → 상담 창에서 미리 고를 종류·플랜(consult.types · consult.fields.products 값과 같아야 함) */
export const consultPreset: Record<string, { type: string; product?: string }> = {
  starter: { type: '웹사이트 제작', product: 'STARTER · 기본형' },
  business: { type: '웹사이트 제작', product: 'BUSINESS · 비즈니스형' },
  enterprise: { type: 'AI 업무 자동화 · 맞춤 개발' },
  film: { type: 'AI 영상광고' },
};

/** tone: key = 이 플랜만의 기능(강조, 맨 위) · base = 다른 플랜과 같은 기본 기능(작게, 강조 없이) */
export type Group = { title: string; items: string[]; tone?: 'key' | 'base' };
export type Service = {
  key: string; index: string; name: string; ko: string; price: string; priceNote?: string;
  headline: string; target?: string; purpose?: string; groups: Group[]; footnotes?: string[];
};

export const services = {
  eyebrow: 'CHAPTER 02',
  title: ['필요한 만큼,', '우리 비즈니스에 맞게.'],
  lead: '브랜드 소개가 필요한지, 예약·주문·결제까지 운영해야 하는지, 업무 자동화와 외부 시스템 연동이 필요한지에 따라 고르시면 됩니다. 기획부터 디자인, 개발까지 모든 과정을 한 번에 진행합니다.',
  items: [
    {
      key: 'starter', index: '01', name: P.starter.name, ko: P.starter.ko, price: P.starter.price, priceNote: 'GST 포함',
      headline: '브랜드를 소개하고, 고객 문의로 이어지는 웹사이트',
      target: P.starter.target,
      groups: [{ title: '포함 기능', items: P.starter.features }],
    },
    {
      key: 'business', index: '02', name: P.business.name, ko: P.business.ko, price: P.business.price, priceNote: 'GST 포함',
      headline: '제품·재고 관리부터 예약·주문·온라인 결제까지 한 번에 운영하는 웹사이트',
      target: P.business.target,
      groups: [
        { title: 'BUSINESS만의 기능', tone: 'key', items: P.business.only },
        { title: '기본 포함', tone: 'base', items: P.business.base },
      ],
      footnotes: ['카드 결제 수수료 등 결제 서비스 이용료는 별도입니다.'],
    },
    {
      key: 'enterprise', index: '03', name: P.enterprise.name, ko: P.enterprise.ko, price: P.enterprise.price, priceNote: 'GST 포함',
      headline: 'AI 기반 업무 자동화(AX)부터 비즈니스 전용 시스템 구축까지.',
      target: P.enterprise.target,
      groups: [
        { title: 'ENTERPRISE만의 기능', tone: 'key', items: P.enterprise.only },
        { title: 'AI 업무 자동화(AX) — 예를 들면', items: ['AI 고객 상담', '고객 문의 자동 분류', '이메일 응대 초안 작성', '견적서 작성 자동화', '인보이스 및 문서 처리', '예약·문의 정보 자동 등록', '반복적인 데이터 입력 자동화', '업무 알림 및 보고 자동화'] },
        { title: '기본 포함', tone: 'base', items: P.enterprise.base },
      ],
      footnotes: ['NZD 5,500부터 시작하며, 필요한 기능과 개발 범위를 상담으로 확인한 뒤 견적을 확정합니다.', 'AI 모델 이용료, 외부 API, 유료 플랫폼, 서버 및 시스템 운영비가 발생할 수 있습니다.'],
    },
    {
      key: 'film', index: '04', name: 'AI VIDEO AD', ko: 'AI 영상광고', price: '상담 후 견적',
      headline: '촬영 없이, 가지고 계신 사진만으로 만드는 광고 영상',
      purpose: '가지고 계신 제품·매장 사진과 이미지를 보내주시면, 촬영 없이 AI로 브랜드에 맞는 광고 영상을 만들어 드립니다. 웹사이트와 함께 만들면 화면과 영상의 톤이 하나로 이어집니다.',
      groups: [
        { title: '이렇게 진행합니다', items: ['보유하신 사진·이미지 전달', '브랜드 톤에 맞춘 장면·연출 기획', 'AI로 광고 영상 제작', '확인 후 완성본 전달'] },
      ],
      footnotes: ['영상 길이와 용도에 따라 상담 후 견적을 드립니다.'],
    },
  ] as Service[],
  /** 모든 플랜에 공통으로 들어가는 기능(견적서) + 관리자 기능(기존 사이트) */
  basics: {
    title: '모든 플랜에 기본으로',
    items: [
      { title: '브랜드 맞춤 디자인', desc: '템플릿 없이, 브랜드에 맞춰 화면을 처음부터 설계합니다.' },
      { title: '반응형 디자인', desc: '모바일, 태블릿, 데스크톱 모든 환경에서 동일한 완성도를 유지합니다.' },
      { title: '문의 폼 · 이메일 연동', desc: '고객이 남긴 문의가 바로 이메일로 도착합니다.' },
      { title: 'SEO 설정', desc: '사이트맵, 메타데이터, 구조화 데이터까지 정돈해 드립니다. ENTERPRISE는 고급 SEO 설정이 포함됩니다.' },
      { title: 'SSL 보안 인증서', desc: '주소창의 자물쇠(https)로, 방문자와 주고받는 정보를 안전하게 지킵니다.' },
      { title: '관리자 기능', tag: 'SELF MANAGEMENT', desc: '블로그나 인스타그램처럼 쉽습니다. 지정된 텍스트, 이미지, 상품을 직접 수정할 수 있습니다.' },
    ],
  },
};

export const film = {
  eyebrow: 'AI VIDEO AD',
  title: ['평범한 사진 한 장이,', '광고가 됩니다.'],
  lead: '촬영 없이, 가지고 계신 사진만으로 브랜드 광고 영상을 만듭니다.',
  steps: [
    { index: '01', title: '사진을 보내주세요', desc: '제품·매장 사진, 로고, 패키지 이미지 등 가지고 계신 자료면 충분합니다.' },
    { index: '02', title: '장면을 설계합니다', desc: '브랜드의 분위기와 용도에 맞춰 장면과 카메라 움직임을 기획합니다.' },
    { index: '03', title: '광고 영상으로 완성', desc: 'AI로 제작한 영상을 확인하시고, 웹사이트·SNS 등에 바로 사용하세요.' },
  ],
  sampleLabel: '예시 · 가상 브랜드 SOOM (실제 고객 작업물 아님)',
  before: '보내주신 사진',
  after: 'AI 광고 영상',
  soundOn: '소리 켜기',
  soundOff: '소리 끄기',
  play: '재생',
  pause: '일시정지',
};

export const compare = {
  eyebrow: 'ORDINARY TEMPLATES VS. ARTISANAL CRAFTSMANSHIP',
  title: 'Ordinary vs. Artisanal',
  lead: '브랜드의 가치를 결정짓는 결정적 차이',
  labelBefore: '흔한 템플릿 (Before)',
  labelAfter: 'PAUSE 맞춤 디자인 (After)',
  cases: [
    {
      before: { title: '어디서 본 듯한 템플릿 구조', desc: '평범한 브랜드 이미지', kind: 'travel' },
      after: { title: '하이엔드 맞춤형 디자인', desc: '(관리자 기능으로 지정된 콘텐츠 직접 수정)', media: '/media/work/ref01', poster: '/media/work/ref01.jpg' },
    },
    {
      before: { title: '획일화된 구조, 뻔한 템플릿 디자인', desc: '어디서 본 듯한 쇼핑몰, 브랜드 매력 반감', kind: 'bakery' },
      after: { title: '브랜드 감성을 극대화한 독창적 인터랙션', desc: '(고객의 시선을 사로잡고 몰입시키는 디자인)', media: '/media/work/ref02', poster: '/media/work/ref02.jpg' },
    },
  ],
  beforeNote: '* 왼쪽은 흔한 템플릿 구성을 보여주기 위한 예시 화면이며, 특정 업체의 사이트가 아닙니다.',
};

export const fee = {
  eyebrow: 'MONTHLY FEE',
  title: ['PAUSE Studio', '기본 월 관리비 $0'],
  lead: '웹사이트를 만든 뒤 PAUSE Studio에 매달 내는 기본 관리비가 없습니다. 무엇이 무료이고 무엇이 별도인지, 숨김없이 알려드립니다.',
  freeTitle: '무료로 제공',
  free: ['웹사이트 유지보수(계약된 기존 기능의 오류 보수)', '웹사이트 관리비', '웹 호스팅(무상 제공 범위 안)', '기본적인 서버 문제 확인', '제공한 관리자 기능의 기본 사용 안내'],
  extraTitle: '별도 비용',
  extra: ['도메인 등록 및 갱신', '카드 결제 수수료', '유료 외부 플랫폼', '유료 API', '추가 서버 및 인프라 비용', '신규 페이지 제작', '신규 기능 개발', '대규모 디자인 변경', '전체 웹사이트 재설계', '지속적인 콘텐츠 등록 대행'],
  difference: '기존 기능이 정상적으로 동작하도록 보수하는 것과, 새로운 기능을 만들어 드리는 것은 다른 작업입니다. 추가 비용이 필요한 경우 미리 협의합니다.',
  scope: '웹 호스팅은 기본적으로 무료로 제공되며, 트래픽 및 서버 자원 사용량이 무상 제공 범위를 넘으면 호스팅 환경과 추가 비용을 별도로 협의합니다. 무제한 트래픽·무제한 저장공간·24시간 긴급 대응은 기본에 포함되지 않으며, ENTERPRISE의 복잡한 시스템 운영은 별도 계약 조건을 따릅니다.',
  calc: {
    title: '총비용 직접 계산해 보기',
    lead: '비교하고 싶은 견적이 있다면 직접 입력해 보세요. 임의의 업계 평균은 넣지 않았습니다.',
    otherLabel: '비교할 견적',
    pauseLabel: 'PAUSE Studio',
    setupLabel: '초기 제작비',
    monthlyLabel: '월 관리비',
    yearsLabel: '기간',
    product: 'STARTER(NZD 1,490, GST 포함) 기준',
    /** PAUSE 쪽 초기 제작비 = STARTER 견적가 */
    pauseSetup: 1490,
    totalLabel: '총비용',
    unit: '년',
    note: '도메인·결제 수수료 등 외부 서비스 비용은 양쪽 모두 별도로 발생할 수 있어 계산에서 제외했습니다.',
  },
  /** 사진 대신 글자로 보여주는 1년치 관리비 내역(사용자: 영수증 사진 사용 안 함, 2026-10-08) */
  ledger: {
    head: ['PAUSE STUDIO', 'BASIC MONTHLY FEE'],
    months: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'],
    totalLabel: '1년 합계',
    aria: 'PAUSE Studio 기본 월 관리비 — 1월부터 12월까지 매달 $0, 1년 합계 $0',
  },
};

export const process = {
  eyebrow: 'PROCESS',
  title: ['비전에서', '현실로'],
  subtitle: '프로젝트 진행 과정',
  steps: [
    { id: '01', title: '1:1 기획 및 상담', highlight: '핵심 가치 분석', desc: '단순한 제작 상담이 아닙니다. 사장님의 비즈니스 상황을 깊이 있게 이해하고, 가장 필요한 해결책을 함께 고민하는 진정성 있는 대화로 시작합니다.' },
    { id: '02', title: '투명한 안심 결제', highlight: '계약금 50% · 잔금 50%', desc: '상호 합의한 명확한 작업 범위로 견적을 확정한 뒤 계약금 50%로 제작을 시작하고, 최종 검수·승인 후 잔금 50%를 결제합니다. ENTERPRISE처럼 복잡한 프로젝트는 단계별 결제를 적용할 수 있습니다.' },
    { id: '03', title: '맞춤형 디자인 및 개발', highlight: '정교한 맞춤 개발', desc: '브랜드의 정수를 코드로 고스란히 담아냅니다. 사장님만의 유니크하고 강력한 웹사이트를 구축합니다.' },
    { id: '04', title: '꼼꼼한 검수 및 피드백', highlight: '정식 디자인 수정 2회', desc: '작은 디테일 하나도 놓치지 않습니다. 긴밀한 소통과 보완 작업으로 완성도를 높입니다. 제작 오류나 계약된 기능의 누락은 수정 횟수와 관계없이 바로잡습니다.' },
    { id: '05', title: '안전한 인계 및 완성', highlight: '기본 월 관리비 $0', desc: '지정된 콘텐츠를 직접 수정할 수 있는 관리자 기능과 함께, 계약된 자료와 인계 범위를 정리해 전달합니다. 이후 PAUSE Studio에 매달 내는 기본 관리비는 없습니다.' },
  ],
  closing: { kicker: '단순히 시키는 대로만 만들지 않습니다', quote: ['“사장님보다 더 ', '사장님', ' 같은 마음으로”'], statement: ['무엇이 ', '진짜 필요한지', ' 먼저 고민하고 제안합니다'] },
};

export type Plan = { key: string; name: string; type: string; price: string; target: string; featured?: boolean; addsTitle: string; adds: string[]; baseTitle?: string; base?: string[] };
export const pricing = {
  eyebrow: 'PRICING PLANS',
  title: '제작 비용',
  /** 사업 정책 §13·§20 확정 후킹 */
  banner: ['브랜드는 더 돋보이게.', '매달 관리비는 없게.'],
  /** 견적서 머리말 */
  bannerLead: '브랜드의 방향과 비즈니스 목표에 맞는 웹사이트를 제작합니다. 기획부터 디자인, 개발까지 모든 과정을 한 번에 진행합니다.',
  currency: 'NZD 기준 · GST 포함',
  targetLabel: '추천 대상',
  /** 견적서 STARTER · BUSINESS · ENTERPRISE — adds = 이 플랜만의 기능(위·강조) · base = 다른 플랜과 같은 기본 기능(아래·작게) */
  plans: [
    { key: 'starter', name: P.starter.name, type: P.starter.ko, price: P.starter.price, target: P.starter.target,
      addsTitle: '포함 기능', adds: P.starter.features },
    { key: 'business', name: P.business.name, type: P.business.ko, price: P.business.price, target: P.business.target, featured: true,
      addsTitle: 'BUSINESS만의 기능', adds: P.business.only, baseTitle: '기본 포함', base: P.business.base },
    { key: 'enterprise', name: P.enterprise.name, type: P.enterprise.ko, price: P.enterprise.price, target: P.enterprise.target,
      addsTitle: 'ENTERPRISE만의 기능', adds: P.enterprise.only, baseTitle: '기본 포함', base: P.enterprise.base },
  ] as Plan[],
  featuredBadge: '예약·주문·결제가 필요하다면',
  planCta: '이 플랜으로 상담하기',
  freeTitle: ['모든 플랜에 포함되는', '무료 혜택'],
  free: P.free,
  filmPlan: { name: 'AI 영상광고', price: '상담 후 견적', desc: '촬영 없이, 가지고 계신 사진만으로 만드는 브랜드 광고 영상 — 길이와 용도에 따라 견적을 드립니다.', cta: '영상광고 상담하기' },
  notesTitle: '추가 안내사항',
  notes: P.notes,
};

export const faq = {
  eyebrow: 'FAQ',
  title: ['궁금하신 점들을', '모았습니다.'],
  items: [
    { q: '정말 나중에 추가로 나가는 비용이 없나요?', a: '웹사이트 유지보수·관리비·웹 호스팅은 모든 플랜에 무료로 포함되어, PAUSE Studio에 매달 내는 관리비가 없습니다. 유지보수는 계약된 기존 기능이 정상적으로 동작하도록 보수하는 것입니다. 도메인 등록·갱신, 카드 결제 수수료, 유료 외부 플랫폼·API, 페이지 추가·신규 기능 개발처럼 별도 비용이 생길 수 있는 항목은 견적 단계에서 미리 안내해 드립니다.' },
    { q: '정말 제작비 한 번만 내면 되나요?', a: '네, 제작비는 계약금 50%와 잔금 50%로 한 번 결제하시면 됩니다. 웹 호스팅은 무상 제공 범위 안에서 무료로 제공되고, 텍스트나 사진 등 지정된 콘텐츠는 관리자 기능으로 직접 수정하실 수 있어 매달 관리비를 낼 필요가 없습니다.' },
    { q: '어떤 플랜을 골라야 하나요?', a: '브랜드와 서비스를 소개하고 고객 문의를 받는 웹사이트라면 STARTER, 제품·재고 관리와 예약·주문·온라인 결제까지 운영하려면 BUSINESS, AI 업무 자동화(AX)나 외부 시스템(ERP, POS, CRM 등) 연동이 필요하다면 ENTERPRISE가 맞습니다. 잘 모르시겠다면 상담을 통해 비즈니스에 맞는 최적의 구성을 제안드립니다.' },
    { q: '제작 기간은 얼마나 걸리나요?', a: '프로젝트 규모에 따라 다르며, 보통 2~6주 안에 진행됩니다.' },
    { q: '사이트 소유권은 누구에게 있나요?', a: '웹사이트는 대표님의 자산입니다. 대표님의 콘텐츠와 데이터, 계약된 제작 결과물에 대한 권리를 명확하게 안내하고, 필요한 경우 다른 개발자에게 운영을 맡길 수 있도록 인계 범위를 제공합니다. 공통 개발 코드·오픈소스·외부 플랫폼·유료 라이선스는 각 계약과 라이선스 조건을 따릅니다.' },
    { q: '나중에 다른 곳에 맡기거나 직접 관리하고 싶어지면요?', a: '도메인은 가능한 대표님 명의로 등록해 드리고, 다른 개발자에게 운영을 맡기실 수 있도록 계약된 자료를 인계해 드립니다. 물론 그럴 일이 없도록 끝까지 함께하겠습니다.' },
    { q: '만약 Pause Studio가 폐업하거나 서비스를 종료하면 어떻게 되나요?', a: '완성된 웹사이트의 콘텐츠와 데이터, 계약된 제작 결과물은 대표님의 자산이며, 인계 자료로 다른 개발자나 호스팅 업체를 통해 계속 운영하실 수 있습니다. (※ 무료 기술 보수는 당사가 서비스를 운영하는 기간에 한하며, 별도로 대가를 받지 않는 부가 서비스입니다.)' },
    { q: '디자인 수정은 몇 번까지 가능한가요?', a: '계약 범위 안에서 정식 디자인 수정 2회를 제공합니다. 여러 의견을 모아 전달해 주시는 한 번의 피드백을 수정 1회로 봅니다. PAUSE Studio의 제작 오류나 계약된 기능의 누락·오작동은 횟수와 관계없이 바로잡습니다. 승인한 디자인의 전면 변경, 신규 페이지·기능, 전체 구조 변경은 별도 비용입니다.' },
    { q: '미국에서도 의뢰할 수 있나요?', a: '네. Auckland를 기반으로 뉴질랜드와 미국 등 해외 한인 사장님들의 웹사이트를 제작합니다. 안내된 금액은 뉴질랜드 달러(NZD, GST 포함) 기준이며, 해외 사업장은 상담 후 청구 통화와 금액을 견적서에 명확히 안내해 드립니다.' },
    { q: '해외(뉴질랜드/미국 등)인데 소통에 문제가 없을까요?', a: '전혀 걱정하지 않으셔도 됩니다. 오클랜드 기반으로 운영되며 Zoom 비디오 미팅, 전화, 카카오톡, 이메일 등 사장님께 가장 편리한 소통 방식을 지원합니다. 모든 기획과 커뮤니케이션은 한국어로 명확하게 진행됩니다.' },
    { q: '다국어 사이트 제작도 가능한가요?', a: '네, 다국어 레이아웃과 서체를 고려해 디자인할 수 있습니다. 기본 가격은 한 가지 콘텐츠 언어 기준이며, 추가 언어 페이지 제작과 전문 번역, 원어민 검수는 범위에 따라 별도 견적으로 진행합니다.' },
    { q: '검색 엔진(SEO) 최적화도 포함되나요?', a: '네, 모든 플랜에 포함됩니다. STARTER와 BUSINESS는 구글 및 네이버에 잘 노출될 수 있도록 메타데이터, 사이트맵, 구조화 데이터 등 기본 SEO를 설정해 드리고, ENTERPRISE는 고급 SEO 설정이 포함됩니다.' },
    { q: '도메인과 호스팅은 어떻게 되나요?', a: '도메인은 가능한 대표님 명의로 등록하며, 도메인 등록·갱신 비용은 별도입니다. 웹 호스팅은 모든 플랜에 무료로 제공되며, 트래픽 및 서버 자원 사용량이 무상 제공 범위를 넘으면 호스팅 환경과 추가 비용을 별도로 협의합니다.' },
    { q: 'AI 영상광고는 어떻게 진행되나요?', a: '가지고 계신 제품·매장 사진과 이미지를 보내주시면, 촬영 없이 AI로 브랜드에 맞는 광고 영상을 만들어 드립니다. 영상의 길이와 용도(웹사이트, SNS 등)에 따라 상담 후 견적을 드립니다.' },
  ],
};

export const contactSection = {
  windowLabel: '비공개 1:1 상담실',
  status: '신규 프로젝트 상담 가능',
  title: ['매달 나가는 ', '웹사이트 관리비,', '스트레스에서 해방', '되세요.'],
  desc: ['현재 지출 중인 웹사이트 비용을 투명하게 진단하고,', ' 기본 월 관리비 없는 ', '자체 운영 방식', '으로의 전환 방안을 제안해 드립니다. 웹사이트와 AI 영상광고 상담 모두 가능합니다.'],
  channelsNote: ['시차와 거리에 구애받지 않고 ', 'Zoom 화상회의, 전화상담, 카카오톡, 이메일', ' 등 사장님께 가장 편안한 방식으로 긴밀하게 소통합니다.'],
  sms: { title: '문자 문의안내', label: '문자 상담 (뉴질랜드)', hint: '모바일에서 클릭 시 바로 문자 발송 가능' },
  kakao: { title: '카카오톡 문의안내', idLabel: '카카오톡 아이디', qrLabel: '카카오 QR 스캔', hint: '아이디 추가 후 문의하시거나 QR을 스캔해주세요.' },
  email: { title: '이메일', label: '이메일 주소 보기', hint: '견적·자료는 이메일로도 보내주실 수 있습니다.' },
};

/** 상담 신청 모달: 웹사이트 상담 + AI 영상광고 상담(사용자 요청 2026-10-08) */
export const consult = {
  title: '브랜딩 무료 상담 신청',
  steps: ['상담 종류', '기본 정보', '상세 내용', '확인'],
  types: [
    { value: '웹사이트 제작', label: '웹사이트 제작', desc: 'STARTER · BUSINESS — 브랜드 소개부터 예약·주문·결제까지' },
    { value: 'AI 영상광고', label: 'AI 영상광고', desc: '가지고 계신 사진으로 만드는 광고 영상' },
    { value: '웹사이트 + AI 영상광고', label: '둘 다 함께', desc: '웹사이트와 광고 영상을 같은 톤으로' },
    { value: 'AI 업무 자동화 · 맞춤 개발', label: 'AI 업무 자동화 · 맞춤 개발', desc: 'ENTERPRISE — AI 자동화(AX) · 외부 시스템 연동' },
  ],
  fields: {
    company: '회사 / 브랜드명', name: '성함', email: '이메일', phone: '연락처', country: '사업장 소재 국가', industry: '업종', currentSite: '기존 웹사이트 주소',
    countries: ['뉴질랜드', '미국', '기타'],
    product: '관심 있는 플랜', products: ['STARTER · 기본형', 'BUSINESS · 비즈니스형', 'ENTERPRISE · 기업형', '잘 모르겠어요'],
    needs: '필요한 페이지·기능', needOptions: ['회사·서비스 소개', '오시는 길', '갤러리·포트폴리오', '문의 폼·이메일 연동', '예약', '온라인 주문·결제', '제품·재고 관리', '회원·고객 관리', '추가 언어 페이지', '관리자 기능'],
    itemCount: '페이지·상품 수(대략)', bookingPay: '사용 중인 예약·결제 서비스', integrations: '추가 연동이 필요한 시스템',
    videoUse: '영상을 쓸 곳', videoUses: ['웹사이트', 'SNS 광고', '매장 모니터', '기타'],
    videoLength: '원하는 길이', videoLengths: ['15초 이하', '30초 안팎', '1분 안팎', '상담 후 결정'],
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
    '법적 고지: Pause Studio는 전문적인 웹 디자인 및 개발 서비스를 제공합니다. 특정 비즈니스 결과, 트래픽 또는 수익을 보장하지 않습니다. 웹사이트가 배포된 이후에는 모든 판매가 확정되며 환불이 불가합니다.',
    '무료 기술 보수는 회사가 서비스를 운영하는 기간에 한하며, 이는 별도로 대가를 받지 않는 부가 서비스입니다. 서비스 종료 시에도 고객의 콘텐츠와 데이터, 계약된 제작 결과물에 대한 권리와 인계 범위는 영향받지 않습니다.',
  ],
  copyright: '© 2026 PAUSE STUDIO. All Rights Reserved.',
};
