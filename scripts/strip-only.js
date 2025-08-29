#!/usr/bin/env node
/* Remove .only from test/describe blocks to keep CI happy */
const fs = require('fs');
const path = require('path');

const roots = ['tests', 'e2e', 'src']; // adjust if needed
const exts = new Set(['.ts', '.tsx', '.js', '.jsx']);
const files = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p);
    else if (exts.has(path.extname(ent.name))) files.push(p);
  }
}

roots.forEach(walk);

let changedCount = 0;
for (const f of files) {
  const src = fs.readFileSync(f, 'utf-8');
  const out = src
    .replace(/\b(test|it)\.only\s*\(/g, '$1(')
    .replace(/\b(describe)\.only\s*\(/g, '$1(');
  if (out !== src) {
    fs.writeFileSync(f, out, 'utf-8');
    console.log('stripped .only in', f);
    changedCount++;
  }
}
console.log(`Done. Files changed: ${changedCount}`);