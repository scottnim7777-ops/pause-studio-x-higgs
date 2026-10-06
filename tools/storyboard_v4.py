"""4차 콘티 스틸: Higgsfield 장면(화면은 초록 크로마키) 위에 실제 작업물 화면을 원근에 맞춰 합성 → drafts/v4/shots/
- 초록 화면 영역 검출 → 네 모서리 → 원근 변환으로 실제 작업물 합성(화면 속 글자를 AI가 만들지 않음)
- 가장자리 초록 번짐 제거, 화면 밝기를 장면에 맞춤, 얕은 심도 컷은 초점 기울기 흐림, 화면 빛 번짐, 필름 그레인·비네팅
실행: python3 tools/storyboard_v4.py
"""
import subprocess
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
RAW = ROOT / 'higgsfield' / 'raw'
PF = ROOT / 'content' / 'assets' / 'portfolio' / 'originals'
OUT = ROOT / 'drafts' / 'v4' / 'shots'
WORK = ROOT / 'drafts' / 'v4' / 'work'


def frame_of(video, sec):
    p = WORK / f'{Path(video).stem}_{sec}.png'
    if not p.exists():
        subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', str(sec), '-i', str(video), '-frames:v', '1', str(p)], check=True)
    return cv2.imread(str(p))


def crop_aspect(img, aspect, fx=0.5, fy=0.0):
    h, w = img.shape[:2]
    if w / h > aspect:
        nw = int(h * aspect); x = int((w - nw) * fx); return img[:, x:x + nw]
    nh = int(w / aspect); y = int((h - nh) * fy); return img[y:y + nh]


def green_mask(img):
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    b, g, r = [img[..., i].astype(np.float32) for i in range(3)]
    key = np.clip((g - np.maximum(r, b)) / 60.0, 0, 1)            # 초록 우세 정도(부드러운 가장자리)
    hard = ((hsv[..., 0] > 35) & (hsv[..., 0] < 85) & (hsv[..., 1] > 90) & (hsv[..., 2] > 50)).astype(np.uint8)
    return key, hard


def screen_quad(hard, pick=0):
    n, lab, stats, _ = cv2.connectedComponentsWithStats(hard)
    i = 1 + int(np.argsort(-stats[1:, cv2.CC_STAT_AREA])[pick])  # pick=0 가장 큰 화면, 1 두 번째 화면
    comp = (lab == i).astype(np.uint8)
    cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    c = max(cnts, key=cv2.contourArea)
    hull = cv2.convexHull(c)
    for eps in np.linspace(0.005, 0.06, 40):
        ap = cv2.approxPolyDP(hull, eps * cv2.arcLength(hull, True), True)
        if len(ap) == 4:
            break
    else:
        ap = cv2.boxPoints(cv2.minAreaRect(c)).reshape(-1, 1, 2)
    pts = ap.reshape(4, 2).astype(np.float32)
    s, d = pts.sum(1), np.diff(pts, axis=1).ravel()
    quad = np.array([pts[np.argmin(s)], pts[np.argmin(d)], pts[np.argmax(s)], pts[np.argmax(d)]], np.float32)  # 좌상·우상·우하·좌하
    return quad, comp


def composite(name, scene_label, content, gain=0.92, dof=None, grain=6, vig_amt=0.28, glow_amt=0.18, out_dir=None, fix=None,
              scene=None, pick=0, solid=False, finish=True, stray=True, soft=0, lift=0, reflect=0):
    if scene is None:
        scene = cv2.imread(str(RAW / scene_label / f'{scene_label}_01.png'))
    if fix:
        scene = fix(scene)
    key, hard = green_mask(scene)
    quad, comp = screen_quad(hard, pick)
    w = int(max(np.linalg.norm(quad[1] - quad[0]), np.linalg.norm(quad[2] - quad[3])))
    h = int(max(np.linalg.norm(quad[3] - quad[0]), np.linalg.norm(quad[2] - quad[1])))
    src = crop_aspect(content, w / h)
    src = cv2.resize(src, (w * 2, h * 2), interpolation=cv2.INTER_AREA)
    M = cv2.getPerspectiveTransform(np.float32([[0, 0], [w * 2, 0], [w * 2, h * 2], [0, h * 2]]), quad)
    H, W = scene.shape[:2]
    warped = cv2.warpPerspective(src, M, (W, H), flags=cv2.INTER_LANCZOS4)
    if dof:  # 초점 기울기: 화면 왼쪽은 선명, 오른쪽으로 갈수록 흐림
        blur = cv2.GaussianBlur(warped, (0, 0), dof)
        ramp = np.clip((np.arange(W)[None, :] - quad[:, 0].min()) / (quad[:, 0].max() - quad[:, 0].min()), 0, 1) ** 1.4
        warped = (warped * (1 - ramp[..., None]) + blur * ramp[..., None]).astype(np.uint8)
    region = cv2.dilate(comp, np.ones((5, 5), np.uint8), iterations=2).astype(np.float32)
    alpha = np.clip(key * 1.15, 0, 1) * region
    if solid:  # 초록 화면 안에 생성된 글자 등이 있으면 화면 사각형 전체를 덮음
        poly = np.zeros(comp.shape, np.uint8); cv2.fillConvexPoly(poly, quad.astype(np.int32), 1)
        alpha = np.maximum(alpha, cv2.erode(poly, np.ones((3, 3), np.uint8)).astype(np.float32))
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.8)[..., None]
    out = scene.astype(np.float32)
    # 가장자리 초록 번짐 제거: 화면 주변 픽셀의 초록을 빨강·파랑 최대치로 낮춤
    ring = (cv2.dilate(comp, np.ones((9, 9), np.uint8), iterations=2) > 0)[..., None]
    gmax = np.maximum(out[..., 2], out[..., 0])
    out[..., 1] = np.where(ring[..., 0], np.minimum(out[..., 1], gmax * 1.05), out[..., 1])
    # 화면 밖에 남은 초록(배경 흐림 속 크로마키 반사)도 중성색으로
    if stray:
        strays = (key > 0.05) & (region == 0)
        out[..., 1] = np.where(strays, np.minimum(out[..., 1], gmax * 1.02), out[..., 1])
    scr = warped.astype(np.float32) * gain
    if soft:  # 실제 렌즈로 찍은 화면처럼 아주 살짝 부드럽게(합성 티 줄이기)
        scr = cv2.GaussianBlur(scr, (0, 0), soft)
    if lift:  # 화면의 검정은 완전한 검정이 아님(LCD 검정 수준)
        scr = scr * (1 - lift / 255) + lift
    if reflect:  # 주변 빛이 유리 화면에 희미하게 비침
        scr = scr + cv2.GaussianBlur(out, (0, 0), 30) * reflect
    out = out * (1 - alpha) + scr * alpha
    # 화면 빛 번짐(장면에 은은하게)
    glow = cv2.GaussianBlur(scr * alpha, (0, 0), 40)
    out = out + glow * glow_amt
    if not finish:  # 여러 화면을 차례로 합성할 때: 마지막에만 그레인·비네팅
        return np.clip(out, 0, 255).astype(np.uint8)
    # 필름 그레인·비네팅
    rng = np.random.default_rng(7)
    out += rng.normal(0, grain, out.shape[:2])[..., None]
    yy, xx = np.mgrid[0:H, 0:W]
    vig = 1 - vig_amt * (((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
    out *= np.clip(vig, 0.6, 1)[..., None]
    out = np.clip(out, 0, 255).astype(np.uint8)
    out = cv2.resize(out, (1920, 1080), interpolation=cv2.INTER_AREA) if out.shape[1] != 1920 else out
    cv2.imwrite(str((out_dir or OUT) / f'{name}.jpg'), out, [cv2.IMWRITE_JPEG_QUALITY, 92])
    return quad


def main():
    OUT.mkdir(parents=True, exist_ok=True); WORK.mkdir(parents=True, exist_ok=True)
    kvibe = frame_of(PF / 'ref01_KIKzZuF.mp4', 5)
    dongdaemun = cv2.imread(str(PF / 'ref03_Cv2GPxw.png'))
    blooming = frame_of(PF / 'ref02_PVuptes.mp4', 5)
    blessings = frame_of(PF / 'ref07_70IgQpR.mp4', 4)
    q = {}
    q['s1'] = composite('shot1-studio_kvibe', 'v4-s1-studio', kvibe, gain=0.9)
    # 매크로: 동대문 사이트의 세로 제목 부분을 크게
    h, w = dongdaemun.shape[:2]
    q['s2'] = composite('shot2-macro_dongdaemun', 'v4-s2-macro', dongdaemun[int(h * .08):int(h * .75), int(w * .30):int(w * .78)], gain=0.95, dof=9)
    # 휴대폰: 블루밍 화면의 가운데를 세로로 잘라 모바일 화면처럼
    h, w = blooming.shape[:2]
    q['s3'] = composite('shot3-cafe_blooming', 'v4-s3-cafe', blooming[:, int(w * .30):int(w * .70)], gain=0.88)
    q['s4'] = composite('shot4-reception_blessings', 'v4-s4-reception', blessings, gain=0.85)
    for k, v in q.items():
        print(k, np.round(v).astype(int).tolist())


if __name__ == '__main__':
    main()
