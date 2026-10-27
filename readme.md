<p align="center">
  <img src="assets/images/brunommerce-logo.png" width="420" alt="Brunommerce"/>
</p>

# Brunommerce

**Brunommerce is an unofficial fork of [Bruno](https://github.com/usebruno/bruno)** with extra features for e-commerce and logistics APIs, such as previewing PDF and ZPL shipping labels next to the response. It is not made, endorsed or supported by the Bruno maintainers. "Bruno" is a trademark of its owner, and the original license (MIT, see [license.md](license.md)) and copyright notice are kept.

## What Brunommerce adds

Everything in Bruno still works, and your collections stay plain `.bru` / `.yml` files, so they open in either app. Brunommerce adds:

### Label preview next to the response

Carrier, warehouse and logistics APIs often return a shipping label as a PDF, as ZPL (Zebra printer language), or as base64 inside JSON or XML. When a response contains one, a barcode button appears next to the format selector and opens a pane beside the response.

- **PDF labels**, direct, or base64 inside JSON or XML (for example a SOAP `<GraphicImage>` element).
- **ZPL labels**, as plain text or base64, rendered to an image with size and DPI selectors. A response with several labels gets a pager.
- **Images embedded in a response**, such as a QR code as a base64 PNG, a data URL or inline SVG.
- **Download** the PDF, the ZPL source, the rendered image or the embedded image.

**Privacy.** See the full [privacy policy](PRIVACY.md). Rendering ZPL sends the label content, which often contains names and addresses, to a [Labelary](https://labelary.com)-compatible service. It is opt-in: the first render shows the endpoint and asks for permission, and consent is remembered for that endpoint only. PDF and image previews never use the network. To use your own Labelary server, set `preferences.labelary.endpoint` in `preferences.json` in the app's data folder (`~/Library/Application Support/Brunommerce` on macOS, `%APPDATA%\Brunommerce` on Windows).

### Local time for timestamps

When a response contains ISO-8601 timestamps with an offset (`2026-10-26T06:30:00Z`), a small purple chip after each one shows the same instant in your time zone, for example `26 Oct 12:00:00 +05:30 · 2h ago`. The chips are drawn beside the text, so the response, selection and copy keep the original values. The clock button next to the format selector hides or shows them.

### Branding and side-by-side use

A purple theme, a new name and icon, and its own data folder (`Brunommerce`), settings and `brunommerce://` URL scheme, so it runs next to an installed Bruno without sharing its settings or single-instance lock.

## Install

Download the latest **pre-release** from the [Releases page](https://github.com/rajesh-gsn/brunommerce/releases):

- **macOS (Apple Silicon):** open the `.dmg` and drag Brunommerce to Applications, or unzip the `.zip`.
- **Windows (64-bit):** run the `.exe` installer.

The installers are not signed with an Apple or Microsoft certificate, so the first launch shows a warning:

- **macOS:** open **System Settings → Privacy & Security** and click **Open Anyway**, or run `xattr -dr com.apple.quarantine /Applications/Brunommerce.app` once.
- **Windows:** on "Windows protected your PC", click **More info → Run anyway**.

Verify a download with `shasum -a 256 <file>` against `SHA256SUMS.txt` on the release. There is no automatic update, and Intel Macs are not supported by the current builds.

## Build from source

Brunommerce is built like Bruno (see [contributing.md](contributing.md)), on the `brunommerce` branch. Prerequisites: Node 22, `npm i --legacy-peer-deps`, the shared packages built (`npm run build:bruno-common` and the other `build:*` scripts) and `npm run sandbox:bundle-libraries --workspace=packages/bruno-js`.

```bash
npm run dev                                   # run the app (use DISABLE_SINGLE_INSTANCE=true next to an installed Bruno)
BRUNOMMERCE_VERSION=2.0.0-bm.4 ./scripts/build-brunommerce-mac.sh   # macOS installer (dmg + zip, arm64) in packages/bruno-electron/out
git tag v2.0.0-bm.4 && git push origin v2.0.0-bm.4                  # builds the Windows installer on GitHub Actions
```

The Windows build runs in [`.github/workflows/build-brunommerce-windows.yml`](.github/workflows/build-brunommerce-windows.yml) when a `v*-bm.*` tag is pushed, and uploads the installer as a workflow artifact.

## Licenses and credits

- **Bruno, MIT.** Brunommerce is based on [Bruno](https://github.com/usebruno/bruno), © 2022 Anoop M D, Anusree P S and Contributors, under the MIT License. The full text is in [license.md](license.md) and applies to Brunommerce's own changes too.
- **License notices ship with the installers.** The app's resources contain a `legal` folder with `LICENSE-Bruno.md`, the Electron and Chromium notices (`LICENSE-Electron.txt`, `LICENSES.chromium.html`) and `THIRD_PARTY_NOTICES.txt`, which lists every open-source package in the app with its license text. The build scripts generate the last one with `node scripts/generate-third-party-notices.js`.
- **Logo and mascot.** Created with ChatGPT (OpenAI image generation) by the project owner, and not based on Bruno's logo. See [assets/brand](assets/brand/README.md) for how it was made and where the files are.
- **Bruno's logo is not used.** The Bruno logo is sourced from [OpenMoji](https://openmoji.org) (CC BY-SA 4.0); Brunommerce replaced it everywhere, including the run report, with its own.
- **Label rendering** calls a [Labelary](https://labelary.com)-compatible service only with your permission, under that service's own terms.
- **Trademark.** "Bruno" is a trademark of its owner (see [Trademark](#trademark)). Brunommerce is not made, endorsed or supported by the Bruno maintainers.

## Upstream

The label preview pane is also offered to Bruno as [usebruno/bruno#9608](https://github.com/usebruno/bruno/pull/9608). Brunommerce's branding, theme, timestamp chips, embedded-image preview and installers are specific to this fork.

---

<br />

### Bruno - Opensource IDE for exploring and testing APIs.

[![GitHub version](https://badge.fury.io/gh/usebruno%2Fbruno.svg)](https://badge.fury.io/gh/usebruno%2Fbruno)
[![CI](https://github.com/usebruno/bruno/actions/workflows/tests.yml/badge.svg?branch=main)](https://github.com/usebruno/bruno/actions/workflows/tests.yml)
[![Commit Activity](https://img.shields.io/github/commit-activity/m/usebruno/bruno)](https://github.com/usebruno/bruno/pulse)
[![X](https://img.shields.io/twitter/follow/use_bruno?style=social&logo=x)](https://twitter.com/use_bruno)
[![Website](https://img.shields.io/badge/Website-Visit-blue)](https://www.usebruno.com)
[![Download](https://img.shields.io/badge/Download-Latest-brightgreen)](https://www.usebruno.com/downloads)

**English**
| [Українська](docs/readme/readme_ua.md)
| [Русский](docs/readme/readme_ru.md)
| [Türkçe](docs/readme/readme_tr.md)
| [Deutsch](docs/readme/readme_de.md)
| [Français](docs/readme/readme_fr.md)
| [Português (BR)](docs/readme/readme_pt_br.md)
| [한국어](docs/readme/readme_kr.md)
| [বাংলা](docs/readme/readme_bn.md)
| [Español](docs/readme/readme_es.md)
| [Italiano](docs/readme/readme_it.md)
| [Română](docs/readme/readme_ro.md)
| [Polski](docs/readme/readme_pl.md)
| [简体中文](docs/readme/readme_cn.md)
| [正體中文](docs/readme/readme_zhtw.md)
| [العربية](docs/readme/readme_ar.md)
| [日本語](docs/readme/readme_ja.md)
| [ქართული](docs/readme/readme_ka.md)
| [Nederlands](docs/readme/readme_nl.md)
| [فارسی](docs/readme/readme_fa.md)
| [हिन्दी](docs/readme/readme_hi.md)

Bruno is a new and innovative API client, aimed at revolutionizing the status quo represented by Postman and similar tools out there.

Bruno stores your collections directly in a folder on your filesystem. We use a plain text markup language, Bru, to save information about API requests.

You can use Git or any version control of your choice to collaborate over your API collections.

Bruno is offline-only. There are no plans to add cloud-sync to Bruno, ever. We value your data privacy and believe it should stay on your device. Read our long-term vision [here](https://github.com/usebruno/bruno/discussions/269)

[Download Bruno](https://www.usebruno.com/downloads)

📢 Watch our recent talk at India FOSS 3.0 Conference [here](https://www.youtube.com/watch?v=7bSMFpbcPiY)

![bruno](assets/images/landing-2-dark.png#gh-light-mode-only)
![bruno](assets/images/landing-2-light.png#gh-dark-mode-only) <br /><br />

## Commercial Versions ✨

Majority of our features are free and open source.
We strive to strike a harmonious balance between [open-source principles and sustainability](https://github.com/usebruno/bruno/discussions/269)

You can explore our [paid versions](https://www.usebruno.com/pricing) to see if there are additional features that you or your team may find useful! <br/>

## Table of Contents

- [Installation](#installation)
- [Bruno CLI](#bruno-cli)
- [Run with Docker](#run-with-docker)
- [Features](#features)
  - [Run across multiple platforms 🖥️](#run-across-multiple-platforms-%EF%B8%8F)
  - [Collaborate via Git 👩‍💻🧑‍💻](#collaborate-via-git-%E2%80%8D%E2%80%8D)
- [Important Links 📌](#important-links-)
- [Showcase 🎥](#showcase-)
- [Share Testimonials 📣](#share-testimonials-)
- [Publishing to New Package Managers](#publishing-to-new-package-managers)
- [Stay in touch 🌐](#stay-in-touch-)
- [Trademark](#trademark)
- [Contribute 👩‍💻🧑‍💻](#contribute-%E2%80%8D%E2%80%8D)
- [Authors](#authors)
- [License 📄](#license-)

## Installation

Bruno is available as binary download [on our website](https://www.usebruno.com/downloads) for Mac, Windows and Linux.

You can also install Bruno via package managers like Homebrew, Chocolatey, Scoop, Snap, Flatpak and Apt.

```sh
# On Mac via Homebrew
brew install bruno

# On Windows via Chocolatey
choco install bruno

# On Windows via Scoop
scoop bucket add extras
scoop install bruno

# On Windows via winget
winget install Bruno.Bruno

# On Linux via Snap
snap install bruno

# On Linux via Flatpak
flatpak install com.usebruno.Bruno

# On Arch Linux via AUR
yay -S bruno

# On Linux via Apt
sudo mkdir -p /etc/apt/keyrings
sudo apt update && sudo apt install gpg curl
curl -fsSL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x9FA6017ECABE0266" \
  | gpg --dearmor \
  | sudo tee /etc/apt/keyrings/bruno.gpg > /dev/null
sudo chmod 644 /etc/apt/keyrings/bruno.gpg
echo "deb [arch=amd64 signed-by=/etc/apt/keyrings/bruno.gpg] http://debian.usebruno.com/ bruno stable" \
  | sudo tee /etc/apt/sources.list.d/bruno.list
sudo apt update && sudo apt install bruno
```

## Bruno CLI

The **Bruno CLI** lets you run your API collections from the command line, which is ideal for automated testing and CI/CD pipelines. Install it from npm using the package manager of your choice:

```sh
npm install -g @usebruno/cli
```

Navigate to the directory containing your collection and run it:

```sh
# Run every request in the collection
bru run

# Run a single request
bru run request.bru

# Run a folder against a specific environment
bru run folder --env Local
```

For the full command reference, see the [Bruno CLI documentation](https://docs.usebruno.com/bru-cli/overview).

## Run with Docker

Official Docker images for the **Bruno CLI** let you run API collections in CI/CD pipelines and locally without installing Node.js or npm on the host. Images are published to both [Docker Hub](https://hub.docker.com/r/usebruno/cli) and the [GitHub Container Registry](https://ghcr.io/usebruno/cli) on every CLI release, with `alpine` and `debian` variants for `linux/amd64` and `linux/arm64`.

```sh
# Pull from Docker Hub
docker pull usebruno/cli:latest

# Or pull from the GitHub Container Registry
docker pull ghcr.io/usebruno/cli:latest

# Run a collection by mounting the current directory
docker run -v $(pwd):/bruno usebruno/cli run
```

For variants, tag matrix, environment files, and CI examples (GitHub Actions, GitLab CI, Jenkins), see the full [Bruno CLI Docker documentation](https://docs.usebruno.com/bru-cli/docker).

## Features

### Run across multiple platforms 🖥️

![bruno](assets/images/run-anywhere.png) <br /><br />

### Collaborate via Git 👩‍💻🧑‍💻

Or any version control system of your choice

![bruno](assets/images/version-control.png) <br /><br />

## Important Links 📌

- [Our Long Term Vision](https://github.com/usebruno/bruno/discussions/269)
- [Roadmap](https://www.usebruno.com/roadmap)
- [Documentation](https://docs.usebruno.com)
- [Stack Overflow](https://stackoverflow.com/questions/tagged/bruno)
- [Website](https://www.usebruno.com)
- [Pricing](https://www.usebruno.com/pricing)
- [Download](https://www.usebruno.com/downloads)

## Showcase 🎥

- [Testimonials](https://github.com/usebruno/bruno/discussions/343)
- [Knowledge Hub](https://github.com/usebruno/bruno/discussions/386)
- [Scriptmania](https://github.com/usebruno/bruno/discussions/385)

## Share Testimonials 📣

If Bruno has helped you at work and your teams, please don't forget to share your [testimonials on our GitHub discussion](https://github.com/usebruno/bruno/discussions/343)

## Publishing to New Package Managers

Please see [here](publishing.md) for more information.

## Stay in touch 🌐

[𝕏 (Twitter)](https://twitter.com/use_bruno) <br />
[Website](https://www.usebruno.com) <br />
[Discord](https://discord.com/invite/KgcZUncpjq) <br />
[LinkedIn](https://www.linkedin.com/company/usebruno)

## Trademark

**Name**

`Bruno` is a trademark held by [Anoop M D](https://www.helloanoop.com/)

**Logo**

Bruno's logo is sourced from [OpenMoji](https://openmoji.org/library/emoji-1F436/). License: CC [BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). Brunommerce does not use it; see [Licenses and credits](#licenses-and-credits).

## Contribute 👩‍💻🧑‍💻

I am happy that you are looking to improve bruno. Please check out the [contributing guide](contributing.md)

Even if you are not able to make contributions via code, please don't hesitate to file bugs and feature requests that needs to be implemented to solve your use case.

## Authors

<div align="center">
    <a href="https://github.com/usebruno/bruno/graphs/contributors">
        <img src="https://contrib.rocks/image?repo=usebruno/bruno" />
    </a>
</div>

## License 📄

[MIT](license.md)
