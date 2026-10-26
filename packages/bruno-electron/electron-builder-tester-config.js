// Build config for Brunommerce testers, used by scripts/build-brunommerce-mac.sh and the Brunommerce Windows build workflow.
// Drops the upstream signing identity and notarization, which need credentials this fork does not have;
// the script signs the app ad hoc itself because electron-builder cannot.
const path = require('path');
const config = require('./electron-builder-config');

const repoRoot = path.join(__dirname, '../..');

// electron-builder leaves license files out of the app, so they are added here: Bruno's license, the Electron and
// Chromium notices, and the generated notices for the npm packages (scripts/generate-third-party-notices.js)
const legalResources = [
  { from: path.join(repoRoot, 'license.md'), to: 'legal/LICENSE-Bruno.md' },
  { from: path.join(repoRoot, 'node_modules/electron/dist/LICENSE'), to: 'legal/LICENSE-Electron.txt' },
  { from: path.join(repoRoot, 'node_modules/electron/dist/LICENSES.chromium.html'), to: 'legal/LICENSES.chromium.html' },
  { from: path.join(__dirname, 'resources/legal/THIRD_PARTY_NOTICES.txt'), to: 'legal/THIRD_PARTY_NOTICES.txt' }
];

// BRUNOMMERCE_VERSION (e.g. 2.0.0-bm.1) sets the app and installer version so a bug report can name the exact build
const version = process.env.BRUNOMMERCE_VERSION;

module.exports = {
  ...config,
  extraResources: [...config.extraResources, ...legalResources],
  extraMetadata: { ...config.extraMetadata, ...(version && { version }) },
  afterSign: undefined,
  mac: {
    ...config.mac,
    artifactName: 'brunommerce_${version}_${arch}_${os}.${ext}',
    identity: null,
    notarize: false,
    target: [
      { target: 'dmg', arch: ['arm64'] },
      { target: 'zip', arch: ['arm64'] }
    ]
  },
  win: {
    ...config.win,
    artifactName: 'brunommerce_${version}_${arch}_win.${ext}',
    target: [{ target: 'nsis', arch: ['x64'] }]
  }
};
