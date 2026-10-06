"""파비콘: 원본 webp vs 벡터 렌더 — 타일 모양과 크림 모노그램을 각각 비교하고 favicon.ico(16·32·48)를 만든다."""
import json
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FAV = ROOT / 'content' / 'assets' / 'logo' / 'new' / 'favicon'
o = np.array(Image.open(FAV / 'original' / 'pause-studio-favicon_user-original.webp').convert('RGBA')).astype(float)
v = np.array(Image.open(FAV / 'work' / 'render.png').convert('RGBA')).astype(float)


def iou(a, b):
    return round(float((a & b).sum() / (a | b).sum()), 4)


res = dict(
    tile_iou=iou(o[..., 3] > 128, v[..., 3] > 128),
    monogram_iou=iou((o[..., 3] > 128) & (o[..., :3].mean(2) > 131), (v[..., 3] > 128) & (v[..., :3].mean(2) > 131)),
)
(FAV / 'work' / 'verify.json').write_text(json.dumps(res, indent=1))
ico = Image.open(FAV / 'png' / 'favicon-48.png').convert('RGBA')
ico.save(FAV / 'favicon.ico', sizes=[(16, 16), (32, 32), (48, 48)],
         append_images=[Image.open(FAV / 'png' / f'favicon-{s}.png').convert('RGBA') for s in (16, 32)])
print(res)
