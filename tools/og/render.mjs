// 카드 HTML → site/public/<출력>.jpg (2배로 찍어 줄임). 사용: node tools/og/render.mjs <카드.html> <출력.jpg> [chrome 경로]
// 예: node tools/og/render.mjs og-en.html og-en-20261022.jpg (영어). 한국어 og-20261013.jpg는 사용자 제작 카드라 이 도구로 덮어쓰지 않는다
import { spawn, execFileSync } from 'node:child_process'; import fs from 'node:fs'; import path from 'node:path'; import os from 'node:os'; import { fileURLToPath, pathToFileURL } from 'node:url';
const DIR = path.dirname(fileURLToPath(import.meta.url));
const [PAGE, OUT_NAME] = process.argv.slice(2, 4);
if (!PAGE || !OUT_NAME) { console.error('사용: node tools/og/render.mjs <카드.html> <출력.jpg> [chrome 경로]'); process.exit(1); }
if (OUT_NAME === 'og-20261013.jpg') { console.error('og-20261013.jpg는 사용자 제작 카드입니다. 다른 이름으로 출력하세요.'); process.exit(1); }
const CH = process.argv[4] || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const prof = fs.mkdtempSync(path.join(os.tmpdir(), 'og-'));
const c = spawn(CH, ['--headless=new', '--remote-debugging-port=9370', `--user-data-dir=${prof}`, '--allow-file-access-from-files', 'about:blank']);
await new Promise((r) => setTimeout(r, 2500));
const tabs = await (await fetch('http://127.0.0.1:9370/json')).json();
const ws = new WebSocket(tabs.find((t) => t.type === 'page').webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pend = {}; ws.onmessage = (e) => { const m = JSON.parse(e.data); if (m.id && pend[m.id]) { pend[m.id](m.result); delete pend[m.id]; } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend[i] = r; ws.send(JSON.stringify({ id: i, method, params })); });
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 2, mobile: false });
await send('Page.navigate', { url: pathToFileURL(path.join(DIR, PAGE)).href });
await new Promise((r) => setTimeout(r, 2500));
await send('Runtime.evaluate', { expression: 'document.fonts.ready', awaitPromise: true });
const shot = await send('Page.captureScreenshot', { format: 'png' });
const tmp = path.join(prof, 'og@2x.png'); fs.writeFileSync(tmp, Buffer.from(shot.data, 'base64'));
c.kill();
const out = path.resolve(DIR, '../../site/public', OUT_NAME);
execFileSync('python', ['-c', `from PIL import Image;Image.open(r'${tmp}').convert('RGB').resize((1200,630),Image.LANCZOS).save(r'${out}',quality=90,optimize=True,progressive=True)`]);
console.log('→', out); process.exit(0);
