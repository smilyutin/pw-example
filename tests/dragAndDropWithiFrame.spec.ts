// tests/dragAndDropWithiFrame.spec.ts
import { expect } from '@playwright/test';
import { test } from '../test-options';

test('drag and drop with iframe', async ({ page, globalsQaURL }) => {
  // Prefer fixture value, then env, then relative (uses baseURL from config)
  const targetUrl = globalsQaURL || process.env.QA_URL || '/';
  await page.goto(targetUrl);
  await page.waitForLoadState('networkidle');

  const frame = page.frameLocator('[rel-title="Photo Manager"] iframe');

  // Ensure iframe contents are ready
  await frame.locator('body').first().waitFor();

  // Drag item 1 via dragTo API
  const item2 = frame.locator('li', { hasText: 'High Tatras 2' });
  const trash = frame.locator('#trash');
  await item2.waitFor();
  await trash.waitFor();
  await item2.dragTo(trash);

  // Drag item 2 using hover + mouse API to demonstrate alternative approach
  const item4 = frame.locator('li', { hasText: 'High Tatras 4' });
  await item4.waitFor();
  await item4.hover();
  await page.mouse.down();
  await trash.hover();
  await page.mouse.up();

  // Verify both images are in trash
  await expect(frame.locator('#trash li h5')).toHaveText(['High Tatras 2', 'High Tatras 4']);
});