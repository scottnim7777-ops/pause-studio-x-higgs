"""5차 콘티 스틸(밝고 고급스럽게 · 애플 기기): 4차 합성 파이프라인 재사용 → drafts/v5/shots/
- 장면: Higgsfield soul/cinema 밝은 자연광 공간(화면 초록) · 장면당 2안 중 1안 선택
- 밝은 장면에 맞게 비네팅·그레인을 약하게, 화면 밝기는 그대로(gain≈1)
실행: python3 tools/storyboard_v5.py
"""
import cv2
import numpy as np

from storyboard_v4 import PF, ROOT, composite, frame_of, WORK

OUT = ROOT / 'drafts' / 'v5' / 'shots'
LOOK = dict(grain=3, vig_amt=0.08, glow_amt=0.10, out_dir=OUT)


def soften(box):
    """생성 이미지의 알아볼 수 없는 작은 글자(기기 베젤 등)를 지움: 상자 안 밝은 글자 픽셀만 주변색으로 채움. box = 비율 (x0, y0, x1, y1)"""
    def f(img):
        h, w = img.shape[:2]
        x0, y0, x1, y1 = int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)
        roi = img[y0:y1, x0:x1]
        g = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY).astype(np.float32)
        mask = (g > cv2.GaussianBlur(g, (0, 0), 8) + 12).astype(np.uint8) * 255
        mask = cv2.dilate(mask, np.ones((3, 3), np.uint8), iterations=2)
        img = img.copy()
        img[y0:y1, x0:x1] = cv2.inpaint(roi, mask, 5, cv2.INPAINT_TELEA)
        return img
    return f


def main():
    OUT.mkdir(parents=True, exist_ok=True); WORK.mkdir(parents=True, exist_ok=True)
    kvibe = frame_of(PF / 'ref01_KIKzZuF.mp4', 5)
    dongdaemun = cv2.imread(str(PF / 'ref03_Cv2GPxw.png'))
    blooming = frame_of(PF / 'ref02_PVuptes.mp4', 5)
    blessings = frame_of(PF / 'ref07_70IgQpR.mp4', 4)
    q = {}
    q['s1'] = composite('shot1-studio_kvibe', 'v5-s1-studio-b', kvibe, gain=1.0, **LOOK)
    h, w = dongdaemun.shape[:2]
    q['s2'] = composite('shot2-macro_dongdaemun', 'v5-s2-macro-a', dongdaemun[int(h * .08):int(h * .75), int(w * .30):int(w * .78)],
                        gain=1.0, dof=7, fix=soften((0.605, 0.872, 0.675, 0.912)), **LOOK)
    h, w = blooming.shape[:2]
    q['s3'] = composite('shot3-cafe_blooming', 'v5-s3-cafe-a', blooming[:, int(w * .30):int(w * .70)], gain=1.0, **LOOK)
    q['s4'] = composite('shot4-reception_blessings', 'v5-s4-reception-a', blessings, gain=1.0,
                        fix=soften((0.465, 0.712, 0.535, 0.738)), **LOOK)
    for k, v in q.items():
        print(k, np.round(v).astype(int).tolist())


if __name__ == '__main__':
    main()
