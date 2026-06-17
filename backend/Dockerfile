FROM oven/bun:1 AS base
WORKDIR /app

# OpenSSL est requis par le moteur de requêtes Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Dépendances (cache séparé du code source)
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Code source + génération du client Prisma
COPY . .
RUN bunx prisma generate

ENV PORT=8080
EXPOSE 8080

# Synchronise le schéma Prisma avec la base puis démarre l'API
CMD ["sh", "-c", "bunx prisma db push --skip-generate && bun run src/index.ts"]
