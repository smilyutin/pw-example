import { defineConfig } from '@playwright/test';
import 'dotenv/config'; // loads .env locally
// …
const hasArgos = !!process.env.ARGOS_TOKEN;
export default defineConfig({
  reporter: hasArgos
    ? [['@argos-ci/playwright/reporter', { token: process.env.ARGOS_TOKEN }], ['html']]
    : [['html']],
  // …rest of your config
});