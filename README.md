# HangarExportJson

**[Download the add-on](https://github.com/ussmarines/HangarExportJson/releases/tag/v0.2.3) · [Support this project on PayPal](https://www.paypal.com/paypalme/ussmarinesdot) · [Français](README.fr.md)**

Export RSI hangar vehicle candidates to a local JSON file. A small Manifest V3 extension with no runtime dependencies, targeting Firefox, Chrome and Opera.

**Status: experimental, with explicit incomplete-result reporting.** Current RSI markup was inspected on an authorized real hangar, and the installed extension passed synthetic Chromium browser checks. A real-account extension export and actual Firefox/Opera runs remain unverified. Every export is marked `complete: false`; do not treat it as an authoritative inventory.

[French README](README.fr.md) · [JSON format](docs/FORMAT.md) · [Included vehicles](docs/INCLUDED_VEHICLES.md) · [Security and privacy](docs/SECURITY.md) · [Code review](docs/CODE_REVIEW.md) · [Validation and remaining work](docs/VALIDATION.md)

## Quick installation

[Download HangarExportJson 0.2.3](https://github.com/ussmarines/HangarExportJson/releases/download/v0.2.3/HangarExportJson-0.2.3.zip), then extract it. The [release page](https://github.com/ussmarines/HangarExportJson/releases/tag/v0.2.3) also provides a SHA-256 checksum. No build, npm installation or additional account is required. Inside the extracted `HangarExportJson-0.2.3` directory, select the **extension** folder, not the repository root. Your normal RSI login is needed to read your hangar.

The release is an experimental prerelease for manual installation, not a signed store add-on. You can alternatively download the current source with GitHub **Code → Download ZIP**.

### Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked**, then the extracted `extension` folder.
4. Open or reload [My Hangar](https://robertsspaceindustries.com/account/pledges).

The unpacked installation normally remains after a browser restart as long as its files remain available. Developer-mode notices and managed-browser policies may apply.

### Opera

1. Open `opera://extensions`.
2. Enable **Developer mode**.
3. Select **Load unpacked** and choose the `extension` folder.
4. Open or reload [My Hangar](https://robertsspaceindustries.com/account/pledges).

Opera uses the shared Chromium manifest and code. Actual Opera loading has not yet been tested; this is an intended compatibility target, not a certified result.

### Firefox

1. Open `about:debugging#/runtime/this-firefox`.
2. Select **Load Temporary Add-on…**.
3. Choose `extension/manifest.json`.
4. Open or reload [My Hangar](https://robertsspaceindustries.com/account/pledges). If Firefox requests site access, grant it for this site only.

**This installation is temporary and ends when Firefox restarts.** Persistent installation in standard Firefox requires a Mozilla-signed extension, either listed on AMO or signed for self-distribution. This project does not yet provide a signed XPI or store listing. Do not disable browser security protections. Firefox 140+ is declared; runtime compatibility remains unverified.

## Use

Sign in to RSI normally. In My Hangar, select **Export my fleet as JSON**. Collection starts only on this click, reads pages sequentially and requests a download named `hangar-export-YYYY-MM-DD-HH-mm-ss.json` (UTC). Keep the tab open. Select **Cancel** to stop without downloading. Browser download policies may require allowing the download.

Review `warnings`, `unresolved` and `errors` in the file and on screen. A download request is not confirmation that the browser saved the file. No dashboard or configuration is needed.

The collector starts from page 1 without the current page's filters and uses the observed `/en/account/pledges` path. It follows next-page links and inspects nested pack contents. Unrecognized pages, login redirects, HTTP failures, identical page contents and limits stop collection with an explicit partial report. An empty page is reported as ambiguous, never as a proven empty account.

## Scope and privacy

Only the HTTPS RSI hangar path, with or without the observed `/en` prefix, is used. Exact static content-script matches are the entire permission surface; a runtime path check also excludes unrelated pages. No cookies, storage, downloads, tabs, background-worker or broad host permissions are requested. The script uses ordinary authenticated same-origin GET requests; it never extracts session secrets or changes the account. No permanent polling or retries occur; see the [collection limits](docs/SECURITY.md).

No server, analytics, third-party requests, remote code, project update mechanism or Juliet integration. Fleet fields are limited to model, manufacturer, category, quantity, names and source/parent references. Purchase IDs, prices, payment details, account identity and purchase dates are not selected or exported. Names and labels remain untrusted page data; inspect a file before sharing it.

Direct ship and ground-vehicle candidates require supported item labels. Variants remain distinct; quantities are not guessed from titles. Unapplied upgrades, paints and equipment never become ships based on a title alone. The observed upgraded pack supplies its current model through included contents. General completeness across all RSI representations is **not qualified** yet.

## Included vehicles, without temporary loaners

Version 0.2.3 exports JSON format **2**, including four officially documented secondary models: **85X** with the 890 Jump, **Skylark** with the Constellation Mk V Centaurus, and **C8X Pisces Expedition + Ursa** with the Carrack Expedition C8X variant. Exact current parent/manufacturer matches trigger a local, dated rule table; no extra web request occurs. [Rules and official sources](docs/INCLUDED_VEHICLES.md).

Each instance identifies `source: "pledge"` or `source: "included"`. Included instances list their parents in `includedWith`. Multiple parents do not multiply a secondary allocation under the current RSI rule; independently pledged copies remain separate. Ambiguous same-pledge overlaps are reported rather than silently counted twice. Temporary replacement and Arena Commander loaners are never inferred. The rule table covers only these parents and always declares that limited coverage.

## Development

Version 0.2.2 bundles the [native format-2 Juliet consumer contract](docs/JULIET_CONTRACT.md) and its [synthetic fixture](contracts/juliet-v2.synthetic.json). A consumer adapter must preserve incomplete-result diagnostics and require acknowledgment before import. The last inspected legacy Juliet parser rejected this object; integration with a newer consumer has not been verified here. No lossy legacy-array export mode has been added. Runtime export behavior is unchanged from 0.2.1.

Requires Node.js 22+ for tests only; the installed extension has no dependencies. Playwright is a development-only dependency for actual browser checks.

```sh
npm test
```

For browser checks, run `npm ci`, `npx playwright install chromium`, then `npm run test:browser`. All test responses are synthetic; no connected RSI account is used. Installation by players does not require these steps.

Load the `extension` directory directly after edits and reload the add-on and hangar tab. See [validation](docs/VALIDATION.md) before changing the adapter. Tests use synthetic data and do not prove real RSI behavior.

The [0.2.1 code review](docs/CODE_REVIEW.md) records each loop and timer's bound and cleanup. The extension schedules no collection while idle; grouping and overlap checks use in-memory indexes rather than repeated full scans.

## Support the project

If you find HangarExportJson useful, you can [make an optional donation through PayPal](https://www.paypal.com/paypalme/ussmarinesdot). Donations support the project's development and maintenance. No donation is required to download or use the extension.

## Uninstall

Open your browser's extensions manager and remove HangarExportJson. Remove downloaded JSON files separately if desired. The extension stores no persistent data. For an unpacked install, remove it before deleting its source directory.

## Browser references

Installation and extension guidance checked on 2026-10-31: [Chrome unpacked installation](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world), [Opera unpacked installation](https://help.opera.com/en/extensions/testing/), [Firefox temporary installation](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/), [Firefox signing](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/), [MDN content scripts](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Content_scripts).

## License and credit

Created and maintained by **[ussmarines](https://github.com/ussmarines)**. HangarExportJson is distributed free of charge under the [MIT License](LICENSE). You may use, modify and redistribute it, including commercially, provided you retain the copyright and license notice in copies or substantial portions. Donations are entirely optional.

This is an independent community project, not affiliated with Cloud Imperium Games. The project license does not grant rights to RSI trademarks or third-party game content.
