import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import type { TestOptions } from './test-options';
require('dotenv').config();

export default defineConfig<TestOptions>({
  testDir: path.join(__dirname, 'tests'),
  outputDir: path.join(__dirname, 'test-results'),
  reporter: [['html', { outputFolder: path.join(__dirname, 'playwright-report'), open: 'never' }]],
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 2,
  workers: process.env.CI ? 1 : undefined,

  use: {
    globalsQaURL: 'https://www.globalsqa.com/demo-site/draganddrop/',
    baseURL: process.env.DEV === '1' ? 'http://localhost:4200'
          : process.env.STAGING === '1' ? 'http://localhost:4200'
          : 'http://localhost:4200',
    headless: !!process.env.CI,
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
    // {
    //   name: 'firefox',
    //   use: {
    //     browserName: 'firefox',
    //     video: { mode: 'on', size: { width: 1920, height: 1080 } }, // ✅ Correct placement
    //   },
    // },
    {
      name: 'pageObjectFullScreen',
      testMatch: 'usePageObjects.spec.ts',
      use: { viewport: { width: 1920, height: 1080 } },
    },
  ],
  webServer: {
  command: 'npm run start -- --host 0.0.0.0', // bind Angular to all interfaces
  url: 'http://localhost:4200/',
  timeout: 120000,            // give Angular more time
  reuseExistingServer: false,  // inside CI/container, start fresh
},
});