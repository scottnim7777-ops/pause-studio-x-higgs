# PAUSE STUDIO 웹사이트 — Cloud Run 등 Node가 도는 곳이면 어디서나 같은 방식으로 실행
# 빌드: 문구 → HTML, Vite 빌드, 서버 묶기
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# 실행: 빌드 결과(dist)와 서버 실행에 필요한 패키지만
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
EXPOSE 8080
USER node
CMD ["node", "dist/server.cjs"]
