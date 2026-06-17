# --- Étape 1 : build du bundle Vite ---
FROM oven/bun:1 AS build
WORKDIR /app

# URL de l'API injectée au moment du build (Vite l'inline dans le bundle)
ARG VITE_API_URL=http://localhost:8080
ENV VITE_API_URL=$VITE_API_URL

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

COPY . .
RUN bun run build

# --- Étape 2 : service statique via nginx (HTTP 80 + HTTPS 443) ---
FROM nginx:alpine

# Certificat auto-signé pour le HTTPS (à remplacer par un vrai cert en prod)
RUN apk add --no-cache openssl && \
    mkdir -p /etc/nginx/certs && \
    openssl req -x509 -nodes -newkey rsa:2048 -days 365 \
      -keyout /etc/nginx/certs/server.key \
      -out /etc/nginx/certs/server.crt \
      -subj "/CN=localhost"

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80 443
CMD ["nginx", "-g", "daemon off;"]
