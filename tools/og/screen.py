"""배경(Higgsfield v36-og-a) 모니터에 실제 포트폴리오 화면(Ref.03 동대문)을 원근에 맞춰 입힘 → tools/og/bg-screen.jpg"""
import cv2, numpy as np
from pathlib import Path
D = Path(__file__).parent
bg = cv2.imread(str(D / 'bg.jpg')).astype(np.float32)
sc = cv2.imread(str(D.parents[1] / 'site/public/media/work/ref03-1920.jpg'))
h, w = sc.shape[:2]
sc = sc[:, : int(h * 1.6)]  # 모니터 비율(16:10)에 맞춰 왼쪽부터
h, w = sc.shape[:2]
dst = np.float32([[773, 192], [1111, 143], [1097, 478], [755, 471]])  # 화면 안쪽 네 모서리(배경 1280×720 기준)
M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w, 0], [w, h], [0, h]]), dst)
warp = cv2.warpPerspective(sc, M, (bg.shape[1], bg.shape[0]), flags=cv2.INTER_AREA).astype(np.float32)
mask = cv2.warpPerspective(np.full((h, w), 255, np.uint8), M, (bg.shape[1], bg.shape[0]))
mask = cv2.GaussianBlur(mask, (3, 3), 0).astype(np.float32)[..., None] / 255
# 어두운 방의 모니터처럼: 밝기 낮추고 따뜻하게, 위에서 아래로 살짝 반사광
warp = cv2.GaussianBlur(warp, (0, 0), 0.6) * 0.78
warp[..., 0] *= 0.92  # 파랑 줄임
ys = np.linspace(0, 1, bg.shape[0])[:, None, None]
glare = np.clip(1.0 - ys * 0.25, 0.75, 1.0)
warp = warp * glare + 10
out = bg * (1 - mask) + warp * mask
cv2.imwrite(str(D / 'bg-screen.jpg'), np.clip(out, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
print('ok')
