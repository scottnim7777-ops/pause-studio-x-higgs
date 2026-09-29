// 기존 사이트 소스(pause-studio-v2)에서 방문자에게 보이는 문자열을 파일:줄 단위로 추출한다.
// 디자인 정보(className, style)는 추출하지 않는다. 결과는 content/extracted/strings.json.
const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const SRC = process.argv[2];
const OUT = process.argv[3];
const FILES = process.argv.slice(4);

const SKIP_ATTRS = new Set(['className', 'style', 'key', 'viewBox', 'd', 'fill', 'stroke', 'strokeWidth',
  'strokeLinecap', 'strokeLinejoin', 'xmlns', 'width', 'height', 'type', 'rel', 'target', 'referrerPolicy',
  'initial', 'animate', 'exit', 'transition', 'whileHover', 'whileTap', 'whileInView', 'viewport', 'strokeOpacity',
  'accept', 'autoComplete', 'inputMode', 'role', 'id', 'htmlFor', 'name', 'method', 'encType', 'loading', 'decoding']);
const SKIP_CALLEES = new Set(['require', 'import', 'useTransform', 'console.log', 'console.warn', 'console.error']);
const hasLetters = (s) => /[A-Za-z\u3131-\uD79D\u3040-\u30FF\u4E00-\u9FFF]/.test(s);
const looksLikeCode = (s) => /^[\w-]+(\s[\w:\-\[\]\/.%#()]+)*$/.test(s) && /\b(flex|grid|text-|bg-|px-|py-|w-|h-|rounded|border|font-|items-|justify-)/.test(s);

const result = {};
for (const rel of FILES) {
  const file = path.join(SRC, rel);
  const code = fs.readFileSync(file, 'utf8');
  const sf = ts.createSourceFile(file, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const items = [];
  const push = (node, text, kind) => {
    const t = text.replace(/[ \t]+\n/g, '\n');
    if (!t.trim() || !hasLetters(t) || looksLikeCode(t.trim())) return;
    const { line } = sf.getLineAndCharacterOfPosition(node.getStart());
    // 가장 가까운 객체 키 경로(ko/en/zh/ja 등)를 함께 기록
    const keys = [];
    let p = node.parent;
    while (p && keys.length < 4) {
      if (ts.isPropertyAssignment(p) && p.name) keys.unshift(p.name.getText(sf));
      if (ts.isVariableDeclaration(p)) { keys.unshift(p.name.getText(sf)); break; }
      p = p.parent;
    }
    items.push({ line: line + 1, kind, path: keys.join('.'), text: t });
  };
  const visit = (node) => {
    if (ts.isImportDeclaration(node)) return;
    if (ts.isJsxAttribute(node) && SKIP_ATTRS.has(node.name.getText(sf))) return;
    if (ts.isCallExpression(node) && SKIP_CALLEES.has(node.expression.getText(sf))) return;
    if (ts.isPropertyAssignment(node) && ['className', 'style', 'transition', 'animate', 'initial', 'e', 'd'].includes(node.name.getText(sf))) return;
    if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) push(node, node.text, 'string');
    else if (ts.isTemplateExpression(node)) push(node, node.getText(sf).slice(1, -1), 'template');
    else if (ts.isJsxText(node)) push(node, node.getText(sf).trim(), 'jsx');
    ts.forEachChild(node, visit);
  };
  visit(sf);
  result[rel] = items;
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(result, null, 1));
const total = Object.values(result).reduce((a, b) => a + b.length, 0);
console.log(`files=${FILES.length} strings=${total}`);
for (const [f, it] of Object.entries(result)) console.log(`${String(it.length).padStart(5)}  ${f}`);
