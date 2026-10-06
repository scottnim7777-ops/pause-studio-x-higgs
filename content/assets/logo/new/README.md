# Pause Studio 새 로고 (사용자 제작, 2026-10-06 수령)

- `original/` — 사용자 원본 PNG(1672×941, 투명 배경). 수정하지 않음.
  - `pause-studio-logo_ink_user-original.png` sha256 02bd0815806974985cded62a9bad36d0fed0840f06216de5f6d1aff27eb97952
  - `pause-studio-logo_cream_user-original.png` sha256 c9015c51e51442194cc4dfe98c8bd19390dd848e619a70c3cb48cf8eab360f00 (가장자리 빛 번짐 있음 → 색 기준으로만 사용)
- `vector/` — 웹용 SVG (`tools/logo_vectorize.py`)
  - `pause-studio-logo-ink.svg`(#1A1B1C) · `-cream.svg`(#FCEED8) · `-currentcolor.svg`(CSS 색 상속) — **기본 사용본**
  - `pause-studio-logo-ink_traced-as-is.svg` — 원의 미세한 흔들림까지 픽셀 그대로 추적한 참고본
  - `favicon-A-rings-*.svg`, `favicon-B-P-*.svg` — 파비콘 **제안**(사용자 선택 전)
- `png/` — 투명 PNG 400/800/1600/3200w, 파비콘 32/180/512 (`tools/logo_export.cjs`)
- `measure.json` — 원·® 측정값, `work/verify.json`·`work/diff.png` — 원본 대비 검증 (`tools/logo_verify.cjs`, `tools/logo_verify.py`)

## 만든 방식
- 글자: 원 부분을 뺀 알파를 4배 확대해 potrace로 윤곽 추출(글자 띠 IoU 98.9%).
- 두 원: 각도별 단면 중심을 측정해 타원으로 맞춤 — 가로 반지름 364.3, 세로 372.0(원본 그대로 세로로 약 2% 긴 타원), 선 두께 12.3, 글자 띠에서 끊긴 위치 y 375.24 / 597.45. 원본 원의 흔들림(최대 약 2.3px/740px)은 정리됨.
- ®: 바깥 원은 측정한 정원(반지름 34.17, 두께 8.69), 안쪽 R은 8배 확대·약한 블러 후 추적.
- 최소 크기: 헤더 가로 140px 이상 권장(모바일 120px). 96px 이하에서는 원 선이 1px 미만.
