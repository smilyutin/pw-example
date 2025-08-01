import { Page, Locator } from '@playwright/test'

/**
 * Page Object Model for navigating through the main sections of the UI.
 */
export class NavigationPage {
  readonly page: Page

  // Locators for individual menu items
  readonly formLayoutsMenuItem: Locator
  readonly datePickerMenuTem: Locator
  readonly smartTableMenuItem: Locator
  readonly toastrMenyItem: Locator
  readonly tooltipMenuItem: Locator

  /**
   * Constructor initializes all locators for navigation
   * @param page Playwright Page instance
   */
  constructor(page: Page) {
    this.page = page
    this.formLayoutsMenuItem = page.getByText('Form Layouts')
    this.datePickerMenuTem = page.getByText('Datepicker')
    this.smartTableMenuItem = page.getByText('Smart Table')
    this.toastrMenyItem = page.getByText('Toastr')
    this.tooltipMenuItem = page.getByText('Tooltip')
  }

  /**
   * Navigate to the "Form Layouts" page under "Forms" section
   */
  async formLayoutsPage() {
    await this.selectGroupMenuItem('Forms')
    await this.page.waitForTimeout(2000) // Wait for menu animation
    await this.formLayoutsMenuItem.click()
    await this.selectGroupMenuItem('Forms') // (Optional) ensure re-focus
  }

  /**
   * Navigate to the "Datepicker" page under "Forms" section
   */
  async datepickerPage() {
    await this.selectGroupMenuItem('Forms')
    await this.page.waitForTimeout(2000)
    await this.datePickerMenuTem.click()
  }

  /**
   * Navigate to the "Smart Table" page under "Tables & Data" section
   */
  async smartTablePage() {
    await this.selectGroupMenuItem('Tables & Data')
    await this.smartTableMenuItem.click()
  }

  /**
   * Navigate to the "Toastr" notification page under "Modal & Overlays"
   */
  async toastrPage() {
    await this.selectGroupMenuItem('Modal & Overlays')
    await this.toastrMenyItem.click()
  }

  /**
   * Navigate to the "Tooltip" page under "Modal & Overlays"
   */
  async tooltipPage() {
    await this.selectGroupMenuItem('Modal & Overlays')
    await this.tooltipMenuItem.click()
  }

  /**
   * Expand a group menu item (like "Forms" or "Tables & Data") if it's collapsed
   * @param groupItemTitle The title attribute of the group item to expand
   */
  private async selectGroupMenuItem(groupItemTitle: string) {
    const groupMenuItem = this.page.getByTitle(groupItemTitle)
    const expandState = await groupMenuItem.getAttribute('area-expanded')
    if (expandState === 'false') {
      await groupMenuItem.hover()
      await groupMenuItem.click()
    }
  }
}
