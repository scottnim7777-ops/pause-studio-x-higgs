"""사용자가 만든 새 로고(PNG)를 원형 그대로 벡터(SVG)로 옮긴다.

- 원 2개: 원본 픽셀에서 중심선을 측정해 타원(가로 반지름 < 세로 반지름, 원본 비율 그대로)과 선 두께를 맞추고,
  글자 띠 구간에서 끊긴 위치도 원본에서 측정한 값으로 자른다.
- 글자·®: 원 부분을 지운 알파를 4배 확대해 potrace로 윤곽선 추출 후 원래 좌표로 되돌린다.
- 모양·비율·간격은 바꾸지 않는다. 검증은 tools/logo_verify.cjs (원본과 겹쳐 차이 계산).

실행: python3 tools/logo_vectorize.py
결과: content/assets/logo/new/vector/pause-studio-logo-{ink,cream,currentcolor}.svg, measure.json
"""
import json
import re
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image
from scipy.ndimage import map_coordinates
from scipy.optimize import least_squares
from svgelements import Matrix, Path as SvgPath

ROOT = Path(__file__).resolve().parents[1]
NEW = ROOT / 'content' / 'assets' / 'logo' / 'new'
SRC = NEW / 'original' / 'pause-studio-logo_ink_user-original.png'
OUT = NEW / 'vector'
WORK = NEW / 'work'
SCALE = 4
COLORS = {'ink': '#1A1B1C', 'cream': '#FCEED8'}  # 원본 두 장의 불투명 픽셀에서 측정


def alpha():
    return np.array(Image.open(SRC).convert('RGBA'))[..., 3].astype(float) / 255


def fit_ellipse(a, cx, cy):
    """각도별 단면의 무게중심 반지름 → 축 정렬 타원 맞춤. 다른 원·글자와 겹친 각도는 단면 폭으로 걸러낸다."""
    pts, widths = [], []
    for deg in np.arange(0, 360, 0.5):
        t = np.radians(deg)
        rs = np.arange(335, 405, 0.1)
        v = map_coordinates(a, [cy + rs * np.sin(t), cx + rs * np.cos(t)], order=1)
        w = v.sum() * 0.1
        if not 11 < w < 13.5:
            continue
        r0 = (rs * v).sum() / v.sum()
        pts.append((cx + r0 * np.cos(t), cy + r0 * np.sin(t)))
        widths.append(w)
    P = np.array(pts)

    def resid(p):
        g = np.sqrt(p[2] * p[3])
        return np.hypot((P[:, 0] - p[0]) / p[2], (P[:, 1] - p[1]) / p[3]) * g - g

    s = least_squares(resid, [cx, cy, 368, 368], loss='soft_l1', f_scale=1.0)
    e = resid(s.x)
    inl = np.abs(e) < 2
    s = least_squares(lambda p: resid(p)[inl], s.x)
    return s.x, float(np.median(widths)), float(np.sqrt((resid(s.x)[inl] ** 2).mean()))


def cut_rows(a, cx, cy, rx, ry, w):
    """원 왼쪽 단면의 행별 커버리지로 위·아래 끊긴 y를 소수점까지 찾는다."""
    def cov(y):
        dx = rx * np.sqrt(max(1 - ((y + 0.5 - cy) / ry) ** 2, 0))
        x = int(cx - dx)
        return a[y, x - 15:x + 16].sum() / w
    top = next(y for y in range(330, 480) if cov(y) < 0.9)
    bot = next(y for y in range(640, 480, -1) if cov(y) < 0.9)
    return top + min(cov(top), 1), bot + 1 - min(cov(bot), 1)


def trace(arr, scale, blur, tag):
    """알파 배열 → potrace 윤곽 path(d, 원본 픽셀 좌표)."""
    from PIL import ImageFilter
    H, W = arr.shape
    big = Image.fromarray((arr * 255).astype(np.uint8)).resize((W * scale, H * scale), Image.LANCZOS)
    if blur:
        big = big.filter(ImageFilter.GaussianBlur(blur))
    pbm = WORK / f'{tag}.pbm'
    Image.fromarray(~(np.array(big) > 127)).convert('1').save(pbm)  # potrace: 검정(0)=전경
    svg_tmp = WORK / f'{tag}.svg'
    subprocess.run(['potrace', str(pbm), '-s', '-o', str(svg_tmp), '--alphamax', '1.0', '--opttolerance', '0.2',
                    '--turdsize', '8'], check=True)
    raw = svg_tmp.read_text()
    g = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', raw, re.S)
    tx, ty, sx, sy = map(float, re.search(r'translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)', g.group(1)).groups())
    M = Matrix(f'scale({1 / scale}) translate({tx},{ty}) scale({sx},{sy})')  # potrace pt = 픽셀
    ds = []
    for d in re.findall(r'<path d="([^"]+)"', g.group(2), re.S):
        p = SvgPath(d.replace('\n', ' ')) * M
        p.reify()
        ds.append(p.d())
    return re.sub(r'(\d+\.\d{2})\d+', r'\1', ' '.join(ds))


def fit_registered(a, box=(1520, 355, 1615, 455)):
    """® 바깥 원: 각도별 단면 중심 → 정원 맞춤."""
    x0, y0, x1, y1 = box
    ys, xs = np.where(a[y0:y1, x0:x1] > 0.5)
    cx, cy = (xs.min() + xs.max()) / 2 + x0, (ys.min() + ys.max()) / 2 + y0
    R = (xs.max() - xs.min()) / 2
    P, Wd = [], []
    for deg in np.arange(0, 360, 2):
        t = np.radians(deg)
        rs = np.arange(R * 0.75, R + 4, 0.05)
        v = map_coordinates(a, [cy + rs * np.sin(t), cx + rs * np.cos(t)], order=1)
        if v.sum() < 1:
            continue
        r0 = (rs * v).sum() / v.sum()
        P.append((cx + r0 * np.cos(t), cy + r0 * np.sin(t)))
        Wd.append(v.sum() * 0.05)
    P = np.array(P)
    s = least_squares(lambda p: np.hypot(P[:, 0] - p[0], P[:, 1] - p[1]) - p[2], [cx, cy, R - 3])
    return dict(cx=float(s.x[0]), cy=float(s.x[1]), r=float(s.x[2]), stroke=float(np.median(Wd)))


def main():
    for d in (OUT, WORK):
        d.mkdir(parents=True, exist_ok=True)
    a = alpha()
    H, W = a.shape
    rings = []
    for guess in ((643.75, 480.55), (1023.14, 480.75)):
        (cx, cy, rx, ry), w, rms = fit_ellipse(a, *guess)
        rings.append(dict(cx=cx, cy=cy, rx=rx, ry=ry, stroke=w, rms=rms))
    # 두 원은 같은 크기·같은 높이로 그려진 것 → 평균값으로 통일(측정 편차 0.3px 이하)
    rx = np.mean([r['rx'] for r in rings]); ry = np.mean([r['ry'] for r in rings])
    cy = np.mean([r['cy'] for r in rings]); sw = np.mean([r['stroke'] for r in rings])
    for r in rings:
        r.update(rx_used=rx, ry_used=ry, cy_used=cy)
    y_top, y_bot = cut_rows(a, rings[0]['cx'], cy, rx, ry, sw)

    # 글자 알파 = 원 띠(중심선 ±9px)를 지운 알파
    yy, xx = np.mgrid[0:H, 0:W]
    ring = np.zeros_like(a, bool)
    for r in rings:
        d = (np.hypot((xx - r['cx']) / rx, (yy - cy) / ry) - 1) * np.sqrt(rx * ry)
        ring |= np.abs(d) < sw / 2 + 3
    # 글자 띠(원이 끊긴 구간) 안에서는 지우지 않는다 — 원의 경로가 a·e·t·i를 지나가므로
    ring &= (yy < y_top + 1.5) | (yy > y_bot - 1.5)
    text = np.where(ring, 0, a)
    # ®: 바깥 원은 측정한 정원(선)으로 다시 그리고, 안쪽 R만 8배·약한 블러로 매끈하게 추적
    reg = fit_registered(a)
    dreg = np.hypot(xx - reg['cx'], yy - reg['cy'])
    in_reg = dreg < reg['r'] + reg['stroke'] / 2 + 3
    r_alpha = np.where(in_reg & (dreg < reg['r'] - reg['stroke'] / 2 - 0.5), text, 0)
    text_d = trace(np.where(in_reg, 0, text), SCALE, 0, 'text') + ' ' + trace(r_alpha, 8, 1.6, 'reg-R')

    # 경계 상자(원 바깥 + 글자) → viewBox. 여백 없이 정확한 상자(여백은 CSS에서)
    bb = SvgPath(text_d).bbox()
    xs = [bb[0], bb[2], reg['cx'] + reg['r'] + reg['stroke'] / 2] + [r['cx'] - rx - sw / 2 for r in rings] + [r['cx'] + rx + sw / 2 for r in rings]
    ys = [bb[1], bb[3], cy - ry - sw / 2, cy + ry + sw / 2]
    vb = [round(min(xs), 2), round(min(ys), 2), round(max(xs) - min(xs), 2), round(max(ys) - min(ys), 2)]

    def doc(fill, title='Pause Studio'):
        ell = ''.join(f'<ellipse cx="{r["cx"]:.2f}" cy="{cy:.2f}" rx="{rx:.2f}" ry="{ry:.2f}"/>' for r in rings)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" role="img" aria-label="{title}">'
                f'<title>{title}</title>'
                f'<defs><clipPath id="ps-ring-cut"><rect x="{vb[0] - 20}" y="{vb[1] - 20}" width="{vb[2] + 40}" height="{y_top - vb[1] + 20:.2f}"/>'
                f'<rect x="{vb[0] - 20}" y="{y_bot:.2f}" width="{vb[2] + 40}" height="{vb[1] + vb[3] - y_bot + 20:.2f}"/></clipPath></defs>'
                f'<g fill="none" stroke="{fill}" stroke-width="{sw:.2f}" clip-path="url(#ps-ring-cut)">{ell}</g>'
                f'<circle cx="{reg["cx"]:.2f}" cy="{reg["cy"]:.2f}" r="{reg["r"]:.2f}" fill="none" stroke="{fill}" stroke-width="{reg["stroke"]:.2f}"/>'
                f'<path fill="{fill}" d="{text_d}"/></svg>\n')

    for name, col in list(COLORS.items()) + [('currentcolor', 'currentColor')]:
        (OUT / f'pause-studio-logo-{name}.svg').write_text(doc(col))
    meas = dict(source=str(SRC.relative_to(ROOT)), source_px=[W, H], rings=rings, ring_stroke=sw,
                ring_cut_y=[y_top, y_bot], registered=reg, viewBox=vb, colors=COLORS,
                note='원은 정원이 아니라 세로가 약 2.1% 긴 타원(원본 그대로 유지).')
    (NEW / 'measure.json').write_text(json.dumps(meas, ensure_ascii=False, indent=1, default=float))
    print(json.dumps({k: meas[k] for k in ('ring_stroke', 'ring_cut_y', 'viewBox')}, default=float),
          [(round(r['cx'], 2), round(r['rx'], 2), round(r['ry'], 2), round(r['rms'], 2)) for r in rings])



def trace_as_is():
    """참고용: 원(흔들림 포함)까지 픽셀 그대로 추적한 판. 기본 판은 원을 측정값의 정확한 타원으로 그린 main()."""
    a = alpha()
    H, W = a.shape
    big = Image.fromarray((a * 255).astype(np.uint8)).resize((W * SCALE, H * SCALE), Image.LANCZOS)
    pbm = WORK / 'all4x.pbm'
    Image.fromarray(~(np.array(big) > 127)).convert('1').save(pbm)
    svg_tmp = WORK / 'all4x.svg'
    subprocess.run(['potrace', str(pbm), '-s', '-o', str(svg_tmp), '--alphamax', '1.0', '--opttolerance', '0.2', '--turdsize', '8'], check=True)
    raw = svg_tmp.read_text()
    g = re.search(r'<g transform="([^"]+)"[^>]*>(.*?)</g>', raw, re.S)
    tx, ty, sx, sy = map(float, re.search(r'translate\(([-\d.]+),([-\d.]+)\) scale\(([-\d.]+),([-\d.]+)\)', g.group(1)).groups())
    M = Matrix(f'scale({1 / SCALE}) translate({tx},{ty}) scale({sx},{sy})')
    ds = []
    for d in re.findall(r'<path d="([^"]+)"', g.group(2), re.S):
        p = SvgPath(d.replace('\n', ' ')) * M
        p.reify()
        ds.append(p.d())
    dd = re.sub(r'(\d+\.\d{2})\d+', r'\1', ' '.join(ds))
    vb = json.loads((NEW / 'measure.json').read_text())['viewBox']
    (OUT / 'pause-studio-logo-ink_traced-as-is.svg').write_text(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb[0]} {vb[1]} {vb[2]} {vb[3]}" role="img" aria-label="Pause Studio">'
        f'<title>Pause Studio</title><path fill="{COLORS["ink"]}" d="{dd}"/></svg>\n')


if __name__ == '__main__':
    main()
    trace_as_is()
