# Pause Studio 새 로고 (사용자 제작, 2026-10-06 수령)

- `original/` — 사용자 원본 PNG(1672×941, 투명 배경). 수정하지 않음.
  - `pause-studio-logo_ink_user-original.png` sha256 02bd0815806974985cded62a9bad36d0fed0840f06216de5f6d1aff27eb97952
  - `pause-studio-logo_cream_user-original.png` sha256 c9015c51e51442194cc4dfe98c8bd19390dd848e619a70c3cb48cf8eab360f00 (가장자리 빛 번짐 있음 → 색 기준으로만 사용)
- `vector/` — 웹용 SVG (`tools/logo_vectorize.py`)
  - `pause-studio-logo-ink.svg`(#1A1B1C) · `-cream.svg`(#FCEED8) · `-currentcolor.svg`(CSS 색 상속) — **기본 사용본**
  - `pause-studio-logo-ink_traced-as-is.svg` — 원의 미세한 흔들림까지 픽셀 그대로 추적한 참고본
- `png/` — 투명 PNG 400/800/1600/3200w (`tools/logo_export.cjs`)
- `measure.json` — 원·® 측정값, `work/verify.json`·`work/diff.png` — 원본 대비 검증 (`tools/logo_verify.cjs`, `tools/logo_verify.py`)

## 만든 방식
- 글자: 원 부분을 뺀 알파를 4배 확대해 potrace로 윤곽 추출(글자 띠 IoU 98.9%).
- 두 원: 각도별 단면 중심을 측정해 타원으로 맞춤 — 가로 반지름 364.3, 세로 372.0(원본 그대로 세로로 약 2% 긴 타원), 선 두께 12.3, 글자 띠에서 끊긴 위치 y 375.24 / 597.45. 원본 원의 흔들림(최대 약 2.3px/740px)은 정리됨.
- ®: 바깥 원은 측정한 정원(반지름 34.17, 두께 8.69), 안쪽 R은 8배 확대·약한 블러 후 추적.
- 최소 크기: 헤더 가로 140px 이상 권장(모바일 120px). 96px 이하에서는 원 선이 1px 미만.

## 파비콘 (사용자 제작 PS 모노그램, 2026-10-06 수령) — `favicon/`
- 원본: `favicon/original/pause-studio-favicon_user-original.webp` (1254×1254) sha256 d71455d83ad8b5bf267400921303034697161afdc637fd1dd1bee34ba3ac181b
- `favicon.svg`(둥근 타일, 브라우저 탭) · `icon-fullbleed.svg`(iOS 홈 화면용, 모서리는 기기가 자름) · `icon-maskable.svg`(안드로이드, 가운데 80% 안전 영역)
- `favicon.ico`(16·32·48), `png/favicon-{16,32,48,64,192,512}.png`, `png/apple-touch-icon-180.png`, `png/icon-maskable-512.png`
- 만든 방식(`tools/favicon_build.py`, `tools/favicon_export.cjs`, `tools/favicon_verify.py`): 타일은 원본 그대로 846×827·모서리 반지름 199의 정확한 도형, 크림 모노그램(두 원과 P·S의 엮임)은 4배 확대 윤곽 추적.
  원본 대비 타일 IoU 99.8%, 모노그램 99.1%. 크림색은 로고와 같은 #FCEED8로 통일, 타일 검정 #090909(원본 측정).
- 16px(저해상도 화면)에서는 획이 1px 미만이라 P·S가 뭉개짐. 32px 이상(고해상도 화면 탭 포함)은 선명.
