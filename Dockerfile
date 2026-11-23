FROM node:22-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build && npm prune --omit=dev

FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
ENV PORT=3000 HOSTNAME=127.0.0.1
CMD ["sh", "-c", "npx next start --hostname $HOSTNAME --port $PORT"]
