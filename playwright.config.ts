import { defineConfig, devices } from '@playwright/test';
import type { TestOptions } from './test-options';
require('dotenv').config();

export default defineConfig<TestOptions>({
  expect: {
    timeout: 5000,
  },
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    globalsQaURL: 'https://www.globalsqa.com/demo-site/draganddrop/',
    baseURL: process.env.DEV === '1' ? 'http://localhost:4200'
          : process.env.STAGING === '1' ? 'http://localhost:4200'
          : 'http://localhost:4200',
    headless: false,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
    navigationTimeout: 6000,
  },

  projects: [
    {
      name: 'dev',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200' },
    },
    {
      name: 'staging',
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:4200' },
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: {
        browserName: 'firefox',
        video: { mode: 'on', size: { width: 1920, height: 1080 } }, // ✅ Correct placement
      },
    },
    {
      name: 'pageObjectFullScreen',
      testMatch: 'usePageObjects.spec.ts',
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],
});