# 2차 히어로 시안 5종 (2026-10-06)

- PNG: `drafts/v2/composites/hero-0N_1920x1080.png` · 보드: `drafts/v2/PAUSE_hero_drafts_v2_board.png` · 미리보기: `drafts/v2/preview.html`(←/→ 키)
- 조판 원본: `drafts/v2/hero-0N.html`(직접 열면 마루 부리로 대체 표시) · 생성: `python3 tools/typeset_v2.py` → `node tools/capture_v2.cjs` → `python3 tools/board_v2.py` → `node tools/capture_board.cjs v2`
- **제작 방식(각 PNG 하단 표기)**: 아트워크는 Higgsfield 생성(03은 실제 포트폴리오 원본, 05는 로고의 원을 코드로 확장한 SVG), 문구·로고·버튼은 HTML 조판. 서체는 각 폰트 회사 공식 테스터 페이지 안에서 그 서체로 렌더링해 캡처(폰트 파일 미다운로드).
- **공통 원문**: 헤드라인·설명·수치·안내·CTA·메뉴 모두 `content/site-content.ko.json`에서 그대로(줄바꿈 위치만 지정).
- **로고**: 사용자 제작 로고 벡터(`content/assets/logo/new/vector`) — 밝은 배경 잉크 #1A1B1C, 어두운 배경 크림 #FCEED8.
- 1차(보류)와 달라진 점: 새 로고·파비콘, 흔한 무료 서체 대신 실무 서체(안마다 다르게), 3D 오브젝트·추상 생성 그래픽 대신 사진·실제 작업물·로고에서 나온 도형.

## 01 두 개의 원 — 편집·타이포그래피 (밝음, 크림 #F4EFE6)
- 아이디어: 로고의 두 원 = 한국과 지금 사는 도시. 왼쪽 원은 한지 창(소나무 그림자), 오른쪽 원은 아침의 오클랜드 항구. 겹친 부분은 두 사진을 곱하기로 겹침. 로고 비율 그대로의 가는 원 테두리.
- 서체: SD 정체 630(산돌, 2025, 문학적인 본문 활자) — 명조 헤드라인 96px.
- 영상: 원 안 사진만 아주 천천히(소나무 그림자 흔들림 / 물결), 원·글자 고정. Seedance로 사진 두 장을 각각 짧은 루프로.
- Higgsfield: `v2-d1-korea`(e03dd85f…), `v2-d1-city`(2e069215…) — soul/cinema 1:1
- 레퍼런스: Kinfolk(편집적 여백·가운데 정렬 세리프) https://www.kinfolk.com/ · Aman(크림 바탕·절제된 헤더) https://www.aman.com/

## 02 밤의 항구 — 사진·시네마틱 (어두움)
- 아이디어: 푸른 시간의 오클랜드 항구. 로고는 가운데, 메뉴는 양옆. 도시 불빛은 위, 문구는 어두운 물 위.
- 서체: SD 그레타산스(타이포테크×산돌) SemiBold·Regular·Medium.
- 영상: Seedance 2.0 image-to-video — 물 위 반사광이 흔들리고 불빛이 숨 쉬듯, 카메라 고정. 문구는 HTML로 위에.
- Higgsfield: `v2-d2-dusk`(ceb3e249…) — soul/cinema 16:9 (사진을 190px 올리고 아래는 물 색으로 이어 붙임)
- 레퍼런스: Gentle Monster(풀블리드 사진 + 가운데 워드마크·알약 버튼) https://www.gentlemonster.com/kr/ko · The Row(사진 한 장 + 최소 메뉴) https://www.therow.com/ · Aman

## 03 작업 색인 — 실제 작업물 (중간 밝기, #E6E2DA)
- 아이디어: 실제 포트폴리오를 색인 목록으로. 위 큰 화면 = 선택한 작업(Ref.03 한식당 '동대문'), 아래 목록 6개(Ref.03·04·11·08·05·13, 실제 분류명).
- 서체: AG 최정호 민부리 스크린(AG타이포그라피연구소, 2024) — 단일 굵기.
- 모션: 목록에 올리면 큰 화면이 그 작업으로 교체, 영상 작업물(Ref.01·02·07)은 원본 영상 재생. 영상 생성 불필요.
- 레퍼런스: Pentagram Work 색인 https://www.pentagram.com/work · Plus X https://plus-ex.com/
- 주의: Ref.17~39는 소유 확인 전이라 사용하지 않음.

## 04 두 개의 고리 — 재료·조형 (절제된 유채색: 올리브·호두나무·크림)
- 아이디어: 로고의 두 원을 손으로 빚은 도자기 고리로. 창빛이 비스듬히 벽을 지난다.
- 서체: 마루 부리(네이버, OFL 무료) SemiBold·Regular.
- 영상: 창빛이 벽을 따라 천천히 이동, 고리·탁자 정지.
- Higgsfield: `v2-d4-ceramic`(446b1a5d…, soul/cinema — 고리 형태가 뭉개져 미사용) → `v2-d4-ceramic-v2`(585019df…, marketing-studio/image high, 안별 보정 1회)
- 레퍼런스: The Row(사진 한 장의 정물적 화면), Kinfolk(자연광·재료감)

## 05 간섭 — 그래픽·광학 (검정 #090909 + 크림)
- 아이디어: 로고의 두 원(같은 비율)을 동심원으로 넓혀 겹친 곳에 모아레가 생긴다. 굵은 두 원은 로고의 원.
- 서체: ABC Favorit Hangul(디나모, 한글 윤민구) Medium·Regular.
- 모션: 동심원이 천천히 바깥으로 퍼지는 SVG/Canvas 애니메이션(영상 파일 없이 가볍고 선명), 마우스 위치로 중심이 약간 이동. 참고 저장소(awesome-opus5-5-videos)의 동심원·간섭 계열 모션.
- Higgsfield: 사용 안 함(로고 도형을 코드로 정확히 그리는 편이 선명).

## 서체 웹 사용 비용(확정 시)
01·02 산돌구름 웹폰트 스탠다드 월 33,000원(2종) · 03 AG 웹폰트 임베딩 별도 문의(기본 라이선스 350,000원은 인쇄·이미지용) · 04 무료 · 05 디나모 라이선스(회사 규모 견적) 또는 Fontstand 월 €27. 자세히: `research/FONTS_KR.md`.
