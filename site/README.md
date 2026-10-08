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
| `src/content/ko.ts` | **모든 화면 문구**(가격·FAQ·상담 질문·연락처). 문구 수정은 여기서만. 플랜(이름·가격·기능)은 맨 위 `plans` 한 곳 = 견적서(`../docs/QUOTATION_2026-10-07.md`) |
| `src/render/page.ts` | 문구 → 섹션 HTML(빌드 때 실행) |
| `src/styles/main.css` | 디자인 토큰·전 섹션 스타일(규칙: `../docs/DESIGN_SYSTEM.md`) |
| `src/ts/hero.ts` | 히어로 인트로(벽이 다가오며 선명해짐 + 한글 타이핑)·작업물 벽 |
| `src/ts/consult.ts` | 브랜딩 무료 상담 신청 창 |
| `src/ts/ui.ts` | 머리줄·모바일 메뉴·등장 움직임·크게 보기·자동 재생 영상·계산기·이메일 보기 |
| `src/ts/motion.ts` | 움직임 멈추기(기억됨)·운영체제 '동작 줄이기' |
| `server.ts` | 정적 파일 + `/api/contact` + `/api/health` + 첫 화면 통화 표시(접속 위치) |
| `src/geo/currency.ts` | 접속 IP → NZD(뉴질랜드) / USD(그 밖의 나라). 확인용 `?cur=usd` |
| `scripts/nz-ip.py` | 뉴질랜드 IP 목록 `src/geo/nz-ip.json` 만들기(인터넷 등록기관 공개 자료) — 가끔 다시 실행 |
| `scripts/render.ts` | `index.template.html` → `index.html` |
| `scripts/media.py` | 원본 → `public/media`(WebP·JPEG 880/1920, MP4) + `src/content/media.json`(실제 크기) |
| `tests/smoke.cjs` | 브라우저 점검 92개(화면 폭 7종, 상담 4종 흐름, 요금 = 견적서 플랜, 통화 NZD/USD, 크게 보기, 메뉴, 계산기, 동작 줄이기, JS 없음) |
| `tests/a11y.cjs` | 접근성 점검(axe-core, WCAG 2.1 A·AA) |
| `scripts/fonts.py` | 무료 폰트 → `public/fonts`(사이트 글자·나머지 한글로 나눈 woff2) + `src/styles/fonts.css` |
| `Dockerfile` | 배포용(Cloud Run 등) — `node dist/server.cjs`, 포트는 `PORT`(기본 8080) |
| `scripts/artifact.py` | 미리보기 링크(claude.ai 아티팩트)용 묶음 — `dist`를 상대 경로로 바꿔 `.cache/artifact`에. 주소는 `../STATE.md` |

## 폰트(무료 · 직접 호스팅)
- 제목 **PS Display** = 나눔스퀘어 네오 Bold(한글, 네이버 · 디자인 산돌) + Archivo 폭 70·굵기 500(영문·숫자) — 산돌 격동고딕2와 가장 비슷한 무드
- 본문 **PS Text** = 나눔스퀘어 네오 Regular / 강조 Bold — 산돌 그레타산스와 본문 밀도·줄바꿈이 거의 같음
- 모두 SIL OFL 1.1(무료, 상업 사용 가능). 웹용으로 글자를 줄이고 이름을 바꾼 파일이 `public/fonts/`에 있고, 라이선스는 `public/fonts/LICENSE.txt`.
- 첫 화면에는 사이트에 쓰인 글자 묶음(약 90KB)만, 나머지 자주 쓰는 한글 2,350자는 필요할 때만 받습니다.
- 문구를 많이 바꿨다면: `npm run render && python3 scripts/fonts.py` (안 해도 글자는 모두 나옵니다 — 첫 화면이 조금 더 가벼워질 뿐). 필요: Python 3, `pip install fonttools brotli`.

## ★ 운영 전에 할 일
1. **메일 설정**: 배포 환경에 `SMTP_HOST/PORT/USER/PASS`(`.env.example` 참고, Gmail은 앱 비밀번호). 비워 두면 FormSubmit으로 보내며, 처음 한 번 받는 주소로 확인 메일이 오니 승인해야 합니다.
2. 배포 후 상담 창에서 실제로 한 번 보내 보고 메일이 오는지 확인(이 저장소에서는 실제 메일을 보내지 않았습니다).
3. 기존 사이트를 바꾸는 순서·되돌리기: `../docs/DEPLOY.md` (도메인은 그대로, `Dockerfile`로 Cloud Run 등에 배포).

## 상담 신청(`/api/contact`)
- 상담 종류: 웹사이트 제작 · AI 영상광고 · 웹사이트 + AI 영상광고 · AI 업무 자동화/맞춤 개발 → 종류에 맞는 질문만 보이고, 숨긴 질문은 보내지 않습니다.
- 서비스·요금의 버튼에서 열면 종류(와 상품)가 미리 선택되어 '기본 정보'부터 시작합니다.
- 메일 제목: `[브랜딩 상담] {종류} · {성함}`, 답장 주소는 신청자 이메일. 첨부 최대 10개·합계 25MB.
- **서버가 성공(2xx + `{ok:true}`)을 돌려줄 때만** '접수 완료'. 실패하면 메일 앱으로 보내기 · 내용 복사 · 카카오톡 문의를 보여 줍니다.
- 보안: TLS 인증서 검증을 끄지 않음(기존 서버의 `rejectUnauthorized:false` 제거), 상담 내용·연락처를 로그나 파일에 남기지 않음, 같은 곳에서 10분에 8번 넘게 보내면 거절, 숨은 입력칸으로 자동 입력 프로그램 차단.

## 미디어
- 포트폴리오: 실제 고객 사이트 화면(Ref.01~15, ChillenQ). Ref.16~39는 소유 확인 전이라 넣지 않았습니다.
- AI 영상광고 예시: 가상 브랜드 SOOM(사진 → 광고 장면, Higgsfield Seedance 5초 반복 영상). 화면에 '예시 · 실제 고객 작업물 아님' 표시.
- 다시 만들기: `python3 scripts/media.py` (전체) · `python3 scripts/media.py film` · `python3 scripts/media.py og=<PNG>`.

## 점검
```bash
npm run build && PORT=3100 NODE_ENV=production node dist/server.cjs &
NODE_PATH=/opt/node22/lib/node_modules node tests/smoke.cjs http://localhost:3100 tests/out
```
NODE_PATH=/opt/node22/lib/node_modules node tests/a11y.cjs http://localhost:3100
```
결과(2026-10-08): 92/92 통과, 접근성 위반 0 — 1920·1440·1280·1024·834·390·360 폭에서 가로 넘침 없음, 콘솔 오류 없음, 상담 4종 흐름·성공/실패 화면, 요금 버튼 미리 선택(BUSINESS), 요금·서비스 = 견적서 플랜(STARTER · BUSINESS · ENTERPRISE)·무료 혜택·식당 문구 없음, 통화(로컬·뉴질랜드 IP → NZD, 미국 IPv4·IPv6·?cur=usd → USD, 첫 화면 private 캐시), 크게 보기 키보드·초점 복귀, 모바일 메뉴, 계산기, 움직임 멈추기 기억, 동작 줄이기, JS 없이 내용 표시.

## 접근성·성능 메모
- 키보드로 모든 기능 사용 가능, 창은 Esc로 닫고 원래 버튼으로 초점이 돌아갑니다. 타이핑 제목은 화면 읽기 프로그램에 전체 문장으로 읽힙니다.
- 5초 넘게 움직이는 것(작업물 벽·자동 재생 영상)은 멈출 수 있고, '움직임 멈추기'는 다음 방문에도 기억됩니다. 운영체제의 '동작 줄이기'를 켜면 인트로와 자동 재생이 없습니다.
- 첫 화면: HTML 28KB(gzip) · CSS 10KB · JS 8KB · 폰트 약 90KB. 사진은 WebP 우선·지연 로딩, 히어로 영상은 PC에서 화면에 보이는 카드만 재생(모바일은 사진).
