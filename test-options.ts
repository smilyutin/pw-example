// test-options.ts
import { test as base } from '@playwright/test';
import { PageManager } from '../pw-example/page-objects/pageManager';

export type TestOptions = {
  globalsQaURL: string;
  formLayoutPage: string;
  pageManager: PageManager;
};

export const test = base.extend<TestOptions>({
  globalsQaURL: [
    process.env.QA_EXTERNAL_URL ||
      'https://www.globalsqa.com/demo-site/draganddrop/#Photo%20Manager',
    { option: true },
  ],

  formLayoutPage: async ({ page }, use) => {
    await page.goto('/');
    await page.getByText('Forms').click();
    await page.getByText('Form Layouts').click();
    await use('');
  },

  pageManager: async ({ page, formLayoutPage }, use) => {
    const pm = new PageManager(page);
    await use(pm);
  },
});