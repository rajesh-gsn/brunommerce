# Privacy Policy

_Last updated: 27 October 2026_

Brunommerce is an unofficial, personal fork of [Bruno](https://github.com/usebruno/bruno), an open-source API client that runs on your computer. This policy covers the Brunommerce app and the files in this repository. It is not legal advice.

## Summary

- Brunommerce has no accounts, no servers of its own and no analytics. The maintainer does not receive any of your data.
- Your collections, requests, responses, environments and secrets stay on your computer.
- The app makes a few network requests of its own, described below. Everything else it sends is a request you wrote and chose to send.

## What stays on your device

The app stores the following in its data folder (`~/Library/Application Support/Brunommerce` on macOS, `%APPDATA%\Brunommerce` on Windows) and in the collection folders you open:

- collections, requests, environments and variables
- app preferences, window state and cookies
- a local record of the workspaces and tabs you had open

None of it is uploaded by Brunommerce. Uninstalling the app and deleting that folder removes it.

## Network requests the app makes

**Requests you send.** When you send a request, the app contacts the server you specified, with the headers, body and credentials you configured. That server's own privacy policy applies to what it does with them. The same applies to proxies, OAuth providers and any other service you configure.

**Label rendering (Labelary).** Showing a ZPL label as an image sends the label's ZPL text to a [Labelary](https://labelary.com)-compatible service, which often includes names and addresses. This happens only after you agree to it in the app, and the agreement is remembered for that endpoint only. The default endpoint is the public Labelary service, whose [terms and privacy practices](https://labelary.com) apply. You can point the app at your own Labelary server with `preferences.labelary.endpoint`. PDF and image previews and timestamp chips are computed locally and use no network.

**Notifications check.** On start-up, and when you open the notifications panel, the app requests `https://appinfo.usebruno.com`, an endpoint run by the Bruno project, to fetch announcements. The request carries no collection data, but like any web request it exposes your IP address and the app's user agent to that server. Bruno's own privacy practices apply there. You can block that host with a firewall or set a different `BRUNO_INFO_ENDPOINT` to stop it.

**Telemetry.** Upstream Bruno has an anonymous usage counter (operating system and version) that is active only when a build embeds an analytics key. Brunommerce builds do not embed one, so it is inactive.

**Updates.** Brunommerce does not check for or install updates automatically. New versions are downloaded manually from the [Releases page](https://github.com/rajesh-gsn/brunommerce/releases).

## Downloads and this repository

Releases and this repository are hosted on GitHub, which collects its own data when you visit or download. See [GitHub's privacy statement](https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement). The maintainer sees only what GitHub shows repository owners, such as download counts, stars, and the issues or pull requests you choose to post publicly.

## Children

Brunommerce is a developer tool and is not directed at children.

## Changes

Changes to this policy are made in this file and recorded in the repository history. The date above shows when it last changed.

## Contact

Open an issue at https://github.com/rajesh-gsn/brunommerce/issues. Please don't include secrets or personal data in public issues.
