# JSON format — version 2

The format is independent of Juliet and every other importer. No compatibility with Juliet has been tested.

The [Juliet consumer contract](JULIET_CONTRACT.md) describes a native format-2 adapter and provides a shared synthetic fixture. The last inspected legacy-array parser rejected this object; this repository has not validated integration with a newer Juliet adapter. This is an implementation contract, not an integration-success claim.

| Field            | Meaning                                                                                       |
| ---------------- | --------------------------------------------------------------------------------------------- |
| `format`         | Exactly `HangarExportJson`.                                                                   |
| `version`        | Integer `2`. Consumers must reject unsupported versions.                                      |
| `complete`       | Always `false` in 0.2.4. Finishing pagination does not establish a fully qualified inventory. |
| `inclusionRules` | Local rule revision, public source URL and quantity policy. No runtime catalogue fetch.       |
| `fleet`          | Groups of directly observed vehicle candidates and supported included craft.                  |
| `unresolved`     | Entries or items that cannot safely be interpreted.                                           |
| `errors`         | Collection failures, with a page number and fixed error code.                                 |
| `warnings`       | Fixed codes describing semantic limitations.                                                  |

Each fleet group has `model`, `manufacturer`, `category`, `quantity` and `instances`. Direct model and manufacturer values preserve the exact trimmed RSI labels, including variants and manufacturer abbreviations. Generated children use the four labels documented in [INCLUDED_VEHICLES.md](INCLUDED_VEHICLES.md). Different variants are never normalized to a base model. Values over 200 characters or ambiguous duplicate fields are not guessed.

`quantity` equals the number of `instances`. Every instance contains:

- `customName`: the unique observed item name, or `null`. Included children always have `null`; a parent name is never inherited.
- `source`: `pledge` for a directly observed item, or `included` for a child derived from a supported parent.
- `includedWith`: `null` for a direct item; otherwise an array of `{model, customName}` parent references. Multiple unnamed parent copies may produce identical references; these represent separate observed parents.

Direct copies remain separate instances, including independently pledged copies of a model also provided as an inclusion. Secondary models currently have one included instance across matching parents, with all parent references retained. Page and entry positions in diagnostics are traversal positions, never purchase identifiers. No persistent instance IDs are exported, so different snapshots cannot reliably reconcile particular unnamed copies.

For direct entries, `category` reflects RSI's item type: `ship` corresponds to `Ship`; `vehicle` corresponds to `Vehicle` or `Ground Vehicle`. RSI can label a terrestrial vehicle `Ship`, so this field is not a general physical classification. For generated children, the reviewed table assigns `vehicle` to Ursa and `ship` to the three spacecraft. Ground vehicles are included in the fleet.

The parser reads each `.item` node once within its pledge, never a pledge heading as the model. Explicit Skin, FPS Equipment, Component, Credits, Insurance and other supported non-vehicle types are excluded. Untyped extras remain unresolved. Only directly observed final models with a reviewed exact parent/manufacturer match can create an inclusion; loaner substitutions never do.

Repeated whole-page contents stop collection with `REPEATED_OR_IDENTICAL_PAGE`. Identical pages may represent legitimate copies or a pagination failure; without purchase IDs the collector reports this ambiguity instead of inflating or silently discarding quantities. Within one pledge, a potential explicit/inferred child overlap emits `INCLUSION_OVERLAP` and skips the speculative extra, preserving observed copies. The format never claims a complete result in either case.

## Entirely synthetic fleet example

The names below are fictitious and illustrate the schema, not additional bundled rules.

```json
{
  "format": "HangarExportJson",
  "version": 2,
  "complete": false,
  "inclusionRules": {
    "revision": "2026-10-31",
    "quantityPolicy": "one-included-instance-per-model",
    "source": "https://support.robertsspaceindustries.com/hc/en-us/articles/4408770370455-Included-Vessels-Snub-Fighters-and-Rovers"
  },
  "fleet": [
    {
      "model": "Synthetic Scout XL",
      "manufacturer": "Synthetic Works",
      "category": "ship",
      "quantity": 2,
      "instances": [
        { "customName": "Dawn", "source": "pledge", "includedWith": null },
        { "customName": null, "source": "pledge", "includedWith": null }
      ]
    },
    {
      "model": "Synthetic Rover",
      "manufacturer": "Example Motors",
      "category": "vehicle",
      "quantity": 1,
      "instances": [
        {
          "customName": null,
          "source": "included",
          "includedWith": [
            { "model": "Synthetic Scout XL", "customName": "Dawn" },
            { "model": "Synthetic Scout XL", "customName": null }
          ]
        }
      ]
    }
  ],
  "unresolved": [{ "page": 2, "entry": 1, "reason": "ANCILLARY_CONTENT_UNVERIFIED" }],
  "errors": [],
  "warnings": [
    "COMPLETENESS_NOT_QUALIFIED",
    "UNTYPED_CONTENT_NOT_INFERRED",
    "INCLUDED_VESSEL_RULES_PARTIAL",
    "TEMPORARY_LOANERS_NOT_INCLUDED"
  ]
}
```

## Diagnostics and migration

Unresolved reasons: `MISSING_CONTENTS`, `ANCILLARY_CONTENT_UNVERIFIED`, `UNRECOGNIZED_ITEM`, `AMBIGUOUS_CUSTOM_NAME`, `INCLUSION_OVERLAP`. Overlap diagnostics include the child `model` and `parentModel`. An unrecognized item may include a bounded model label or `null`. Ambiguous custom names remain `null` in the counted instance and are reported separately.

Errors: `UNRECOGNIZED_PAGE`, `UNKNOWN_PAGINATION`, `PAGE_MISMATCH`, `EMPTY_OR_UNRECOGNIZED_HANGAR`, `HTTP_ERROR`, `RATE_LIMITED`, `UNEXPECTED_RESPONSE`, `REQUEST_TIMEOUT`, `RESPONSE_LIMIT`, `ENTRY_LIMIT`, `ITEM_LIMIT`, `COLLECTION_LIMIT`, `REPEATED_OR_IDENTICAL_PAGE`, `COLLECTION_FAILED`.

Version 1 exported only direct candidates and instances containing `customName`. Version 2 explicitly adds source/provenance and included-vehicle semantics; consumers must not reinterpret version 2 totals as a count of independently pledgeable items. The new source metadata also explains why a secondary model does not multiply with its parents.

An error report may contain zero fleet entries. Cancellation or overall timeout produces no download. An empty list is ambiguous; zero resolved vehicles is never presented as proof of an empty hangar. Consumers must show the completeness warning before accepting data.
