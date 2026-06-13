FROM node:22-bookworm-slim

WORKDIR /app/apps/wa-connector

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    chromium \
    ca-certificates \
    fonts-liberation \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

COPY apps/wa-connector/package*.json ./
RUN npm ci --omit=dev

COPY apps/wa-connector ./

EXPOSE 3010

CMD ["npm", "start"]
