FROM oven/bun:1.2.5 AS base

# Install dependencies only when needed
FROM base AS deps

WORKDIR /app

# Install dependencies
COPY package.json bun.lock* ./
COPY prisma ./prisma/

# Install dependencies and generate Prisma Client
RUN bun install --frozen-lockfile \
    && bunx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DATABASE_URL

# Set environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
ENV DATABASE_URL=${DATABASE_URL}

# Build application
RUN bun run build

# Show build output for debugging
RUN ls -la /app/.next/

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Set the correct permission for prerender cache and node_modules
RUN mkdir -p .next && \
    chown nextjs:bun .next && \
    mkdir -p node_modules && \
    chown -R nextjs:bun node_modules

# Create startup script before changing user
RUN echo '#!/bin/sh\ncd /app\nbunx prisma migrate deploy\nbun server.js' > /app/start.sh && \
    chmod +x /app/start.sh && \
    chown nextjs:bun /app/start.sh

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:bun /app/.next/standalone ./
COPY --from=builder --chown=nextjs:bun /app/.next/static ./.next/static

# Ensure all files have correct permissions
RUN chown -R nextjs:bun .

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["/app/start.sh"]
