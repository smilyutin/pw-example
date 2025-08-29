import { defineConfig, devices } from '@playwright/test';

const reporters: any[] = [
  // nice + portable defaults
  ['list'],                           // local
  // ['html'],                        // uncomment if you want HTML reporter locally
];

// Only enable Argos in CI on Linux with a token (avoids sharp on macOS dev)
if (
  process.env.CI === '1' &&
  process.platform === 'linux' &&
  process.env.ARGOS_TOKEN
) {
  reporters.push(['@argos-ci/playwright/reporter', {
    uploadToArgos: true,
    // project & build options if you use them:
    // project: process.env.GITHUB_REPOSITORY ?? 'my-project',
    // branch: process.env.GITHUB_REF_NAME,
    // commit: process.env.GITHUB_SHA,
  }]);
}

export default defineConfig({
  testDir: './tests',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: reporters,
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:4200',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  // webServer: { command: 'npm run ng:start', port: 4200, reuseExistingServer: true },
});