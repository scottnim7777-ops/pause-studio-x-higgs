"""9차 콘티 스틸: 8차 흐름 유지 + 동대문 실제 가게 모습(검은 간판·유리문·바깥 흰 의자) · ChillenQ 실제 작업장 장면과 사이트 리디자인 · 히어로가 영상임을 보이는 재생 표시
- 동대문 간판: 생성 장면의 빈 검은 간판 위에 간판 그래픽(drafts/v9/screens/ddm-sign.html)을 원근 합성 — 어두운 간판 부분에만 입혀 앞의 손·휴대폰은 그대로
- 화면: drafts/v9/screens (캡처: tools/capture_screens_v9.cjs)
실행: python3 tools/storyboard_v9.py
"""
import shutil

import cv2
import numpy as np

from storyboard_v4 import ROOT, composite

SCR = ROOT / 'drafts' / 'v9' / 'screens' / 'out'
OUT = ROOT / 'drafts' / 'v9' / 'shots'
V8, V7 = ROOT / 'drafts' / 'v8' / 'shots', ROOT / 'drafts' / 'v7' / 'shots'
LOOK = dict(grain=5, vig_amt=0.12, glow_amt=0.22, out_dir=OUT)
SIGN_QUAD = np.float32([[463, 48], [1762, 22], [1760, 438], [463, 448]])  # v9-c4-ddm 장면의 빈 간판(좌상·우상·우하·좌하)


def img(name):
    return cv2.imread(str(SCR / f'{name}.png'))


def add_sign(scene):
    sign = img('ddm-sign')
    h, w = sign.shape[:2]
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), SIGN_QUAD)
    H, W = scene.shape[:2]
    warped = cv2.warpPerspective(sign, M, (W, H), flags=cv2.INTER_AREA).astype(np.float32)
    warped = cv2.GaussianBlur(warped, (0, 0), 2.2)                      # 배경이라 살짝 초점 밖
    poly = np.zeros((H, W), np.uint8); cv2.fillConvexPoly(poly, SIGN_QUAD.astype(np.int32), 1)
    dark = cv2.GaussianBlur((cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY) < 45).astype(np.float32) * poly, (0, 0), 2)[..., None]
    out = scene.astype(np.float32) * (1 - dark) + warped * dark
    out += cv2.GaussianBlur(np.clip(warped - 120, 0, 255) * dark, (0, 0), 14) * 0.35  # 조명 간판 빛 번짐
    return np.clip(out, 0, 255).astype(np.uint8)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for f in ['c1-send_chat', 'c2a-photo', 'c2b-video']:
        shutil.copy(V8 / f'{f}.jpg', OUT / f'{f}.jpg')
    composite('c3-cafe_blooming-mobile', 'v8-c3-cafe', img('blooming-mobile'), gain=1.0, **LOOK)
    composite('c4-night_dongdaemun', 'v9-c4-ddm', img('dongdaemun-mobile'), gain=0.95, fix=add_sign, **LOOK)
    composite('c5-workshop_chillenq', 'v9-c5-chillenq', img('chillenq-laptop'), gain=1.0, **LOOK)
    shutil.copy(V7 / 'c5-agency_kvibe.jpg', OUT / 'c6-agency_kvibe.jpg')
    composite('c7-studio_work', 'v9-c7-studio', img('studio-work'), gain=0.95, **LOOK)


if __name__ == '__main__':
    main()
