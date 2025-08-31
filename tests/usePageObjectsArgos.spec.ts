// tests/usePageObjectsArgos.spec.ts
import { test } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';

// --- Safe Argos helper -------------------------------------------------------
type ArgosFn = (page: any, name: string) => Promise<any>;
let argosFn: ArgosFn | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@argos-ci/playwright');
  if (mod && typeof mod.argosScreenshot === 'function') {
    argosFn = mod.argosScreenshot as ArgosFn;
  }
} catch {
  // package not installed – that's fine
}

async function argosSnap(page: any, name: string) {
  if (!argosFn) return;                        // not available
  if (!process.env.ARGOS_TOKEN) return;        // token not provided
  await argosFn(page, name);
}
// -----------------------------------------------------------------------------


// Start the Angular app before each test
test.beforeEach(async ({ page }) => {
  await page.goto(process.env.BASE_URL || 'http://localhost:4200/');
});

test('testing with agros ci', async ({ page }) => {
  const pm = new PageManager(page);

  await pm.navigateTo().formLayoutsPage();
  await argosSnap(page, 'forms layout page');      // ✅ safe call

  await pm.navigateTo().datepickerPage();
  await argosSnap(page, 'date picker page');       // ✅ safe call

  // add more steps + argosSnap(...) as needed
});