"""원본 PNG 알파 vs 벡터 렌더 알파 비교 → 수치 + 차이 이미지(빨강=원본에만, 파랑=벡터에만).
실행: node tools/logo_verify.cjs && python3 tools/logo_verify.py"""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
NEW = ROOT / 'content' / 'assets' / 'logo' / 'new'
o = np.array(Image.open(NEW / 'original' / 'pause-studio-logo_ink_user-original.png').convert('RGBA'))[..., 3] / 255
v = np.array(Image.open(NEW / 'work' / 'render-ink.png').convert('RGBA'))[..., 3] / 255
d = v - o
ob, vb = o > 0.5, v > 0.5
ink = ob.sum()
res = dict(
    iou=round(float((ob & vb).sum() / (ob | vb).sum()), 4),
    ink_px=int(ink),
    mismatch_px=int((ob ^ vb).sum()),
    mismatch_pct_of_ink=round(float((ob ^ vb).sum() / ink * 100), 2),
    mean_abs_alpha_diff_on_ink=round(float(np.abs(d)[ob | vb].mean()), 4),
    max_edge_shift_px_est=None,
)
# 경계 이동 추정: 불일치 픽셀이 원본 경계에서 얼마나 떨어져 있는지
from scipy.ndimage import distance_transform_edt
edge = distance_transform_edt(~(ob ^ np.roll(ob, 1, 0) | ob ^ np.roll(ob, 1, 1)))
mm = ob ^ vb
res['max_edge_shift_px_est'] = round(float(edge[mm].max()), 2) if mm.any() else 0
res['p99_edge_shift_px_est'] = round(float(np.percentile(edge[mm], 99)), 2) if mm.any() else 0
img = np.full(o.shape + (3,), 255, np.uint8)
img[ob & vb] = (200, 200, 200)
img[ob & ~vb] = (230, 30, 30)
img[vb & ~ob] = (30, 60, 230)
Image.fromarray(img).save(NEW / 'work' / 'diff.png')
(NEW / 'work' / 'verify.json').write_text(json.dumps(res, indent=1))
print(res)
