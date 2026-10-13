"""영어 페이지(/en)용 폰트 → site/public/fonts/ps-text-en*.woff2 · ps-letter-en.woff2 + src/styles/fonts-en.css

한국어 폰트(scripts/fonts.py)는 건드리지 않는다. 영어 페이지에서만 :lang(en) 규칙으로 본문 글꼴을 바꾼다(main.css 맨 아래).
- 본문 'PS Text EN' = Archivo 보통 폭(100) 굵기 400 · 700. 제목(PS Display Latin)과 같은 Archivo 계열이라 어울리고, 나눔스퀘어 네오의 영문보다 긴 영어 글에 자연스럽다.
- 마무리 선언 'PS Letter EN' = Instrument Serif Italic(손편지 느낌). 선언 두 줄의 글자만 남긴 작은 파일.
라이선스: 둘 다 SIL OFL 1.1(글자를 줄이고 이름을 바꾼 수정본).
실행: python3 scripts/fonts_en.py   (먼저 npm run render 로 en/index.html 을 만든 뒤 — 선언 글자를 모으기 위해)
"""
import html
import io
import json
import re
import sys
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

sys.path.insert(0, str(Path(__file__).parent))
import fonts as F  # noqa: E402  (같은 폴더의 fonts.py: build · urange · LATIN · OUT · ROOT)

ROOT, OUT = F.ROOT, F.OUT
LOCAL = ROOT.parent / 'drafts/fonts'
ISERIF = 'https://raw.githubusercontent.com/google/fonts/main/ofl/instrumentserif/InstrumentSerif-Italic.ttf'


def archivo_path():
    for p in (LOCAL / 'Archivo-VF.ttf',):
        if p.exists():
            return p
    return F.fetch('archivo')


def iserif_path():
    p = LOCAL / 'InstrumentSerif-Italic.ttf'
    if p.exists():
        return p
    cache = F.CACHE / 'instrument-serif-italic.ttf'
    if not cache.exists():
        import urllib.request
        F.CACHE.mkdir(parents=True, exist_ok=True)
        with urllib.request.urlopen(ISERIF, timeout=120) as r:
            cache.write_bytes(r.read())
    return cache


def main():
    arch = archivo_path()
    css = ['/* 자동 생성: python3 scripts/fonts_en.py — 직접 고치지 마세요. 라이선스: public/fonts/LICENSE.txt */']
    latin = F.LATIN | {0x2026, 0xB7, 0x2192, 0x2190, 0x00D7}
    for weight, name, style in ((400, 'ps-text-en.woff2', 'Regular'), (700, 'ps-text-en-bold.woff2', 'Bold')):
        inst = instancer.instantiateVariableFont(TTFont(arch), {'wdth': 100, 'wght': weight})
        buf = io.BytesIO()
        inst.save(buf)
        cps = F.build(buf.getvalue(), latin, 'PS Text EN', style, name)
        css.append(f"@font-face{{font-family:'PS Text EN';src:url('/fonts/{name}') format('woff2');font-weight:{weight};font-style:normal;font-display:swap;unicode-range:{F.urange(cps)}}}")

    page = (ROOT / 'en/index.html').read_text(encoding='utf-8')
    m = re.search(r'data-mf-lines="([^"]*)"', page)
    text = ''.join(json.loads(html.unescape(m.group(1)))) if m else 'We treat your business like it is our own.'
    cps = {ord(c) for c in text} | {0x20, 0x2E, 0x2C, 0x27, 0x2019}
    print('마무리 선언(영어):', text)
    F.build(str(iserif_path()), cps, 'PS Letter EN', 'Italic', 'ps-letter-en.woff2')
    css.append("@font-face{font-family:'PS Letter EN';src:url('/fonts/ps-letter-en.woff2') format('woff2');font-weight:400;font-style:italic;font-display:swap}")

    (ROOT / 'src/styles/fonts-en.css').write_text('\n'.join(css) + '\n', encoding='utf-8')
    lic = OUT / 'LICENSE.txt'
    add = ("\n5) PS Text EN(영어 본문)\n   원본: Archivo — Copyright 2020 The Archivo Project Authors. SIL Open Font License 1.1\n   폭 100 · 굵기 400/700으로 고정하고 글자를 줄인 수정본입니다.\n"
           "\n6) PS Letter EN(영어 마무리 선언)\n   원본: Instrument Serif Italic — Copyright 2022 The Instrument Serif Project Authors (https://github.com/Instrument/instrument-serif). SIL Open Font License 1.1\n   선언 글자만 남기고 이름을 바꾼 수정본입니다.\n")
    cur = lic.read_text(encoding='utf-8') if lic.exists() else ''
    if '5) PS Text EN' not in cur:
        lic.write_text(cur + add, encoding='utf-8')
    print('완료')


if __name__ == '__main__':
    main()
