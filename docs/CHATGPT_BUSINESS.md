# ChatGPT Business Hub 등록 (2026-11-27 시작)

목표: ChatGPT에서 미국·뉴질랜드·한국 고객이 "웹사이트/광고영상 만들어 줄 곳"을 물을 때 PAUSE Studio가 추천되고, 바로 문의(WhatsApp·폼·이메일)로 이어지게.

## 진행 상황
- [x] Business Hub(https://chatgpt.com/business-hub)에서 기존 목록 "Pause Studio, 75 Victoria Street West" 찾음 → 소유권 주장 시작(계정 scottnim7777@gmail.com)
- [x] 인증 방법: 웹사이트 도메인(DNS TXT). 이름 `openai-business-claim`, 값은 Business Hub 화면에서 확인(만료 2026-11-28 19:48 NZ, 지나면 새로 발급)
- [x] Cloudflare DNS에 TXT 2개 추가(2026-11-28; 첫 코드는 scottnim7777 계정용, 이후 ChatGPT 로그인이 cosmic0602021@gmail.com으로 바뀌어 새 코드 추가) → 도메인 인증 통과, 소유권 신청 접수(심사 결과는 cosmic0602021@gmail.com 이메일로)
- [x] Persona 본인 인증 제출(2026-11-28): 신분증 통과 후 사업 서류는 공개 NZBN 화면·스크린샷은 거절, MyNZBN 로그인 상세 화면 PDF(대표 권한·사무실 주소 포함)로 통과해 'Application in review'. 결과는 Business Hub 조직 설정에 며칠 내 표시
- [ ] Persona 승인 대기
- [ ] 아래 프로필 문구 입력, 로고·커버 업로드
- [ ] 온라인 서비스 업체로 별도 목록 추가 가능한지 정책 확인(오클랜드 지역 한정을 벗어나려면 핵심)
- [ ] 비즈니스 에이전트 만들기(견적·상담 안내)
- [x] 사이트: llms.txt, robots.txt(OAI-SearchBot·ChatGPT-User·Bingbot 허용), 서비스 지역에 한국 추가, IndexNow 키 파일 — 2026-11-28 배포 완료(llms.txt·robots·IndexNow 키 200). IndexNow로 6개 URL 전송(202)
- [x] IndexNow 전송 완료
- [ ] Bing 웹마스터 도구 등록(ChatGPT 검색은 Bing 결과를 많이 씀)

## 고객이 실제로 묻는 말(이 표현들이 프로필·사이트에 들어가야 함)
미국: "small business website designer no monthly fee", "Wix/Squarespace alternative without subscription", "web designer for my restaurant/salon/clinic in LA", "Korean-speaking web designer in Los Angeles/New York/Atlanta", "website with online booking and payments", "AI video ad for Instagram Reels from product photos"
뉴질랜드: "web design Auckland", "affordable website for small business NZ", "Korean web designer Auckland"
한국어: "미국 한인 홈페이지 제작", "뉴질랜드 한인 웹사이트 제작", "월 관리비 없는 홈페이지", "AI 광고영상 제작 업체 추천"

## 프로필 문구(인증 후 그대로 입력)
- 표시 이름: PAUSE Studio
- 카테고리: Web design / Marketing & advertising (온라인 서비스)
- 웹사이트: https://pause8studio.com/en
- 소개(영어):
  Custom websites and AI video ads for small businesses, built personally by the founder. Pay once for the build with a $0 basic monthly fee: maintenance and hosting are included. We work remotely with businesses across the United States, New Zealand and South Korea, in English or Korean, with calls scheduled around your time zone. Websites from $1,990 (bookings, ordering and payments from $4,490). AI video ads for Reels, TikTok and YouTube from $490. Free consultation on WhatsApp +64 20 488 7198 or at pause8studio.com/en#contact.
- 소개(한국어, 필드가 있으면):
  대표가 직접 만드는 브랜드 맞춤 웹사이트와 AI 광고영상. 제작비는 한 번, 기본 월 관리비 $0. 미국·뉴질랜드·한국 어디서나 원격으로 진행하고, 한국어로 상담합니다. 카카오톡 상담: open.kakao.com/o/s58WfSEi
- 연락처: info@pause8studio.com / +64 20 488 7198

## 2026-11-28 프로필 입력 완료 (Persona 승인 후, cosmic0602021@gmail.com 계정)
- 카테고리: 웹 디자이너(+광고 대행사·마케팅 대행사가 함께 저장됨). 소개문 266자(300자 제한) 입력.
- 웹사이트 pause8studio.com/en: Cloudflare에 `openai-business-profile` TXT 추가 후 인증 완료. 이메일 info@pause8studio.com: 코드 인증 완료(info@ 메일은 scottnim7777 받은편지함으로 전달됨).
- 사진 4장(로고 정사각형 + 포트폴리오 3): 저장은 3장 이상일 때만 됨. 로고 이미지 drafts/v36/chatgpt-profile-square.jpg.
- 영업시간은 정해진 값이 없어 비워 둠. 위치는 기존 주소 유지.
- 에이전트 빌더: '아직 사용할 수 없음(순차 제공)'. 열리면 게시.
- 온라인 서비스 별도 등록('만들기'): 중복 프로필 위험이 있어 제출하지 않음. 사장님 결정 대기.
- Cloudflare DNS TXT 3개(openai-business-claim 2개, openai-business-profile 1개) 남아 있음.

## 2026-11-28 추가 작업
- Bing 웹마스터 도구: scottnim7777 Google 로그인, 사이트 인증은 meta 태그(msvalidate.01, src/render/page.ts) 배포로 완료, 사이트맵 제출. IndexNow 키 0d960fe3065243fc9b82c742a9ca69fe로 13개 URL 전송(200). Cloudflare DNS CNAME 인증은 권한으로 막혀 meta 방식으로 대체(Cloudflare에 미저장 입력창은 닫음).
- 미국 도시 페이지 10곳 추가(총 13): 시카고·휴스턴·댈러스·샌프란시스코·시애틀·샌디에이고·마이애미·보스턴·오스틴·워싱턴DC. scripts/render-cities.ts, vite.config.ts(입력 추가 필수), /en 푸터, sitemap.xml, llms.txt. 영어 페이지 원칙(한인 언급 없음·미국 주소 안 만듦·화면 글에 하이픈·줄표 없음) 유지.
- 남은 일: Clutch·DesignRush 등 외부 등록(docs/DIRECTORY_COPY.md, 가입·본인 확인 필요), 미국 고객 후기, 에이전트 빌더 열리면 게시, 영업시간 값 결정, 성과는 Business Hub 인사이트와 Bing 웹마스터에서 확인.
