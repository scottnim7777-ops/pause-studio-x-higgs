"""3차 시안(움직이는 프로토타입) → drafts/v3/hero.html
구조: ① 인트로 3.2초(첫 진입 1회): 격자 → 한글 제목이 자모 입력처럼 조립 → 실제 작업물이 조각으로 조립 → 뒤로 빠지며 작업물 벽
      ② 무한 반복 24초: 실제 작업물 15개가 원근 벽에서 흐르고(영상 작업물은 실제 영상), 12개월 다이얼이 돌아도 관리비 0원
      ③ 문구·버튼 고정
원문은 content/site-content.ko.json 그대로. 새 문구: 눈썹 "웹사이트 · 홍보영상 제작"(사용자 승인), 달 숫자(확인 대기).
시간 t에 대한 순수 함수로 그린다 → 반복 이음매 0, 녹화는 tools/record_v3.cjs (?render=1 모드).
"""
import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'drafts' / 'v3'
C = json.loads((ROOT / 'content' / 'site-content.ko.json').read_text())
hero, header, contact = C['hero'], C['header'], C['contact']
e = html.escape
PF = {i['id']: i for i in C['portfolio']['items']}
H1 = ['한인 대표님들을 위한', '웹사이트 제작']
assert ' '.join(H1) == hero['headline']
SUB_A, SUB_B = hero['sub'].split(', ', 1)
EYEBROW = '웹사이트 · 홍보영상 제작'   # 새 문구(사용자 승인: 홍보영상 제작도 한다고 표기)
KP = {k['label']: (k['value'] + k['suffix'], k.get('note', '')) for k in hero['kpis']}
VIDEO = {1, 2, 4, 7}
ROWS = [[1, 3, 11, 7, 13], [8, 2, 12, 9, 5], [14, 4, 15, 6, 10]]


def caption(r):
    it = PF[r]
    # Ref.02는 분류명('커스텀 케이스 샵')과 실제 화면(케이크 숍)이 달라 확인 전까지 번호만 표기
    return e(it['title']) if r == 2 else f"{e(it['title'])}<i>{e(it['category'])}</i>"


def card(r):
    media = (f'<video src="media/ref{r:02d}.webm" poster="media/ref{r:02d}-poster.jpg" muted playsinline loop preload="auto"></video>'
             if r in VIDEO else f'<img src="media/ref{r:02d}.jpg" alt="">')
    return f'<figure class="card" data-r="{r}"><div class="scr">{media}</div><figcaption>{caption(r)}</figcaption></figure>'


rows = ''.join(f'<div class="row r{i}"><div class="track">{"".join(card(r) for r in row) * 2}</div></div>' for i, row in enumerate(ROWS))
logo = (ROOT / 'content/assets/logo/new/vector/pause-studio-logo-cream.svg').read_text().replace('<svg ', '<svg class="logo" width="122" ', 1)
nav = ''.join(f'<a>{e(n["label"])}</a>' for n in header['nav'])
ticks = ''.join(f'<text x="{90 + 74 * __import__("math").sin(i * 3.14159265 / 6):.2f}" y="{94 - 74 * __import__("math").cos(i * 3.14159265 / 6):.2f}">{i if i else 12}</text>' for i in range(12))

CSS = '''
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#0D0D0C;overflow:hidden}
.fit{position:absolute;left:50%;top:50%;width:1920px;height:1080px;transform-origin:0 0}
.hero{position:absolute;inset:0;overflow:hidden;background:#0D0D0C;color:#FCEED8;font-family:var(--f,'Apple SD Gothic Neo','Noto Sans KR',sans-serif);word-break:keep-all;-webkit-font-smoothing:antialiased}
.hero a{color:inherit;text-decoration:none}
.grid{position:absolute;inset:0}
.grid line{stroke:rgba(252,238,216,.07);stroke-width:1}
.stage{position:absolute;inset:0;perspective:2200px;perspective-origin:62% 46%}
.plane{position:absolute;left:660px;top:150px;width:1700px;height:980px;transform-style:preserve-3d;transform:rotateY(-24deg) rotateX(9deg) rotateZ(-3deg)}
.row{position:absolute;left:0;height:300px;width:100%}
.row.r0{top:0}.row.r1{top:320px}.row.r2{top:640px}
.track{position:absolute;left:0;top:0;display:flex;gap:28px;will-change:transform}
.card{width:440px;flex:none}
.scr{width:440px;height:248px;overflow:hidden;background:#1a1a18;border-radius:6px;box-shadow:0 30px 60px -30px rgba(0,0,0,.8)}
.scr img,.scr video{width:100%;height:100%;object-fit:cover;display:block;transform-origin:50% 0}
.card figcaption{margin-top:12px;font-size:15px;letter-spacing:.01em;color:rgba(252,238,216,.62);display:flex;gap:14px}
.card figcaption i{font-style:normal;color:rgba(252,238,216,.88)}
.veil{position:absolute;inset:0;background:linear-gradient(90deg,#0D0D0C 0%,#0D0D0C 33%,rgba(13,13,12,.86) 45%,rgba(13,13,12,0) 62%),linear-gradient(0deg,rgba(13,13,12,.7),rgba(13,13,12,0) 22%),linear-gradient(180deg,#0D0D0C 0%,rgba(13,13,12,.92) 11%,rgba(13,13,12,0) 24%);pointer-events:none}
header{position:absolute;left:96px;right:96px;top:44px;display:flex;align-items:center;justify-content:space-between}
header nav{display:flex;gap:38px;align-items:center;font-size:16px}
header .cta{border:1px solid rgba(252,238,216,.55);padding:13px 22px;border-radius:999px}
.eyebrow{position:absolute;left:100px;top:272px;font-size:16px;letter-spacing:.14em;color:rgba(252,238,216,.66);display:flex;align-items:center;gap:14px}
.eyebrow b{display:inline-block;width:8px;height:8px;border-radius:50%;background:#E5533D;font-weight:400}
h1{position:absolute;left:96px;top:312px;font-weight:400;font-family:var(--fm,inherit);font-size:86px;line-height:1.16;letter-spacing:-.035em;white-space:pre}
h1 .caret{display:inline-block;width:4px;height:76px;background:#FCEED8;vertical-align:-8px;margin-left:6px}
.sub{position:absolute;left:100px;top:540px;font-size:21px;line-height:1.7;color:rgba(252,238,216,.8)}
.ctas{position:absolute;left:100px;top:648px;display:flex;gap:14px;font-size:17px}
.b1{font-family:var(--fm,inherit);background:#FCEED8;color:#0D0D0C!important;padding:21px 30px;border-radius:999px}
.b2{border:1px solid rgba(252,238,216,.5);padding:20px 28px;border-radius:999px}
.kp{position:absolute;left:100px;bottom:84px;display:flex;gap:46px}
.kp div{border-top:1px solid rgba(252,238,216,.3);padding-top:14px;width:178px}
.kp b{display:block;font-size:34px;font-weight:400;font-family:var(--fm,inherit);letter-spacing:-.02em}
.kp span{display:block;margin-top:10px;font-size:14px;color:rgba(252,238,216,.6)}
.fee{position:absolute;right:96px;bottom:76px;width:396px;background:#0D0D0C;border:1px solid rgba(252,238,216,.18);border-radius:18px;padding:26px 28px 24px;display:grid;grid-template-columns:180px 1fr;gap:6px 20px;align-items:center}
.fee svg{grid-row:1/3}
.fee svg text{font-size:12px;fill:rgba(252,238,216,.45);text-anchor:middle;dominant-baseline:middle}
.fee .zero{font-size:66px;font-weight:400;font-family:var(--fm,inherit);letter-spacing:-.03em;line-height:1}
.fee .lab{font-size:15px;color:rgba(252,238,216,.72);line-height:1.45}
.fee .pill{grid-column:1/3;margin-top:14px;padding-top:14px;border-top:1px solid rgba(252,238,216,.14);font-size:14px;color:rgba(252,238,216,.66)}
.mo{position:absolute;left:90px;top:94px}
.big{position:absolute;left:820px;top:200px;width:960px;height:540px;transform-origin:50% 50%}
.big .bar{height:30px;background:#E9E5DE;border-radius:8px 8px 0 0;display:flex;gap:7px;align-items:center;padding-left:14px}
.big .bar i{width:10px;height:10px;border-radius:50%;background:#C9C4BB}
.big .tiles{position:relative;width:960px;height:510px;overflow:hidden;background:#151513;border-radius:0 0 8px 8px}
.big .tile{position:absolute;background-image:url(media/ref03-big.jpg);background-size:960px 540px}
.label{position:absolute;right:96px;bottom:26px;font-size:12px;color:rgba(252,238,216,.5);background:#0D0D0C;padding:5px 0 5px 12px}
'''


def build():
    jamo_lines = json.dumps(H1, ensure_ascii=False)
    body = f'''<div class="hero" id="hero">
<svg class="grid" width="1920" height="1080" aria-hidden="true">{''.join(f'<line x1="{96 + i * 144}" y1="0" x2="{96 + i * 144}" y2="1080"/>' for i in range(13))}</svg>
<div class="stage"><div class="plane" id="plane">{rows}</div></div>
<div class="big" id="big"><div class="bar"><i></i><i></i><i></i></div><div class="tiles" id="tiles"></div></div>
<div class="veil"></div>
<header id="hdr">{logo}<nav>{nav}<a>{e(header['language_selector'][0])}</a><a class="cta">{e(header['cta']['label'])}</a></nav></header>
<p class="eyebrow" id="eb"><b></b>{e(EYEBROW)}</p>
<h1 id="h1"></h1>
<p class="sub" id="sub">{e(SUB_A)},<br>{e(SUB_B)}</p>
<div class="ctas" id="ctas"><a class="b1">{e(contact['cta_primary']['label'])}</a><a class="b2">{e(contact['cta_secondary']['label'])}</a></div>
<div class="kp" id="kp"><div><b>{e(KP['누적 작업'][0])}</b><span>누적 작업</span></div><div><b>{e(KP['평균 오픈 기간'][0])}</b><span>평균 오픈 기간</span></div></div>
<div class="fee" id="fee"><svg width="180" height="188" viewBox="0 0 180 188" aria-hidden="true"><circle cx="90" cy="94" r="58" fill="none" stroke="rgba(252,238,216,.14)" stroke-width="2"/>
<circle id="arc" cx="90" cy="94" r="58" fill="none" stroke="#FCEED8" stroke-width="2.5" stroke-linecap="round" transform="rotate(-90 90 94)" stroke-dasharray="0 400"/>
<circle id="dot" cx="90" cy="36" r="5" fill="#E5533D"/>{ticks}<text id="mo" x="90" y="96" style="font-size:22px;fill:#FCEED8"></text></svg>
<p class="zero">{e(KP['월·연 관리비'][0])}</p><p class="lab">월·연 관리비 {e(KP['월·연 관리비'][1])}</p>
<p class="pill">{e(hero['pill'])}</p></div>
<p class="label">화면 속 작업물: 실제 제작 사이트 원본 · 움직임: 코드로 실시간 렌더링 시안</p>
</div>'''
    js = JS.replace('__LINES__', jamo_lines)
    page = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>Pause Studio 3차 시안 — 움직이는 히어로</title>
<meta name="viewport" content="width=device-width,initial-scale=1"><style id="hero-css">{CSS}</style></head>
<body><div class="fit" id="fit"><!--HERO-->{body}<!--/HERO--></div>
<script id="hero-js">{js}</script>
<script>const q=new URLSearchParams(location.search);const fit=document.getElementById('fit');
function rs(){{const s=Math.min(innerWidth/1920,innerHeight/1080);fit.style.transform=`scale(${{s}}) translate(-50%,-50%)`;fit.style.left='50%';fit.style.top='50%';fit.style.transformOrigin='0 0';fit.style.transform=`translate(-50%,-50%) scale(${{s}})`;fit.style.transformOrigin='50% 50%';}}
rs();addEventListener('resize',rs);window.__hero=initHero(document,{{mode:q.get('render')?'render':'live',skipIntro:!!q.get('loop')}});</script></body></html>'''
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / 'hero.html').write_text(page)
    print('ok', OUT / 'hero.html')


JS = r'''
function initHero(root, opts){
  const $=(s)=>root.querySelector(s), $$=(s)=>[...root.querySelectorAll(s)];
  const INTRO=3.2, P=24, VID=8;
  const LINES=__LINES__;
  // ── 한글 자모 입력(IME) 단계 만들기: ㅎ → 하 → 한
  const CHO=['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
  function steps(ch){const c=ch.charCodeAt(0)-0xAC00; if(c<0||c>11171) return [ch];
    const cho=Math.floor(c/588), jung=Math.floor((c%588)/28), jong=c%28; const base=0xAC00+cho*588+jung*28;
    const s=[CHO[cho], String.fromCharCode(base)]; if(jong) s.push(ch); return s;}
  const seq=[]; LINES.forEach((ln,li)=>{let done=''; for(const ch of ln){ for(const st of steps(ch)) seq.push({li,text:done+st}); done+=ch;} });
  const T0=0.35, T1=1.95;  // 제목 입력 구간
  const h1=$('#h1');
  function typed(t){ if(t>=T1) return LINES.join('\n');
    const k=Math.max(0,Math.min(seq.length-1,Math.floor((t-T0)/(T1-T0)*seq.length))); if(t<T0) return '';
    const s=seq[k]; const lines=LINES.map((l,i)=>i<s.li?l:(i===s.li?s.text:'')); return lines.slice(0,s.li+1).join('\n'); }
  // ── 큰 화면 조립 타일 4×3
  const tiles=$('#tiles'); const TX=4,TY=3, tw=960/TX, th=510/TY; const order=[5,0,10,3,7,1,11,4,8,2,9,6];
  for(let j=0;j<TY;j++) for(let i=0;i<TX;i++){const d=document.createElement('div'); d.className='tile';
    Object.assign(d.style,{left:i*tw+'px',top:j*th+'px',width:tw+'px',height:th+'px',backgroundPosition:`-${i*tw}px -${j*th+30}px`}); tiles.appendChild(d);}
  const tileEls=[...tiles.children];
  const ease=(x)=>x<0?0:x>1?1:1-Math.pow(1-x,3), io=(x)=>x<0?0:x>1?1:(x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2);
  const span=(t,a,b)=>Math.max(0,Math.min(1,(t-a)/(b-a)));
  const mod=(a,n)=>((a%n)+n)%n;
  const rows=$$('.row .track'); const rowW=5*(440+28);
  const vids=$$('video'); const imgs=$$('.card img');
  const plane=$('#plane'), big=$('#big'), arc=$('#arc'), dot=$('#dot'), mo=$('#mo');
  let mx=0,my=0; if(opts.mode==='live'){ root.addEventListener && (root.host||window).addEventListener('mousemove',(ev)=>{mx=(ev.clientX/innerWidth-.5); my=(ev.clientY/innerHeight-.5);}); }
  const show=(el,o,y=0)=>{ if(!el) return; el.style.opacity=o; el.style.transform=y?`translateY(${y}px)`:''; };
  function frame(t){
    const tl=t-INTRO, ph=mod(tl,P);
    // 인트로
    root.querySelector('.grid').style.opacity=0.2+0.8*ease(span(t,0,0.6))*(1-0.6*span(t,2.4,3.2));
    show($('#hdr'),ease(span(t,0.1,0.8)));
    show($('#eb'),ease(span(t,0.2,0.8)),12*(1-ease(span(t,0.2,0.8))));
    const tx=typed(t); h1.innerHTML=tx.replace(/\n/g,'<br>')+(t<2.6&&(Math.floor(t*2.4)%2===0||t<T1)?'<span class="caret"></span>':'');
    show($('#sub'),ease(span(t,1.9,2.6)),18*(1-ease(span(t,1.9,2.6))));
    show($('#ctas'),ease(span(t,2.1,2.8)),18*(1-ease(span(t,2.1,2.8))));
    show($('#kp'),ease(span(t,2.4,3.1)));
    show($('#fee'),ease(span(t,2.5,3.2)),24*(1-ease(span(t,2.5,3.2))));
    tileEls.forEach((el,k)=>{const a=0.55+order.indexOf(k)*0.075, p=io(span(t,a,a+0.42)); el.style.opacity=p; el.style.transform=`translateY(${(1-p)*38}px) scale(${0.96+0.04*p})`;});
    const out=io(span(t,2.15,3.2)); big.style.opacity=(t<0.45?0:1)*(1-out); big.style.transform=`translateZ(0) scale(${1-0.62*out}) translate(${out*140}px,${-out*60}px)`;
    big.style.visibility=out>=1?'hidden':'visible';
    // 작업물 벽(반복): 행마다 한 주기에 정확히 한 세트 이동 → t+P와 t가 같은 화면
    const wallIn=io(span(t,2.0,3.2)); plane.style.opacity=wallIn;
    plane.style.transform=`rotateY(${-24+mx*6}deg) rotateX(${9-my*4}deg) rotateZ(-3deg) translateZ(${(1-wallIn)*-500}px)`;
    rows.forEach((r,i)=>{const f=ph/P*rowW; const x=i%2===0?-f:-rowW+f; r.style.transform=`translate3d(${x}px,0,0)`;});
    imgs.forEach((im,i)=>{const s=1.0+0.05*(0.5-0.5*Math.cos(2*Math.PI*(ph/P)+i)); im.style.transform=`scale(${s})`;});
    // 12개월 다이얼: 한 주기 = 12달, 1달 = 2초. 12월 다음 1월로 이어짐
    const m=ph/P*12, a=m/12; const C=2*Math.PI*58;
    const L=70; arc.setAttribute('stroke-dasharray',`${L} ${C-L}`); arc.setAttribute('stroke-dashoffset',`${-mod(C*a-L,C)}`);  // 점을 따라 도는 꼬리(끊김 없음)
    dot.setAttribute('cx',90+58*Math.sin(2*Math.PI*a)); dot.setAttribute('cy',94-58*Math.cos(2*Math.PI*a));
    mo.textContent=(Math.floor(m)+1)+'월';
    return ph;
  }
  if(opts.mode==='render'){
    return { async renderAt(t){ const ph=frame(t); const vt=t<INTRO?0:mod(t-INTRO,VID);
      await Promise.all(vids.map(v=>new Promise(res=>{ const on=()=>{v.removeEventListener('seeked',on);res();}; v.addEventListener('seeked',on); v.currentTime=vt+1e-4; setTimeout(res,1500);})));
      return ph; }, INTRO, P };
  }
  const start=performance.now()-(opts.skipIntro?INTRO*1000:0);
  vids.forEach(v=>{v.play().catch(()=>{});});
  (function loop(){ frame((performance.now()-start)/1000); requestAnimationFrame(loop); })();
  return {INTRO,P};
}
'''

if __name__ == '__main__':
    build()
