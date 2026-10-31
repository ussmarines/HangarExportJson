# Downloading and updating releases

Current package: **0.2.4**, published as an experimental GitHub prerelease on **2026-11-01** (Europe/Paris). [Release page](https://github.com/ussmarines/HangarExportJson/releases/tag/v0.2.4) · [ZIP download](https://github.com/ussmarines/HangarExportJson/releases/download/v0.2.4/HangarExportJson-0.2.4.zip).

## Contents and installation

The ZIP contains the committed source tree: `extension/`, English/French README files, MIT `LICENSE`, technical documentation, the synthetic interoperability contract and development tests. It contains no real account exports, local browser profiles, authentication secrets, `node_modules` or generated test artifacts.

Extract `HangarExportJson-0.2.4.zip`. The directory to load in the browser is **`HangarExportJson-0.2.4/extension`**. No build, npm installation, payment or additional account is required. Use the [English](../README.md#quick-installation) or [French](../README.fr.md#installation-simple) browser instructions. Firefox manual loading remains temporary; no signed XPI or store listing is provided.

To update an unpacked installation, keep the extracted files in a stable directory. If the extension manager supports changing the loaded path, select the new `extension` directory; otherwise remove the old manually loaded extension and load the new directory using the original installation steps. Reload the RSI hangar tab afterward. Removing the extension does not remove JSON files already downloaded.

## Integrity and provenance

`SHA256SUMS-0.2.4.txt` is provided alongside the ZIP. Compare its hash with the SHA-256 hash computed for your downloaded archive. The checksum detects accidental changes; it is not a separate signing certificate. Obtain both files from this repository's public release page.

The release tag points to the source commit used for the ZIP. Packaging compares every archived file with that commit, validates the manifest version and checks the bundled license, donation links and contract fixture. Existing tags and older archives are not overwritten.

## Scope and retained limitations

Version 0.2.4 changes documentation and distribution metadata only. Runtime scripts, permissions, included-vehicle rules and JSON format 2 are unchanged. The successful evidence for 21 runtime Node checks, two producer contract checks and the Chromium suite is reused because those surfaces have not changed. New packaging and documentation-link checks apply to this archive.

The export still reports `complete: false`. [Validation](VALIDATION.md) records the difference between authorized RSI DOM inspection, synthetic extension execution and unperformed real-account/browser qualification. The [Juliet contract](JULIET_CONTRACT.md) is an implementation handoff, not a claim that a newer Juliet consumer has been tested here.

## Free distribution and optional support

Created and maintained by **ussmarines**. The project is publicly available and distributed free of charge under the [MIT License](../LICENSE), with the copyright/license notice retained when copying or redistributing. MIT also permits commercial redistribution.

[PayPal donations](https://www.paypal.com/paypalme/ussmarinesdot) are optional. They are linked in the documentation, GitHub funding configuration and release notes; the extension does not contact PayPal or require a donation.
