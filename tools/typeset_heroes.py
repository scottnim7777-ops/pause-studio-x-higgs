"""히어로 시안 5종의 HTML 조판본을 만든다(임시 조판 — 전체 사이트 구현 아님).

- 문구는 content/site-content.ko.json에서 그대로 불러온다(직접 타이핑하지 않음 → 오탈자 방지).
- 배경 아트워크는 Higgsfield 원판(higgsfield/raw/*-plate), 로고는 drafts/logos/*.svg,
  실제 작업물은 content/assets/portfolio/originals에서 잘라 쓴다(내용 변경 없음, 크롭·리사이즈만).
- 배치·비례·버튼 형태는 Higgsfield UI 시각화(higgsfield/raw/*-ui)를 기준으로 한다.
결과: drafts/typeset/hero-0N.html  → tools/capture_heroes.cjs 로 1920×1080 PNG 캡처
"""
import html
import json
import subprocess
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
T = ROOT / 'drafts' / 'typeset'
MEDIA = T / 'media'
MEDIA.mkdir(parents=True, exist_ok=True)
C = json.loads((ROOT / 'content' / 'site-content.ko.json').read_text())
M = json.loads((T / 'measure.json').read_text())
PF = ROOT / 'content' / 'assets' / 'portfolio' / 'originals'

hero, header, contact = C['hero'], C['header'], C['contact']
e = html.escape
NAV = [n['label'] for n in header['nav']]
KPIS = [(k['value'] + k['suffix'], k['label'], k.get('note', '')) for k in hero['kpis']]
H1_L1, H1_L2 = '한인 대표님들을 위한', '웹사이트 제작'          # 원문 헤드라인의 줄바꿈 위치만 지정
assert H1_L1 + ' ' + H1_L2 == hero['headline']
SUB = hero['sub']
SUB_A, SUB_B = SUB.split(', ', 1)                               # 쉼표 뒤에서 줄바꿈(문구 변경 없음)
SUB_A += ','
PILL = hero['pill']
CTA1, CTA2 = contact['cta_primary']['label'], contact['cta_secondary']['label']
HEAD_CTA, LANG = header['cta']['label'], header['language_selector'][0]


def portfolio(ref_id):
    return next(PF.glob(f'ref{ref_id:02d}_*'))


def media(name, src, box=None, size=None, frame=None):
    """원본을 잘라 웹용 JPEG로(내용 변경 없음)."""
    out = MEDIA / name
    if not out.exists():
        if str(src).endswith('.mp4'):   # 영상 작업물은 2초 지점 프레임을 사용
            tmp = MEDIA / ('_' + name.rsplit('.', 1)[0] + '.png')
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '2', '-i', str(src), '-frames:v', '1', str(tmp)], check=True)
            src = tmp
        im = Image.open(src)
        if frame is not None:
            im.seek(frame)
        im = im.convert('RGB')
        if box:
            im = im.crop(box)
        if size:
            im.thumbnail(size, Image.LANCZOS)
        im.save(out, quality=90)
    return f'media/{name}'


def homography(src, dst):
    """src 4점 → dst 4점 투영 변환 → CSS matrix3d 문자열."""
    A, b = [], []
    for (x, y), (u, v) in zip(src, dst):
        A += [[x, y, 1, 0, 0, 0, -u * x, -u * y], [0, 0, 0, x, y, 1, -v * x, -v * y]]
        b += [u, v]
    h = np.linalg.solve(np.array(A, float), np.array(b, float))
    H = [[h[0], h[1], 0, h[2]], [h[3], h[4], 0, h[5]], [0, 0, 1, 0], [h[6], h[7], 0, 1]]
    return 'matrix3d(' + ','.join(f'{H[r][c]:.10f}' for c in range(4) for r in range(4)) + ')'


def cover_map(plate_w, plate_h, box_w=1920, box_h=1080, oy=None):
    s = max(box_w / plate_w, box_h / plate_h)
    ox = (box_w - plate_w * s) / 2
    oy = (box_h - plate_h * s) / 2 if oy is None else oy
    return s, ox, oy


CHEVRON = '<svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
CHAT = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4c-4.7 0-8.5 3-8.5 6.7 0 2.3 1.5 4.3 3.8 5.5l-.9 3.3 3.7-2.1c.6.1 1.2.1 1.9.1 4.7 0 8.5-3 8.5-6.8S16.7 4 12 4Z" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'
ARROW = '<svg width="34" height="12" viewBox="0 0 34 12" aria-hidden="true"><path d="M0 6h32M27 1l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>'
GLOBE = '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M3 12h18M12 3c2.6 2.6 3.9 5.6 3.9 9s-1.3 6.4-3.9 9c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3Z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>'
CHECK = '<svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="m8 12.3 2.7 2.7L16.2 9.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>'

FONTS = '''
@font-face{font-family:Hahmlet;src:url(../fonts/Hahmlet-VF.ttf);font-weight:100 900}
@font-face{font-family:Pretendard;src:url(../fonts/PretendardVariable.ttf);font-weight:45 930}
@font-face{font-family:SUIT;src:url(../fonts/SUIT-Variable.ttf);font-weight:100 900}
@font-face{font-family:'IBM Plex Sans KR';src:url(../fonts/IBMPlexSansKR-Regular.ttf);font-weight:400}
@font-face{font-family:'IBM Plex Sans KR';src:url(../fonts/IBMPlexSansKR-Medium.ttf);font-weight:500}
@font-face{font-family:'IBM Plex Sans KR';src:url(../fonts/IBMPlexSansKR-SemiBold.ttf);font-weight:600}
@font-face{font-family:'IBM Plex Sans KR';src:url(../fonts/IBMPlexSansKR-Bold.ttf);font-weight:700}
@font-face{font-family:'IBM Plex Mono';src:url(../fonts/IBMPlexMono-Regular.ttf);font-weight:400}
@font-face{font-family:'IBM Plex Mono';src:url(../fonts/IBMPlexMono-Medium.ttf);font-weight:500}
@font-face{font-family:'Gowun Batang';src:url(../fonts/GowunBatang-Regular.ttf);font-weight:400}
@font-face{font-family:'Gowun Batang';src:url(../fonts/GowunBatang-Bold.ttf);font-weight:700}
@font-face{font-family:Archivo;src:url(../fonts/Archivo-VF.ttf);font-weight:100 900;font-stretch:62% 125%}
'''
BASE = '''
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1920px;height:1080px;overflow:hidden}
body{-webkit-font-smoothing:antialiased;text-rendering:optimizeLegibility;word-break:keep-all}
.hero{position:relative;width:1920px;height:1080px;overflow:hidden}
.abs{position:absolute}
a{color:inherit;text-decoration:none}
header{position:absolute;left:0;right:0;top:0;display:flex;align-items:center;justify-content:space-between}
nav{display:flex;align-items:center}
.lang{display:inline-flex;align-items:center;gap:8px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:12px;white-space:nowrap}
.kpi b{display:block}
.draft{position:absolute;font:500 11px/1 Pretendard;letter-spacing:.02em;opacity:.55}
'''


def page(title, css, body):
    return (f'<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>{e(title)}</title>'
            f'<style>{FONTS}{BASE}{css}</style></head><body>{body}</body></html>\n')


def nav_html(gap):
    return ''.join(f'<a href="#">{e(n)}</a>' for n in NAV)


DRAFT_NOTE = '아트워크: Higgsfield 생성 · 문구·로고·버튼: HTML 조판 시안'


# ───────────────────────── 01 쉼표 (편집·타이포그래피) ─────────────────────────
def hero01():
    ink, paper = M['d1_ink'], M['d1_paper']
    css = f'''
.d1{{background:url(../../higgsfield/raw/d1-plate/d1-plate_01.png) center/cover;color:#151513;font-family:Hahmlet}}
.d1 header{{padding:40px 72px 0 72px}}
.d1 .logo img{{height:58px;display:block}}
.d1 nav{{gap:44px;font:500 18px/1 Pretendard;letter-spacing:-.01em}}
.d1 .lang{{margin-left:12px}}
.d1 .hcta{{margin-left:18px;background:{ink};color:#F4F0E6;font:600 17px/1 Pretendard;padding:17px 26px}}
.d1 h1{{left:104px;top:216px;font-weight:300;font-size:108px;line-height:1.17;letter-spacing:-.035em}}
.d1 .rule{{left:108px;top:514px;width:420px;height:1.5px;background:#151513}}
.d1 .sub{{left:106px;top:552px;font:400 26px/1.62 Hahmlet;letter-spacing:-.015em;color:#262522}}
.d1 .ctas{{left:106px;top:690px;display:flex;align-items:center;gap:44px}}
.d1 .b1{{background:{ink};color:#F6F2E8;font:600 20px/1 Pretendard;height:70px;padding:0 36px;letter-spacing:-.01em}}
.d1 .b2{{font:500 20px/1 Pretendard;letter-spacing:-.01em;padding:10px 0;border-bottom:1.5px solid #151513;gap:18px}}
.d1 .kpis{{left:106px;top:866px;display:flex}}
.d1 .kpi{{width:330px;padding-left:0}}
.d1 .kpi+.kpi{{border-left:1.5px solid rgba(21,21,19,.5);padding-left:32px;width:356px}}
.d1 .kpi b{{font-weight:300;font-size:60px;line-height:1;letter-spacing:-.03em}}
.d1 .kpi span{{display:block;margin-top:14px;font:500 19px/1.3 Pretendard;color:#33312C}}
.d1 .pill{{right:120px;top:958px;font:500 18px/1.4 Pretendard;color:#262522;letter-spacing:-.01em}}
.d1 .draft{{left:108px;bottom:22px;color:#151513}}
'''
    k = ''.join(f'<div class="kpi"><b>{e(v)}</b><span>{e(l)}{(" " + e(n)) if n else ""}</span></div>' for v, l, n in KPIS)
    body = f'''<main class="hero d1">
<header><a class="logo" href="#"><img src="../logos/L1-comma-ink.svg" alt="PAUSE STUDIO 퍼즈 스튜디오"></a>
<nav>{nav_html(44)}<span class="lang">{e(LANG)} {CHEVRON}</span><a class="hcta btn" href="#">{e(HEAD_CTA)}</a></nav></header>
<h1 class="abs">{e(H1_L1)}<br>{e(H1_L2)}</h1>
<div class="abs rule"></div>
<p class="abs sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="abs ctas"><a class="btn b1" href="#">{e(CTA1)}</a><a class="btn b2" href="#">{e(CTA2)} {ARROW}</a></div>
<div class="abs kpis">{k}</div>
<p class="abs pill">{e(PILL)}</p>
<p class="draft">시안 01 · {DRAFT_NOTE}</p></main>'''
    return page('시안 01 — 쉼표', css, body)


# ───────────────────────── 02 머무는 빛 (사진·시네마틱) ─────────────────────────
def hero02():
    scr = json.loads((T / 'd2-screen.json').read_text())
    pw, ph = scr['size']
    s, ox, oy = cover_map(pw, ph)
    q = [scr['screen'][k] for k in ('tl', 'tr', 'br', 'bl')]
    mx, my = sum(p[0] for p in q) / 4, sum(p[1] for p in q) / 4
    q = [(x + 3 * (1 if x > mx else -1), y + 3 * (1 if y > my else -1)) for x, y in q]   # 원래 화면 테두리가 비치지 않게 3px 확장
    dst = [(x * s + ox, y * s + oy) for x, y in q]
    img = media('d2-monitor-ref03.jpg', portfolio(3), size=(960, 960))
    iw, ih = 640, 343            # 실제 작업물(Ref.03 한식당) 비율 1.87
    mat = homography([(0, 0), (iw, 0), (iw, ih), (0, ih)], dst)
    css = f'''
.d2{{background:#02030A url(../../higgsfield/raw/d2-plate/d2-plate_01.png) center/cover;color:#F1ECE3;font-family:Pretendard}}
.d2 .scrim{{inset:0;background:linear-gradient(180deg,rgba(2,3,10,.55) 0,rgba(2,3,10,0) 18%),linear-gradient(0deg,rgba(2,3,10,.82) 0,rgba(2,3,10,.35) 38%,rgba(2,3,10,0) 60%)}}
.d2 .screen{{left:0;top:0;width:{iw}px;height:{ih}px;transform-origin:0 0;transform:{mat};background:url({img}) center/cover;filter:brightness(.78) saturate(.72) contrast(.92) blur(.35px);opacity:.93}}
.d2 .glow{{left:{dst[0][0]-40:.0f}px;top:{dst[0][1]-40:.0f}px;width:{dst[2][0]-dst[0][0]+80:.0f}px;height:{dst[2][1]-dst[0][1]+80:.0f}px;background:radial-gradient(closest-side,rgba(210,220,235,.14),rgba(210,220,235,0));}}
.d2 header{{padding:40px 72px 0 72px}}
.d2 .logo img{{height:40px;display:block}}
.d2 nav{{gap:44px;font:600 17px/1 Pretendard;letter-spacing:-.01em}}
.d2 .lang{{margin-left:10px;font-weight:500}}
.d2 .hcta{{margin-left:22px;border:1px solid rgba(232,168,104,.75);color:#F1ECE3;font:600 17px/1 Pretendard;padding:16px 28px}}
.d2 h1{{left:78px;top:592px;font-weight:800;font-size:104px;line-height:1.14;letter-spacing:-.045em}}
.d2 .sub{{left:80px;top:846px;font:500 25px/1.5 Pretendard;letter-spacing:-.02em;color:rgba(241,236,227,.82)}}
.d2 .ctas{{left:80px;top:902px;display:flex;gap:18px}}
.d2 .b1{{height:68px;padding:0 34px;background:#F1ECE3;color:#0B0F14;font:700 20px/1 Pretendard;letter-spacing:-.02em;border-radius:3px}}
.d2 .b2{{height:68px;padding:0 30px;border:1px solid rgba(241,236,227,.55);font:600 20px/1 Pretendard;letter-spacing:-.02em;border-radius:3px}}
.d2 .pill{{left:80px;top:996px;font:500 17px/1 Pretendard;color:rgba(241,236,227,.62)}}
.d2 .kpis{{left:1140px;top:900px;width:704px;height:118px;display:flex;border:1px solid rgba(232,168,104,.55)}}
.d2 .kpi{{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center}}
.d2 .kpi+.kpi{{border-left:1px solid rgba(232,168,104,.4)}}
.d2 .kpi b{{font-weight:800;font-size:38px;letter-spacing:-.03em;line-height:1}}
.d2 .kpi span{{margin-top:12px;font:500 16px/1 Pretendard;color:rgba(241,236,227,.72)}}
.d2 .draft{{right:76px;bottom:24px;color:#F1ECE3;opacity:.4}}
'''
    k = ''.join(f'<div class="kpi"><b>{e(v)}</b><span>{e(l)}{(" " + e(n)) if n else ""}</span></div>' for v, l, n in KPIS)
    body = f'''<main class="hero d2">
<div class="abs glow"></div><div class="abs screen" role="img" aria-label="실제 작업물 Ref. 03 한식당"></div><div class="abs scrim"></div>
<header><a class="logo" href="#"><img src="../logos/L2-fermata-paper.svg" alt="PAUSE STUDIO 퍼즈 스튜디오"></a>
<nav>{nav_html(44)}<span class="lang">{e(LANG)} {CHEVRON}</span><a class="hcta btn" href="#">{e(HEAD_CTA)}</a></nav></header>
<h1 class="abs">{e(H1_L1)}<br>{e(H1_L2)}</h1>
<p class="abs sub">{e(SUB)}</p>
<div class="abs ctas"><a class="btn b1" href="#">{e(CTA1)}</a><a class="btn b2" href="#">{CHAT}{e(CTA2)}</a></div>
<p class="abs pill">{e(PILL)}</p>
<div class="abs kpis">{k}</div>
<p class="draft">시안 02 · {DRAFT_NOTE} · 모니터 화면: 실제 작업물 Ref. 03</p></main>'''
    return page('시안 02 — 머무는 빛', css, body)


# ───────────────────────── 03 크리틱 월 (실제 작업물) ─────────────────────────
def hero03():
    info = json.loads((T / 'd3-sheets.json').read_text())
    pw, ph = info['size']
    s, ox, oy = cover_map(pw, ph)
    phone = lambda i, j, n: media(n, portfolio(10), box=(i * 1170, j * 2532, (i + 1) * 1170, (j + 1) * 2532), size=(520, 1120))
    gif = media('ref04-frame.jpg', portfolio(4), size=(1280, 1280), frame=0)
    assign = {  # 종이 → 실제 작업물(Ref. 01~15 중, 퍼즈 스튜디오 작업으로 보이는 것)
        'A': (media('ref11.jpg', portfolio(11), size=(1400, 1400)), 'top', 'REF. 11', '여행사'),
        'B': (media('ref07.jpg', portfolio(7), size=(1280, 1280)), 'top', None, None),
        'C': (phone(1, 0, 'ref10-splash.jpg'), 'center', None, None),
        'D': (media('ref05.jpg', portfolio(5), size=(1450, 1450)), 'center', None, None),
        'E': (media('ref03.jpg', portfolio(3), size=(1600, 1600)), 'top', 'REF. 03', '한식당'),
        'F': (media('ref08.jpg', portfolio(8), size=(1254, 1254)), 'center', 'REF. 08', '미용실 / 헤어 살롱'),
        'G': (phone(2, 0, 'ref10-home.jpg'), 'top', None, None),
        'H': (gif, 'center', 'REF. 04', '오클랜드 현지 여행사'),
        'I': (phone(0, 1, 'ref10-route.jpg'), 'top', None, None),
        'J': (media('ref09.jpg', portfolio(9), size=(1555, 1555)), 'top', None, None),
        'K': (media('ref12.jpg', portfolio(12), size=(1565, 1565)), 'top', None, None),
    }
    # 실제 제목·분류가 원문과 일치하는지 확인
    items = {it['id']: it for it in C['portfolio']['items']}
    for key, (_, _, ref, cat) in assign.items():
        if ref:
            n = int(ref.split('.')[1])
            assert items[n]['category'] == cat and items[n]['title'].upper() == ref, (key, ref, cat)
    sheets, caps, shades = [], [], []
    for key, sh in info['sheets'].items():
        img, pos, ref, cat = assign[key]
        x, y, w, h = sh['x'] * s + ox, sh['y'] * s + oy, sh['w'] * s, sh['h'] * s
        m = max(3.0, min(w, h) * 0.035)     # 인쇄물처럼 얇은 흰 여백
        sheets.append(f'<div class="abs work" style="left:{x+m:.1f}px;top:{y+m:.1f}px;width:{w-2*m:.1f}px;height:{h-2*m:.1f}px;background-image:url({img});background-position:{pos}"></div>')
        pad = -m   # 작업물 이미지 영역에만 원판 음영(핀·말린 모서리)을 곱한다 — 벽은 그대로
        shades.append(f'<div class="abs shade" style="left:{x-pad:.1f}px;top:{y-pad:.1f}px;width:{w+2*pad:.1f}px;height:{h+2*pad:.1f}px;'
                      f'background-size:{pw*s:.1f}px {ph*s:.1f}px;background-position:{ox-(x-pad):.1f}px {oy-(y-pad):.1f}px"></div>')
        if ref:   # 오른쪽 끝 종이는 캡션을 오른쪽 정렬(화면 밖으로 넘지 않게)
            side = f'right:{1920-(x+w):.1f}px;text-align:right' if x + w > 1600 else f'left:{x:.1f}px'
            caps.append(f'<p class="abs cap" style="{side};top:{y+h+10:.1f}px"><span>{e(ref)}</span> {e(cat)}</p>')
    css = f'''
.d3{{background:url(../../higgsfield/raw/d3-plate-v2/d3-plate-v2_01.png) center/cover;color:#111;font-family:'IBM Plex Sans KR'}}
.d3 .work{{background-size:cover;background-repeat:no-repeat}}
.d3 .shade{{background-image:url(../../higgsfield/raw/d3-plate-v2/d3-plate-v2_01.png);background-repeat:no-repeat;mix-blend-mode:multiply;pointer-events:none}}
.d3 .cap{{font:500 12.5px/1 'IBM Plex Sans KR';letter-spacing:.02em;color:#3A3835;white-space:nowrap}}
.d3 .cap span{{font-family:'IBM Plex Mono';font-weight:500;letter-spacing:.06em;margin-right:6px}}
.d3 header{{padding:34px 72px 0 72px}}
.d3 .logo img{{height:40px;display:block}}
.d3 nav.main{{position:absolute;left:0;right:0;justify-content:center;gap:52px;font:500 18px/1 'IBM Plex Sans KR';pointer-events:none}}
.d3 nav.main a{{pointer-events:auto}}
.d3 .right{{display:flex;align-items:center;gap:26px;font:500 17px/1 'IBM Plex Sans KR'}}
.d3 .hcta{{background:#111;color:#fff;font:600 17px/1 'IBM Plex Sans KR';padding:17px 28px}}
.d3 h1{{left:84px;top:258px;font-weight:700;font-size:92px;line-height:1.2;letter-spacing:-.04em}}
.d3 .sub{{left:86px;top:500px;font:400 25px/1.6 'IBM Plex Sans KR';letter-spacing:-.02em;color:#3A3835}}
.d3 .ctas{{left:86px;top:612px;display:flex;gap:18px}}
.d3 .b1{{height:72px;padding:0 34px;background:#111;color:#fff;font:600 20px/1 'IBM Plex Sans KR';letter-spacing:-.02em}}
.d3 .b2{{height:72px;padding:0 28px;border:1.5px solid #111;font:600 20px/1 'IBM Plex Sans KR';letter-spacing:-.02em;background:rgba(255,255,255,.35)}}
.d3 .rule{{left:86px;top:740px;width:612px;height:1px;background:rgba(17,17,17,.35)}}
.d3 .kpis{{left:86px;top:772px;width:612px;display:flex}}
.d3 .kpi{{flex:1;text-align:center}}
.d3 .kpi+.kpi{{border-left:1px solid rgba(17,17,17,.3)}}
.d3 .kpi b{{font-weight:600;font-size:44px;letter-spacing:-.03em;line-height:1}}
.d3 .kpi span{{display:block;margin-top:14px;font:400 18px/1.2 'IBM Plex Sans KR';color:#3A3835}}
.d3 .pill{{left:86px;top:902px;display:flex;align-items:center;gap:10px;font:500 18px/1 'IBM Plex Sans KR';color:#3A3835}}
.d3 .draft{{left:86px;bottom:22px;color:#111}}
'''
    k = ''.join(f'<div class="kpi"><b>{e(v)}</b><span>{e(l)}{(" " + e(n)) if n else ""}</span></div>' for v, l, n in KPIS)
    body = f'''<main class="hero d3">
{''.join(sheets)}{''.join(shades)}{''.join(caps)}
<header><a class="logo" href="#"><img src="../logos/L3-index-ink.svg" alt="PAUSE STUDIO 퍼즈 스튜디오"></a>
<nav class="main">{nav_html(52)}</nav>
<div class="right"><span class="lang">{GLOBE} {e(LANG)} {CHEVRON}</span><a class="hcta btn" href="#">{e(HEAD_CTA)}</a></div></header>
<h1 class="abs">{e(H1_L1)}<br>{e(H1_L2)}</h1>
<p class="abs sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="abs ctas"><a class="btn b1" href="#">{e(CTA1)}</a><a class="btn b2" href="#">{CHAT}{e(CTA2)}</a></div>
<div class="abs rule"></div><div class="abs kpis">{k}</div>
<p class="abs pill">{CHECK}{e(PILL)}</p>
<p class="draft">시안 03 · {DRAFT_NOTE} · 벽의 화면: 실제 작업물 Ref. 01~15 원본</p></main>'''
    return page('시안 03 — 크리틱 월', css, body)


# ───────────────────────── 04 청자 페르마타 (재료·조형) ─────────────────────────
def hero04():
    deep, text = '#2E5446', '#1B2A23'
    css = f'''
.d4{{background:url(../../higgsfield/raw/d4-plate/d4-plate_01.png) center/cover;color:{text};font-family:'Gowun Batang'}}
.d4 header{{padding:44px 150px 0 150px}}
.d4 .logo img{{height:50px;display:block}}
.d4 nav{{gap:48px;font:500 18px/1 Pretendard;letter-spacing:-.01em}}
.d4 .lang{{margin-left:6px}}
.d4 .hcta{{margin-left:18px;background:{deep};color:#EEF3EF;font:600 17px/1 Pretendard;padding:18px 30px;border-radius:14px}}
.d4 h1{{left:148px;top:250px;font-weight:400;font-size:90px;line-height:1.27;letter-spacing:-.035em}}
.d4 .sub{{left:152px;top:500px;font:400 26px/1.62 'Gowun Batang';letter-spacing:-.015em;color:#2A3B33}}
.d4 .ctas{{left:152px;top:624px;display:flex;gap:18px}}
.d4 .b1{{height:72px;padding:0 36px;background:{deep};color:#EEF3EF;font:600 20px/1 Pretendard;border-radius:16px;letter-spacing:-.02em;box-shadow:0 10px 24px -14px rgba(20,40,32,.55)}}
.d4 .b2{{height:72px;padding:0 32px;border:1.5px solid {deep};color:{deep};font:600 20px/1 Pretendard;border-radius:16px;letter-spacing:-.02em}}
.d4 .kpis{{left:152px;top:748px;display:flex;gap:14px}}
.d4 .kpi{{width:216px;height:122px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  background:linear-gradient(180deg,rgba(236,243,238,.34),rgba(214,228,219,.22));
  box-shadow:inset 0 1px 0 rgba(255,255,255,.55),inset 0 -1px 0 rgba(90,120,104,.25),0 14px 26px -18px rgba(40,70,56,.55)}}
.d4 .kpi b{{font-weight:400;font-size:42px;line-height:1;letter-spacing:-.03em}}
.d4 .kpi span{{margin-top:12px;font:500 16px/1 Pretendard;color:#33463D}}
.d4 .pill{{left:152px;top:900px;width:676px;text-align:center;font:500 18px/1 Pretendard;color:#2A3B33;letter-spacing:-.01em}}
.d4 .draft{{left:152px;bottom:22px;color:{text}}}
'''
    k = ''.join(f'<div class="kpi"><b>{e(v)}</b><span>{e(l)}{(" " + e(n)) if n else ""}</span></div>' for v, l, n in KPIS)
    body = f'''<main class="hero d4">
<header><a class="logo" href="#"><img src="../logos/L4-arch-ink.svg" alt="PAUSE STUDIO 퍼즈 스튜디오"></a>
<nav>{nav_html(48)}<span class="lang">{e(LANG)} {CHEVRON}</span><a class="hcta btn" href="#">{e(HEAD_CTA)}</a></nav></header>
<h1 class="abs">{e(H1_L1)}<br>{e(H1_L2)}</h1>
<p class="abs sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="abs ctas"><a class="btn b1" href="#">{e(CTA1)}</a><a class="btn b2" href="#">{e(CTA2)}</a></div>
<div class="abs kpis">{k}</div>
<p class="abs pill">{e(PILL)}</p>
<p class="draft">시안 04 · {DRAFT_NOTE}</p></main>'''
    return page('시안 04 — 청자 페르마타', css, body)


# ───────────────────────── 05 렌즈 (그래픽·광학) ─────────────────────────
def hero05():
    red, blue, ivory = M['d5_red'], M['d5_blue'], '#F5F2EC'
    lx0, ly0, lx1, ly1 = M['d5_lens']
    band_t, band_b = 100, 870            # 아트워크가 보이는 구간
    art_h = band_b - band_t
    pw, ph = 2688, 1536
    s = 1920 / pw
    lens_cy = (ly0 + ly1) / 2 * s
    off = art_h / 2 - lens_cy            # 렌즈를 아트 구간 세로 중앙에
    L = dict(x0=lx0 * s, y0=ly0 * s + off + band_t, x1=lx1 * s, y1=ly1 * s + off + band_t)
    css = f'''
.d5{{background:{ivory};color:#0E0E10;font-family:SUIT}}
.d5 .art{{left:0;top:{band_t}px;width:1920px;height:{art_h}px;overflow:hidden}}
.d5 .art img{{position:absolute;left:0;top:{off:.1f}px;width:1920px;display:block}}
.d5 header{{height:{band_t}px;padding:0 64px}}
.d5 .logo img{{height:56px;display:block}}
.d5 nav{{gap:52px;font:600 18px/1 SUIT;letter-spacing:-.01em}}
.d5 .right{{display:flex;align-items:center;gap:26px;font:600 17px/1 SUIT}}
.d5 .hcta{{background:{red};color:#fff;font:700 17px/1 SUIT;padding:17px 28px;border-radius:4px}}
.d5 h1{{left:{L['x0']+128:.0f}px;top:{L['y0']+118:.0f}px;font-weight:900;font-size:92px;line-height:1.16;letter-spacing:-.045em}}
.d5 .sub{{left:{L['x0']+132:.0f}px;top:{L['y0']+354:.0f}px;font:500 25px/1.55 SUIT;letter-spacing:-.025em;color:#26262A}}
.d5 .ctas{{left:{L['x0']+132:.0f}px;top:{L['y0']+462:.0f}px;display:flex;gap:16px}}
.d5 .b1{{height:70px;padding:0 34px;background:{red};color:#fff;font:800 20px/1 SUIT;border-radius:4px;letter-spacing:-.02em}}
.d5 .b2{{height:70px;padding:0 30px;border:2px solid {blue};color:{blue};font:800 20px/1 SUIT;border-radius:4px;letter-spacing:-.02em;background:#fff}}
.d5 .kpis{{left:0;right:0;top:{band_b+26}px;display:flex;justify-content:center}}
.d5 .kpi{{width:360px;text-align:center}}
.d5 .kpi+.kpi{{border-left:1.5px solid rgba(14,14,16,.18)}}
.d5 .kpi b{{font-weight:900;font-size:66px;line-height:1;letter-spacing:-.04em}}
.d5 .kpi:nth-child(odd) b{{color:{red}}} .d5 .kpi:nth-child(2) b{{color:{blue}}}
.d5 .kpi span{{display:block;margin-top:10px;font:600 18px/1 SUIT;color:#2A2A2E}}
.d5 .pill{{left:0;right:0;top:{band_b+150}px;text-align:center;font:600 17px/1 SUIT;color:#2A2A2E}}
.d5 .draft{{right:64px;bottom:14px;color:#0E0E10}}
'''
    k = ''.join(f'<div class="kpi"><b>{e(v)}</b><span>{e(l)}{(" " + e(n)) if n else ""}</span></div>' for v, l, n in KPIS)
    body = f'''<main class="hero d5">
<div class="abs art"><img src="../../higgsfield/raw/d5-plate/d5-plate_01.png" alt=""></div>
<header><a class="logo" href="#"><img src="../logos/L5-lines-ink.svg" alt="PAUSE STUDIO 퍼즈 스튜디오"></a>
<nav>{nav_html(52)}</nav>
<div class="right"><span class="lang">{GLOBE} {e(LANG)} {CHEVRON}</span><a class="hcta btn" href="#">{e(HEAD_CTA)}</a></div></header>
<h1 class="abs">{e(H1_L1)}<br>{e(H1_L2)}</h1>
<p class="abs sub">{e(SUB_A)}<br>{e(SUB_B)}</p>
<div class="abs ctas"><a class="btn b1" href="#">{e(CTA1)}</a><a class="btn b2" href="#">{e(CTA2)}</a></div>
<div class="abs kpis">{k}</div>
<p class="abs pill">{e(PILL)}</p>
<p class="draft">시안 05 · {DRAFT_NOTE}</p></main>'''
    return page('시안 05 — 렌즈', css, body), L


if __name__ == '__main__':
    (T / 'hero-01.html').write_text(hero01())
    (T / 'hero-02.html').write_text(hero02())
    (T / 'hero-03.html').write_text(hero03())
    (T / 'hero-04.html').write_text(hero04())
    h5, lens = hero05()
    (T / 'hero-05.html').write_text(h5)
    print('lens(px):', {k: round(v) for k, v in lens.items()})
    print('written:', sorted(p.name for p in T.glob('hero-0*.html')))
