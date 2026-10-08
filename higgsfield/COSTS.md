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
| v5-s1~s4 a·b 밝은 콘티 스틸 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 8 (장면당 2안, 애플 기기) | 0.704 | 0.048 |
| v6-s1~s4 영화 장면 스틸 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 4 (장면당 1장) | 0.352 | 0.024 |
| v7-c1~c6 7차 콘티 스틸 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 6 (장면당 1장) | 0.528 | 0.036 |
| v8-c1·c3·c7 8차 콘티 스틸 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 3 (장면당 1장) | 0.264 | 0.018 |
| v9 장면 3장 + ChillenQ 제품 시안 2장 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 5 (제품 1장은 세미트레일러로 잘못 나와 재생성) | 0.440 | 0.030 |
| v10 모델 비교(동대문: soul/v2 · grok 2k · soul/cinema) | 3개 엔드포인트 | 1080p/2k × 3 | 1.458 | 0.092 |
| v10 실사 장면 5장 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 5 | 0.440 | 0.030 |
| v11 동대문(실제 가게 사진 참고 편집: qwen-image-3/edit 2k · grok 2k 비교) | 2개 엔드포인트 | 2k × 2 | 2.800 | 0.175 |
| v12 케이크 고화질·동대문(참고 편집 qwen 2k ×2) + Chemilife 장면(soul/cinema) | 2개 엔드포인트 | 3장 | 2.488 | 0.156 |
| v13 컷 1 클로즈업 장면 | higgsfield-ai/soul/cinema | 1080p · 16:9 × 1 | 0.088 | 0.006 |
| v14 가상 카페 ONDO(평범한 사진·카페 장면 soul/cinema ×2, 광고 장면 qwen edit 2k ×1) | 2개 엔드포인트 | 3장 | 1.376 | 0.087 |
| v15 자연스러운 광고 장면(qwen edit 2k ×2) | alibaba/qwen-image-3/edit | 2장 | 2.400 | 0.150 |
| v16 ChillenQ·K-VIBE 자연스러운 구도(soul/cinema, 1건 실패 후 재시도) | higgsfield-ai/soul/cinema | 2장 | 0.176 | 0.012 |
| v18 문제→해결 장면 5장(soul/cinema, 1건 실패 후 재시도) + AI 광고 장면 2장(qwen edit 2k) | 2개 엔드포인트 | 7장 | 2.840 | 0.177 |
| v19 패키지 제품 사진·절제된 광고 장면(qwen edit 2k ×6, 실패 1건 제외) | alibaba/qwen-image-3/edit | 6장 | 7.200 | 0.450 |
| v20 대표님 장면(Blooming 홈베이커·ChillenQ 대표) | higgsfield-ai/soul/cinema | 2장 | 0.176 | 0.012 |
| v21 설계 콘티(밤 어깨 너머·위에서 본 휴대폰 soul/cinema ×2, 아침 매치컷 qwen edit 2k ×1) | 2개 엔드포인트 | 3장 | 1.376 | 0.087 |
| v22 실제 고객 B-roll 6장(qwen edit 2k ×3, soul/cinema ×3) | 2개 엔드포인트 | 6장 | 3.864 | 0.243 |
| **합계** | | 96건 | **68.655** | **≈ 4.34** |

**남은 예산(추정): 약 5.66 USD** (실패 작업은 환불 대상이라 합계에서 제외) (사용자가 영상 단계 전에 충전 예정) · soul/cinema의 num_images=4는 실제로 1장만 반환됨(견적도 1장 기준).

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

- 실사 비교(2026-10-06): 같은 프롬프트로 soul/cinema가 가장 실사에 가까움(실제 카메라·렌즈 표현이 효과적). grok 2k는 비싸고($0.08) 간판이 작음, soul/v2는 간판 아래 깨진 글자.
- 참고 사진 편집(2026-10-06): 실제 장소를 맞춰야 할 때는 참고 이미지를 넣는 qwen-image-3/edit가 가장 정확(간판·포스터·네온까지 재현). grok은 사람이 많고 구도가 붐빔.

## 28차 (2026-10-07) — 시네마틱 공간 정지 화면 (보류된 방향)
- soul/cinema 1080p 12장 × $0.006 = **$0.072** (견적 API 기준). 공간 컷 4종 + 세로 1종(재촬영 1) + 섹션용 4종(재촬영 2).
- 사용자가 다음 메시지에서 3차 방향(가로 작업물 벽)으로 돌아가기로 해서 보류. 결과물·합성 시안은 `drafts/v28/` 보관.

## 30차 (2026-10-08) — AI 광고영상 샘플 3편 + BEFORE 화면 사진
- 스틸 soul/cinema 1080p 10장 × 약 $0.006 = **약 $0.06**: 여행(BEFORE·호수·선착장), 꿀(BEFORE·BEFORE 재촬영·흘러내림·병·병 재촬영), BEFORE/AFTER 템플릿 사진 2장(여행·케이크). 재촬영 2건은 결과가 어색해서(BEFORE가 피클처럼 보임, 병 라벨) 새 이름으로 다시 만든 것(같은 이름 재제출 아님).
- 영상 DoP standard(`higgsfield-ai/dop/standard`, 1280×720 · 5.37초) 6개 × $0.563 = **$3.378**: ONDO(김·라떼 붓기), SOUTHERN ROUTE(호수·선착장), DAON(꿀 흘러내림·병).
- 이번 회차 합계 **약 $3.44**, REST 지갑 남은 금액 약 $0.7(사용자 충전 전까지 새 생성 없음). Seedance는 견적 API가 가격을 돌려주지 않아 DoP를 씀.
- 작업 기록 `higgsfield/jobs/v30-*.json`, 입력 `higgsfield/inputs/v30/`, 결과 `higgsfield/raw/v30-*`. 편집은 `tools/ad_edit.py`(사이트 파일 `site/public/media/film/{ondo,route,daon}*`).

