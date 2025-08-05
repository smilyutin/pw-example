// test-options.ts
import { test as base } from '@playwright/test';
import { PageManager } from '../pw-example/page-objects/pageManager';

/**
 * Custom Test Options
 * - globalsQaURL: Allows you to pass a base demo URL (like Global QA site)
 * - formLayoutPage: Auto-navigates to the Form Layout page and tears down afterward
 * - pageManager: Provides a PageManager instance with all your page objects
 */
export type TestOptions = {
  globalsQaURL: string;         // custom URL fixture
  formLayoutPage: string;       // auto-navigation fixture
  pageManager: PageManager;     // ready-to-use PageManager fixture
};

/**
 * Extend Playwright's test object with custom fixtures.
 * This allows you to auto-inject helpers or pre-navigate to pages
 * without repeating setup code in every test.
 */
export const test = base.extend<TestOptions>({
  /**
   * Example of a simple fixture that can be overridden from test.use()
   * or config. Default value is an empty string.
   */
  globalsQaURL: ['', { option: true }],

  /**
   * Fixture that automatically:
   *  1. Navigates to `/` (your baseURL must be set in playwright.config.ts)
   *  2. Clicks `Forms` → `Form Layouts`
   *  3. Provides a value (here we pass empty string) to indicate ready state
   *  4. Runs teardown after the test finishes
   */
  formLayoutPage: async ({ page }, use) => {
    await page.goto('/');                         // navigate to app root
    await page.getByText('Forms').click();        // open Forms menu
    await page.getByText('Form Layouts').click(); // go to Form Layouts page

    await use('');                                // provide fixture value
    console.log('Tear Down: formLayoutPage done');
  },

  /**
   * Fixture that returns a ready-to-use PageManager instance
   * - Depends on formLayoutPage to ensure the page is already navigated
   * - This means any test using pageManager automatically starts on Form Layouts
   */
  pageManager: async ({ page, formLayoutPage }, use) => {
    const pm = new PageManager(page); // Initialize page object manager
    await use(pm);                     // Make it available to the test
    // no teardown needed
  },
});