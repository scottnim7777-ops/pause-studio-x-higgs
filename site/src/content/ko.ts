/**
 * PAUSE STUDIO 사이트 문구(한국어) — 한 곳에서 관리
 * 기준: 기존 사이트 원문(content/site-content.ko.json) + 사업 정책(docs/BUSINESS_POLICY_2026-10.md)
 *       + 원문 대조표(docs/CONTENT_POLICY_AUDIT.md) + 32차 히어로(사용자 확정 문구)
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
    { index: '01', name: '웹사이트 제작', lead: '제작비는 한 번, 기본 월 관리비는 $0*', desc: '기본 호스팅·오류 보수까지 무료' },
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
    { title: '기본 월 관리비 $0', desc: '제작 후 PAUSE Studio에 매달 내는 기본 관리비가 없습니다. 기본 호스팅과 기존 기능의 기술적 오류 보수도 무료입니다.' },
    { title: '대표 직접 제작', desc: '상담부터 디자인, 개발, 최종 검수까지 대표가 직접 참여합니다. 담당자가 바뀌거나 하청으로 넘어가지 않습니다.' },
    { title: '직접 관리하는 웹사이트', desc: '블로그나 인스타그램처럼 쉽습니다. 지정된 텍스트, 이미지, 메뉴와 가격을 직접 수정하세요.' },
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

/** tone: key = 이 상품만의 핵심(강조, 맨 위) · base = 아래 상품에 이미 있는 기본(작게, 강조 없이) */
export type Group = { title: string; items: string[]; tone?: 'key' | 'base' };
export type Service = {
  key: string; index: string; name: string; ko: string; price: string; priceNote?: string;
  headline: string; purpose: string; groups: Group[]; footnotes?: string[];
};

export const services = {
  eyebrow: 'CHAPTER 02',
  title: ['필요한 만큼,', '우리 비즈니스에 맞게.'],
  lead: '소개가 필요한지, 주문·결제가 필요한지, 운영을 자동화해야 하는지에 따라 고르시면 됩니다. 식당도 별도 패키지 없이 필요한 기능을 기준으로 선택합니다.',
  items: [
    {
      key: 'website', index: '01', name: 'WEBSITE', ko: '웹사이트', price: '$1,990',
      headline: '브랜드 소개와 고객 문의를 위한 웹사이트',
      purpose: '기업이나 매장을 소개하고, 고객이 정보를 확인하거나 문의할 수 있도록 하는 웹사이트입니다. 회사 소개, 매장 소개, 메뉴판, 포트폴리오, 서비스 안내 등을 제공합니다.',
      groups: [
        { title: '기본 제공', items: ['브랜드 맞춤형 디자인', '일반 콘텐츠 페이지 최대 5개', 'PC·태블릿·모바일 반응형', '회사·매장 및 서비스 소개', '갤러리·포트폴리오', '기본 문의 폼 1개', '구글 지도 연결', '전화·이메일·카카오톡 버튼', '기존 외부 예약 서비스 링크', '기본 검색엔진 최적화(SEO)', '지정된 콘텐츠를 직접 수정하는 관리자 기능', '식당 메뉴판이 필요한 경우 메뉴 최대 20개 등록', '기본 이미지 최적화 5장', '정식 디자인 수정 2회', '기본 호스팅 무료', '기존 기능의 기술적 오류 보수 무료', 'PAUSE Studio 월 관리비 $0'] },
        { title: '포함되지 않는 기능', items: ['온라인 장바구니', '주문 관리 시스템', '복잡한 카드 결제', '자체 예약 시스템', '회원·포인트 시스템', 'POS 및 주방 시스템 연동'] },
      ],
      footnotes: ['포함되지 않는 기능은 ONLINE STORE 또는 ENTERPRISE에서 제공합니다.', '기본 가격은 한 가지 콘텐츠 언어 기준이며, 추가 언어 페이지·전문 번역·원어민 검수는 별도 견적입니다.', '관리자 기능은 계약에서 지정한 콘텐츠를 직접 수정하는 기능입니다.'],
    },
    {
      key: 'store', index: '02', name: 'ONLINE STORE', ko: '온라인 스토어', price: '$4,490', priceNote: '부터',
      headline: '온라인 주문과 결제를 받는 웹사이트',
      purpose: '고객이 상품이나 음식을 직접 선택하고 온라인으로 주문·결제할 수 있는 웹사이트입니다. 일반 쇼핑몰과 식당 온라인 주문 웹사이트를 하나의 상품으로 통합했습니다.',
      groups: [
        { title: 'WEBSITE에 더해지는 핵심 기능', tone: 'key', items: ['온라인 주문 접수', '장바구니 및 카드 결제', '주문 내역·상태 관리', '상품·메뉴 직접 수정', '기본 주문 알림'] },
        { title: 'ONLINE STORE 기본 범위', items: ['상품·메뉴 최대 20개 등록', '상품명 및 가격 직접 수정', '상품 목록 및 상세 화면', '주문 완료 화면', '주문 이메일 알림', '표준 결제 서비스 1개 연동', '단일 매장 운영 · 기본 주문 처리 방식 1개'] },
        { title: '별도 견적', items: ['주방 디스플레이(KDS)', '주문 프린터 자동 출력', 'POS 시스템 연동', '복잡한 재고 관리', '다중 매장 운영', '고급 회원 등급 및 포인트', '복잡한 상품·메뉴 옵션', '특수 배송비 계산', '외부 ERP·CRM 연동'] },
        { title: 'WEBSITE 기본 제공 사항은 그대로 포함', tone: 'base', items: ['WEBSITE의 기본 디자인 및 소개 기능', '일반 콘텐츠 페이지 최대 5개', '관리자 기능', '기본 호스팅', '기존 기능 기술적 오류 보수', 'PAUSE Studio 월 관리비 $0'] },
      ],
      footnotes: ['$4,490부터는 표준 주문·결제 기능을 구현하는 기본 상품의 시작 가격입니다.', '기본 범위: 한 개의 사업장 · 하나의 판매 통화 · 표준 결제대행사 한 곳 · 단순한 픽업 또는 표준 배송.', '외부 결제대행사 수수료나 필수 플랫폼 이용료는 별도로 발생할 수 있습니다.'],
    },
    {
      key: 'enterprise', index: '03', name: 'ENTERPRISE', ko: '엔터프라이즈', price: '맞춤 견적',
      headline: 'AI 기반 업무 자동화(AX)부터 비즈니스 전용 시스템 구축까지.',
      purpose: '반복되는 업무는 줄이고, 복잡한 운영은 더 간편하게. PAUSE Studio는 비즈니스의 실제 업무 흐름을 분석하고, AI와 자동화 기술을 활용해 필요한 시스템을 맞춤 설계·개발합니다. 단순한 웹사이트를 넘어, 비즈니스가 더 효율적으로 운영될 수 있는 디지털 환경을 만듭니다.',
      groups: [
        { title: 'AI 기반 업무 자동화(AX)', tone: 'key', items: ['AI 고객 상담', '고객 문의 자동 분류', '이메일 응대 초안 작성', '견적서 작성 자동화', '인보이스 및 문서 처리', '예약·문의 정보 자동 등록', '반복적인 데이터 입력 자동화', '업무 알림 및 보고 자동화'] },
        { title: '비즈니스 운영 시스템', items: ['고객 관리', '예약 관리', '주문 관리', '제품·재고 관리', '직원 및 업무 관리', '회원 관리', '맞춤형 관리자 시스템'] },
        { title: '외부 시스템 연동', items: ['POS', 'CRM', 'ERP', '결제 시스템', '이메일', '외부 API', '예약·주문 플랫폼'] },
        { title: '데이터 분석 및 대시보드', items: ['매출 현황', '주문 현황', '고객 통계', '재고 상태', '예약 현황', '업무 처리 현황', '운영 리포트'] },
        { title: '맞춤형 웹 애플리케이션', items: ['복잡한 예약 시스템', '회원 등급 및 포인트', '주방 디스플레이(KDS)', '주문 프린터 연동', '다중 매장 관리', '기업 전용 웹 프로그램'] },
      ],
      footnotes: ['필요한 기능만, 우리 비즈니스에 맞게. 실제 업무 방식과 해결하고 싶은 문제를 먼저 확인한 뒤, 필요한 기능과 개발 범위를 제안합니다.', '고정 가격은 없으며, 상담 후 업무 범위와 개발 난이도를 확인해 견적을 결정합니다.', 'AI 모델 이용료, 외부 API, 유료 플랫폼, 서버 및 시스템 운영비가 발생할 수 있습니다. 중요한 AI 자동화에는 사람의 검토·승인 절차가 필요할 수 있습니다.'],
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
  basics: {
    title: '모든 웹사이트에 기본으로',
    items: [
      { title: '맞춤 디자인', desc: '템플릿 없이, 브랜드에 맞춰 화면을 처음부터 설계합니다.' },
      { title: '반응형', desc: '모바일, 태블릿, 데스크톱 모든 환경에서 동일한 완성도를 유지합니다.' },
      { title: '기본 SEO', desc: '사이트맵, 메타데이터, 구조화 데이터까지 정돈해 드립니다.' },
      { title: '기본 호스팅 무료', desc: '일반적인 소규모 웹사이트 운영 범위 기준입니다. 대규모 사이트는 별도 비용이 발생할 수 있습니다.' },
      { title: '관리자 기능', tag: 'SELF MANAGEMENT', desc: '블로그나 인스타그램처럼 쉽습니다. 지정된 텍스트, 이미지, 상품을 직접 수정할 수 있습니다.' },
      { title: '정식 디자인 수정 2회', desc: '여러 의견을 모아 주시는 한 번의 피드백을 수정 1회로 봅니다. 제작 오류나 계약 기능의 누락은 횟수에 포함되지 않습니다.' },
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
  free: ['기본 호스팅', '계약된 기존 기능의 기술적 오류 보수', '기본적인 서버 문제 확인', '제공한 관리자 기능의 기본 사용 안내'],
  extraTitle: '별도 비용',
  extra: ['도메인 등록 및 갱신', '카드 결제 수수료', '유료 외부 플랫폼', '유료 API', '추가 서버 및 인프라 비용', '신규 페이지 제작', '신규 기능 개발', '대규모 디자인 변경', '전체 웹사이트 재설계', '지속적인 콘텐츠 등록 대행'],
  difference: '기존 기능이 정상적으로 동작하도록 보수하는 것과, 새로운 기능을 만들어 드리는 것은 다른 작업입니다. 추가 비용이 필요한 경우 미리 협의합니다.',
  scope: '기본 호스팅은 일반적인 소규모 웹사이트 운영 범위를 기준으로 하며, 무제한 트래픽·무제한 저장공간·24시간 긴급 대응은 기본에 포함되지 않습니다. ENTERPRISE의 복잡한 시스템 운영은 별도 계약 조건을 따릅니다.',
  calc: {
    title: '총비용 직접 계산해 보기',
    lead: '비교하고 싶은 견적이 있다면 직접 입력해 보세요. 임의의 업계 평균은 넣지 않았습니다.',
    otherLabel: '비교할 견적',
    pauseLabel: 'PAUSE Studio',
    setupLabel: '초기 제작비',
    monthlyLabel: '월 관리비',
    yearsLabel: '기간',
    product: 'WEBSITE $1,990 기준',
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

export type Plan = { key: string; name: string; type: string; price: string; priceNote: string; featured?: boolean; addsTitle: string; adds: string[]; scope?: string; baseTitle?: string; base?: string[] };
export const pricing = {
  eyebrow: 'PRICING PLANS',
  title: '제작 비용',
  /** 사업 정책 §13·§20 확정 후킹 */
  banner: ['브랜드는 더 돋보이게.', '매달 관리비는 없게.'],
  bannerLead: '우리 비즈니스만의 분위기를 담은 맞춤형 웹사이트. 디자인부터 개발까지 PAUSE Studio 대표가 직접 함께합니다.',
  currency: '뉴질랜드 사업장: NZD / 미국 및 기타 지역: USD',
  currencyNote: '모든 방문자에게 같은 가격 숫자를 안내하며, 실제 청구 통화는 접속 위치가 아닌 사업장 소재 국가를 기준으로 견적서에 명확히 기재합니다.',
  /** adds = 이 상품의 핵심(위·강조) · scope = 기본 범위 · base = 아래 상품에서 그대로 이어지는 것(아래·작게) */
  plans: [
    { key: 'website', name: 'WEBSITE', type: '브랜드 소개와 고객 문의', price: '$1,990', priceNote: '',
      addsTitle: '기본 제공',
      adds: ['브랜드 맞춤형 디자인 · 페이지 최대 5개', '반응형 · 기본 SEO · 문의 폼 · 구글 지도', '전화·이메일·카카오톡 버튼 · 외부 예약 링크', '지정된 콘텐츠를 직접 수정하는 관리자 기능', '정식 디자인 수정 2회', '기본 호스팅 · 오류 보수 무료', 'PAUSE Studio 월 관리비 $0'] },
    { key: 'store', name: 'ONLINE STORE', type: '온라인 주문과 결제', price: '$4,490', priceNote: '부터', featured: true,
      addsTitle: 'WEBSITE에 더해지는 기능',
      adds: ['온라인 주문 접수', '장바구니 · 온라인 카드 결제', '주문 내역·상태 관리', '상품·메뉴 직접 수정(최대 20개)', '주문 이메일 알림'],
      scope: '표준 결제 서비스 1개 · 단일 매장 · 기본 주문 처리 방식 1개',
      baseTitle: 'WEBSITE 기본 제공 사항 모두 포함',
      base: ['브랜드 맞춤형 디자인', '페이지 최대 5개', '반응형 · 기본 SEO', '관리자 기능', '정식 디자인 수정 2회', '기본 호스팅 · 오류 보수 무료', '월 관리비 $0'] },
    { key: 'enterprise', name: 'ENTERPRISE', type: 'AI 업무 자동화 · 맞춤 개발', price: '맞춤 견적', priceNote: '',
      addsTitle: '맞춤 개발 범위',
      adds: ['AI 기반 업무 자동화(AX)', '고객·예약·주문·재고 등 운영 시스템', 'POS · CRM · ERP · 외부 API 연동', '데이터 분석 및 대시보드', '맞춤형 웹 애플리케이션'],
      baseTitle: '진행 방식',
      base: ['상담 후 범위·난이도에 따라 견적', 'AI·API·서버 이용료 별도', '운영 조건은 별도 계약'] },
  ] as Plan[],
  filmPlan: { name: 'AI 영상광고', price: '상담 후 견적', desc: '촬영 없이, 가지고 계신 사진만으로 만드는 브랜드 광고 영상 — 길이와 용도에 따라 견적을 드립니다.' },
  featuredBadge: '주문·결제가 필요하다면',
  planCta: '이 상품으로 상담하기',
  terms: [
    { title: '결제', desc: '계약금 50% · 최종 검수 후 잔금 50%' },
    { title: '수정', desc: '계약 범위 내 정식 디자인 수정 2회' },
    { title: '관리비', desc: 'PAUSE Studio 기본 월 관리비 $0' },
    { title: '외부 비용', desc: '도메인·결제 수수료·유료 플랫폼 등은 별도' },
  ],
  restaurant: {
    title: '식당 웹사이트는요?',
    desc: '식당이라는 이유만으로 별도 가격을 적용하지 않습니다. 필요한 기능을 기준으로 고르시면 됩니다.',
    rows: [
      ['소개 · 메뉴판 · 영업시간 · 예약 링크', 'WEBSITE $1,990'],
      ['음식 온라인 주문 · 카드 결제', 'ONLINE STORE $4,490부터'],
      ['주방 모니터 · 주문표 자동 출력 · POS 연동', 'ENTERPRISE 맞춤 개발'],
    ],
  },
};

export const faq = {
  eyebrow: 'FAQ',
  title: ['궁금하신 점들을', '모았습니다.'],
  items: [
    { q: '정말 나중에 추가로 나가는 비용이 없나요?', a: 'PAUSE Studio에 매달 내는 기본 관리비는 없습니다. 기본 호스팅과 기존 기능의 기술적 오류 보수도 무료입니다. 다만 도메인 등록·갱신, 카드 결제 수수료, 유료 외부 플랫폼·API, 신규 페이지·기능 개발처럼 별도 비용이 생길 수 있는 항목은 견적 단계에서 미리 안내해 드립니다.' },
    { q: '정말 제작비 한 번만 내면 되나요?', a: '네, 제작비는 계약금 50%와 잔금 50%로 한 번 결제하시면 됩니다. 기본 호스팅은 일반적인 소규모 사이트 운영 범위에서 무료로 제공되고, 텍스트나 사진 등 지정된 콘텐츠는 관리자 기능으로 직접 수정하실 수 있어 매달 관리비를 낼 필요가 없습니다.' },
    { q: '사이트 소유권은 누구에게 있나요?', a: '웹사이트는 대표님의 자산입니다. 대표님의 콘텐츠와 데이터, 계약된 제작 결과물에 대한 권리를 명확하게 안내하고, 필요한 경우 다른 개발자에게 운영을 맡길 수 있도록 인계 범위를 제공합니다. 공통 개발 코드·오픈소스·외부 플랫폼·유료 라이선스는 각 계약과 라이선스 조건을 따릅니다.' },
    { q: '나중에 다른 곳에 맡기거나 직접 관리하고 싶어지면요?', a: '도메인은 가능한 대표님 명의로 등록해 드리고, 다른 개발자에게 운영을 맡기실 수 있도록 계약된 자료를 인계해 드립니다. 물론 그럴 일이 없도록 끝까지 함께하겠습니다.' },
    { q: '만약 Pause Studio가 폐업하거나 서비스를 종료하면 어떻게 되나요?', a: '완성된 웹사이트의 콘텐츠와 데이터, 계약된 제작 결과물은 대표님의 자산이며, 인계 자료로 다른 개발자나 호스팅 업체를 통해 계속 운영하실 수 있습니다. (※ 무료 기술 보수는 당사가 서비스를 운영하는 기간에 한하며, 별도로 대가를 받지 않는 부가 서비스입니다.)' },
    { q: '디자인 수정은 몇 번까지 가능한가요?', a: '계약 범위 안에서 정식 디자인 수정 2회를 제공합니다. 여러 의견을 모아 전달해 주시는 한 번의 피드백을 수정 1회로 봅니다. PAUSE Studio의 제작 오류나 계약된 기능의 누락·오작동은 횟수와 관계없이 바로잡습니다. 승인한 디자인의 전면 변경, 신규 페이지·기능, 전체 구조 변경은 별도 비용입니다.' },
    { q: '미국에서도 의뢰할 수 있나요?', a: '네, 맞습니다. Auckland를 기반으로 뉴질랜드와 미국 등 해외 한국인 사장님들의 웹사이트를 제작합니다. 가격은 같은 숫자로 안내하며, 뉴질랜드 사업장은 NZD, 미국 및 기타 지역은 USD로 청구합니다.' },
    { q: '해외(뉴질랜드/미국 등)인데 소통에 문제가 없을까요?', a: '전혀 걱정하지 않으셔도 됩니다. 오클랜드 기반으로 운영되며 Zoom 비디오 미팅, 전화, 카카오톡, 이메일 등 사장님께 가장 편리한 소통 방식을 지원합니다. 모든 기획과 커뮤니케이션은 한국어로 명확하게 진행됩니다.' },
    { q: '다국어 사이트 제작도 가능한가요?', a: '네, 다국어 레이아웃과 서체를 고려해 디자인할 수 있습니다. 기본 가격은 한 가지 콘텐츠 언어 기준이며, 추가 언어 페이지 제작과 전문 번역, 원어민 검수는 범위에 따라 별도 견적으로 진행합니다.' },
    { q: '검색 엔진(SEO) 최적화도 포함되나요?', a: '네, 구글 및 네이버에 잘 노출될 수 있도록 메타데이터, 사이트맵, 구조화 데이터 등 기본 검색엔진 최적화를 세팅해 드립니다.' },
    { q: '도메인과 호스팅은 어떻게 되나요?', a: '도메인은 가능한 대표님 명의로 등록하며, 도메인 등록·갱신 비용은 별도입니다. 기본 호스팅은 PAUSE Studio가 무료로 제공하며 일반적인 소규모 웹사이트 운영 범위를 기준으로 합니다. (대규모 사이트는 별도 플랫폼 이용료가 발생할 수 있습니다.)' },
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
    { value: '웹사이트 제작', label: '웹사이트 제작', desc: '소개용 웹사이트 또는 온라인 주문·결제 스토어' },
    { value: 'AI 영상광고', label: 'AI 영상광고', desc: '가지고 계신 사진으로 만드는 광고 영상' },
    { value: '웹사이트 + AI 영상광고', label: '둘 다 함께', desc: '웹사이트와 광고 영상을 같은 톤으로' },
    { value: 'AI 업무 자동화 · 맞춤 개발', label: 'AI 업무 자동화 · 맞춤 개발', desc: 'ENTERPRISE — 운영 시스템·외부 연동' },
  ],
  fields: {
    company: '회사 / 브랜드명', name: '성함', email: '이메일', phone: '연락처', country: '사업장 소재 국가', industry: '업종', currentSite: '기존 웹사이트 주소',
    countries: ['뉴질랜드', '미국', '기타'],
    product: '필요한 웹사이트', products: ['WEBSITE · 소개와 문의', 'ONLINE STORE · 주문과 결제', '잘 모르겠어요'],
    needs: '필요한 페이지·기능', needOptions: ['회사·매장 소개', '메뉴판', '갤러리·포트폴리오', '문의 폼', '외부 예약 링크', '온라인 주문·결제', '추가 언어 페이지', '관리자 기능'],
    itemCount: '메뉴·상품 수량(대략)', bookingPay: '사용 중인 예약·결제 서비스', integrations: '추가 연동이 필요한 시스템',
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
