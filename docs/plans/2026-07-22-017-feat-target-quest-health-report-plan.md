---
title: "feat: Add Target Quest Health Report"
type: feat
status: completed
date: 2026-07-22
origin: docs/ideation/2026-07-22-surprise-me-ulong-rpg.md
---

# feat: Add Target Quest Health Report

## Summary

Add a deterministic, repo-side health analyzer for the target quest catalog, expose its findings as terminal, JSON, and Markdown reports, and reconcile the skill-name drift it discovers. The work stays in the data and tooling layer; no UI or runtime quest behavior changes are included.

## Problem Frame

The target quest catalog has grown to hundreds of targets and thousands of quests. The current validator catches invalid schema, but it does not summarize catalog health, source concentration, localization coverage, dependency metadata, or cross-file drift in a form that maintainers can inspect and track.

The current baseline also demonstrates a concrete drift failure: skill names in `index.html` are Title Case while nearly all `data/target-quests/skills.json` target names and progress keys still use older casing. The existing validator consequently fails and runtime lookups can miss the intended quest target.

## Requirements

- R1. Analyze every available file declared by `data/target-quests/index.json` and report aggregate and per-kind counts for targets, quests, fundamental targets, dependent targets, and unique learning sources. (see origin: `docs/ideation/2026-07-22-surprise-me-ulong-rpg.md`)
- R2. Detect structural and referential errors already relevant to the catalog contract, including unreadable or malformed JSON, missing fields, invalid level counts, duplicate quest IDs, malformed links, missing `fundamental`, catalog mismatches, and stale skill progress keys.
- R3. Detect maintainability warnings, including highly concentrated source URLs, conflicting label-to-URL mappings, incomplete English/Indonesian equipment or talent descriptions, and contradictory fundamental/dependency metadata.
- R4. Produce deterministic terminal, JSON, and Markdown representations so humans, future automation, and Claude-owned UI work can consume the same analysis.
- R5. Support a configurable failure threshold so CI-style usage can fail on errors while exploratory reporting can still display warnings.
- R6. Reconcile skill target names and `source.progressKey` values with the canonical Title Case skill strings in `index.html` without changing quest schema or quest content.
- R7. Cover the analyzer with Node built-in tests and keep the repository dependency-free.
- R8. Document how to run, export, and interpret the report.

## Assumptions

- The report is a maintainer-facing data artifact, not an in-game screen; Claude may design a UI consumer later.
- Existing hard validation remains authoritative. The health analyzer may share equivalent checks, but it does not weaken `scripts/validate-target-quests.mjs`.
- Source concentration is a warning, not an automatic content-quality verdict; repeated official sources can be legitimate.
- A generated Markdown snapshot belongs under `docs/reports/` and should be reproducible without timestamps or machine-specific paths.
- Case-insensitive matching is acceptable only for the one-time skill-name reconciliation; canonical persisted values must exactly match `index.html` afterward.

## Scope Boundaries

- No edits to `index.html`, runtime quest selection, cards, modals, or other UI/UX.
- No quest copy rewriting and no replacement of learning links in this change.
- No migration of legacy `data/quests/*.json` files.
- No network requests or live broken-link crawling; URL syntax and catalog concentration are analyzed locally.
- No new package manager or third-party dependency.

### Deferred to Follow-Up Work

- Claude-owned visual dashboard or in-app health presentation.
- Scheduled CI execution and remote URL availability checks.
- Source-library normalization and bulk learning-source replacement.
- Full prerequisite graph authoring for dependent targets.

## Context & Research

### Relevant Code and Patterns

- `scripts/validate-target-quests.mjs` establishes the repository's dependency-free Node validation pattern and current target identity checks.
- `data/target-quests/index.json` is the authoritative list of available skill, equipment, and talent quest files.
- `data/equipment.json` and `data/talents.json` use bilingual `description.en` and `description.id` fields and stable IDs.
- `index.html` remains the canonical source for skill display names and `skill::<exact name>` progress keys.
- `docs/handoffs/target-quest-data-for-claude.md` assigns target quest data and tooling to Codex while reserving rendering and interaction design for Claude.
- Baseline validation currently reports 198 stale skill names after the Title Case migration, making cross-file drift an immediate rather than hypothetical problem.

### External References

No external research is required. The implementation uses stable Node.js built-ins and repository-local data contracts.

## Key Technical Decisions

- Keep health analysis separate from hard validation: validation answers whether data is usable, while the report explains quality, concentration, and drift.
- Put reusable analysis and formatting logic in a library module, with a thin CLI entry point and Node built-in tests.
- Represent findings with stable rule IDs, severity, location, message, and details so text, JSON, and Markdown remain consistent.
- Sort all metrics and findings deterministically and omit generation timestamps from tracked output.
- Treat source overuse as a transparent threshold-based warning and include the affected target count and share, avoiding subjective domain classification.
- Reconcile skill casing in data rather than loosening exact progress-key validation, preserving the established runtime contract.

## Implementation Units

- U1. **Build the reusable health analyzer**

  **Requirements:** R1, R2, R3, R4, R5

  **Files:**
  - Create: `scripts/lib/target-quest-health.mjs`
  - Test: `scripts/target-quest-health.test.mjs`

  **Approach:**
  - Load the target quest index, declared target files, canonical equipment/talent catalogs, and canonical skill names.
  - Normalize every target into shared metrics without mutating source data.
  - Emit stable findings for schema/referential errors and maintainability warnings.
  - Aggregate source usage by URL and label, with explicit concentration thresholds and deterministic sorting.
  - Expose text/Markdown and JSON-compatible report formatters from the same analysis result.

  **Test scenarios:**
  - A complete minimal skill/equipment/talent fixture reports correct totals and no errors.
  - A missing or malformed declared data file becomes a stable finding instead of an uncaught exception.
  - Missing `fundamental`, malformed URLs, duplicate quest IDs, and wrong level counts produce stable error rule IDs.
  - Stale skill names/progress keys and missing bilingual catalog descriptions are detected.
  - Concentrated URLs and conflicting source labels produce warnings without becoming structural errors.
  - Repeated runs produce identical serialized output.

- U2. **Add the health-report CLI and tracked snapshot**

  **Requirements:** R4, R5, R8

  **Dependencies:** U1

  **Files:**
  - Create: `scripts/report-target-quest-health.mjs`
  - Create: `docs/reports/target-quest-health.md`
  - Modify: `README.md`
  - Test: `scripts/target-quest-health.test.mjs`

  **Approach:**
  - Support terminal summary output by default plus explicit JSON and Markdown formats.
  - Support writing to a caller-selected output path and failure thresholds of error, warning, or none.
  - Generate the tracked Markdown snapshot from the same formatter used by the CLI.
  - Document commands for validation, health checks, machine-readable output, and snapshot refresh.

  **Test scenarios:**
  - CLI argument parsing accepts supported formats and thresholds and rejects unknown values.
  - Error threshold exits nonzero only when matching findings exist.
  - Output-file mode writes the requested deterministic representation.

- U3. **Reconcile canonical skill target identity**

  **Requirements:** R2, R6

  **Dependencies:** U1

  **Files:**
  - Modify: `data/target-quests/skills.json`
  - Test: `scripts/validate-target-quests.mjs`
  - Test: `scripts/target-quest-health.test.mjs`

  **Approach:**
  - Match each target to the canonical skill string from `index.html` using its stable slug.
  - Update only `targetName` and `source.progressKey` to the exact canonical display name and progress-key casing.
  - Preserve target IDs, quest IDs, quest text, links, level structure, and fundamental metadata.

  **Test scenarios:**
  - Every skill target ID maps to exactly one canonical job skill.
  - Every skill target name and progress key exactly matches its canonical value.
  - The existing target quest validator passes after reconciliation.

## Verification

- Run `node --test scripts/target-quest-health.test.mjs`.
- Run `node scripts/validate-target-quests.mjs`.
- Run `node scripts/report-target-quest-health.mjs --format markdown --output docs/reports/target-quest-health.md` and confirm a second run produces no diff.
- Run `node scripts/report-target-quest-health.mjs --format json --fail-on error` and confirm a zero exit status on the reconciled catalog.
- Run browser smoke tests to ensure the static app still loads and target quest fetches are unaffected.

## Risks and Mitigations

- **False-positive source warnings:** Keep thresholds visible, classify them as warnings, and report evidence rather than judging source quality automatically.
- **Large mechanical data diff:** Restrict reconciliation to two fields per skill target and verify IDs, quest copy, and counts remain unchanged.
- **Analyzer/validator disagreement:** Preserve the existing validator and run both tools; shared contracts are asserted independently in tests.
- **Stale generated report:** Make output deterministic, document the refresh command, and verify regeneration produces no diff.

## Success Criteria

- Maintainers can see catalog totals and actionable findings without manually inspecting thousands of quests.
- Machine-readable JSON and human-readable Markdown describe the same findings.
- Current skill target identity drift is removed and the existing validator passes.
- Tests cover healthy and unhealthy fixtures without adding dependencies.
- No UI/runtime files are modified.
