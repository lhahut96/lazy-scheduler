FROM oven/bun

WORKDIR /app

# Copy package.json and package-lock.json (if exists)

COPY package.json bun.lockb ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

RUN bun run build

EXPOSE 3000

# Start app in development mode
CMD ["bun", "start"]