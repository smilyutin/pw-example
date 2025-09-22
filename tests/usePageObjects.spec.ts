// tests/usePageObjects.spec.ts
import { expect } from '@playwright/test';
import { test } from '../test-options';
import { PageManager } from '../page-objects/pageManager';
import { faker } from '@faker-js/faker';
//import { argosScreenshot as argosSnap } from './utils/argos';
import { argosSnap } from './utils/argos';

import * as fs from 'fs';

const ensureScreenshotsDir = () => {
  try { fs.mkdirSync('screenshots', { recursive: true }); } catch {}
};

test('navigate to form page', async ({ pageManager }) => {
  test.slow();

  await pageManager.navigateTo().formLayoutsPage();
  await pageManager.navigateTo().datepickerPage();
  await pageManager.navigateTo().smartTablePage();
  await pageManager.navigateTo().toastrPage();
  await pageManager.navigateTo().tooltipPage();

  // Optional extra proof Tooltip is reachable — uses the public helper
  await pageManager.navigateTo().assertTooltipLinkVisible();

  // If you still want a direct sidebar check, keep it scoped + anchor-only:
  const page = pageManager.getPage();
  const sidebar = page.locator('nb-sidebar, aside').first();
  const tooltipLink = sidebar
    .locator('a[title="Tooltip"]').first()
    .or(sidebar.getByRole('link', { name: /^Tooltip$/i }).first())
    .locator('xpath=self::a'); // ensure single <a>
  await tooltipLink.waitFor({ state: 'visible', timeout: 10_000 });

  // And verify a Tooltip card really rendered:
  const column = page.locator('nb-layout-column').first();
  await column
    .locator('nb-card-header', { hasText: /Tooltip (With Icon|Placements|Colored)/i })
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
});

test('parametrized methods', async ({ pageManager, page }) => {
  test.slow();

  const email = (process.env.USERNAME ?? 'qa@example.com').trim();
  const password = (process.env.PASSWORD ?? 'Secret123!').trim();

  const randomFullName = faker.person.fullName();
  const randomEmail = `${randomFullName.replace(/\s+/g, '')}${faker.number.int({ min: 1, max: 9999 })}@test.com`
    .toLowerCase();

  await pageManager
    .onFormLayoutsPage()
    .submitUsingTheGridFormWithCredentialsAndSelectOption(email, password, 'Option 1');

  await pageManager
    .onFormLayoutsPage()
    .submitInLineFormWithNameEmailAndCheckbox(randomFullName, randomEmail, true);

  ensureScreenshotsDir();
  await page.screenshot({ path: 'screenshots/formLayoutsPage.png', fullPage: true });
  await page.locator('nb-card', { hasText: /Inline form/i }).screenshot({ path: 'screenshots/inlineForm.png' });

  // Use the aliased helper consistently
  await argosSnap(page, 'Form Layouts - after submit');

  await expect(
    page.locator('nb-card', { hasText: /Using the Grid/i }).getByRole('button')
  ).toBeVisible();
});

test('testing with agros ci', async ({ page }) => {
  test.slow();

  const pm = new PageManager(page);

  await pm.navigateTo().formLayoutsPage();
  await argosSnap(page, 'forms layout page');

  await pm.navigateTo().datepickerPage();
  await argosSnap(page, 'date picker pages');

  // add more steps + argosSnap(...) as needed
});