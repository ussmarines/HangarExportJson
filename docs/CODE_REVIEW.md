# Code review — 0.2.1

Reviewed on 2026-10-31. This is a focused source review and synthetic validation record, not a guarantee against every browser or RSI regression.

## Useful work and lifecycle

`core.js` contains the shared data logic. `parse` reads one inert hangar document; `collect` coordinates bounded pages and calls `result`; `result` groups direct items and applies the small inclusion table. All three exports are used by the extension or its verification tools. Internal helpers are used; no unused production function or dependency was identified. `content.js` adds the controls once and connects the explicit click/cancel handlers to this logic. No background process is registered.

Grouping now uses a tuple-keyed Map rather than repeatedly searching all previously collected groups. Included-child overlap checks use an entry-level Set, built only when an entry actually contains a supported parent. This removes repeated full-entry scans and avoids building indexes for unrelated gear. A redundant pagination-link fallback was removed: the selected `a.gt` element is already an anchor.

Production and test sources use consistent two-space formatting and expanded control flow for easier review. Formatting adds no runtime dependency or scheduled work.

## Loop and timer bounds

| Work                 | Bound and cleanup                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Page loop            | At most 100 responses, sequential page numbers, repeated-page detection, five-minute abort.                         |
| Response stream      | 15-second request abort, five-million-byte response cap, 25-million-byte run cap; reader cancellation in `finally`. |
| Parsed entries/items | 10,000-entry and 10,000-item collection limits; synchronous processing of already bounded input.                    |
| Included vehicles    | Three local parent rules, at most four derived models, no recursion; finite parent-reference lists.                 |
| Between-page delay   | One 1.5-second timeout; cancel clears it, successful completion removes its abort listener.                         |
| Request deadline     | One timeout per request; cleared in `finally`, along with its parent-signal listener.                               |
| Overall deadline     | One timeout per export; cleared on every exit.                                                                      |
| Download cleanup     | One 30-second timeout to revoke each completed Blob URL; it performs useful one-off cleanup.                        |

No `setInterval`, permanent observer, automatic retry, automatic resume, startup collection or permanent polling is present. When idle, the script retains its controls and event handlers but schedules no collection work. The export button and controller guard prevent concurrent runs in one tab. Separate tabs remain independent.

## Validation and limits

The Node suite includes 10,000 distinct items at the supported collection boundary and verifies collision-safe grouping for labels containing separators. Browser checks load the real extension with synthetic responses, verify cancellation and exercise the actual 15-second request deadline followed by a usable export button. Existing grouping, inclusion, privacy, pagination and download checks remain part of those affected suites.

The JSON format stays at version 2; the inclusion rules and their review date do not change in 0.2.1. No permissions, runtime dependencies, network endpoints or account-writing operations were added. The [real-browser qualification gaps](VALIDATION.md#release-gaps) remain explicit. Private comparison inputs and generated outputs are excluded from Git.
