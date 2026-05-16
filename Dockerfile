# ─── Stage 1: Build ───────────────────────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app

# Enable corepack for pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy workspace manifests first (layer-cache friendly)
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml .npmrc ./

# Copy each package's package.json for dependency installation layer cache
COPY packages/host/package.json      packages/host/package.json
COPY packages/shared/package.json    packages/shared/package.json
COPY packages/mf-data-export/package.json packages/mf-data-export/package.json
COPY packages/mf-couriers/package.json   packages/mf-couriers/package.json
COPY packages/mf-reports/package.json    packages/mf-reports/package.json

# Install all dependencies
RUN pnpm install --no-frozen-lockfile

# Copy full source (.dockerignore excludes node_modules and dist)
COPY packages/ packages/

# Link root node_modules into each package dir so webpack can find them
RUN for dir in packages/*/; do \
      [ ! -d "${dir}node_modules" ] && ln -sfn /app/node_modules "${dir}node_modules" || true; \
    done

# Inject API base URL at build time
ARG BASEURL=http://localhost/api
ENV BASEURL=$BASEURL

# Build host (webpack handles PostCSS/Tailwind now)
RUN pnpm --filter @ops-brain/host run build

# ─── Stage 2: Serve with Nginx ────────────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# host/dist contains everything (mf-data-export compiled into /mf-data-export/)
COPY --from=build /app/packages/host/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]