// playwright.argos.config.ts
import base from './playwright.config';
import type { ReporterDescription } from '@playwright/test';

const reporter: ReporterDescription[] = [
  ['line'],
  ['@argos-ci/playwright/reporter', { token: process.env.ARGOS_TOKEN }],
];

export default {
  ...base,
  reporter,
};