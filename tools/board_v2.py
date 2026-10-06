"""2차 시안 비교 보드 → drafts/v2/board.html (캡처: node tools/capture_board.cjs v2)"""
import json
from html import escape as e
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
V2 = ROOT / 'drafts' / 'v2'
LOG = json.loads((V2 / 'composites' / 'capture-log.json').read_text())
D = [
    ('01', '두 개의 원', '편집·타이포그래피 · 밝음', '로고의 두 원 = 한국과 지금 사는 도시. 한지 창과 아침의 오클랜드 항구가 원 안에서 겹친다.', '영상: 원 안 사진만 천천히(소나무 그림자·물결), 원과 글자는 고정'),
    ('02', '밤의 항구', '사진·시네마틱 · 어두움', '푸른 시간의 오클랜드 항구, 가운데 로고. 도시는 위, 문구는 어두운 물 위.', '영상: Seedance로 물 위 반사광·도시 불빛만 움직임, 카메라 고정'),
    ('03', '작업 색인', '실제 작업물 · 중간 밝기', '실제 포트폴리오를 색인처럼. 목록에 올리면 큰 화면이 그 작업으로 바뀐다.', '모션: 목록 호버 → 미리보기 교체, 영상 작업물(Ref.01·02·07)은 실제 영상 재생'),
    ('04', '두 개의 고리', '재료·조형 · 절제된 유채색', '로고의 두 원을 손으로 빚은 도자기 고리로. 올리브 벽, 호두나무, 창빛.', '영상: 창빛이 벽을 따라 천천히 이동, 고리는 정지'),
    ('05', '간섭', '그래픽·광학 · 검정', '로고의 두 원을 동심원으로 넓혀, 겹친 곳에 물결무늬(모아레)가 생긴다.', '모션: 동심원이 바깥으로 퍼지는 코드 애니메이션(가볍고 선명), 마우스로 중심 이동'),
]


def main():
    tiles = ''.join(f'''<figure><img src="composites/hero-{n}_1920x1080.png" alt="시안 {n} {e(name)}">
<figcaption><p class="n">{n}</p><div><h2>{e(name)} <span>{e(cat)}</span></h2><p>{e(idea)}</p><p>{e(mo)}</p><p class="f">서체 · {e(LOG[n]["font"])}</p></div></figcaption></figure>''' for n, name, cat, idea, mo in D)
    logo = (ROOT / 'content/assets/logo/new/vector/pause-studio-logo-ink.svg').read_text().replace('<svg ', '<svg width="300" style="display:block;height:auto" ', 1)
    html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>PAUSE STUDIO 2차 히어로 시안</title><style>
@font-face{{font-family:MaruBuri;src:url(../fonts/MaruBuri-Regular.woff2);font-weight:400}}
@font-face{{font-family:MaruBuri;src:url(../fonts/MaruBuri-Bold.woff2);font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}} body{{width:3520px;background:#E9E6E0;font-family:MaruBuri;color:#151515;padding:90px 104px 104px;word-break:keep-all}}
header{{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:60px}} h1{{font-size:60px;font-weight:700;letter-spacing:-.02em}}
header p{{font-size:24px;color:#555;margin-top:14px}} .g{{display:grid;grid-template-columns:repeat(3,1088px);gap:70px 60px}}
figure img{{width:1088px;height:612px;display:block;box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}}
figcaption{{display:grid;grid-template-columns:80px 1fr;gap:16px;margin-top:24px}} .n{{font-size:54px;line-height:1}}
h2{{font-size:34px;font-weight:700}} h2 span{{font-size:21px;font-weight:400;color:#666;margin-left:10px}}
figcaption p{{font-size:21px;line-height:1.55;color:#333;margin-top:6px}} .f{{color:#6b665d!important;font-size:18px!important}}
.info{{background:#F4F1EB;padding:48px 52px;font-size:21px;line-height:1.7;color:#333}} .info h2{{margin:26px 0 8px}} .info h2:first-of-type{{margin-top:30px}}
</style></head><body>
<header><div><h1>PAUSE STUDIO — 2차 히어로 시안 5종</h1><p>새 로고·실제 원문·실무 서체로 다시 만든 시안. 번호를 고르고 "제작해"라고 하시면 그 방향으로 전체 사이트와 영상을 만듭니다.</p></div>
<div style="text-align:right;font-size:20px;line-height:1.6;color:#555">아트워크: Higgsfield 생성(03은 실제 작업물, 05는 코드 그래픽)<br>문구·로고·버튼: HTML 조판 · 원문은 기존 사이트 그대로</div></header>
<div class="g">{tiles}<div class="info">{logo}
<h2>1차에서 바꾼 것</h2><p>· 사용자 제작 로고·파비콘 적용(벡터)<br>· 흔한 무료 서체 대신 실무 서체 5종(안마다 다르게)<br>· 3D 오브젝트·추상 그래픽 대신 사진·실제 작업물·로고에서 나온 도형</p>
<h2>서체 웹 사용 비용</h2><p>01·02 산돌 웹폰트 월 33,000원부터 · 03 AG 웹폰트 별도 문의 · 04 무료(OFL) · 05 디나모 라이선스 또는 월 €27 대여</p></div></div>
</body></html>'''
    (V2 / 'board.html').write_text(html)
    print('ok')


if __name__ == '__main__':
    main()
