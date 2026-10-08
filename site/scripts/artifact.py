"""미리보기 링크(claude.ai 아티팩트)용 묶음 만들기: dist → .cache/artifact
실행: npm run build && python3 scripts/artifact.py

- 아티팩트는 게시할 때 <!doctype><head><body> 뼈대를 씌우므로 본문만 남기고, <title>·스타일·스크립트를 맨 위에 둔다.
- 모든 경로를 상대 경로로 바꾼다(아티팩트는 페이지와 함께 게시한 파일만 상대 경로로 읽는다).
- 검색엔진용 메타·파비콘·매니페스트는 미리보기에 필요 없어 뺀다.
- 서버가 없으므로 상담 신청(/api/contact)은 보내지지 않고 '전송 실패' 화면(메일 앱·복사·카카오톡)이 나온다.
- 결과: .cache/artifact/index.html(게시할 페이지) + 함께 게시할 파일들, .cache/artifact-files.json(게시용 파일 목록)
  _local.html 은 로컬 확인용(뼈대를 씌운 페이지)이며 게시하지 않는다.
- 게시된 미리보기 주소는 STATE.md 에 적어 둔다(같은 주소로 다시 게시해야 링크가 유지됨).
"""
import json, re, shutil
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
DIST = SITE / 'dist'
OUT = SITE / '.cache/artifact'
TYPES = {'.woff2': 'font/woff2', '.webp': 'image/webp', '.mp4': 'video/mp4', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg',
         '.png': 'image/png', '.css': 'text/css', '.js': 'text/javascript', '.txt': 'text/plain'}


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    for d in ('assets', 'fonts', 'media', 'brand'):
        shutil.copytree(DIST / d, OUT / d)

    html = (DIST / 'index.html').read_text()
    head = re.search(r'<head>(.*?)</head>', html, re.S).group(1)
    body = re.search(r'<body>(.*?)</body>', html, re.S).group(1)
    css = re.search(r'<link rel="stylesheet"[^>]*href="/(assets/[^"]+\.css)"', head).group(1)
    js = re.search(r'<script type="module"[^>]*src="/(assets/[^"]+\.js)"', head).group(1)
    preloads = re.findall(r'<link rel="preload"[^>]*>', head)
    inline = re.search(r'<script>\s*/\*.*?</script>', head, re.S).group(0)
    inline = inline.replace("document.documentElement.classList.add('js');",
                            "document.documentElement.classList.add('js');\n  document.documentElement.lang = 'ko';")

    def rel(s):  # "/media/…" → "media/…" (따옴표·공백·쉼표·괄호 뒤의 사이트 경로만)
        return re.sub(r'(?<=["\'\s,(])/(media|brand|fonts|assets)/', r'\1/', s)

    page = '\n'.join(['<title>PAUSE Studio</title>', inline, *[rel(p) for p in preloads],
                      f'<link rel="stylesheet" crossorigin href="{css}">',
                      f'<script type="module" crossorigin src="{js}"></script>', rel(body).strip()]) + '\n'
    (OUT / 'index.html').write_text(page)
    cssf = OUT / css
    cssf.write_text(cssf.read_text().replace('url(/fonts/', 'url(../fonts/'))

    left = sorted(set(re.findall(r'(?<=["\'\s,(])/(?!/)[a-z][\w./-]*', page + cssf.read_text() + (OUT / js).read_text())))
    print('남은 절대 경로(/api/contact 만 있어야 함):', left)

    files = {p.relative_to(OUT).as_posix(): {'from': p.relative_to(OUT).as_posix(), 'contentType': TYPES[p.suffix]}
             for p in sorted(OUT.rglob('*')) if p.is_file() and p.name not in ('index.html', '_local.html')}
    (SITE / '.cache/artifact-files.json').write_text(json.dumps(files, ensure_ascii=False, indent=1))
    size = sum(p.stat().st_size for p in OUT.rglob('*') if p.is_file())
    print(f'함께 게시할 파일 {len(files)}개, 합계 {size / 1e6:.1f} MB → .cache/artifact-files.json')

    (OUT / '_local.html').write_text(  # 로컬 확인용(게시하지 않음): python3 -m http.server -d .cache/artifact → /_local.html
        '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'
        '<style>:root{color-scheme:light}body{margin:0;font:14px system-ui;background:#fafaf9}img{max-width:100%}[hidden]{display:none!important}</style>'
        '</head><body>\n' + page + '</body></html>')


if __name__ == '__main__':
    main()
