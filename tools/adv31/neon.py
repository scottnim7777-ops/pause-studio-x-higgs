"""네온 간판(편집에서 그린 글자 → 굵기가 일정한 유리관). 글자 뼈대(Zhang-Suen 세선화)에 반지름 r 관을 씌워 둥근 끝·이음매를 만든다.
빛: 관 속(중심이 가장 밝음) + 여러 크기 번짐 + 둘레 벽에 비치는 빛. 모두 선형광."""
import math
import numpy as np, cv2
from PIL import Image, ImageDraw


def thin(mask):
    """0/1 uint8 → 1px 뼈대 (Zhang-Suen)"""
    img = (mask > 0).astype(np.uint8)
    while True:
        changed = False
        for step in (0, 1):
            P = np.pad(img, 1)
            p2, p3, p4 = P[:-2, 1:-1], P[:-2, 2:], P[1:-1, 2:]
            p5, p6, p7 = P[2:, 2:], P[2:, 1:-1], P[2:, :-2]
            p8, p9 = P[1:-1, :-2], P[:-2, :-2]
            B = p2 + p3 + p4 + p5 + p6 + p7 + p8 + p9
            seq = [p2, p3, p4, p5, p6, p7, p8, p9, p2]
            A = sum(((seq[i] == 0) & (seq[i + 1] == 1)).astype(np.uint8) for i in range(8))
            if step == 0:
                c = (p2 * p4 * p6 == 0) & (p4 * p6 * p8 == 0)
            else:
                c = (p2 * p4 * p8 == 0) & (p2 * p6 * p8 == 0)
            m = (img == 1) & (B >= 2) & (B <= 6) & (A == 1) & c
            if m.any():
                img[m] = 0
                changed = True
        if not changed:
            return img


def prune(skel, n=6):
    """짧은 잔가지 n번 깎기(끝점 제거) — 모서리에서 생기는 털을 줄임. 진짜 획 끝은 n px만 짧아짐(관 반지름으로 덮음)"""
    s = skel.copy()
    k = np.ones((3, 3), np.float32)
    for _ in range(n):
        nb = cv2.filter2D(s.astype(np.float32), -1, k, borderType=cv2.BORDER_CONSTANT) - s
        ends = (s == 1) & (nb <= 1)
        s[ends] = 0
    return s


def tube(skel, r):
    """뼈대 → (관 알파, 관 단면 밝기 0~1: 가운데 1, 가장자리 0.55)"""
    d = cv2.distanceTransform((1 - skel).astype(np.uint8), cv2.DIST_L2, 5)
    alpha = np.clip(r + 0.5 - d, 0, 1).astype(np.float32)
    prof = np.clip(1 - (d / max(r, 1e-3)) ** 2, 0, 1)
    return alpha, (0.55 + 0.45 * prof).astype(np.float32) * alpha


def glyph_mask(text_lines, fnt, size_wh, centers):
    """여러 줄 글 → 0/1 마스크. centers: 줄마다 (cx, cy) 글자 가운데"""
    W, H = size_wh
    im = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(im)
    for t, (cx, cy) in zip(text_lines, centers):
        d.text((cx, cy), t, font=fnt, fill=255, anchor='mm')
    return (np.asarray(im) > 127).astype(np.uint8)


def rrect_path(W, H, x0, y0, x1, y1, rad):
    """둥근 사각 테두리 1px 선(관 뼈대)"""
    m = np.zeros((H, W), np.uint8)
    cv2.line(m, (x0 + rad, y0), (x1 - rad, y0), 1, 1)
    cv2.line(m, (x0 + rad, y1), (x1 - rad, y1), 1, 1)
    cv2.line(m, (x0, y0 + rad), (x0, y1 - rad), 1, 1)
    cv2.line(m, (x1, y0 + rad), (x1, y1 - rad), 1, 1)
    for (cx, cy, a0) in ((x0 + rad, y0 + rad, 180), (x1 - rad, y0 + rad, 270), (x1 - rad, y1 - rad, 0), (x0 + rad, y1 - rad, 90)):
        cv2.ellipse(m, (cx, cy), (rad, rad), 0, a0, a0 + 90, 1, 1)
    return m


def fblur(img, sigma):
    """큰 가우스 흐림을 줄였다 키워서 빠르게(빛 번짐처럼 부드러운 곳만 쓸 것)"""
    if sigma < 6:
        return cv2.GaussianBlur(img, (0, 0), sigma)
    f = int(2 ** math.floor(math.log2(sigma / 3)))
    h, w = img.shape[:2]
    small = cv2.resize(img, (max(1, w // f), max(1, h // f)), interpolation=cv2.INTER_AREA)
    small = cv2.GaussianBlur(small, (0, 0), sigma / f)
    return cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR)


def glow(emis, sigmas=(3, 9, 26, 70, 180, 320), weights=(0.9, 0.6, 0.36, 0.2, 0.12, 0.06)):
    """emis(H,W,3) 선형 → 번짐 합(렌즈·비 속 산란)"""
    out = np.zeros_like(emis)
    for s, w in zip(sigmas, weights):
        out += w * fblur(emis, s)
    return out


def flicker_curve(t, t_on, rng_seed, pattern=None):
    """네온 켜짐: t_on 전 0, 직후 몇 번 깜빡이다 켜짐. pattern=[(길이초, 밝기)...]"""
    if t < t_on:
        return 0.0
    if pattern is None:
        rng = np.random.default_rng(rng_seed)
        pattern = []
        for _ in range(rng.integers(2, 4)):
            pattern.append((rng.uniform(0.04, 0.09), rng.uniform(0.5, 1.0)))
            pattern.append((rng.uniform(0.04, 0.12), rng.uniform(0.0, 0.08)))
        pattern.append((0.10, 0.62))
    u = t - t_on
    for dur, lv in pattern:
        if u < dur:
            return lv
        u -= dur
    return 1.0
