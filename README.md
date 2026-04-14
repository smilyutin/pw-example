# Playwright UI Automation Training – Ngx-Admin (Angular 14)

This project is a **lightweight fork** of the Akveo Ngx-Admin Angular 14 dashboard, tailored for practicing **UI automation with Playwright**.

- Original Ngx-Admin repo: https://github.com/akveo/ngx-admin
- Tech stack: Angular 14, TypeScript, Playwright

Use this repo to experiment with:
- basic Playwright tests,
- page object patterns,
- visual regression via Argos,
- UI components and flows from a real-world-style admin app.

---

## Getting started

Install dependencies:

> npm install

Run the Angular app locally (development mode):

> npm_config_script_shell=/bin/bash npm run ng:start

The app will be available at `http://localhost:4200` by default.

Install Playwright browsers if needed:

> npx playwright install

---

## Running Playwright tests

Run the full Playwright test suite:

> npx playwright test

Run tests with UI mode:

> npx playwright test --ui

Run a specific test file (example):

> npx playwright test tests/uiComponents.spec.ts

Playwright configuration lives in:
- `playwright.config.ts` – default config
- `playwright-prod.config.ts` – prod-oriented config
- `playwright.argos.config.ts` – visual regression / Argos config

HTML reports are generated under `playwright-report/` after a test run.

---

## Test plans vs. test code

- **Specs / test plans**: Markdown documents in `specs/` (e.g. high-level scenarios and coverage).
- **Automated tests**: Playwright test files in `tests/`.

When adding new coverage:
1. Document scenarios in `specs/`.
2. Implement or update corresponding Playwright tests in `tests/`.
3. Keep links or IDs in both so they stay aligned.

---

## Docker support

This repo includes a `Dockerfile` and `docker-compose.yaml` for running the app and tests in containers. If you’d like, we can extend this README with concrete Docker usage examples.