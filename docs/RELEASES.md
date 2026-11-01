# Downloading and updating releases

Current package: **0.2.6**, experimental prerelease dated **2026-11-01** (Europe/Paris). [Release page](https://github.com/ussmarines/HangarExportJson/releases/tag/v0.2.6) · [ZIP download](https://github.com/ussmarines/HangarExportJson/releases/download/v0.2.6/HangarExportJson-0.2.6.zip).

## Contents and installation

Extract the release ZIP and load the extracted directory containing **manifest.json** directly. It contains only `manifest.json`, `core.js`, `content.js` and the MIT `LICENSE`. No build or npm installation is required. Firefox temporary loading uses the extracted `manifest.json`; no signed XPI is provided.

The old 0.2.4 release and GitHub **Code → Download ZIP** archives contain the source tree: load their **extension** subfolder instead. Selecting their repository root produces “Manifest file is missing or unreadable”.

For updates, extract into a stable directory, remove the previous unpacked installation and load the new directory. Reload the RSI hangar tab afterward. Previously downloaded JSON files are unaffected.

## Packaging and integrity

Run `powershell -File scripts/package.ps1` from the repository. It writes `output/installable/HangarExportJson-0.2.6.zip` and its `.zip.sha256` checksum. Packaging uses an explicit allowlist to exclude local exports, dependencies and browser profiles. Compare the downloaded ZIP hash with the accompanying SHA-256 file. This detects accidental changes; it is not a signing certificate. Source, documentation and synthetic contracts remain available at tag `v0.2.6`. Older assets are not overwritten.

## Scope and retained limitations

Version 0.2.6 replaces the on-page diagnostic list with the number of vehicle instances written to JSON. Interrupted collections remain clearly marked as partial. Explicit non-fleet types are excluded even in ancillary containers; narrow untyped upgrade and non-fleet labels are recognized. Unknown extras remain unresolved in JSON. Permissions, included-vehicle rules and JSON format 2 are unchanged. The packaged extension is checked in Chromium using synthetic scenarios. A real-account export and Firefox/Opera execution remain unverified. Every export still reports `complete: false`. See [validation](VALIDATION.md) and the [Juliet contract](JULIET_CONTRACT.md).

## Free distribution and optional support

Created and maintained by **ussmarines**. The project is publicly available and distributed free of charge under the [MIT License](../LICENSE), with the copyright/license notice retained when copying or redistributing. MIT also permits commercial redistribution.

[PayPal donations](https://www.paypal.com/paypalme/ussmarinesdot) are optional. They are linked in the documentation, GitHub funding configuration and release notes; the extension does not contact PayPal or require a donation.
