# Stage 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files for dependency caching
COPY package*.json ./

# Install devDependencies as well to compile TypeScript
RUN npm ci

# Copy Prisma configurations and source code
COPY prisma ./prisma/
COPY prisma.config.ts ./
COPY tsconfig.json ./
COPY src ./src/

# Runs prisma generate && tsc to build the JS code
RUN npm run build

# Stage 2: Production runner stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment variable
ENV NODE_ENV=production

COPY package*.json ./

# Install production dependencies only (excludes devDependencies)
RUN npm ci --only=production

# Copy generated Prisma Client and compiled JS output
COPY --from=builder /app/generated ./generated
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

# Expose server port (will default to 3000, but can be overridden by PORT env)
EXPOSE 3000

# Start command
CMD ["npm", "start"]
