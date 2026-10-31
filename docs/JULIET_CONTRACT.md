# Juliet interoperability contract — canonical format 2

## Decision and current status

Keep the existing canonical export and add a small **consumer-side adapter in Juliet**. No second export mode, legacy-array conversion, invented model code, network call or extension UI is required. The legacy array has no place for completeness, collection errors, unresolved entries or inclusion provenance. A separate sidecar would be easy to omit, so it is not the recommended contract.

The Juliet parser inspected in read-only mode currently accepts only two legacy root arrays. It does **not** accept this canonical object yet. The consumer adapter and its acknowledgment UI must be implemented and tested in the Juliet repository before compatibility is announced. No Juliet source was modified here. Existing v0.2.1 downloads already contain the required canonical fields; no replacement release asset is needed.

A read-only execution of that parser against the shared fixture returned `HANGAR_IMPORT_ENTRY_COUNT_INVALID`. This records the legacy parser's array gate, not a defect in the producer fixture.

## Consumer entry point and structural validation

Preserve both existing array import paths. For an object root, accept only `format: "HangarExportJson"`, `version: 2` and the documented [format-2 fields](FORMAT.md). Treat every field as untrusted data and reject unsupported versions or malformed structures before planning any changes.

Apply Juliet's current limits to the original UTF-8 input and the **expanded instance count**: 2 MiB and at most 1,000 instances, not 1,000 groups. An empty fleet may be inspected as a diagnostic-only report but cannot produce an import plan. Do not truncate an oversized file, drop rows or change quantities to fit a limit.

Validate each group: nonempty string `model` and `manufacturer`, `category` in `ship`/`vehicle`, positive safe-integer `quantity`, and `instances.length === quantity`. The exporter allows 200-character labels/names; Juliet currently accepts model names up to 160 and callsigns up to 100. Reject an over-limit model/name with an explicit diagnostic rather than silently truncating or discarding it. Both categories participate in import.

Validate each instance: `customName` is a string or null; `source` is `pledge` or `included`. Direct instances have `includedWith: null`; included instances have a nonempty array of `{model, customName}` references. Validate references as bounded strings/nulls too. Parent references are provenance, **not extra fleet instances**. Metadata strings and diagnostic arrays must also be type-checked within the input-size bound. Never execute, fetch or automatically open the rule-source URL.

The root requires boolean `complete`, arrays `fleet`, `warnings`, `errors`, `unresolved`, and object `inclusionRules`. Warnings are strings. Errors contain a positive integer `page` and string `code`; unresolved diagnostics contain positive integer `page`/`entry` and string `reason`, with optional `model` (string/null) and `parentModel` (string). Rule metadata contains string `revision`, `quantityPolicy` and `source`. Validate referenced parent model/name fields against the producer's 200-character bound; the 100-character callsign limit applies to names actually proposed for persisted candidates. Reject missing/wrong-type diagnostic containers instead of interpreting them as empty. Do not drop an unfamiliar but well-typed diagnostic code.

## Preview and incomplete-inventory acknowledgment

Retain `complete`, `warnings`, `errors`, `unresolved` and `inclusionRules` in local preview state. Display every diagnostic safely as text, including unknown future codes, and show direct/included origins. Do not apply the legacy array's lack of diagnostics as a reason to discard them.

When `complete` is false **or any diagnostic list is nonempty**, require explicit confirmation that the user accepts importing only the reviewed resolved rows. No default consent, automatic confirmation or automatic apply is permitted. Reset acknowledgment when a file is replaced, reparsed or its reviewed selection changes. A true completeness flag must not override nonempty diagnostic lists. Structural failures block parsing; catalog mismatches remain unresolved for manual selection.

The producer currently always emits `complete: false`. This contract therefore requires an incomplete-inventory acknowledgment even for a file without collection failures. Parsing or opening a file alone must never write hangar data. No raw source file or diagnostic metadata needs to be persisted to Juliet's server.

## One instance, one candidate

Iterate `instances` **once**. Do not multiply by `quantity` after expansion, deduplicate equal models, expand `includedWith`, or run inclusion/loaner rules again. Included quantities were already calculated by the exporter, including the current non-stacking secondary allocation.

For each candidate:

- Use the exact group `model`, preserving the variant. Match against the active Juliet catalog using model **and** manufacturer; ambiguous or missing matches require manual selection. Do not downgrade an edition to its base model.
- Treat `manufacturer` as an observed label. If it ends in an explicit manufacturer-code suffix such as `Origin Jumpworks (ORIG)`, split the actual suffix and label for catalog matching. Without such a suffix, use the observed manufacturer label only; never fabricate a code from a model, use a default maker, or require a fake `ship_code`.
- Use `customName` directly as the proposed callsign, including a name equal to a model label. In format 2 this field is explicitly a custom name, so the XPLORer `ship_name`/base-model heuristic does not apply. Null remains null; do not substitute the model or a parent's name.
- Keep source and parent references visible in the preview. The current Juliet payload can remain restricted to the user-selected Juliet model, origin `pledge` and callsign. That origin is a consumer hangar category; it does not mean an included child was independently purchased. Do not transmit the raw file, diagnostics, parent references, purchase metadata or extra exporter fields as part of that payload.

## Shared synthetic fixture and expected result

[`contracts/juliet-v2.synthetic.json`](../contracts/juliet-v2.synthetic.json) is generated by the real producer logic from synthetic scenarios and fictitious callsigns. Its public model/manufacturer labels exercise exact variants; it contains no account records. Producer tests compare the parsed fixture with actual `result()` output using structural equality, so accidental schema or diagnostic drift is caught.

Expected consumer preview:

| Model                           | Callsign        | Export source                        |
| ------------------------------- | --------------- | ------------------------------------ |
| 890 JUMP                        | Synthetic North | pledge                               |
| 890 JUMP                        | Synthetic South | pledge                               |
| PTV                             | null            | pledge, ground vehicle               |
| F8C Lightning Executive Edition | null            | pledge, exact variant                |
| 85X                             | null            | included, with two parent references |

There are **five candidates**, not four groups, not six instances and not two included 85X copies. The report has `complete: false`, one unresolved item, one synthetic `HTTP_ERROR` and four warnings. These reserves must be visible and block apply until acknowledged. A catalog without the Executive Edition must leave that candidate unresolved; it must not match a base F8C automatically.

Consumer acceptance tests should also mutate this fixture to cover: unsupported version, nonboolean completeness, missing diagnostic lists, a true flag with remaining diagnostics, quantity/instance mismatch, missing manufacturer, over-limit names, unknown source/category, malformed parent references, empty fleet, and more than 1,000 expanded instances. Verify acknowledgment reset and no writes before confirmation. A confirmed integration test must run in Juliet; producer-only tests do not prove that consumer behavior.
