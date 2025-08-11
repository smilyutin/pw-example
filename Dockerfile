FROM mcr.microsoft.com/playwright:v1.54.1-jammy

WORKDIR /app

# Install deps first for better cache
COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Copy the rest
COPY . .

# Install browsers & system deps
RUN npx playwright install --with-deps

# CI=true makes Playwright headless by default
ENV CI=1

# Run only Chromium
CMD ["npx", "playwright", "test", "tests/usePageObjects.spec.ts", "--project=chromium"]