import { expect } from '@playwright/test';
import { test } from '../test-options';

// Flaky external site => give it a little more time
test('drag and drop with iframe', async ({ page, globalsQaURL }) => {
  test.slow();

  // Prefer fixture value; fall back to env; finally hardcoded demo URL
  const targetUrl =
    globalsQaURL ||
    process.env.QA_EXTERNAL_URL ||
    'https://www.globalsqa.com/demo-site/draganddrop/#Photo%20Manager';

  // DO NOT wait for 'networkidle' here
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30_000 });

  // Make sure “Photo Manager” tab is active (sometimes not selected by default)
  const photoTab = page.getByRole('tab', { name: /photo manager/i }).first()
    .or(page.getByRole('link', { name: /photo manager/i }).first());
  if (await photoTab.isVisible().catch(() => false)) {
    await photoTab.click().catch(() => {});
  }

  // Best-effort cookie banner dismissal
  for (const btn of [
    page.getByRole('button', { name: /accept/i }),
    page.getByRole('button', { name: /agree/i }),
    page.locator('text=/accept all cookies/i'),
  ]) {
    if (await btn.isVisible().catch(() => false)) { await btn.click().catch(() => {}); break; }
  }

  // Wait for the iframe itself
  const iframeLocator = page.locator('[rel-title="Photo Manager"] iframe');
  await iframeLocator.waitFor({ state: 'visible', timeout: 15_000 });

  const frame = page.frameLocator('[rel-title="Photo Manager"] iframe');

  // Wait for gallery items & trash to be ready inside the iframe
  const item2 = frame.locator('li', { hasText: 'High Tatras 2' }).first();
  const item4 = frame.locator('li', { hasText: 'High Tatras 4' }).first();
  const trash = frame.locator('#trash');

  await Promise.all([
    item2.waitFor({ state: 'visible', timeout: 10_000 }),
    item4.waitFor({ state: 'visible', timeout: 10_000 }),
    trash.waitFor({ state: 'visible', timeout: 10_000 }),
  ]);

  // Drag via API
  await item2.dragTo(trash);

  // Drag via mouse API (alt approach)
  await item4.hover();
  await page.mouse.down();
  await trash.hover();
  await page.mouse.up();

  // Verify both images are in trash
  await expect(frame.locator('#trash li h5')).toHaveText(['High Tatras 2', 'High Tatras 4']);
});