# ---------- Build stage ----------
FROM node:20-alpine AS builder

WORKDIR /app

# Set environment to production
ENV NODE_ENV=production

# Install dependencies first (cache-friendly)
COPY package.json package-lock.json ./
RUN npm ci

# Copy TypeScript config and source
COPY tsconfig.json ./
COPY src ./src

# Build TypeScript -> dist/
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine

WORKDIR /app

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy compiled output
COPY --from=builder /app/dist ./dist

# Create a non-root user to run the app
RUN addgroup -S app && adduser -S app -G app
USER app

EXPOSE 3000

CMD ["node", "dist/index.js"]