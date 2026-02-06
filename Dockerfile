# Stage 1: builder
FROM node:25-bookworm AS builder
WORKDIR /app/server
COPY server/package.json ./
RUN npm install
COPY server ./

# Stage 2: runtime
FROM node:25-bookworm-slim

ARG UID=1000
ARG GID=1000

RUN apt-get update \
 && apt-get install -y --no-install-recommends \
    rsync \
    openssh-client \
 && rm -rf /var/lib/apt/lists/*
WORKDIR /app/server
COPY --from=builder /app/server ./

USER thetrav

CMD ["node", "src/index.ts"]

