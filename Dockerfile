FROM node:24-bookworm-slim AS runtime

ENV CI=false
WORKDIR /app/server

# Native deps if needed
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
  build-essential \
  python3 && \
  rm -rf /var/lib/apt/lists/*

COPY server/package.json ./
RUN rm -f package-lock.json && npm install

COPY server ./

EXPOSE 3000
CMD ["node", "src/index.ts"]
