"""11차: 동대문 컷만 교체 — 사용자가 준 실제 가게 사진 2장을 참고 이미지로 넣어(qwen-image-3/edit) 같은 가게의 밤, 현지인·한국인 손님이 막걸리(금색 주전자)·소주로 떠드는 장면, 사장님은 뒷모습
- 참고 사진은 제3자 리뷰 사진이라 저장소에 넣지 않음(업로드 주소도 기록에서 제외). 실제 제작 땐 동대문 사장님 사진으로 교체
실행: python3 tools/storyboard_v11.py
"""
import cv2

from storyboard_v4 import ROOT, composite

SCR = ROOT / 'drafts' / 'v10' / 'screens' / 'out'
OUT = ROOT / 'drafts' / 'v11' / 'shots'
LOOK = dict(grain=2.5, vig_amt=0.06, glow_amt=0.12, soft=0.7, lift=6, reflect=0.05, out_dir=OUT)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    composite('c4-night_dongdaemun', 'v11-ddm-qwen', cv2.imread(str(SCR / 'dongdaemun-mobile.png')), gain=0.95, **LOOK)


if __name__ == '__main__':
    main()
