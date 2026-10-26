#!/usr/bin/env node
/**
 * Writes THIRD_PARTY_NOTICES.txt: every npm package that ships in the app, with its license and license text.
 *
 * electron-builder leaves license files out of the packaged app, so this collects them from the installed packages.
 * The packages are found from package-lock.json, starting at what the Electron app installs (bruno-electron), what the
 * renderer bundle imports (bruno-app dependencies) and the browser polyfills its build adds (the node-polyfill plugin).
 * Packages that are not installed on this platform (optional native packages for other systems) are left out.
 *
 * Usage: node scripts/generate-third-party-notices.js [output file]
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const lockPackages = require(path.join(root, 'package-lock.json')).packages;
const outputFile = process.argv[2] || path.join(root, 'packages/bruno-electron/resources/legal/THIRD_PARTY_NOTICES.txt');

const MAX_LICENSE_TEXT = 60 * 1024;
const LICENSE_FILE = /^(licen[sc]e|licen[sc]es|copying|notice)(\.[a-z]+)?$/i;

const packageName = (key) => key.split('node_modules/').pop();

// Finds the package a dependency name refers to from a given package, the way Node does
const resolve = (name, fromKey) => {
  let dir = fromKey;
  for (;;) {
    const key = dir ? `${dir}/node_modules/${name}` : `node_modules/${name}`;
    if (lockPackages[key]) return key;
    if (!dir) return null;
    const nested = dir.lastIndexOf('/node_modules/');
    dir = nested >= 0 ? dir.slice(0, nested) : '';
  }
};

const collectPackages = (rootKeys) => {
  const found = new Set();

  const visit = (key) => {
    const entry = lockPackages[key];
    if (!entry) return;
    // Workspace packages are linked from node_modules to their folder; they are this project's own code
    const target = entry.link ? entry.resolved : key;
    if (found.has(target)) return;
    found.add(target);

    const next = { ...lockPackages[target].dependencies, ...lockPackages[target].optionalDependencies };
    Object.keys(next).forEach((name) => visit(resolve(name, target)));
  };

  rootKeys.forEach(visit);
  return [...found];
};

const readJson = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (error) {
    return null;
  }
};

const licenseOf = (entry, manifest) => {
  const declared = entry.license || manifest?.license || manifest?.licenses;
  if (Array.isArray(declared)) return declared.map((item) => item.type || item).join(' OR ');
  return (declared && declared.type) || declared || 'UNKNOWN';
};

const authorOf = (manifest) => {
  const author = manifest?.author;
  return (author && (author.name || author)) || '';
};

const licenseTextOf = (dir) => fs.readdirSync(dir)
  .filter((file) => LICENSE_FILE.test(file) && fs.statSync(path.join(dir, file)).isFile())
  .map((file) => fs.readFileSync(path.join(dir, file), 'utf8').slice(0, MAX_LICENSE_TEXT).trim())
  .filter(Boolean)
  .join('\n\n');

const roots = [
  'packages/bruno-electron',
  'packages/bruno-app',
  resolve('@rsbuild/plugin-node-polyfill', 'packages/bruno-app')
];

const entries = collectPackages(roots)
  .filter((key) => key.includes('node_modules/') && fs.existsSync(path.join(root, key, 'package.json')))
  .map((key) => {
    const dir = path.join(root, key);
    const manifest = readJson(path.join(dir, 'package.json'));
    const repository = manifest?.repository?.url || manifest?.repository || manifest?.homepage || '';
    return {
      name: packageName(key),
      version: manifest?.version || lockPackages[key].version,
      license: licenseOf(lockPackages[key], manifest),
      repository: String(repository).replace(/^git\+/, ''),
      author: String(authorOf(manifest)).replace(/\s*<[^>]*>|\s*\([^)]*\)/g, '').trim(),
      text: licenseTextOf(dir)
    };
  })
  .sort((a, b) => a.name.localeCompare(b.name) || a.version.localeCompare(b.version));

const divider = '='.repeat(78);
const header = [
  'Third-party notices',
  '',
  'Brunommerce is an unofficial fork of Bruno (MIT License). It includes the open-source packages listed below,',
  'each under its own license. The license of Bruno itself is in LICENSE-Bruno.md, and the notices for Electron and',
  'Chromium are in LICENSE-Electron.txt and LICENSES.chromium.html, all in this folder.',
  '',
  `Packages: ${entries.length}`,
  ''
].join('\n');

const body = entries.map((entry) => [
  divider,
  `${entry.name}@${entry.version}`,
  `License: ${entry.license}`,
  entry.repository ? `Source: ${entry.repository}` : '',
  '',
  entry.text || `(The package does not include a license file. It declares the license ${entry.license}${entry.author ? `, by ${entry.author}` : ''}.)`,
  ''
].filter((line, index) => line !== '' || index > 3).join('\n'));

fs.mkdirSync(path.dirname(outputFile), { recursive: true });
fs.writeFileSync(outputFile, `${header}\n${body.join('\n')}\n`);

const withoutText = entries.filter((entry) => !entry.text).length;
console.log(`Wrote ${entries.length} packages (${withoutText} without a license file) to ${path.relative(root, outputFile)}`);
