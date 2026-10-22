// macOS build config for Brunommerce testers, used by scripts/build-brunommerce-mac.sh.
// Drops the upstream signing identity and notarization, which need credentials this fork does not have;
// the script signs the app ad hoc itself because electron-builder cannot.
const config = require('./electron-builder-config');

module.exports = {
  ...config,
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
