"""19차(18차 흐름 유지 — 패키지가 있는 제품 사진, 레퍼런스처럼 절제된 광고 장면, 실제 앱 같은 알림 아이콘): 문제 → 해결 — 가상의 한인 스킨케어 쇼핑몰 SOOM(실제 업체 아님)
고통: 밤, 후진 쇼핑몰·주문 0건·유지보수비/호스팅 청구 알림 → PAUSE 전환(두 원) → 휴대폰 제품 사진 → AI 홍보영상(초고속 물방울·뉴질랜드 해변)
→ 아침, 새 쇼핑몰(히어로 영상) → 새 주문 알림 + '유지보수비 $0' → 실제 고객 사이트 4곳 → 멈추며 로고(무한 반복)
실행: python3 tools/storyboard_v18.py
"""
import shutil

import cv2
import numpy as np

from storyboard_v4 import ROOT, RAW, composite

V = ROOT / 'drafts' / 'v19'
SCR = V / 'screens' / 'out'
OUT = V / 'shots'
LOOK = dict(grain=2.5, vig_amt=0.06, glow_amt=0.12, soft=0.6, lift=6, reflect=0.05, out_dir=OUT)


def img(name):
    return cv2.imread(str(SCR / f'{name}.png'))


def save(name, im):
    cv2.imwrite(str(OUT / f'{name}.jpg'), im, [cv2.IMWRITE_JPEG_QUALITY, 92])


def phone_close(src, y_css, name, warm=0.0):
    """휴대폰 화면에 바짝 다가간 컷: 화면 일부를 16:9로 크게, 가장자리 초점 흐림·화면 빛·노이즈"""
    im = img(src).astype(np.float32)          # 390x844 @3x
    y0 = int(y_css * 3); h = int(390 * 9 / 16 * 3)
    crop = cv2.resize(im[y0:y0 + h, 0:1170], (1920, 1080), interpolation=cv2.INTER_CUBIC)
    H, W = crop.shape[:2]
    blur = cv2.GaussianBlur(crop, (0, 0), 10)
    yy, xx = np.mgrid[0:H, 0:W]
    m = np.clip((np.sqrt(((xx - W * .45) / (W * .62)) ** 2 + ((yy - H * .5) / (H * .75)) ** 2) - .5) / .45, 0, 1)[..., None]
    out = crop * (1 - m) + blur * m
    out = out * .95 + 6 + np.linspace(14, 0, W)[None, :, None] + warm
    out += np.random.default_rng(5).normal(0, 2.2, (H, W))[..., None]
    save(name, np.clip(out, 0, 255).astype(np.uint8))


def fit(path):
    return cv2.resize(cv2.imread(str(path)), (1920, 1080), interpolation=cv2.INTER_AREA)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    composite('s03-pain-site', 'v18-pain-wide', img('ugly-site'), gain=0.9, **LOOK)
    composite('s04-pain-phone', 'v18-pain-phone', img('pain-notif'), gain=0.95, **LOOK)
    phone_close('pain-notif', 396, 's04b-pain-close')
    save('s06-before', fit(RAW / 'v19-before' / 'v19-before_01.png'))
    save('s07-promo-water', fit(V / 'screens' / 'src' / 'promo_water3.png'))
    save('s08-promo-silk', fit(V / 'screens' / 'src' / 'promo_silk.png'))
    save('s08b-promo-end', fit(SCR / 'promo-endcard.png'))
    composite('s09-new-site', 'v18-solve-wide-r2', img('soom-laptop'), gain=1.0, **LOOK)
    composite('s10-orders-phone', 'v18-solve-phone', img('solve-notif'), gain=1.0, **LOOK)
    phone_close('solve-notif', 566, 's10b-orders-close')
    k = cv2.imread(str(ROOT / 'drafts' / 'v10' / 'screens' / 'src' / 'kvibe_5.png'))
    composite('s13-kvibe', 'v16-kvibe', k[:, :int(k.shape[0] * 1.55)], gain=1.0, **LOOK)
    for src, dst in [(ROOT / 'drafts' / 'v12' / 'shots' / 'c4-home_chemilife.jpg', 's11-chemilife'),
                     (ROOT / 'drafts' / 'v16' / 'shots' / 'c8-workshop_chillenq.jpg', 's12-chillenq'),
                     (ROOT / 'drafts' / 'v12' / 'shots' / 'c7-night_dongdaemun.jpg', 's14-dongdaemun'),
                     (ROOT / 'drafts' / 'v14' / 'shots' / 'loop-1-freeze.jpg', 's15-freeze'),
                     (ROOT / 'drafts' / 'v12' / 'shots' / 'loop-2-logo.jpg', 's01-logo')]:
        shutil.copy(src, OUT / f'{dst}.jpg')


if __name__ == '__main__':
    main()
