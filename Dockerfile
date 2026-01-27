# ---- base ----
FROM oven/bun:1.1.0

WORKDIR /app

# ---- install deps first (better caching) ----
COPY server/package.json server/bun.lockb* ./server/
WORKDIR /app/server
RUN bun install --production

# ---- copy app ----
COPY server ./server

# ---- runtime ----
WORKDIR /app/server
EXPOSE 3000

CMD ["bun", "run", "./src/index.ts"]
