# Security and privacy

## Trust boundaries

The extension is a static Manifest V3 content script. It has no backend, background worker, settings page, runtime dependency, telemetry, remote code, project update URL or communication with Juliet. Playwright is a development-only browser testing dependency and is not part of the installed extension.

The only match patterns are the exact HTTPS RSI hangar paths, with and without the observed `/en` prefix and with optional query parameters. A second runtime pathname guard prevents execution on other account pages. There are no `permissions`, `host_permissions`, storage APIs, cookie APIs or messaging bridges. Firefox declares `data_collection_permissions.required: ["none"]`.

The player must grant hangar site access for the content script to work. This lets it read the hangar DOM and add local export controls. There is no need for `downloads`: an ordinary Blob link requests a browser-managed download. There is no need for `activeTab`, `tabs`, `scripting`, `<all_urls>` or access to other RSI subdomains.

## Read-only RSI requests

After an explicit export click, requests are sequential GETs to `https://robertsspaceindustries.com/en/account/pledges?page=N&pagesize=10`. The ordinary same-origin browser session authenticates them. No cookie, token, authorization header or authentication storage is extracted. Redirects are rejected, rather than followed into an unknown page or host. Non-HTML responses and HTTP failures stop collection; 429 is never retried.

Limits: 100 pages, 10,000 entries and 10,000 included items per run, 5,000,000 bytes per response, 25,000,000 bytes overall, 15 seconds per request and 5 minutes per run. Subsequent requests wait 1.5 seconds. There are no retries, concurrent requests, permanent polling or automatic resume. Cancel aborts the current request or delay and discards the pending result. Each tab has a concurrent-run guard; separate tabs are independent, so use one export tab at a time.

There are no purchases, POST requests, upgrade applications, gifts, exchanges, renames, profile edits or account mutations in the extension. RSI's own page scripts remain outside the extension's control.

## Data handling

Fetched HTML may contain account information as part of RSI's normal response. It remains transient in browser memory. The adapter selects only included-item title, kind, manufacturer and custom-name text, the explicit no-items label and pagination links. It never selects hidden inputs, purchase IDs, pledge titles, dates, prices, payment fields, account handles or login information. Export construction explicitly allowlists fields. Raw page HTML, request headers and account information are never logged or saved by the extension.

Fetched markup is parsed inside an unattached HTML template. Template contents stay inert; they are never inserted into the document. This avoids executing scripts or loading resources embedded in a fetched page. The extension UI uses `textContent` for all data and diagnostics. There is no `eval`, `Function`, page-world script injection, HTML rendering of labels or external script inclusion. The single `innerHTML` assignment is an inert parsing boundary, not an insertion of RSI content into the live page.

The result exists in memory and in the locally downloaded file. Blob URLs are revoked after 30 seconds. No persistent extension storage is used. Model names and especially custom names can still be personal; review files before sharing them. Downloaded files are not removed when uninstalling the extension.

Version 0.2.0 adds only a local inclusion-rule table and JSON provenance. It does not expand site permissions or introduce requests. Derived children are limited to four models and do not recurse. Their public rule-source URL and review date are export metadata, not remote code or a runtime lookup. A same-pledge overlap blocks speculative allocation for that child model across the run, regardless of traversal order.

## Review evidence and reporting

The [code review](CODE_REVIEW.md) lists all loop bounds, timer cleanup and idle behavior. Version 0.2.1 changes local grouping/indexing only; its format, supported included models and permission boundary remain unchanged.

See [VALIDATION.md](VALIDATION.md) for the exact distinction between real DOM inspection and synthetic extension execution. Tests intercept all browser network requests and reject any non-GET or off-path request. They include remote-image/script traps in fetched HTML and verify no request or execution follows.

Report problems through the repository's GitHub issues using a synthetic reproduction. Do not attach account exports, screenshots containing private account details, request headers, cookies, tokens or full RSI HTML. No security-support SLA is offered.
