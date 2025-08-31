// page-objects/formLayoutsPage.ts
import { Page, expect } from '@playwright/test';
import { HelperBase } from './helperBase';

export class FormLayoutPage extends HelperBase {
  constructor(page: Page) {
    super(page);
  }

  private coerce(value: unknown, fallback: string): string {
    if (typeof value === 'string' && value.trim().length > 0) return value.trim();
    return fallback;
  }

  /**
   * Fill "Using the Grid" form.
   * Empty/undefined values are replaced with safe defaults so tests never crash.
   */
  async submitUsingTheGridFormWithCredentialsAndSelectOption(
    email: string | undefined,
    password: string | undefined,
    optionText: string | undefined
  ) {
    const safeEmail = this.coerce(email, 'qa@example.com');
    const safePassword = this.coerce(password, 'Secret123!');
    const safeOption = this.coerce(optionText, 'Option 1');

    const usingTheGridForm = this.page.locator('nb-card', { hasText: 'Using the Grid' });
    await expect(usingTheGridForm).toBeVisible();

    await usingTheGridForm.getByRole('textbox', { name: 'Email' }).fill(safeEmail);
    await usingTheGridForm.getByRole('textbox', { name: 'Password' }).fill(safePassword);
    await usingTheGridForm.getByRole('radio', { name: safeOption }).check({ force: true });
    await usingTheGridForm.getByRole('button').click();
  }

  /**
   * Fill "Inline form".
   * Provides safe fallbacks and only checks the checkbox when requested.
   */
  async submitInLineFormWithNameEmailAndCheckbox(
    name: string | undefined,
    email: string | undefined,
    rememberMe: boolean
  ) {
    const safeName = this.coerce(name, 'Jane Doe');
    const safeEmail = this.coerce(email, 'qa+inline@example.com');

    const inlineForm = this.page.locator('nb-card', { hasText: 'Inline form' });
    await expect(inlineForm).toBeVisible();

    // In this Nebular demo, the accessible name for the first input is "Jane Doe"
    await inlineForm.getByRole('textbox', { name: 'Jane Doe' }).fill(safeName);
    await inlineForm.getByRole('textbox', { name: 'Email' }).fill(safeEmail);

    if (rememberMe) {
      await inlineForm.getByRole('checkbox').check({ force: true });
    }
    await inlineForm.getByRole('button').click();
  }
}