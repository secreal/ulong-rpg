---
title: "feat: Add learning source library foundation"
type: feat
status: completed
date: 2026-07-23
---

# Source Library Layer Foundation

## Summary

Create a data-oriented source library foundation for target-quest links.
The scope is currently Codex-owned logic only: catalog extraction, deterministic IDs,
duplicate detection, and CLI generation.

## Problem

Quest links are stored inline per quest, which causes duplication of URLs and labels,
and makes source maintenance hard. A source library should provide:

- canonical deduplicated source entries
- stable IDs for programmatic references
- usage metadata per kind/target/quest

## Requirements

- R1. Build a deterministic source catalog from `data/target-quests` with stable IDs.
- R2. Track source usage metadata (kind, targetId, questId) so downstream refactors can migrate safely.
- R3. Keep inline quest links unchanged for now; generate the catalog as a codex-owned artifact.
- R4. Report conflicts when multiple labels map to the same URL and when same label has divergent URLs.
- R5. Add a CLI entry (`scripts/build-learning-sources.mjs`) to regenerate the catalog into `data/learning-sources.json`.
- R6. Add focused tests for deterministic parsing and duplicate detection.

## Scope

### Included

- New parser/analyzer module in `scripts/lib/learning-source-library.mjs`.
- New CLI script in `scripts/build-learning-sources.mjs`.
- Regression tests for deterministic output and catalog metadata.
- Documentation note in `docs/architecture/learning-source-library.md`.

### Excluded

- Rewriting every quest file to reference source IDs.
- UI rendering changes.
- Search index or external link validation in this iteration.

## Implementation Units

- U1. Source discovery and normalization
  - Parse all available target quest files from `data/target-quests/index.json`.
  - Normalize each link into a canonical key.
  - Build deterministic IDs by kind of source URL (short hash + index).

- U2. Source catalog command
  - Generate `data/learning-sources.json` with `version`, `generatedAt`, and ordered entries.
  - Include conflict buckets (`labelUrlConflict` and `urlLabelConflict`) for refactoring insight.

- U3. Validation tests
  - Fixture-based tests for duplicate URLs, label conflicts, and deterministic catalog ordering.

## Success Criteria

- Running `node scripts/build-learning-sources.mjs --root . --output data/learning-sources.json`
  writes valid JSON with stable order and no regression on existing data.
- Health-focused tests still pass in environments with a synthetic fixture.
