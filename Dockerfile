FROM node:20-alpine

WORKDIR /app

# Install openssl for Prisma
RUN apk add --no-cache openssl

COPY package.json package-lock.json* ./
# Install dependencies including dev dependencies needed for build/prisma
RUN npm ci

COPY . .

# Set default env vars for the build process (can be overridden at runtime)
ENV DATABASE_URL="postgresql://healthai:healthai_pass@postgres:5432/healthaidb"
ENV JWT_SECRET="docker_super_secret_jwt_key_2026"
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

EXPOSE 3000
ENV PORT=3000

# Push database schema to the PostgreSQL db, run the seeder, and then start the Next.js server
CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npx ts-node --compilerOptions '{\"module\":\"CommonJS\"}' prisma/seed.ts || true && npm run start"]
