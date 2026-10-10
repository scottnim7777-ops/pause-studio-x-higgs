"""가상 브랜드 밤국수(심야 국숫집) 광고 '새벽 두 시' (14초, 1920×1080, 24fps, 무음) — 2026-10-09 9차

감독 콘셉트: 비 오는 밤의 손 떨림 카메라. 8fps로 찍어 3번씩 인화한 '스텝 프린트' 번짐, 빨강·청록·호박색, 거친 입자.
  1 골목 · 빨간 간판 쪽에서 불 켜진 국숫집 창으로 흔들리며 돌아감, 빗줄기   (Step-print · Handheld · Rain)
  2 창 너머 · 김 서린 유리 위로 빗방울이 흘러내리고, 안에 국수 한 그릇     (Step-print · Through glass)
  3 국수 · 초점이 맞아 들어오며 김이 피어오름(정상 속도)                     (Focal shift · Macro)
  4 간판 · 기울어진 화면(더치 앵글), 꺼져 있던 네온이 깜빡이며 켜짐 → 자막 한 줄 (Dutch angle · Light flash · Typography)
사진: Higgsfield Soul Cinema 2K(higgsfield/raw/v31-n1~n3). 김: 같은 국수 사진을 Kling 2.5로 움직인 앞 4초에서 김만 뽑음
(국수·그릇은 사진 그대로, 오른쪽 병·손이 나오는 뒷부분은 안 씀). 간판 네온·빗줄기·유리 물방울·흔들림·번짐은 여기서 계산.
실행: python tools/adv31/bam.py [--frames 0,40,...] [--out site/public/media/film/bam.mp4]
"""
import os, sys, math, argparse
from pathlib import Path
import numpy as np, cv2
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from fx import srgb_to_lin, lin_to_srgb, load, ease_io, ease_out, ease_in, lerp, span, camera, Film, Writer  # noqa: E402
from textmask import font, text_mask, place  # noqa: E402
from neon import thin, prune, tube, glyph_mask, rrect_path, glow, flicker_curve, fblur  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'higgsfield/raw'
W, H, FPS = 1920, 1080, 24
T1, T2, T3, T4, DUR = 3.2, 6.2, 9.8, 13.8, 14.05
N = int(round(DUR * FPS))
HOLD = 3            # 스텝 프린트: 8fps 한 장을 3번
SUB = 4             # 한 장 안의 노출(셔터 열린 동안) 나눔 수


def plate(name):
    return srgb_to_lin(load(RAW / f'v31-{name}' / f'v31-{name}.png'))


def redmask(lin, box):
    """네온 빨강(채도 높고 밝은 빨강) 영역 → 깜빡임을 줄 곳. box=(x0,y0,x1,y1) 안만(국물·고추장 같은 음식 빨강은 빼려고)"""
    s = lin_to_srgb(lin)
    red = s[..., 0] - np.maximum(s[..., 1], s[..., 2])
    m = np.clip((red - 0.22) / 0.2, 0, 1) * np.clip((s[..., 0] - 0.25) / 0.2, 0, 1)
    lim = np.zeros(m.shape, np.float32)
    x0, y0, x1, y1 = box
    lim[y0:y1, x0:x1] = 1
    return cv2.GaussianBlur((m * lim).astype(np.float32), (0, 0), 6)


def shake(t, seed, amp=1.0):
    """손 떨림(부드러운 무작위): (dx px, dy px, 기울기 도)"""
    rng = np.random.default_rng(seed)
    out = []
    for k, a in ((0, 14.0), (1, 10.0), (2, 0.35)):
        f = rng.uniform(0.35, 0.8, 3) * np.array([1, 2.6, 6.1])
        ph = rng.uniform(0, 2 * math.pi, 3)
        w = np.array([0.62, 0.28, 0.10])
        out.append(amp * a * float(np.sum(w * np.sin(2 * math.pi * f * t + ph))))
    return out


class Rain:
    """카메라 앞 빗줄기: 셔터 동안 떨어진 길이만큼 선. 밝기는 뒤의 빛(흐린 장면)을 받아 정함"""

    def __init__(self, wh, n, speed, width, angle, seed, bright=1.0, blur=0.0, length=1.0):
        self.W, self.H = wh
        rng = np.random.default_rng(seed)
        self.n = n
        self.x0 = rng.uniform(-300, self.W + 300, n)
        self.y0 = rng.uniform(0, self.H + 600, n)
        self.v = rng.uniform(*speed, n)
        self.lk = rng.uniform(0.55, 1.35, n)   # 방울마다 다른 길이(거리·크기 차이)
        self.b = rng.uniform(0.25, 1.0, n) ** 1.5 * bright
        a = math.radians(angle)
        self.sx, self.sy = math.sin(a), math.cos(a)
        self.width, self.blur, self.length = width, blur, length

    def mask(self, t, shutter):
        m = np.zeros((self.H, self.W), np.float32)
        span_ = self.H + 600
        d = (self.y0 + self.v * t) % span_ - 300
        x = self.x0 + (d + 300) * self.sx / self.sy
        L = self.v * shutter * self.length * self.lk
        for i in range(self.n):
            if -40 < x[i] < self.W + 40 and d[i] > -40 and d[i] - L[i] * self.sy < self.H + 40:
                # 머리(아래)는 밝고 꼬리(위)로 갈수록 옅게: 세 토막
                for a0, a1, k in ((0.0, 0.4, 1.0), (0.4, 0.75, 0.7), (0.75, 1.0, 0.38)):
                    p0 = (int((x[i] - a0 * L[i] * self.sx) * 16), int((d[i] - a0 * L[i] * self.sy) * 16))
                    p1 = (int((x[i] - a1 * L[i] * self.sx) * 16), int((d[i] - a1 * L[i] * self.sy) * 16))
                    cv2.line(m, p0, p1, float(self.b[i] * k), self.width, cv2.LINE_AA, 4)
        if self.blur:
            m = cv2.GaussianBlur(m, (0, 0), self.blur)
        return m


def add_rain(lin, layers, t, shutter, gain=1.0, amb=0.004):
    """빗줄기 = 마스크 × (주변 빛). 빗방울은 넓은 각도의 빛을 모으므로 뒤 배경보다 조금 밝게"""
    light = fblur(lin, 28) * 1.6 + fblur(lin, 90) * 0.8 + amb
    lum = light.mean(axis=2, keepdims=True)
    light = light * (lum / (lum + 0.02))  # 어두운 곳의 비는 거의 안 보이고, 빛 앞에서만 또렷하게
    m = np.zeros(lin.shape[:2], np.float32)
    for r in layers:
        m += r.mask(t, shutter)
    return lin + (m * gain)[..., None] * light


class Steam:
    """Kling 영상(같은 국수 사진에서 움직임) 앞부분에서 김만: 프레임 − 시간축 최솟값(선형광), 그릇 위·왼쪽 78%만"""

    TOP = 0.36  # 위쪽 36%만(그릇 테 위) 다룸 → 메모리 절약

    def __init__(self, path, n_use=104, size=(2048, 1152)):
        cap = cv2.VideoCapture(str(path))
        frames = []
        while len(frames) < n_use:
            ok, f = cap.read()
            if not ok:
                break
            f = f[:int(f.shape[0] * self.TOP)]
            frames.append(srgb_to_lin(cv2.cvtColor(f, cv2.COLOR_BGR2RGB).astype(np.float32) / 255).astype(np.float16))
        cap.release()
        st = np.stack(frames, 0)
        base = np.percentile(st.astype(np.float32), 8, axis=0).astype(np.float32)
        h, w = st.shape[1:3]
        H0 = h / self.TOP
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        # 그릇 테 위(y < 0.27H)는 다, 테 근처(0.27~0.33H)는 서서히, 오른쪽 22%(병·손이 나오는 쪽)는 뺌
        m = np.clip((0.33 * H0 - yy) / (0.06 * H0), 0, 1) * np.clip((0.78 * w - xx) / (0.05 * w), 0, 1) * np.clip((xx - 0.06 * w) / (0.05 * w), 0, 1)
        self.m = m[..., None].astype(np.float32)
        self.st, self.base, self.size = st, base, size
        self.ph = int(round(size[1] * self.TOP))

    def __call__(self, i):
        i = int(np.clip(i, 0, len(self.st) - 1))
        r = np.clip(self.st[i].astype(np.float32) - self.base, 0, None)
        r = cv2.GaussianBlur(r, (0, 0), 1.6) * self.m
        out = np.zeros((self.size[1], self.size[0], 3), np.float32)
        out[:self.ph] = cv2.resize(r, (self.size[0], self.ph), interpolation=cv2.INTER_CUBIC)
        return out


class Sign:
    """세로 돌출 간판 '밤/국/수'(빨강 네온) + 청록 테두리 관 + 검은 금속 판. 간판 공간(SW×SH)에서 계산"""
    SW, SH = 600, 1500

    def __init__(self):
        SW, SH = self.SW, self.SH
        f = font('SUIT-Variable.ttf', 330, [620])
        m = glyph_mask(['밤', '국', '수'], f, (SW, SH), [(SW // 2, 300), (SW // 2, 750), (SW // 2, 1200)])
        sk = prune(thin(m), 5)
        self.letters = []
        rng = np.random.default_rng(5)
        nz = cv2.GaussianBlur(rng.normal(0, 1, (SH, SW)).astype(np.float32), (0, 0), 40)
        uneven = 1 + 0.10 * nz / (nz.std() + 1e-6)  # 관마다·자리마다 조금씩 다른 밝기
        for i, cy in enumerate((300, 750, 1200)):  # 글자별(따로 켜지고 깜빡임)
            band = np.zeros_like(sk); band[cy - 220:cy + 220] = 1
            a, prof = tube(sk * band, 7.5)
            self.letters.append((a, prof * np.clip(uneven, 0.75, 1.2)))
        br = rrect_path(SW, SH, 34, 34, SW - 35, SH - 35, 70)
        self.border = tube(br, 6.5)
        # 판: 둥근 사각, 무광 검정 금속(아주 약한 결)
        plate_m = np.zeros((SH, SW), np.float32)
        r = 60
        cv2.rectangle(plate_m, (r, 6), (SW - r, SH - 6), 1.0, -1)
        cv2.rectangle(plate_m, (6, r), (SW - 6, SH - r), 1.0, -1)
        for cx, cy in ((r, r), (SW - r, r), (r, SH - r), (SW - r, SH - r)):
            cv2.circle(plate_m, (cx, cy), r - 6, 1.0, -1, cv2.LINE_AA)
        self.panel = cv2.GaussianBlur(plate_m, (0, 0), 1.2)
        tex = cv2.GaussianBlur(rng.normal(0, 1, (SH, SW)).astype(np.float32), (0, 0), 3)
        self.panel_alb = (0.035 * (1 + 0.25 * tex)).astype(np.float32)
        self.red = np.array([1.0, 0.075, 0.045], np.float32)
        self.teal = np.array([0.10, 0.80, 1.0], np.float32)

    def layers(self, levels, border_level):
        """켜짐 정도 → (빛 내는 층 emis, 판 알파, 판 반사율) 간판 공간 선형광"""
        emis = np.zeros((self.SH, self.SW, 3), np.float32)
        for (a, prof), lv in zip(self.letters, levels):
            if lv > 0:
                emis += (prof * lv)[..., None] * self.red * 4.2
        a, prof = self.border
        if border_level > 0:
            emis += (prof * border_level)[..., None] * self.teal * 3.2
        # 꺼진 관: 아래 창 불빛을 아주 옅게 받는 유리
        dead = sum(a for a, _ in self.letters) + self.border[0]
        emis += (np.clip(dead, 0, 1) * 0.0012)[..., None] * np.array([1.0, 0.7, 0.45], np.float32)
        return emis


class Bam:
    def __init__(self):
        self.film = Film((W, H), seed=33, grain=0.046, grain_size=1.35, halation=0.30, hal_thresh=0.52, hal_color=(1.0, 0.30, 0.16),
                         weave=0.28, flicker=0.010, vignette=0.34, ca=0.9, lift=0.018, sat=1.10, tint=(1.0, 1.0, 0.97), contrast=1.06)
        self.street = plate('n1-street')
        self.window = plate('n2-window')
        self.bowl = plate('n3-bowl')
        self.r1 = redmask(self.street, (0, 380, 520, 1152))
        self.r2 = redmask(self.window, (480, 420, 800, 980))
        self.r3 = redmask(self.bowl, (1650, 0, 2048, 330))
        self.steam = Steam(RAW / 'v31-steam' / 'v31-steam_01.mp4')
        self.sign = Sign()
        wh = (W, H)
        self.rain = [Rain(wh, 1300, (1500, 2100), 1, 7, 1, bright=0.55),
                     Rain(wh, 380, (2400, 3200), 2, 7, 2, bright=0.8, blur=0.8),
                     Rain(wh, 50, (3800, 4800), 3, 8, 3, bright=1.0, blur=2.6)]
        self.rain_light = [Rain(wh, 500, (1500, 2100), 1, 6, 11, bright=0.45),
                           Rain(wh, 120, (2400, 3200), 2, 6, 12, bright=0.6, blur=1.0)]
        self.close = self._close_scene()
        self.sub = self._subtitle()
        self.drops = self._drops()

    # ── 4 간판 장면: 거리 사진 위쪽 어두운 벽(+아래 창 불빛)을 크게, 간판은 호모그래피로 ──
    def _close_scene(self):
        x0, y0, x1, y1 = 980, 180, 1550, 500
        CW, CH = 2400, 1350
        bg = cv2.resize(self.street[y0:y1, x0:x1], (CW, CH), interpolation=cv2.INTER_CUBIC)
        bg = cv2.GaussianBlur(bg, (0, 0), 2.2)  # 간판보다 뒤 → 살짝 흐림
        # 간판 네 모서리(조금 원근: 바깥쪽 왼변이 가까워 조금 더 큼)
        quad = np.float32([[985, 140], [1290, 166], [1290, 1000], [985, 1040]])
        src = np.float32([[0, 0], [Sign.SW, 0], [Sign.SW, Sign.SH], [0, Sign.SH]])
        Hm = cv2.getPerspectiveTransform(src, quad)
        warp = lambda img, interp=cv2.INTER_LINEAR: cv2.warpPerspective(img, Hm, (CW, CH), flags=interp, borderMode=cv2.BORDER_CONSTANT)
        pa = warp(self.sign.panel)
        palb = warp(self.sign.panel_alb)
        # 판 아래쪽 가장자리: 아래 창 불빛을 받는 얇은 테
        edge = np.clip(pa - cv2.erode(pa, np.ones((7, 7), np.uint8)), 0, 1)
        yy = np.arange(CH, dtype=np.float32)[:, None]
        rim = edge * np.clip((yy - 600) / 500, 0, 1)
        amb = fblur(bg, 80)
        tex = np.clip(bg.mean(2) / (fblur(bg.mean(2), 30) + 1e-5), 0.55, 1.6)
        alb = (0.16 * tex)[..., None].astype(np.float32)
        # 오른쪽 먼 거리의 불빛(초점 밖 둥근 보케, 가장자리가 조금 밝음)
        bok = np.zeros((CH, CW, 3), np.float32)
        rng = np.random.default_rng(12)
        for (bx, by, r, col, k) in ((2050, 300, 40, (1.0, 0.62, 0.25), 0.020), (2260, 560, 52, (0.30, 0.80, 0.72), 0.012),
                                    (1890, 650, 24, (1.0, 0.85, 0.6), 0.016), (2310, 200, 30, (1.0, 0.32, 0.2), 0.014)):
            d = np.zeros((CH, CW), np.float32)
            cv2.circle(d, (bx, by), r, 1.0, -1, cv2.LINE_AA)
            ring = np.zeros((CH, CW), np.float32)
            cv2.circle(ring, (bx, by), int(r * 0.88), 1.0, max(2, r // 7), cv2.LINE_AA)
            tex = 1 + 0.18 * cv2.GaussianBlur(rng.normal(0, 1, (CH, CW)).astype(np.float32), (0, 0), max(2, r / 6)) * 6  # 렌즈 속 먼지·빗방울 결
            d = cv2.GaussianBlur((d * 0.7 + ring * 0.3) * tex, (0, 0), 5.0)
            bok += d[..., None] * np.array(col, np.float32) * k
        # 판을 벽에 거는 팔(오른쪽 위 → 화면 밖 건물 쪽)
        arm = np.zeros((CH, CW), np.float32)
        cv2.line(arm, (1290, 190), (2400, 160), 1.0, 9, cv2.LINE_AA)
        cv2.line(arm, (1290, 970), (2400, 925), 1.0, 7, cv2.LINE_AA)
        arm = cv2.GaussianBlur(arm, (0, 0), 1.0)
        return dict(bg=bg, pa=pa, palb=palb, warp=warp, arm=arm, rim=rim, amb=amb, alb=alb, bok=bok, size=(CW, CH))

    def _subtitle(self):
        f = font('IBMPlexSansKR-Medium.ttf', 46)
        m, b = text_mask('새벽 두 시까지, 불 켜 둘게요.', f, track=0.02)
        a = place((H, W), m, W / 2, 944, b)
        sh = cv2.GaussianBlur(a, (0, 0), 3.0)
        return a, sh

    def _drops(self):
        rng = np.random.default_rng(8)
        drops = []
        for i in range(9):
            drops.append(dict(x=rng.uniform(160, 1760), y0=rng.uniform(-80, 520), r=rng.uniform(6, 11),
                              v=rng.uniform(70, 190), t0=rng.uniform(-0.4, 1.8), wob=rng.uniform(0, 6.28)))
        return drops

    # ── 장면별(선형광, 출력 크기) ──
    def street_at(self, t):
        u = ease_io(span(t, 0.0, T1))
        dx, dy, rot = shake(t, 1, 1.2)
        z = 1.18
        lin = self.street * (1 + (self.neon_buzz(t, 1) - 1) * self.r1)[..., None]
        return camera(lin, (W, H), zoom=z, cx=lerp(0.43, 0.565, u) + dx / (z * W), cy=0.5 + dy / (z * W), rot=rot)

    def window_at(self, t):
        u = ease_io(span(t, 0.0, T2 - T1))
        dx, dy, rot = shake(t + 7, 2, 0.9)
        z = lerp(1.12, 1.24, u)
        lin = self.window * (1 + (self.neon_buzz(t, 2) - 1) * self.r2)[..., None]
        out = camera(lin, (W, H), zoom=z, cx=0.52 + dx / (z * W), cy=lerp(0.50, 0.56, u) + dy / (z * W), rot=rot * 0.8)
        return self.glass_drops(out, t)

    def bowl_at(self, t):
        u = ease_io(span(t, 0.0, T3 - T2))
        st = self.steam(14 + t * FPS) * 1.25
        lin = self.bowl * (1 + (self.neon_buzz(t, 3) - 1) * self.r3)[..., None] + st
        dx, dy, rot = shake(t + 3, 3, 0.35)
        z = lerp(1.02, 1.14, u)
        out = camera(lin, (W, H), zoom=z, cx=0.5 + dx / (z * W), cy=lerp(0.49, 0.53, u) + dy / (z * W), rot=rot * 0.5)
        sig = lerp(7.0, 0.0, ease_out(span(t, 0.05, 0.85), 2))  # 초점이 맞아 들어옴
        if sig > 0.25:
            out = cv2.GaussianBlur(out, (0, 0), sig)
        return out

    def sign_at(self, t):
        c = self.close
        lv = [flicker_curve(t, 0.62 + 0.22 * i, 40 + i) for i in range(3)]
        bl = flicker_curve(t, 0.50, 50, [(0.05, 0.9), (0.08, 0.0), (0.04, 0.7), (0.16, 0.0), (0.10, 0.5)])
        buzz = self.neon_buzz(t, 4)
        lv = [v * buzz * (1 - 0.35 * (i == 1) * self._fault(t)) for i, v in enumerate(lv)]
        emis_s = self.sign.layers(lv, bl * buzz)
        emis = cv2.GaussianBlur(c['warp'](emis_s), (0, 0), 1.1)
        # 빛: 판·벽에 비침(번짐 넓게), 렌즈·비 속 번짐
        spill = fblur(emis, 50) * 1.4 + fblur(emis, 150) * 1.2
        bg = c['bg'] * (0.6 + spill * 26.0) + c['alb'] * spill * 5.0  # 꺼져 있을 땐 어둡게, 켜지면 간판 가까이 벽부터 밝아짐
        panel = c['palb'][..., None] * (c['amb'] * 3.0 + spill * 10.0)
        pa = c['pa'][..., None]
        lin = bg * (1 - pa) + panel * pa
        lin = lin + c['rim'][..., None] * np.array([0.020, 0.011, 0.005], np.float32)
        arm = c['arm'][..., None]
        lin = lin * (1 - arm) + arm * (c['amb'] * 0.8 + spill * 0.09)
        lin = lin + emis + glow(emis) * 0.85 + c['bok'] * (1 + 0.04 * math.sin(t * 7.3))
        dx, dy, rot = shake(t + 11, 4, 0.45)
        z = 1.14
        out = camera(lin, (W, H), zoom=z, cx=0.515 + dx / (z * W), cy=0.5 + dy / (z * W), rot=-8.5 + rot)
        return out

    def _fault(self, t):
        """'국' 자가 한두 번 잠깐 흐려짐(오래된 네온)"""
        return 1.0 if (2.55 < t < 2.60 or 2.68 < t < 2.71) else 0.0

    def neon_buzz(self, t, seed):
        k = int(t * 48)
        rng = np.random.default_rng(seed * 10007 + k)
        return 1 + rng.normal(0, 0.025)

    def glass_drops(self, img, t):
        """창 유리 위로 흘러내리는 빗방울: 방울 안은 뒤 풍경이 뒤집혀 작게 보임(굴절), 위쪽 작은 반짝임, 지나간 자리 물길"""
        Hh, Ww = img.shape[:2]
        mx, my = np.meshgrid(np.arange(Ww, dtype=np.float32), np.arange(Hh, dtype=np.float32))
        hl = np.zeros((Hh, Ww), np.float32)
        trail = np.zeros((Hh, Ww), np.float32)
        for d in self.drops:
            tt = t - d['t0']
            if tt < 0:
                continue
            # 멈칫거리며 흘러내림
            y = d['y0'] + d['v'] * (tt + 0.25 * math.sin(tt * 3.1 + d['wob']))
            x = d['x'] + 4 * math.sin(tt * 1.7 + d['wob'])
            r = d['r']
            if y - r > Hh:
                continue
            x0, x1 = int(max(0, x - r - 2)), int(min(Ww, x + r + 3))
            y0, y1 = int(max(0, y - r * 1.25 - 2)), int(min(Hh, y + r * 1.25 + 3))
            if x1 <= x0 or y1 <= y0:
                continue
            X, Y = mx[y0:y1, x0:x1], my[y0:y1, x0:x1]
            nx, ny = (X - x) / r, (Y - y) / (r * 1.25)
            rr = nx * nx + ny * ny
            inside = rr < 1
            k = 3.2  # 넓은 각도를 작게, 뒤집어 보임
            mx[y0:y1, x0:x1] = np.where(inside, x - nx * r * k, X)
            my[y0:y1, x0:x1] = np.where(inside, y - ny * r * 1.25 * k, Y)
            hl[y0:y1, x0:x1] += np.exp(-(((X - (x - 0.35 * r)) / (0.22 * r)) ** 2 + ((Y - (y - 0.45 * r)) / (0.22 * r)) ** 2)) * 0.9
            ty0 = int(max(0, d['y0'])); ty1 = int(max(0, min(Hh, y - r)))
            if ty1 > ty0:
                cv2.line(trail, (int(x), ty0), (int(x), ty1), 1.0, max(1, int(r * 0.35)), cv2.LINE_AA)
        out = cv2.remap(img, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        trail = cv2.GaussianBlur(trail, (0, 0), 1.2)
        light = fblur(img, 20)
        out = out * (1 - 0.25 * trail[..., None]) + trail[..., None] * light * 0.6
        return out + hl[..., None] * fblur(img, 30) * 6.0

    def grade(self, srgb):
        """그림자는 청록·초록 쪽으로, 밝은 곳은 따뜻하게(필름 전에)"""
        lum = srgb.mean(axis=2, keepdims=True)
        sh = np.clip(1 - lum * 2.2, 0, 1) ** 2
        hi = np.clip((lum - 0.55) / 0.45, 0, 1)
        return srgb + sh * np.array([-0.010, 0.012, 0.010], np.float32) + hi * np.array([0.02, 0.0, -0.025], np.float32)

    def scene(self, t, shutter=1 / 48):
        """시각 t의 한 장(선형광) + 비(셔터 동안 떨어진 길이)"""
        if t < T1:
            lin = self.street_at(t)
            return add_rain(lin, self.rain, t, shutter, gain=1.0)
        if t < T2:
            lin = self.window_at(t - T1)
            return add_rain(lin, self.rain_light, t, shutter, gain=0.7)
        if t < T3:
            return self.bowl_at(t - T2)
        lin = self.sign_at(t - T3)
        return add_rain(lin, self.rain, t, shutter, gain=1.1)

    def frame(self, n):
        t = n / FPS
        if t >= T4:
            return np.zeros((H, W, 3), np.uint8)
        if t < T2:
            # 스텝 프린트: 8fps 한 장(셔터 1/10초 동안 SUB번 겹침)을 3번 인화
            seg0 = 0.0 if t < T1 else T1
            k = int(round((t - seg0) * FPS)) // HOLD
            key = (seg0, k)
            if getattr(self, '_held', (None,))[0] != key:
                ts = seg0 + k * HOLD / FPS
                acc = np.zeros((H, W, 3), np.float32)
                for j in range(SUB):
                    tj = min(ts + j * 0.1 / SUB, (T1 if t < T1 else T2) - 1e-3)
                    acc += self.scene(tj, 0.1 / SUB)
                self._held = (key, acc / SUB)
            lin = self._held[1]
        else:
            lin = self.scene(t)
        srgb = self.grade(np.clip(lin_to_srgb(lin), 0, 1))
        out = self.film(srgb)
        if T3 <= t < T4:
            out = self._put_sub(out, t - T3)
        return out

    def _put_sub(self, out, u):
        if u < 1.95:
            return out
        a, sh = self.sub
        x = out.astype(np.float32) / 255
        x = x * (1 - 0.55 * sh[..., None])
        x = x * (1 - a[..., None]) + a[..., None] * np.array([0.96, 0.94, 0.86], np.float32)
        return (np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--frames', default='')
    ap.add_argument('--snap', default='/tmp')
    ap.add_argument('--out', default=str(ROOT / 'site/public/media/film/bam.mp4'))
    a = ap.parse_args()
    b = Bam()
    if a.frames:
        for n in map(int, a.frames.split(',')):
            Image.fromarray(b.frame(n)).save(f'{a.snap}/bam-{n:03d}.jpg', quality=90)
            print('frame', n, flush=True)
        return
    w = Writer(a.out, (W, H), FPS)
    for n in range(N):
        w.write(b.frame(n))
        if n % 48 == 0:
            print('frame', n, '/', N, flush=True)
    w.close()
    print('written', a.out)


if __name__ == '__main__':
    main()
