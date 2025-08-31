// test-options.ts
import { test as base } from '@playwright/test';
import { PageManager } from '../pw-example/page-objects/pageManager';

export type TestOptions = {
  globalsQaURL: string;
  formLayoutPage: string;
  pageManager: PageManager;
};

/**
 * Extend Playwright's test object with custom fixtures.
 */
export const test = base.extend<TestOptions>({
  /**
   * Resolve globalsQaURL in this priority:
   *  1. QA_URL environment variable
   *  2. baseURL from playwright.config.ts
   *  3. Fallback to http://localhost:4200
   */
  globalsQaURL: [
    process.env.QA_URL || base.info().project.use.baseURL || 'http://localhost:4200',
    { option: true }
  ],

  /**
   * Fixture that automatically navigates to Form Layout page.
   */
  formLayoutPage: async ({ page, globalsQaURL }, use) => {
    await page.goto(globalsQaURL);
    await page.getByText('Forms').click();
    await page.getByText('Form Layouts').click();

    await use('');
    console.log('Tear Down: formLayoutPage done');
  },

  /**
   * Provides a ready-to-use PageManager instance.
   */
  pageManager: async ({ page, formLayoutPage }, use) => {
    const pm = new PageManager(page);
    await use(pm);
  },
});
