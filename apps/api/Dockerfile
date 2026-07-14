# Build context must be the repo root:
#   docker build -f apps/api/Dockerfile -t sign-pkg-api .
#
# Uses `turbo prune` to isolate only the files @ubaton-ray/api needs from the
# monorepo, so the npm-install layer only invalidates when its own deps change.

FROM node:20-alpine AS base
# The npm bundled with node:20-alpine has a known bug ("Exit handler never
# called") that silently truncates node_modules (missing .bin symlinks) on
# large installs while still exiting 0. Pin a patched npm before installing.
RUN npm i -g npm@11 turbo@^2

FROM base AS pruner
WORKDIR /app
COPY . .
RUN turbo prune @ubaton-ray/api --docker

FROM base AS installer
WORKDIR /app
COPY --from=pruner /app/out/json/ .
# See apps/docs/Dockerfile for why this normalization is needed.
RUN npm pkg set packageManager="npm@10.8.0"
RUN npm ci || npm ci
COPY --from=pruner /app/out/full/ .
# turbo prune only copies each workspace's own directory — apps/api's
# tsconfig.json extends the shared root tsconfig.base.json, which lives
# outside that directory, so it has to be copied in explicitly.
COPY tsconfig.base.json tsconfig.base.json
RUN npx turbo run build --filter=@ubaton-ray/api

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=installer /app .

# Runtime configuration (DB, OAuth, session secret, CORS origin) is read from
# process.env at boot — inject it via `docker run -e` / compose env_file /
# your platform's secret manager, never baked into the image.
EXPOSE 4254
CMD ["node", "apps/api/dist/main.js"]
