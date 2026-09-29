"""PAUSE STUDIO 로고안 5종을 벡터(SVG)로 만든다.

- 글자는 HarfBuzz로 셰이핑(커닝 포함)한 뒤 글리프 윤곽선을 path로 변환한다(폰트 없이도 형태 고정).
- 01의 쉼표 심볼은 Higgsfield 원판(d1-plate)에서 추출·트레이싱한 형태를 그대로 쓴다.
- 결과: drafts/logos/L{n}-{name}-{ink|paper}.svg  (ink=밝은 배경용, paper=어두운 배경용)
실행: python3 tools/logo_build.py
"""
import re
from pathlib import Path

import uharfbuzz as hb

ROOT = Path(__file__).resolve().parents[1]
FONTS = ROOT / 'drafts' / 'fonts'
OUT = ROOT / 'drafts' / 'logos'
OUT.mkdir(parents=True, exist_ok=True)


class PathPen:
    """HarfBuzz draw 콜백을 SVG path 문자열로 기록(좌표: 폰트 단위 → px, y 반전)."""

    def __init__(self, scale, dx, baseline):
        self.s, self.dx, self.by, self.d = scale, dx, baseline, []

    def _p(self, x, y):
        return f'{self.dx + x * self.s:.2f} {self.by - y * self.s:.2f}'

    def moveTo(self, p):
        self.d.append('M' + self._p(*p))

    def lineTo(self, p):
        self.d.append('L' + self._p(*p))

    def qCurveTo(self, *pts):
        # TrueType 이차 곡선: 암시적 온커브 점을 풀어 Q 명령으로
        *offs, end = pts
        for i, c in enumerate(offs):
            nxt = end if i == len(offs) - 1 else ((c[0] + offs[i + 1][0]) / 2, (c[1] + offs[i + 1][1]) / 2)
            self.d.append('Q' + self._p(*c) + ' ' + self._p(*nxt))

    def curveTo(self, *pts):
        c1, c2, end = pts
        self.d.append('C' + self._p(*c1) + ' ' + self._p(*c2) + ' ' + self._p(*end))

    def closePath(self):
        self.d.append('Z')

    endPath = closePath


_font_cache = {}


def text_path(font_file, text, size, x=0.0, baseline=0.0, variations=None, tracking=0.0, features=None):
    """text를 path로. tracking은 em 단위 자간. 반환: (d, 전체 폭 px)."""
    key = (font_file, tuple(sorted((variations or {}).items())))
    if key not in _font_cache:
        blob = hb.Blob.from_file_path(str(FONTS / font_file))
        face = hb.Face(blob)
        font = hb.Font(face)
        if variations:
            font.set_variations(variations)
        _font_cache[key] = (font, face.upem)
    font, upem = _font_cache[key]
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(font, buf, features or {'kern': True, 'liga': True})
    s = size / upem
    pen_x, parts = x, []
    n = len(buf.glyph_infos)
    for i, (info, pos) in enumerate(zip(buf.glyph_infos, buf.glyph_positions)):
        pen = PathPen(s, pen_x + pos.x_offset * s, baseline - pos.y_offset * s)
        font.draw_glyph_with_pen(info.codepoint, pen)
        parts.append(''.join(pen.d))
        pen_x += pos.x_advance * s + (tracking * size if i < n - 1 else 0)
    return ''.join(parts), pen_x - x


def comma_symbol():
    """potrace 결과(comma-traced.svg)를 원점 기준 path로 정규화."""
    svg = (OUT / 'work' / 'comma-traced.svg').read_text()
    d = re.search(r'<path d="([^"]+)"', svg, re.S).group(1)
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    # potrace 좌표: translate(0,H) scale(0.1,-0.1)
    return d.replace('\n', ' '), vb[2], vb[3]


def svg_doc(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.1f} {h:.1f}" width="{w:.0f}" height="{h:.0f}" '
            f'role="img" aria-label="{title}"><title>{title}</title>{body}</svg>\n')


def write(name, w, h, body_fn, palettes):
    for tone, pal in palettes.items():
        (OUT / f'{name}-{tone}.svg').write_text(svg_doc(w, h, body_fn(pal), 'PAUSE STUDIO 퍼즈 스튜디오'))


# ---------- L1 쉼표 (편집) ----------
def build_l1():
    cd, cw, ch = comma_symbol()
    sym_h = 64.0
    k = sym_h / ch
    word, ww = text_path('InstrumentSerif-Regular.ttf', 'PAUSE STUDIO', 30, x=0, baseline=0, tracking=0.26)
    ko, kw = text_path('Hahmlet-VF.ttf', '퍼즈 스튜디오', 12.5, x=0, baseline=0, variations={'wght': 420}, tracking=0.32)
    gap = 18
    W = sym_h * cw / ch + gap + max(ww, kw) + 2
    H = sym_h + 4

    def body(p):
        return (f'<g fill="{p[0]}" transform="translate(0,{2:.1f}) scale({k:.5f})">'
                f'<g transform="translate(0,{ch}) scale(0.1,-0.1)"><path d="{cd}"/></g></g>'
                f'<g fill="{p[1]}"><path transform="translate({sym_h*cw/ch+gap:.1f},{34:.1f})" d="{word}"/>'
                f'<path transform="translate({sym_h*cw/ch+gap+1:.1f},{58:.1f})" d="{ko}"/></g>')
    write('L1-comma', W, H, body, {'ink': ('#224099', '#151513'), 'paper': ('#9DB0FF', '#F2EEE6')})


# ---------- L2 머무는 빛 (페르마타: 호 + 점) ----------
def build_l2():
    word, ww = text_path('Archivo-VF.ttf', 'PAUSE STUDIO', 15.5, variations={'wght': 540, 'wdth': 125}, tracking=0.16)
    ko, kw = text_path('PretendardVariable.ttf', '퍼즈 스튜디오', 8.6, variations={'wght': 500}, tracking=0.5)
    word_base = 12.0                       # 워드마크 기준선(대문자 높이 약 11px)
    ko_base = word_base + 5.5 + 6.9        # 5.5px 간격 뒤 한글(글자 높이 약 6.9px)
    r, sw = 12.0, 2.2                      # 호가 위, 점이 안쪽 아래 = 음악의 늘임표
    cx, cy = r + sw / 2 + 0.5, ko_base     # 호의 현(아랫선)을 한글 기준선에 맞춤
    dot_r, dot_y = 2.5, cy - 3.9
    x0 = 2 * r + sw + 12
    W, H = x0 + max(ww, kw) + 2, ko_base + 2.5

    def body(p):
        return (f'<path d="M{cx-r:.2f} {cy:.2f} A{r} {r} 0 0 1 {cx+r:.2f} {cy:.2f}" fill="none" stroke="{p[0]}" '
                f'stroke-width="{sw}" stroke-linecap="round"/><circle cx="{cx:.2f}" cy="{dot_y:.2f}" r="{dot_r}" fill="{p[0]}"/>'
                f'<g fill="{p[1]}"><path transform="translate({x0:.1f},{word_base:.1f})" d="{word}"/>'
                f'<path transform="translate({x0+0.6:.1f},{ko_base:.1f})" d="{ko}"/></g>')
    write('L2-fermata', W, H, body, {'paper': ('#E8A868', '#F1ECE3'), 'ink': ('#B8742F', '#0B0F14')})


# ---------- L3 색인 대시 (PAUSE—STUDIO + 핀 점) ----------
def build_l3():
    left, lw = text_path('IBMPlexSansKR-SemiBold.ttf', 'PAUSE', 24, tracking=0.04)
    right, rw = text_path('IBMPlexSansKR-SemiBold.ttf', 'STUDIO', 24, tracking=0.04)
    ko, kw = text_path('IBMPlexSansKR-Medium.ttf', '퍼즈 스튜디오', 10.5, tracking=0.36)
    dash_w, gap = 46, 7
    x_dash = lw + gap
    x_right = x_dash + dash_w + gap
    W, H = x_right + rw + 2, 44
    base = 24

    def body(p):
        return (f'<g fill="{p[0]}"><path transform="translate(0,{base})" d="{left}"/>'
                f'<rect x="{x_dash:.1f}" y="{base-9.4:.1f}" width="{dash_w}" height="2.4"/>'
                f'<path transform="translate({x_right:.1f},{base})" d="{right}"/>'
                f'<path transform="translate(1,{base+16})" d="{ko}"/></g>'
                f'<circle cx="{x_dash+dash_w/2:.1f}" cy="{base-8.2:.1f}" r="4.4" fill="{p[1]}"/>')
    write('L3-index', W, H, body, {'ink': ('#111111', '#D02A24'), 'paper': ('#F4F1EC', '#FF5A4E')})


# ---------- L4 청자 페르마타 (두꺼운 아치 + 떠 있는 구) ----------
def build_l4():
    word, ww = text_path('Fraunces-VF.ttf', 'Pause Studio', 29, variations={'opsz': 72, 'wght': 430, 'SOFT': 100, 'WONK': 0}, tracking=0.0)
    ko, kw = text_path('GowunBatang-Regular.ttf', '퍼즈 스튜디오', 11.5, tracking=0.3)
    R, t = 21.0, 9.0                   # 아치 바깥 반지름, 두께
    cx, base = R, 44.0                 # 아치가 서 있는 기준선
    top = base - 22                    # 반원 시작 높이(다리 22px)
    ri = R - t
    ball_r = 5.6
    x0 = 2 * R + 15
    W, H = x0 + max(ww, kw) + 2, base + 2

    def body(p):
        arch = (f'M{cx-R:.2f} {base:.2f} L{cx-R:.2f} {top:.2f} A{R} {R} 0 0 1 {cx+R:.2f} {top:.2f} L{cx+R:.2f} {base:.2f} '
                f'L{cx+ri:.2f} {base:.2f} L{cx+ri:.2f} {top:.2f} A{ri} {ri} 0 0 0 {cx-ri:.2f} {top:.2f} L{cx-ri:.2f} {base:.2f} Z')
        return (f'<path d="{arch}" fill="{p[0]}"/><circle cx="{cx:.2f}" cy="{top+4:.2f}" r="{ball_r}" fill="{p[0]}"/>'
                f'<g fill="{p[1]}"><path transform="translate({x0:.1f},{base-17:.1f})" d="{word}"/>'
                f'<path transform="translate({x0+1:.1f},{base:.1f})" d="{ko}"/></g>')
    write('L4-arch', W, H, body, {'ink': ('#3E6B5A', '#14211C'), 'paper': ('#CFE0D6', '#F1F5F2')})


# ---------- L5 렌즈 (가로선 7줄로 그린 PAUSE, 가운데 선 = 멈춘 재생 바) ----------
def build_l5():
    size = 46
    word, ww = text_path('SUIT-Variable.ttf', 'PAUSE', size, variations={'wght': 900}, tracking=0.02)
    studio, sw_ = text_path('SUIT-Variable.ttf', 'STUDIO', 9.6, variations={'wght': 700}, tracking=0.5)
    ko, kw = text_path('SUIT-Variable.ttf', '퍼즈 스튜디오', 9.6, variations={'wght': 600}, tracking=0.18)
    cap_top, base = 3.0, 3.0 + size * 0.735
    lines = 7
    pitch = (base - cap_top) / lines
    th = pitch * 0.58
    mid = 3                                   # 가운데 선(0부터) = 재생 바
    head_x = ww * 0.47                        # 재생 헤드가 멈춘 자리(U의 한가운데)
    W, H = ww + 2, base + 15

    def body(p):
        rows = []
        for i in range(lines):
            y = cap_top + i * pitch + (pitch - th) / 2
            if i == mid:   # 재생된 구간은 주홍, 남은 구간은 군청
                rows.append(f'<rect x="0" y="{y:.2f}" width="{head_x:.2f}" height="{th:.2f}" fill="{p[1]}"/>'
                            f'<rect x="{head_x:.2f}" y="{y:.2f}" width="{W-head_x:.2f}" height="{th:.2f}" fill="{p[0]}"/>')
            else:
                rows.append(f'<rect x="0" y="{y:.2f}" width="{W:.1f}" height="{th:.2f}" fill="{p[0]}"/>')
        hy = cap_top + mid * pitch + pitch / 2
        return (f'<defs><clipPath id="L5w"><path transform="translate(0,{base:.2f})" d="{word}"/></clipPath></defs>'
                f'<g clip-path="url(#L5w)">{"".join(rows)}</g>'
                f'<circle cx="{head_x:.2f}" cy="{hy:.2f}" r="{pitch*0.62:.2f}" fill="{p[1]}"/>'
                f'<g fill="{p[2]}"><path transform="translate(0.5,{base+12.5:.2f})" d="{studio}"/>'
                f'<path transform="translate({ww-kw-0.5:.2f},{base+12.5:.2f})" d="{ko}"/></g>')
    write('L5-lines', W, H, body, {'ink': ('#231CBC', '#F53B2E', '#111111'), 'paper': ('#F4F1EA', '#FF6A4D', '#F4F1EA')})


if __name__ == '__main__':
    for f in (build_l1, build_l2, build_l3, build_l4, build_l5):
        f()
    for p in sorted(OUT.glob('L*.svg')):
        print(p.name, p.stat().st_size, 'bytes')
