"""한글 서체 후보 비교 보드 → drafts/fonts/board.html (캡처: node tools/capture_board.cjs fonts)
견본 이미지는 tools/font_specimens.cjs 가 폰트 회사 공식 테스터 글꼴로 조판·캡처한 것."""
import json
from html import escape as e
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
F = ROOT / 'drafts' / 'fonts'
LOG = json.loads((F / 'specimens' / 'specimens.json').read_text())
SANDOLL = '웹: 산돌구름 웹폰트 스탠다드 월 33,000원(폰트 2종·월 5GB) · 첫 1개월 무료 체험'

GROUPS = [
    ('A', '제목·브랜드 인상이 강한 서체', [
        ('favorit-hangul', 'ABC Favorit Hangul', '디나모(Dinamo, 스위스) · 한글 디자인 윤민구',
         '낮은 대비의 기하학 그로테스크. 영문 Favorit과 한 가족이라 한·영 병기가 자연스럽다.',
         'Fonts In Use 상위 서체 목록에 ABC Favorit(라틴) 111건 — 세계 디자인 스튜디오가 많이 쓰는 폰트 회사.',
         '웹: 디나모 라이선스(회사 인원 기준 견적) 또는 Fontstand 대여 월 €27(전 스타일, 데스크톱+웹)', '대안 ②'),
        ('ortank-hangeul', 'Ortank Hangeul', '로올(lo-ol, 스위스·한국) · 이노을',
         '라틴 Ortank의 한글판. 굵기·대비·광학 크기 가변. 단단하고 현대적인 그로테스크.', '',
         '웹: 스타일당 CHF 70부터(사용 규모별) — 2종이면 CHF 140부터', ''),
        ('sd-gyeokdong-gothic2', 'SD 격동고딕2', '산돌 · 김초롱·강주연·성준석·장수영 · 2021',
         '네모틀을 꽉 채운 굵은 제목용 고딕(원작 2014). 짧은 문구에서 힘이 가장 세다.',
         '원작 격동고딕: 산돌구름 검색 1위(2022.11~2023.10, 산돌 발표).', SANDOLL, ''),
        ('sd-gyeokdong-myeongjo2', 'SD 격동명조2', '산돌 · 박부미·최성우·구모아 · 2023',
         '활판 명조의 붓 맺음을 현대적으로 다듬은 제목용 명조. 좁은·기본·넓은 폭 15종.', '', SANDOLL, '대안 ① 제목'),
    ]),
    ('B', '본문·UI까지 겸하는 서체', [
        ('sd-greta-sans', 'SD 그레타산스', '타이포테크(네덜란드) × 산돌 · 피터 빌락·위예진·이수현·김초롱 · 2023(원작 2020)',
         '손글씨 뼈대의 휴머니스트 산스. 넉넉한 속공간과 자간으로 편하게 읽힌다. 한글 11,172자 · 20종.',
         '흔한 기하학 고딕과 뼈대가 달라 첫인상이 다르다. 영문 Greta Sans와 한 가족.', SANDOLL, '추천'),
        ('sd-minburi', 'SD 민부리', '산돌 · 이유빈·김지수·이수현·노은유·김진희 · 2024',
         '고딕Neo를 잇는 화면용 본문 민부리. 획 끝의 작은 부리, 굵기·한글 간격·영문 간격 가변.', '', SANDOLL, '대안 ① 본문'),
        ('ag-choijeongho-minburi-screen', 'AG 최정호 민부리 스크린', 'AG타이포그라피연구소 · 디자인 박한솔 · 2024 (원도 최정호)',
         '한글 글자꼴의 기준을 세운 최정호의 민부리를 화면용으로 재설계. 단정하고 품위 있는 인상, 단일 굵기.', '',
         '기본 라이선스 350,000원(인쇄·웹 이미지용) — 웹폰트(임베딩)는 별도 문의', ''),
        ('sd-jeongche', 'SD 정체', '산돌 · 박수현·송미언·김초롱 · 2025',
         '문학적인 본문 활자. 590·690은 제목용 볼드. 뼈대(시대)·무게·너비를 세 자리 숫자로 고른다.', '', SANDOLL, ''),
        ('sandoll-gothic-neo1', 'Sandoll 고딕Neo1', '산돌 · 권경석·이도경 · 2011',
         '실무 표준 고딕. 애플 기기 기본 한글 서체(Apple SD 산돌고딕 Neo)의 바탕.',
         'Fonts In Use ‘Korean/Hangul’ 태그 최근 59건 중 11건 — 가장 많이 쓰인 한글 서체.', SANDOLL, ''),
    ]),
    ('C', '무료(예산형)', [
        ('maru-buri', '마루 부리', '네이버',
         '현대적인 부리(명조). 차분하고 단정하다.', '', '무료 — 네이버 글꼴 OFL, 웹 포함 상업 사용 가능', ''),
        ('eulyoo1945', '을유1945', '을유문화사',
         '책 본문 활자의 결. 2종(Regular·SemiBold).', 'LDK.DT 전시 ‘Our Shelter’ 아이덴티티에 사용(Fonts In Use).',
         '무료 — 웹페이지 사용 가능, 폰트 파일 재배포·판매 불가', ''),
    ]),
]


def tile(fid, name, maker, trait, proof, cost, badge):
    styles = LOG.get(fid, {}).get('styles', '')
    url = LOG.get(fid, {}).get('url', '')
    b = f'<span class="badge{" rec" if badge == "추천" else ""}">{e(badge)}</span>' if badge else ''
    return f'''<figure><img src="specimens/{fid}.png" alt="{e(name)} 견본">
<figcaption><h3>{e(name)}{b}</h3><p class="mk">{e(maker)}</p><p>{e(trait)}</p>{f'<p class="pf">{e(proof)}</p>' if proof else ''}
<p class="cost">{e(cost)}</p><p class="meta">견본 스타일 {e(styles)} · {e(url)}</p></figcaption></figure>'''


def main():
    sections = ''.join(
        f'<section><h2><span>{k}</span>{e(title)}</h2><div class="g">{"".join(tile(*t) for t in items)}</div></section>'
        for k, title, items in GROUPS)
    html = f'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>PAUSE STUDIO 한글 서체 후보</title><style>
@font-face{{font-family:MaruBuri;src:url(MaruBuri-Regular.woff2);font-weight:400}}
@font-face{{font-family:MaruBuri;src:url(MaruBuri-SemiBold.woff2);font-weight:600}}
@font-face{{font-family:MaruBuri;src:url(MaruBuri-Bold.woff2);font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
body{{width:2400px;background:#E9E7E1;color:#151515;font-family:MaruBuri;padding:96px 90px 110px;word-break:keep-all}}
h1{{font-size:62px;font-weight:700;letter-spacing:-.02em}}
.lead{{font-size:24px;line-height:1.65;color:#3c3c3c;margin-top:18px;max-width:1900px}}
.rec{{margin:44px 0 20px;background:#151515;color:#F2F0EB;padding:40px 48px;display:grid;grid-template-columns:1fr 1fr;gap:18px 60px}}
.rec h2{{grid-column:1/-1;font-size:34px;font-weight:700}} .rec p{{font-size:22px;line-height:1.6;color:#dcd9d2}} .rec b{{color:#fff;font-weight:700}}
section{{margin-top:72px}} section>h2{{font-size:36px;font-weight:700;display:flex;align-items:center;gap:16px;border-bottom:2px solid #151515;padding-bottom:16px;margin-bottom:36px}}
section>h2 span{{display:inline-block;width:46px;height:46px;background:#151515;color:#F2F0EB;text-align:center;line-height:46px;font-size:26px}}
.g{{display:grid;grid-template-columns:repeat(2,1090px);gap:56px 40px}}
figure img{{width:1090px;height:436px;display:block;border:1px solid #cfccc4}}
figcaption{{padding-top:20px}} h3{{font-size:32px;font-weight:700;letter-spacing:-.01em;display:flex;align-items:center;gap:14px}}
.badge{{font-size:18px;border:1.5px solid #151515;padding:5px 12px;font-weight:600}} .badge.rec{{background:#C4381F;border-color:#C4381F;color:#fff;margin:0;display:inline-block;grid-template-columns:none;padding:5px 12px}}
figcaption p{{font-size:21px;line-height:1.6;margin-top:8px;color:#2a2a2a}} .mk{{color:#666!important;font-size:19px!important}}
.pf{{color:#1d4d3a!important}} .cost{{font-weight:600;color:#151515!important}} .meta{{font-size:15px!important;color:#8a8780!important;margin-top:10px!important}}
.foot{{margin-top:80px;border-top:2px solid #151515;padding-top:28px;font-size:19px;line-height:1.75;color:#444;columns:2;column-gap:60px}}
.foot b{{color:#151515}}
</style></head><body>
<h1>한글 서체 후보 11종 — 실제 문구로 비교</h1>
<p class="lead">모두 같은 문구·같은 크기(제목 96px · 설명 27px)로 조판했습니다. 각 폰트 회사 공식 페이지의 테스터 글꼴을 그 페이지 안에서 불러와 캡처했습니다(폰트 파일은 내려받지 않음). 1차 시안에 썼던 프리텐다드·SUIT·IBM Plex Sans KR·고운바탕·함렛은 모두 뺐습니다.</p>
<div class="rec"><h2>추천 — SD 그레타산스 (제목 SemiBold · 본문 Regular)</h2>
<p><b>읽기 편한 한국어</b> — 손글씨 뼈대의 넉넉한 형태라 대표님들이 긴 설명·가격·FAQ까지 편하게 읽는다. 브리프의 ‘한국어 문구 자체가 아름답고 편하게 읽히는 조판’에 가장 가깝다.</p>
<p><b>흔하지 않은 첫인상</b> — 요즘 사이트 대부분이 쓰는 기하학 고딕과 뼈대가 달라 ‘어디서 본 듯한’ 인상을 피한다. 영문 Greta Sans와 한 가족.</p>
<p><b>한 가족으로 사이트 전체</b> — 한글 11,172자·20종이라 제목부터 버튼·표까지 한 가족으로 정돈된다.</p>
<p><b>비용</b> — 산돌구름 웹폰트 스탠다드 월 33,000원에 2종까지. 제목용 개성 서체 1종을 더할 여유가 있다.</p>
<p><b>대안 ① 개성</b> — 제목 SD 격동명조2 + 본문 SD 민부리(같은 요금제로 2종). <b>대안 ②</b> 국제 스튜디오 톤 — ABC Favorit Hangul.</p>
<p><b>확정 시점</b> — 로고를 받은 뒤 로고 글자와 어울리는지 보고 최종 결정합니다.</p></div>
{sections}
<div class="foot">
<p><b>조사 방법</b> — Fonts In Use의 ‘Korean/Hangul’ 태그(전체 172건) 중 최근 59건에서 실제 한국 디자인 스튜디오(일상의실천·플러스엑스·아워미닛세컨즈 등)가 쓴 한글 서체를 집계하고, 산돌구름·AG·디나모·타이포테크·로올 공식 페이지에서 디자이너·스타일·웹 사용 조건·가격을 확인했습니다.</p>
<p><b>지백(활자모 박진현)</b> — 워크룸(서울시향 2024)·워터레인(Docking! 웹사이트)·돈워리베이비가 쓴 본문용 민부리. 정식 판매 여부를 확인하지 못해 후보에서 뺐습니다(디자이너 문의 필요).</p>
<p><b>라이선스 주의</b> — 로고에 폰트를 쓰려면 CI·BI 허용 여부를 따로 확인해야 합니다(산돌 이용권은 허용, AG는 별도 문의). 웹폰트는 요금제의 월 전송량(트래픽) 한도가 있습니다.</p>
<p><b>출처</b> — fontsinuse.com/tags/3836 · sandollcloud.com(각 폰트 페이지·웹폰트 요금) · agfont.com · abcdinamo.com/typefaces/favorit-hangul · fontstand.com · typotheque.com/fonts/korean · lo-ol.design · noonnu.cc · 2026-09-29 확인</p>
</div>
</body></html>'''
    (F / 'board.html').write_text(html)
    print('ok', F / 'board.html')


if __name__ == '__main__':
    main()
