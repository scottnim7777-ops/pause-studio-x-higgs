"""글자를 알파 마스크로(편집에서 실제 서체로 쓰는 글 — AI가 만든 글자는 쓰지 않음)"""
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
CACHE = Path(__file__).resolve().parent / '.cache'


def font_file(name):
    src = ROOT / 'drafts/fonts' / name
    if src.suffix == '.woff2':
        CACHE.mkdir(parents=True, exist_ok=True)
        dst = CACHE / (src.stem + '.ttf')
        if not dst.exists():
            from fontTools.ttLib import TTFont
            f = TTFont(str(src)); f.flavor = None; f.save(str(dst))
        return str(dst)
    return str(src)


def font(name, size, axes=None):
    f = ImageFont.truetype(font_file(name), size, layout_engine=ImageFont.Layout.RAQM)
    if axes:
        f.set_variation_by_axes(axes)
    return f


def text_mask(text, fnt, track=0.0, ss=3, space=None, pad=None):
    """한 줄 글 → (알파 float32, 기준선 y). track: em 단위 자간. space: 띄어쓰기 폭(em, 글꼴에 띄어쓰기 글자가 없을 때)"""
    size = fnt.size
    big = fnt.font_variant(size=size * ss) if hasattr(fnt, 'font_variant') else fnt
    if getattr(fnt, '_axes', None):
        big.set_variation_by_axes(fnt._axes)
    d0 = ImageDraw.Draw(Image.new('L', (8, 8)))
    sp = (space if space is not None else 0.0) * size * ss
    chars = list(text)
    widths = []
    for ch in chars:
        if ch == ' ' and space is not None:
            widths.append(sp)
        else:
            widths.append(d0.textlength(ch, font=big))
    trk = track * size * ss
    total = sum(widths) + trk * (len(chars) - 1)
    asc, desc = big.getmetrics()
    p = pad if pad is not None else int(size * ss * 0.3)
    W = int(total + 2 * p); H = int(asc + desc + 2 * p)
    im = Image.new('L', (W, H), 0)
    d = ImageDraw.Draw(im)
    x = p
    for ch, w in zip(chars, widths):
        if not (ch == ' ' and space is not None):
            d.text((x, p + asc), ch, font=big, fill=255, anchor='ls')
        x += w + trk
    small = im.resize((max(1, W // ss), max(1, H // ss)), Image.LANCZOS)
    return np.asarray(small, np.float32) / 255.0, (p + asc) / ss


def fnt_axes(name, size, axes):
    f = font(name, size, axes)
    f._axes = axes
    return f


def place(canvas_shape, mask, cx, baseline_y, base_off, align='center'):
    """마스크를 캔버스(H,W)에 놓기: cx = 가운데(align=center) 또는 왼쪽(align=left), baseline_y = 기준선 y"""
    Hc, Wc = canvas_shape
    out = np.zeros((Hc, Wc), np.float32)
    mh, mw = mask.shape
    x0 = int(round(cx - (mw / 2 if align == 'center' else 0)))
    y0 = int(round(baseline_y - base_off))
    xs0, ys0 = max(0, x0), max(0, y0)
    xs1, ys1 = min(Wc, x0 + mw), min(Hc, y0 + mh)
    if xs1 > xs0 and ys1 > ys0:
        out[ys0:ys1, xs0:xs1] = mask[ys0 - y0:ys1 - y0, xs0 - x0:xs1 - x0]
    return out
