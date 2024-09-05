FROM node:18-alpine AS builder

WORKDIR /processor

COPY ./processor .

RUN npm install

RUN npm run build

FROM node:18-alpine AS runner

WORKDIR /processor

COPY --from=builder /processor .

EXPOSE 8080

CMD [ "npm", "run", "start" ]

LABEL org.opencontainers.image.authors="Mollie B.V. <info@mollie.com>" \
    copyright="Copyright (c) 2024 Mollie B.V. All rights reserved."