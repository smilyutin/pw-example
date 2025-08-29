#!/usr/bin/env node
/**
 * POM Doctor — one-file Swiss-army knife for Playwright POMs & tests
 *
 * What it AUDITS:
 *  - Finds Page Object classes (export class *Page) and their fields
 *  - Duplicate locators across POMs
 *  - Bad naming (non-camelCase), duplicate field names
 *  - Missing "readonly" / missing ": Locator" (TS)
 *  - Navigation inside constructors (anti-pattern)
 *  - Inline selectors in tests (page.locator/getBy*) and hard-coded page.goto('http...')
 *
 * What it AUTO-FIXES (with --fix):
 *  - Add "readonly" to POM fields
 *  - Add ": Locator" annotation for TS POM fields (no change for JS files)
 *  - Normalize field names to camelCase + add semantic suffix (Button/Link/Input/…)
 *  - Rename duplicate fields (append numeric suffix)
 *  - Update constructor assignments to the new field names
 *  - Move page.goto(...) out of constructor into a new method "gotoHome()" (keeps the URL)
 *  - Ensure tests import + instantiate BasePage
 *  - Convert raw text/title/url assertions to locator assertions
 *  - Promote raw locators in tests to BasePage fields (if POM has them)
 *
 * Optional extraction (with --extract-inline, used only with --fix):
 *  - Create/augment "<pagesDir>/BasePage.ts" with inline locators used in ≥ threshold test files
 *  - Replace simple inline locators in tests by BasePage fields
 *
 * Plus: writes a before/after report:
 *  - pom-doctor-report.json
 *  - pom-doctor-report.md
 *
 * Usage examples:
 *   node pom-doctor.js                           # dry-run audit (no writes)
 *   node pom-doctor.js --fix                     # auto-fix POMs & tests
 *   node pom-doctor.js --fix --extract-inline    # plus extract common inline locators into BasePage
 *   node pom-doctor.js --pages pages,src/pages --tests tests,e2e --threshold 2 --write
 */

const fs = require('fs');
const path = require('path');

// ---------- CLI ----------
function argvFlag(name, def) {
  const idx = process.argv.findIndex(a => a === `--${name}`);
  if (idx >= 0) return process.argv[idx + 1] ?? 'true';
  const kv = process.argv.find(a => a.startsWith(`--${name}=`));
  if (kv) return kv.split('=').slice(1).join('=');
  return def;
}
const DO_FIX = !!argvFlag('fix', '');
const EXTRACT_INLINE = !!argvFlag('extract-inline', '');
const THRESHOLD = Number(argvFlag('threshold', '2')) || 2;
const WRITE = DO_FIX || !!argvFlag('write', ''); // --fix implies writes

const PAGES_DIRS = (argvFlag('pages', 'pages,src/pages,pageObjects,src/pageObjects'))
  .split(',').map(s => s.trim()).filter(Boolean);
const TESTS_DIRS = (argvFlag('tests', 'tests,e2e,src/tests'))
  .split(',').map(s => s.trim()).filter(Boolean);
const REPORT_JSON = argvFlag('reportJson', 'pom-doctor-report.json');
const REPORT_MD = argvFlag('reportMd', 'pom-doctor-report.md');

// ---------- console helpers ----------
const color = {
  green: s => `\x1b[32m${s}\x1b[0m`,
  red: s => `\x1b[31m${s}\x1b[0m`,
  yellow: s => `\x1b[33m${s}\x1b[0m`,
  cyan: s => `\x1b[36m${s}\x1b[0m`,
  dim: s => `\x1b[2m${s}\x1b[0m`,
  bold: s => `\x1b[1m${s}\x1b[0m`,
};
const ok = m => console.log('  ' + color.green('✔') + ' ' + m);
const warn = m => console.log('  ' + color.yellow('▲') + ' ' + m);
const bad = m => console.log('  ' + color.red('✖') + ' ' + m);

// ---------- FS helpers ----------
function listFilesRecursive(dir, exts = ['.ts', '.tsx', '.js', '.jsx']) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  const stack = [dir];
  while (stack.length) {
    const d = stack.pop();
    for (const ent of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, ent.name);
      if (ent.isDirectory()) stack.push(p);
      else if (exts.includes(path.extname(ent.name))) out.push(p);
    }
  }
  return out;
}
function read(file) { try { return fs.readFileSync(file, 'utf-8'); } catch { return ''; } }
function write(file, text) { fs.writeFileSync(file, text, 'utf-8'); }
function backup(file, content) { const bak = file + '.bak'; if (!fs.existsSync(bak)) fs.writeFileSync(bak, content, 'utf-8'); }
function looksLikeTs(file) { return /\.tsx?$/.test(file); }
function escapeRx(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function oneLine(s) { return String(s).replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 500); }

// ---------- report helpers ----------
const changes = {}; // { filePath: [{ before, after }] }
function recordChange(file, before, after) {
  if (!changes[file]) changes[file] = [];
  changes[file].push({ before, after });
}
function writeReports() {
  // JSON
  fs.writeFileSync(REPORT_JSON, JSON.stringify(changes, null, 2), 'utf-8');

  // Markdown
  let md = `# POM Doctor Report\n\n`;
  const files = Object.keys(changes);
  if (!files.length) md += `No changes.\n`;
  for (const f of files) {
    md += `## ${f}\n\n`;
    for (const { before, after } of changes[f]) {
      md += `**Before**\n\n`;
      md += '```diff\n';
      md += `- ${oneLine(before)}\n`;
      md += '```\n\n';
      md += `**After**\n\n`;
      md += '```diff\n';
      md += `+ ${oneLine(after)}\n`;
      md += '```\n\n';
    }
  }
  fs.writeFileSync(REPORT_MD, md, 'utf-8');
  console.log(`\n📊 Reports written:\n  - ${REPORT_JSON}\n  - ${REPORT_MD}`);
}

// ---------- naming helpers ----------
function toCamel(s) {
  return s
    .replace(/[-_\s]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b(\w)/g, (m, c, i) => (i === 0 ? c : c.toUpperCase()))
    .replace(/\s+/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}
function suggestSuffixFromLocator(loc) {
  const L = loc.toLowerCase();
  if (/getbyrole\(['"]button/.test(L) || /button/.test(L)) return 'Button';
  if (/getbyrole\(['"]link/.test(L) || /a\[/.test(L)) return 'Link';
  if (/getbyplaceholder\(/.test(L) || /input\[/.test(L)) return 'Input';
  if (/select/.test(L)) return 'Dropdown';
  if (/textarea/.test(L)) return 'Textarea';
  if (/checkbox/.test(L)) return 'Checkbox';
  if (/radio/.test(L)) return 'Radio';
  if (/header/.test(L)) return 'Header';
  if (/footer/.test(L)) return 'Footer';
  if (/nav|role="navigation"/.test(L)) return 'Navigation';
  if (/table/.test(L)) return 'Table';
  return 'Element';
}

// ---------- “smell” detectors ----------
function looksLikeLocatorText(t) {
  return /page\.locator\(|getBy(Role|Text|Placeholder|Label|TestId)\(/.test(t);
}
function looksLikeHardGoto(t) {
  return /page\.goto\s*\(\s*['"]https?:\/\//.test(t);
}

// ---------- Parse POM classes (regex-based, robust enough for most repos) ----------
function parsePomsFromFile(file, text) {
  const classes = [];
  const classRx = /export\s+class\s+([A-Za-z0-9_]+)\s*{([\s\S]*?)^}\s*$/gm;
  let m;
  while ((m = classRx.exec(text)) !== null) {
    const name = m[1];
    const body = m[2];

    const fields = [];
    // TS or JS: readonly foo[: Locator];
    const fieldRx = /(^|\n)\s*(readonly\s+)?([A-Za-z_]\w*)(\s*:\s*Locator)?\s*;/g;
    let mf;
    while ((mf = fieldRx.exec(body)) !== null) {
      const readonly = !!mf[2];
      const fname = mf[3];
      const typed = !!mf[4];
      fields.push({ name: fname, readonly, typed, loc: null });
    }

    const ctorRx = /constructor\s*\(\s*private\s+page\s*:\s*Page\s*\)\s*{([\s\S]*?)}/m;
    const ctorMatch = ctorRx.exec(body);
    let ctorBody = '';
    let ctorNav = false;
    if (ctorMatch) {
      ctorBody = ctorMatch[1] || '';
      ctorNav = /this\.page\.goto\(/.test(ctorBody);
      const assignRx = /this\.([A-Za-z_]\w*)\s*=\s*this\.page\.(locator|getBy[A-Z][A-Za-z]+)\(([\s\S]*?)\);/g;
      let ma;
      while ((ma = assignRx.exec(ctorBody)) !== null) {
        const fname = ma[1];
        const api = ma[2];
        const arg = ma[3].split('\n')[0].trim().replace(/\s+/g, ' ');
        const f = fields.find(x => x.name === fname);
        if (f) f.loc = `${api}(${arg})`;
      }
    }
    classes.push({ name, fields, ctorBody, ctorNav });
  }
  return classes;
}

// ---------- BasePage parser to build mapping (used for test promotion) ----------
/**
 * Returns an array like:
 *   { field: 'signinLink', kind: 'css', key: 'a[href="/login"]' }
 *   { field: 'homeLink',   kind: 'role', role: 'link', name: 'Home' }
 */
function parseBasePage(pomPath) {
  if (!fs.existsSync(pomPath)) return [];
  const src = fs.readFileSync(pomPath, 'utf-8');
  const map = [];

  // this.field = this.page.locator('css');
  const rxLocator = /this\.(\w+)\s*=\s*this\.page\.locator\(\s*(['"`])([\s\S]*?)\2\s*\)\s*;?/g;
  // this.field = this.page.getByRole('role', { name: 'Text' })
  const rxRole = /this\.(\w+)\s*=\s*this\.page\.getByRole\(\s*(['"`])([\s\S]*?)\2\s*,\s*\{\s*[^}]*?\bname\s*:\s*(['"`])([\s\S]*?)\4[^}]*\}\s*\)\s*;?/g;

  let m;
  while ((m = rxLocator.exec(src))) { map.push({ field: m[1], kind: 'css', key: m[3] }); }
  while ((m = rxRole.exec(src)))   { map.push({ field: m[1], kind: 'role', role: m[3], name: m[5] }); }

  // de-dup by field
  const seen = new Set();
  return map.filter(e => (seen.has(e.field) ? false : (seen.add(e.field), true)));
}

function buildMatchersFromPom(pomEntries) {
  const css = [];
  const role = [];
  for (const e of pomEntries) {
    if (e.kind === 'css') {
      css.push({ field: e.field, rx: new RegExp(`page\\.locator\\(\\s*(['"\`])${escapeRx(e.key)}\\1\\s*\\)`, 'g') });
    } else if (e.kind === 'role') {
      const rx = new RegExp(
        `page\\.getByRole\\(\\s*(['"\`])${escapeRx(e.role)}\\1\\s*,\\s*\\{[^}]*?\\bname\\s*:\\s*(['"\`])${escapeRx(e.name)}\\2[^}]*?\\}\\s*\\)`,
        'g'
      );
      role.push({ field: e.field, rx });
    }
  }
  return { css, role };
}

// ---------- Import / instantiation ensure for tests ----------
function ensureImport(content, file, basePagePathGuess = '../BasePage') {
  let changed = false;
  if (!/from\s+['"]@playwright\/test['"]/.test(content)) {
    const before = content;
    content = `import { test, expect } from '@playwright/test';\n` + content;
    recordChange(file, before.split('\n')[0] || '(start)', content.split('\n')[0]);
    changed = true;
  }
  if (!/from\s+['"].*BasePage(\.ts)?['"]/.test(content)) {
    const before = content;
    content = `import { BasePage } from '${basePagePathGuess.replace(/\.ts$/, '')}';\n` + content;
    recordChange(file, before.split('\n')[0] || '(start)', content.split('\n')[0]);
    changed = true;
  }
  return { content, changed };
}

function ensureInstantiation(content, file) {
  let changed = false;
  if (!/new\s+BasePage\s*\(\s*page\s*\)/.test(content)) {
    const before = content;
    content = content.replace(
      /(test(?:\.only|\.skip|\.fixme)?\s*\(\s*['"`][^'"`]+['"`]\s*,\s*async\s*\(\s*\{\s*page[^}]*}\s*\)\s*=>\s*\{)/,
      (m) => `${m}\n  const basePage = new BasePage(page);`
    );
    if (content !== before) {
      recordChange(file, '// (no BasePage instance)', 'const basePage = new BasePage(page)');
      changed = true;
    }
  }
  return { content, changed };
}

// ---------- Locator assertion passes (quick + deep) ----------
function quickLocatorAssertionPass(content, file) {
  let changed = false;

  // A) expect(await page.locator(...).textContent()) → await expect(page.locator(...)).toHaveText(/*FIXME*/)
  const rawTextPattern = /expect\s*\(\s*await\s+page\.locator\(([^)]+)\)\.(textContent|innerText)\s*\)/g;
  if (rawTextPattern.test(content)) {
    content = content.replace(rawTextPattern, (m, sel) => {
      const afterHead = `await expect(page.locator(${sel}))`;
      recordChange(file, m, afterHead + `.toHaveText(/*FIXME*/)`);
      changed = true;
      return afterHead;
    });
    content = content.replace(/(await expect\s*page\.locator\([^)]+\))(?!\s*\.)/g, `$1.toHaveText(/*FIXME*/)`);
  }

  // B) expect(await page.title()) → await expect(page).toHaveTitle(/*FIXME*/)
  const titlePattern = /expect\s*\(\s*await\s+page\.title\(\s*\)\s*\)/g;
  if (titlePattern.test(content)) {
    content = content.replace(titlePattern, (m) => {
      const afterHead = 'await expect(page)';
      recordChange(file, m, afterHead + `.toHaveTitle(/*FIXME*/)`);
      changed = true;
      return afterHead;
    });
    content = content.replace(/(await expect$begin:math:text$page$end:math:text$)(?!\s*\.)/g, `$1.toHaveTitle(/*FIXME*/)`);
  }

  return { content, changed };
}

function deepLocatorAssertionPass(content, file) {
  let changed = false;
  const rules = [
    // textContent(...) → toHaveText(...)
    {
      rx: /expect\s*\(\s*await\s+page\.locator\(([^)]+)\)\.textContent\(\)\)\.\s*to\w+\s*\(([^)]*)\)\s*;?/g,
      to: (_m, sel, expected) => {
        const after = `await expect(page.locator(${sel})).toHaveText(${expected || '/*FIXME*/'})`;
        recordChange(file, _m, after);
        changed = true; return after;
      }
    },
    // innerText(...) → toContainText(...)
    {
      rx: /expect\s*\(\s*await\s+page\.locator\(([^)]+)\)\.innerText\(\)\)\.\s*to\w+\s*\(([^)]*)\)\s*;?/g,
      to: (_m, sel, expected) => {
        const after = `await expect(page.locator(${sel})).toContainText(${expected || '/*FIXME*/'})`;
        recordChange(file, _m, after);
        changed = true; return after;
      }
    },
    // inputValue(...) → toHaveValue(...)
    {
      rx: /expect\s*\(\s*await\s+page\.locator\(([^)]+)\)\.inputValue\(\)\)\.\s*to\w+\s*\(([^)]*)\)\s*;?/g,
      to: (_m, sel, expected) => {
        const after = `await expect(page.locator(${sel})).toHaveValue(${expected || '/*FIXME*/'})`;
        recordChange(file, _m, after);
        changed = true; return after;
      }
    },
    // isVisible() true/false → toBeVisible()/not.toBeVisible()
    {
      rx: /expect\s*\(\s*await\s+page\.locator\(([^)]+)\)\.isVisible\(\)\)\.\s*to\w+\s*\(\s*(true|false)\s*\)\s*;?/g,
      to: (_m, sel, bool) => {
        const after = (bool === 'true')
          ? `await expect(page.locator(${sel})).toBeVisible()`
          : `await expect(page.locator(${sel})).not.toBeVisible()`;
        recordChange(file, _m, after);
        changed = true; return after;
      }
    },
    // title() → toHaveTitle(...)
    {
      rx: /expect\s*\(\s*await\s+page\.title\(\s*\)\s*\)\.\s*to\w+\s*\(([^)]*)\)\s*;?/g,
      to: (_m, expected) => {
        const after = `await expect(page).toHaveTitle(${expected || '/*FIXME*/'})`;
        recordChange(file, _m, after);
        changed = true; return after;
      }
    },
    // url() → toHaveURL(...)
    {
      rx: /expect\s*\(\s*await\s+page\.url\(\s*\)\s*\)\.\s*to\w+\s*\(([^)]*)\)\s*;?/g,
      to: (_m, expected) => {
        const after = `await expect(page).toHaveURL(${expected || '/*FIXME*/'})`;
        recordChange(file, _m, after);
        changed = true; return after;
      }
    }
  ];

  for (const r of rules) content = content.replace(r.rx, r.to);
  return { content, changed };
}

// ---------- Promote raw locators in tests → BasePage fields ----------
const staticMap = [
  { css: 'a[href="/"]', field: 'homeLink' },
  { css: 'a[href="/login"]', field: 'signinLink' },
  { css: '.navbar', field: 'navbarNavigation' },
  { css: 'a[href="/settings"]', field: 'settingsLink' },
  { css: 'a[href="/profile"]', field: 'profileLink' },
];
function promoteLocatorsToPOM(content, file, pomEntries) {
  let changed = false;
  const { css, role } = buildMatchersFromPom(pomEntries);

  // 1) POM-driven CSS
  for (const { field, rx } of css) {
    if (rx.test(content)) {
      const before = content;
      content = content.replace(rx, `basePage.${field}`);
      if (content !== before) recordChange(file, '(page.locator(...))', `basePage.${field}`), (changed = true);
    }
  }
  // 2) POM-driven getByRole
  for (const { field, rx } of role) {
    if (rx.test(content)) {
      const before = content;
      content = content.replace(rx, `basePage.${field}`);
      if (content !== before) recordChange(file, '(page.getByRole(...))', `basePage.${field}`), (changed = true);
    }
  }
  // 3) Static fallbacks
  for (const item of staticMap) {
    if (item.css) {
      const rx = new RegExp(`page\\.locator\\(\\s*(['"\`])${escapeRx(item.css)}\\1\\s*\\)`, 'g');
      if (rx.test(content)) {
        const before = content;
        content = content.replace(rx, `basePage.${item.field}`);
        if (content !== before) recordChange(file, item.css, `basePage.${item.field}`), (changed = true);
      }
    } else if (item.role && item.name) {
      const rx = new RegExp(
        `page\\.getByRole\\(\\s*(['"\`])${escapeRx(item.role)}\\1\\s*,\\s*\\{[^}]*?\\bname\\s*:\\s*(['"\`])${escapeRx(item.name)}\\2[^}]*?\\}\\s*\\)`,
        'g'
      );
      if (rx.test(content)) {
        const before = content;
        content = content.replace(rx, `basePage.${item.field}`);
        if (content !== before) recordChange(file, `${item.role}:${item.name}`, `basePage.${item.field}`), (changed = true);
      }
    }
  }
  return { content, changed };
}

// ---------- Inline extraction helpers ----------
function collectInlineLocators(testText) {
  const results = [];
  // const v = page.locator('...'); OR const v = page.getByRole('role', { name: 'X' });
  const rx = /const\s+([A-Za-z_]\w*)\s*=\s*page\.(locator|getBy[A-Z][A-Za-z]+)\((`[^`]*`|'[^']*'|"[^"]*")(?:\s*,\s*\{[\s\S]*?\})?\)\s*;?/g;
  let m;
  while ((m = rx.exec(testText)) !== null) {
    const varName = m[1];
    const api = m[2];
    const arg = m[3]; // keep quotes
    results.push({ varName, api, arg, raw: m[0] });
  }
  return results;
}
function ensureBasePageFile(baseDir) {
  const basePath = path.join(baseDir, 'BasePage.ts');
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true });
  if (!fs.existsSync(basePath)) {
    const seed = `import { Page, Locator } from '@playwright/test';

export class BasePage {
  constructor(private page: Page) {}

  // Utilities
  async goto(url: string) { await this.page.goto(url); }
  async waitForIdle() { await this.page.waitForLoadState('networkidle'); }
}
`;
    write(basePath, seed);
  }
  return path.join(baseDir, 'BasePage.ts');
}

// ---------- MAIN ----------
(async function main() {
  console.log(color.bold('\nPOM Doctor 🩺  ') + color.dim(WRITE ? '(auto-fix ON)' : '(read-only)'));
  console.log(color.dim(`Pages: ${PAGES_DIRS.join(', ')}  |  Tests: ${TESTS_DIRS.join(', ')}\n`));

  const pomFiles = PAGES_DIRS.flatMap(d => listFilesRecursive(d));
  const testFiles = TESTS_DIRS.flatMap(d => listFilesRecursive(d));

  if (!pomFiles.length) warn('No POM files found in configured pages directories.');

  // ---- Audit & Fix POMs ----
  const duplicateGroups = {};
  for (const file of pomFiles) {
    const txt = read(file);
    if (!txt) continue;
    const classes = parsePomsFromFile(file, txt);
    if (!classes.length) continue;

    let working = txt;
    let changed = false;

    for (const c of classes) {
      if (!/Page$/.test(c.name)) warn(`Class ${c.name} in ${file} does not end with "Page".`);

      // Move navigation from ctor to method
      if (c.ctorNav && WRITE) {
        const ctorBlockRx = /(constructor\s*$begin:math:text$\\s*private\\s+page\\s*:\\s*Page\\s*$end:math:text$\s*{)([\s\S]*?)(\n\s*})/m;
        const ctorBlock = ctorBlockRx.exec(working);
        if (ctorBlock) {
          const ctorInner = ctorBlock[2];
          const gotoRx = /this\.page\.goto$begin:math:text$([\\s\\S]*?)$end:math:text$;?/g;
          const urls = [];
          let gm; let newCtorInner = ctorInner;
          while ((gm = gotoRx.exec(ctorInner)) !== null) {
            urls.push(gm[1].trim());
            newCtorInner = newCtorInner.replace(gm[0], '// moved by POM Doctor');
          }
          working = working.replace(ctorInner, newCtorInner);
          if (urls.length) {
            const method = `\n  // Auto-moved from constructor by POM Doctor\n  async gotoHome() { await this.page.goto(${urls[0]}); }\n`;
            working = working.replace(new RegExp(`(export\\s+class\\s+${c.name}\\s*{[\\s\\S]*?)\\n\\}`, 'm'), (_m, head) => head + method + `\n}`);
            changed = true;
            ok(`Moved page.goto(...) from ${c.name} constructor into gotoHome().`);
          }
        }
      } else if (c.ctorNav) {
        bad(`${c.name} constructor navigates; run with --fix to move into gotoHome().`);
      }

      // Field fixes
      const namesSeen = new Set();
      for (const f of c.fields) {
        let newName = f.name;
        const wasName = f.name;

        // Normalize name + suffix
        if (!/^[a-z][a-zA-Z0-9]*$/.test(newName)) newName = toCamel(newName);
        const locStr = f.loc || '';
        const suf = locStr ? suggestSuffixFromLocator(locStr) : 'Element';
        if (!new RegExp(suf + '$').test(newName)) newName = newName + suf;

        // Deduplicate within class
        let counter = 1;
        while (namesSeen.has(newName)) newName = newName.replace(/\d*$/, '') + (++counter);
        namesSeen.add(newName);

        // Apply renames in text (field declaration + constructor assignments)
        if (WRITE && newName !== wasName) {
          const fieldDeclRx = new RegExp(`(\\breadonly\\s+)?\\b${wasName}\\b(\\s*:\\s*Locator)?\\s*;`);
          working = working.replace(fieldDeclRx, (m, ro, ty) => {
            const readonly = ro ? ro : 'readonly ';
            const typed = looksLikeTs(file) ? (ty ? ty : ': Locator') : (ty || '');
            return `${readonly}${newName}${typed};`;
          });
          const assignRx = new RegExp(`this\\.${wasName}\\s*=\\s*this\\.page\\.(locator|getBy[A-Z][A-Za-z]+)\\(`);
          working = working.replace(assignRx, (m, api) => `this.${newName} = this.page.${api}(`);
          changed = true;
          ok(`Renamed ${c.name}.${wasName} → ${newName}`);
        } else {
          if (!f.readonly) warn(`${c.name}.${f.name}: add "readonly".`);
          if (looksLikeTs(file) && !f.typed) warn(`${c.name}.${f.name}: add ": Locator".`);
        }

        // collect for dups analysis
        if (f.loc) {
          duplicateGroups[f.loc] = duplicateGroups[f.loc] || [];
          duplicateGroups[f.loc].push({ className: c.name, file, field: newName });
        }
      }
    }

    if (WRITE && changed) {
      backup(file, txt);
      write(file, working);
      ok(`Updated: ${file}`);
    }
  }

  // Duplicate locator report
  const dupEntries = Object.entries(duplicateGroups).filter(([, arr]) => arr.length > 1);
  if (dupEntries.length) {
    warn('Duplicate locator definitions across POMs:');
    for (const [loc, arr] of dupEntries) {
      console.log(color.dim('  ' + loc));
      arr.forEach(x => console.log(color.dim(`    - ${x.className}.${x.field} (${x.file})`)));
    }
  } else {
    ok('No duplicate locators across POMs detected.');
  }

  // ---- Scan tests & optionally fix ----
  const pomPathGuess = (PAGES_DIRS[0] ? path.join(PAGES_DIRS[0], 'BasePage.ts') : './BasePage.ts');
  const pomEntries = parseBasePage(pomPathGuess);
  if (pomEntries.length) ok(`Parsed ${pomEntries.length} BasePage field(s) from ${pomPathGuess}`);

  const inlineMap = new Map(); // signature -> {count, files:Set, samples:[]}
  const hardGotoFiles = [];
  let filesChanged = 0;

  for (const tf of testFiles) {
    const original = read(tf);
    if (!original) continue;

    if (looksLikeHardGoto(original)) hardGotoFiles.push(tf);
    const hasLocators = looksLikeLocatorText(original);
    let content = original;
    let changed = false;

    // Ensure imports & instantiation if we will modify locators/assertions
    if (WRITE && hasLocators) {
      const baseRel = path.relative(path.dirname(tf), pomPathGuess).replace(/\\/g, '/').replace(/\.ts$/, '') || './BasePage';
      let r = ensureImport(content, tf, baseRel.startsWith('.') ? baseRel : './' + baseRel);
      content = r.content; changed = changed || r.changed;
      r = ensureInstantiation(content, tf);
      content = r.content; changed = changed || r.changed;
    }

    // Locator assertion upgrades (quick then deep)
    let r = quickLocatorAssertionPass(content, tf);
    content = r.content; changed = changed || r.changed;

    r = deepLocatorAssertionPass(content, tf);
    content = r.content; changed = changed || r.changed;

    // Promote inline locators to BasePage fields (if any parsed)
    if (WRITE && pomEntries.length && hasLocators) {
      r = promoteLocatorsToPOM(content, tf, pomEntries);
      content = r.content; changed = changed || r.changed;
    }

    // Collect inline stats (for extraction)
    if (hasLocators) {
      const items = collectInlineLocators(original);
      for (const it of items) {
        const signature = `${it.api}(${it.arg})`;
        const entry = inlineMap.get(signature) || { count: 0, files: new Set(), samples: [] };
        entry.count++; entry.files.add(tf);
        if (entry.samples.length < 3) entry.samples.push({ file: tf, raw: it.raw });
        inlineMap.set(signature, entry);
      }
    }

    if (WRITE && changed && content !== original) {
      backup(tf, original);
      write(tf, content);
      filesChanged++;
      ok(`Fixed: ${tf}`);
    }
  }

  if (hardGotoFiles.length) {
    warn(`Hard-coded page.goto('http…') in tests (${hardGotoFiles.length}). Prefer baseURL or POM.goto().`);
    hardGotoFiles.slice(0, 10).forEach(f => console.log(color.dim('  - ' + f)));
  } else {
    ok('No hard-coded absolute page.goto() found in tests.');
  }

  const commonInline = [...inlineMap.entries()]
    .filter(([, v]) => v.files.size >= THRESHOLD)
    .map(([sig, v]) => ({ sig, count: v.count, files: [...v.files], samples: v.samples }));

  if (commonInline.length) {
    warn(`Common inline locators used across ≥ ${THRESHOLD} test files: ${commonInline.length}`);
  } else {
    ok('No common inline locators found above threshold.');
  }

  // ---- Optional extraction into BasePage.ts ----
  if (WRITE && EXTRACT_INLINE && commonInline.length) {
    const baseDir = PAGES_DIRS[0] || 'pages';
    const basePath = ensureBasePageFile(baseDir);
    let baseText = read(basePath);
    if (!/export\s+class\s+BasePage/.test(baseText)) {
      baseText = `import { Page, Locator } from '@playwright/test';\n\nexport class BasePage {\n  constructor(private page: Page) {}\n}\n`;
    }

    const seenNames = new Set([...baseText.matchAll(/readonly\s+([A-Za-z0-9_]+)\s*:\s*Locator/g)].map(m => m[1]));
    const fieldDecls = [];
    const ctorAssigns = [];

    for (const { sig } of commonInline) {
      const suf = suggestSuffixFromLocator(sig);
      const inner = sig.replace(/^[a-zA-Z]+\(/, '').replace(/\)$/, '');
      const rough = inner.replace(/['"`{}()\s]/g, ' ').slice(0, 30) || 'element';
      let name = toCamel(rough) + suf;
      let i = 1; while (seenNames.has(name)) name = name.replace(/\d*$/, '') + (++i);
      seenNames.add(name);

      fieldDecls.push(`  readonly ${name}: Locator;`);
      ctorAssigns.push(`    this.${name} = this.page.${sig};`);
    }

    // Inject declarations & assignments
    baseText = baseText.replace(/export\s+class\s+BasePage\s*{/, m => `${m}\n${fieldDecls.join('\n')}\n`);
    baseText = baseText.replace(/constructor\s*\(\s*private\s+page\s*:\s*Page\s*\)\s*{/, m => `${m}\n${ctorAssigns.join('\n')}\n`);
    backup(basePath, read(basePath));
    write(basePath, baseText);
    ok(`BasePage updated with ${fieldDecls.length} common inline locator(s): ${basePath}`);

    // Replace simple patterns in tests (best-effort)
    for (const tf of testFiles) {
      let t = read(tf);
      const before = t;
      if (!t) continue;

      // ensure import + instance
      const rel = path.relative(path.dirname(tf), basePath).replace(/\\/g, '/').replace(/\.ts$/, '') || './BasePage';
      let r = ensureImport(t, tf, rel.startsWith('.') ? rel : './' + rel);
      t = r.content;
      r = ensureInstantiation(t, tf); t = r.content;

      // Replace exact signatures
      for (const { sig } of commonInline) {
        const rx = new RegExp(`page\\.${escapeRx(sig)}`, 'g');
        t = t.replace(rx, (_m) => {
          // naive name re-derivation to match fieldDecls order (same algorithm)
          const suf = suggestSuffixFromLocator(sig);
          const inner = sig.replace(/^[a-zA-Z]+\(/, '').replace(/\)$/, '');
          const rough = inner.replace(/['"\`{}$begin:math:text$$end:math:text$\s]/g, ' ').slice(0, 30) || 'element';
          let name = toCamel(rough) + suf;
          let i = 1; while (!seenNames.has(name) && seenNames.has(name.replace(/\d+$/, ''))) name = name.replace(/\d*$/, '') + (++i);
          return `basePage.${name}`;
        });
      }

      if (t !== before) {
        backup(tf, before);
        write(tf, t);
        ok(`Promoted inline locators in: ${tf}`);
      }
    }
  }

  // ---- Write the before/after change report ----
  writeReports();

  console.log('\n' + color.bold('Tips'));
  console.log(color.dim('- Keep navigation out of constructors (use goto* methods).'));
  console.log(color.dim('- Prefer BasePage for shared UI; per-page subclasses for specifics.'));
  console.log(color.dim('- Keep fields "readonly" and typed as ": Locator" in TS.'));
  console.log(color.dim('- Use Playwright locator assertions (toHaveText/toBeVisible/...).\n'));
  console.log(color.bold(WRITE ? 'Auto-fix complete.' : 'Audit complete.'));
})();