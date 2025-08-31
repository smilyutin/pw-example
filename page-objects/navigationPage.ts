// page-objects/navigationPage.ts
import { Page, expect, Locator } from '@playwright/test';
import { HelperBase } from './helperBase';

export class NavigationPage extends HelperBase {
  constructor(page: Page) { super(page); }

  // ── Public navigations ────────────────────────────────────────────────────
  async formLayoutsPage() {
    await this.ensureAppLoaded();
    await this.clickSidebarLeaf('Forms', 'Form Layouts', {
      texts: [/Using the Grid/i, /Inline form/i, /Form without labels/i],
    });
  }

  async datepickerPage() {
    await this.ensureAppLoaded();
    await this.clickSidebarLeaf('Forms', 'Datepicker', {
      texts: [/Common Datepicker/i, /Range Datepicker/i],
    });
  }

  async smartTablePage() {
    await this.ensureAppLoaded();
    await this.clickSidebarLeaf('Tables & Data', 'Smart Table', {
      texts: [/Smart Table/i],
    });
  }

  async toastrPage() {
    await this.ensureAppLoaded();
    await this.clickSidebarLeaf('Modal & Overlays', 'Toastr', {
      texts: [/Toastr/i, /Show toast/i],
      buttons: [/Show toast/i],
    });
  }

  async tooltipPage() {
    await this.ensureAppLoaded();
    await this.clickSidebarLeaf('Modal & Overlays', 'Tooltip', {
      texts: [/Tooltip With Icon/i, /Tooltip Placements/i, /Colored Tooltips/i],
    });
  }
/** Assert the Tooltip link exists in the sidebar (anchor only). */
public async assertTooltipLinkVisible() {
  const sidebar = this.page.locator('nb-sidebar, aside').first();

  // Prefer explicit title=… anchor, otherwise fall back to role=link by name.
  const tooltipLink = sidebar
    .locator('a[title="Tooltip"]')          // <a title="Tooltip">
    .first()
    .or(sidebar.getByRole('link', { name: /^Tooltip$/i }).first())
    .locator('xpath=self::a');              // ⬅ ensure we end up with <a> only

  await tooltipLink.waitFor({ state: 'visible', timeout: 10_000 });
}

  // ── Core flow ─────────────────────────────────────────────────────────────
  private async clickSidebarLeaf(
    groupTitle: string,
    leafTitle: string,
    verify: { texts: RegExp[]; buttons?: RegExp[] },
  ) {
    const sidebar = this.page.locator('nb-sidebar, aside').first();

    // expand group (anchor only)
    const groupLink = this.groupAnchor(sidebar, groupTitle);
    await groupLink.waitFor({ state: 'visible', timeout: 10_000 });
    await this.expandGroupUntilOpen(groupLink);

    // click leaf (anchor only)
    const leaf = this.leafAnchor(sidebar, leafTitle);
    await this.safeClickAnchor(leaf);

    await this.waitForAnyUi(verify.texts, verify.buttons ?? [], 20_000);
  }
// Prove we're on the Form Layouts page by URL + one of the known headers/breadcrumbs.
public async assertFormLayoutsVisible() {
  await this.page.waitForURL('**/pages/forms/layouts', { timeout: 15_000 });

  // Wait for content area to render at least one card
  await this.page.locator('nb-layout-column nb-card').first().waitFor({ state: 'visible', timeout: 10_000 });

  const column = this.page.locator('nb-layout-column').first();

  // Any of these headers exist on the page
  const candidates = [
    /Using the Grid/i,
    /Inline form/i,
    /Form without labels/i,
    /Basic form/i,
  ];

  for (const re of candidates) {
    if (await column.locator('nb-card-header', { hasText: re }).first().isVisible().catch(() => false)) {
      return;
    }
  }

  // Fallback: breadcrumb contains "Form Layouts"
  const breadcrumbOk = await this.page.locator('nb-breadcrumb, nav[aria-label="breadcrumb"]').getByText(/Form Layouts/i)
    .first().isVisible().catch(() => false);
  if (breadcrumbOk) return;

  throw new Error('Form Layouts page not detected: none of the expected headers/breadcrumb were visible.');
}
  /** Anchor (<a>) for a leaf by title or accessible name. */
  private leafAnchor(sidebar: Locator, title: string) {
    const byTitle = sidebar.locator(`a[title="${title}"]`).first();
    const byRole = sidebar.getByRole('link', {
      name: new RegExp(`^${this.escape(title)}$`, 'i'),
    }).first();
    // Prefer title=… if present, else fall back to role=link by name
    return byTitle.or(byRole).locator('xpath=self::a'); // ensure it's <a> (no parent <li>)
  }

  /** Anchor (<a>) for a group by title or accessible name. */
  private groupAnchor(sidebar: Locator, title: string) {
    const byTitle = sidebar.locator(`a[title="${title}"]`).first();
    const byRole = sidebar.getByRole('link', {
      name: new RegExp(`^${this.escape(title)}$`, 'i'),
    }).first();
    return byTitle.or(byRole).locator('xpath=self::a'); // ensure single anchor
  }

  /** Expand a menu group until aria-expanded="true". */
  private async expandGroupUntilOpen(groupLink: Locator) {
    for (let i = 0; i < 4; i++) {
      const expanded = await groupLink.getAttribute('aria-expanded');
      if (expanded === 'true') return;
      await groupLink.click();
      await this.page.waitForTimeout(150);
      if (await groupLink.getAttribute('aria-expanded') === 'true') return;
    }
    await groupLink.click({ force: true });
    await this.page.waitForTimeout(150);
  }

  /** Click anchor ensuring nothing intercepts pointer events. */
  private async safeClickAnchor(anchor: Locator) {
    await anchor.waitFor({ state: 'visible', timeout: 10_000 });
    await anchor.evaluate(el => el.scrollIntoView({ block: 'center', inline: 'nearest' }));
    await anchor.click(); // with anchors only, interception issues go away
  }

  /** Wait for ANY matching headers or buttons to prove navigation. */
  private async waitForAnyUi(headerTexts: RegExp[], buttonTexts: RegExp[], timeoutMs: number) {
    const column = this.page.locator('nb-layout-column').first();
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      for (const re of headerTexts) {
        if (await column.locator('nb-card-header', { hasText: re }).first().isVisible().catch(() => false)) return;
        if (await this.page.getByRole('heading', { name: re }).first().isVisible().catch(() => false)) return;
      }
      for (const re of buttonTexts) {
        if (await this.page.getByRole('button', { name: re }).first().isVisible().catch(() => false)) return;
      }
      await this.page.waitForTimeout(100);
    }
    throw new Error(
      `Timed out after ${timeoutMs}ms waiting for any of headers: ${headerTexts.map(r => r.source).join(' | ')}`
      + (buttonTexts.length ? ` or buttons: ${buttonTexts.map(r => r.source).join(' | ')}` : '')
    );
  }

  private async ensureAppLoaded() {
    if (this.page.url() === 'about:blank') await this.page.goto('/');
    await expect(this.page.locator('nb-layout')).toBeVisible({ timeout: 15_000 });
    await expect(this.page.locator('nb-sidebar, aside')).toBeVisible({ timeout: 15_000 });
  }

  private escape(s: string) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}