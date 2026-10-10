"""9차 AI 광고영상 샘플을 사이트 자료로 마무리(2026-10-09)
- BEFORE: '사장님이 보내 주실 법한' 평범한 휴대폰 사진(생성 v31-*-before) → 4:3 1200×900
  AI가 만든 뜻 없는 글자는 보이지 않게: 자판 글자는 살짝 흐리게, 상자 옆 필기체는 지움, 컵 글자는 잘라냄
- 포스터: 완성 영상에서 그 영상다운 한 장면(1280×720)
- 영상: 완성본(웹용 CRF 28 · 잡티 줄임)을 site/public/media/film/<key>.mp4 로
실행: python tools/adv31/finish.py --films <렌더 결과 폴더>   (폴더 안: pause.mp4 mireille.mp4 soom.mp4 bam.mp4)
"""
import argparse, shutil, subprocess
from pathlib import Path
import numpy as np, cv2
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / 'higgsfield/raw'
OUT = ROOT / 'site/public/media/film'
# 포스터 시각(초): 투사된 로고 · 금박 간판 · 물방울 접사 · 켜진 네온
POSTER_T = {'pause': 3.0, 'mireille': 2.4, 'soom': 6.0, 'bam': 11.6}


def save43(im, name):
    im = im.convert('RGB').resize((1200, 900), Image.LANCZOS)
    im.save(OUT / name, 'JPEG', quality=84, optimize=True, progressive=True)


def befores():
    # PAUSE: 회색 책상 위 빈 명함 세 장 — 왼쪽 4:3, 오른쪽 노트북 자판 글자는 읽히지 않게 살짝 흐림
    a = np.asarray(Image.open(RAW / 'v31-p-before/v31-p-before.png').convert('RGB')).astype(np.float32)
    c = a[:, 200:1736].copy()
    H, W = c.shape[:2]
    m = np.zeros((H, W), np.float32)
    cv2.fillPoly(m, [np.array([[1000, H], [W, 420], [W, H]], np.int32)], 1.0)
    cv2.rectangle(m, (1050, 560), (W, H), 1.0, -1)
    m = cv2.GaussianBlur(m, (0, 0), 25)[..., None]
    c = c * (1 - m) + cv2.GaussianBlur(c, (0, 0), 2.6) * m
    save43(Image.fromarray(np.clip(c, 0, 255).astype(np.uint8)), 'pause-before.jpg')
    # SOOM: 사무실 책상 위 스포이트 병(오른쪽 자판은 잘라냄)
    save43(Image.open(RAW / 'v31-s-before2/v31-s-before2.png').crop((300, 255, 1300, 1005)), 'soom-before.jpg')
    # MIREILLE: 분홍 상자 옆면의 뜻 없는 필기체만 지움(분홍 면보다 밝은 가는 획 → 인페인트, 라즈베리 쪽은 그대로)
    im = np.asarray(Image.open(RAW / 'v31-b-before3/v31-b-before3.png').convert('RGB'))
    x0, y0, x1, y1 = 560, 760, 1260, 1320
    L = cv2.cvtColor(im[y0:y1, x0:x1], cv2.COLOR_RGB2LAB)[..., 0].astype(np.float32)
    txt = ((L - cv2.medianBlur(L.astype(np.uint8), 21).astype(np.float32)) > 9).astype(np.uint8)
    hsv = cv2.cvtColor(im[y0:y1, x0:x1], cv2.COLOR_RGB2HSV)
    pink = cv2.morphologyEx((((hsv[..., 0] > 150) | (hsv[..., 0] < 10)) & (hsv[..., 1] > 60)).astype(np.uint8), cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
    txt = txt & pink
    yy, xx = np.mgrid[y0:y1, x0:x1]
    txt[(xx > 1120) & (yy < 1060)] = 0
    txt = cv2.dilate(txt, np.ones((5, 5), np.uint8))
    out = im.copy()
    out[y0:y1, x0:x1] = cv2.inpaint(im[y0:y1, x0:x1], txt, 6, cv2.INPAINT_TELEA)
    save43(Image.fromarray(out), 'mireille-before.jpg')
    # 밤국수: 흰 식탁 위 국수 한 그릇(글자 있는 컵·냅킨통은 잘라냄)
    save43(Image.open(RAW / 'v31-n-before/v31-n-before.png').crop((739, 170, 2048, 1152)), 'bam-before.jpg')


def frame_at(video: Path, t: float) -> Image.Image:
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', str(video), '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'],
                         check=True, capture_output=True).stdout
    import io
    return Image.open(io.BytesIO(raw)).convert('RGB')


def install(films: Path):
    for key, t in POSTER_T.items():
        src = films / f'{key}.mp4'
        dst = OUT / f'{key}.mp4'
        if src.resolve() != dst.resolve():
            shutil.copyfile(src, dst)
        frame_at(dst, t).resize((1280, 720), Image.LANCZOS).save(OUT / f'{key}-poster.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
        print(key, round(dst.stat().st_size / 1e6, 2), 'MB')


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--films', default=str(OUT))
    a = ap.parse_args()
    OUT.mkdir(parents=True, exist_ok=True)
    befores()
    install(Path(a.films))


if __name__ == '__main__':
    main()
