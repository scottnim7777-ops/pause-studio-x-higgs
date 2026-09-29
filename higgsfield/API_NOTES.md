# Higgsfield REST API 메모

출처: 공식 SDK `github.com/higgsfield-ai/higgsfield-js` (커밋 e3f2742, 2026-09-18) README·`src/v2/client.ts`·`src/client.ts`.
공식 문서(docs.higgsfield.ai, open.higgsfield.ai)는 이 세션에서 네트워크 차단 — 접근 허용 후 아래 "미확정" 항목을 문서로 확정한다.

## 확인됨 (SDK 소스 기준)
- Base URL: `https://api.higgsfield.ai`
- 인증 헤더: `Authorization: Key KEY_ID:KEY_SECRET` (Bearer 아님). 서버 측에서만 사용.
- 환경 변수: `HF_CREDENTIALS="KEY_ID:KEY_SECRET"` (또는 `HF_API_KEY` + `HF_API_SECRET`)
- 제출: `POST /{모델 엔드포인트}` — 본문은 입력 파라미터를 그대로 JSON으로 (래핑 없음)
- 응답: `{ status, request_id, status_url, cancel_url, images?: [{url}], video?: {url} }`
- 상태 조회: `GET /requests/{request_id}/status`
  - `queued` → `in_progress`(취소 불가) → `completed` | `failed`(환불) | `nsfw`(환불)
- 오류: 400 잘못된 입력 · 401 자격 증명 · 403 잔액 부족 · 422 검증 실패
- 업로드: `POST /files/generate-upload-url` `{content_type}` → `{upload_url, public_url}` → `PUT upload_url`
- 웹훅(선택): 엔드포인트에 `?hf_webhook=<url>`

## 미확정 (문서 확인 필요)
- 모델별 엔드포인트 ID와 입력 스키마 (검색 결과상 후보: `bytedance/seedance-2.0/image-to-video`, `bytedance/seedance-2.0/text-to-video`)
- Seedance 2.0 4K 파라미터 이름(해상도·모드·길이·오디오 끄기·시작/끝 프레임)
  - 참고(웹 MCP 카탈로그, API와 다를 수 있음): duration 4–15초, resolution 480p/720p/1080p/4k(4k는 mode=std), generate_audio, start_image/end_image
- 단가(USD). 제3자 글 기준 "Seedance 2.0 std 4K 8초 ≈ $11.20" — **미검증**. 사실이면 10 USD 지갑으로 부족.
- 결과 파일 CDN 호스트(네트워크 허용 목록에 필요)

## 운영 규칙
- `tools/hf.mjs`만 사용: label당 1회 제출, 제출 전 기록, 응답 유실 시 `submission_unknown`으로 남기고 재제출 금지
- 결과 URL에 의존하지 않고 `higgsfield/raw/<label>/`에 내려받아 보존
- 명확한 불량만 안별 최대 1회 재생성
- Node 내장 fetch는 프록시 변수를 읽도록 `NODE_USE_ENV_PROXY=1`로 실행
