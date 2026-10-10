# PAUSE STUDIO 사이트 리뉴얼 — 이어서 작업하는 세션용
세션을 시작하면 바로: HANDOFF.md → docs/STATE.md → docs/DESIGN_SYSTEM.md 순서로 읽고, HANDOFF.md의 '남은 일'을 순서대로 끝까지 진행한다.
- 브랜치 `claude/charming-euler-bt8uf2`에서만 작업하고, 단계마다 커밋·푸시한다. PR은 만들지 않는다.
- 사용자에게는 한국어로 보고한다. 기준: 고감도, 사람이 만든 듯, AI 티 금지.
- Higgsfield API 키는 저장소 밖 환경변수(HF_API_KEY 등)나 git에 올리지 않는 `.env.local`에서만 읽는다. 키를 출력하거나 커밋하지 않는다.
- 파이썬 준비: pip install numpy opencv-python pillow scipy fonttools brotli onnxruntime / 사이트: cd site && npm ci && npm run build
