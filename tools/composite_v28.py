"""28차: Higgsfield가 찍은 '빈 흰 화면' 장면에 실제 고객 작업물을 원근 합성.
- 화면 찾기: 밝은 영역 중 가장 큰 덩어리 → 네 모서리(직접 지정 가능)
- 빛: 원래 흰 화면의 밝기 고르지 않음(가장자리 감광)·미세 질감(빗방울·먼지)을 작업물 위에 다시 얹음
- 번짐: 화면이 비추던 주변(벽·바닥)을 작업물의 평균 색으로 물들이고, 바닥 반사에는 작업물을 뒤집어 흐리게 비춤
실행: python3 tools/composite_v28.py  → drafts/v28/comp/*.jpg
(웹사이트에서는 같은 원리를 WebGL 셰이더로 실시간 처리)
"""
from pathlib import Path
import cv2, numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'higgsfield/raw'
ORIG = ROOT / 'content/assets/portfolio/originals'
MED = ROOT / 'drafts/v28/media'
OUT = ROOT / 'drafts/v28/comp'


def order(pts):
    pts = np.float32(pts)
    s, d = pts.sum(1), np.diff(pts, axis=1)[:, 0]
    return np.float32([pts[s.argmin()], pts[d.argmin()], pts[s.argmax()], pts[d.argmax()]])


def find_screen(scene, thr):
    g = cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY)
    m = (g > thr).astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((5, 5), np.uint8))
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    k = 1 + st[1:, cv2.CC_STAT_AREA].argmax()
    blob = (lab == k).astype(np.uint8)
    cnt = max(cv2.findContours(blob, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)[0], key=cv2.contourArea)
    hull = cv2.convexHull(cnt)
    for eps in np.linspace(0.005, 0.05, 40):
        ap = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(ap) == 4:
            return order(ap[:, 0, :]), blob
    x, y, w, h = cv2.boundingRect(cnt)
    return np.float32([[x, y], [x + w, y], [x + w, y + h], [x, y + h]]), blob


def cover(img, aspect, fx=0.5, fy=0.5):
    h, w = img.shape[:2]
    if w / h > aspect:
        nw = int(h * aspect); x = int((w - nw) * fx); return img[:, x:x + nw]
    nh = int(w / aspect); y = int((h - nh) * fy); return img[y:y + nh]


def comp(name, scene_label, content, thr=200, fy=0.5, fx=0.5, inset=1.5, black=0.04, contrast=1.0, gain=0.97,
         detail=1.0, spill=0.55, reflect=0.0, quad=None, glow=0.10, grain=5):
    scene = cv2.imread(str(RAW / scene_label / f'{scene_label}_01.png'))
    H, W = scene.shape[:2]
    q, blob = find_screen(scene, thr)
    if quad is not None:
        q = np.float32(quad)
    c = q.mean(0); q = c + (q - c) * (1 - inset / np.linalg.norm(q - c, axis=1, keepdims=True))  # 경계 1~2px 안쪽
    w = int(max(np.linalg.norm(q[1] - q[0]), np.linalg.norm(q[2] - q[3])))
    h = int(max(np.linalg.norm(q[3] - q[0]), np.linalg.norm(q[2] - q[1])))
    src = cover(content, w / h, fx, fy)
    src = cv2.resize(src, (w * 2, h * 2), interpolation=cv2.INTER_AREA if src.shape[1] > w * 2 else cv2.INTER_CUBIC)
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w * 2, 0], [w * 2, h * 2], [0, h * 2]]), q)
    warped = cv2.warpPerspective(src, M, (W, H), flags=cv2.INTER_LANCZOS4).astype(np.float32) / 255
    poly = np.zeros((H, W), np.uint8); cv2.fillConvexPoly(poly, q.astype(np.int32), 1, lineType=cv2.LINE_AA)
    a = cv2.GaussianBlur(poly.astype(np.float32), (0, 0), 0.7)[..., None]

    s = scene.astype(np.float32) / 255
    L = cv2.cvtColor(scene, cv2.COLOR_BGR2GRAY).astype(np.float32) / 255
    # 원래 화면의 밝기 분포(감광)와 미세 질감
    inside = poly > 0
    ref = np.percentile(L[inside], 90)
    low = cv2.GaussianBlur(L, (0, 0), 25)
    shade = np.clip(low / ref, 0.55, 1.08)[..., None]
    hp = (s - cv2.GaussianBlur(s, (0, 0), 3))
    disp = black + (1 - black) * np.clip((warped - 0.5) * contrast + 0.5, 0, 1)
    disp = disp * gain * shade + hp * detail

    # 주변 번짐: 화면이 비추던 빛을 작업물 평균 색으로
    mean = warped[inside].mean(0); mean = mean / max(mean.mean(), 1e-3)
    tint = 1 + spill * (np.clip(mean, 0.4, 1.8) - 1)
    lit = np.clip(cv2.GaussianBlur(L, (0, 0), 8) * 1.4, 0, 1)[..., None] * (1 - a)
    out = s * (1 - lit) + s * tint * lit
    # 화면 빛이 공기·렌즈에 살짝 번짐
    if glow:
        g = cv2.GaussianBlur(warped * a, (0, 0), 40)
        out = out + g * glow
    if reflect:  # 바닥 반사: 화면 아래 모서리를 축으로 뒤집어 흐리게
        yb = int(max(q[2, 1], q[3, 1]))
        flip = np.zeros_like(warped)
        hh = min(yb, H - yb)
        flip[yb:yb + hh] = warped[yb - hh:yb][::-1]
        flip = cv2.GaussianBlur(flip, (0, 0), 14)
        floor = np.clip((L - 0.03) * 2.2, 0, 1)[..., None] * (1 - a)
        fall = np.clip(1 - (np.arange(H)[:, None, None] - yb) / (H - yb + 1), 0, 1) ** 1.5
        fall[:yb] = 0
        out = out * (1 - floor * fall * reflect) + flip * floor * fall * reflect
    out = out * (1 - a) + disp * a
    rng = np.random.default_rng(7)
    out = out + rng.normal(0, grain / 255, out.shape[:2])[..., None]
    out = np.clip(out * 255, 0, 255).astype(np.uint8)
    OUT.mkdir(parents=True, exist_ok=True)
    cv2.imwrite(str(OUT / f'{name}.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 95])
    print(name, q.round(1).tolist())
    return out


def img(p):
    return cv2.imread(str(p))


def cuts():
    kvibe = img(MED / 'ref01_t1.jpg')
    bloom = img(MED / 'ref02_t4.jpg')
    ddm = img(ORIG / 'ref03_Cv2GPxw.png')
    cq = cv2.cvtColor(np.array(__import__('PIL.Image', fromlist=['Image']).open(ORIG / 'chillenq_desktop_hero.webp').convert('RGB')), cv2.COLOR_RGB2BGR)
    bm = img(ROOT / 'drafts/v13/screens/src/site_blooming_mobile.png')[140:-90]  # 상태 표시줄·홈 막대 제외
    comp('c1-kvibe', 'v28-c1-ledhall', kvibe, thr=170, inset=6, fy=0.55, reflect=0.55, spill=0.7, glow=0.12)
    comp('c2-blooming', 'v28-c2-showroom', bloom, thr=200, quad=[[776, 495], [1146, 499], [1136, 742], [751, 733]], fy=0.4, black=0.03, spill=0.25, glow=0.05, detail=0.6)
    comp('c3-dongdaemoon', 'v28-c3-gallery', ddm, thr=185, inset=7, black=0.10, contrast=0.88, gain=0.93, spill=0.45, glow=0.08, detail=1.2)
    comp('c4-chillenq', 'v28-c4-rain', cq, thr=185, quad=[[451, 221], [1627, 231], [1630, 921], [440, 922]], black=0.07, contrast=0.92, spill=0.45, glow=0.10, detail=1.6)
    comp('m1-blooming', 'v28-c1m-ledhall-b', bm, thr=185, inset=5, fy=0.0, reflect=0.5, spill=0.6, glow=0.12)


def receipt():
    """관리비 섹션: 영수증 프린터에서 나오는 종이(휘어진 띠) 위에 정확한 $0.00 줄을 인쇄된 것처럼 얹음."""
    from PIL import Image, ImageDraw, ImageFont
    scene = cv2.imread(str(RAW / 'v28-s-receipt/v28-s-receipt_01.png')).astype(np.float32) / 255
    H, W = scene.shape[:2]
    k = 2048 / 1400  # 모서리 좌표는 1400px 축소본 기준으로 읽음
    Lp = np.float32([(760, 282), (690, 295), (620, 318), (560, 345), (510, 380), (470, 420), (430, 465), (395, 505), (345, 545), (280, 590), (200, 632), (110, 668), (0, 712)]) * k
    Rp = np.float32([(1062, 368), (1000, 388), (955, 415), (915, 450), (875, 490), (840, 520), (800, 555), (750, 600), (700, 640), (650, 690), (600, 735), (560, 770), (545, 788)]) * k

    def resample(p, n, upto=1.0, gamma=1.0):
        d = np.r_[0, np.cumsum(np.linalg.norm(np.diff(p, axis=0), axis=1))]
        t = d[-1] * upto * np.linspace(0, 1, n) ** gamma  # gamma<1: 슬롯 근처(종이가 말려 올라가 짧아 보이는 곳)를 더 빨리 지나감
        return np.stack([np.interp(t, d, p[:, 0]), np.interp(t, d, p[:, 1])], 1)
    N = 260
    from scipy.ndimage import gaussian_filter1d as gf
    L = gf(resample(Lp, N, 0.86, 0.72), 6, axis=0, mode='nearest'); R = gf(resample(Rp, N), 6, axis=0, mode='nearest')  # 꺾임 없이 매끈하게. 왼쪽 가장자리는 화면 밖으로 더 길게 이어지므로 짝이 맞는 지점까지만
    # 종이 질감(텍스처): 폭 600, 길이 = 띠 길이 비율
    TW = 600
    length = np.linalg.norm(np.diff((L + R) / 2, axis=0), axis=1).sum()
    width = np.linalg.norm(R - L, axis=1).mean()
    TH = int(TW * length / width)
    tex = Image.new('L', (TW, TH), 255)
    d = ImageDraw.Draw(tex)
    f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf', 30)
    fb = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf', 34)
    y = 190  # 슬롯 바로 앞은 종이가 말려 올라가 글자가 눌려 보이므로 비워 둠
    d.text((TW / 2, y), 'PAUSE STUDIO', font=fb, fill=40, anchor='mm'); y += 46
    d.text((TW / 2, y), 'MONTHLY FEE', font=f, fill=60, anchor='mm'); y += 40
    d.text((TW / 2, y), '-' * 18, font=f, fill=90, anchor='mm'); y += 46
    for m in ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']:
        d.text((TW / 2 - 18, y), m, font=f, fill=45, anchor='rm'); d.text((TW / 2 + 18, y), '$0.00', font=f, fill=45, anchor='lm'); y += 44
    d.text((TW / 2, y), '-' * 18, font=f, fill=90, anchor='mm'); y += 50
    d.text((TW / 2 - 18, y), 'TOTAL', font=fb, fill=30, anchor='rm'); d.text((TW / 2 + 18, y), '$0.00', font=fb, fill=30, anchor='lm')
    t = np.asarray(tex).astype(np.float32) / 255
    t = cv2.GaussianBlur(t, (0, 0), 0.6)  # 감열지 인쇄의 살짝 번진 가장자리
    t3 = np.dstack([t, t, t])
    ink = np.ones((H, W, 3), np.float32); cov = np.zeros((H, W), np.float32)
    seg = TH / (N - 1)
    for i in range(N - 1):
        src = np.float32([[0, i * seg], [TW, i * seg], [TW, (i + 1) * seg], [0, (i + 1) * seg]])
        dst = np.float32([L[i], R[i], R[i + 1], L[i + 1]])
        M = cv2.getPerspectiveTransform(src, dst)
        w = cv2.warpPerspective(t3, M, (W, H), flags=cv2.INTER_LINEAR, borderValue=(1, 1, 1))
        m = np.zeros((H, W), np.float32); cv2.fillConvexPoly(m, dst.astype(np.int32), 1)
        m = cv2.dilate(m, np.ones((3, 3), np.uint8))
        ink = np.where(m[..., None] > 0, w, ink); cov = np.maximum(cov, m)
    # 종이가 그림자에 들어간 곳은 글자도 같이 어두워짐(곱하기)
    out = scene * (0.25 + 0.75 * ink)
    out = out + np.random.default_rng(3).normal(0, 4 / 255, out.shape[:2])[..., None]
    cv2.imwrite(str(OUT / 's-receipt.jpg'), np.clip(out * 255, 0, 255).astype(np.uint8), [cv2.IMWRITE_JPEG_QUALITY, 95])
    print('receipt', TW, TH)


if __name__ == '__main__':
    import sys
    what = sys.argv[1:] or ['cuts', 'receipt']
    if 'cuts' in what: cuts()
    if 'receipt' in what: receipt()
