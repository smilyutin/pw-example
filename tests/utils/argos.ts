import type { Page } from '@playwright/test';

// Try to load Argos at runtime. If not available (local dev), we no-op.
let impl: null | ((page: Page, name: string, options?: any) => Promise<any>) = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@argos-ci/playwright');
  impl = mod && mod.argosScreenshot ? mod.argosScreenshot : null;
} catch {
  impl = null;
}

/**
 * Safe wrapper around argosScreenshot.
 * - In CI (Node 20) with @argos-ci/playwright installed, this calls the real thing.
 * - Locally, it becomes a no-op (so no sharp/native deps needed).
 */
export function argosScreenshot(page: Page, name: string, options?: any): Promise<void> {
  if (impl) return impl(page, name, options);
  return Promise.resolve();
}