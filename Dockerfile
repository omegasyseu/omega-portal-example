# Builds the portal and Strapi (strapi/) into one image. nginx serves the portal on port
# 3000 and proxies /strapi/ to Strapi in the same container (docker/nginx.conf).
# At container start docker/env.sh swaps the PORTAL_* placeholders for the matching
# environment variables, then docker/entrypoint.sh starts Strapi and nginx (see README
# "Deployment").

FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS build

# corepack (bundled with Node 24) provides the pnpm pinned in package.json's "packageManager"
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build


FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS strapi-build

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

WORKDIR /srv/strapi

COPY strapi/package.json strapi/pnpm-lock.yaml strapi/pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY strapi/ ./
# A production admin panel served under /strapi (see strapi/config/server.ts)
RUN NODE_ENV=production PUBLIC_URL=/strapi pnpm run build \
    && CI=true pnpm prune --prod \
    && rm -rf .strapi


FROM node:24.21.0-alpine3.24@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1

ARG APP_VERSION=dev
ARG GIT_REVISION=unknown

LABEL org.opencontainers.image.authors="Omega Systems" \
      org.opencontainers.image.base.name="docker.io/library/node:24.21.0-alpine3.24" \
      org.opencontainers.image.version="${APP_VERSION}" \
      org.opencontainers.image.revision="${GIT_REVISION}"

# nginx logs to the container's output, as in the official nginx image
RUN apk add --no-cache nginx~1.30 \
    && ln -sf /dev/stdout /var/log/nginx/access.log \
    && ln -sf /dev/stderr /var/log/nginx/error.log

COPY --from=build /app/dist/ /usr/share/nginx/html/
COPY docker/nginx.conf /etc/nginx/http.d/default.conf

COPY --from=strapi-build /srv/strapi/ /srv/strapi/

COPY docker/env.sh /usr/local/bin/env.sh
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/env.sh /usr/local/bin/entrypoint.sh

# Strapi listens only inside the container; nginx proxies it at /strapi/, where the portal
# reads it (PORTAL_STRAPI_URL, overridable like any PORTAL_* value). Strapi reads its secrets
# from ENV_PATH, which docker/entrypoint.sh fills on the first start.
ENV NODE_ENV=production \
    HOST=127.0.0.1 \
    PORT=1337 \
    IS_PROXIED=true \
    PORTAL_STRAPI_URL=/strapi \
    ENV_PATH=/srv/strapi/data/secrets.env

# The SQLite database and uploads: mount a volume here (docker-compose.yml)
VOLUME /srv/strapi/data

# `docker compose exec omega-portal5 npm run seed ...` runs from here
WORKDIR /srv/strapi

EXPOSE 3000
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
