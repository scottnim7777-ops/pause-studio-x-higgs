"""사이트용 미디어 만들기: 원본(저장소 안) → site/public (크기별 JPEG·WebP, MP4) + src/content/media.json(실제 크기 기록)

실행: python3 site/scripts/media.py            (전체)
      python3 site/scripts/media.py film       (AI 영상광고 예시만)
      python3 site/scripts/media.py og=<PNG>   (공유 미리보기 이미지를 다른 화면으로)
필요: Pillow, ffmpeg

- 포트폴리오 원본은 고객 사이트의 실제 화면(content/assets/portfolio/originals). Ref.16~39는 소유 확인 전이라 쓰지 않는다.
- 영상은 H.264 MP4(소리 없음, faststart) — 모든 브라우저에서 재생. 미리보기 사진은 영상의 첫 장면.
- SOOM은 가상 브랜드(시안용 생성 이미지). 사이트에는 '예시 · 실제 고객 작업물 아님'으로 표시한다.
"""
from pathlib import Path
import json, shutil, subprocess, sys
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
SITE = ROOT / 'site'
PUB = SITE / 'public'
ORIG = ROOT / 'content/assets/portfolio/originals'
LOGO = ROOT / 'content/assets/logo/new'
MANIFEST = SITE / 'src/content/media.json'

STILLS = {  # 사이트 이름: 원본 파일
    'ref05': 'ref05_4YPzZUq.png', 'ref06': 'ref06_861Pj3J.png', 'ref08': 'ref08_YUCUmWL.png',
    'ref09': 'ref09_fzysfi8.png', 'ref10': 'ref10_D2c9apB.jpeg', 'ref11': 'ref11_Ezo1VXP.png', 'ref12': 'ref12_oFU3GVl.png',
    'ref13': 'ref13_wOWQVnI.png', 'ref14': 'ref14_4BR1I0w.png', 'ref15': 'ref15_EUz1qvV.png',
    # chillenq: 2026-10-09부터 받은 화면 녹화(LOOPS). 예전 정지 화면 chillenq_desktop_hero.webp는 originals에 기록으로만 둠
}
VIDEOS = {'ref01': 'ref01_KIKzZuF.mp4', 'ref04': 'ref04_MnSmLdO.gif', 'ref07': 'ref07_70IgQpR.mp4'}
# ref02(커스텀 케이크 BLOOMING): 2026-10-09부터 받은 화면 녹화(LOOPS). 예전 800×448 영상 ref02_PVuptes.mp4는 originals에 기록으로만 둠
# 사용자가 2026-10-08에 준 화면 녹화(소리 제거·고화질 재인코딩 보관): 동대문(Ref.03 사진 대신), 컨템퍼러리 타투 스튜디오(새 레퍼런스)
# 처음과 끝 장면이 달라 반복할 때 튀므로, 끝 1초를 처음 장면으로 겹쳐(크로스페이드) 이음새 없이 반복
# 2026-10-09: 냉장·냉동 설비(ChillenQ, Ref.17) 화면 녹화 추가(원본 2384×1200·소리 있음 → 소리 빼고 1920 폭으로 보관)
# 2026-10-09: 커스텀 케이크(BLOOMING, Ref.02) 화면 녹화(원본 1596×810·16초·소리 있음 → 소리 빼고 그대로 크기로 보관)
LOOPS = {'ref03': 'ref03_ddm_hero_2026-10-08.mp4', 'unframe': 'unframe_hero_2026-10-08.mp4', 'chillenq': 'chillenq_hero_2026-10-09.mp4',
         'ref02': 'ref02_blooming_hero_2026-10-09.mp4'}
# 겹치는 길이(초). BLOOMING은 첫 장면과 끝 장면이 같은 케이크라, 사이트 자체의 장면 전환(0.43초)이 시작되기 전 0.4초만 겹친다
FADE = {'ref02': 0.4}

manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}


def rgb(im: Image.Image) -> Image.Image:
    if im.mode in ('RGBA', 'LA', 'P'):
        im = im.convert('RGBA')
        bg = Image.new('RGB', im.size, (12, 12, 11))
        bg.paste(im, mask=im.split()[-1])
        return bg
    return im.convert('RGB')


def fit(im: Image.Image, w: int, box: int | None = None) -> Image.Image:
    """가로 w(원본보다 크게 늘리지 않음). box가 있으면 긴 변도 box 이하."""
    s = min(1.0, w / im.width)
    if box:
        s = min(s, box / max(im.width, im.height))
    if s >= 1.0:
        return im.copy()
    return im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)


def save_pair(im: Image.Image, base: Path, q=82):
    base.parent.mkdir(parents=True, exist_ok=True)
    im.save(base.with_suffix('.jpg'), 'JPEG', quality=q, optimize=True, progressive=True)
    im.save(base.with_suffix('.webp'), 'WEBP', quality=q - 2, method=6)


def sizes(name: str, im: Image.Image, out_dir: Path, small=880, big=1920, big_box=1920):
    """name-880 / name-1920 (JPEG+WebP) — 기록은 실제 픽셀 크기"""
    rec = {}
    for tag, w, box in (('880', small, None), ('1920', big, big_box)):
        r = fit(im, w, box if tag == '1920' else None)
        save_pair(r, out_dir / f'{name}-{tag}')
        rec[tag] = [r.width, r.height]
    manifest[f'/{out_dir.relative_to(PUB).as_posix()}/{name}'] = rec
    print(f'  {name}: 880→{rec["880"]} 1920→{rec["1920"]}')


def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-v', 'error', '-y', *args], check=True)


def video_mp4(src: Path, dst: Path, width=1280, crf=27):
    dst.parent.mkdir(parents=True, exist_ok=True)
    vf = f"scale='min({width},iw)':-2:flags=lanczos,format=yuv420p"
    ffmpeg('-i', str(src), '-an', '-vf', vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf), '-profile:v', 'high',
           '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dst))
    print(f'  {dst.name}: {dst.stat().st_size / 1e6:.2f} MB')


def video_loop(src: Path, dst: Path, width=1280, crf=26, fade=1.0):
    """끝 fade초를 처음 장면으로 겹쳐 이음새 없는 반복 영상(길이 = 원본 - fade)"""
    dur = float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(src)],
                               capture_output=True, text=True, check=True).stdout.strip())
    dst.parent.mkdir(parents=True, exist_ok=True)
    sc = f"scale='min({width},iw)':-2:flags=lanczos,format=yuv420p"
    fc = (f'[0:v]split[a][b];[a]trim=start={fade}:end={dur},setpts=PTS-STARTPTS[m];'
          f'[b]trim=start=0:end={fade},setpts=PTS-STARTPTS[h];'
          f'[m][h]xfade=transition=fade:duration={fade}:offset={dur - 2 * fade:.3f},{sc}[v]')
    ffmpeg('-i', str(src), '-filter_complex', fc, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', str(crf),
           '-profile:v', 'high', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', str(dst))
    print(f'  {dst.name}: {dst.stat().st_size / 1e6:.2f} MB (반복 이음새 {fade}s)')


def first_frame(src: Path, t=0.0) -> Image.Image:
    tmp = SITE / '.cache' / (src.stem + '.png')
    tmp.parent.mkdir(exist_ok=True)
    ffmpeg('-ss', str(t), '-i', str(src), '-frames:v', '1', str(tmp))
    return Image.open(tmp).convert('RGB')


def work():
    print('포트폴리오 사진')
    out = PUB / 'media/work'
    for name, f in STILLS.items():
        sizes(name, rgb(Image.open(ORIG / f)), out)
    print('포트폴리오 영상')
    for name, f in VIDEOS.items():
        video_mp4(ORIG / f, out / f'{name}.mp4')
        sizes(name, first_frame(ORIG / f), out)
    for name, f in LOOPS.items():
        loop(name, f, out)


def loop(name: str, f: str, out: Path):
    fade = FADE.get(name, 1.0)
    video_loop(ORIG / f, out / f'{name}.mp4', fade=fade)
    sizes(name, first_frame(ORIG / f, t=fade), out)  # 반복 영상의 첫 장면 = 원본의 겹침 길이 지점(원본 해상도)


def film():
    print('AI 영상광고 예시(가상 브랜드 SOOM)')
    raw = ROOT / 'higgsfield/raw'
    out = PUB / 'media/film'
    out.mkdir(parents=True, exist_ok=True)
    before = rgb(Image.open(raw / 'v19-before/v19-before_01.png'))
    # 책상 사진은 4:3으로(제품이 가운데 오도록 좌우를 잘라냄)
    w = round(before.height * 4 / 3)
    x = (before.width - w) // 2
    b = fit(before.crop((x, 0, x + w, before.height)), 1200)
    b.save(out / 'before-1200.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
    manifest['/media/film/before-1200'] = {'1200': [b.width, b.height]}
    poster = fit(rgb(Image.open(raw / 'v19-promo-water2/v19-promo-water2_01.png')), 1600)
    poster.save(out / 'soom-poster.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
    manifest['/media/film/soom-poster'] = {'1600': [poster.width, poster.height]}
    clip = sorted((raw / 'site-film-soom').glob('*.mp4')) if (raw / 'site-film-soom').exists() else []
    if clip:
        video_mp4(clip[0], out / 'soom.mp4', width=1280, crf=23)
        # 영상의 첫 장면을 포스터로(영상이 시작될 때 화면이 튀지 않게)
        p = fit(first_frame(out / 'soom.mp4'), 1600)
        p.save(out / 'soom-poster.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
        manifest['/media/film/soom-poster'] = {'1600': [p.width, p.height]}
    else:
        print('  soom.mp4 없음 — 사진만 사용')


def compare():
    """BEFORE/AFTER 비교의 '흔한 템플릿' 예시 화면에 쓰는 평범한 스톡 느낌 사진(생성, higgsfield/raw/v30-mock-*)"""
    print('비교용 템플릿 사진')
    out = PUB / 'media/compare'
    for name, lbl in {'mock-travel': 'v30-mock-travel', 'mock-cake': 'v30-mock-cake'}.items():
        sizes(name, rgb(Image.open(next((ROOT / 'higgsfield/raw' / lbl).glob('*.png')))), out)


def brand():
    print('로고·파비콘·QR')
    (PUB / 'brand').mkdir(parents=True, exist_ok=True)
    shutil.copyfile(LOGO / 'vector/pause-studio-logo-cream.svg', PUB / 'brand/logo-cream.svg')
    fav = LOGO / 'favicon'
    shutil.copyfile(fav / 'favicon.svg', PUB / 'favicon.svg')
    shutil.copyfile(fav / 'favicon.ico', PUB / 'favicon.ico')
    shutil.copyfile(fav / 'png/apple-touch-icon-180.png', PUB / 'apple-touch-icon.png')
    shutil.copyfile(fav / 'png/favicon-192.png', PUB / 'icon-192.png')
    shutil.copyfile(fav / 'png/favicon-512.png', PUB / 'icon-512.png')
    shutil.copyfile(fav / 'png/icon-maskable-512.png', PUB / 'icon-maskable-512.png')
    (PUB / 'media').mkdir(exist_ok=True)
    shutil.copyfile(ROOT / 'content/assets/other/kakao-qr_from-repo-base64_233x236.png', PUB / 'media/kakao-qr.png')


def og(src=ROOT / 'docs/preview/pc-1440-first-screen.jpg'):
    """공유 미리보기 1200×630 — 실제 산돌 서체로 그린 첫 화면(tests/preview.cjs 결과)의 위쪽"""
    print('공유 미리보기 이미지', src.relative_to(ROOT))
    im = rgb(Image.open(src))
    h = round(im.width * 630 / 1200)
    im.crop((0, 0, im.width, h)).resize((1200, 630), Image.LANCZOS).save(PUB / 'og.jpg', 'JPEG', quality=86, optimize=True, progressive=True)


if __name__ == '__main__':
    what = sys.argv[1:] or ['work', 'compare', 'film', 'brand', 'og']
    if what[:1] == ['loops']:  # 반복 영상만(loops chillenq 처럼 이름을 주면 그것만)
        out = PUB / 'media/work'
        for name, f in LOOPS.items():
            if what[1:] and name not in what[1:]:
                continue
            loop(name, f, out)
        what = []
    for w in what:
        if w.startswith('og='):  # og=<다른 히어로 화면 PNG>
            og(Path(w[3:]).resolve())
            continue
        globals()[w]()
    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=1) + '\n')
    print('기록:', MANIFEST.relative_to(ROOT))
