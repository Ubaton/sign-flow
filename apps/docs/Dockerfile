# Build context must be the repo root:
#   docker build -f apps/docs/Dockerfile -t sign-pkg-docs .
#   docker run -p 3000:3000 -e API_ORIGIN=https://your-api.example.com sign-pkg-docs
#
# API_ORIGIN is read server-side at runtime (next.config.mjs's rewrites()),
# not baked in at build time — unlike the old static-export setup, changing
# it only needs a container restart, not a rebuild.

FROM node:20-alpine AS base
# The npm bundled with node:20-alpine has a known bug ("Exit handler never
# called") that silently truncates node_modules (missing .bin symlinks) on
# large installs while still exiting 0. Pin a patched npm before installing.
RUN npm i -g npm@11 turbo@^2

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @ubaton-ray/docs --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
# `turbo prune --docker` can write a malformed "packageManager" field (e.g.
# "yarn@npm@10.8.0") into the pruned package.json when both npm and yarn
# binaries/corepack shims are present — Next's build-time package-manager
# detection then tries to shell out to yarn and crashes. Force it back.
RUN npm pkg set packageManager="npm@10.8.0"
RUN npm ci || npm ci
COPY --from=pruner /app/out/full/ .
RUN npx turbo run build --filter=@ubaton-ray/docs

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=installer /app/apps/docs/.next/standalone ./
COPY --from=installer /app/apps/docs/.next/static ./apps/docs/.next/static
COPY --from=installer /app/apps/docs/public ./apps/docs/public
EXPOSE 3000
CMD ["node", "apps/docs/server.js"]
