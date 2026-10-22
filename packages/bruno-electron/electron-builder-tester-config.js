// macOS build config for Brunommerce testers, used by scripts/build-brunommerce-mac.sh.
// Drops the upstream signing identity and notarization, which need credentials this fork does not have;
// the script signs the app ad hoc itself because electron-builder cannot.
const config = require('./electron-builder-config');

// BRUNOMMERCE_VERSION (e.g. 2.0.0-bm.1) sets the app and installer version so a bug report can name the exact build
const version = process.env.BRUNOMMERCE_VERSION;

module.exports = {
  ...config,
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
  }
};
