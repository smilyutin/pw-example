// tests/usePageObjectsArgos.spec.ts
import { test } from '@playwright/test';
import { PageManager } from '../page-objects/pageManager';
import { argosScreenshot as argosSnap } from './utils/argos'; // ✅ single source of truth

// Start the Angular app before each test
test.beforeEach(async ({ page }) => {
  await page.goto(process.env.BASE_URL || 'http://localhost:4200/');
});

test('testing with agros ci', async ({ page }) => {
  const pm = new PageManager(page);

  await pm.navigateTo().formLayoutsPage();
  await argosSnap(page, 'forms layout page');

  await pm.navigateTo().datepickerPage();
  await argosSnap(page, 'date picker page');

  // add more steps + argosSnap(...) as needed
});