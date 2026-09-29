# site-content.ko.json의 모든 원문(메타 설명 키 제외)이 추출 원문에 글자 그대로 존재하는지 검증
import json, re, sys
strings = json.load(open('content/extracted/strings.json'))
corpus = [it['text'] for items in strings.values() for it in items]
html = open('/home/user/pause-studio-v2/index.html', encoding='utf-8').read() + ' ' + open('/home/user/pause-studio-v2/public/robots.txt', encoding='utf-8').read()
META = {'_meta','placement','summary','note','flag','action','src','asset_status','currency_note','hero_cta_note',
        'visual','hidden_feature','signature_asset','logo','qr','strings','env','endpoints','route','routes','jsonld','static_skeleton_before_hydration'}
norm = lambda s: re.sub(r'\s+', ' ', s).strip()
corpus_n = [norm(c) for c in corpus] + [norm(re.sub(r'<[^>]+>', ' ', html))]
bad, n = [], 0
def found(s):
    s = norm(s)
    return any(s in c for c in corpus_n)
def walk(v, path):
    global n
    if isinstance(v, dict):
        for k, x in v.items():
            if k in META: continue
            walk(x, f'{path}.{k}')
    elif isinstance(v, list):
        for i, x in enumerate(v): walk(x, f'{path}[{i}]')
    elif isinstance(v, str) and re.search(r'[A-Za-z가-힣]', v):
        n += 1
        if not found(v): bad.append((path, v[:90]))
walk(json.load(open('content/site-content.ko.json')), '')
# 스켈레톤은 index.html 원문으로 별도 검증
sk = json.load(open('content/site-content.ko.json'))['hero']['static_skeleton_before_hydration']
for k in ['eyebrow','headline','sub']:
    n += 1
    if norm(sk[k]) not in norm(re.sub(r'<br>', '', re.sub(r'<span[^>]*>|</span>', '', html))): bad.append(('skeleton.'+k, sk[k]))
print(f'checked={n} missing={len(bad)}')
for b in bad: print('  MISSING', b)
sys.exit(1 if bad else 0)
