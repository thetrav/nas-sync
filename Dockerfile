# Stage 1: builder
FROM node:25-bookworm AS builder
WORKDIR /app/server
COPY server/package.json ./
RUN npm install
COPY server ./

# Stage 2: runtime
FROM node:25-bookworm-slim
WORKDIR /app/server
COPY --from=builder /app/server ./
CMD ["node", "src/index.ts"]

