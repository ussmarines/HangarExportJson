# Browser compatibility — 0.2.7

One desktop WebExtension ZIP is shared by Firefox and Chromium browsers. It uses Manifest V3, static RSI-only content scripts and standard DOM/fetch/download APIs; no browser-specific runtime API, background service worker or remote code is used. Firefox-specific manifest settings are ignored by Chrome ([MDN](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/manifest.json/browser_specific_settings)).

## Evidence and installation

Extract `HangarExportJson-0.2.7.zip` first. The selected folder must contain `manifest.json` directly. Reload the RSI hangar tab after installing or updating. Allow access to the RSI hangar if requested. Managed-browser policies may prevent manual loading.

| Desktop browser | Evidence | Manual installation |
| --- | --- | --- |
| Firefox 140+ | User confirmed successful real-account export on 2026-11-01; exact Firefox/add-on versions not supplied. No runtime change in 0.2.7. The minimum 140 version is declared, not separately tested. | `about:debugging#/runtime/this-firefox` → Load Temporary Add-on → extracted `manifest.json`. |
| Google Chrome | Actual Chrome 156.0.8078.74, 24 synthetic extension scenarios on Windows. | `chrome://extensions` → Developer mode → Load unpacked → extracted folder. |
| Microsoft Edge | Actual Edge 156.0.4314.58, 24 synthetic extension scenarios on Windows. | `edge://extensions` → Developer mode → Load unpacked → extracted folder. |
| Chromium | 24 synthetic extension scenarios passed for unchanged 0.2.6 runtime. | `chrome://extensions` → Developer mode → Load unpacked. |
| Opera / Opera GX | Intended compatible desktop targets through Chromium extension support; not installed or executed here. | `opera://extensions` → Developer mode → Load unpacked → extracted folder. |
| Brave | Intended compatible desktop target through Chromium extension support; not installed or executed here. | `brave://extensions` → Developer mode → Load unpacked → extracted folder. |
| Vivaldi | Intended compatible desktop target through Chromium extension support; not installed or executed here. | `vivaldi://extensions` → Developer mode → Load unpacked → extracted folder. |
| Safari | Not provided by this ZIP. Requires Apple conversion/packaging and testing. | No Safari installation artifact supplied. |
| Mobile browsers | Not qualified by this release. | Desktop instructions do not establish Android/iOS support. |

A successful synthetic browser test checks actual add-on loading, content-script injection, collection, JSON download, compact count, cancellation and error handling. It does not prove complete live RSI inventories, other operating systems or every branded Chromium browser. Version 0.2.7 changes manifest metadata and test/documentation coverage only; the collector and UI are byte-for-byte unchanged from 0.2.6.

## Firefox persistence

Temporary loading works without signing and ends when Firefox closes. A permanent standard-Firefox installation requires Mozilla signing. This release does not contain a signed XPI and does not require disabling signing checks. See [Mozilla temporary installation](https://extensionworkshop.com/documentation/develop/temporary-installation-in-firefox/) and [signing and distribution](https://extensionworkshop.com/documentation/publish/signing-and-distribution-overview/).

## Reproduce branded-browser checks

With development dependencies installed, use PowerShell from the repository root:

```powershell
$env:HANGAR_BROWSER_CHANNEL = 'chrome' # or 'msedge'; default is 'chromium'
npm run test:browser
```

Tests load the actual unpacked extension into an isolated persistent automation profile, serve only synthetic responses and close the owned browser afterward. Chrome/Edge use CDP `Extensions.loadUnpacked`; the debugging switch is confined to the test process. These are not user installation steps. No existing browser profile, login session or global setting is used. Test results and profiles remain ignored under `output/`.

## Official browser references

- [Chrome unpacked installation](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked)
- [Edge sideloading](https://learn.microsoft.com/en-us/microsoft-edge/extensions-chromium/getting-started/extension-sideloading)
- [Opera extension platform](https://help.opera.com/en/extensions/)
- [Brave Chrome-extension support](https://brave.com/learn/using-chrome-extensions-in-brave/)
- [Vivaldi extension installation](https://help.vivaldi.com/desktop/appearance-customization/extensions/)
- [Safari extension packaging](https://developer.apple.com/safari/extensions/)
