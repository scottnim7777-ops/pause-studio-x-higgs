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
    'ref03': 'ref03_Cv2GPxw.png', 'ref05': 'ref05_4YPzZUq.png', 'ref06': 'ref06_861Pj3J.png', 'ref08': 'ref08_YUCUmWL.png',
    'ref09': 'ref09_fzysfi8.png', 'ref10': 'ref10_D2c9apB.jpeg', 'ref11': 'ref11_Ezo1VXP.png', 'ref12': 'ref12_oFU3GVl.png',
    'ref13': 'ref13_wOWQVnI.png', 'ref14': 'ref14_4BR1I0w.png', 'ref15': 'ref15_EUz1qvV.png', 'chillenq': 'chillenq_desktop_hero.webp',
}
VIDEOS = {'ref01': 'ref01_KIKzZuF.mp4', 'ref02': 'ref02_PVuptes.mp4', 'ref04': 'ref04_MnSmLdO.gif', 'ref07': 'ref07_70IgQpR.mp4'}

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
    what = sys.argv[1:] or ['work', 'film', 'brand', 'og']
    for w in what:
        if w.startswith('og='):  # og=<다른 히어로 화면 PNG>
            og(Path(w[3:]).resolve())
            continue
        globals()[w]()
    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=1) + '\n')
    print('기록:', MANIFEST.relative_to(ROOT))
