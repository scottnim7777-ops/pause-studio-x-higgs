"""13차: '화면 속 글자가 안 보인다' → 읽혀야 하는 컷(1·2·8)을 다시 — 휴대폰을 화면 가득(클로즈업), 말풍선·제목·알림 글자 크게
- 나머지 컷은 12차 그대로. 실제 크기 확인용으로 PC(1280px)·휴대폰(390px) 너비 미리보기도 만든다
실행: python3 tools/storyboard_v13.py
"""
import cv2

from storyboard_v4 import ROOT, composite

SCR = ROOT / 'drafts' / 'v13' / 'screens' / 'out'
OUT = ROOT / 'drafts' / 'v13' / 'shots'
LOOK = dict(grain=2.5, vig_amt=0.06, glow_amt=0.12, soft=0.5, lift=6, reflect=0.04, out_dir=OUT)


def img(name):
    return cv2.imread(str(SCR / f'{name}.png'))


def main():
    composite('c1-send_chat', 'v13-c1-closeup', img('chat-mobile'), gain=1.0, **LOOK)
    cv2.imwrite(str(OUT / 'c2a-ai-make.jpg'), img('insert-a'), [cv2.IMWRITE_JPEG_QUALITY, 92])
    composite('c8-studio_work', 'v10-c7-studio', img('studio-work'), gain=0.95, solid=True, **LOOK)


if __name__ == '__main__':
    main()
