"""가상 브랜드 Pâtisserie MIREILLE(동네 파티스리) 광고 'Huit heures' (약 15초, 1920×1080, 24fps, 무음) — 2026-10-09 9차

감독 콘셉트: 파스텔 정면 대칭 '타블로'. 카메라는 정확히 가운데, 표정 없는 인물, 휙 도는 화면 전환, 손으로 찍은 스톱모션, 아이리스 아웃.
  1 가게 앞 · 문에서 간판으로 천천히 올라가면 금박 간판 PÂTISSERIE MIREILLE      (Central framing · Pedestal)
  2 휙(whip pan) → 진열대 뒤 파티시에 · 다가가다 멈추는 순간 이름표               (Tableau · Freeze frame)
  3 휙 → 위에서 본 쟁반 · 빈 쟁반에 타르트가 한 개씩 놓임(12fps 스톱모션)         (Overhead · Stop motion)
  4 리본 상자 · 라벨 인쇄, 벽시계 초침이 7:59:57 → 58 → 59 … 아이리스 아웃         (Tableau · Iris)
  5 분홍 제목 카드: 매일 아침 여덟 시, 첫 타르트.
사진은 Higgsfield Soul Cinema 2K 정지 화면(higgsfield/raw/v31-b*), 빈 쟁반은 같은 사진을 Nano Banana 2.1로 비운 판(v31-b3-empty).
간판·라벨·초침·스톱모션·전환은 여기서 계산.
"""
import os, sys, math, argparse
from pathlib import Path
import numpy as np, cv2
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fx import srgb_to_lin, lin_to_srgb, load, ease_io, ease_out, lerp, span, camera, Film, Writer  # noqa: E402
from textmask import fnt_axes, font, text_mask, place  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'higgsfield/raw'
W, H, FPS = 1920, 1080, 24
T1, T2, T3, T4, DUR = 3.2, 6.2, 9.8, 13.8, 15.4
N = int(DUR * FPS)


def plate(name):
    return srgb_to_lin(load(RAW / f'v31-{name}' / f'v31-{name}.png'))


def col(hexs):
    h = hexs.lstrip('#')
    return srgb_to_lin(np.array([int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)], np.float32))


class Mireille:
    def __init__(self):
        self.film = Film((W, H), seed=21, grain=0.020, grain_size=1.0, halation=0.06, hal_thresh=0.82, weave=0.14, flicker=0.004,
                         vignette=0.12, ca=0.3, lift=0.012, sat=1.05, tint=(1.01, 1.0, 0.99), contrast=1.05)
        self.facade = self._paint_sign(plate('b1-facade'))
        self.counter = plate('b2-counter')
        self.tray = plate('b3-overhead')
        self.tarts = [(611, 304), (885, 304), (1158, 296), (1424, 296), (1431, 570), (1158, 570), (885, 562), (604, 570),
                      (619, 851), (892, 851), (1158, 851), (1439, 851)]  # 지그재그로 놓는 순서
        self.tray_empty, self.tart_masks = self._empty_tray()
        self.box = self._print_label(plate('b4-box'))
        self.caption = self._caption()
        self.card = self._title_card()
        self.rng = np.random.default_rng(4)

    # 간판: 금박 세리프 + 그림자, 판의 결이 비치게
    def _paint_sign(self, img):
        Hh, Ww = img.shape[:2]
        f = fnt_axes('Fraunces-VF.ttf', 84, [96, 640, 0, 0])
        m, base = text_mask('PÂTISSERIE  MIREILLE', f, track=0.16)
        a = place((Hh, Ww), m, 1022, 158, base)
        shadow = cv2.GaussianBlur(np.roll(np.roll(a, 4, axis=0), 3, axis=1), (0, 0), 2.2)
        img = img * (1 - 0.55 * shadow[..., None] * (1 - col('#5a1d22'))[None, None, :])
        # 금: 위는 밝고 아래로 진해지는 그라데이션 + 빛을 받는 윗변(엠보스)
        yy = np.arange(Hh, dtype=np.float32)[:, None]
        g = np.clip((yy - 100) / 75, 0, 1)
        gold = (1 - g)[..., None] * col('#f4dc9a')[None, None, :] + g[..., None] * col('#a8792e')[None, None, :]
        ab = cv2.GaussianBlur(a, (0, 0), 1.2)
        gy = cv2.Sobel(ab, cv2.CV_32F, 0, 1, ksize=3) / 8
        gx = cv2.Sobel(ab, cv2.CV_32F, 1, 0, ksize=3) / 8
        bevel = np.clip(1 + 2.2 * (gy + 0.5 * gx), 0.55, 1.6)
        tex = cv2.GaussianBlur(img.mean(axis=2), (0, 0), 6)
        tex = np.clip(img.mean(axis=2) / (tex + 1e-4), 0.85, 1.15)
        letter = gold * bevel[..., None] * tex[..., None] * 1.05
        return img * (1 - a[..., None]) + letter * a[..., None]

    # 빈 쟁반: 같은 쟁반을 비운 사진(Nano Banana 2.1 편집, v31-b3-empty)을 원본에 맞춰 정렬(ECC 아핀)·색 맞춤(2차 곡면 비율)
    #   타르트 자리 = 원본과 빈 쟁반의 차이(타르트 + 그 그림자) ∩ 가장 가까운 타르트 영역 → 실제 윤곽대로 하나씩 놓임
    def _empty_tray(self):
        orig = self.tray
        Hh, Ww = orig.shape[:2]
        src = Image.open(RAW / 'v31-b3-empty' / 'v31-b3-empty.png').convert('RGB')
        src = src.resize((Ww, round(src.height * Ww / src.width)), Image.LANCZOS)
        emp = srgb_to_lin(np.asarray(src, np.float32) / 255)
        if emp.shape[0] < Hh:
            emp = np.pad(emp, ((0, Hh - emp.shape[0]), (0, 0), (0, 0)), mode='edge')
        emp = emp[:Hh]
        g1 = cv2.GaussianBlur(lin_to_srgb(orig).mean(2), (0, 0), 1.5)
        g2 = cv2.GaussianBlur(lin_to_srgb(emp).mean(2), (0, 0), 1.5)
        keep = np.ones((Hh, Ww), np.uint8); cv2.rectangle(keep, (430, 120), (1620, 1030), 0, -1)
        warp = np.eye(2, 3, dtype=np.float32)
        _, warp = cv2.findTransformECC(g1, g2, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 300, 1e-7), keep, 5)
        emp = cv2.warpAffine(emp, warp, (Ww, Hh), flags=cv2.INTER_CUBIC + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE)
        yy, xx = np.mgrid[0:Hh, 0:Ww].astype(np.float32)
        dists = np.stack([np.sqrt((xx - x) ** 2 + (yy - y) ** 2) for (x, y) in self.tarts], 0)
        dmin = dists.min(0)
        tray = np.zeros((Hh, Ww), np.uint8); cv2.rectangle(tray, (420, 115), (1630, 1040), 1, -1)
        sel = (tray > 0) & (dmin > 175)
        ys, xs = np.nonzero(sel)
        pick = np.random.default_rng(0).choice(len(xs), min(80000, len(xs)), replace=False)
        xs, ys = xs[pick], ys[pick]
        A = np.stack([np.ones(len(xs)), xs / Ww, ys / Hh, (xs / Ww) ** 2, (ys / Hh) ** 2, xs * ys / (Ww * Hh)], 1)
        Xn, Yn = xx / Ww, yy / Hh
        basis = [np.ones_like(Xn), Xn, Yn, Xn * Xn, Yn * Yn, Xn * Yn]
        ratio = np.zeros_like(orig)
        lo = orig / np.maximum(emp, 1e-4)
        for c in range(3):
            coef, *_ = np.linalg.lstsq(A, np.log(np.clip(lo[ys, xs, c], 0.2, 5)), rcond=None)
            ratio[..., c] = np.exp(sum(k * b for k, b in zip(coef, basis)))
        tm = cv2.GaussianBlur(tray.astype(np.float32), (0, 0), 12)[..., None]
        empty = emp * (1 + (ratio - 1) * tm)
        # 타르트 마스크: 색(분홍 법랑은 B≈R, 크러스트·라즈베리는 B가 훨씬 낮음)으로 몸체를 잡고 구멍(윤기 반사)을 메움
        #   맞닿은 타르트는 몸체 위에서 중심을 다시 잡은(로이드 반복) 보로노이로 나눔 → 같은 크기 원끼리는 맞닿은 점에서 갈림
        #   그림자: 타르트마다 같은 부드러운 접지 그림자(아래로 조금)를 새로 그림(원본 틈새 그림자를 옮기면 모양이 이상해짐)
        so = lin_to_srgb(orig)
        br = so[..., 2] / np.maximum(so[..., 0], 1e-3)
        tart = np.clip((0.80 - br) / 0.12, 0, 1).astype(np.float32)
        body = cv2.morphologyEx((tart > 0.4).astype(np.uint8), cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7)))
        cnts, hier = cv2.findContours(body, cv2.RETR_CCOMP, cv2.CHAIN_APPROX_NONE)
        for c, h in zip(cnts, hier[0]):
            if h[3] >= 0 and cv2.contourArea(c) < 2500:  # 작은 구멍(윤기 반사)만 메움, 타르트 사이 틈은 그대로
                cv2.drawContours(body, [c], -1, 1, -1)
        by, bx = np.nonzero(body)
        cen = np.array(self.tarts, np.float32)
        for _ in range(8):
            d2 = (bx[None, :] - cen[:, :1]) ** 2 + (by[None, :] - cen[:, 1:]) ** 2
            lab = np.argmin(d2, axis=0)
            cen = np.array([[bx[lab == i].mean(), by[lab == i].mean()] for i in range(len(cen))], np.float32)
        dd = np.stack([np.sqrt((xx - cx) ** 2 + (yy - cy) ** 2) for cx, cy in cen], 0)
        nearest = np.argmin(dd, axis=0)
        alpha = np.maximum(tart, cv2.erode(body, np.ones((5, 5), np.uint8)).astype(np.float32)) * cv2.dilate(body, np.ones((5, 5), np.uint8))
        masks, shadows = [], []
        for i in range(len(cen)):
            reg = cv2.GaussianBlur((nearest == i).astype(np.float32), (0, 0), 0.8)
            masks.append(np.clip(reg * alpha * np.clip((165 - dd[i]) / 4, 0, 1), 0, 1))
            sh = np.roll(np.roll(cv2.dilate((masks[-1] > 0.5).astype(np.uint8), np.ones((7, 7), np.uint8)).astype(np.float32), 5, 0), 2, 1)
            shadows.append(cv2.GaussianBlur(sh, (0, 0), 8) * 0.30)
        self.tart_shadows = shadows
        return empty, masks

    # 상자 라벨 인쇄(갈색 잉크가 종이를 '먹은' 느낌: 곱하기)
    def _print_label(self, img):
        Hh, Ww = img.shape[:2]
        ink = col('#6e2432')
        a = np.zeros((Hh, Ww), np.float32)
        f1 = fnt_axes('Fraunces-VF.ttf', 30, [24, 520, 0, 0])
        m, b = text_mask('PÂTISSERIE', f1, track=0.32)
        a = np.maximum(a, place((Hh, Ww), m, 1032, 642, b))
        f2 = font('InstrumentSerif-Italic.ttf', 104)
        m, b = text_mask('Mireille', f2, track=0.01)
        a = np.maximum(a, place((Hh, Ww), m, 1032, 735, b))
        f3 = fnt_axes('Fraunces-VF.ttf', 22, [14, 480, 0, 0])
        m, b = text_mask('FAIT MAIN', f3, track=0.34)
        a = np.maximum(a, place((Hh, Ww), m, 1032, 782, b))
        a = cv2.GaussianBlur(a, (0, 0), 0.6) * 0.92
        return img * (1 - a[..., None] * (1 - ink)[None, None, :])

    # 파티시에 이름표(정지 화면 위 작은 액자)
    def _caption(self):
        cw, ch = 560, 150
        card = np.ones((ch, cw, 3), np.float32) * col('#f6ead8')
        border = np.zeros((ch, cw), np.float32)
        cv2.rectangle(border, (10, 10), (cw - 11, ch - 11), 1.0, 2, lineType=cv2.LINE_AA)
        txt = np.zeros((ch, cw), np.float32)
        m, b = text_mask('Mireille', font('InstrumentSerif-Italic.ttf', 64))
        txt = np.maximum(txt, place((ch, cw), m, cw / 2, 78, b))
        m, b = text_mask('PÂTISSIÈRE  ·  6 H DU MATIN', fnt_axes('Fraunces-VF.ttf', 20, [14, 520, 0, 0]), track=0.28)
        txt = np.maximum(txt, place((ch, cw), m, cw / 2, 118, b))
        ink = col('#7a2e3a')
        return card * (1 - np.maximum(txt, border)[..., None]) + ink * np.maximum(txt, border)[..., None]

    def _title_card(self):
        bg = col('#f0cfd3')
        img = np.ones((H, W, 3), np.float32) * bg
        a = np.zeros((H, W), np.float32)
        m, b = text_mask('PÂTISSERIE', fnt_axes('Fraunces-VF.ttf', 34, [24, 560, 0, 0]), track=0.40)
        a = np.maximum(a, place((H, W), m, W / 2, 400, b))
        m, b = text_mask('Mireille', font('InstrumentSerif-Italic.ttf', 190))
        a = np.maximum(a, place((H, W), m, W / 2, 580, b))
        m, b = text_mask('매일 아침 여덟 시, 첫 타르트.', font('MaruBuri-Regular.woff2', 42), space=0.3)
        a = np.maximum(a, place((H, W), m, W / 2, 690, b))
        ink = col('#7a2e3a')
        return img * (1 - a[..., None]) + ink * a[..., None]

    # 초침(빨강, 가는 바늘 + 꼬리 + 그림자). 1초마다 '탁' 움직이며 살짝 튐
    def _second_hand(self, img, sec_float):
        cx, cy, R = 1022.0, 143.0, 98.0
        k = math.floor(sec_float); u = sec_float - k
        ang = k * 6 + 6 * (1 - math.exp(-u / 0.035)) * (1 + 0.18 * math.exp(-u / 0.05) * math.sin(u * 90))
        th = math.radians(ang)
        ss = 4
        size = int(R * 2.4)
        lay = np.zeros((size * ss, size * ss), np.float32)
        c = np.array((size * ss / 2, size * ss / 2))
        d = np.array((math.sin(th), -math.cos(th)))
        p1 = c + d * R * 0.86 * ss; p0 = c - d * R * 0.20 * ss
        cv2.line(lay, tuple(np.int32(p0)), tuple(np.int32(p1)), 1.0, int(2.2 * ss), lineType=cv2.LINE_AA)
        cv2.circle(lay, tuple(np.int32(c)), int(5 * ss), 1.0, -1, lineType=cv2.LINE_AA)
        lay = cv2.resize(lay, (size, size), interpolation=cv2.INTER_AREA)
        x0, y0 = int(cx - size / 2), int(cy - size / 2)
        sh = cv2.GaussianBlur(np.roll(np.roll(lay, 3, axis=0), 2, axis=1), (0, 0), 1.8)
        roi = img[y0:y0 + size, x0:x0 + size]
        roi = roi * (1 - 0.28 * sh[..., None])
        red = col('#b3241c')
        roi = roi * (1 - lay[..., None]) + red * lay[..., None]
        img = img.copy(); img[y0:y0 + size, x0:x0 + size] = roi
        return img

    # ── 장면 ──
    def facade_frame(self, u):
        cy = lerp(678, 474, ease_io(u))  # 확대 1.22에서 사진 밖이 보이지 않는 범위
        return camera(self.facade, (W, H), zoom=1.22, cx=0.5, cy=cy / 1152)

    def counter_frame(self, t):
        z = lerp(1.04, 1.13, ease_out(span(t, 0.0, 1.55), 2))  # 다가가다 1.55초에 '멈춤'
        img = camera(self.counter, (W, H), zoom=z, cx=0.5, cy=0.47)
        if t >= 1.55:
            fl = 1 + 0.10 * math.exp(-(t - 1.55) / 0.05)  # 멈추는 순간 셔터처럼 아주 짧게 밝아짐
            img = img * fl
            k = ease_out(span(t, 1.62, 1.85))
            cw = self.caption
            ch_, cw_ = cw.shape[:2]
            x0, y0 = (W - cw_) // 2, H - ch_ - 70
            roi = img[y0:y0 + ch_, x0:x0 + cw_]
            img = img.copy(); img[y0:y0 + ch_, x0:x0 + cw_] = roi * (1 - k) + cw * k
        return img

    def tray_frame(self, t):
        step = int(t * 12)  # 12fps 스톱모션: 2프레임마다 한 장
        n_on = int(np.clip((t - 0.45) * 12, 0, 12))
        img = self.tray_empty
        on = np.zeros(self.tray.shape[:2], np.float32); shadow = np.zeros_like(on)
        for i in range(n_on):
            m = self.tart_masks[i]
            img = img * (1 - m[..., None]) + self.tray * m[..., None]
            on = np.maximum(on, m); shadow = np.maximum(shadow, self.tart_shadows[i])
        if n_on:  # 놓인 타르트 둘레 접지 그림자(겹치는 곳도 한 번만)
            img = img * (1 - shadow * (1 - on))[..., None]
        rng = np.random.default_rng(1000 + step)
        jx, jy = rng.normal(0, 1.1, 2)
        expo = 1 + rng.normal(0, 0.010)
        out = camera(img, (W, H), zoom=1.08, cx=(1024 + jx) / 2048, cy=(576 + jy) / 1152)
        return out * expo

    def box_frame(self, t):
        sec = 56.6 + t  # 7:59:57부터
        img = self._second_hand(self.box, min(sec, 59.999))
        z = lerp(1.03, 1.07, ease_io(span(t, 0, 4.0)))
        out = camera(img, (W, H), zoom=z, cx=0.5, cy=0.52)
        # 아이리스 아웃: 라벨 둘레로 원이 닫힘
        k = ease_io(span(t, 2.95, 3.9))
        if k > 0:
            yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
            lc = (W / 2 + (1032 - 1024) * z * W / 2048, H / 2 + (690 - 0.52 * 1152) * z * W / 2048)
            r = np.sqrt((xx - lc[0]) ** 2 + (yy - lc[1]) ** 2)
            rad = lerp(1250, 0, k)
            m = np.clip((rad - r) / 2.5 + 0.5, 0, 1)
            out = out * m[..., None]
        return out

    def whip(self, a, b, k, direction=1):
        """휙 도는 전환: k 0→1, 0.5에서 장면이 바뀜. 흐림 길이는 가운데서 최대"""
        src = a if k < 0.5 else b
        s = math.sin(math.pi * k)
        L = int(8 + 220 * s)
        shift = int(direction * ((k - 0.5) * 2) * 260 * s)
        img = np.roll(src, -shift, axis=1)
        ker = np.ones((1, L), np.float32) / L
        return cv2.filter2D(img, -1, ker, borderType=cv2.BORDER_REFLECT)

    def frame(self, n):
        t = n / FPS
        WP = 3 / FPS  # 전환 앞뒤 3프레임씩
        if t < T1 - WP:
            lin = self.facade_frame(t / T1)
        elif t < T1 + WP:
            k = (t - (T1 - WP)) / (2 * WP)
            lin = self.whip(self.facade_frame(min(1, t / T1)), self.counter_frame(max(0, t - T1)), k)
        elif t < T2 - WP:
            lin = self.counter_frame(t - T1)
        elif t < T2 + WP:
            k = (t - (T2 - WP)) / (2 * WP)
            lin = self.whip(self.counter_frame(t - T1), self.tray_frame(max(0, t - T2)), k)
        elif t < T3:
            lin = self.tray_frame(t - T2)
        elif t < T4:
            lin = self.box_frame(t - T3)
        else:
            lin = self.card
        return self.film(lin_to_srgb(lin))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--frames', default='')
    ap.add_argument('--snap', default='/tmp')
    ap.add_argument('--out', default=str(ROOT / 'site/public/media/film/mireille.mp4'))
    a = ap.parse_args()
    s = Mireille()
    if a.frames:
        for n in map(int, a.frames.split(',')):
            Image.fromarray(s.frame(n)).save(f'{a.snap}/mireille-{n:03d}.jpg', quality=90); print('frame', n)
        return
    w = Writer(a.out, (W, H), FPS)
    for n in range(N):
        w.write(s.frame(n))
        if n % 48 == 0:
            print('frame', n, '/', N, flush=True)
    w.close(); print('written', a.out)


if __name__ == '__main__':
    main()
