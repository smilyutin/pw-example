// playwright.argos.config.ts
import { defineConfig, devices, type ReporterDescription } from '@playwright/test';
import base from './playwright.config';

const reporter: ReporterDescription[] = [
  ['line'],
  ['@argos-ci/playwright/reporter', { token: process.env.ARGOS_TOKEN }],
];

export default defineConfig({
  ...base,
  reporter,
  use: {
    ...base.use,
    baseURL: process.env.QA_URL || 'http://127.0.0.1:4200',
  },
  webServer: {
    // Since workflow already builds dist/, this serves it for Playwright
    command: 'npx http-server dist -p 4200 -s -c-1',
    url: process.env.QA_URL || 'http://127.0.0.1:4200',
    reuseExistingServer: true,   // avoids "already used" error
    timeout: 120_000,
  },
});