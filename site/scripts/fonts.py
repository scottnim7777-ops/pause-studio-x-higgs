"""무료 폰트(직접 호스팅) 만들기 → site/public/fonts/*.woff2 + src/styles/fonts.css

실행: python3 site/scripts/fonts.py   (먼저 npm run render 로 index.html 을 만든 뒤 — 사이트에 쓰인 글자를 모으기 위해)
필요: fontTools, brotli (pip install fonttools brotli)

선택(2026-10-08, 사용자: 산돌 유료 웹폰트 대신 '최대한 비슷한 무드의 무료 폰트'):
- 제목 'PS Display' : 한글 = 나눔스퀘어 네오 Bold(네이버, 디자인 산돌 — 네모틀을 채운 격동고딕2와 가장 비슷)
                     영문·숫자 = Archivo(OFL) 폭 70 · 굵기 500으로 고정한 좁은 그로테스크(격동고딕2의 좁은 영문과 비슷)
- 본문 'PS Text'   : 나눔스퀘어 네오 Regular(본문 밀도·줄바꿈이 SD 그레타산스와 거의 같음), 강조 700 = 나눔스퀘어 네오 Bold
라이선스: 둘 다 SIL OFL 1.1. 글자를 줄인(subset) 파일은 '수정본'이므로 OFL의 예약 이름 규정에 따라 폰트 안의 이름을 바꾼다(PS …).

나누는 방식(구글 폰트와 같은 원리, unicode-range):
- site  : 사이트에 실제로 쓰인 글자 → 첫 화면에서 이것만 받음(작음)
- ext   : 나머지 자주 쓰는 한글 2,350자 + 자모 + 기호 → 상담 창에 입력할 때 등 필요할 때만 받음
"""
from pathlib import Path
import io, re, subprocess, sys, urllib.request, html
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib import instancer

ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / '.cache/fonts'
OUT = ROOT / 'public/fonts'
CSS = ROOT / 'src/styles/fonts.css'
NAVER = 'https://hangeul.pstatic.net/hangeul_static/webfont/NanumSquareNeo/NanumSquareNeoTTF-{}.ttf'
ARCHIVO = 'https://raw.githubusercontent.com/google/fonts/main/ofl/archivo/Archivo%5Bwdth,wght%5D.ttf'
SOURCES = {'nsn-r': NAVER.format('bRg'), 'nsn-b': NAVER.format('cBd'), 'archivo': ARCHIVO}

LATIN = set(range(0x20, 0x7F)) | set(range(0xA0, 0x100)) | set(range(0x2010, 0x2028)) | set(range(0x2030, 0x205F)) | {0x20AC, 0x2122, 0x2190, 0x2192, 0x2212}


def fetch(key):
    CACHE.mkdir(parents=True, exist_ok=True)
    p = CACHE / f'{key}.ttf'
    if not p.exists():
        print('  받기', SOURCES[key])
        with urllib.request.urlopen(SOURCES[key], timeout=120) as r:
            p.write_bytes(r.read())
    return p


def ks_x_1001_hangul():
    """자주 쓰는 한글 2,350자(KS X 1001 완성형)"""
    out = set()
    for hi in range(0xB0, 0xC9):
        for lo in range(0xA1, 0xFF):
            try:
                out.add(ord(bytes([hi, lo]).decode('euc-kr')))
            except UnicodeDecodeError:
                pass
    return out


def site_chars():
    page = ROOT / 'index.html'
    if not page.exists():
        sys.exit('index.html 이 없습니다 — 먼저 npm run render')
    text = page.read_text()
    text = re.sub(r'<(script|style)[^>]*>.*?</\1>', ' ', text, flags=re.S)
    text = html.unescape(re.sub(r'<[^>]+>', ' ', text))
    # 화면 문구 파일도 함께(속성·스크립트 안 문구 — 상담 창 안내 등)
    text += (ROOT / 'src/content/ko.ts').read_text()
    return {ord(c) for c in text if ord(c) >= 0x20}


def rename(font, family, style):
    """OFL 예약 이름 규정: 수정본(글자 줄임)은 원래 이름을 쓰지 않는다"""
    name = font['name']
    full = f'{family} {style}'
    ps = f'{family.replace(" ", "")}-{style}'
    for rec in list(name.names):
        if rec.nameID in (1, 4, 6, 16, 17, 21, 22):
            name.removeNames(nameID=rec.nameID)
    for nid, val in ((1, family), (2, style), (4, full), (6, ps), (16, family), (17, style)):
        name.setName(val, nid, 3, 1, 0x409)
        name.setName(val, nid, 1, 0, 0)
    name.setName(f'Modified (subset/renamed) by PAUSE STUDIO from the original under SIL OFL 1.1', 5, 3, 1, 0x409)


def build(src_font, codepoints, family, style, out_name):
    f = TTFont(io.BytesIO(src_font)) if isinstance(src_font, bytes) else TTFont(src_font)
    cmap = f.getBestCmap()
    keep = sorted(c for c in codepoints if c in cmap)
    opts = subset.Options()
    opts.flavor = 'woff2'
    opts.layout_features = ['kern', 'liga', 'calt', 'ccmp', 'locl', 'mark', 'mkmk', 'tnum', 'lnum', 'pnum']
    opts.name_IDs = ['*']
    opts.notdef_outline = True
    opts.hinting = False
    opts.desubroutinize = True
    s = subset.Subsetter(opts)
    s.populate(unicodes=keep)
    s.subset(f)
    rename(f, family, style)
    OUT.mkdir(parents=True, exist_ok=True)
    f.flavor = 'woff2'
    f.save(OUT / out_name)
    size = (OUT / out_name).stat().st_size
    print(f'  {out_name}: {len(keep)}자, {size / 1024:.0f} KB')
    return keep


def urange(cps):
    """연속 구간을 묶어 unicode-range 문자열로"""
    cps = sorted(cps)
    parts, start, prev = [], None, None
    for c in cps:
        if start is None:
            start = prev = c
        elif c == prev + 1:
            prev = c
        else:
            parts.append((start, prev)); start = prev = c
    if start is not None:
        parts.append((start, prev))
    return ', '.join(f'U+{a:X}' if a == b else f'U+{a:X}-{b:X}' for a, b in parts)


def main():
    print('폰트 원본')
    nsn_r, nsn_b, arch = fetch('nsn-r'), fetch('nsn-b'), fetch('archivo')
    used = site_chars()
    hangul_common = ks_x_1001_hangul() | set(range(0x3131, 0x3164)) | set(range(0x1100, 0x1113))
    symbols = set(range(0x2000, 0x2070)) | set(range(0x3000, 0x3040)) | set(range(0xFF01, 0xFF5F)) | set(range(0x2190, 0x2200)) | {0xB7, 0x2022, 0x203B}
    used_nonlatin = {c for c in used if c not in LATIN}

    print('영문·숫자(제목): Archivo 폭 70 · 굵기 500')
    av = TTFont(arch)
    st = instancer.instantiateVariableFont(av, {'wdth': 70, 'wght': 500})
    buf = io.BytesIO(); st.save(buf)
    lat = build(buf.getvalue(), LATIN, 'PS Display Latin', 'Regular', 'ps-display-latin.woff2')

    css = ['/* 자동 생성: python3 scripts/fonts.py — 직접 고치지 마세요. 라이선스: public/fonts/LICENSE.txt */']

    def face(family, weight, file, cps):
        css.append(f"@font-face{{font-family:'{family}';src:url('/fonts/{file}') format('woff2');font-weight:{weight};font-style:normal;font-display:swap;unicode-range:{urange(cps)}}}")

    face('PS Display', 400, 'ps-display-latin.woff2', lat)

    # 관리비 $0 숫자: 세어 내려가며 점점 홀쭉해지는 움직임(폭·굵기를 부드럽게 바꿈) — 숫자와 $ , 만 남긴 가변 글꼴
    print('관리비 숫자(가변 폭 62~125 · 굵기 400~800): Archivo $0~9, → PS Ledger')
    lv = instancer.instantiateVariableFont(TTFont(arch), {'wdth': (62, 125), 'wght': (400, 800)})
    buf = io.BytesIO(); lv.save(buf)
    build(buf.getvalue(), {ord(c) for c in '$0123456789,'}, 'PS Ledger', 'Regular', 'ps-ledger.woff2')
    css.append("@font-face{font-family:'PS Ledger';src:url('/fonts/ps-ledger.woff2') format('woff2');font-weight:400 800;font-stretch:62% 125%;font-style:normal;font-display:swap}")
    for key, src, family, weight in (('display', nsn_b, 'PS Display', 400), ('text', nsn_r, 'PS Text', 400), ('text-bold', nsn_b, 'PS Text', 700)):
        print(f'한글 {family} {weight}')
        cmap = TTFont(src).getBestCmap()
        site_set = (used_nonlatin if family == 'PS Display' else used) & set(cmap)
        ext_set = ((hangul_common | symbols | (set() if family == 'PS Display' else LATIN)) - site_set) & set(cmap)
        if family == 'PS Display':
            site_set -= LATIN; ext_set -= LATIN  # 제목의 영문·숫자는 Archivo
        a = build(str(src), site_set, family, 'Bold' if weight == 700 or family == 'PS Display' else 'Regular', f'ps-{key}-site.woff2')
        b = build(str(src), ext_set, family, 'Bold' if weight == 700 or family == 'PS Display' else 'Regular', f'ps-{key}-ext.woff2')
        face(family, weight, f'ps-{key}-site.woff2', a)
        face(family, weight, f'ps-{key}-ext.woff2', b)

    CSS.write_text('\n'.join(css) + '\n')
    (OUT / 'LICENSE.txt').write_text(LICENSE)
    print('완료:', CSS.relative_to(ROOT))


LICENSE = """PAUSE STUDIO 웹사이트에 쓰인 폰트

1) PS Display(한글) · PS Text
   원본: 나눔스퀘어 네오(NanumSquare Neo) Regular·Bold — Copyright (c) 2022 NAVER Corp. (디자인: Sandoll)
   라이선스: SIL Open Font License 1.1 (네이버 나눔글꼴 라이선스)
   이 파일들은 웹 전송을 위해 글자를 줄이고(subset) 이름을 바꾼 수정본입니다(OFL 예약 이름 규정).

2) PS Display Latin(영문·숫자)
   원본: Archivo — Copyright 2020 The Archivo Project Authors (https://github.com/Omnibus-Type/Archivo)
   라이선스: SIL Open Font License 1.1
   폭 70 · 굵기 500으로 고정하고 글자를 줄인 수정본입니다.

3) PS Ledger(관리비 숫자)
   원본: Archivo(위와 같음) — SIL Open Font License 1.1
   숫자·$·쉼표만 남기고 폭 62~125 · 굵기 400~800 축을 남긴 가변 글꼴 수정본입니다.

SIL Open Font License 1.1 전문: https://openfontlicense.org/open-font-license-official-text/
"""

if __name__ == '__main__':
    main()
