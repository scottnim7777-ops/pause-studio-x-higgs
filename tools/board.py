"""비교 보드와 로고 시트 HTML을 만든다 → tools/capture_board.cjs 로 PNG 캡처."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
B = ROOT / 'drafts' / 'board'
B.mkdir(parents=True, exist_ok=True)

DRAFTS = [
    ('01', '쉼표', '편집·타이포그래피', '밝음 · 목화지 + 군청 잉크 · Hahmlet 세리프', '시선: 헤드라인 · 영상: 측광이 종이를 지나며 쉼표의 음영이 깊어짐', 'L1'),
    ('02', '머무는 빛', '사진·시네마틱', '어두움 · 호박빛 × 청흑 · Pretendard ExtraBold', '시선: 빛줄기와 모니터 속 실제 작업물 · 영상: 빛 속 먼지만 움직임', 'L2'),
    ('03', '크리틱 월', '실제 작업물·포트폴리오', '중간 · 벽 + 핀의 빨강 · IBM Plex Sans KR', '시선: 핀으로 꽂은 실제 작업물 11점 · 영상: 빈 벽의 나뭇잎 그림자', 'L3'),
    ('04', '청자 페르마타', '재료·조형', '중간 · 톤온톤 청자 · 고운바탕', '시선: 석고 늘임표 조형 · 영상: 구가 떠오르며 자전', 'L4'),
    ('05', '렌즈', '그래픽·광학', '밝음 · 주홍 × 군청 평행선 · SUIT Heavy', '시선: 선이 비켜난 렌즈 속 문구 · 영상: 선의 물결 흐름', 'L5'),
]
LOGOS = [
    ('L1', 'L1-comma', '쉼표', '원판의 쉼표 + 세리프 대문자', '#DFD8CA', '#151513', True),
    ('L2', 'L2-fermata', '페르마타', '늘임표 호 + 점 · 확장 그로테스크', '#EFE9DF', '#0B0F14', False),
    ('L3', 'L3-index', '색인 대시', 'PAUSE—STUDIO · 대시 위 핀', '#E9E3DD', '#111111', False),
    ('L4', 'L4-arch', '조형 늘임표', '아치 + 떠 있는 점 · 부드러운 세리프', '#BDCCC1', '#2E5446', False),
    ('L5', 'L5-lines', '멈춘 재생 바', '가로선 7줄 PAUSE · 주홍 재생 헤드', '#F5F2EC', '#231CBC', False),
]
FONT = "@font-face{font-family:Pretendard;src:url(../fonts/PretendardVariable.ttf);font-weight:45 930}"


def board():
    tiles = ''.join(f'''
<figure class="t"><img src="../composites/hero-{n}_1920x1080.png" alt="시안 {n} {name}">
<figcaption><p class="n">{n}</p><div><h2>{name} <span>{cat}</span></h2><p>{tone}</p><p>{idea}</p></div>
<span class="lg">로고 {logo}</span></figcaption></figure>'''
                    for n, name, cat, tone, idea, logo in DRAFTS)
    logos = ''.join(f'<div class="l" style="background:{bg}"><img src="../logos/{f}-ink.svg" alt="{k}"><span>{k} {nm}{" · 추천" if rec else ""}</span></div>'
                    for k, f, nm, d, bg, fg, rec in LOGOS)
    html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>PAUSE STUDIO 히어로 시안 보드</title><style>
{FONT}*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:3520px;background:#E8E6E1;font-family:Pretendard;color:#141414;padding:96px 104px 104px;word-break:keep-all}}
header{{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:64px}}
h1{{font-size:64px;font-weight:800;letter-spacing:-.03em}} header p{{font-size:24px;color:#555;margin-top:14px}}
.meta{{text-align:right;font-size:22px;line-height:1.6;color:#555}}
.g{{display:grid;grid-template-columns:repeat(3,1088px);gap:72px 60px}}
.t img:first-child{{width:1088px;height:612px;display:block;box-shadow:0 30px 60px -30px rgba(0,0,0,.35)}}
figcaption{{display:grid;grid-template-columns:84px 1fr auto;gap:18px;align-items:start;margin-top:26px}}
.n{{font-size:56px;font-weight:300;line-height:1;letter-spacing:-.04em}}
h2{{font-size:34px;font-weight:800;letter-spacing:-.03em}} h2 span{{font-size:22px;font-weight:600;color:#666;margin-left:10px}}
figcaption p{{font-size:21px;line-height:1.55;color:#333;margin-top:6px}}
.lg{{font-size:19px;font-weight:700;color:#555;border:1.5px solid #999;padding:8px 12px;white-space:nowrap}}
.logos{{background:#F4F2EE;padding:40px 44px;display:flex;flex-direction:column;gap:14px;height:100%}}
.logos h2{{margin-bottom:6px}}
.l{{height:118px;display:flex;align-items:center;justify-content:space-between;padding:0 30px}}
.l img{{max-height:48px;max-width:360px}} .l span{{font-size:20px;font-weight:700}}
</style></head><body>
<header><div><h1>PAUSE STUDIO — 히어로 시안 5종</h1><p>번호를 고르고 "제작해"라고 하시면 그 방향으로 전체 사이트와 영상을 제작합니다.</p></div>
<div class="meta">아트워크: Higgsfield 생성 · 문구·로고·버튼: HTML 조판<br>원문은 기존 사이트 그대로 · 1920×1080 원본: drafts/composites</div></header>
<div class="g">{tiles}<div class="logos"><h2>로고안 5종 <span>방향별 설계</span></h2>{logos}</div></div>
</body></html>'''
    (B / 'board.html').write_text(html)


def logo_sheet():
    rows = ''.join(f'''<section><div class="c" style="background:{bg}"><img src="../logos/{f}-ink.svg" alt="{k} 밝은 배경"></div>
<div class="c" style="background:{fg}"><img src="../logos/{f}-paper.svg" alt="{k} 어두운 배경"></div>
<div class="d"><h2>{k} {nm}{' <em>추천</em>' if rec else ''}</h2><p>{d}</p></div></section>'''
                   for k, f, nm, d, bg, fg, rec in LOGOS)
    html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>PAUSE STUDIO 로고안</title><style>
{FONT}*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:2400px;background:#EEECE8;font-family:Pretendard;color:#141414;padding:80px;word-break:keep-all}}
h1{{font-size:52px;font-weight:800;letter-spacing:-.03em}} .sub{{font-size:22px;color:#555;margin:12px 0 48px}}
section{{display:grid;grid-template-columns:860px 860px 1fr;gap:20px;margin-bottom:20px}}
.c{{height:220px;display:flex;align-items:center;justify-content:center}} .c img{{max-height:84px;max-width:640px}}
.d{{padding:28px 10px}} h2{{font-size:32px;font-weight:800;letter-spacing:-.03em}} h2 em{{font-style:normal;background:#141414;color:#fff;font-size:18px;padding:5px 10px;margin-left:8px;vertical-align:middle}}
.d p{{font-size:20px;line-height:1.5;color:#444;margin-top:10px}}
</style></head><body><h1>로고안 5종 — 밝은·어두운 배경</h1>
<p class="sub">Higgsfield(Ideogram 4.0)로 방향을 탐색한 뒤 벡터로 직접 구성 · 글자는 윤곽선(path) 변환 · 기존 로고 미사용 · ⏸ 아이콘형은 동종 업체와 겹쳐 회피</p>
{rows}</body></html>'''
    (B / 'logos.html').write_text(html)


if __name__ == '__main__':
    board()
    logo_sheet()
    print('ok')
