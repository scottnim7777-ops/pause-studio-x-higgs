import { defineConfig, type Plugin } from 'vite';

/** 사이트 스타일은 한 파일로 묶여 모든 페이지에 붙는데(cssCodeSplit: false), 관리자 화면(/admin)은 자기 스타일만 씀 */
const adminOwnCss = (): Plugin => ({
  name: 'admin-own-css',
  enforce: 'post',
  transformIndexHtml: {
    order: 'post',
    handler: (html, ctx) => (/admin\.html$/.test(ctx.filename) ? html.replace(/\s*<link rel="stylesheet"[^>]*>/g, '') : html),
  },
});

// index.html 은 scripts/render.ts 가 문구(src/content)로부터 미리 만들어 둔다(검색엔진·JS 꺼진 환경에서도 내용이 그대로 보이도록)
export default defineConfig({
  plugins: [adminOwnCss()],
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
    // 한국어 '/'(index.html)와 영어 '/en'(en/index.html) 두 페이지가 같은 스크립트·스타일을 씀. admin.html = 방문 통계(/admin)
    rollupOptions: { input: { main: 'index.html', admin: 'admin.html', en: 'en/index.html', laCity: 'en/web-design-los-angeles/index.html', nyCity: 'en/web-design-new-york/index.html', atlCity: 'en/web-design-atlanta/index.html' } },
  },
  server: { port: 5173 },
});
