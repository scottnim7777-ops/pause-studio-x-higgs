"""광고 합성 도구(정지 사진 → '촬영한 것 같은' 영상). 모두 numpy/OpenCV, 선형광 공간에서 빛을 더한다.
- 카메라: 확대·이동·작은 회전 + 깊이 시차(2.5D) + 렌즈 호흡
- 초점: 깊이 지도 기반 피사계 심도(초점면 이동 = 랙 포커스)
- 빛: 선형 공간에서 '직사광' 마스크를 곱해 더함(벽의 질감·알베도를 그대로 살림)
- 필름: 그레인(프레임마다 새로), 할레이션, 게이트 흔들림, 깜빡임, 비네트, 가장자리 색수차, 토 커브
"""
import numpy as np, cv2, math, subprocess
from PIL import Image

def srgb_to_lin(x):
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4).astype(np.float32)

def lin_to_srgb(x):
    x = np.clip(x, 0, None)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * np.power(x, 1 / 2.4) - 0.055).astype(np.float32)

def load(path, crop=0, size=None):
    im = Image.open(path).convert('RGB')
    if crop:
        w, h = im.size; c = crop
        im = im.crop((c, int(c * h / w), w - c, h - int(c * h / w)))
    if size:
        im = im.resize(size, Image.LANCZOS)
    return np.asarray(im, dtype=np.float32) / 255.0

def ease_io(x):
    x = min(max(x, 0.0), 1.0)
    return x * x * (3 - 2 * x)

def ease_out(x, p=3):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** p

def ease_in(x, p=3):
    x = min(max(x, 0.0), 1.0)
    return x ** p

def lerp(a, b, t):
    return a + (b - a) * t

def span(t, t0, t1):
    return min(max((t - t0) / (t1 - t0), 0.0), 1.0) if t1 > t0 else float(t >= t1)

# ── 카메라 ──────────────────────────────────────────────
def camera(img, out_wh, zoom=1.0, cx=0.5, cy=0.5, rot=0.0, depth=None, par=(0.0, 0.0), par_focus=0.5, par_zoom=0.0):
    """img(H,W,3) 위에서 가상 카메라로 out_wh 프레임을 뽑는다.
    zoom: 1이면 원본 폭 전체, cx/cy: 원본 기준 중심(0~1), rot: 도(roll)
    depth: 0(멀다)~1(가깝다). par=(px,py): 깊이 1인 물체가 깊이 par_focus보다 더 움직이는 양(출력 픽셀)
    par_zoom: 가까운 것일수록 더 커짐(달리 인 효과)"""
    H, W = img.shape[:2]
    ow, oh = out_wh
    # 출력 픽셀 → 원본 좌표(역방향 매핑)
    s = (W / zoom) / ow  # 출력 1px 당 원본 px
    xs = (np.arange(ow, dtype=np.float32) - ow / 2)
    ys = (np.arange(oh, dtype=np.float32) - oh / 2)
    X, Y = np.meshgrid(xs, ys)
    a = math.radians(rot)
    ca, sa = math.cos(a), math.sin(a)
    Xr = ca * X - sa * Y; Yr = sa * X + ca * Y
    mx = cx * W + Xr * s
    my = cy * H + Yr * s
    if depth is not None and (par[0] or par[1] or par_zoom):
        d = cv2.remap(depth, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        k = (d - par_focus)
        mx = mx - k * par[0] * s - k * par_zoom * Xr * s
        my = my - k * par[1] * s - k * par_zoom * Yr * s
    return cv2.remap(img, mx.astype(np.float32), my.astype(np.float32), cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)

# ── 피사계 심도(랙 포커스) ───────────────────────────────
def dof(img, depth, focus, max_r, levels=(0, 1.5, 3, 6, 10, 16, 24)):
    """초점면(focus, 0~1 깊이)에서 멀수록 흐림. max_r: |d-focus|=1일 때 반경(px)"""
    r = np.clip(np.abs(depth - focus) * max_r, 0, levels[-1]).astype(np.float32)
    stack = []
    for lv in levels:
        if lv <= 0.01:
            stack.append(img)
        else:
            k = int(lv * 2) * 2 + 1
            stack.append(cv2.GaussianBlur(img, (k, k), lv * 0.75))
    out = np.zeros_like(img)
    for i in range(len(levels) - 1):
        a, b = levels[i], levels[i + 1]
        w = np.clip((r - a) / (b - a), 0, 1)[..., None]
        inside = ((r >= a) & (r <= b))[..., None]
        out = np.where(inside, stack[i] * (1 - w) + stack[i + 1] * w, out)
    return out

# ── 빛 ─────────────────────────────────────────────────
def add_light(lin, mask, color=(1.0, 0.86, 0.68), gain=1.5):
    """선형 공간: lit = albedo*(ambient + direct) ≈ lin*(1 + gain*mask*color)"""
    m = mask[..., None] * np.array(color, np.float32)[None, None, :]
    return lin * (1 + gain * m)

def soft(mask, r):
    if r <= 0:
        return mask
    k = int(r * 3) * 2 + 1
    return cv2.GaussianBlur(mask, (k, k), r)

# ── 필름 ───────────────────────────────────────────────
class Film:
    def __init__(self, wh, seed=7, grain=0.035, grain_size=1.1, halation=0.22, hal_thresh=0.72, hal_color=(1.0, 0.35, 0.18),
                 weave=0.35, flicker=0.008, vignette=0.28, ca=0.6, lift=0.025, toe=0.0, sat=1.0, tint=(1, 1, 1), contrast=1.0):
        self.w, self.h = wh
        self.rng = np.random.default_rng(seed)
        self.__dict__.update(dict(grain=grain, grain_size=grain_size, halation=halation, hal_thresh=hal_thresh, hal_color=np.array(hal_color, np.float32),
                                  weave=weave, flicker=flicker, vignette=vignette, ca=ca, lift=lift, toe=toe, sat=sat, tint=np.array(tint, np.float32), contrast=contrast))
        yy, xx = np.mgrid[0:self.h, 0:self.w].astype(np.float32)
        rr = np.sqrt(((xx - self.w / 2) / (self.w / 2)) ** 2 + ((yy - self.h / 2) / (self.h / 2)) ** 2) / math.sqrt(2)
        self.vig = (1 - self.vignette * np.clip(rr, 0, 1) ** 2.2).astype(np.float32)[..., None]
        self.wx, self.wy = 0.0, 0.0

    def __call__(self, srgb):
        """srgb(H,W,3) 0~1 → 필름 느낌 srgb uint8"""
        x = srgb.astype(np.float32)
        # 게이트 흔들림(아주 작은 무작위 걸음)
        if self.weave:
            self.wx = 0.85 * self.wx + self.rng.normal(0, self.weave * 0.5)
            self.wy = 0.85 * self.wy + self.rng.normal(0, self.weave * 0.5)
            M = np.float32([[1, 0, self.wx], [0, 1, self.wy]])
            x = cv2.warpAffine(x, M, (self.w, self.h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
        # 할레이션: 밝은 곳 둘레 붉은 번짐
        if self.halation:
            lum = x.mean(axis=2)
            hi = np.clip((lum - self.hal_thresh) / (1 - self.hal_thresh + 1e-6), 0, 1)
            k = int(self.w * 0.012) * 2 + 1
            glow = cv2.GaussianBlur(hi, (k, k), self.w * 0.006)
            k2 = int(self.w * 0.03) * 2 + 1
            glow = 0.6 * glow + 0.4 * cv2.GaussianBlur(hi, (k2, k2), self.w * 0.015)
            x = x + self.halation * glow[..., None] * self.hal_color[None, None, :]
        # 색: 대비·채도·색조
        if self.contrast != 1.0:
            x = (x - 0.5) * self.contrast + 0.5
        if self.sat != 1.0:
            g = x.mean(axis=2, keepdims=True)
            x = g + (x - g) * self.sat
        x = x * self.tint[None, None, :]
        # 색수차(가장자리)
        if self.ca:
            r = cv2.resize(x[..., 0], None, fx=1 + self.ca / self.w * 2, fy=1 + self.ca / self.w * 2, interpolation=cv2.INTER_LINEAR)
            dy = (r.shape[0] - self.h) // 2; dx = (r.shape[1] - self.w) // 2
            x[..., 0] = r[dy:dy + self.h, dx:dx + self.w]
        # 비네트·깜빡임
        x = x * self.vig * (1 + self.rng.normal(0, self.flicker))
        # 검정 들뜸(필름 베이스)
        x = self.lift + x * (1 - self.lift)
        # 그레인: 중간 톤에서 가장 강함
        if self.grain:
            n = self.rng.normal(0, 1, (self.h, self.w)).astype(np.float32)
            if self.grain_size > 0.5:
                k = int(self.grain_size * 2) * 2 + 1
                n = cv2.GaussianBlur(n, (k, k), self.grain_size * 0.6) * (self.grain_size * 1.2)
            lum = np.clip(x.mean(axis=2), 0, 1)
            amp = self.grain * (0.35 + 1.3 * lum * (1 - lum) * 2)
            nc = self.rng.normal(0, 0.25, (self.h, self.w, 3)).astype(np.float32)
            x = x + (n[..., None] + nc) * amp[..., None]
        return (np.clip(x, 0, 1) * 255 + 0.5).astype(np.uint8)

# ── 출력 ───────────────────────────────────────────────
class Writer:
    """웹용 기본: 필름 그레인을 살짝 눌러(hqdn3d) CRF 28 — 15초 1080p가 약 3MB"""
    def __init__(self, path, wh, fps=24, crf=28, vf='hqdn3d=1.2:1.2:4:4'):
        cmd = ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{wh[0]}x{wh[1]}', '-r', str(fps), '-i', '-']
        if vf:
            cmd += ['-vf', vf]
        cmd += ['-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path]
        self.p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    def write(self, frame_u8):
        self.p.stdin.write(np.ascontiguousarray(frame_u8).tobytes())
    def close(self):
        self.p.stdin.close(); self.p.wait()

def letterbox(frame, ratio, color=0.0):
    """frame(H,W,3) float/uint8 에 위아래 검은 띠(ratio = 화면비, 예 2.39)"""
    H, W = frame.shape[:2]
    h = int(round(W / ratio)) if ratio else H
    if h >= H:
        return frame
    b = (H - h) // 2
    out = frame.copy()
    out[:b] = color; out[H - b:] = color
    return out
