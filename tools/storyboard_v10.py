"""10차 콘티 스틸: 실사 카메라로 찍은 듯한 화질 · 동대문 실제 가게와 같은 모습 · PAUSE STUDIO 로고로 끝나고 로고에서 다시 시작하는 무한 반복
- 장면은 전부 실제 카메라·렌즈 기준 프롬프트로 다시 생성(필름 흉내·과한 그레인 제거)
- 화면 합성: 아주 살짝 부드럽게 · LCD 검정 수준 · 유리 반사로 '붙인 티' 줄이기
- 화면: drafts/v10/screens/out (9차 캡처 재사용, 간판만 비율 맞춰 다시 렌더)
실행: python3 tools/storyboard_v10.py
"""
import shutil

import cv2
import numpy as np

from storyboard_v4 import ROOT, composite

SCR = ROOT / 'drafts' / 'v10' / 'screens' / 'out'
OUT = ROOT / 'drafts' / 'v10' / 'shots'
V8 = ROOT / 'drafts' / 'v8' / 'shots'
LOOK = dict(grain=2.5, vig_amt=0.06, glow_amt=0.12, soft=0.7, lift=6, reflect=0.05, out_dir=OUT)
SIGN_QUAD = np.float32([[267, 86], [1748, 90], [1749, 442], [268, 440]])  # v10-ddm-cinema 장면의 빈 간판


def img(name):
    return cv2.imread(str(SCR / f'{name}.png'))


def add_sign(scene):
    sign = img('ddm-sign')
    h, w = sign.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), SIGN_QUAD)
    H, W = scene.shape[:2]
    warped = cv2.warpPerspective(sign, M, (W, H), flags=cv2.INTER_AREA).astype(np.float32)
    warped = cv2.GaussianBlur(warped, (0, 0), 0.9)
    poly = np.zeros((H, W), np.uint8); cv2.fillConvexPoly(poly, SIGN_QUAD.astype(np.int32), 1)
    dark = cv2.GaussianBlur((cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY) < 40).astype(np.float32) * poly, (0, 0), 1.5)[..., None]
    out = scene.astype(np.float32) * (1 - dark) + warped * dark
    out += cv2.GaussianBlur(np.clip(warped - 120, 0, 255) * dark, (0, 0), 12) * 0.3  # 조명 간판 빛 번짐
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    composite('c1-send_chat', 'v10-c1-send', img('chat-mobile'), gain=1.0, **LOOK)
    for f in ['c2a-photo', 'c2b-video']:
        shutil.copy(V8 / f'{f}.jpg', OUT / f'{f}.jpg')
    composite('c3-cafe_blooming-mobile', 'v10-c3-cafe', img('blooming-mobile'), gain=1.0, **LOOK)
    composite('c4-night_dongdaemun', 'v10-ddm-cinema', img('dongdaemun-mobile'), gain=0.95, fix=add_sign, **LOOK)
    composite('c5-workshop_chillenq', 'v10-c5-chillenq', img('chillenq-laptop'), gain=1.0, **LOOK)
    kvibe = cv2.imread(str(ROOT / 'drafts' / 'v10' / 'screens' / 'src' / 'kvibe_5.png'))
    composite('c6-agency_kvibe', 'v10-c6-agency', kvibe[:, :int(kvibe.shape[0] * 1.6)], gain=1.0, **LOOK)
    composite('c7-studio_work', 'v10-c7-studio', img('studio-work'), gain=0.95, solid=True, **LOOK)


if __name__ == '__main__':
    main()
