#!/usr/bin/env node
const { execSync } = require('child_process');

const major = parseInt(process.versions.node.split('.')[0], 10);
if (Number.isNaN(major)) {
  console.log('postinstall: unknown Node version, skipping Playwright install.');
  process.exit(0);
}

if (major < 18) {
  console.log(`postinstall: Node ${process.versions.node} < 18 → skipping Playwright install.`);
  process.exit(0);
}

try {
  console.log(`postinstall: Node ${process.versions.node} ≥ 18 → installing Playwright...`);
  execSync('npm i -D @playwright/test@1.55.0 playwright@1.55.0', { stdio: 'inherit' });
  // Argos only in Node >= 18 as well (optional)
  // execSync('npm i -D @argos-ci/playwright@^5', { stdio: 'inherit' });
  console.log('postinstall: Playwright installed.');
} catch (e) {
  console.error('postinstall: failed to install Playwright:', e?.message || e);
  process.exit(1);
}