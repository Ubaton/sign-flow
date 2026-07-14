# Build context must be the repo root:
#   docker build -f apps/docs/Dockerfile \
#     --build-arg NEXT_PUBLIC_API_URL=https://api.example.com \
#     -t sign-pkg-docs .
#
# Next.js static export inlines NEXT_PUBLIC_* vars into the JS bundle at
# `next build` time — there is no server to read them from at runtime, so
# they MUST be passed as build args, not env vars at `docker run`.

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

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
RUN npx turbo run build --filter=@ubaton-ray/docs

FROM nginx:1.27-alpine AS runner
COPY apps/docs/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=installer /app/apps/docs/out /usr/share/nginx/html
EXPOSE 80
