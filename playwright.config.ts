// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,

  use: {
    // Make relative navigations like page.goto('/') valid:
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  // Serve the already-built Angular app from ./dist
  // (dist is restored by the download-artifact step in CI)
  webServer: {
    command: 'npx http-server ./dist -p 4200 -s',
    url: 'http://127.0.0.1:4200',
    reuseExistingServer: !process.env.CI,
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