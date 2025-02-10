ARG NODE_VERSION=20.13.1

FROM node:${NODE_VERSION}-alpine AS base
WORKDIR /app
COPY package.json ./

#--

FROM base AS pnpm
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm@9.7.1 && pnpm fetch

#--

FROM pnpm AS prod-deps
RUN pnpm install --prod --frozen-lockfile --ignore-scripts

#--

FROM pnpm AS build
RUN pnpm install --frozen-lockfile --ignore-scripts
COPY . .
RUN pnpm build

#--

FROM base
ENV NODE_ENV production
COPY --from=prod-deps /app/node_modules /app/node_modules
COPY --from=build /app/dist /app/dist
COPY public /app/public

EXPOSE 8000
CMD ["node", "--enable-source-maps", "dist/index.js"]