"""7차 콘티 스틸: 뉴질랜드(오클랜드) 배경 · 한국인 주인공 · 실제 작업물 4곳(Blooming·동대문·ChillenQ·K-VIBE) → drafts/v7/shots/
- 휴대폰 화면은 PC 화면을 줄이지 않고 모바일 레이아웃으로 다시 짠 페이지(drafts/v7/screens/out, tools/capture_screens_v7.cjs)
- 장면당 1장 생성(Higgsfield soul/cinema, 화면 초록), 합성은 4차 파이프라인 재사용
실행: python3 tools/storyboard_v7.py
"""
import cv2

from storyboard_v4 import ROOT, composite

SCR = ROOT / 'drafts' / 'v7' / 'screens'
OUT = ROOT / 'drafts' / 'v7' / 'shots'
LOOK = dict(grain=5, vig_amt=0.12, glow_amt=0.22, out_dir=OUT)


def img(name):
    return cv2.imread(str(SCR / 'out' / f'{name}.png'))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    kvibe = cv2.imread(str(SCR / 'src' / 'kvibe_5.png'))
    composite('c1-shoot_blooming', 'v7-c1-shoot', img('camera-monitor'), gain=1.0, **LOOK)
    composite('c2-cafe_blooming-mobile', 'v7-c2-cafe', img('blooming-mobile'), gain=1.0, **LOOK)
    composite('c3-night_dongdaemun-mobile', 'v7-c3-night', img('dongdaemun-mobile'), gain=0.95, **LOOK)
    composite('c4-warehouse_chillenq', 'v7-c4-warehouse', img('chillenq-desktop'), gain=1.0, **LOOK)
    composite('c5-agency_kvibe', 'v7-c5-agency', kvibe[:, :int(kvibe.shape[0] * 1.6)], gain=1.0, **LOOK)  # 왼쪽 제목이 잘리지 않게
    # 스튜디오: iMac(편집 화면, 생성된 글자가 있어 화면 전체를 덮음) + 옆 MacBook(ChillenQ 시안)
    first = composite('c6-studio_edit', 'v7-c6-studio', img('edit-timeline'), gain=0.95, solid=True, finish=False, stray=False, **LOOK)
    composite('c6-studio_edit', None, img('chillenq-desktop'), gain=0.9, scene=first, **LOOK)


if __name__ == '__main__':
    main()
