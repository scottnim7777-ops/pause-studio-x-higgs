"""8차 콘티 스틸: "사진만 보내주세요" — 사장님이 보낸 사진 → AI 홍보영상 → 손님 휴대폰 속 웹사이트 (촬영 장면 없음, 자막 없음)
- 새 장면: 사진 보내는 사장님(c1) · 폰손비 카페 iPhone(c3) · 카메라 없는 작업실(c7) / 나머지는 7차 장면 재사용
- 화면: drafts/v8/screens (캡처: tools/capture_screens_v8.cjs)
실행: python3 tools/storyboard_v8.py
"""
import shutil

import cv2

from storyboard_v4 import ROOT, composite

SCR = ROOT / 'drafts' / 'v8' / 'screens' / 'out'
OUT = ROOT / 'drafts' / 'v8' / 'shots'
V7 = ROOT / 'drafts' / 'v7' / 'shots'
LOOK = dict(grain=5, vig_amt=0.12, glow_amt=0.22, out_dir=OUT)


def img(name):
    return cv2.imread(str(SCR / f'{name}.png'))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    composite('c1-send_chat', 'v8-c1-send', img('chat-mobile'), gain=1.0, **LOOK)
    for n, src in [('c2a-photo', 'insert-a'), ('c2b-video', 'insert-b')]:  # 화면만 있는 인서트 컷(사진이 튀어나와 움직이기 시작)
        cv2.imwrite(str(OUT / f'{n}.jpg'), img(src), [cv2.IMWRITE_JPEG_QUALITY, 92])
    composite('c3-cafe_blooming-mobile', 'v8-c3-cafe', img('blooming-mobile'), gain=1.0, **LOOK)
    for a, b in [('c3-night_dongdaemun-mobile', 'c4-night_dongdaemun-mobile'), ('c4-warehouse_chillenq', 'c5-warehouse_chillenq'), ('c5-agency_kvibe', 'c6-agency_kvibe')]:
        shutil.copy(V7 / f'{a}.jpg', OUT / f'{b}.jpg')
    composite('c7-studio_work', 'v8-c7-studio', img('studio-work'), gain=0.95, **LOOK)


if __name__ == '__main__':
    main()
