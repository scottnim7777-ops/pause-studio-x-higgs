"""32차 SOOM 광고 7초 편집: 컷1 스포이트 끝 물방울(Kling) → 컷2 젖은 돌 위의 병, 빛이 쓸고 지나감(Kling) → 컷3 같은 장면을 늦춰 브랜드 글자.
글자는 실제 서체(Archivo · MaruBuri)로 얹는다(AI로 그린 글자 없음). 출력 drafts/v32/soom.mp4 (사용자 확인 후 사이트로)"""
import subprocess
from pathlib import Path
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'higgsfield/raw'
OUT = ROOT / 'drafts/v32'
FONTS = ROOT / 'drafts/fonts'
CACHE = Path(__file__).resolve().parent / '.cache'
W, H = 1920, 1080


def ttf(name):
    src = FONTS / name
    if src.suffix != '.woff2':
        return str(src)
    CACHE.mkdir(exist_ok=True)
    dst = CACHE / (src.stem + '.ttf')
    if not dst.exists():
        f = TTFont(str(src)); f.flavor = None; f.save(str(dst))
    return str(dst)


def tracked(d, xy, text, font, track, fill):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=font, fill=fill)
        x += font.getlength(ch) + track


def card():
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    big = ImageFont.truetype(ttf('Archivo-VF.ttf'), 132)
    big.set_variation_by_axes([125, 300])  # 넓고 가는 글자(폭 125, 굵기 300)
    tracked(d, (210, 400), 'SOOM', big, 34, (244, 240, 232, 255))
    small = ImageFont.truetype(ttf('Archivo-VF.ttf'), 21)
    small.set_variation_by_axes([100, 400])
    tracked(d, (216, 568), 'HYDRA SERUM', small, 9, (190, 186, 178, 255))
    ko = ImageFont.truetype(ttf('MaruBuri-Light.woff2'), 44)
    x = 214
    for word in '숨처럼 스미는 수분'.split(' '):  # 마루부리에 띄어쓰기 글자가 없어 낱말마다 따로
        d.text((x, 612), word, font=ko, fill=(236, 232, 224, 255))
        x += ko.getlength(word) + 44 * 0.32
    p = OUT / 'soom-card.png'
    im.save(p)
    return p


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    v1 = RAW / 'v32-soom-v1/v32-soom-v1_01.mp4'
    v2 = RAW / 'v32-soom-v2/v32-soom-v2_01.mp4'
    c = card()
    grade = 'eq=contrast=1.06:saturation=0.9,vignette=PI/5'
    fc = (
        f'[0:v]trim=0.4:3.3,setpts=PTS-STARTPTS,fps=24,settb=1/24,{grade}[a];'
        f'[1:v]trim=0.9:3.6,setpts=PTS-STARTPTS,fps=24,settb=1/24,{grade}[b];'
        f'[1:v]trim=3.56:5.04,setpts=(PTS-STARTPTS)*1.4,fps=24,settb=1/24,{grade},eq=brightness=-0.04[c0];'
        f'[2:v]format=rgba,fade=in:st=0.35:d=0.7:alpha=1[t];'
        f'[c0][t]overlay=0:0:shortest=1,settb=1/24[c];'
        f'[a][b]xfade=transition=fade:duration=0.35:offset=2.55[ab];'
        f'[ab][c]xfade=transition=fade:duration=0.35:offset=4.9,'
        f'noise=alls=5:allf=t,fade=out:st=6.6:d=0.3,format=yuv420p[v]'
    )
    out = OUT / 'soom.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(v1), '-i', str(v2), '-loop', '1', '-t', '2.1', '-i', str(c),
                    '-filter_complex', fc, '-map', '[v]', '-an', '-c:v', 'libx264', '-preset', 'slow', '-crf', '19',
                    '-movflags', '+faststart', '-r', '24', str(out)], check=True)
    print('written', out)


if __name__ == '__main__':
    main()
