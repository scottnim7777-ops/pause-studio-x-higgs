# PAUSE STUDIO 리뉴얼 — 진행 상태

> 새 세션은 이 파일부터 읽는다. 작업 지시 원문: `docs/PauseStudio_ClaudeCode_Prompt.txt` (사용자 수정본 반영)

## 현재 단계 (2026-09-29)
- **1~4단계 2차 준비 중.** 1차 히어로 시안 5장은 사용자 검토 결과 **보류**.
- 선택안: **없음** · 제작 승인("제작해"): **없음** — 전체 사이트·영상은 사용자가 번호를 고르고 "제작해"라고 할 때만.
- **대기 중:** ① 사용자가 직접 만드는 **로고** ② 한글 서체 방향 선택(`research/FONTS_KR.md`, 추천 SD 그레타산스).
- 로고를 받기 전에는 시안을 다시 생성하지 않는다(유료 생성 낭비 방지).

## 사용자 피드백·결정
- API는 **Higgsfield REST(API 키)**. MCP 무료 계정은 사용하지 않음. 지갑 **10 USD**, 자동 충전 없음.
- 영상: **Seedance 2.0 · 4K**, 무음(txt 수정 완료). 1080p 가격 문의에 답변 필요 → `higgsfield/COSTS.md`.
- 기존 로고 사용 안 함. 1차에 방향별 로고안 L1~L5를 제안했으나, **사용자가 로고를 직접 만들기로 함** → L1~L5는 탐색 기록으로만 보관.
- 1차 시안 피드백: "너무 구리다 · 레퍼런스가 고감도가 아니다 · 한글 폰트가 허접하고 AI 티가 난다."
  - 폰트: 1차에 쓴 프리텐다드·SUIT·IBM Plex Sans KR·고운바탕·함렛 **전부 제외**. 실제 스튜디오가 쓰는 서체로 재조사 완료 → `research/FONTS_KR.md`, 보드 `drafts/fonts/PAUSE_font_candidates.png`.
  - 레퍼런스: 2차에서 기준을 다시 잡는다(예술 작품 위주 → 실제 웹·브랜드 작업 위주, 사용자가 좋아하는 사이트가 있으면 기준으로 삼기).
  - AI 느낌 줄이기: 생성 이미지 의존을 줄이고 서체·조판·실제 작업물 중심으로.

## 자격 증명 (값은 기록하지 않음)
- 로컬 `.env.local` 의 `HF_CREDENTIALS` (git 제외, 권한 600). 새 세션에는 남지 않는다 → 클라우드 환경 변수에 등록 권장.
- 키가 대화창에 붙여넣어졌으므로 프로젝트 종료 후 콘솔에서 **키 재발급 권장**.

## 네트워크
- 환경 네트워크를 '전체(Full)'로 변경해 해결. 셸의 curl·Playwright는 외부 접속 가능(프록시 CA를 `~/.pki/nssdb`에 등록, TLS 검증 유지).
- Node fetch는 `NODE_USE_ENV_PROXY=1` 필요. WebFetch 도구는 일부 도메인 차단 → 셸에서 받아 읽음.

## 완료
- [x] 원문 수집·검증: `content/site-content.ko.json`(423개 문자열, `tools/verify-content.py`), 라이브 사이트 대조 `content/live/`, 원본 에셋 `content/assets/`(sha256 목록)
- [x] Higgsfield API 규약·클라이언트 `tools/hf.mjs`, 비용 기록 `higgsfield/COSTS.md` (16건 ≈ 2.19 USD, 잔액 추정 7.81 USD)
- [x] 1차 레퍼런스 `research/REFERENCES.md` (R01~R17) — 사용자 평가: 고감도 부족
- [x] 1차 히어로 시안 5장 `drafts/composites/`, 보드 `drafts/board/`, 설명 `drafts/DRAFTS.md` — 보류
- [x] 한글 서체 재조사·견본 11종 `drafts/fonts/specimens/`, 보드 `drafts/fonts/PAUSE_font_candidates.png`
- [x] 커밋·푸시: `claude/charming-euler-bt8uf2`

## 다음 할 일
1. 사용자 로고 수령(SVG 권장) → 원본 보관 `content/assets/logo/new/`
2. 서체 확정(로고와 어울림 확인)
3. 레퍼런스 재조사(실제 웹·브랜드 작업, 개별 작품 URL) → 2차 방향 5개
4. 2차 히어로 시안 5장(로고·확정 서체·원문) → 보드·미리보기 → 선택 대기

## 확인 필요(사용자)
- 수치 42건+ vs 정적 HTML의 150+ · 프로모션 가격 $ vs NZD · Ref.16(로고) · Ref.02 분류(케이스/케이크) · Ref.17~39 소유권 · 마케팅 대시보드 모달 수치 · 라이브 사이트 아이콘 파일 손상 → `content/CONTENT_INVENTORY.md`
