"""15차(14차 흐름 유지, 5번 광고 장면을 자연스러운 컷으로 교체 — 아침 햇살 속 컵과 옅은 김, 원래 사진과 같은 위치): 단순하게 — 평범한 사진 한 장 → 고급 홍보영상 → 그 영상이 걸린 웹사이트 → 실제 고객 사이트들 → PAUSE STUDIO 로고(무한 반복)
- AI 홍보영상 예시는 가상의 카페 'ONDO COFFEE'(실제 업체 아님, 사용자 요청): 평범한 사진(soul/cinema) → 같은 사진을 참고로 광고 장면(qwen-image-3/edit, v15-after-a) → 카메라 질감 후처리
- 채팅·파비콘·설명 문구 없음
실행: python3 tools/storyboard_v14.py
"""
import shutil

import cv2
import numpy as np

from storyboard_v4 import ROOT, RAW, composite

V = ROOT / 'drafts' / 'v15'
OUT = V / 'shots'
LOOK = dict(grain=2.5, vig_amt=0.06, glow_amt=0.12, soft=0.6, lift=6, reflect=0.05, out_dir=OUT)


def fit(img):
    return cv2.resize(img, (1920, 1080), interpolation=cv2.INTER_AREA)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    before = fit(cv2.imread(str(RAW / 'v14-ondo-before' / 'v14-ondo-before_01.png')))
    after = fit(cv2.imread(str(V / 'screens' / 'src' / 'ondo_after.png')))  # v15-after-a + 카메라 질감
    cv2.imwrite(str(OUT / 'c1-before.jpg'), before, [cv2.IMWRITE_JPEG_QUALITY, 92])
    # 컷 2 중간: 빛줄기가 지나가며 평범한 사진이 광고 장면으로 바뀌는 순간
    W = 1920; x = np.arange(W)[None, :, None].astype(np.float32); edge = 0.52 * W
    m = np.clip((x - edge) / 60 + 0.5, 0, 1)
    mid = before.astype(np.float32) * (1 - m) + after.astype(np.float32) * m
    glow = np.exp(-((x - edge) / 28) ** 2) * 255
    mid = mid + glow * np.array([0.95, 0.98, 1.0]) * 0.9 + np.exp(-((x - edge) / 140) ** 2) * 60
    cv2.imwrite(str(OUT / 'c2a-sweep.jpg'), np.clip(mid, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 92])
    cv2.imwrite(str(OUT / 'c2b-after.jpg'), after, [cv2.IMWRITE_JPEG_QUALITY, 92])
    composite('c3-ondo-site', 'v14-ondo-cafe', cv2.imread(str(V / 'screens' / 'out' / 'ondo-laptop.png')), gain=1.0, **LOOK)
    for a, b in [('v12', 'c4-home_chemilife'), ('v10', 'c5-workshop_chillenq'), ('v10', 'c6-agency_kvibe'), ('v12', 'c7-night_dongdaemun')]:
        shutil.copy(ROOT / 'drafts' / a / 'shots' / f'{b}.jpg', OUT / f'{b}.jpg')


if __name__ == '__main__':
    main()
