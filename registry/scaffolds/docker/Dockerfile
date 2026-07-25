# syntax=docker/dockerfile:1

FROM oven/bun:1 AS dependencies
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM dependencies AS build
WORKDIR /app

COPY . .

# VITE_* values are public client configuration compiled into the bundle at
# build time. Generate the file with scripts/generate-env.sh and pass its path as
# ENV_FILE. The destination name matters: Vite only auto-loads .env.production
# for the production-mode build that `bun run build` runs.
ARG ENV_FILE
COPY ${ENV_FILE} .env.production

RUN bun run build

FROM nginx:1.29-alpine AS runtime

RUN chown -R nginx:nginx /var/cache/nginx /run

COPY --chown=nginx:nginx --from=build /app/dist /usr/share/nginx/html
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

USER nginx

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
