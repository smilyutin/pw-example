import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';
import type { TestOptions } from './test-options';
import 'dotenv/config';

const BASE_URL =
  process.env.BASE_URL ??
  (process.env.DEV === '1' ? 'http://localhost:4200'
  : process.env.STAGING === '1' ? 'http://localhost:4200'
  : 'http://localhost:4200');

// Build reporters array once; add Argos only if token exists.
const reporters: any[] = [
  process.env.CI ? ['dot'] : ['list'],
  ['html', { outputFolder: path.join(__dirname, 'playwright-report'), open: 'never' }],
  ['github'],
];

if (process.env.ARGOS_TOKEN) {
  reporters.push([
    '@argos-ci/playwright/reporter',
    {
      uploadToArgos: !!process.env.CI,
      token: process.env.ARGOS_TOKEN,
    },
  ]);
}

export default defineConfig<TestOptions>({
  testDir: path.join(__dirname, 'tests'),
  outputDir: path.join(__dirname, 'test-results'),

  // one reporter property only
  reporter: reporters,

  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  use: {
    globalsQaURL: 'https://www.globalsqa.com/demo-site/draganddrop/',
    baseURL: BASE_URL,
    headless: !!process.env.CI,
    viewport: { width: 1280, height: 720 },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    navigationTimeout: 6000,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    {
      name: 'pageObjectFullScreen',
      testMatch: 'usePageObjects.spec.ts',
      use: { viewport: { width: 1920, height: 1080 } },
    },
    // Enable later if needed:
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  webServer: {
    command: 'npm run start -- --host 0.0.0.0',
    url: 'http://localhost:4200/',
    timeout: 120_000,
    reuseExistingServer: !process.env.CI,
  },
});