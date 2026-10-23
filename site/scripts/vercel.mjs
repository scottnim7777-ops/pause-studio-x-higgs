// Vercel 배포 묶음(Build Output API v3): dist → .vercel/output
// 실행: npm run build && node scripts/vercel.mjs && vercel deploy --prebuilt [--prod]
// - 정적 파일(assets·fonts·media·brand 등)은 Vercel CDN이 바로 보냄
// - 첫 화면(/)과 /api/*는 server.ts(Express)를 묶은 함수가 처리 — 첫 화면은 방문자 나라에 맞는 통화로 넣어 보냄
//   (도메인이 Cloudflare 프록시를 거치므로 cf-ipcountry 먼저 — x-vercel-ip-country는 Cloudflare 서버 위치가 됨)
//   함수 경로를 요청 주소와 같게 두어(index·api/contact·api/currency·api/health) 주소를 바꿔 넘기지 않음
// - index.html은 정적 파일로 두지 않음(통화 표시가 빠진 원본이 나가지 않게)
import { build } from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(SITE, 'dist');
const OUT = path.join(SITE, '.vercel/output');
if (!fs.existsSync(path.join(DIST, 'index.html'))) throw new Error('dist가 없습니다: npm run build 먼저');

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'static'), { recursive: true });
for (const f of fs.readdirSync(DIST)) {
  if (f === 'index.html' || f === 'server.cjs' || f === 'en') continue; // en/ 은 영어 첫 화면(함수가 보냄)
  fs.cpSync(path.join(DIST, f), path.join(OUT, 'static', f), { recursive: true });
}

// 도시별 안내 페이지는 정적 파일(en/<이름>.html)로 두고 아래 라우트가 /en/<이름> 을 연결
for (const d of fs.readdirSync(path.join(DIST, 'en'), { withFileTypes: true })) {
  if (d.isDirectory() && d.name.startsWith('web-design-')) {
    fs.mkdirSync(path.join(OUT, 'static/en'), { recursive: true });
    fs.copyFileSync(path.join(DIST, 'en', d.name, 'index.html'), path.join(OUT, 'static/en', `${d.name}.html`));
  }
}

// 서버 묶기: 패키지까지 한 파일로(함수에는 node_modules가 없음). vite는 개발용이라 제외
const tmp = path.join(SITE, '.cache/vercel-fn');
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(path.join(tmp, 'dist'), { recursive: true });
await build({
  entryPoints: [path.join(SITE, 'server.ts')], bundle: true, platform: 'node', format: 'cjs', target: 'node22',
  external: ['vite'], outfile: path.join(tmp, 'server.cjs'), logLevel: 'warning',
});
fs.writeFileSync(path.join(tmp, 'index.cjs'), "const m = require('./server.cjs');\nmodule.exports = async (req, res) => (await m.ready)(req, res);\n");
fs.copyFileSync(path.join(DIST, 'index.html'), path.join(tmp, 'dist/index.html'));
fs.mkdirSync(path.join(tmp, 'dist/en'), { recursive: true });
fs.copyFileSync(path.join(DIST, 'en/index.html'), path.join(tmp, 'dist/en/index.html'));
fs.writeFileSync(path.join(tmp, '.vc-config.json'), JSON.stringify({
  runtime: 'nodejs22.x', handler: 'index.cjs', launcherType: 'Nodejs', shouldAddHelpers: false, maxDuration: 60,
  environment: { NODE_ENV: 'production', GEO_HEADER: 'cf-ipcountry,x-vercel-ip-country', TRUST_PROXY: '1', STATIC_DIR: 'dist' },
}, null, 2));
for (const fn of ['index', 'en', 'api/contact', 'api/currency', 'api/health', 'api/file', 'api/mailed', 'api/status']) {
  fs.cpSync(tmp, path.join(OUT, 'functions', `${fn}.func`), { recursive: true });
}

const security = {
  'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin',
  'X-Frame-Options': 'SAMEORIGIN', 'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
fs.writeFileSync(path.join(OUT, 'config.json'), JSON.stringify({
  version: 3,
  routes: [
    { src: '^/assets/(.*)$', headers: { 'Cache-Control': 'public, max-age=31536000, immutable' }, continue: true },
    { src: '^/(fonts|media|brand)/(.*)$', headers: { 'Cache-Control': 'public, max-age=604800' }, continue: true },
    { src: '^/(.*)$', headers: security, continue: true },
    { src: '^/index\\.html$', status: 301, headers: { Location: '/' } },
    { src: '^/en/$', status: 308, headers: { Location: '/en' } },
    { src: '^/en/(web-design-[a-z-]+)/?$', dest: '/en/$1.html', headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' }, continue: true },
    { handle: 'filesystem' },
    // 예전 사이트 주소(/promo-image 등)는 첫 화면으로
    { src: '^/(?!api/)[^.]+$', status: 301, headers: { Location: '/' } },
  ],
}, null, 2));
console.log('Vercel 묶음 완료 →', path.relative(SITE, OUT));
