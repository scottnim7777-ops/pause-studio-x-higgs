"""4차 첫 화면 스틸(폰트 3안): 1번 콘티(스튜디오 책상, 실제 K-VIBE 화면) 위에 큰 로고·헤드라인 → drafts/v4/hero-{A,B,C}.html
캡처: node tools/capture_v4.cjs (각 폰트 회사 공식 테스터 안에서 렌더링)"""
import html, json, re
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'drafts' / 'v4'
C = json.loads((ROOT / 'content' / 'site-content.ko.json').read_text())
hero, header, contact = C['hero'], C['header'], C['contact']
e = html.escape
H1A, H1B = '한인 대표님들을 위한', '웹사이트 제작'
assert H1A + ' ' + H1B == hero['headline']
SUB_A, SUB_B = hero['sub'].split(', ', 1)
KP = {k['label']: (k['value'] + k['suffix'], k.get('note', '')) for k in hero['kpis']}
logo = re.sub(r'<title>.*?</title>', '', (ROOT / 'content/assets/logo/new/vector/pause-studio-logo-cream.svg').read_text()).replace('<svg ', '<svg class="logo" width="300" style="display:block;height:auto" ', 1)
nav = ''.join(f'<a>{e(n["label"])}</a>' for n in header['nav'])
CSS = '''*{margin:0;padding:0;box-sizing:border-box}
.hero{position:relative;width:1920px;height:1080px;overflow:hidden;background:#070707;color:#FCEED8;font-family:var(--body);word-break:keep-all;-webkit-font-smoothing:antialiased;font-synthesis:none}
.hero a{color:inherit;text-decoration:none}
.bg{position:absolute;left:190px;top:0;width:1920px;height:1080px;object-fit:cover}
.shade{position:absolute;inset:0;background:linear-gradient(90deg,rgba(6,6,6,.82) 0%,rgba(6,6,6,.6) 34%,rgba(6,6,6,0) 58%),linear-gradient(0deg,rgba(6,6,6,.8) 0%,rgba(6,6,6,0) 30%),linear-gradient(180deg,rgba(6,6,6,.6) 0%,rgba(6,6,6,0) 22%)}
header{position:absolute;left:88px;right:88px;top:46px;display:flex;align-items:center;justify-content:space-between}
nav{display:flex;gap:40px;align-items:center;font:400 17px/1 var(--ui)}
.cta{border:1px solid rgba(252,238,216,.6);padding:14px 24px;border-radius:999px}
.eb{position:absolute;left:92px;top:356px;font:400 17px/1 var(--ui);letter-spacing:.16em;color:rgba(252,238,216,.75);display:flex;align-items:center;gap:14px}
.eb i{width:9px;height:9px;border-radius:50%;background:#D94A36}
h1{position:absolute;left:88px;top:400px;font:var(--hw,400) 104px/1.14 var(--head);letter-spacing:var(--ls,-.03em)}
.sub{position:absolute;left:92px;top:680px;font:400 23px/1.7 var(--body);color:rgba(252,238,216,.84)}
.ctas{position:absolute;left:92px;top:800px;display:flex;gap:16px;font:400 18px/1 var(--ui)}
.b1{background:#FCEED8;color:#0A0A0A!important;padding:22px 32px;border-radius:999px}
.b2{border:1px solid rgba(252,238,216,.55);padding:21px 30px;border-radius:999px}
.credit{position:absolute;left:92px;right:88px;bottom:52px;display:flex;align-items:baseline;gap:34px;font:400 16px/1 var(--ui);color:rgba(252,238,216,.7);border-top:1px solid rgba(252,238,216,.22);padding-top:20px}
.credit b{font:var(--hw,400) 30px/1 var(--head);color:#FCEED8;margin-right:8px;font-weight:var(--hw,400)}
.credit .zero b{font-size:44px}
.credit .pill{margin-left:auto;color:rgba(252,238,216,.6)}
.label{position:absolute;right:88px;bottom:18px;font:400 12px/1 var(--ui);color:rgba(252,238,216,.45)}
'''
body = f'''<div class="hero"><img class="bg" src="shots/shot1-studio_kvibe.jpg" alt=""><div class="shade"></div>
<header>{logo}<nav>{nav}<a>{e(header['language_selector'][0])}</a><a class="cta">{e(header['cta']['label'])}</a></nav></header>
<p class="eb"><i></i>웹사이트 · 홍보영상 제작</p>
<h1>{e(H1A)}<br>{e(H1B)}</h1>
<p class="sub">{e(SUB_A)},<br>{e(SUB_B)}</p>
<div class="ctas"><a class="b1">{e(contact['cta_primary']['label'])}</a><a class="b2">{e(contact['cta_secondary']['label'])}</a></div>
<div class="credit"><span><b>{e(KP['누적 작업'][0])}</b>누적 작업</span><span class="zero"><b>{e(KP['월·연 관리비'][0])}</b>월·연 관리비 {e(KP['월·연 관리비'][1])}</span><span><b>{e(KP['평균 오픈 기간'][0])}</b>평균 오픈 기간</span><span class="pill">{e(hero['pill'])}</span></div>
<p class="label">콘티 스틸: 공간은 Higgsfield 생성 · 화면 속은 실제 제작 사이트 합성 · 문구·로고는 HTML 조판</p>
</div>'''
OUT.mkdir(parents=True, exist_ok=True)
for k in 'ABC':
    (OUT / f'hero-{k}.html').write_text(f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><style id="hero-css">{CSS}</style></head><body><!--HERO-->{body}<!--/HERO--></body></html>')
print('ok')
