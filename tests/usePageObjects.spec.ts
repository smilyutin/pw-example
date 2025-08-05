// tests/usePageObjects.spec.ts
import { test, expect } from '../test-options' //'@playwright/test';                // Playwright test runner APIs
import { PageManager } from '../page-objects/pageManager';         // Centralized page manager
import { faker} from '@faker-js/faker'

// Start the Angular app before each test
test.beforeEach(async ({ page }) => {
  await page.goto('http://localhost:4200/');                      // Navigate to the app root
});

// Test: navigate through all pages via PageManager
test('navigate to form page', async ({ page }) => {
  test.slow();                                                   // Mark this test as slow for extra timeout
  const pm = new PageManager(page);                              // Instantiate manager with the Playwright page

  // Use the navigation page under the manager to visit each section
  await pm.navigateTo().formLayoutsPage();                       // Click "Form Layouts"
  await pm.navigateTo().datepickerPage();                        // Click "Datepicker"
  await pm.navigateTo().smartTablePage();                        // Click "Smart Table"
  await pm.navigateTo().toastrPage();                           // Click "Toastr"
  await pm.navigateTo().tooltipPage();                          // Click "Tooltip"
});

// Test: interact with forms and datepicker using parametrized inputs
test('parametrized methods', async ({ page }) => {
  test.slow();                                                   // Slow mode for stability
  const pm = new PageManager(page);                              // Reuse PageManager for pages
  const randomFullName = faker.person.fullName()
  const randomEmail = `${randomFullName.replace(' ','')}${faker.number.int(1000)}@test.com`
  // Form Layout interactions
  await pm.navigateTo().formLayoutsPage();                       // Go to form page
  await pm.onFormLayoutsPage()
    .submitUsingTheGridFormWithCredentialsAndSelectOption(
      process.env.USERNAME,                                            // email value
      process.env.PASSWORD,                                                 // password value
      'Option 1'                                                 // dropdown selection
    );
    await page.screenshot({path: 'screenshots/formLayoutsPage.png'})
    const buffer = await page.screenshot()
    console.log(buffer.toString('base64'))

  await pm.onFormLayoutsPage()
    .submitInLineFormWithNameEmailAndCheckbox(
      randomFullName,                                           // name input
      randomEmail,                                        // email input
      true  );                                                // checkbox toggle
    
await page.locator('nb-card', {hasText: "inline form"}).screenshot({path: 'screenshots/inlineForm.png'})  
  // Datepicker interactions
  // await pm.navigateTo().datepickerPage();                        // Open datepicker
  // await pm.onDatepickerPage().selectCommonDatePickerDateFromToday(2);  // Select date 2 days ahead
  // await pm.onDatepickerPage().selectDatepickerWithRangeFromToday(0, 2);  // Select range today to +2 days
});