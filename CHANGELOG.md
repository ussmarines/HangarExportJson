# Changelog

## 0.2.0 — 2026-10-31

- Verify four included craft against RSI's official included-vessels table and bundle narrowly scoped local rules.
- Add 85X, Skylark, C8X Pisces Expedition and Ursa only for supported exact final-parent/manufacturer matches; do not infer temporary replacements.
- Follow RSI's current one-per-model secondary allocation and preserve all parent references, with independent pledged copies remaining distinct.
- Report same-pledge overlaps and block speculative allocations consistently across page order.
- Introduce JSON format 2 with per-instance source/parent provenance and dated rule metadata.
- Add inclusion, loaner-exclusion and actual Chromium download tests; update both README languages and technical documentation.

## 0.1.0 — 2026-10-31

- Add a dependency-free Manifest V3 extension targeting Firefox, Chrome and Opera.
- Export typed included-item candidates across bounded sequential hangar pages.
- Preserve per-instance custom names and distinct variants; report unknown contents and collection errors.
- Add cancellation, progress, a single-run guard and local JSON downloads.
- Correct the localized RSI path and distinguish next-page from last-page navigation using authorized DOM inspection.
- Document English/French installation, format, privacy boundaries and incomplete qualification.
- Add synthetic collector and actual Chromium extension browser checks.
