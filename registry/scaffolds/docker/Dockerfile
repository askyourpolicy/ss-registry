# syntax=docker/dockerfile:1

FROM oven/bun:1 AS dependencies
WORKDIR /app

COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

FROM dependencies AS build
WORKDIR /app

COPY . .

# VITE_* values are public client configuration compiled into the bundle at build time.
# Declare an ARG/ENV pair for each value the application needs, then pass --build-arg.
ARG VITE_API_URL=""
ENV VITE_API_URL=${VITE_API_URL}

RUN bun run build

FROM nginx:1.29-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1

CMD ["nginx", "-g", "daemon off;"]
