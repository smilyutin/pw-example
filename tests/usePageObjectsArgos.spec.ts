// tests/usePageObjects.spec.ts
import { test, expect } from '@playwright/test';                // Playwright test runner APIs
import { PageManager } from '../page-objects/pageManager';         // Centralized page manager
import { faker} from '@faker-js/faker'
import { argosScreenshot } from "./utils/argos";

// Start the Angular app before each test
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200/');                      // Navigate to the app root
});

test('testing with agros ci', async ({ page }) => {
  test.slow();                                                   // Mark this test as slow for extra timeout
  const pm = new PageManager(page);                              // Instantiate manager with the Playwright page
let argosScreenshot: undefined | ((...args: any[]) => Promise<any>);
try {
  // Only resolves if @argos-ci/playwright is installed (CI or local if you installed it)
  ({ argosScreenshot } = require('@argos-ci/playwright'));
} catch (_) {}

if (argosScreenshot && process.env.ARGOS_TOKEN) {
  await argosScreenshot(page, 'some-name');
}
  // Use the navigation page under the manager to visit each section
  await pm.navigateTo().formLayoutsPage();  
  await argosScreenshot(page, "forms layout page");                     // Click "Form Layouts"
  await pm.navigateTo().datepickerPage(); 
  await argosScreenshot(page, "date picker page");                       // Click "Datepicker"
  // await pm.navigateTo().smartTablePage();                        // Click "Smart Table"
  // await pm.navigateTo().toastrPage();                           // Click "Toastr"
  // await pm.navigateTo().tooltipPage();                          // Click "Tooltip"
});
