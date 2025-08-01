// page-objects/pageManager.ts
import { Page } from '@playwright/test';                          // Playwright Page type
import { NavigationPage } from './navigationPage';                // Navigation helpers
import { FormLayoutPage } from './formLayoutsPage';               // Form page helpers
import { DatepickerPage } from './datepickerPage';                 // Datepicker helpers

// PageManager centralizes all page objects behind a single interface
export class PageManager {
  private readonly page: Page;
  private readonly navigationPage: NavigationPage;
  private readonly formLayoutsPage: FormLayoutPage;
  private readonly datepickerPage: DatepickerPage;

  constructor(page: Page) {
    this.page = page;                                            // Assign the Playwright page
    this.navigationPage = new NavigationPage(page);              // Instantiate Navigation
    this.formLayoutsPage = new FormLayoutPage(page);            // Instantiate Form Layout
    this.datepickerPage = new DatepickerPage(page);             // Instantiate Datepicker
  }

  // Return the navigation object to drive clicking through menus
  navigateTo() {
    return this.navigationPage;
  }

  // Return the form layouts page object for form interactions
  onFormLayoutsPage() {
    return this.formLayoutsPage;
  }

  // Return the datepicker page object for date interactions
  onDatepickerPage() {
    return this.datepickerPage;
  }
}