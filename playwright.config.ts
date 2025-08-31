// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,

  use: {
    // baseURL picked from env (set in CI as QA_URL), otherwise defaults
    baseURL: process.env.QA_URL || process.env.BASE_URL || 'http://127.0.0.1:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  // Web server setup
  // - In CI: serve the already-built Angular app from ./dist
  // - Locally: run Angular dev server if needed, else reuse existing
  webServer: {
    command: process.env.CI
      ? 'npx http-server ./dist -p 4200 -s -c-1'
      : 'npx ng serve --configuration development --port 4200',
    url: process.env.QA_URL || 'http://127.0.0.1:4200',
    reuseExistingServer: true,   // avoids port-in-use error locally & CI
    timeout: 120_000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  reporter: [['line']],
});