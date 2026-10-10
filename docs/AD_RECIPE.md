# AI 광고영상 제작 방법 기록 (사용자가 "무슨 모델로 만들었어?" 물으면 여기서 답한다)

마지막 갱신: 2026-10-10 (32차). 실제 프롬프트 원문은 `higgsfield/inputs/v32/*.json`, 제출·결과 기록은 `higgsfield/jobs/v32-*.json`, 원본 결과물은 `higgsfield/raw/v32-*/`, 비용은 `higgsfield/COSTS.md`.
API 호출은 `tools/hf.mjs`(키는 저장소 밖 `.env.local`의 HF_CREDENTIALS, 출력·커밋 금지).

## 사용자가 정한 방향 (2026-10-10)
- **한 편 5초, 소리 없음.** 완성 광고(처음~끝, 브랜드 카드)가 아니라 "AI 영상에서 포인트 되는 부분만 편집해서 보여 주는" 하이라이트.
- **화질 기준 = 사용자가 준 참고 영상** `C:\Users\Administrator\Downloads\1789021650456_nupb3n_UGC-Skincare-Selfie-Vlog.mp4`(La Mer 크림 UGC 셀카, 1080p 15초). 이 영상과 똑같은 느낌, **제품만 우리 것으로**.
- 모델은 **Kling 2.5 Turbo Pro**(싸서). Seedance 2.0은 비싸고 견적 API가 가격을 안 줘서 쓰지 않는다(쓸 거면 먼저 사용자에게 묻기).
- 제품은 **브랜드 라벨이 보여야** 한다(빈 유리병 금지).
- 사람이 실제로 할 수 없는 것 금지: **셀카면 한 손은 폰을 들고 있다** → 두 손이 필요하면 "폰을 앞에 세워 둠"으로. 손이 셋·오른손 둘 등 반드시 확인. 시선은 렌즈 또는 제품, 표정은 자연스럽게.
- 사용자 반응: 1) 물방울·병 접사 광고(Kling)는 "광고 같지 않다", 2) Qwen으로 만든 한국인 인물 + Seedance 720p는 "누가 봐도 AI", 3) 참고 영상 프레임 기반 Kling은 "인물은 잘 만들었다".

## 지금 쓰는 제작 순서 (SOOM 기준)
1. **라벨 있는 제품 사진** — `alibaba/qwen-image-3/edit` (2k, 1:1, 약 $0.075)
   입력: 사장님 BEFORE 사진(`site/public/media/film/soom-before.jpg`) 1장. 프롬프트 `higgsfield/inputs/v32/soom-pack.json`
   요지: 같은 병 모양 + 무광 흰 종이 라벨, 가운데 넓고 가는 검정 대문자 `SOOM`, 아래 작게 `HYDRA SERUM`, `30 ml`, 철자 정확히, 연회색 배경 제품 사진.
   결과 `higgsfield/raw/v32-soom-pack/v32-soom-pack_01.png`
2. **첫 프레임(인물+제품)** — `alibaba/qwen-image-3/edit` (2k, 16:9)
   입력: 참고 영상 2.0초 프레임(`drafts/v32/ref/k_2.0.png`, `ffmpeg -ss 2.0`로 추출) + 1의 제품 사진. 프롬프트 `soom-ref-k2.json`
   요지: image 1의 모든 것(인물·주근깨·붉은 볼·앞머리·파란 귀걸이·낮은 노을 직사광과 얼굴 그림자·배경·구도·그레인) 그대로, **크림통만** image 2의 제품으로 교체, 라벨이 카메라를 향하고 SOOM이 또렷이 읽히게, 손은 하나만.
   결과 `higgsfield/raw/v32-soom-ref-k2/v32-soom-ref-k2_01.png`
3. **5초 영상** — `kling-video/v2.5-turbo/pro/image-to-video` (duration 5, cfg_scale 0.5, 1920×1080, 약 $0.30)
   입력: 2의 첫 프레임. 프롬프트 `soom-ref-v2k.json`
   요지: 폰은 앞에 세워 둠(손에 안 듦), 손은 정확히 둘(왼손 병·라벨이 계속 카메라, 오른손 자유) → 0–1.5초 오른손으로 머리를 귀 뒤로 넘기며 렌즈를 봄 → 1.5–4초 병을 렌즈 가까이, 오른손 손톱으로 라벨을 두세 번 톡톡(ASMR), 탭할 때 병을 내려다봄 → 4–5초 다시 렌즈 보며 살짝 지친 듯 자연스러운 반미소. 노을 직사광·주근깨 유지.
   부정어: third hand, two right hands, extra fingers, face drift, stiff expression, eyes looking nowhere, changing/misspelled label, extra bottles, plastic skin, glossy ad lighting, watermark, subtitles
4. **편집** — 소리 제거, H.264, `drafts/v32/`에 저장. 사용자 확인 뒤 사이트(`site/public/media/film/`)로.

## 이전 시도 (참고)
- `soom.mp4`: qwen-image-3/edit 정지 화면 + Kling 2.5 Turbo Pro 2컷(물방울 접사·병 빛 쓸기) + Archivo·마루부리 글자 → 사용자 "광고 같지 않다"
- `soom-ugc.mp4`: qwen-image-3/edit로 한국인 인물 첫 프레임 + `bytedance/seedance-2.0/image-to-video` 720p 7초(소리 포함) → 사용자 "인물이 누가 봐도 AI"
- `soom-highlight.mp4`: 참고 영상 프레임에서 제품만 빈 병으로 교체(qwen) + Kling 2.5 Turbo Pro → "인물은 좋다, 그러나 라벨 없음·오른손 둘·표정·시선 어색"
- `higgsfield-ai/soul/cinema`는 이 계정에서 2번 연속 "Generation failed".
