/**
 * index.template.html + 문구(src/content/ko.ts · en.ts) → index.html(한국어 '/') · en/index.html(영어 '/en')
 * 문구를 많이 바꿨다면 python3 scripts/fonts.py 로 폰트의 '사이트 글자' 묶음을 다시 만들면 첫 화면이 더 가볍다(안 해도 글자는 모두 나옴).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderBody, renderHead } from '../src/render/page';
import type { Lang } from '../src/content';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tpl = fs.readFileSync(path.join(root, 'index.template.html'), 'utf8');

for (const [lang, out] of [['ko', 'index.html'], ['en', 'en/index.html']] as [Lang, string][]) {
  // 바꿀 내용에 $ 기호(가격)가 있으므로 함수로 넣는다(문자열 치환 규칙 $& 등이 적용되지 않게)
  const html = tpl
    .replace('<html lang="ko">', () => `<html lang="${lang}">`)
    .replace('<!--HEAD-->', () => renderHead(lang))
    .replace('<!--BODY-->', () => renderBody(lang));
  const file = path.join(root, out);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  console.log(`${out} ${(Buffer.byteLength(html) / 1024).toFixed(1)} KB`);
}
