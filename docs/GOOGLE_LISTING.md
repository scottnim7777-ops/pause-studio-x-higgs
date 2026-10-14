# 구글 검색·구글 지도 노출 (2026-10-14)

## 코드로 해 둔 것 (사이트)
- 한국어 `/` · 영어 `/en` 각각 제목·설명·검색어(웹사이트 제작, 홈페이지 제작, AI 광고영상, Korean web design agency, AI video ads, 지역명 LA·뉴욕·오클랜드 등), hreflang, canonical, sitemap.xml(두 주소 모두), robots.txt.
- 구조화 데이터(JSON-LD): ProfessionalService(회사명·주소·전화·메일·서비스 4가지·서비스 지역 US/NZ·언어·hasMap·knowsAbout·contactPoint), WebSite, FAQPage.
- 검색 로봇은 언어 자동 이동에서 제외(한국어 페이지 색인 보호).

## 코드로 할 수 없는 것 (주인이 직접, 본인 인증이 필요)
1. **구글 비즈니스 프로필**(구글 지도에 뜨는 것의 전부): 사업자 계정으로 만들고 우편·전화·영상 중 하나로 인증해야 지도에 나옴. 인증은 코드·대리인이 할 수 없음.
2. **구글 서치 콘솔**: sitemap.xml 제출 + 첫 화면 색인 요청(색인에는 보통 며칠~몇 주).
3. (한국어 검색) **네이버 서치어드바이저**: 사이트 등록 + 사이트맵 제출. 소유 확인 메타 태그 값을 받으면 `site/src/content/ko.ts meta`에 넣고 head에 출력하도록 요청.
4. (선택) Bing Places.

## 구글 비즈니스 프로필 입력값
- 이름: PAUSE Studio (퍼즈 스튜디오는 설명에)
- 주 업종: Website designer / 추가: Video production service, Marketing agency, Graphic designer
- 주소: 75 Victoria Street West, Auckland CBD 1010, New Zealand (손님이 찾아오는 곳이 아니면 '서비스 지역 비즈니스'로 두고 주소 숨김)
- 서비스 지역: New Zealand, United States (한인이 많은 도시: Los Angeles, New York, Auckland 등)
- 웹사이트: https://pause8studio.com · 전화 +64 20 488 7198
- 소개 글(영어 750자 이내): "PAUSE Studio is a bilingual branding studio in Auckland. The founder personally builds custom websites and AI video ads for Korean businesses in New Zealand and the United States. Pay once, with a basic monthly fee of $0."
- 사진: 로고(icon-512.png), 포트폴리오 화면(site/public/media/work/*-1920.jpg)
