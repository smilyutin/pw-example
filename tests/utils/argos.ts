// tests/utils/argos.ts
import type { Page } from '@playwright/test';

let impl: ((page: Page, name: string) => Promise<unknown>) | null = null;
try {
  // Loaded only when installed (CI)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const mod = require('@argos-ci/playwright');
  if (mod && typeof mod.argosScreenshot === 'function') impl = mod.argosScreenshot;
} catch {}

export async function argosScreenshot(page: Page, name: string) {
  const hasToken = Boolean(process.env.ARGOS_TOKEN);
  const hasPkg = Boolean(impl);
  console.log(`[argos] token=${hasToken ? 'present' : 'MISSING'} pkg=${hasPkg ? 'loaded' : 'MISSING'} name="${name}"`);

  if (!hasToken || !hasPkg) return; // safe no-op locally / when package not installed

  try {
    const result = await impl!(page, name);
    console.log(`[argos] snapshot taken: ${name}`);
    return result;
  } catch (e) {
    console.error(`[argos] snapshot FAILED: ${name}:`, e);
    throw e; // fail the test so we see it in CI logs
  }
}
export async function argosSnap(page: any, name: string) {
  if (!process.env.ARGOS_TOKEN) return; // skip when no token
  try {
    const { argosScreenshot } = require('@argos-ci/playwright');
    await argosScreenshot(page, name);
  } catch (e) {
    console.log('Argos not available:', (e as Error)?.message);
  }
}