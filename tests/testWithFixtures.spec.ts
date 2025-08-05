// tests/usePageObjects.spec.ts
import { test } from '../test-options';         // ✅ Import the extended test with fixtures
import { faker } from '@faker-js/faker';        // ✅ Faker for generating random data

/**
 * Test: interact with forms and datepicker using parameterized inputs
 * - Uses the `pageManager` fixture, which is initialized in test-options.ts
 * - Automatically navigates to the Form Layouts page (via formLayoutPage fixture)
 * - Demonstrates:
 *    1. Submitting the grid form with credentials and a dropdown selection
 *    2. Submitting the inline form with random name/email + checkbox
 */
test('parametrized methods', async ({ pageManager }) => {
  // Generate dynamic test data using Faker
  const randomFullName = faker.person.fullName();
  const randomEmail = `${randomFullName.replace(' ', '')}${faker.number.int(1000)}@test.com`;

  /**
   * 1️⃣ Submit the Grid Form using credentials from environment variables
   * - Pulls email/password from .env (via process.env)
   * - Selects "Option 1" in the dropdown
   */
  await pageManager.onFormLayoutsPage()
    .submitUsingTheGridFormWithCredentialsAndSelectOption(
      process.env.USERNAME,     // email value from .env
      process.env.PASSWORD,     // password value from .env
      'Option 1'                // dropdown selection
    );

  /**
   * 2️⃣ Submit the Inline Form using randomized test data
   * - Helps ensure tests are more robust against caching or duplicates
   */
  await pageManager.onFormLayoutsPage()
    .submitInLineFormWithNameEmailAndCheckbox(
      randomFullName,           // name input
      randomEmail,              // email input
      true                      // checkbox toggle
    );

  console.log(`✅ Submitted forms with ${randomFullName} / ${randomEmail}`);
});