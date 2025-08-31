// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

// 🔒 Ensure Playwright does NOT try to connect to a remote browser via env vars.
// Some shells/CI images inject these and cause "browserType.connect" timeouts.
delete process.env.PLAYWRIGHT_WS_ENDPOINT;
delete process.env.PW_TEST_CONNECT_WS_ENDPOINT;
delete process.env.PWTEST_CONNECT_WS_ENDPOINT;

const BASE =
  process.env.QA_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:4200';

export default defineConfig({
  testDir: './tests',
  timeout: 30_000,
  retries: process.env.CI ? 1 : 0,
  forbidOnly: !!process.env.CI,
  fullyParallel: false,             // keep it simple/stable; tweak if you want
  workers: process.env.CI ? 2 : undefined,

  expect: {
    timeout: 5_000,                 // default expect timeout for visibility checks, etc.
  },

  use: {
    baseURL: BASE,                  // so page.goto('/') works everywhere
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    actionTimeout: 0,               // no global action timeout (per-test timeouts still apply)
    navigationTimeout: 30_000,
  },

  // Web server:
  //  - In CI we serve the built Angular app from ./dist with http-server.
  //  - Locally we run ng serve (or reuse if it’s already running).
  webServer: {
    command: process.env.CI
      ? 'npx http-server ./dist -p 4200 -s -c-1'
      : 'npx ng serve --configuration development --port 4200',
    url: BASE,                      // honors QA_URL/BASE_URL overrides
    reuseExistingServer: true,      // avoids "port already used" locally & in CI re-runs
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