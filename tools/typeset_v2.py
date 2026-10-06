"""2차 히어로 시안 5개 HTML 조판 → drafts/v2/hero-0N.html
- 원문은 content/site-content.ko.json에서만 읽는다(문구 변경 없음, 줄바꿈 위치만 지정).
- 로고: 사용자 제작 로고의 벡터(content/assets/logo/new/vector).
- 서체는 CSS 변수(--head/--body/--ui)로 두고, tools/capture_v2.cjs 가 각 폰트 회사 공식 테스터 페이지 안에서
  해당 서체를 연결해 1920×1080으로 캡처한다(폰트 파일은 내려받지 않음). HTML을 직접 열면 마루 부리로 대체 표시.
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'drafts' / 'v2'
C = json.loads((ROOT / 'content' / 'site-content.ko.json').read_text())
hero, header, contact = C['hero'], C['header'], C['contact']
e = html.escape
NAV = [n['label'] for n in header['nav']]
KPIS = [(k['value'] + k['suffix'], k['label'], k.get('note', '')) for k in hero['kpis']]
H1A, H1B = '한인 대표님들을 위한', '웹사이트 제작'
assert H1A + ' ' + H1B == hero['headline']
SUB_A, SUB_B = hero['sub'].split(', ', 1)
SUB_A += ','
PILL = hero['pill']
CTA1, CTA2 = contact['cta_primary']['label'], contact['cta_secondary']['label']
HEAD_CTA, LANG = header['cta']['label'], header['language_selector'][0]
LABEL = '아트워크: Higgsfield 생성 · 문구·로고·버튼: HTML 조판 시안'
LABEL_D3 = '작업물: 실제 포트폴리오 원본 · 문구·로고·버튼: HTML 조판 시안'
LABEL_D5 = '그래픽: 로고의 두 원을 코드(SVG)로 확장 · 문구·로고·버튼: HTML 조판 시안'
INK, CREAM = '#1A1B1C', '#FCEED8'

ARROW = '<svg class="ar" width="18" height="12" viewBox="0 0 18 12" aria-hidden="true"><path d="M0 6h16M11 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'
CHEV = '<svg width="10" height="6" viewBox="0 0 10 6" aria-hidden="true"><path d="M1 1l4 4 4-4" fill="none" stroke="currentColor" stroke-width="1.3"/></svg>'
CHAT = '<svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M9 2.5c-3.9 0-7 2.4-7 5.4 0 1.9 1.3 3.6 3.2 4.6l-.7 2.6 3-1.9c.5.1 1 .1 1.5.1 3.9 0 7-2.4 7-5.4S12.9 2.5 9 2.5z" fill="currentColor"/></svg>'


def logo(tone, width):
    s = (ROOT / 'content/assets/logo/new/vector' / f'pause-studio-logo-{tone}.svg').read_text()
    s = re.sub(r'<title>.*?</title>', '', s).strip()
    return s.replace('<svg ', f'<svg class="logo" width="{width}" style="display:block;height:auto" ', 1)


def nav(extra=''):
    return ''.join(f'<a>{e(n)}</a>' for n in NAV) + f'<a class="lang">{e(LANG)} {CHEV}</a>' + extra


def kpis(cls='k'):
    return ''.join(f'<div class="{cls}"><b>{e(v)}</b><span>{e(l)}{" " + e(n) if n else ""}</span></div>' for v, l, n in KPIS)


BASE = '''*{margin:0;padding:0;box-sizing:border-box}
.hero{position:relative;width:1920px;height:1080px;overflow:hidden;font-family:var(--body);word-break:keep-all;-webkit-font-smoothing:antialiased;font-synthesis:none}
.abs{position:absolute} a{color:inherit;text-decoration:none;cursor:pointer} b{font-weight:400}
.label{position:absolute;font:400 13px/1 var(--label);letter-spacing:.01em;opacity:.55}
.ar{display:inline-block;vertical-align:middle}
'''

DRAFTS = {}

# ── 01 두 개의 원 — 편집 디자인(밝음) ───────────────────────────────
DRAFTS['01'] = dict(
    name='두 개의 원', fonts='sd-jeongche', css=BASE + f'''
.d1{{background:#F4EFE6;color:{INK}}}
.d1 header{{position:absolute;left:96px;right:96px;top:46px;display:flex;align-items:center;justify-content:space-between}}
.d1 nav{{display:flex;align-items:center;gap:40px;font:400 16px/1 var(--ui)}}
.d1 nav .lang{{display:flex;gap:7px;align-items:center;color:#6b675f}}
.d1 nav .cta{{border:1px solid {INK};padding:13px 22px;margin-left:4px}}
.d1 h1{{position:absolute;left:96px;top:292px;font:400 96px/1.14 var(--head);letter-spacing:-.04em}}
.d1 .sub{{position:absolute;left:100px;top:548px;font:400 23px/1.7 var(--body);color:#3d3a35;letter-spacing:-.01em}}
.d1 .ctas{{position:absolute;left:100px;top:672px;display:flex;align-items:center;gap:34px;font:400 17px/1 var(--ui)}}
.d1 .b1{{background:{INK};color:#F4EFE6;padding:21px 30px}}
.d1 .b2{{display:flex;gap:12px;align-items:center;border-bottom:1px solid {INK};padding-bottom:7px}}
.d1 .pill{{position:absolute;left:100px;top:758px;font:400 15px/1 var(--ui);color:#7a756b}}
.d1 .kp{{position:absolute;left:100px;bottom:86px;display:flex;gap:56px}}
.d1 .k{{border-top:1px solid {INK};padding-top:16px;width:200px}} .d1 .k b{{display:block;font:400 40px/1 var(--head);letter-spacing:-.03em}}
.d1 .k span{{display:block;margin-top:12px;font:400 15px/1.3 var(--ui);color:#5c584f}}
.d1 .circ{{position:absolute;width:560px;height:560px;border-radius:50%;overflow:hidden;top:262px}}
.d1 .circ img{{width:100%;height:100%;object-fit:cover;display:block}}
.d1 .c1{{left:1030px}} .d1 .c2{{left:1318px;mix-blend-mode:multiply}}
.d1 .rings{{position:absolute;left:1000px;top:232px;overflow:visible}}
.d1 .label{{right:96px;bottom:40px}}
''', body=f'''<div class="hero d1">
<header>{logo('ink', 170)}<nav>{nav()}<a class="cta">{e(HEAD_CTA)}</a></nav></header>
<div class="circ c1"><img src="media/d1-korea.jpg" alt=""></div><div class="circ c2"><img src="media/d1-city.jpg" alt=""></div>
<svg class="rings" width="908" height="620" viewBox="0 0 908 620" aria-hidden="true"><g fill="none" stroke="{INK}" stroke-width="1.3"><ellipse cx="310" cy="310" rx="302" ry="309"/><ellipse cx="598" cy="310" rx="302" ry="309"/></g></svg>
<h1>{e(H1A)}<br>{e(H1B)}</h1>
<p class="sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="ctas"><a class="b1">{e(CTA1)}</a><a class="b2">{e(CTA2)} {ARROW}</a></div>
<p class="pill">{e(PILL)}</p>
<div class="kp">{kpis()}</div>
<p class="label">{e(LABEL)}</p></div>''')

# ── 02 밤의 항구 — 시네마틱(어두움) ─────────────────────────────────
DRAFTS['02'] = dict(
    name='밤의 항구', fonts='sd-greta-sans', css=BASE + f'''
.d2{{background:#020309;color:{CREAM}}}
.d2 .water{{position:absolute;left:0;right:0;top:760px;height:320px;background:linear-gradient(180deg,rgba(2,3,9,0),#020309 60%)}}
.d2 .bg{{position:absolute;left:0;top:-190px;width:1920px;height:1080px;object-fit:cover}}
.d2 .shade{{position:absolute;inset:0;background:linear-gradient(90deg,rgba(3,4,10,.78) 0%,rgba(3,4,10,.45) 38%,rgba(3,4,10,0) 62%),linear-gradient(0deg,rgba(3,4,10,.85) 0%,rgba(3,4,10,0) 45%),linear-gradient(180deg,rgba(3,4,10,.55) 0%,rgba(3,4,10,0) 18%)}}
.d2 header{{position:absolute;left:80px;right:80px;top:40px;height:80px;display:flex;align-items:center;justify-content:space-between;font:400 16px/1 var(--ui)}}
.d2 header nav{{display:flex;gap:38px;align-items:center}} .d2 .lang{{display:flex;gap:7px;align-items:center;opacity:.8}}
.d2 header .mid{{position:absolute;left:50%;top:0;transform:translateX(-50%)}}
.d2 .cta{{border:1px solid rgba(252,238,216,.6);padding:13px 24px;border-radius:999px}}
.d2 h1{{position:absolute;left:80px;top:476px;font:400 100px/1.1 var(--head);letter-spacing:-.035em}}
.d2 .sub{{position:absolute;left:84px;top:722px;font:400 22px/1.65 var(--body);color:rgba(252,238,216,.82)}}
.d2 .ctas{{position:absolute;left:84px;top:862px;display:flex;gap:16px;font:400 17px/1 var(--ui)}}
.d2 .b1{{background:{CREAM};color:#0B0D14;padding:21px 32px;border-radius:999px}}
.d2 .b2{{border:1px solid rgba(252,238,216,.55);padding:20px 30px;border-radius:999px;display:flex;gap:10px;align-items:center}}
.d2 .pill{{position:absolute;left:86px;top:958px;font:400 15px/1 var(--ui);color:rgba(252,238,216,.6)}}
.d2 .kp{{position:absolute;right:80px;bottom:96px;display:flex}}
.d2 .k{{border-left:1px solid rgba(252,238,216,.35);padding:2px 30px 0 22px;width:206px}}
.d2 .k b{{display:block;font:400 38px/1 var(--head);letter-spacing:-.03em}} .d2 .k span{{display:block;margin-top:12px;font:400 14px/1.35 var(--ui);color:rgba(252,238,216,.7)}}
.d2 .label{{right:80px;bottom:40px;color:{CREAM}}}
''', body=f'''<div class="hero d2"><img class="bg" src="media/d2-dusk.jpg" alt=""><div class="water"></div><div class="shade"></div>
<header><nav>{''.join(f'<a>{e(n)}</a>' for n in NAV)}</nav><div class="mid">{logo('cream', 168)}</div><nav><a class="lang">{e(LANG)} {CHEV}</a><a class="cta">{e(HEAD_CTA)}</a></nav></header>
<h1>{e(H1A)}<br>{e(H1B)}</h1>
<p class="sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="ctas"><a class="b1">{e(CTA1)}</a><a class="b2">{CHAT}{e(CTA2)}</a></div>
<p class="pill">{e(PILL)}</p>
<div class="kp">{kpis()}</div>
<p class="label">{e(LABEL)}</p></div>''')

# ── 03 작업 색인 — 실제 포트폴리오(중간 밝기) ───────────────────────
PF = {i['id']: i for i in C['portfolio']['items']}
ROWS = [3, 4, 11, 8, 5, 13]
rows = ''.join(f'''<li class="{'on' if i == 0 else ''}"><span class="no">{e(PF[r]['title'])}</span><span class="ct">{e(PF[r]['category'])}</span>
<img src="media/d3-ref{r:02d}.jpg" alt=""></li>''' for i, r in enumerate(ROWS))
DRAFTS['03'] = dict(
    name='작업 색인', fonts='ag-minburi', css=BASE + f'''
.d3{{background:#E6E2DA;color:{INK}}}
.d3 header{{position:absolute;left:88px;right:88px;top:44px;display:flex;align-items:center;justify-content:space-between}}
.d3 nav{{display:flex;gap:38px;align-items:center;font:400 16px/1 var(--ui)}} .d3 .lang{{display:flex;gap:7px;align-items:center;color:#6c6860}}
.d3 .cta{{background:{INK};color:#E6E2DA;padding:14px 24px}}
.d3 h1{{position:absolute;left:88px;top:250px;font:400 84px/1.18 var(--head);letter-spacing:-.035em}}
.d3 .sub{{position:absolute;left:90px;top:478px;font:400 21px/1.7 var(--body);color:#46433d}}
.d3 .ctas{{position:absolute;left:90px;top:590px;display:flex;gap:14px;font:400 16px/1 var(--ui)}}
.d3 .b1{{background:{INK};color:#E6E2DA;padding:20px 28px}} .d3 .b2{{border:1px solid {INK};padding:19px 26px;display:flex;gap:10px;align-items:center}}
.d3 .pill{{position:absolute;left:90px;top:672px;font:400 15px/1 var(--ui);color:#77736a}}
.d3 .kp{{position:absolute;left:90px;bottom:84px;display:flex;gap:44px}}
.d3 .k{{width:180px}} .d3 .k b{{display:block;font:400 44px/1 var(--head);letter-spacing:-.03em}} .d3 .k span{{display:block;margin-top:10px;font:400 14px/1.35 var(--ui);color:#5d5952}}
.d3 .pv{{position:absolute;left:900px;top:140px;width:932px;height:524px;overflow:hidden;box-shadow:0 30px 60px -34px rgba(0,0,0,.45)}}
.d3 .pv img{{width:100%;height:100%;object-fit:cover;object-position:top;display:block}}
.d3 .pvcap{{position:absolute;left:900px;top:678px;font:400 14px/1 var(--ui);color:#6c6860;display:flex;gap:16px}}
.d3 ul{{position:absolute;left:900px;top:722px;width:932px;list-style:none;border-top:1px solid {INK}}}
.d3 li{{display:flex;align-items:center;height:47px;border-bottom:1px solid rgba(26,27,28,.25);font:400 22px/1 var(--head);letter-spacing:-.02em;position:relative}}
.d3 li .no{{width:150px;font:400 14px/1 var(--ui);color:#77736a;letter-spacing:.02em}} .d3 li img{{position:absolute;right:0;top:6px;width:62px;height:35px;object-fit:cover;object-position:top;opacity:.85}}
.d3 li.on{{color:{INK}}} .d3 li.on::before{{content:'';position:absolute;left:-22px;top:20px;width:8px;height:8px;border-radius:50%;background:{INK}}}
.d3 li:not(.on){{color:#5b5851}}
.d3 .label{{right:88px;bottom:40px}}
''', body=f'''<div class="hero d3">
<header>{logo('ink', 150)}<nav>{nav()}<a class="cta">{e(HEAD_CTA)}</a></nav></header>
<h1>{e(H1A)}<br>{e(H1B)}</h1>
<p class="sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="ctas"><a class="b1">{e(CTA1)}</a><a class="b2">{CHAT}{e(CTA2)}</a></div>
<p class="pill">{e(PILL)}</p>
<div class="kp">{kpis()}</div>
<div class="pv"><img src="media/d3-ref03.jpg" alt="{e(PF[3]['title'])} {e(PF[3]['category'])}"></div>
<p class="pvcap"><span>{e(PF[3]['title'])}</span><span>{e(PF[3]['category'])}</span></p>
<ul>{rows}</ul>
<p class="label">{e(LABEL_D3)}</p></div>''')

# ── 04 두 개의 고리 — 재료(절제된 유채색) ──────────────────────────
DRAFTS['04'] = dict(
    name='두 개의 고리', fonts='maru-buri', css=BASE + f'''
.d4{{background:#3B3F2C;color:{CREAM}}}
.d4 .bg{{position:absolute;inset:0;width:1920px;height:1080px;object-fit:cover}}
.d4 .shade{{position:absolute;inset:0;background:linear-gradient(90deg,rgba(28,30,18,.55) 0%,rgba(28,30,18,.25) 40%,rgba(28,30,18,0) 58%)}}
.d4 header{{position:absolute;left:88px;right:88px;top:42px;display:flex;align-items:center;justify-content:space-between}}
.d4 nav{{display:flex;gap:38px;align-items:center;font:400 16px/1 var(--ui)}} .d4 .lang{{display:flex;gap:7px;align-items:center;opacity:.8}}
.d4 .cta{{border:1px solid rgba(252,238,216,.7);padding:13px 24px;border-radius:999px}}
.d4 h1{{position:absolute;left:88px;top:268px;font:600 96px/1.17 var(--head);letter-spacing:-.04em}}
.d4 .sub{{position:absolute;left:92px;top:520px;font:400 23px/1.7 var(--body);color:rgba(252,238,216,.86)}}
.d4 .ctas{{position:absolute;left:92px;top:638px;display:flex;align-items:center;gap:30px;font:400 17px/1 var(--ui)}}
.d4 .b1{{background:{CREAM};color:#2C2F20;padding:21px 32px;border-radius:999px;font-weight:600}}
.d4 .b2{{display:flex;gap:10px;align-items:center;border-bottom:1px solid rgba(252,238,216,.7);padding-bottom:6px}}
.d4 .pill{{position:absolute;left:92px;top:724px;font:400 15px/1 var(--ui);color:rgba(252,238,216,.66)}}
.d4 .kp{{position:absolute;left:92px;bottom:86px;display:flex;gap:0}}
.d4 .k{{padding:0 40px 0 0;margin-right:40px;border-right:1px solid rgba(252,238,216,.3)}} .d4 .k:last-child{{border:0}}
.d4 .k b{{display:block;font:600 36px/1 var(--head);letter-spacing:-.03em}} .d4 .k span{{display:block;margin-top:10px;font:400 14px/1.35 var(--ui);color:rgba(252,238,216,.72)}}
.d4 .label{{right:88px;bottom:40px;color:{CREAM}}}
''', body=f'''<div class="hero d4"><img class="bg" src="media/d4-ceramic.jpg" alt=""><div class="shade"></div>
<header>{logo('cream', 156)}<nav>{nav()}<a class="cta">{e(HEAD_CTA)}</a></nav></header>
<h1>{e(H1A)}<br>{e(H1B)}</h1>
<p class="sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="ctas"><a class="b1">{e(CTA1)}</a><a class="b2">{e(CTA2)} {ARROW}</a></div>
<p class="pill">{e(PILL)}</p>
<div class="kp">{kpis()}</div>
<p class="label">{e(LABEL)}</p></div>''')


# ── 05 간섭 — 그래픽·광학(검정) ─────────────────────────────────────
def interference():
    """로고의 두 원(같은 비율: 중심 거리/반지름 ≈ 1.03, 세로 2% 긴 타원)을 동심원으로 확장 → 겹친 곳에 모아레."""
    cx1, cx2, cy, k = 1318, 1708, 540, 1.022
    rings = []
    for cx in (cx1, cx2):
        for r in range(14, 1100, 13):
            rings.append(f'<ellipse cx="{cx}" cy="{cy}" rx="{r}" ry="{r * k:.1f}"/>')
    key = ''.join(f'<ellipse cx="{cx}" cy="{cy}" rx="378" ry="{378 * k:.1f}"/>' for cx in (cx1, cx2))
    return (f'<svg class="int" width="1920" height="1080" viewBox="0 0 1920 1080" aria-hidden="true">'
            f'<defs><linearGradient id="fade" x1="0" x2="1"><stop offset=".42" stop-color="#000"/><stop offset=".62" stop-color="#fff"/></linearGradient>'
            f'<mask id="m"><rect width="1920" height="1080" fill="url(#fade)"/></mask></defs>'
            f'<g mask="url(#m)"><g fill="none" stroke="{CREAM}" stroke-width="1" opacity=".42">{"".join(rings)}</g>'
            f'<g fill="none" stroke="{CREAM}" stroke-width="2.4">{key}</g></g></svg>')


DRAFTS['05'] = dict(
    name='간섭', fonts='favorit-hangul', css=BASE + f'''
.d5{{background:#090909;color:{CREAM}}}
.d5 .int{{position:absolute;left:0;top:0}}
.d5 header{{position:absolute;left:80px;right:80px;top:42px;display:flex;align-items:center;justify-content:space-between}}
.d5 nav{{display:flex;gap:38px;align-items:center;font:400 16px/1 var(--ui)}} .d5 .lang{{display:flex;gap:7px;align-items:center;opacity:.7}}
.d5 .cta{{background:{CREAM};color:#090909;padding:14px 24px}}
.d5 h1{{position:absolute;left:80px;top:300px;font:400 94px/1.12 var(--head);letter-spacing:-.04em}}
.d5 .sub{{position:absolute;left:84px;top:548px;font:400 22px/1.7 var(--body);color:rgba(252,238,216,.78)}}
.d5 .ctas{{position:absolute;left:84px;top:664px;display:flex;gap:14px;font:400 17px/1 var(--ui)}}
.d5 .b1{{background:{CREAM};color:#090909;padding:21px 30px;display:flex;gap:12px;align-items:center}}
.d5 .b2{{border:1px solid rgba(252,238,216,.55);padding:20px 28px;display:flex;gap:10px;align-items:center}}
.d5 .pill{{position:absolute;left:86px;top:746px;font:400 15px/1 var(--ui);color:rgba(252,238,216,.55)}}
.d5 .kp{{position:absolute;left:84px;bottom:84px;display:flex;gap:48px}}
.d5 .k{{width:190px;border-top:1px solid rgba(252,238,216,.4);padding-top:16px}} .d5 .k b{{display:block;font:400 38px/1 var(--head);letter-spacing:-.03em}}
.d5 .k span{{display:block;margin-top:11px;font:400 14px/1.35 var(--ui);color:rgba(252,238,216,.66)}}
.d5 .label{{right:80px;bottom:34px;color:rgba(252,238,216,.6);opacity:1;background:#090909;padding:6px 0 6px 12px}}
''', body=f'''<div class="hero d5">{interference()}
<header>{logo('cream', 156)}<nav>{nav()}<a class="cta">{e(HEAD_CTA)}</a></nav></header>
<h1>{e(H1A)}<br>{e(H1B)}</h1>
<p class="sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="ctas"><a class="b1">{e(CTA1)} {ARROW}</a><a class="b2">{CHAT}{e(CTA2)}</a></div>
<p class="pill">{e(PILL)}</p>
<div class="kp">{kpis()}</div>
<p class="label">{e(LABEL_D5)}</p></div>''')


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    spec = {}
    for n, d in DRAFTS.items():
        page = (f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Pause Studio 2차 시안 {n} {d["name"]}</title>'
                f'<style>@font-face{{font-family:MaruBuri;src:url(../fonts/MaruBuri-Regular.woff2);font-weight:400}}'
                f'@font-face{{font-family:MaruBuri;src:url(../fonts/MaruBuri-SemiBold.woff2);font-weight:600}}'
                f'body{{margin:0}} .hero{{--head:MaruBuri;--body:MaruBuri;--ui:MaruBuri;--label:MaruBuri}}</style>'
                f'<style id="hero-css">{d["css"]}</style></head><body><!--HERO-->{d["body"]}<!--/HERO--></body></html>')
        (OUT / f'hero-{n}.html').write_text(page)
        spec[n] = dict(name=d['name'], fonts=d['fonts'])
    (OUT / 'drafts.json').write_text(json.dumps(spec, ensure_ascii=False, indent=1))
    print('ok', list(spec))


if __name__ == '__main__':
    main()
