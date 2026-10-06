"""새 로고 웹용 키트: 파비콘 제안 SVG + 확인용 시트 HTML(배경·크기·파비콘·서체 조합).
PNG 내보내기·캡처: node tools/logo_export.cjs
실행: python3 tools/logo_kit.py && NODE_PATH=/opt/node22/lib/node_modules node tools/logo_export.cjs"""
import json
import re
from pathlib import Path

from svgelements import Path as SvgPath

ROOT = Path(__file__).resolve().parents[1]
NEW = ROOT / 'content' / 'assets' / 'logo' / 'new'
V = NEW / 'vector'
KIT = ROOT / 'drafts' / 'logo'
INK, CREAM, DARK, PAPER = '#1A1B1C', '#FCEED8', '#151515', '#F2F0EB'


def sheet():
    m = json.loads((NEW / 'measure.json').read_text())
    ver = json.loads((NEW / 'work' / 'verify.json').read_text())
    logo = lambda tone: f'../../content/assets/logo/new/vector/pause-studio-logo-{tone}.svg'
    sizes = ''.join(f'<div class="sz"><img src="{logo("ink")}" style="width:{w}px"><span>{w}px</span></div>' for w in (96, 120, 160, 200, 280))
    sizes_d = ''.join(f'<div class="sz"><img src="{logo("cream")}" style="width:{w}px"><span>{w}px</span></div>' for w in (96, 120, 160, 200, 280))
    fav = ('<div class="fvs">' + ''.join(f'<div class="fv"><img src="../../content/assets/logo/new/favicon/png/favicon-{px}.png" style="width:{px}px;height:{px}px"><span>{px}</span></div>'
                                        for px in (16, 32, 48, 64, 192)) + '</div>')
    pairs = ''
    for fid, name in (('sd-greta-sans', 'SD 그레타산스'), ('sd-jeongche', 'SD 정체'), ('ag-choijeongho-minburi-screen', 'AG 최정호 민부리 스크린'),
                      ('maru-buri', '마루 부리'), ('sd-gyeokdong-myeongjo2', 'SD 격동명조2'), ('favorit-hangul', 'ABC Favorit Hangul')):
        pairs += (f'<figure class="pr"><div class="hd"><img src="{logo("ink")}" style="width:150px"><span>포트폴리오 · 서비스 · 요금 · 문의하기</span></div>'
                  f'<div class="sp" style="background-image:url(../fonts/specimens/{fid}.png)"></div><figcaption>{name}</figcaption></figure>')
    html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Pause Studio 로고 키트</title><style>
@font-face{{font-family:MaruBuri;src:url(../fonts/MaruBuri-Regular.woff2);font-weight:400}}
@font-face{{font-family:MaruBuri;src:url(../fonts/MaruBuri-Bold.woff2);font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}} body{{width:2400px;background:#E9E7E1;color:#151515;font-family:MaruBuri;padding:90px;word-break:keep-all}}
h1{{font-size:56px;font-weight:700}} .lead{{font-size:23px;line-height:1.7;color:#3c3c3c;margin-top:16px}}
h2{{font-size:32px;font-weight:700;margin:70px 0 24px;border-bottom:2px solid #151515;padding-bottom:12px}} h3{{font-size:22px;margin-bottom:12px}}
.hero{{display:grid;grid-template-columns:1fr 1fr;gap:30px}} .hero div{{height:560px;display:flex;align-items:center;justify-content:center}}
.hero img{{width:860px}} .light{{background:{PAPER}}} .dark{{background:{DARK}}}
.nums{{display:flex;gap:40px;margin-top:22px;font-size:21px;color:#333}} .nums b{{font-size:30px;display:block;color:#151515}}
.row{{display:flex;align-items:flex-end;gap:56px;padding:44px 50px}} .sz{{display:flex;flex-direction:column;gap:10px}} .sz span,.fv span{{font-size:16px;color:#888}}
.fr{{margin-bottom:26px}} .fvs{{display:flex;align-items:flex-end;gap:34px;background:#fff;padding:30px}} .fv{{display:flex;flex-direction:column;align-items:center;gap:8px}}
.prs{{display:grid;grid-template-columns:repeat(3,720px);gap:40px}} .pr .hd{{background:{PAPER};display:flex;justify-content:space-between;align-items:center;padding:26px 40px 0}}
.pr .hd span{{font-size:15px;color:#555}} .pr .sp{{height:330px;background-color:{PAPER};background-size:1100px auto;background-position:-30px -10px;background-repeat:no-repeat}}
figcaption{{font-size:22px;font-weight:700;margin-top:12px}} .note{{font-size:20px;line-height:1.7;color:#444;margin-top:14px}}
</style></head><body>
<h1>Pause Studio 로고 — 웹용 벡터 키트</h1>
<p class="lead">보내주신 PNG를 벡터(SVG)로 옮겼습니다. 모양·비율·간격은 그대로이고, 두 원과 ®의 바깥 원은 원본에서 측정한 값으로 정확한 도형을 다시 그렸습니다.</p>
<div class="nums"><div><b>{ver["iou"] * 100:.1f}%</b>원본과 겹침(IoU)</div><div><b>{ver["p99_edge_shift_px_est"]}px</b>윤곽 차이(99%, 1672px 기준)</div>
<div><b>{m["rings"][0]["rx_used"]:.1f} × {m["rings"][0]["ry_used"]:.1f}</b>원 반지름(가로×세로, 원본 그대로 약 2% 세로로 긴 타원)</div><div><b>{m["ring_stroke"]:.1f}px</b>원 선 두께</div></div>
<h2>1. 밝은 배경 · 어두운 배경</h2>
<div class="hero"><div class="light"><img src="{logo("ink")}"></div><div class="dark"><img src="{logo("cream")}"></div></div>
<p class="note">잉크 {INK} · 크림 {CREAM} (보내주신 두 파일의 색을 측정). 크림 원본 PNG는 가장자리가 흐린 빛 번짐이 있어, 같은 벡터에 색만 입혔습니다.</p>
<h2>2. 작은 크기 — 헤더·모바일에서 읽히는지</h2>
<div class="row light">{sizes}</div><div class="row dark">{sizes_d}</div>
<p class="note">가로 120px까지 글자·원 모두 읽힙니다. 96px부터 원 선이 1px 아래로 얇아져 흐려집니다 → 사이트 헤더는 가로 140px 이상 권장, 모바일 헤더 120px.</p>
<h2>3. 파비콘 — 사용자 제작 PS 모노그램</h2>{fav}
<p class="note">자세한 확인: drafts/logo/PAUSE_favicon_check.png. 32px 이상에서 P·S가 읽히고, 16px(저해상도 화면)에서는 획이 1px 미만이라 뭉개집니다.</p>
<h2>4. 로고와 한글 서체 조합</h2><div class="prs">{pairs}</div>
<p class="note">로고는 대비가 큰 세리프 글자라, 한글도 획에 대비와 맺음이 있는 서체와 결이 맞습니다.</p>
</body></html>'''
    KIT.mkdir(parents=True, exist_ok=True)
    (KIT / 'logo-kit.html').write_text(html)


if __name__ == '__main__':
    sheet()
    print('ok')
