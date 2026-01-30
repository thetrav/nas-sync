# Stage 1: builder
FROM node:25-bookworm AS builder
WORKDIR /app/server
COPY server/package.json ./
RUN npm install
COPY server ./

# Stage 2: runtime
FROM node:25-bookworm-slim
# Install rsync + ssh client (rsync over ssh needs both)
RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    rsync \
    openssh-client \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app/server
COPY --from=builder /app/server ./
CMD ["node", "src/index.ts"]

