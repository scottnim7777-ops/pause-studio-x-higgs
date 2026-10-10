# PAUSE STUDIO 웹사이트 (pause8studio.com 리뉴얼)

한 페이지짜리 사이트입니다. 프레임워크 없이 **Vite + TypeScript**로 만들고, 상담 신청 메일은 **Express 서버**(`/api/contact`)가 보냅니다.
본문은 빌드할 때 문구 파일(`src/content/ko.ts`)로부터 HTML로 미리 만들어 둡니다. 그래서 검색엔진이나 JS가 꺼진 환경에서도 모든 내용이 보입니다.

## 바로 실행
```bash
cd site
npm install
npm run dev          # 개발: http://localhost:3000 (문구를 바꾸면 npm run render 후 새로고침)
npm run build        # 배포용: dist/ (정적 파일 + dist/server.cjs)
npm start            # 배포용 실행: NODE_ENV=production node dist/server.cjs (포트 3000, PORT로 변경)
npm run check        # 타입 검사 + 빌드
```
필요: Node.js 20 이상. 미디어를 다시 만들 때만 Python 3(Pillow)와 ffmpeg.

## 폴더
| 위치 | 내용 |
|---|---|
| `src/content/ko.ts` | **모든 화면 문구**(가격·FAQ·상담 질문·연락처). 문구 수정은 여기서만. 웹사이트 플랜(이름·기능·설명)은 맨 위 `plans` 한 곳 = 견적서(`../docs/QUOTATION_2026-10-07.md`) STARTER · BUSINESS · ENTERPRISE 그대로, 가격만 최종 정책(`../docs/PRICING_CURRENCY_POLICY_2026-10-08.md`) 1,990 · 4,490부터 · 맞춤 견적 |
| `src/render/page.ts` | 문구 → 섹션 HTML(빌드 때 실행) |
| `src/styles/main.css` | 디자인 토큰·전 섹션 스타일(규칙: `../docs/DESIGN_SYSTEM.md`) |
| `src/ts/hero.ts` | 히어로 인트로(벽이 다가오며 선명해짐 + 한글 타이핑)·작업물 벽 |
| `src/ts/hangul.ts` | 한글 자판 타이핑 순서(선 → ㅅ·서·선) — 히어로 제목과 마무리 선언이 함께 씀 |
| `src/ts/consult.ts` | 브랜딩 무료 상담 신청 창 |
| `src/ts/ui.ts` | 머리줄(내려가면 숨김·지금 보는 장)·모바일 메뉴·등장 움직임·포트폴리오 반복 재생·크게 보기·BEFORE/AFTER 손잡이·광고 샘플 탭·열고 닫는 목록·질문 탭·계산기(기본값 500 · 150 · 5년, 숫자 뒤 입력 표시, 상품 선택·숫자 세기)·관리비 $0 '다이어트'(세어 내려가며 홀쭉해짐)·전화 상담 메뉴·이메일 보기·스크롤에 따른 큰 글자·마무리 선언 타이핑·포인트(스크롤에 따라 채워지는 제목·제작 과정 진행 선·형광펜·WHY PAUSE? 멈춤·이유 번호·추천 대상 체크·관리비 지움·뷰파인더·글자 모임·해방·빈자리 점선) |
| `src/ts/motion.ts` | 운영체제 '동작 줄이기' → 멈춰야 하면 `html.still`(사이트 안의 '움직임 멈추기' 버튼은 2026-10-09 사용자 요청으로 없앰) |
| `server.ts` | 정적 파일 + `/api/contact` + `/api/health` + 첫 화면 통화 표시(접속 위치, 뉴질랜드면 `<html class="nzd">`) + `/api/currency`(판별 결과 확인용, IP는 돌려주지 않음) |
| `src/geo/currency.ts` | 뉴질랜드로 판별된 방문자만 NZD, 그 밖의 모든 나라와 판별 실패는 USD(숫자는 같음). 순서: 믿을 수 있는 국가 헤더(`GEO_HEADER`) → 접속 IP가 뉴질랜드 목록에 있는지 → USD. 확인용 `?cur=nzd`는 개발 중이거나 `CURRENCY_OVERRIDE=1`일 때만 |
| `scripts/nz-ip.py` | 뉴질랜드 IP 목록 `src/geo/nz-ip.json` 만들기(인터넷 등록기관 공개 자료) — 가끔 다시 실행 |
| `scripts/render.ts` | `index.template.html` → `index.html` |
| `scripts/media.py` | 원본 → `public/media`(WebP·JPEG 880/1920, MP4, 받은 화면 녹화는 끊김 없이 반복되게 끝을 처음 장면과 겹침 — 기본 1초, 커스텀 케이크는 0.4초) + `src/content/media.json`(실제 크기) |
| `../tools/ad_edit.py` | AI 광고영상 샘플 편집(구버전 ONDO · SOUTHERN ROUTE · DAON, 현재 4편은 `tools/adv31/`): Higgsfield 영상 두 컷 → 색보정·비네팅·그레인 + 움직이는 글씨(MaruBuri · Instrument Serif · Archivo) + 끝 화면 → `public/media/film/*.mp4`·포스터·BEFORE 사진 |
| `tests/smoke.cjs` | 브라우저 점검 159개(화면 폭 7종·커서, 상담 4종 흐름·관심 플랜, 요금 = 견적서 플랜 + 최종 가격(STARTER · BUSINESS · ENTERPRISE · AI 광고영상)·결합 상품·예전 가격·GST 문구 없음, 통화(뉴질랜드 IP만 NZ$, 미국·한국·호주·IPv6·판별 실패는 US$, 꾸민 국가 헤더·?cur 무시), 포트폴리오 반복 재생·잘림 없음, 비교 손잡이, 광고 샘플 탭·자동 넘김, 질문 탭·열고 닫기, 전화 상담·이메일, 줄표·별표 없음, 머리줄, 계산기 플랜 선택, $0 다이어트, 가로·세로 그림(플레이어 16:9 + 휴대폰 9:16), 세로로 긴 창의 히어로 벽, 장 제목 잘림 없음, 비교 손잡이 주기 안내, 계산기 입력칸 표시, 샘플 탭 누른 뒤 자동 넘김, 포트폴리오 줄 맞춤(잘림·틀 없음), 계산기 기본값(500 · 150 → 5년 US$9,500 vs US$1,990), 마무리 선언 편지체 타이핑·서명(밑줄·빛 번짐 없음), 커스텀 케이크 화면 녹화 반복 영상, 합계 가운데, 포인트 효과(스크롤에 따라 채워지는 제목·진행 선과 켜지는 단계·되감기·형광펜·'Ordinary' 글꼴), 움직임 멈추기 버튼 없음(예전 기억 무시), 동작 줄이기, JS 없음) |
| `tests/fixtures/tiny.webm` | 점검용 6초 영상 — Playwright의 Chromium에는 H.264가 없어 재생 점검 때 .mp4 대신 보냄 |
| `tests/a11y.cjs` | 접근성 점검(axe-core, WCAG 2.1 A·AA) |
| `scripts/fonts.py` | 무료 폰트 → `public/fonts`(사이트 글자·나머지 한글로 나눈 woff2, 관리비 숫자용 PS Ledger, 마무리 선언용 PS Letter) + `src/styles/fonts.css` |
| `Dockerfile` | 배포용(Cloud Run 등) — `node dist/server.cjs`, 포트는 `PORT`(기본 8080) |
| `scripts/artifact.py` | 미리보기 링크(claude.ai 아티팩트)용 묶음 — `dist`를 상대 경로로 바꿔 `.cache/artifact`에. 서버가 없어 IP 대신 기기 시간대로 통화를 정함(전환 버튼 없음). 주소는 `../STATE.md` |

## 폰트(무료 · 직접 호스팅)
- 제목 **PS Display** = 나눔스퀘어 네오 Bold(한글, 네이버 · 디자인 산돌) + Archivo 폭 70·굵기 500(영문·숫자) — 산돌 격동고딕2와 가장 비슷한 무드
- 본문 **PS Text** = 나눔스퀘어 네오 Regular / 강조 Bold — 산돌 그레타산스와 본문 밀도·줄바꿈이 거의 같음
- 관리비 $0 큰 숫자 **PS Ledger** = Archivo 가변 글꼴(폭 62~125 · 굵기 400~800)에서 `$0123456789,`만 남긴 11KB — 숫자가 세어 내려가며 홀쭉해지는 움직임용
- 마무리 선언 두 줄 **PS Letter** = 마루부리 Regular(네이버)에서 선언 글자와 타이핑 중간 모양만 남긴 4KB — 선언 문구를 바꾸면 `python3 scripts/fonts.py`를 꼭 다시 실행(안 하면 새 글자가 다른 서체로 보임)
- 모두 SIL OFL 1.1(무료, 상업 사용 가능). 웹용으로 글자를 줄이고 이름을 바꾼 파일이 `public/fonts/`에 있고, 라이선스는 `public/fonts/LICENSE.txt`.
- 첫 화면에는 사이트에 쓰인 글자 묶음(약 105KB)만, 나머지 자주 쓰는 한글 2,350자는 필요할 때만 받습니다.
- 문구를 많이 바꿨다면: `npm run render && python3 scripts/fonts.py` (안 해도 글자는 모두 나옵니다 — 첫 화면이 조금 더 가벼워질 뿐). 필요: Python 3, `pip install fonttools brotli`.

## ★ 운영 전에 할 일
1. **메일 설정**: 배포 환경에 `SMTP_HOST/PORT/USER/PASS`(`.env.example` 참고, Gmail은 앱 비밀번호). 비워 두면 FormSubmit으로 보내며, 처음 한 번 받는 주소로 확인 메일이 오니 승인해야 합니다.
2. 배포 후 상담 창에서 실제로 한 번 보내 보고 메일이 오는지 확인(이 저장소에서는 실제 메일을 보내지 않았습니다).
3. 기존 사이트를 바꾸는 순서·되돌리기: `../docs/DEPLOY.md` (도메인은 그대로, `Dockerfile`로 Cloud Run 등에 배포).

## 상담 신청(`/api/contact`)
- 상담 종류: 웹사이트 제작 · AI 광고영상 · 웹사이트 + AI 광고영상 · AI 업무 자동화/맞춤 개발 → 종류에 맞는 질문만 보이고, 숨긴 질문은 보내지 않습니다.
- 요금 카드의 '무료 상담받기'에서 열면 종류와 상품(웹사이트 플랜 · 영상 상품)이 미리 선택되어 '기본 정보'부터 시작합니다(`ko.ts`의 `consultPreset`).
- 화면에 보이는 이메일과 상담 메일을 받는 주소 모두 info@pause8studio.com(받는 주소는 배포 환경의 `CONTACT_TO`로 바꿀 수 있음). SMTP를 설정하지 않으면 FormSubmit이 처음 한 번 info@로 확인 메일을 보내니 승인해야 메일이 옵니다.
- 메일 제목: `[브랜딩 상담] {종류} · {성함}`, 답장 주소는 신청자 이메일. 첨부 최대 10개·합계 25MB.
- **서버가 성공(2xx + `{ok:true}`)을 돌려줄 때만** '접수 완료'. 실패하면 메일 앱으로 보내기 · 내용 복사 · 카카오톡 문의를 보여 줍니다.
- 보안: TLS 인증서 검증을 끄지 않음(기존 서버의 `rejectUnauthorized:false` 제거), 상담 내용·연락처를 로그나 파일에 남기지 않음, 같은 곳에서 10분에 8번 넘게 보내면 거절, 숨은 입력칸으로 자동 입력 프로그램 차단.

## 미디어
- 포트폴리오: 실제 고객 사이트 화면(Ref.01~15, ChillenQ). Ref.16~39는 소유 확인 전이라 넣지 않았습니다.
- Ref.02 커스텀 케이크(BLOOMING, 2026-10-09) · Ref.03 동대문 · Ref.08 컨템퍼러리 타투 스튜디오 · Ref.17 냉장·냉동 설비(ChillenQ, 2026-10-09): 사용자가 보낸 화면 녹화(원본 `../content/assets/portfolio/originals/*_hero_2026-10-0*.mp4`, 소리 빼고 보관) → 끊김 없이 반복되는 영상(`python3 scripts/media.py loops` 전체, `loops chillenq`처럼 하나만).
- AI 광고영상 샘플 4편(가상 브랜드, 소개 글에 PAUSE가 직접 기획하고 만든 광고라고 밝힘): PAUSE STUDIO · PÂTISSERIE MIREILLE · SOOM · 밤국수(Higgsfield 스틸 + Nano Banana 2 → `../tools/adv31/*.py`로 직접 합성·편집, 마무리 `finish.py`).
- BEFORE/AFTER의 BEFORE 사진: Higgsfield 생성(`public/media/compare/mock-*`, `python3 scripts/media.py compare`).
- 다시 만들기: `python3 scripts/media.py` (전체) · `… film` · `… loops` · `… compare` · `… og`(공유 이미지 = 미리보기 첫 화면).

## 점검
```bash
npm run build && PORT=3100 NODE_ENV=production node dist/server.cjs &
NODE_PATH=/opt/node22/lib/node_modules node tests/smoke.cjs http://localhost:3100 tests/out
NODE_PATH=/opt/node22/lib/node_modules node tests/a11y.cjs http://localhost:3100
```
결과(2026-10-09 여덟 번째 피드백 반영): 159/159 통과, 접근성 위반 0. 확인한 것: 1920·1440·1280·1024·834·390·360 폭에서 가로 넘침 없음, 콘솔 오류 없음, 상담 4종 흐름·성공/실패 화면, 요금 버튼 미리 선택(BUSINESS), 요금 = 견적서 플랜 + 최종 가격(STARTER USD $1,990 · BUSINESS USD $4,490부터 · ENTERPRISE 맞춤 견적, 영상 USD $490 · 890 · 1,490부터 · 2,490/월)·무료 혜택, 결합 상품·예전 가격(1,490 · 2,900 · 5,500)·WEBSITE · ONLINE STORE 이름·GST 문구 없음, 통화(로컬 → USD, 뉴질랜드 IP → NZD, 미국·한국·호주·미국 IPv6 → USD, 운영에서 ?cur=nzd·설정 안 된 cf-ipcountry 무시, 첫 화면 private 캐시, `/api/currency`), 크게 보기 키보드·초점 복귀, 모바일 메뉴, 계산기(STARTER 기본, BUSINESS로 바꾸면 USD $4,490부터·절약액 다시 계산), $0 다이어트($100 → $0, 12달 채움, 동작 줄이기면 바로 $0), 가로·세로 틀(1440·390에서 긴 변 같음·바닥선 같음·설명 정렬), 움직임 멈추기 버튼 없음, 동작 줄이기, JS 없이 내용 표시(질문 27개·$0).

## 접근성·성능 메모
- 키보드로 모든 기능 사용 가능, 창은 Esc로 닫고 원래 버튼으로 초점이 돌아갑니다. 타이핑 제목은 화면 읽기 프로그램에 전체 문장으로 읽힙니다.
- 운영체제의 '동작 줄이기'를 켜면 인트로·자동 재생·깜빡임·포인트 효과 없이 바로 완성 화면입니다. 비교·광고 샘플 영상에는 재생·일시정지 단추가 있습니다. 사이트 안의 '움직임 멈추기' 버튼은 2026-10-09 사용자 요청으로 없앴습니다(접근성 기준 WCAG 2.2.2는 작업물 벽에 대해 운영체제 설정에 맡기는 셈).
- 계산기 숫자는 세면서 바뀌지만, 화면 읽기 프로그램에는 입력을 멈춘 뒤 최종 결과만 한 번 읽어 줍니다.
- 첫 화면: HTML 34KB(gzip) · CSS 24KB(폰트 글자 범위 목록 포함) · JS 12KB · 폰트 약 105KB + 관리비 숫자 11KB. 사진은 WebP 우선·지연 로딩, 히어로 영상은 PC에서 화면에 보이는 카드만 재생(모바일은 사진).
