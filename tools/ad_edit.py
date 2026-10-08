"""AI 광고영상 샘플 편집(가상 브랜드 · PAUSE 기획) — 생성한 두 컷 + 끝 화면 → 10초 안팎 광고(1280×720, 소리 없음)

실행: python3 tools/ad_edit.py [ondo|route|daon ...]   (아무것도 안 주면 셋 다)
결과: site/public/media/film/{key}.mp4 · {key}-poster.jpg · {key}-before.jpg(보내주신 사진, 4:3)
콘티·문구는 아래 ADS. 컷 원본은 higgsfield/raw/v30-vid-*(Higgsfield DoP), 사진은 higgsfield/raw/v30-ad-*·v14·v15.

만드는 방식(진짜 광고 편집처럼):
- 컷 편집: 검정에서 열림 → 첫 컷 → 디졸브 → 둘째 컷 → 마지막 장면이 멈추며 어두워지는 끝 화면 → 검정으로 닫힘(반복 재생 대비)
- 색 보정(브랜드별 톤) · 비네트 · 아주 옅은 필름 그레인
- 글씨는 AI가 만들지 않고 편집에서 실제 서체로: 한글 마루 부리(네이버, OFL), 영문 워드마크 Instrument Serif(OFL), 작은 영문 Archivo(OFL)
- 글자는 0.7초에 걸쳐 살짝 떠오르며 나타나고, 자간이 천천히 좁혀짐
"""
import subprocess, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'higgsfield/raw'
OUT = ROOT / 'site/public/media/film'
FONTS = ROOT / 'drafts/fonts'
CACHE = ROOT / 'site/.cache/adfonts'
W, H, FPS = 1280, 720, 30
CREAM = (247, 238, 224)


def font_path(name: str) -> Path:
    """마루 부리는 woff2라 Pillow용 ttf로 한 번 바꿔 둔다"""
    src = FONTS / name
    if src.suffix == '.woff2':
        CACHE.mkdir(parents=True, exist_ok=True)
        dst = CACHE / (src.stem + '.ttf')
        if not dst.exists():
            from fontTools.ttLib import TTFont
            f = TTFont(src); f.flavor = None; f.save(dst)
        return dst
    return src


def font(name: str, size: int, axes=None) -> ImageFont.FreeTypeFont:
    f = ImageFont.truetype(str(font_path(name)), size, layout_engine=ImageFont.Layout.RAQM)
    if axes:
        f.set_variation_by_axes(axes)
    return f


KO = lambda s: font('MaruBuri-SemiBold.woff2', s)
KO_R = lambda s: font('MaruBuri-Regular.woff2', s)
SERIF = lambda s: font('InstrumentSerif-Regular.ttf', s)
LABEL = lambda s: font('Archivo-VF.ttf', s, [100, 520])  # wdth 100, wght 520


ADS = {
    'ondo': {
        'brand': 'ONDO COFFEE', 'before': ('v14-ondo-before', 0.5),
        'a': ('v30-vid-ondo-steam', 0.25, 3.95), 'b': ('v30-vid-ondo-pour', 0.10, 4.95),
        'grade': {'rgb': (1.035, 1.0, 0.94), 'contrast': 1.06, 'lift': 5, 'sat': 1.02},
        'texts': [
            # (시작, 끝, 종류, 글, 위치)
            (0.75, 3.45, 'kicker', 'ONDO COFFEE  ·  AUCKLAND', 'bl'),
            (0.95, 3.45, 'head', '매일 아침, 같은 온도로', 'bl'),
            (4.35, 7.70, 'head', '바리스타가 직접 내리는 시그니처 라떼', 'bl'),
        ],
        'end': {'mark': 'ONDO', 'mark_track': 0.16, 'sub': 'C O F F E E', 'line': '오늘의 온도를 담은 한 잔', 'small': 'AUCKLAND CBD  ·  SINCE 2026'},
    },
    'route': {
        'brand': 'SOUTHERN ROUTE', 'before': ('v30-ad-travel-before', 0.5),
        'a': ('v30-vid-travel-lake', 0.20, 4.45), 'b': ('v30-vid-travel-jetty', 0.30, 5.15),
        'grade': {'rgb': (1.0, 1.0, 1.03), 'contrast': 1.08, 'lift': 3, 'sat': 1.04},
        'texts': [
            (0.75, 3.85, 'kicker', 'SOUTHERN ROUTE  ·  NEW ZEALAND', 'bl'),
            (0.95, 3.85, 'head', '남섬, 가장 맑은 계절로', 'bl'),
            (4.55, 7.95, 'head', '한국어 가이드와 함께하는 7일', 'bl'),
        ],
        'end': {'mark': 'SOUTHERN ROUTE', 'mark_track': 0.07, 'sub': 'PRIVATE  TOURS', 'line': '뉴질랜드 남섬 프라이빗 투어', 'small': '7 DAYS  ·  SMALL GROUP  ·  KOREAN GUIDE'},
    },
    'daon': {
        'brand': 'DAON HONEY', 'before': ('v30-ad-honey-before-r2', 0.5),
        'a': ('v30-vid-honey-drip', 0.20, 4.40), 'b': ('v30-vid-honey-jar', 0.20, 5.05),
        'grade': {'rgb': (1.04, 1.0, 0.93), 'contrast': 1.08, 'lift': 4, 'sat': 1.03},
        'texts': [
            (0.75, 3.70, 'kicker', 'DAON HONEY  ·  NEW ZEALAND', 'bl'),
            (0.95, 3.70, 'head', '천천히, 자연이 만든 속도로', 'bl'),
            (4.40, 7.80, 'head', '뉴질랜드에서 온 마누카 꿀', 'bl'),
        ],
        'end': {'mark': 'DAON', 'mark_track': 0.18, 'sub': 'H O N E Y', 'line': '좋은 것만 담은 뉴질랜드 꿀', 'small': 'MANUKA HONEY  ·  NEW ZEALAND'},
    },
}

FADE_IN, XFADE, FREEZE_IN, END_LEN, FADE_OUT = 0.5, 0.45, 0.8, 3.1, 0.55


def read_clip(label: str, t0: float, t1: float) -> list[np.ndarray]:
    src = RAW / label / f'{label}_01.mp4'
    cmd = ['ffmpeg', '-v', 'error', '-ss', f'{t0}', '-to', f'{t1}', '-i', str(src), '-vf', f'scale={W}:{H}:flags=lanczos,fps={FPS}',
           '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    n = len(raw) // (W * H * 3)
    return [np.frombuffer(raw, np.uint8, W * H * 3, i * W * H * 3).reshape(H, W, 3).astype(np.float32) for i in range(n)]


def make_grade(g):
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    vig = (1 - 0.2 * np.clip(r - 0.35, 0, None) ** 1.6)[..., None]
    mul = np.array(g['rgb'], np.float32)
    rng = np.random.default_rng(7)

    def apply(f: np.ndarray) -> np.ndarray:
        f = f * mul
        lum = f.mean(axis=2, keepdims=True)
        f = lum + (f - lum) * g['sat']
        f = (f - 128) * g['contrast'] + 128 + g['lift'] * (1 - f / 255)
        f = f * vig
        f = f + rng.normal(0, 2.2, (H, W, 1)).astype(np.float32)  # 아주 옅은 그레인
        return f
    return apply


def ease(x: float) -> float:
    x = min(1.0, max(0.0, x))
    return 1 - (1 - x) ** 3


def draw_tracked(d: ImageDraw.ImageDraw, xy, text: str, f: ImageFont.FreeTypeFont, track_em: float, fill, anchor='ls'):
    """자간을 준 글자열(글자마다 그림). anchor: ls(왼쪽 기준선) · ms(가운데 기준선)"""
    sp = 0.26 * f.size  # 띄어쓰기 폭(글자마다 그리면 일부 서체에서 공백이 빈 상자로 나와 직접 띄움)
    adv = [sp if ch == ' ' else f.getlength(ch) for ch in text]
    track = track_em * f.size
    total = sum(adv) + track * (len(text) - 1)
    x, y = xy
    if anchor == 'ms':
        x -= total / 2
    for ch, a in zip(text, adv):
        if ch != ' ':
            d.text((x, y), ch, font=f, fill=fill, anchor='ls')
        x += a + track
    return total


def text_overlay(ad, t: float, end_start: float) -> Image.Image | None:
    layer = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    used = False
    # 문구: 왼쪽 아래, 떠오르며 나타나고 끝에서 사라짐
    for (a, b, kind, text, _pos) in ad['texts']:
        if not (a - 0.01 <= t <= b + 0.6):
            continue
        k_in = ease((t - a) / 0.7)
        k_out = 1 - ease((t - b) / 0.5) if t > b else 1.0
        al = k_in * k_out
        if al <= 0.002:
            continue
        used = True
        rise = (1 - k_in) * 14
        if kind == 'kicker':
            f = LABEL(16)
            draw_tracked(d, (76, H - 150 + rise), text, f, 0.32 - 0.06 * k_in, (*CREAM, int(235 * al)))
        else:
            f = KO(44)
            draw_tracked(d, (72, H - 92 + rise), text, f, -0.01 + 0.03 * (1 - k_in), (*CREAM, int(255 * al)))
    # 끝 화면: 가운데 워드마크 + 영문 + 한 줄 + 작은 정보
    if t >= end_start:
        e = ad['end']
        te = t - end_start
        used = True
        k1, k2, k3, k4 = (ease((te - s) / 0.9) for s in (0.25, 0.55, 0.8, 1.05))
        mark = SERIF(118 if len(e['mark']) <= 6 else 88)
        draw_tracked(d, (W / 2, H / 2 - 6 + (1 - k1) * 16), e['mark'], mark, e['mark_track'] + 0.10 * (1 - k1), (*CREAM, int(255 * k1)), 'ms')
        draw_tracked(d, (W / 2, H / 2 + 40 + (1 - k2) * 10), e['sub'], LABEL(15), 0.42, (*CREAM, int(225 * k2)), 'ms')
        draw_tracked(d, (W / 2, H / 2 + 104 + (1 - k3) * 10), e['line'], KO_R(26), 0.0, (*CREAM, int(240 * k3)), 'ms')
        draw_tracked(d, (W / 2, H - 58 + (1 - k4) * 6), e['small'], LABEL(13), 0.3, (*CREAM, int(190 * k4)), 'ms')
    return layer if used else None


def bottom_shade(alpha: float) -> np.ndarray:
    """글자 뒤 왼쪽 아래를 살짝 어둡게(읽히게)"""
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    s = np.clip((yy - H * 0.45) / (H * 0.55), 0, 1) ** 1.4 * np.clip(1.15 - xx / (W * 0.9), 0, 1)
    return (1 - 0.55 * alpha * s)[..., None]


SHADE = None


def render(key: str):
    global SHADE
    ad = ADS[key]
    OUT.mkdir(parents=True, exist_ok=True)
    grade = make_grade(ad['grade'])
    if SHADE is None:
        SHADE = bottom_shade(1.0)
    A = read_clip(*ad['a'])
    B = read_clip(*ad['b'])
    nx = int(XFADE * FPS)
    # 컷 A + 디졸브 + 컷 B
    seq = A[:-nx] + [A[len(A) - nx + i] * (1 - (i + 1) / (nx + 1)) + B[i] * ((i + 1) / (nx + 1)) for i in range(nx)] + B[nx:]
    end_start = len(seq) / FPS
    last = B[-1]
    n_end = int(END_LEN * FPS)
    total = len(seq) + n_end
    enc = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                            '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart',
                            str(OUT / f'{key}.mp4')], stdin=subprocess.PIPE)
    poster_at = int(0.6 * FPS)
    for i in range(total):
        t = i / FPS
        if i < len(seq):
            f = seq[i]
        else:
            # 끝 화면: 마지막 장면을 멈추고 천천히 다가가며 어두워짐
            k = (i - len(seq)) / FPS
            z = 1 + 0.035 * ease(k / END_LEN)
            img = Image.fromarray(np.clip(last, 0, 255).astype(np.uint8)).resize((round(W * z), round(H * z)), Image.LANCZOS)
            ox, oy = (img.width - W) // 2, (img.height - H) // 2
            f = np.asarray(img.crop((ox, oy, ox + W, oy + H)), np.float32) * (1 - 0.58 * ease(k / FREEZE_IN))
        f = grade(f)
        # 문구가 있을 때만 왼쪽 아래 그늘
        shade_on = max([ease((t - a) / 0.7) * (1 - ease((t - b) / 0.5) if t > b else ease((t - a) / 0.7)) for (a, b, *_r) in ad['texts']] + [0])
        if shade_on > 0 and i < len(seq):
            f = f * (1 - (1 - SHADE) * shade_on)
        # 열림·닫힘
        f = f * min(1.0, ease(t / FADE_IN)) * min(1.0, ease((total / FPS - t) / FADE_OUT))
        frame = Image.fromarray(np.clip(f, 0, 255).astype(np.uint8))
        lay = text_overlay(ad, t, end_start)
        if lay is not None:
            fade = min(1.0, ease((total / FPS - t) / FADE_OUT))
            if fade < 1:
                lay.putalpha(lay.getchannel('A').point(lambda v: int(v * fade)))
            frame = Image.alpha_composite(frame.convert('RGBA'), lay).convert('RGB')
        if i == poster_at:
            frame.save(OUT / f'{key}-poster.jpg', 'JPEG', quality=86, optimize=True, progressive=True)
        enc.stdin.write(frame.tobytes())
    enc.stdin.close()
    enc.wait()
    # 보내주신 사진(4:3, 가운데)
    lbl, cx = ad['before']
    src = Image.open(next((RAW / lbl).glob('*.png'))).convert('RGB')
    w = round(src.height * 4 / 3)
    x = int((src.width - w) * cx)
    src.crop((x, 0, x + w, src.height)).resize((1200, 900), Image.LANCZOS).save(OUT / f'{key}-before.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
    size = (OUT / f'{key}.mp4').stat().st_size / 1e6
    print(f'{key}: {total / FPS:.1f}s, {size:.2f} MB')


if __name__ == '__main__':
    for k in (sys.argv[1:] or list(ADS)):
        render(k)
