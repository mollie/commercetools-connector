FROM node:18-alpine AS builder

WORKDIR /app

COPY ./package*.json ./

RUN npm install --frozen-lockfile

COPY . .

RUN npm run build 

RUN npm prune --production

FROM node:18-alpine AS runner

WORKDIR /app

# Copy only the necessary built files from the builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 8080

ENV NODE_ENV=production

CMD ["npm", "run", "start"]

# Metadata
LABEL org.opencontainers.image.authors="Mollie B.V. <info@mollie.com>" \
    copyright="Copyright (c) 2024 Mollie B.V. All rights reserved."
