# 28차 — Higgsfield 공간 촬영 × 실제 작업물 합성 (보류, 2026-10-07)

기획 v2(`docs/SITE_PLAN.md`)의 "AI가 찍고, 코드가 합성한다" 시험. 사용자가 3차 가로 작업물 벽으로 돌아가기로 해서 **보류**. 나중에 섹션 연출(관리비 영수증 등)에 다시 쓸 수 있음.

- 장면: `higgsfield/raw/v28-*` (soul/cinema 1080p, 사람 없음, 화면은 빈 흰 화면으로 촬영)
- 합성: `python3 tools/composite_v28.py [cuts|receipt]` → `comp/`
  - `c1-kvibe` LED 홀 · `c2-blooming` 석재 쇼룸 노트북 · `c3-dongdaemoon` 갤러리 투사 · `c4-chillenq` 비 오는 쇼윈도 · `m1-blooming` 세로 LED
  - `s-receipt` 영수증 종이(휘어진 띠)에 $0.00 줄을 인쇄된 것처럼 합성
- `media/` — 실제 작업물 영상(ref01·02·07)에서 뽑은 정지 프레임
