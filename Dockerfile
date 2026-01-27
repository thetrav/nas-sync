# ========================
# Stage 1: deps + build
# ========================
FROM oven/bun:1.1.0 AS builder

# Bun freezes installs when CI=true — disable it
ENV CI=false

RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential \
  python3 && \
  rm -rf /var/lib/apt/lists/*

WORKDIR /app/server

COPY server/package.json ./

# You don't care about lockfiles
RUN rm -f bun.lockb && bun install

COPY server ./

# ========================
# Stage 2: runtime
# ========================
FROM oven/bun:1.1.0

WORKDIR /app/server
COPY --from=builder /app/server /app/server

EXPOSE 3000
CMD ["bun", "run", "./src/index.ts"]
