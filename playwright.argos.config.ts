// playwright.argos.config.ts
import { defineConfig, type ReporterDescription } from '@playwright/test';
import base from './playwright.config';

const reporters: ReporterDescription[] = [['line']];
try {
  // Only include Argos reporter if the package is installed locally
  require.resolve('@argos-ci/playwright/reporter');
  reporters.push(['@argos-ci/playwright/reporter', { token: process.env.ARGOS_TOKEN }]);
} catch {
  // no-op: reporter not installed locally
}

export default defineConfig({
  ...base,
  reporter: reporters,
  use: {
    ...(base as any).use ?? {},
    baseURL: process.env.QA_URL || 'http://127.0.0.1:4200',
  },
  webServer: {
    command: 'npx http-server ./dist -p 4200 -s -c-1',
    url: process.env.QA_URL || 'http://127.0.0.1:4200',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});