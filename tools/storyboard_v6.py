"""6차 콘티 스틸(연출 사진이 아니라 영화의 한 장면처럼): 사람이 일하는 실제 순간 + 화면 속 실제 작업물 → drafts/v6/shots/
- 장면당 1장만 생성(Higgsfield soul/cinema, 화면 초록), 합성은 4차 파이프라인 재사용
실행: python3 tools/storyboard_v6.py
"""
import cv2

from storyboard_v4 import PF, ROOT, composite, frame_of, WORK

OUT = ROOT / 'drafts' / 'v6' / 'shots'
LOOK = dict(grain=5, vig_amt=0.12, glow_amt=0.22, out_dir=OUT)


def main():
    OUT.mkdir(parents=True, exist_ok=True); WORK.mkdir(parents=True, exist_ok=True)
    kvibe = frame_of(PF / 'ref01_KIKzZuF.mp4', 5)
    dongdaemun = cv2.imread(str(PF / 'ref03_Cv2GPxw.png'))
    blooming = frame_of(PF / 'ref02_PVuptes.mp4', 5)
    h, w = blooming.shape[:2]
    composite('shot1-bakery_blooming', 'v6-s1-bakery', blooming[:, int(w * .30):int(w * .70)], gain=1.0, **LOOK)
    h, w = dongdaemun.shape[:2]
    composite('shot2-restaurant_dongdaemun', 'v6-s2-restaurant', dongdaemun[:int(h * .8)], gain=0.95, **LOOK)
    # 길에서 휴대폰으로 동대문 사이트를 발견 → 컷 2의 그 식당(데스크톱 화면)으로 이어지는 흐름
    composite('shot3-street_dongdaemun', 'v6-s3-street', dongdaemun[int(h * .02):int(h * .80), int(w * .36):int(w * .74)], gain=1.0, **LOOK)
    composite('shot4-studio_kvibe', 'v6-s4-studio', kvibe, gain=0.95, **LOOK)


if __name__ == '__main__':
    main()
