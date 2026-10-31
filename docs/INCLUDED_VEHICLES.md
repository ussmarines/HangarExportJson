# Included vehicles and temporary loaners

The extension bundles a deliberately small, reviewed rule table. It never downloads a catalogue or a loaner matrix at runtime.

## Evidence and scope

Checked on **2026-10-31**, against RSI's [Included Vessels — Snub Fighters and Rovers](https://support.robertsspaceindustries.com/hc/en-us/articles/4408770370455-Included-Vessels-Snub-Fighters-and-Rovers), updated on October 20, 2026:

| Observed parent model                     | Added included model  | Manufacturer             | Category |
| ----------------------------------------- | --------------------- | ------------------------ | -------- |
| 890 JUMP                                  | 85X                   | Origin Jumpworks         | ship     |
| Constellation Mk V Centaurus              | Skylark               | Roberts Space Industries | ship     |
| Carrack Expedition with Pisces Expedition | C8X Pisces Expedition | Anvil Aerospace          | ship     |
| Carrack Expedition with Pisces Expedition | Ursa                  | Roberts Space Industries | vehicle  |

The long Carrack label is the included-item model observed in RSI's hangar DOM. It is mapped explicitly to the official table's `Carrack Expedition w/ C8X` variant. The exact `w/ C8X` and `w/C8X` spellings are also supported. A plain Carrack Expedition is **not** treated as this variant. Model and manufacturer must both match; the original parent label is preserved in the export.

RSI distinguishes parent-linked included vessels from temporary substitutes in its [Loaner Ship Matrix](https://support.robertsspaceindustries.com/hc/en-us/articles/360003093114-Loaner-Ship-Matrix). Some included craft use the same allocation system, so presence in that matrix alone does not make a vessel a temporary substitute. Only the four supported included models above are derived. Temporary replacements and Arena Commander craft are never added. A directly pledged ship is retained even if that model can also serve as somebody else's loaner.

RSI currently limits secondary allocation to **one copy of a model across multiple parents**. The included instance therefore lists every triggering parent instead of increasing its quantity. Independently pledged copies remain additional instances. This models the documented allocation rule, not a verified live ASOP inventory or a prediction of future allocation changes.

## Conservative expansion

- Only typed, directly observed current-model items trigger rules. Pledge headings, unapplied upgrades, paints and generated children cannot trigger them. Upgrading away from a parent removes the matching inclusion automatically on the next export.
- Each generated instance has `source: "included"`, `customName: null`, and an `includedWith` array of parent model/name references. A parent name never becomes the child's name. No purchase identifiers are needed.
- A child already present in the same pledge could be a represented inclusion or an independent purchase. The exporter keeps observed entries, blocks all speculative allocation for that child model across the run, and emits `INCLUSION_OVERLAP`. This is independent of traversal order. A child in a separate pledge remains an independent copy when no such overlap exists.
- No recursive expansion, blanket base-model normalization or full-fleet completeness claim is made. Other parent models are outside this small table; `INCLUDED_VESSEL_RULES_PARTIAL` states that limitation.

The rules' review date, source URL and quantity policy travel in the JSON's `inclusionRules` field. This is reproducibility metadata, not a network request or automatic update mechanism. If RSI changes the rules, maintainers must review the official source, adjust the local table, bump the extension version and rerun affected tests.
