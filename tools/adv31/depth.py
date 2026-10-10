"""단안 깊이 추정(Depth Anything V2 Small, ONNX, CPU). 사용: python depth.py in.png out.npy [preview.png]
결과: 0(멀다)~1(가깝다) 상대 깊이, 원본 크기."""
import sys, numpy as np, onnxruntime as ort
from PIL import Image
import os
M = os.environ.get('DA2_MODEL', os.path.join(os.path.dirname(os.path.abspath(__file__)), '.cache', 'da2s.onnx'))  # Depth Anything V2 Small (onnx-community, Apache-2.0)
_sess = None
def depth(img: Image.Image, long_side=770):
    global _sess
    if _sess is None:
        so = ort.SessionOptions(); so.intra_op_num_threads = 4
        _sess = ort.InferenceSession(M, so, providers=['CPUExecutionProvider'])
    W, H = img.size
    s = long_side / max(W, H)
    w = max(14, int(round(W * s / 14)) * 14); h = max(14, int(round(H * s / 14)) * 14)
    x = np.asarray(img.convert('RGB').resize((w, h), Image.BICUBIC), dtype=np.float32) / 255.0
    x = (x - np.array([0.485, 0.456, 0.406], np.float32)) / np.array([0.229, 0.224, 0.225], np.float32)
    x = x.transpose(2, 0, 1)[None]
    name = _sess.get_inputs()[0].name
    d = _sess.run(None, {name: x})[0]
    d = np.squeeze(d).astype(np.float32)
    d = np.asarray(Image.fromarray(d).resize((W, H), Image.BICUBIC), dtype=np.float32)
    lo, hi = np.percentile(d, 1), np.percentile(d, 99)
    return np.clip((d - lo) / (hi - lo + 1e-6), 0, 1)
if __name__ == '__main__':
    im = Image.open(sys.argv[1])
    d = depth(im)
    np.save(sys.argv[2], d)
    if len(sys.argv) > 3:
        Image.fromarray((d * 255).astype(np.uint8)).save(sys.argv[3])
    print(d.shape, float(d.min()), float(d.max()))
