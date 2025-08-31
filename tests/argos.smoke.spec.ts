// tests/argos.smoke.spec.ts
import { test } from '@playwright/test';

// Safe dynamic import so local devs without the package don’t error
async function snap(page: any, name: string) {
  if (!process.env.ARGOS_TOKEN) return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { argosScreenshot } = require('@argos-ci/playwright');
    await argosScreenshot(page, name);
  } catch (e) {
    console.log('Argos not available:', (e as Error)?.message);
  }
}

test('argos smoke', async ({ page }) => {
  // hit your app root (served by Playwright webServer)
  await page.goto(process.env.QA_URL || 'http://127.0.0.1:4200/');
  await snap(page, 'Landing');
});