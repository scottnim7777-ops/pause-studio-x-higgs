# PAUSE STUDIO 리뉴얼 — 진행 상태

> 새 세션은 이 파일부터 읽는다. 작업 지시 원문: `docs/PauseStudio_ClaudeCode_Prompt.txt` (사용자 수정본 반영)

## 현재 단계
- **단계: 1~4 (히어로 시안 5개) 진행 중** — 전체 사이트·영상 제작은 사용자가 번호를 고르고 "제작해"라고 할 때만.
- 선택안: **없음** (사용자 선택 대기 전)
- 제작 승인: **없음**

## 사용자 결정 사항 (2026-09-29)
- Higgsfield는 **API 키(REST)** 로 사용한다. MCP 연결 계정(무료 10크레딧)은 사용하지 않는다. (MCP에서는 무료 비용 조회만 했고 크레딧 사용 0)
- API 지갑: 사용자가 **10 USD 결제**. 자동 충전·추가 결제 없음 → 이 금액을 예산 상한으로 본다.
- 영상: **Seedance 2.0 · 4K** (txt 수정 완료). 무음 루프이므로 오디오 생성은 끈다.

## 자격 증명 (값은 기록하지 않음)
- 로컬: `.env.local` 의 `HF_CREDENTIALS` (git 제외, 권한 600). 새 세션에는 남지 않는다.
- 권장: 클라우드 환경 설정의 환경 변수에 `HF_CREDENTIALS` = `KEY_ID:KEY_SECRET` 등록(새 세션에서 자동 인식).
- 키가 대화창에 붙여넣어졌으므로 프로젝트 종료 후 콘솔에서 키 재발급 권장.

## 차단 사항 (세션 네트워크 정책)
컨테이너와 WebFetch 모두 아래 호스트가 `connect_rejected`:
- `api.higgsfield.ai` (REST API — **필수**), 결과 파일 CDN(첫 결과 URL로 확인 예정)
- `open.higgsfield.ai`, `docs.higgsfield.ai` (공식 문서·가격)
- `pause8studio.com` (라이브 사이트 대조), `i.imgur.com` (로고·포트폴리오 원본 미디어)
- 레퍼런스: eyecannndy.com, cosmos.so, savee.com, pinterest.com, siteinspire.com, awwwards.com, the-brandidentity.com, are.na, reddit.com 및 각 이미지 CDN
- 열려 있음: github.com(git), registry.npmjs.org, pypi.org, fonts.googleapis.com / fonts.gstatic.com, storage.googleapis.com
→ 사용자에게 네트워크 접근 '전체' 또는 위 도메인 허용을 요청함.

## 완료
- [x] 작업 공간·.gitignore(비밀값 제외)
- [x] 원문 수집: 라이브 사이트 차단으로 사용자 저장소 `pause-studio-v2@3260aa0`(canonical=pause8studio.com, 검색 색인 제목 일치)에서 추출
  - `content/extracted/strings.json` — 25개 파일, 2,890개 문자열(파일:줄, ko/en/zh/ja)
  - `content/site-content.ko.json` — 섹션별 한국어 원문 고정본 (423개 문자열, `tools/verify-content.py`로 원문 일치 검증 완료)
  - `content/CONTENT_INVENTORY.md` — 요약·배치 계획·확인 필요 항목
  - 로고 원본: `content/assets/logo/pause-logo_from-repo-base64_433x189.png` (저장소 PNG 파일은 바이너리 손상, base64 원본에서 복원)
- [x] Higgsfield API 규약 확인(공식 SDK `higgsfield-ai/higgsfield-js@e3f2742`): `higgsfield/API_NOTES.md`
- [x] API 클라이언트 `tools/hf.mjs` (작업 ID 기록, 중복 제출 방지, 결과 다운로드·sha256)

## 다음 할 일 (네트워크 허용 후)
1. `docs.higgsfield.ai/docs/llms.txt`·가격 페이지 확인 → 이미지 모델·Seedance 2.0 엔드포인트/파라미터/단가 확정, `higgsfield/COSTS.md` 기록
2. pause8studio.com 렌더링 DOM 대조(내부 페이지·모달·언어 전환), imgur 원본 미디어 보존
3. 레퍼런스 12~20개 실제 이미지 확인·기록 → 5개 방향 확정
4. 히어로 아트워크 5장 생성(API) → HTML/CSS로 원문 조판 → 1920×1080 PNG 5장, 비교 보드, 로컬 미리보기
5. 직접 열어 검토 후 사용자에게 제시하고 선택 대기

## Higgsfield 작업 기록
- `higgsfield/jobs/*.json` (label별 request_id·상태·결과·파일 해시). 현재 제출 0건.
