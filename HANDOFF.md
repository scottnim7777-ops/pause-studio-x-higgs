# 인수인계 (2026-10-10, 9차 작업 중단 지점)

새 Claude Code 세션은 이 파일부터 읽고 이어서 진행. 브랜치: `claude/charming-euler-bt8uf2`.
기존 규칙은 docs/STATE.md · docs/DESIGN_SYSTEM.md 참고(API 키 출력 금지, 공개 저장소, 가상 브랜드 표기, PR 만들지 않기, docs/BUSINESS_POLICY_2026-10.md 수정 금지).

## 9차 사용자 요청과 진행 상태
1. WEBSITE 장 제목 코드 효과 — 완료(타이핑 <h2> → Times → 제목 글꼴 → 검사기 상자). `.cw`(page.ts codeWord, main.css, ui.ts initCodeWord)
2. 흔한 템플릿 VS 맞춤 디자인 — 완료(3줄 대결 카드, VS 동그라미+선, 광학 정렬)
3. BEFORE/AFTER 중복 — 완료(아래 설명은 화살표만)
4. $0 높낮이 — 완료(top .1em, 측정으로 바닥 맞춤)
5. 전체 글자 점검 — 일부(제목 글꼴 word-spacing .09em). 남음: 1440/390 전 섹션 줄바꿈·고아줄 점검, 모바일 장 제목 크기 키우기
6. 선언문 효과 — 완료(보일 때마다 다시 타이핑, ui.ts initScrub)
7. '해방되세요' — 완료(빨간 펜: 관리비 줄긋기 + 밑줄, ui.ts initPen)
8. 헤더·푸터 로고 모션 — 완료(‖ 막대 → 고리 → 글씨 → 점, initLogo)
9. AI 광고영상 4편(서로 다른 감독 스타일) — tools/adv31/
   - pause.py(자체 광고, 로고를 투사·모니터·형압 명함에) 완료 → site/public/media/film/pause.mp4
   - mireille.py(파스텔 타블로, 빈 쟁반=v31-b3-empty Nano Banana) 완료
   - soom.py(검은 공간 미니멀) 완료
   - bam.py 재렌더·finish.py 완료(2026-10-10). 렌더 전 `bash tools/fetch-fonts.sh` 필요(Windows는 SUIT ttf 변환을 python으로 직접)
   - 예전 ondo/route/daon/before-1200 파일 삭제 완료
   - 파이썬 패키지: numpy opencv-python pillow scipy fonttools brotli onnxruntime
10. 마무리 완료(2026-10-10): 점검 165/165, 접근성 위반 0, 미리보기 17판. 이전 메모 — tests/smoke.cjs 갱신(film 탭 키 ondo/daon → mireille/bam, 새 효과 검사), a11y, docs(STATE·DESIGN_SYSTEM·README·CONTENT_MAP·higgsfield/COSTS.md: v31 스틸 21×0.12 + Nano Banana 2 크레딧, Kling $0.21), 미리보기 아티팩트 16판, 커밋·푸시, 한국어 보고
- Higgsfield 크레딧: 남은 약 5.6 (사용자: 남은 예산 모두 써도 됨, 추가 충전 없음)

## 10차 사용자 피드백(2026-10-10) — 9개 모두 완료(자세한 모양은 docs/DESIGN_SYSTEM.md 7장 '열 번째 피드백')
1. 헤더·푸터 로고 모션: 멈춤 모양(‖) 빼기. 'PAUSE Studio' 글씨가 나타나는 방식이 성의 없음 → 사이트 무드에 맞게 더 창의적으로
2. '실제로 만든 웹사이트입니다.'(포트폴리오 제목)에 어울리는 효과
3. '이런 대표님께 강력히 추천합니다' 옆 체크(✓) 없애기
4. CHAPTER 01 WEBSITE 코드 효과(<h2> 타이핑·검사기 상자): 만들다 만 것처럼 어색하고 허접함 → 새로
5. '흔한 템플릿 VS 맞춤 디자인' 제목: 허접함 → 새로
6. 총비용 계산하기의 빨간 펜 모양 세 개 없애기(어색함)
7. 질문 탭(웹사이트 · AI 광고영상): 예쁘지만 두 개를 고를 수 있다는 걸 모를 것 같음 → 고를 수 있다는 게 보이게
8. 대표 서신('단순히 시키는 대로만 만들지 않습니다 … 사장님보다 더 사장님 같은 마음으로'): 좋지만 너무 느리고 배경이 시꺼멓기만 함 → 개선
9. 문의 '매달 나가는 웹사이트 관리비, 스트레스에서 해방되세요.' 빨간 펜 효과: 완전 어색하고 허접함 → 새로

## 11차 사용자 피드백(2026-10-10)
- 웹사이트 효과 완료(커밋 62864e2): WEBSITE 코드 해독 등장, 비교 제목 한 줄 대결 배치, 포트폴리오 제목 로딩 막대, '사진만으로' 현상, '모았습니다.' 모임, 효과는 화면 진입 즉시(86%)·재생 시간 단축. 미리보기 같은 주소 4버전.
- **AI 광고영상 4편 다시 만들기 — 콘티 승인 대기**: docs/AD_STORYBOARD_v32.md (한 편 7초, 3컷). 사용자 승인 전 생성 금지.
- Higgsfield 키: 사용자가 새로 발급, 저장소 밖 `.env.local`(git 무시)에만 저장. 출력·커밋 금지.

## 12차(2026-10-12) — 새 사이트 Vercel 배포 · 문의 메일
- 새 사이트 임시 주소: https://pause-studio-three.vercel.app (Vercel 계정 scottnim7777-4767, 프로젝트 `pause-studio`)
  - 배포: `cd site && npm run build && node scripts/vercel.mjs && vercel deploy --prebuilt --prod`
- 문의 흐름: ① 비공개 Blob 저장소 `pause-inquiries`에 신청서·첨부 먼저 저장(`inquiries/날짜/아이디/`) ② 서버 SMTP(설정 시) ③ 실패하면 손님 브라우저가 FormSubmit으로 info@pause8studio.com에 직접 전송. 첨부 합계 4MB(Vercel 한도)
  - FormSubmit은 서버에서 보내면 403 → 브라우저 전송만 됨. 첫 사용 확인 메일을 info@로 보냄(2026-10-12 발송) → 사용자 승인 완료(2026-10-12), 브라우저 전송 성공 확인
- 2026-10-12 pause8studio.com 연결 완료(Cloudflare TXT `_vercel` 2줄로 소유 확인 → 예전 다른 계정 프로젝트에서 넘어옴). www → 기본 주소 308. 통화는 cf-ipcountry 먼저
- 실제 상담 창 → 저장 + FormSubmit → '접수 완료' 확인. 서버는 메일 실패도 200으로 응답(Cloudflare가 5xx 본문을 바꿔 relay가 사라짐)
- 문의 메일 제목 `💻 [PAUSE 상담] 종류 · 이름 (회사)`, FormSubmit 표 양식

## 13차(2026-10-14) — 영어판 기획
- 기획서: `docs/EN_PLAN.md` (구현은 Sonnet 세션 예정). `/` 한국어 · `/en` 영어, 국기 SVG 알약 버튼, 효과 단어 짝, 영어 글꼴, 검색·문의 메일까지.
- 2026-10-14 영어판 구현·배포 완료: `/en`, 국기 버튼, 영어 글꼴, 점검(ko 163 · en 19 · a11y 0). 자세한 내용은 `docs/EN_PLAN.md` 맨 아래 '구현 결과'. 영어 문구는 사용자 확인 대기(사실 약속 문구 목록 있음).
- 2026-10-14 2차: 로고 전환(ts/transition.ts), 언어 자동 선택(index.template.html 머리 스크립트: 브라우저 언어 목록에 ko가 없으면 /en, 봇 제외, 선택 기억 ps-lang), 언어 버튼 확대, 영어 베기선 보정, 구글 노출 정리(docs/GOOGLE_LISTING.md). 영어 점검 25.
- 2026-10-15 사이트 감시: `.github/workflows/watch.yml`(30분마다 한·영 첫 화면, /api/health, 사이트맵, 문의 기능, /api/status). 이상이면 30초 뒤 재확인 → 그래도 이상이면 ① GitHub 이슈 `사이트감시` 열기/댓글 ② 점검을 실패로 끝내 GitHub이 저장소 주인에게 메일. info@ 직접 발송은 FormSubmit이 GitHub 서버를 막아 불가(시험 확인). 시험: `gh workflow run watch.yml -f site=https://pause8studio.invalid`(이슈가 열리니 끝나면 닫기).
  - 서버: 문의별 `mailed.txt` 표시, `POST /api/mailed`(손님 브라우저 relay 성공 보고), `GET /api/status`(메일이 안 나간 문의 개수, `PENDING_MIN` 기본 10분, `PENDING_SINCE` 기본 2026-10-14T14:25Z 이전 문의 제외).
  - 한계: 점검 간격 30분, 저장소가 60일 무활동이면 GitHub이 예약 실행을 끌 수 있음.

## 2026-10-22 — 영어 페이지 대상 바꿈 · WhatsApp
- 언어는 나라가 아닌 브라우저 언어로 정함(그대로 유지). 통화만 나라(IP)로 정함.
- 영어 페이지(/en)는 한인이 아닌 현지 전체가 대상. 첫 화면 `First impressions take 50 milliseconds.` / `Look the part. Get chosen.`(사용자 선택). 영어 전체를 원어민 기준으로 다시 씀. 한국어·영어 모두 가능하다는 점은 강점으로 유지.
- 영어 공유 이미지 `og-en-20261022.jpg`: 사용자 카드에서 한글만 지운 `tools/og/bg-en.png` + `tools/og/og-en.html` → `node tools/og/render.mjs og-en.html og-en-20261022.jpg`. 한국어 og-20261013.jpg(사용자 제작)는 덮어쓰지 않음.
- 메신저는 언어별 `chat`(ko.ts 카카오톡 / en.ts WhatsApp wa.me/64204887198, QR `media/whatsapp-qr.png`).
- WhatsApp 프로필 사진: 바탕화면 `PauseStudio/WhatsApp 프로필/`(저장소 밖).
- 배포: 이 세션의 자동 모드는 실제 배포를 막아서 사용자가 `!`로 실행함. 실제 사이트 반영, 감시 점검 '이상 없음' 확인.

## 2026-10-23 — 미국 노출 작업(SEO)
- 사용자 목표: 미국 거주 한인 + 현지 미국인에게 검색으로 닿기. 주소는 오클랜드 그대로(가짜 미국 주소 금지, 구글 정책 위반).
- 미국 도시 3곳 영어 안내 페이지: `/en/web-design-los-angeles` · `-new-york` · `-atlanta` (`site/scripts/render-cities.ts`, render.ts가 호출, 문구는 도시 배열 한 곳에서). 사이트맵 추가, `/en` 푸터 'Serving' 열에서 링크. 서버(server.ts)·Vercel(vercel.mjs 라우트)에 연결.
- 배포는 사용자가 `!`로 실행해야 반영됨(아직 배포 전일 수 있음). 배포 후 Search Console 색인 요청 4개(`/en` + 도시 3곳)는 사용자가 소유 계정으로 직접(이 PC 크롬의 구글 계정에는 속성이 없음).
- 확인 대기 문구: '미국보다 대략 하루 앞서 있어 통화 시간을 맞춘다', 도시별 한인 지역 언급(Koreatown·Duluth·Suwanee).
- 이어서: 구글 프로필 서비스 지역에 3도시 추가, Clutch·Yelp 등록(소개 글은 영어로 써 줌), 구글 광고 소액 2주 테스트, 후기 확보. 업종별 페이지는 사용자가 반대해 접음.
- 점검: Playwright가 이 PC에 없어 tests/*.cjs는 못 돌림(새 페이지는 화면 글 표기 규칙을 직접 확인).
