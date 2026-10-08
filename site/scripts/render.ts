/**
 * index.template.html + 문구(src/content/ko.ts) → index.html
 * 산돌구름 웹폰트 연결 코드가 있으면(site/webfont.html) <!--WEBFONT--> 자리에 넣는다. 없으면 시스템 고딕으로 표시.
 */
import fs from 'node:fs';
import path from 'node:path';
import { renderBody, renderHead } from '../src/render/page';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const tpl = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8');
const fontFile = path.join(root, 'webfont.html');
const webfont = fs.existsSync(fontFile) ? fs.readFileSync(fontFile, 'utf8').trim() : '<!-- 산돌구름 웹폰트: site/webfont.html 에 연결 코드를 넣으면 여기에 들어갑니다(README 참고) -->';

// 바꿀 내용에 $ 기호(가격)가 있으므로 함수로 넣는다(문자열 치환 규칙 $& 등이 적용되지 않게)
const html = tpl
  .replace('<!--HEAD-->', () => renderHead())
  .replace('<!--WEBFONT-->', () => webfont)
  .replace('<!--BODY-->', () => renderBody());

fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`index.html ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB${fs.existsSync(fontFile) ? ' (웹폰트 연결됨)' : ' (웹폰트 미연결 — 시스템 서체)'}`);
