// tests/testWithFixtures.spec.ts
import { test } from '../test-options';         // ✅ Extended Playwright test with fixtures
import { faker } from '@faker-js/faker';

/**
 * Demo spec using the custom fixtures from test-options.ts
 * - Relies on:
 *   1. `formLayoutPage` fixture → automatically navigates to Form Layouts
 *   2. `pageManager` fixture → provides ready-to-use PageManager
 */
test.describe('Fixtures demo', () => {
  test('parametrized methods', async ({ pageManager }) => {
    // 🔐 Use env creds safely with defaults
    const email = (process.env.USERNAME ?? 'qa@example.com').trim();
    const password = (process.env.PASSWORD ?? 'Secret123!').trim();

    // 🎲 Fake user for inline form
    const randomFullName = faker.person.fullName();
    const randomEmail =
      `${randomFullName.replace(/\s+/g, '')}${faker.number.int({ min: 1, max: 9999 })}@test.com`
        .toLowerCase();

    // 1️⃣ Submit Grid form (uses env creds or defaults)
    await test.step('Submit Grid form with env creds', async () => {
      await pageManager
        .onFormLayoutsPage()
        .submitUsingTheGridFormWithCredentialsAndSelectOption(
          email,
          password,
          'Option 1',
        );
    });

    // 2️⃣ Submit Inline form (randomized data)
    await test.step('Submit Inline form with random data', async () => {
      await pageManager
        .onFormLayoutsPage()
        .submitInLineFormWithNameEmailAndCheckbox(
          randomFullName,
          randomEmail,
          true,
        );
    });

    console.log(`✅ Fixtures demo submitted with ${email}/${password} and ${randomFullName}/${randomEmail}`);
  });
});