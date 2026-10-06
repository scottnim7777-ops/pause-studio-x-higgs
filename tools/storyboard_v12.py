"""12차 콘티 스틸: 8컷 + 로고 루프 — Chemilife(건강기능식품 온라인 주문) 추가, 동대문 자연스럽게(밤·막걸리·소주, 초점은 휴대폰), 'AI 홍보영상' 생성 화면, 흐릿한 케이크를 고화질로
- 케이크 고화질: Blooming 사이트 영상 속 케이크를 참고 이미지로 qwen-image-3/edit → 같은 케이크의 고화질 사진(= 사진 → AI 홍보영상 시연)
- 시간 흐름: 아침(사진 보내기) → 낮(카페·집) → 오후(작업장·유학원) → 밤(동대문·작업실) → 로고
실행: python3 tools/storyboard_v12.py
"""
import shutil

import cv2

from storyboard_v4 import ROOT, composite

SCR = ROOT / 'drafts' / 'v12' / 'screens' / 'out'
OUT = ROOT / 'drafts' / 'v12' / 'shots'
LOOK = dict(grain=2.5, vig_amt=0.06, glow_amt=0.12, soft=0.7, lift=6, reflect=0.05, out_dir=OUT)


def img(name):
    return cv2.imread(str(SCR / f'{name}.png'))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    composite('c1-send_chat', 'v10-c1-send', img('chat-mobile'), gain=1.0, **LOOK)
    for n, src in [('c2a-ai-make', 'insert-a'), ('c2b-ai-video', 'insert-b')]:
        cv2.imwrite(str(OUT / f'{n}.jpg'), img(src), [cv2.IMWRITE_JPEG_QUALITY, 92])
    composite('c3-cafe_blooming', 'v10-c3-cafe', img('blooming-mobile'), gain=1.0, **LOOK)
    composite('c4-home_chemilife', 'v12-chemilife', img('chemilife-mobile'), gain=1.0, **LOOK)
    composite('c5-workshop_chillenq', 'v10-c5-chillenq', img('chillenq-laptop'), gain=1.0, **LOOK)
    shutil.copy(ROOT / 'drafts' / 'v10' / 'shots' / 'c6-agency_kvibe.jpg', OUT / 'c6-agency_kvibe.jpg')
    composite('c7-night_dongdaemun', 'v12-ddm', img('dongdaemun-mobile'), gain=0.92, **LOOK)
    composite('c8-studio_work', 'v10-c7-studio', img('studio-work'), gain=0.95, solid=True, **LOOK)


if __name__ == '__main__':
    main()
