# Validation and remaining work

## Evidence recorded on 2026-10-31

### Authorized live RSI inspection

An authenticated hangar was inspected through the Codex in-app browser, using only document reads and the existing pagination links. Its rendered pages were traversed in order; no purchase, upgrade, exchange, gift, naming or profile control was activated. No authentication secrets, purchase identifiers, prices or payment details were selected. No real account HTML, fleet export, custom name or purchase record is committed to this repository.

Observed contracts:

- The current visible path is `/en/account/pledges`. Legacy `/account/pledges` links redirect there.
- `.list-items` contains pledge rows; nested `.item` nodes carry included contents without needing to expand the account's action panels.
- `.title`, `.kind`, `.liner` and `.custom-name-text` provide item model, item type, manufacturer label and an optional custom name.
- `a.gt` is the next-page link; `a.raquo` is the last-page link. Treating the latter as the next page would skip inventory.
- The included content of an observed upgraded pledge shows its current model even though its pledge heading retains the original model. The adapter reads included content, not that heading.
- Ship, Skin, FPS Equipment, Component, Credits, Insurance and Hangar decoration types were observed. Some extras and unapplied upgrade items have no usable kind.

This validates DOM observations for one account snapshot. It does **not** prove that authenticated fetched HTML is identical to the hydrated DOM, that every historical pack/upgrade/quantity representation is supported, or that no item was ambiguously typed. The installed extension was not run against that connected session: the in-app browser does not expose extension installation here. Do not describe this as a successful real-account extension export.

### Synthetic extension execution

Environment: Windows (`win32`), Node.js 26.7.0, Playwright 1.64.1, bundled Chromium 156.0.8078.4, headless persistent isolated test profile. The actual Manifest V3 extension was loaded using Chromium extension flags. No existing browser profile or connected RSI session was used. All page and collection requests were intercepted and fulfilled with synthetic data.

The browser suite verified automatic content-script loading, explicit-click collection, two pages, nested pack contents, legitimate identical copies, a distinct variant, a custom name, an explicit ground-vehicle label, an upgraded final-model item, excluded non-vehicles, an ambiguous extra, downloaded JSON and its filename, concurrent-run prevention, cancellation without a download, 429 termination without retry, unknown markup, streamed-response size limits and pagination selection. Remote resource traps in fetched HTML produced no extra requests or execution. Untrusted labels remained text. A screenshot was visually inspected.

Twenty-one Node tests cover grouping and names, unknown contents, multiple pages, repeat-page ambiguity, partial errors, cancellation, page/entry limits, output-field privacy and the included-vehicle rules. They include 10,000 distinct items and collision-safe tuple grouping. These are synthetic logic tests and do not qualify RSI behavior.

### Included-vehicle verification (0.2.0)

The four derived models are supported by the official RSI source reviewed in [INCLUDED_VEHICLES.md](INCLUDED_VEHICLES.md). Rules require the final parent variant and manufacturer, preserve parent provenance, apply the documented non-stacking secondary allocation, and never consume the temporary Loaner Ship Matrix. Tests cover independently pledged child copies, same-pledge ambiguity, traversal-order independence, upgrading away from a parent and negative loaner-provider cases.

The actual Chromium extension was also exercised with a second synthetic two-page scenario containing all supported parents, two legitimate copies of one parent, an independently pledged child and a temporary-loaner provider. The downloaded version-2 file contained the four supported secondary models, one shared secondary allocation for repeated parents, the independent child and no temporary substitutes. The rest of the browser suite remained green.

A private offline comparison using only model/manufacturer projections from user-supplied export files produced the same model quantities after the documented spelling equivalences. Those input files and results remain outside tracked project files. This checks the expansion logic against an external export, not the extension's real authenticated download or a live ASOP inventory.

## Reproduce

Release 0.2.4 preserves the runtime and JSON format validated above. Packaging checks compare the archived files with the tagged commit, confirm the manifest's version-only change, verify the included synthetic contract and generate a SHA-256 checksum. Unchanged runtime and browser evidence is reused; the two additional contract tests have their own successful evidence. The original release assets remain intact.

Two additional producer contract tests verify the shared [Juliet fixture](../contracts/juliet-v2.synthetic.json) against real `result()` output and check five expanded instances, distinct callsigns, a terrestrial vehicle, shared inclusion provenance and retained diagnostics. They can be run independently with `node --test tests/contract.test.cjs`. The existing 21 unchanged Node checks and Chromium evidence remain applicable: no production or browser-test code changed for this contract. No Juliet consumer integration test has passed or been claimed here; the legacy parser rejected the canonical object at the recorded inspection. This does not establish the current state of a newer consumer.

The [0.2.1 source review](CODE_REVIEW.md) describes the removal of repeated full scans and a redundant link fallback. The affected browser suite additionally exercises a genuinely stalled synthetic response until the production 15-second request timeout, then verifies the controls recover. No real account is used for this check.

Installation needs no development tools. To run checks from the repository root:

```sh
npm ci
npm test
npx playwright install chromium
npm run test:browser
```

Browser checks use an isolated profile and synthetic data only. Artifacts under `output/playwright/` are ignored by Git, including the synthetic screenshot and sample export. Do not put real account data there for publication. Unit tests require no browser.

Re-run affected checks after adapter, UI, manifest or transport changes. Reuse unchanged successful evidence. Documentation-only edits do not require re-running browser tests.

## Historical release gaps (see current browser evidence below)

- Execute the installed extension in an explicitly authorized real RSI browser session and compare its file against the visible inventory, including filtered starting pages and session expiry. Never copy session cookies into an automated profile.
- Test actual Firefox loading, permissions, cancellation and download behavior. Firefox's signing declaration is present, but no signed XPI is available. Browser-engine DOM tests alone do not prove add-on installation.
- Test the unpacked extension in actual Chrome and Opera. Chromium execution is evidence for the shared engine, not certification for every branded browser.
- Qualify multi-ship packs, repeated identical pages, applied and unapplied upgrades, explicit quantities, long/ambiguous names and ground vehicles across additional independent layouts.
- Define stronger completeness evidence before changing `complete` to `true`. Untyped extras remain unresolved; the small included-vehicle table is explicitly partial and requires source review when RSI changes it.
- The project is distributed free of charge under the MIT License with the ussmarines copyright notice retained. The GitHub v0.2.4 prerelease distributes the committed source, license, consumer contract and synthetic fixture as a ZIP with a SHA-256 checksum. It does not provide a signed XPI, store submission or completed real-account qualification; browser settings have not been changed.

No compatibility with Juliet or other fleet importers has been tested.

## 0.2.6 summary and non-fleet recognition

The user supplied a real Firefox-generated JSON with 40 vehicle instances and no declared collection errors. This is user-reported Firefox execution evidence, not an independently observed complete inventory or browser qualification. No private export or pasted account data is committed.

Synthetic checks cover compact instance counts, hidden on-page diagnostics, empty/interrupted summaries, typed ancillary non-fleet exclusions, and narrow untyped labels. Unknown ancillary content stays unresolved in the JSON. Labels alone never add a vehicle. Downloads are requested; successful disk storage cannot be inferred by the extension.

## 0.2.7 desktop browser compatibility

On 2026-11-01, the user explicitly confirmed that Firefox works. Keep this as user-confirmed real-account execution with exact browser/add-on versions unspecified. It is not proof of complete inventory or Firefox 140 minimum-version qualification. Runtime core.js and content.js are unchanged from 0.2.6.

Actual Chrome 156.0.8078.74 and Edge 156.0.4314.58 on Windows each passed all 24 synthetic extension scenarios. Tests used fresh isolated automation profiles and CDP installation of the real unpacked extension, not script injection in place of installation. Initial harness attempts had disabled extensions by default; the final harness explicitly permits extensions only in its owned test process. The successful runs include content-script injection, JSON downloads, summary counts, cancellation, timeouts and rate limits. Existing 24 Node tests and Chromium 0.2.6 evidence remain valid for unchanged runtime logic.

See [BROWSERS.md](BROWSERS.md) for installation, version evidence, unexecuted Opera/Opera GX/Brave/Vivaldi targets and Safari/mobile limits. This supersedes the historical Firefox/Chrome/Edge execution gaps above, without claiming an independently checked live Firefox account or branded-browser live RSI exports. No signing protections or user browser settings were changed.
