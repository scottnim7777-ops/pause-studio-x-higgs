# 한글 서체 조사 (2026-09-29)

사용자 피드백(1차 시안): "폰트가 허접하고 AI 티가 난다" → 1차에 쓴 프리텐다드·SUIT·IBM Plex Sans KR·고운바탕·함렛은 모두 후보에서 제외하고, 실제 디자인 스튜디오가 쓰는 한글 서체를 다시 조사했다.

- 비교 보드: `drafts/fonts/PAUSE_font_candidates.png` (생성: `python3 tools/font_board.py && node tools/capture_board.cjs fonts`)
- 견본: `drafts/fonts/specimens/*.png` — 모두 같은 원문·같은 크기(제목 96px, 설명 27px, 안내 21px, 버튼 22px). 각 폰트 회사 공식 페이지의 테스터 글꼴을 그 페이지 안에서 불러와 조판·캡처했다(`tools/font_specimens.cjs`). 폰트 파일은 내려받지 않았다. 사용한 스타일은 `specimens/specimens.json`.

## 조사 방법
1. Fonts In Use ‘Korean/Hangul’ 태그(전체 172건) 중 최근 59건의 서체 표기를 집계: Sandoll 고딕Neo 11, Pretendard 9, 지백 3, 본고딕 2, AG 마당 2, 그 외 1건씩(을유1945, AG 최정호 민부리, AG 초특태고딕, SM 계열 등). 집계 스크립트 결과는 로컬 전용.
2. 폰트 회사 공식 페이지에서 디자이너·스타일 수·출시 연도·웹 사용 조건·가격 확인.
3. 한국 디자인 매체·추천 글(안티에그, 모노타입 디자인210 등)은 발견 경로로만 사용.

## 후보 11종

| 구분 | 서체 | 만든 곳 · 디자이너 · 연도 | 성격 | 웹 사용 조건·비용 |
|---|---|---|---|---|
| 제목 | ABC Favorit Hangul | 디나모(스위스) · 한글 윤민구 | 낮은 대비의 기하학 그로테스크, 영문 Favorit과 한 가족 | 디나모 라이선스(회사 인원 기준) 또는 Fontstand 대여 월 €27(전 스타일, 데스크톱+웹) |
| 제목 | Ortank Hangeul | 로올(lo-ol, 스위스·한국) · 이노을 | 굵기·대비·광학 크기 가변 그로테스크, Text/Display | 스타일당 CHF 70부터(웹) |
| 제목 | SD 격동고딕2 | 산돌 · 김초롱·강주연·성준석·장수영 · 2021 | 네모틀을 꽉 채운 굵은 고딕(원작 2014), 7종 | 산돌구름 웹폰트 |
| 제목 | SD 격동명조2 | 산돌 · 박부미·최성우·구모아 · 2023 | 활판 명조의 붓 맺음, 좁은·기본·넓은 폭 15종 | 산돌구름 웹폰트 |
| 본문·UI | **SD 그레타산스** | 타이포테크 × 산돌 · 피터 빌락·위예진·이수현·김초롱 · 2023(원작 2020) | 휴머니스트 산스, 넉넉한 형태, 한글 11,172자·20종, 영문 Greta Sans와 한 가족 | 산돌구름 웹폰트 |
| 본문·UI | SD 민부리 | 산돌 · 이유빈·김지수·이수현·노은유·김진희 · 2024 | 화면용 본문 민부리, 굵기·한글 간격·영문 간격 가변 | 산돌구름 웹폰트 |
| 본문·UI | AG 최정호 민부리 스크린 | AG타이포그라피연구소 · 박한솔 · 2024 (원도 최정호) | 최정호 민부리의 화면용 재설계, 단일 굵기 | 기본 라이선스 350,000원은 인쇄·웹 이미지용. 웹폰트(임베딩)는 별도 문의 |
| 본문·UI | SD 정체 | 산돌 · 박수현·송미언·김초롱 · 2025 | 문학적인 본문 활자, 590·690은 제목용 볼드, 16종 | 산돌구름 웹폰트 |
| 본문·UI | Sandoll 고딕Neo1 | 산돌 · 권경석·이도경 · 2011 | 실무 표준 고딕(Apple SD 산돌고딕 Neo의 바탕) | 산돌구름 웹폰트. 데스크톱은 Adobe CC 구독에도 포함 |
| 무료 | 마루 부리 | 네이버 | 현대적 부리(명조) | 네이버 글꼴 OFL — 웹 포함 상업 사용 가능 |
| 무료 | 을유1945 | 을유문화사 | 책 본문 활자, 2종 | 웹페이지 사용 가능, 파일 재배포·판매 불가 |

산돌구름 웹폰트 요금(2026-09-29): 트라이얼 무료 1개월(1GB·1종) · 스탠다드 월 33,000원(월 5GB·2종) · 프로 월 99,000원(20GB·4종) · 비즈니스 월 385,000원. 초과 전송 1MB당 6원. 1계정 1요금제 1프로젝트. 데스크톱용 산돌 이용권과는 별개 서비스.

참고(후보 제외): **지백**(활자모 박진현) — 워크룸(서울시향 2024 시즌)·워터레인(2024 Docking! 웹사이트)·돈워리베이비(전주 시네투어)가 쓴 본문용 민부리. 2022년 베타 이후 정식 판매 여부를 확인하지 못함 → 쓰려면 디자이너에게 직접 문의.

## 추천
**SD 그레타산스** 한 가족으로 사이트 전체(제목 SemiBold, 본문 Regular, 버튼 Medium).
- 넉넉한 휴머니스트 형태라 긴 설명·가격·FAQ까지 편하게 읽힌다(브리프: "한국어 문구 자체가 아름답고 편하게 읽히는 조판").
- 요즘 흔한 기하학 고딕과 뼈대가 달라 첫인상이 다르다. 영문 Greta Sans와 한 가족이라 영문 병기도 자연스럽다.
- 산돌 웹폰트 스탠다드(2종)면 제목용 개성 서체 1종을 더할 수 있다.

대안 ① 개성: 제목 SD 격동명조2 + 본문 SD 민부리(같은 요금제 2종). 대안 ② 국제 스튜디오 톤: ABC Favorit Hangul.
**최종 확정은 사용자가 만든 로고를 받은 뒤**, 로고 글자와의 조화를 보고 정한다. 로고에 폰트를 쓸 경우 CI·BI 허용 여부 확인(산돌 이용권 허용, AG 별도 문의).

## 출처
- https://fontsinuse.com/tags/3836/korean-hangul-language-script · https://fontsinuse.com/uses/59651/seoul-philharmonic-orchestra-2024-season · https://fontsinuse.com/uses/64182/2024-docking
- https://www.sandollcloud.com/webfont/use (웹폰트 요금) · 각 폰트 페이지: /font/18013.html(SD 그레타산스), /font/15556(격동고딕2), /font/18510(격동명조2), /font/20811(SD 민부리 Space3), /font/21615(SD 정체), /font/8(고딕Neo1), /font/16639.html(을유1945), /free-font/16193(마루 부리)
- https://www.sandoll.co.kr/press/?bmode=view&idx=16886809 (산돌구름 최다 검색 폰트: 격동고딕)
- https://agfont.com/fonts/ag-choijeongho-minburi-screen (가격·라이선스 범위)
- https://abcdinamo.com/typefaces/favorit-hangul · https://fontstand.com/fonts/favorit-hangul
- https://www.typotheque.com/fonts/korean · https://www.typotheque.com/blog/greta-sans-korean-a-hangul-humanist-sans-typeface-system
- https://www.lo-ol.design/catalog/ortank-hangeul
- https://tumblbug.com/jibaek · https://noonnu.cc (지백 판매 상태)
