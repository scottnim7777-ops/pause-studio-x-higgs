# 시안에 쓴 폰트 (모두 SIL Open Font License 1.1 — 웹 임베딩·상업적 사용 가능)

| 폰트 | 용도(시안) | 출처 | 라이선스 파일 |
|---|---|---|---|
| Hahmlet (가변, wght 100–900) | 01 헤드라인·수치, L1 한글 | github.com/google/fonts ofl/hahmlet | OFL-Hahmlet.txt |
| Instrument Serif | L1 워드마크 | google/fonts ofl/instrumentserif | OFL-InstrumentSerif.txt |
| Pretendard Variable 1.3.9 | 01·02·04 본문·버튼, 02 헤드라인, L2 한글 | npm `pretendard@1.3.9` | OFL-Pretendard.txt |
| Archivo (가변, wdth 62–125) | L2 워드마크 | google/fonts ofl/archivo | OFL-Archivo.txt |
| IBM Plex Sans KR / IBM Plex Mono | 03 전체, L3 | google/fonts ofl/ibmplexsanskr, ibmplexmono | OFL-IBMPlexSansKR.txt, OFL-IBMPlexMono.txt |
| Gowun Batang | 04 헤드라인·설명, L4 한글 | google/fonts ofl/gowunbatang | OFL-GowunBatang.txt |
| Fraunces (가변, SOFT·opsz) | L4 워드마크 | google/fonts ofl/fraunces | OFL-Fraunces.txt |
| SUIT Variable | 05 전체, L5 | github.com/sun-typeface/SUIT (jsDelivr) | OFL-SUIT.txt |
| Grandiflora One (해성 조) | 29차 히어로 시안 C 헤드라인·수치 | google/fonts ofl/grandifloraone | OFL-GrandifloraOne.txt |

- 폰트 파일은 용량(약 40MB) 때문에 저장소에 넣지 않는다: `tools/fetch-fonts.sh` 로 다시 받는다.
- 로고 SVG는 글자를 윤곽선(path)으로 변환해 폰트 없이도 형태가 유지된다.
- 제작 단계에서는 필요한 글자만 서브셋한 WOFF2로 전달한다.


## 상용 서체(파일 없음 — 산돌구름 공식 테스터 페이지 안에서만 렌더링)
- SD 그레타산스(산돌 font/18013) · SD 격동고딕2(산돌 font/15556): 29차 시안. 실제 사이트 적용 시 산돌구름 웹폰트 요금제 필요(스탠다드 2종).
