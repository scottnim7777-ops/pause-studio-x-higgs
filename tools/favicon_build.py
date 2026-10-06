"""사용자가 만든 파비콘(PS 모노그램 타일)을 벡터로 옮기고 브라우저·휴대폰용 아이콘 세트를 만든다.

- 타일: 원본 알파에서 잰 둥근 사각형(846×827, 모서리 반지름 200 — 원본 비율 그대로)을 정확한 도형으로.
- 크림색 모노그램(두 원 + P·S, 서로 엮인 앞뒤 관계 포함): 4배 확대 후 potrace로 윤곽 그대로 추적.
- 크림색은 로고와 같은 #FCEED8로 통일(원본 webp 압축으로 생긴 미세한 색 차이 제거), 타일 검정은 원본 측정값.
실행: python3 tools/favicon_build.py && NODE_PATH=/opt/node22/lib/node_modules node tools/favicon_export.cjs
"""
import json
from pathlib import Path

import numpy as np
from PIL import Image

from logo_vectorize import trace  # 같은 추적 방식 재사용

ROOT = Path(__file__).resolve().parents[1]
FAV = ROOT / 'content' / 'assets' / 'logo' / 'new' / 'favicon'
SRC = FAV / 'original' / 'pause-studio-favicon_user-original.webp'
TILE, CREAM = '#090909', '#FCEED8'


def tile_geometry(A):
    ys, xs = np.where(A > 128)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    # 모서리 반지름: 위·아래 각 행에서 불투명 시작점 → 원 맞춤(r - sqrt(r² - (r-dy)²) = offset)
    best = None
    for r in np.arange(150, 260, 0.5):
        err = 0
        for dy in range(2, int(r), 6):
            for row, x_edge in ((y0 + dy, x0), (y1 - 1 - dy, x0)):
                cols = np.where(A[row] > 128)[0]
                off = cols.min() - x_edge
                exp = r - np.sqrt(max(r ** 2 - (r - dy - 0.5) ** 2, 0))
                err += (off - exp) ** 2
        if best is None or err < best[1]:
            best = (r, err)
    return dict(x=float(x0), y=float(y0), w=float(x1 - x0), h=float(y1 - y0), r=float(best[0]))


def main():
    work = FAV / 'work'
    work.mkdir(parents=True, exist_ok=True)
    rgba = np.array(Image.open(SRC).convert('RGBA')).astype(float)
    A = rgba[..., 3]
    L = rgba[..., :3].mean(2)
    t = tile_geometry(A)
    # 크림 알파: 타일 안에서 밝기 9(검정)~253(크림) 사이를 선형으로
    cream = np.clip((L - 9) / (253 - 9), 0, 1) * (A / 255)
    import logo_vectorize as lv
    lv.WORK = work
    d = trace(cream, 4, 0.8, 'favicon-art')
    # 정사각 캔버스 중앙에 타일(타일 비율 유지)
    side = max(t['w'], t['h'])
    vx, vy = t['x'] + t['w'] / 2 - side / 2, t['y'] + t['h'] / 2 - side / 2

    def svg(bleed=False, art_scale=1.0):
        cx, cy = t['x'] + t['w'] / 2, t['y'] + t['h'] / 2
        bg = (f'<rect x="{vx:.1f}" y="{vy:.1f}" width="{side:.1f}" height="{side:.1f}" fill="{TILE}"/>' if bleed else
              f'<rect x="{t["x"]:.1f}" y="{t["y"]:.1f}" width="{t["w"]:.1f}" height="{t["h"]:.1f}" rx="{t["r"]:.1f}" fill="{TILE}"/>')
        tr = '' if art_scale == 1 else f' transform="translate({cx:.2f} {cy:.2f}) scale({art_scale}) translate({-cx:.2f} {-cy:.2f})"'
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx:.1f} {vy:.1f} {side:.1f} {side:.1f}">{bg}'
                f'<path fill="{CREAM}"{tr} d="{d}"/></svg>\n')

    (FAV / 'favicon.svg').write_text(svg())                       # 브라우저 탭(둥근 타일, 투명 모서리)
    (FAV / 'icon-fullbleed.svg').write_text(svg(bleed=True))      # iOS 홈 화면(모서리는 기기가 둥글게 자름)
    (FAV / 'icon-maskable.svg').write_text(svg(bleed=True, art_scale=0.8))  # 안드로이드 마스크 안전 영역(가운데 80%)
    (FAV / 'measure.json').write_text(json.dumps(dict(tile=t, colors=dict(tile=TILE, cream=CREAM),
                                                      source_px=list(A.shape[::-1])), indent=1))
    print(t)


if __name__ == '__main__':
    main()
