"""26차 콘티 프레임: 로고 등장(두 원이 위에서 반대 방향으로 그려짐 → 교차점 빛 → 빛이 지나가며 글자 → ®), 로고→촬영 초점, 실제 고객 사이 두 원 렌즈 전환, 끝에 원이 닫히며 로고. 실행: python3 tools/storyboard_v26_frames.py (저장소 루트에서)"""
import cv2, numpy as np, re
from pathlib import Path
V=Path('drafts/v26'); S=V/'screens'; SRC=S/'src'
for k in ['kvibe','blooming','blessings','chemilife','chillenq','ddm']:
    im=cv2.imread(str(V/f'shots/full-{k}.jpg')); lb=im.copy(); lb[:138]=0; lb[-138:]=0
    cv2.imwrite(str(V/f'shots/cine-{k}.jpg'),lb,[cv2.IMWRITE_JPEG_QUALITY,92]); cv2.imwrite(str(SRC/f'full-{k}.jpg'),im)
for k in ['kvibe','blooming','ddm']:
    cv2.imwrite(str(SRC/f'reel-{k}.jpg'),cv2.imread(str(V/f'shots/reel-{k}.jpg')))
svg=Path('content/assets/logo/new/vector/pause-studio-logo-cream.svg').read_text()
tp=re.search(r'<path fill="#FCEED8" d="([^"]+)"/>',svg).group(1)
CX,CY,RX,RY=833.425,480.62,364.28,371.98; E=[643.82,1023.03]; K=0.62
IY=RY*np.sqrt(1-((CX-E[0])/RX)**2)
BLUR='filter="url(#b)"'
def page(out=None,out_op=0.0,ins=None,ins_blur=0,scale=1.0,shift=0,draw=1.0,glint=0.0,txt=0.0,reveal=1.0,reg=1.0):
    k=K*scale; tx=960+shift-CX*k; ty=540-CY*k
    r1=f'<ellipse cx="{E[0]}" cy="{CY}" rx="{RX}" ry="{RY}" pathLength="100" stroke-dasharray="{draw*100:.1f} 100" transform="rotate(-90 {E[0]} {CY})"/>'
    r2=f'<ellipse cx="{E[1]}" cy="{CY}" rx="{RX}" ry="{RY}" pathLength="100" stroke-dasharray="{draw*100:.1f} 100" transform="translate({2*E[1]} 0) scale(-1 1) rotate(-90 {E[1]} {CY})"/>'
    mask=''.join(f'<ellipse cx="{x}" cy="{CY}" rx="{RX}" ry="{RY}" fill="#fff"/>' for x in E)
    gl=''.join(f'<circle cx="{CX}" cy="{CY+s*IY:.1f}" r="70" fill="url(#gl)" opacity="{glint}"/>' for s in (-1,1))
    bl=BLUR if ins_blur else ''
    insimg=f'<image href="{ins}" x="0" y="0" width="1920" height="1080" preserveAspectRatio="xMidYMid slice" mask="url(#m)" {bl}/>' if ins else ''
    outdiv=f'<div style="position:absolute;inset:0;background:url({out}) center/cover;opacity:{out_op}"></div>' if out else ''
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>*{{margin:0}}html,body{{width:1920px;height:1080px;overflow:hidden;background:#0B0B0B}}svg{{position:absolute;inset:0}}</style></head><body>{outdiv}
<svg width="1920" height="1080" viewBox="0 0 1920 1080"><defs>
<radialGradient id="gl"><stop offset="0" stop-color="#FFF6E6" stop-opacity="1"/><stop offset=".25" stop-color="#FCEED8" stop-opacity=".55"/><stop offset="1" stop-color="#FCEED8" stop-opacity="0"/></radialGradient>
<linearGradient id="sw" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset="{max(reveal-0.08,0):.3f}" stop-color="#fff"/><stop offset="{min(reveal,1):.3f}" stop-color="#000"/></linearGradient>
<mask id="tm" maskUnits="userSpaceOnUse" x="80" y="80" width="1560" height="800"><rect x="80" y="80" width="1560" height="800" fill="url(#sw)"/></mask>
<mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="1920" height="1080"><rect width="1920" height="1080" fill="#000"/><g transform="translate({tx:.2f} {ty:.2f}) scale({k:.4f})">{mask}</g></mask>
<filter id="b"><feGaussianBlur stdDeviation="{ins_blur}"/></filter></defs>
{insimg}<g transform="translate({tx:.2f} {ty:.2f}) scale({k:.4f})"><g fill="none" stroke="#FCEED8" stroke-width="{12.29/scale:.2f}" stroke-linecap="round">{r1}{r2}</g>{gl}
<g opacity="{txt}" mask="url(#tm)"><path fill="#FCEED8" d="{tp}"/></g><circle cx="1561.44" cy="406.01" r="34.17" fill="none" stroke="#FCEED8" stroke-width="8.69" opacity="{reg*txt}"/></g></svg></body></html>'''
B='src/before.jpg'; W='src/promo-water-full.png'
F={'L1-draw':page(out=B,out_op=0.18,draw=0.38),'L2-rings':page(draw=1.0,glint=0.9),'L3-type':page(glint=0.25,txt=1,reveal=0.55,reg=0),'L4-logo':page(txt=1,reveal=1.1,reg=1),
 'L5-focus-out':page(ins=W,ins_blur=14),'L6-focus-in':page(ins=W),'L7-open':page(ins=W,scale=1.9),
 'W1-kvibe-to-blooming':page(out='src/reel-kvibe.jpg',out_op=0.3,ins='src/full-blooming.jpg',scale=1.5,shift=-150),
 'W2-blooming-to-blessings':page(out='src/reel-blooming.jpg',out_op=0.3,ins='src/full-blessings.jpg',scale=1.5,shift=150),
 'W3-chemilife':page(ins='src/full-chemilife.jpg',scale=1.15),'W4-chillenq':page(ins='src/full-chillenq.jpg',scale=1.0),'W5-ddm':page(ins='src/full-ddm.jpg',scale=0.85),
 'E1-close':page(out='src/reel-ddm.jpg',out_op=0.25,ins='src/reel-ddm.jpg',scale=0.75),'E2-logo':page(txt=1,reveal=1.1,glint=0.4)}
for n,h in F.items(): (S/f'{n}.html').write_text(h)
