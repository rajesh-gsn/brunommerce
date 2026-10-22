#!/bin/bash
# Builds an ad-hoc signed Brunommerce macOS installer (dmg + zip, arm64) into packages/bruno-electron/out.
# Set BRUNOMMERCE_VERSION (e.g. 2.0.0-bm.1) to version the build; a SHA256SUMS.txt is written next to the installers.
# Prerequisite: the shared packages are built and `npm run sandbox:bundle-libraries --workspace=packages/bruno-js` has run.
set -euo pipefail

cd "$(dirname "$0")/.."
unset ELECTRON_RUN_AS_NODE

npm run build --workspace=packages/bruno-app

rm -rf packages/bruno-electron/out packages/bruno-electron/web
mkdir packages/bruno-electron/web
cp -r packages/bruno-app/dist/* packages/bruno-electron/web
sed -i'' -e 's@/static/@static/@g' packages/bruno-electron/web/*.html
sed -i'' -e 's@/static/font@../../static/font@g' packages/bruno-electron/web/static/css/*.css
find packages/bruno-electron/web -name '*.map' -type f -delete

cd packages/bruno-electron
npx electron-builder --mac --dir --config electron-builder-tester-config.js

# Sealing every part of the bundle ad hoc keeps arm64 Macs from reporting the app as damaged
APP=out/mac-arm64/Brunommerce.app
codesign --force --deep --sign - "$APP"
codesign --verify --deep --strict "$APP"

npx electron-builder --mac --prepackaged "$APP" --config electron-builder-tester-config.js
(cd out && shasum -a 256 *.dmg *.zip > SHA256SUMS.txt)
ls -lh out/*.dmg out/*.zip out/SHA256SUMS.txt
