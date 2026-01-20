FROM oven/bun:alpine AS base

WORKDIR /app

# Copy package and lock files first (better layer caching)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy source
COPY . .

# Expose a port (optional, e.g. if your app runs a server)
EXPOSE 3000

# Run the app
CMD ["bun", "run", "--watch", "src/index.ts"]
