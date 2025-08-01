// page-objects/datepickerPage.ts
import { Page, expect } from '@playwright/test';                  // Page & assertions
import { HelperBase } from './helperBase';                        // Base class for common helpers

// DatepickerPage extends HelperBase to reuse shared methods
export class DatepickerPage extends HelperBase {
  constructor(page: Page) {
    super(page);                                                  // Call base constructor
  }

  /**
   * Opens the common date picker and selects a date N days from today
   */
  async selectCommonDatePickerDateFromToday(offset: number) {
    const calendarInput = this.page.getByPlaceholder('Form Picker');
    await calendarInput.click();                                  // Open the picker
    const dateString = await this.selectDateInTheCalendar(offset);
    await expect(calendarInput).toHaveValue(dateString);          // Verify input value updated
  }

  /**
   * Opens the range date picker and selects a start/end range
   */
  async selectDatepickerWithRangeFromToday(startOffset: number, endOffset: number) {
    const calendarInput = this.page.getByPlaceholder('Range Picker');
    await calendarInput.click();                                  // Open the range picker
    const startDate = await this.selectDateInTheCalendar(startOffset);
    const endDate = await this.selectDateInTheCalendar(endOffset);
    const rangeString = `${startDate} - ${endDate}`;
    await expect(calendarInput).toHaveValue(rangeString);         // Verify range value
  }

  /**
   * Core method to navigate the calendar UI and click the correct day cell
   */
  private async selectDateInTheCalendar(offset: number): Promise<string> {
    // Calculate the target date
    const date = new Date();
    date.setDate(date.getDate() + offset);
    const dayStr = date.getDate().toString();                     // e.g. "30"
    const monthShort = date.toLocaleString('en-US', { month: 'short' }); // e.g. "Jul"
    const monthLong = date.toLocaleString('en-US', { month: 'long' });   // e.g. "July"
    const year = date.getFullYear();                              // e.g. 2025
    const formatted = `${monthShort} ${dayStr}, ${year}`;        // e.g. "Jul 30, 2025"

    // Advance calendar until the correct month/year appears
    let header = await this.page.locator('nb-calendar-view-mode').textContent();
    const target = `${monthLong} ${year}`;
    while (!header.includes(target)) {
      await this.page
        .locator('nb-calendar-pageable-navigation [data-name="chevron-right"]')
        .click();                                                  // Next month arrow
      header = await this.page.locator('nb-calendar-view-mode').textContent();
    }

    // Filter only current-month day cells, click the first matching day
    const days = this.page
      .locator('.day-cell.ng-star-inserted:not(.bounding-month)')
      .filter({ hasText: dayStr });                               // Text match
    const count = await days.count();                             // How many matches?
    console.log(`Found ${count} day(s) matching "${dayStr}"`);
    if (count === 0) {
      throw new Error(`No day matching "${dayStr}" found`);
    }
    await days.first().click();                                   // Click the first one

    return formatted;                                             // Return for assertion
  }
}