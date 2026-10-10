"""32차 SOOM UGC 7초: Seedance 2.0(720p, 소리 포함) 원본 → 1080p로 키우고 마지막 1.4초에 작은 브랜드 꼬리표(실제 서체). 출력 drafts/v32/soom-ugc.mp4"""
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
from soom import ttf, tracked, ROOT, OUT

SRC = ROOT / 'higgsfield/raw/v32-soom-ugc-v1-720/v32-soom-ugc-v1-720_01.mp4'


def tag():
    im = Image.new('RGBA', (1920, 1080), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    big = ImageFont.truetype(ttf('Archivo-VF.ttf'), 64)
    big.set_variation_by_axes([125, 300])
    tracked(d, (1440, 880), 'SOOM', big, 18, (250, 247, 240, 255))
    small = ImageFont.truetype(ttf('Archivo-VF.ttf'), 18)
    small.set_variation_by_axes([100, 450])
    tracked(d, (1444, 962), 'HYDRA SERUM', small, 8, (250, 247, 240, 235))
    p = OUT / 'soom-ugc-tag.png'
    im.save(p)
    return p


def main():
    t = tag()
    fc = ('[0:v]scale=1920:1080:flags=lanczos,fps=24[v0];'
          '[1:v]format=rgba,fade=in:st=5.6:d=0.5:alpha=1[t];'
          '[v0][t]overlay=0:0:shortest=1,format=yuv420p[v]')
    out = OUT / 'soom-ugc.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(SRC), '-loop', '1', '-t', '7.07', '-i', str(t), '-filter_complex', fc,
                    '-map', '[v]', '-map', '0:a?', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-b:a', '128k',
                    '-movflags', '+faststart', str(out)], check=True)
    print('written', out)


if __name__ == '__main__':
    main()
