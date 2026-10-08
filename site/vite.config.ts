import { defineConfig } from 'vite';

// index.html 은 scripts/render.ts 가 문구(src/content)로부터 미리 만들어 둔다(검색엔진·JS 꺼진 환경에서도 내용이 그대로 보이도록)
export default defineConfig({
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    cssCodeSplit: false,
  },
  server: { port: 5173 },
});
