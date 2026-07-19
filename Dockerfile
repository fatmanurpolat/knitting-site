# ── build stage: compile TypeScript ──────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── runtime stage: production deps + compiled app + templates/assets ─────────
FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
COPY views ./views
COPY public ./public
# Ensure templates/assets are readable by the non-root runtime user.
RUN chmod -R a+rX ./views ./public

EXPOSE 3000
USER node
CMD ["node", "dist/main.js"]
