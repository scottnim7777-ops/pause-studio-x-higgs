"""가상 브랜드 SOOM(스킨케어 세럼) 광고 'One drop' (14초, 1920×1080 안에 2.39:1, 24fps, 무음) — 2026-10-09 9차

감독 콘셉트: 검은 공간(void)의 미니멀 뷰티. 디지털 시네마(필름 흔들림 없음), 깊은 검정, 차가운 흰빛, 2.39:1.
  1 어둠 · 세로 띠 조명(스트립 라이트)이 왼쪽에서 오른쪽으로 지나가며 병이 드러남 — 유리 위 반사 줄이 빛을 따라 움직임   (Void · Hard light)
  2 접사 · 스포이트 끝 물방울, 초점이 맞아 들어오고 물방울이 무거워지다 떨어지려는 순간 컷                            (Probe/Macro · Focal shift · Cut on action)
  3 병 전체 · 천천히 다가감, 빛이 아주 느리게 숨 쉼                                                                  (Product · Slow push)
  4 빛이 줄어 반사 줄만 남고 왼쪽 아래 작은 글 → 검정으로                                                             (Minimal type · Fade)
사진: Higgsfield Soul Cinema 2K(higgsfield/raw/v31-s1-hero, v31-s2-macro). 빛·초점·물방울 무게·글은 여기서 계산.
"""
import os, sys, math, argparse
from pathlib import Path
import numpy as np, cv2
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fx import srgb_to_lin, lin_to_srgb, load, ease_io, ease_out, ease_in, lerp, span, camera, Film, Writer, letterbox  # noqa: E402
from textmask import fnt_axes, font, text_mask, place  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'higgsfield/raw'
W, H, FPS = 1920, 1080, 24
T1, T2, T3, DUR = 3.6, 7.2, 10.8, 14.0
N = int(DUR * FPS)
COOL = np.array((0.92, 0.97, 1.0), np.float32)


def plate(name):
    return srgb_to_lin(load(RAW / f'v31-{name}' / f'v31-{name}.png'))


def rrect(shape, x0, y0, x1, y1, r, feather):
    m = np.zeros(shape, np.float32)
    cv2.rectangle(m, (x0 + r, y0), (x1 - r, y1), 1.0, -1)
    cv2.rectangle(m, (x0, y0 + r), (x1, y1 - r), 1.0, -1)
    for cx, cy in ((x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)):
        cv2.circle(m, (cx, cy), r, 1.0, -1, lineType=cv2.LINE_AA)
    return cv2.GaussianBlur(m, (0, 0), feather)


class Soom:
    def __init__(self):
        self.film = Film((W, H), seed=31, grain=0.018, grain_size=0.9, halation=0.10, hal_thresh=0.62, hal_color=(0.85, 0.92, 1.0),
                         weave=0.0, flicker=0.002, vignette=0.32, ca=0.25, lift=0.0, sat=0.88, tint=(0.97, 1.0, 1.04), contrast=1.10)
        self.hero = plate('s1-hero') * np.array((0.96, 1.0, 1.05), np.float32)
        self.macro = plate('s2-macro') * np.array((0.96, 1.0, 1.05), np.float32)
        sh = self.hero.shape[:2]
        self.glass = rrect(sh, 916, 478, 1104, 842, 14, 2.5)       # 병 몸통
        self.cap = rrect(sh, 952, 312, 1066, 412, 4, 1.5)         # 검은 뚜껑
        self.tube = rrect(sh, 978, 58, 1028, 300, 12, 1.5)        # 스포이트 유리관
        yy = np.arange(sh[0], dtype=np.float32)[:, None]
        self.vfade = np.clip((yy - 478) / 40, 0, 1) * np.clip((842 - yy) / 40, 0, 1)
        self.type = self._type()

    def _type(self):
        a = np.zeros((H, W), np.float32)
        m, b = text_mask('SOOM', fnt_axes('Archivo-VF.ttf', 46, [300, 125]), track=0.55)
        a = np.maximum(a, place((H, W), m, 150, 838, b, align='left'))
        m, b = text_mask('숨처럼 가볍게 스미는 세럼.', font('MaruBuri-Regular.woff2', 26), space=0.3)
        a = np.maximum(a, place((H, W), m, 152, 884, b, align='left'))
        return a

    # 지나가는 띠 조명 + 유리 위 반사 줄
    def lit_hero(self, xc, amb=0.10, band_gain=1.15, stripe_gain=1.0):
        Hh, Ww = self.hero.shape[:2]
        xx = np.arange(Ww, dtype=np.float32)[None, :]
        band = np.exp(-((xx - xc) / 150) ** 2)
        img = self.hero * (amb + band_gain * band)[..., None]
        # 원기둥 위 하이라이트: 빛이 왼쪽→오른쪽으로 가면 반사 줄도 왼쪽→오른쪽(가장자리로 갈수록 몰림)
        u = np.clip((xc - 1010) / 520, -1, 1)
        xs = 1010 + 92 * math.sin(u * math.pi / 2)
        vis = math.exp(-((xc - 1010) / 620) ** 2)
        s1 = np.exp(-((xx - xs) / 4.2) ** 2) * self.vfade * self.glass
        xr = 1010 - 0.55 * (xs - 1010)
        s2 = np.exp(-((xx - xr) / 9.0) ** 2) * self.vfade * self.glass
        xcap = 1009 + 50 * math.sin(u * math.pi / 2)
        s3 = np.exp(-((xx - xcap) / 3.2) ** 2) * self.cap
        xt = 1003 + 20 * math.sin(u * math.pi / 2)
        s4 = np.exp(-((xx - xt) / 2.2) ** 2) * self.tube
        spec = (0.85 * s1 + 0.22 * s2 + 0.45 * s3 + 0.5 * s4) * vis * stripe_gain
        return img + spec[..., None] * COOL

    def frame(self, n):
        t = n / FPS
        if t < T1:
            u = span(t, 0.25, 3.3)
            xc = lerp(560, 1460, ease_io(u))
            img = self.lit_hero(xc, amb=lerp(0.03, 0.10, ease_io(u)))
            img = img * ease_out(span(t, 0.0, 0.6), 2)  # 검정에서 열림
            lin = camera(img, (W, H), zoom=1.04, cx=1010 / 2048, cy=470 / 1152)
        elif t < T2:
            u = (t - T1) / (T2 - T1)
            sig = lerp(9.0, 0.0, ease_out(span(u, 0.0, 0.42), 2))
            src = self.macro
            # 물방울이 무거워짐: 끝(1015,545) 아래만 세로로 늘어남, 마지막 0.3초에 빠르게
            grow = 0.05 * ease_io(span(u, 0.1, 0.9)) + 0.10 * ease_in(span(u, 0.9, 1.0), 2)
            src = self._swell(src, grow)
            if sig > 0.3:
                src = cv2.GaussianBlur(src, (0, 0), sig)
            lin = camera(src, (W, H), zoom=1.10, cx=1015 / 2048, cy=lerp(600, 640, ease_io(u)) / 1152)
        elif t < T3:
            u = (t - T2) / (T3 - T2)
            breath = 1 + 0.03 * math.sin(u * math.pi * 1.5)
            img = self.lit_hero(1240, amb=0.10 * breath, band_gain=1.0 * breath)
            lin = camera(img, (W, H), zoom=lerp(1.04, 1.12, ease_io(u)), cx=1010 / 2048, cy=lerp(470, 560, ease_io(u)) / 1152)
        else:
            u = (t - T3) / (DUR - T3)
            k = ease_io(span(u, 0.0, 0.55))
            img = self.lit_hero(1240, amb=lerp(0.10, 0.012, k), band_gain=lerp(1.0, 0.10, k), stripe_gain=lerp(1.0, 0.9, k))
            lin = camera(img, (W, H), zoom=1.12, cx=1010 / 2048, cy=560 / 1152)
            ta = ease_out(span(u, 0.25, 0.55), 2) * (1 - ease_io(span(u, 0.86, 1.0)))
            lin = lin * (1 - ease_io(span(u, 0.86, 1.0)))
            lin = lin + (self.type * ta * 0.72)[..., None] * COOL
        out = self.film(lin_to_srgb(lin))
        return letterbox(out, 2.39)

    def _swell(self, img, grow):
        if grow <= 1e-4:
            return img
        Hh, Ww = img.shape[:2]
        y0, x0 = 545.0, 1015.0
        yy, xx = np.mgrid[0:Hh, 0:Ww].astype(np.float32)
        w = np.clip((yy - y0) / 40, 0, 1)
        w = w * np.clip(1 - np.abs(xx - x0) / 260, 0, 1) ** 0.5
        sy = 1 + grow * w; sx = 1 + 0.35 * grow * w
        my = y0 + (yy - y0) / sy
        mx = x0 + (xx - x0) / sx
        return cv2.remap(img, mx, my, cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--frames', default='')
    ap.add_argument('--snap', default='/tmp')
    ap.add_argument('--out', default=str(ROOT / 'site/public/media/film/soom.mp4'))
    a = ap.parse_args()
    s = Soom()
    if a.frames:
        for n in map(int, a.frames.split(',')):
            Image.fromarray(s.frame(n)).save(f'{a.snap}/soom-{n:03d}.jpg', quality=90); print('frame', n)
        return
    w = Writer(a.out, (W, H), FPS)
    for n in range(N):
        w.write(s.frame(n))
        if n % 48 == 0:
            print('frame', n, '/', N, flush=True)
    w.close(); print('written', a.out)


if __name__ == '__main__':
    main()
