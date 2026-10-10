"""PAUSE STUDIO 자체 광고 'Light' (15초, 1920×1080, 24fps, 무음) — 2026-10-09 9차

감독 콘셉트: 조용한 건축 사진가. 삼각대 고정, 자연광, Portra 400 필름. 로고를 화면에 '박지 않고' 세상 안에서 찍힌 것으로:
  A 벽 · 투사기 불이 켜지며(텅스텐 예열 색) 흐린 로고 빛이 초점이 맞춰짐         (Projections · Light flash · Focal shift)
  B 촬영장 와이드 · 삼각대·조명 스탠드·케이블, 벽에 같은 로고 빛, 공기 중 먼지  (BTS · Haze)
  C 카메라 뒷모니터 · 지난 촬영본을 넘겨 보다(빵집·세럼·국수) 로고 장면에 멈춤   (Screen in screen · Flash cut)
  D 명함 묶음 · 빛이 낮게 깔리며 블라인드 엠보싱(형압) 로고가 떠오름               (Magnification · Hard light)
  E 같은 자리·같은 크기로 이어지는 벽의 로고(매치 컷) → 슬라이드가 바뀌며 한 줄 → 불이 꺼지고 빈 벽(첫 장면과 이어져 반복 재생)
사진은 Higgsfield Soul Cinema 2K 정지 화면(higgsfield/raw/v31-p0-*), 움직임·빛·로고는 전부 여기서 계산(선형광 공간).
실행: python tools/adv31/pause.py [--frames 0,40,...] [--out site/public/media/film/pause.mp4]
"""
import os, sys, math, argparse, subprocess
from pathlib import Path
import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fx import srgb_to_lin, lin_to_srgb, load, ease_io, ease_out, ease_in, lerp, span, camera, Film, Writer  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'higgsfield/raw'
CACHE = Path(__file__).resolve().parent / '.cache'
W, H, FPS = 1920, 1080, 24
DUR = 15.0
N = int(DUR * FPS)


def plate(name):
    return load(RAW / f'v31-{name}' / f'v31-{name}.png')


def logo_alpha(part='all', width=4000):
    p = CACHE / f'logo-{part}.png'
    if not p.exists():
        CACHE.mkdir(parents=True, exist_ok=True)
        subprocess.run(['node', str(Path(__file__).parent / 'logo_raster.cjs'), str(ROOT / 'site/public/brand/logo-cream.svg'), str(p), '4000', part],
                       check=True, env={**os.environ, 'NODE_PATH': os.environ.get('NODE_PATH', '/opt/node22/lib/node_modules')})
    a = np.asarray(Image.open(p))[..., 3].astype(np.float32) / 255.0
    if width != a.shape[1]:
        a = cv2.resize(a, (width, int(round(a.shape[0] * width / a.shape[1]))), interpolation=cv2.INTER_AREA)
    return a


def font_ttf(name):
    src = ROOT / 'drafts/fonts' / name
    if src.suffix == '.woff2':
        dst = CACHE / (src.stem + '.ttf')
        if not dst.exists():
            from fontTools.ttLib import TTFont
            f = TTFont(str(src)); f.flavor = None; f.save(str(dst))
        return str(dst)
    return str(src)


# ── 색 ────────────────────────────────────────────────
def wb(lin, gains):
    return lin * np.array(gains, np.float32)[None, None, :]


def wall_grade(lin, exposure):
    # 생성 사진의 올리브 기운을 덜고(파랑 +, 초록 −) 크림빛 회벽으로, 새벽 실내 노출
    return wb(lin, (1.0, 0.975, 1.52)) * exposure


# ── 투사(고보) ─────────────────────────────────────────
class Slide:
    """로고(+문구) 슬라이드를 벽에 투사. 왼쪽이 조금 더 큰 사다리꼴(빛이 오른쪽 앞에서 옴)"""
    def __init__(self, alpha, plate_wh, center, width, keystone=0.05):
        self.a = alpha
        self.pw, self.ph = plate_wh
        self.c, self.w, self.k = center, width, keystone
        self.cache = {}

    def mask(self, scale=1.0, sigma=1.0, dx=0.0):
        key = (round(scale, 4), round(sigma, 2), round(dx, 2))
        if key in self.cache:
            return self.cache[key]
        ah, aw = self.a.shape
        w = self.w * scale; h = w * ah / aw
        cx, cy = self.c[0] + dx, self.c[1]
        hl, hr = h * (1 + self.k / 2), h * (1 - self.k / 2)
        dst = np.float32([[cx - w / 2, cy - hl / 2], [cx + w / 2, cy - hr / 2], [cx + w / 2, cy + hr / 2], [cx - w / 2, cy + hl / 2]])
        src = np.float32([[0, 0], [aw, 0], [aw, ah], [0, ah]])
        M = cv2.getPerspectiveTransform(src, dst)
        m = cv2.warpPerspective(self.a, M, (self.pw, self.ph), flags=cv2.INTER_LINEAR, borderValue=0)
        if sigma > 0.3:
            m = cv2.GaussianBlur(m, (0, 0), sigma)
        if len(self.cache) > 64:
            self.cache.clear()
        self.cache[key] = m
        return m

    def beam(self):
        """투사기 빔: 가운데가 조금 더 밝고(핫스폿) 가장자리로 줄어듦 + 고보 안쪽에 아주 옅은 산란광"""
        if 'beam' not in self.cache:
            yy, xx = np.mgrid[0:self.ph, 0:self.pw].astype(np.float32)
            rb = self.w * 0.62
            r = np.sqrt(((xx - self.c[0]) / rb) ** 2 + ((yy - self.c[1]) / (rb * 0.92)) ** 2)
            fall = np.clip(1 - 0.24 * r ** 2, 0, 1)
            scat = 0.010 * np.exp(-(r / 0.95) ** 6)
            self.cache['beam'] = (fall, scat)
        return self.cache['beam']


def projector_light(slide, intensity, focus_sigma, scale, color, gain):
    """선형광 조도 배수(H,W,3): 1 + gain·I·색·(마스크·빔 + 산란). 렌즈 색수차: R은 조금 크게, B는 조금 작게"""
    fall, scat = slide.beam()
    out = []
    for ch, s in zip(range(3), (1.0016, 1.0, 0.9984)):
        m = slide.mask(scale * s, focus_sigma)
        out.append(m * fall + scat)
    P = np.stack(out, axis=2)
    return 1.0 + gain * intensity * P * np.array(color, np.float32)[None, None, :]


def tungsten(t, t_on, t_off=None):
    """텅스텐 예열/소등: (밝기, 색). 켤 때 0.12초 붉게 달아오르며 살짝 깜빡, 끌 때 필라멘트가 식으며 주황으로 사라짐"""
    warm, hot = np.array((1.0, 0.42, 0.14)), np.array((1.0, 0.80, 0.58))
    if t < t_on:
        return 0.0, hot
    u = t - t_on
    i = 1 - math.exp(-u / 0.085)
    i *= 1 + 0.07 * math.sin(2 * math.pi * 11 * u) * math.exp(-u / 0.16)
    c = lerp(warm, hot, min(1.0, i) ** 0.6)
    if t_off is not None and t >= t_off:
        v = t - t_off
        k = 0.82 * math.exp(-v / 0.05) + 0.18 * math.exp(-v / 0.32)
        i *= k
        c = lerp(np.array((1.0, 0.34, 0.08)), c, k ** 0.5)
    return max(0.0, i), c


# ── 장면 ──────────────────────────────────────────────
class Shots:
    def __init__(self):
        self.film = Film((W, H), seed=11, grain=0.030, grain_size=1.25, halation=0.20, hal_thresh=0.70, hal_color=(1.0, 0.42, 0.20),
                         weave=0.22, flicker=0.006, vignette=0.24, ca=0.5, lift=0.022, sat=0.94, tint=(1.03, 1.0, 0.95), contrast=1.04)
        logo = logo_alpha('all', 1800)
        # 벽 장면(A·E)
        self.wall = wall_grade(srgb_to_lin(plate('p0-wall')), 0.52)
        self.wall_wh = (self.wall.shape[1], self.wall.shape[0])
        self.slide1 = Slide(logo, self.wall_wh, (1120, 470), 820, 0.05)
        # 문구 슬라이드(E): 로고 아래 한 줄
        s2 = self._slide_with_line(logo)
        dy = 820 * (s2.shape[0] - logo.shape[0]) / logo.shape[1] / 2  # 슬라이드가 아래로 길어진 만큼 중심을 내려 로고 자리는 그대로
        self.slide2 = Slide(s2, self.wall_wh, (1120, 470 + dy), 820, 0.05)
        # 촬영장(B)
        self.set = wb(srgb_to_lin(plate('p0-set')), (1.02, 0.975, 1.30)) * 0.70  # 이 사진은 덜 누래서 파랑을 덜 올림
        self.set_wh = (self.set.shape[1], self.set.shape[0])
        self.slide_set = Slide(logo, self.set_wh, (1170, 330), 600, 0.07)
        self._dust_init()
        # 카메라 모니터(C)
        cam = plate('p0-cam')
        cam = self._inpaint_labels(cam)
        self.cam = srgb_to_lin(cam) * np.array((1.0, 0.99, 1.06), np.float32) * 0.86
        self.cam_wh = (self.cam.shape[1], self.cam.shape[0])
        self.screen = np.float32([[842, 243], [1387, 327], [1327, 689], [760, 593]])
        self.cam_bg = self._cam_background_glow(logo)
        # 명함(D)
        self.card = srgb_to_lin(plate('p0-card')) * np.array((1.0, 0.985, 1.02), np.float32) * 0.92
        self.card_wh = (self.card.shape[1], self.card.shape[0])
        self._card_init(logo)
        # 모니터에 넘겨 볼 지난 촬영본(가상 브랜드 세 편의 정지 화면을 각 톤으로)
        self.reel = [self._reel_frame(n, g) for n, g in (('b1-facade', (1.04, 1.0, 0.98)), ('s1-hero', (0.96, 1.0, 1.06)),
                                                          ('n3-bowl', (1.08, 0.98, 0.9)), ('b3-overhead', (1.03, 1.0, 0.98)))]

    # 문구 슬라이드
    def _slide_with_line(self, logo):
        ah, aw = logo.shape
        canvas = np.zeros((ah + 300, aw), np.float32)
        canvas[:ah] = logo
        img = Image.new('L', (aw, 300), 0)
        d = ImageDraw.Draw(img)
        f = ImageFont.truetype(font_ttf('MaruBuri-SemiBold.woff2'), 92)
        words = '스크롤이 멈추는 순간을 만듭니다.'.split(' ')  # 이 글꼴(부분 집합)에는 띄어쓰기 글자가 없어 낱말마다 그림
        gap = 92 * 0.32
        ws = [d.textlength(wd, font=f) for wd in words]
        x = (aw - (sum(ws) + gap * (len(words) - 1))) / 2
        for wd, wl in zip(words, ws):
            d.text((x, 150), wd, font=f, fill=255, anchor='ls'); x += wl + gap
        canvas[ah:] = np.asarray(img, np.float32) / 255.0
        return canvas

    # 카메라 몸체의 의미 없는 글자(생성 사진의 흔적) 지우기
    def _inpaint_labels(self, srgb):
        u8 = (np.clip(srgb, 0, 1) * 255).astype(np.uint8)
        x0, y0, x1, y1 = 285, 105, 430, 345
        roi = u8[y0:y1, x0:x1]
        lum = roi.mean(axis=2)
        m = (lum > np.percentile(lum, 55) + 10).astype(np.uint8) * 255
        m = cv2.dilate(m, np.ones((7, 7), np.uint8))
        full = np.zeros(u8.shape[:2], np.uint8); full[y0:y1, x0:x1] = m
        bgr = cv2.inpaint(cv2.cvtColor(u8, cv2.COLOR_RGB2BGR), full, 9, cv2.INPAINT_TELEA)
        return cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0

    def _cam_background_glow(self, logo):
        """모니터 뒤 벽(초점 밖)에 실제로 비치는 같은 로고 빛 — 앞의 카메라·모니터는 가리도록 깊이로 막음"""
        s = Slide(logo, self.cam_wh, (1720, 300), 560, 0.0)
        m = cv2.GaussianBlur(s.mask(1.0, 0), (0, 0), 26)
        try:
            from depth import depth as depth_fn
            d = depth_fn(Image.fromarray((lin_to_srgb(self.cam) * 255).clip(0, 255).astype(np.uint8)))
            far = np.clip((0.45 - d) / 0.25, 0, 1)
        except Exception:
            far = np.ones(m.shape, np.float32)
        poly = np.zeros(m.shape, np.float32)
        cv2.fillConvexPoly(poly, np.int32([[800, 0], [1440, 280], [1520, 820], [700, 820], [0, 820], [0, 0]]), 1.0)
        far = far * (1 - cv2.GaussianBlur(poly, (0, 0), 6))
        return m * far

    def _reel_frame(self, name, gains):
        im = srgb_to_lin(plate(name)) * np.array(gains, np.float32)
        im = cv2.resize(im, (960, 540), interpolation=cv2.INTER_AREA)
        return im

    # 명함: 카드 윗면 사각형 → 카드 좌표(1750×1000)
    def _card_init(self, logo):
        quad = np.float32([[297, 168], [1722, 164], [1797, 850], [251, 851]])
        cw, ch = 1750, 1000
        self.card_H = cv2.getPerspectiveTransform(np.float32([[0, 0], [cw, 0], [cw, ch], [0, ch]]), quad)
        lw = 900; lh = int(round(lw * logo.shape[0] / logo.shape[1]))
        l = cv2.resize(logo, (lw, lh), interpolation=cv2.INTER_AREA)
        cs = np.zeros((ch, cw), np.float32)
        x0, y0 = (cw - lw) // 2, (ch - lh) // 2 + 10
        cs[y0:y0 + lh, x0:x0 + lw] = l
        a = cv2.GaussianBlur(cs, (0, 0), 2.4)
        hmap = cv2.warpPerspective(a, self.card_H, self.card_wh, flags=cv2.INTER_LINEAR)
        self.card_a = hmap
        self.card_gx = cv2.Sobel(hmap, cv2.CV_32F, 1, 0, ksize=3) / 8.0
        self.card_gy = cv2.Sobel(hmap, cv2.CV_32F, 0, 1, ksize=3) / 8.0
        self.card_smooth = cv2.GaussianBlur(self.card, (0, 0), 1.6)
        c = cv2.perspectiveTransform(np.float32([[[cw / 2, ch / 2 + 10]]]), self.card_H)[0, 0]
        l0 = cv2.perspectiveTransform(np.float32([[[x0, ch / 2]]]), self.card_H)[0, 0]
        l1 = cv2.perspectiveTransform(np.float32([[[x0 + lw, ch / 2]]]), self.card_H)[0, 0]
        self.card_logo_c = c
        self.card_logo_w = float(np.linalg.norm(l1 - l0))

    def _dust_init(self):
        rng = np.random.default_rng(5)
        n = 70
        self.dust = np.stack([rng.uniform(0, 1, n), rng.uniform(0, 1, n), rng.uniform(0.4, 1.0, n), rng.uniform(0, 6.28, n)], 1)

    # ── A·E: 벽 ──
    def wall_frame(self, t, cam, slide, light, focus, scale=1.0):
        i, col = light
        L = projector_light(slide, i, focus, scale, col, gain=3.3) if i > 1e-4 else 1.0
        lit = self.wall * L * (1 + 0.025 * i)  # 방 안 반사광이 아주 조금
        z, cx, cy = cam
        return camera(lit, (W, H), zoom=z, cx=cx / self.wall_wh[0], cy=cy / self.wall_wh[1])

    # ── B: 촬영장 ──
    def set_frame(self, t, u):
        i, col = 1.0, np.array((1.0, 0.80, 0.58))
        L = projector_light(self.slide_set, i, 1.1, 1.0, col, gain=3.0)
        lit = self.set * L
        # 공기 중 빛줄기: 화면 오른쪽 위 바깥(카메라 뒤 투사기)에서 로고까지 아주 옅게
        lit = lit + self._haze(t)
        z = lerp(1.06, 1.10, ease_io(u)); cx = lerp(1010, 1060, ease_io(u)); cy = 560
        return camera(lit, (W, H), zoom=z, cx=cx / self.set_wh[0], cy=cy / self.set_wh[1])

    def _haze(self, t):
        if 'haze' not in self.__dict__:
            pw, ph = self.set_wh
            yy, xx = np.mgrid[0:ph, 0:pw].astype(np.float32)
            o = np.array((2350.0, -260.0)); tgt = np.array((1170.0, 330.0))
            d = tgt - o; dl = np.linalg.norm(d); d /= dl
            px, py = xx - o[0], yy - o[1]
            along = px * d[0] + py * d[1]
            perp = np.abs(-px * d[1] + py * d[0])
            radius = 30 + along / dl * 300
            cone = np.clip(1 - perp / radius, 0, 1) ** 1.6 * (along > 0) * np.clip(1.15 - along / dl, 0, 1)
            rng = np.random.default_rng(3)
            n = cv2.resize(rng.random((ph // 24, pw // 24)).astype(np.float32), (pw, ph), interpolation=cv2.INTER_CUBIC)
            self.haze = cone * (0.75 + 0.5 * n)
            self.haze_axis = (o, d, dl)
        o, d, dl = self.haze_axis
        h = self.haze * 0.022
        out = np.repeat(h[..., None], 3, axis=2) * np.array((1.0, 0.84, 0.64), np.float32)
        # 먼지: 빔 안에서 천천히 떠다니며 반짝
        for k, (a, b, s, ph0) in enumerate(self.dust):
            along = (0.25 + 0.75 * a) * dl
            p = o + d * along
            nrm = np.array((-d[1], d[0]))
            p = p + nrm * (b - 0.5) * (30 + along / dl * 300) * 1.6
            p = p + np.array((math.sin(t * 0.7 + ph0) * 14, t * 9 + math.cos(t * 0.5 + ph0) * 8))
            x, y = int(p[0]), int(p[1])
            if 4 <= x < self.set_wh[0] - 4 and 4 <= y < self.set_wh[1] - 4:
                tw = 0.5 + 0.5 * math.sin(t * 3.1 + ph0 * 2)
                cv2.circle(out, (x, y), 1, (0.10 * s * tw, 0.085 * s * tw, 0.065 * s * tw), -1, lineType=cv2.LINE_AA)
        return cv2.GaussianBlur(out, (0, 0), 0.8)

    # ── C: 카메라 모니터 ──
    def cam_frame(self, t, u):
        # 화면 내용: 지난 촬영본을 0.2초씩 넘겨 보다 0.8초부터 로고 장면
        if u < 0.32:
            k = min(int(u / 0.08), len(self.reel) - 1)
            content = self.reel[k]
        else:
            if 'logo_shot' not in self.__dict__:
                lit = self.wall_frame(0, (1.12, 1060, 540), self.slide1, (1.0, np.array((1.0, 0.80, 0.58))), 0.9)
                self.logo_shot = cv2.resize(lit, (960, 540), interpolation=cv2.INTER_AREA)
            content = self.logo_shot
        # 16:10 화면 안의 16:9 → 위아래 검은 띠
        sw, sh = 1000, 625
        scr = np.full((sh, sw, 3), 0.004, np.float32)
        ch = int(sw * 9 / 16); y0 = (sh - ch) // 2
        scr[y0:y0 + ch] = cv2.resize(content, (sw, ch), interpolation=cv2.INTER_AREA)
        # LCD: 밝기·가장자리 감쇠·반사
        yy, xx = np.mgrid[0:sh, 0:sw].astype(np.float32)
        r = np.sqrt(((xx - sw / 2) / (sw / 2)) ** 2 + ((yy - sh / 2) / (sh / 2)) ** 2)
        scr = scr * 0.95 * (1 - 0.10 * r ** 2)[..., None]
        glare = (0.018 * np.clip(1 - (xx / sw + yy / sh) * 0.8, 0, 1))[..., None]
        scr = scr + glare * np.array((0.9, 0.95, 1.0), np.float32)
        M = cv2.getPerspectiveTransform(np.float32([[0, 0], [sw, 0], [sw, sh], [0, sh]]), self.screen)
        warped = cv2.warpPerspective(scr, M, self.cam_wh, flags=cv2.INTER_LINEAR)
        m = cv2.warpPerspective(np.ones((sh, sw), np.float32), M, self.cam_wh, flags=cv2.INTER_LINEAR)
        m = cv2.GaussianBlur(m, (0, 0), 0.7)[..., None]
        base = self.cam * (1 + 2.4 * self.cam_bg[..., None] * np.array((1.0, 0.80, 0.58), np.float32))
        img = base * (1 - m) + warped * m
        z = lerp(1.03, 1.07, ease_io(u))
        return camera(img, (W, H), zoom=z, cx=lerp(1010, 1060, ease_io(u)) / self.cam_wh[0], cy=500 / self.cam_wh[1])

    # ── D: 명함 블라인드 엠보싱 ──
    def card_frame(self, t, u, z_end):
        # 빛: 처음엔 높이 떠 있어 형압이 거의 안 보이다가, 낮게 깔리며(레이킹) 왼쪽에서 오른쪽으로 쓸고 지나감
        e = math.radians(lerp(80, 14, ease_io(span(u, 0.05, 0.75))))
        lx, ly, lz = -math.cos(e) * 0.96, -math.cos(e) * 0.28, math.sin(e)
        depth = 2.0
        gx, gy = -depth * self.card_gx, -depth * self.card_gy  # 눌린 자국: 높이 = −깊이·알파
        nz = 1.0 / np.sqrt(gx * gx + gy * gy + 1)
        shade = ((-gx * lx - gy * ly + lz) * nz) / lz
        shade = np.clip(shade, 0.25, 1.9)
        a = self.card_a
        base = self.card * (1 - 0.35 * a[..., None]) + self.card_smooth * (0.35 * a[..., None])  # 눌린 곳은 종이결이 조금 매끈
        base = base * (1 - 0.05 * a[..., None])
        # 쓸고 지나가는 빛 띠
        xc = lerp(-200, 2300, ease_io(span(u, 0.0, 1.0)))
        xx = np.arange(self.card_wh[0], dtype=np.float32)[None, :]
        band = 1 + 0.16 * np.exp(-((xx - xc) / 650) ** 2)
        img = base * shade[..., None] * band[..., None]
        zc = lerp(1.05, z_end, ease_io(span(u, 0.0, 1.0)))
        cxp = lerp(1010, self.card_logo_c[0], ease_io(u)); cyp = lerp(560, self.card_logo_c[1], ease_io(u))
        return camera(img, (W, H), zoom=zc, cx=cxp / self.card_wh[0], cy=cyp / self.card_wh[1])

    # ── 전체 타임라인 ──
    def frame(self, n):
        t = n / FPS
        HOT = np.array((1.0, 0.80, 0.58))
        A1, B1, C1, D1 = 3.5, 6.25, 8.75, 11.75
        z_d_end = 1.44
        if t < A1:  # A
            u = t / A1
            light = tungsten(t, 0.55)
            focus = lerp(15.0, 0.9, ease_io(span(t, 1.05, 2.5)))
            scale = lerp(1.016, 1.0, ease_io(span(t, 1.05, 2.5)))
            cam = (lerp(1.08, 1.12, ease_io(u)), lerp(1024, 1060, ease_io(u)), lerp(560, 540, ease_io(u)))
            lin = self.wall_frame(t, cam, self.slide1, light, focus, scale)
        elif t < B1:
            lin = self.set_frame(t, (t - A1) / (B1 - A1))
        elif t < C1:
            lin = self.cam_frame(t, (t - B1) / (C1 - B1))
        elif t < D1:
            lin = self.card_frame(t, (t - C1) / (D1 - C1), z_d_end)
        else:  # E: 매치 컷 — 명함 로고와 같은 자리·같은 크기
            u = (t - D1) / (DUR - D1)
            z0 = z_d_end * self.card_logo_w / self.slide1.w
            cam = (z0 * lerp(1.0, 1.035, ease_io(u)), 1120, 470)
            te = t - D1
            # 0.9초: 슬라이드 교체(기계 셔터가 4프레임 가렸다가 문구가 든 슬라이드), 2.35초: 소등
            if te < 0.9:
                light = (1.0, HOT); slide = self.slide1
            elif te < 0.9 + 4 / FPS:
                light = (0.0, HOT); slide = self.slide1
            else:
                light = tungsten(te, 0.9 + 4 / FPS, t_off=2.35)
                slide = self.slide2
            lin = self.wall_frame(t, cam, slide, light, 0.9)
        return self.film(lin_to_srgb(lin))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--frames', default='')
    ap.add_argument('--out', default=str(ROOT / 'site/public/media/film/pause.mp4'))
    ap.add_argument('--snap', default='')
    args = ap.parse_args()
    s = Shots()
    if args.frames:
        for n in map(int, args.frames.split(',')):
            Image.fromarray(s.frame(n)).save(f'{args.snap or "/tmp"}/pause-{n:03d}.jpg', quality=90)
            print('frame', n)
        return
    w = Writer(args.out, (W, H), FPS)
    for n in range(N):
        w.write(s.frame(n))
        if n % 48 == 0:
            print('frame', n, '/', N, flush=True)
    w.close()
    print('written', args.out)


if __name__ == '__main__':
    main()
