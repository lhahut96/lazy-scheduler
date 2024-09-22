FROM oven/bun:latest
WORKDIR /

COPY package.json ./
COPY bun.lockb ./

RUN bun install
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

CMD ["bun", "build"]