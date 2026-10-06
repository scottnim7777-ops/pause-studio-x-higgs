# Higgsfield 비용 기록

- 결제: API 지갑 **10 USD** (사용자 결제, 자동 충전 없음) → 예산 상한.
- 금액은 공식 무료 견적 API(`POST /estimate/{endpoint}`, `node tools/hf.mjs estimate`)로 각 작업의 실제 입력을 다시 넣어 확인한 값(2026-09-29). REST API에는 잔액 조회가 없어 **실제 잔액은 Higgsfield 콘솔에서 확인** 필요.
- 실패·NSFW 작업은 환불 대상이지만 이번 작업은 모두 `completed`.

| 작업 | 엔드포인트 | 설정 | credits | USD |
|---|---|---|---:|---:|
| d1-plate | marketing-studio/image | high · 2k · 16:9 | 4.034 | 0.253 |
| d1-ui | marketing-studio/image | medium · 2k · 16:9 | 1.450 | 0.091 |
| d2-plate | higgsfield-ai/soul/cinema | 1080p · 16:9 | 0.088 | 0.006 |
| d2-ui | marketing-studio/image | medium · 2k | 1.440 | 0.090 |
| d3-plate | marketing-studio/image | high · 2k | 4.028 | 0.252 |
| d3-plate-v2 | marketing-studio/image | high · 2k (안별 보정 1회) | 4.219 | 0.264 |
| d3-ui | marketing-studio/image | medium · 2k | 1.445 | 0.091 |
| d4-plate | marketing-studio/image | high · 2k | 4.024 | 0.252 |
| d4-ui | marketing-studio/image | medium · 2k | 1.433 | 0.090 |
| d5-plate | recraft/v4.1/pro/text-to-image | 2K · 16:9 | 3.360 | 0.210 |
| d5-ui | marketing-studio/image | medium · 2k | 1.434 | 0.090 |
| l1~l5-logo | ideogram/v4.0 | QUALITY · 1:1 × 5 | 8.000 | 0.500 |
| 1차 소계 | | 16건 | 34.955 | ≈ 2.19 |
| v2-d1-korea | higgsfield-ai/soul/cinema | 1080p · 1:1 | 0.088 | 0.006 |
| v2-d1-city | higgsfield-ai/soul/cinema | 1080p · 1:1 | 0.088 | 0.006 |
| v2-d2-dusk | higgsfield-ai/soul/cinema | 1080p · 16:9 | 0.088 | 0.006 |
| v2-d4-ceramic | higgsfield-ai/soul/cinema | 1080p · 16:9 (고리 형태 결함 → 미사용) | 0.088 | 0.006 |
| v2-d4-ceramic-v2 | marketing-studio/image | high · 2k · 16:9 (안별 보정 1회) | 4.026 | 0.252 |
| v4-s1~s4 콘티 스틸 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 4 (화면 초록) | 0.352 | 0.024 |
| **합계** | | 25건 | **39.685** | **≈ 2.49** |

**남은 예산(추정): 약 7.51 USD** · soul/cinema의 num_images=4는 실제로 1장만 반환됨(견적도 1장 기준).

## 영상 단가 — Seedance 2.0 image-to-video (16:9, 무음)
공식 산식: 토큰 = ceil(초 × 가로 × 세로 × 24 / 1024), 1080p 이하 1천 토큰당 $0.014, 4K 1천 토큰당 $0.008.

| 길이 | 720p | 1080p | 4K |
|---|---:|---:|---:|
| 5초 | ≈ $1.51 | $3.40 | $7.78 |
| 6초 | ≈ $1.81 | $4.08 | $9.33 |
| 8초 | ≈ $2.42 | $5.44 | $12.44 |
| 10초 | ≈ $3.02 | $6.80 | $15.55 |

- 남은 약 7.51 USD로는 **1080p 8초(5.44)는 가능, 4K 8초(12.44)는 불가.** 4K는 5초(7.78)도 잔액을 넘음.
- 영상은 사용자가 시안 번호를 고르고 "제작해"라고 한 뒤에만 생성한다.
