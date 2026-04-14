# Specs

This folder is for **test plans**, not for executable Playwright tests.

Use it to:
- describe the scenarios you want to cover,
- list preconditions and data/setup requirements,
- outline edge cases and negative paths,
- capture open questions or follow‑ups.

## Recommended structure

When you add a new spec file (e.g. `ui-components.plan.md`), consider including:

1. **Overview** – short description of the feature or area under test.
2. **In scope / Out of scope** – what this plan does and does not cover.
3. **User flows / Scenarios** – bullet list of flows with IDs (e.g. `UC-01`, `UC-02`).
4. **Test cases** – for each scenario, note:
	- steps,
	- expected result,
	- important variations (browsers, viewport, locale, roles).
5. **Non‑functional checks** (optional) – performance, accessibility, security notes.
6. **Links** – related tickets, designs, docs, or automated tests.

## Relationship to automated tests

Specs in this directory are **documentation**. They:
- help decide *what* to automate in `tests/`,
- make code reviews easier by linking a test file to the spec it implements,
- act as a living source of truth for your test strategy.

When you create or modify a Playwright test, update the matching spec here so they stay in sync.
