---
date: 2026-05-12
status: active
origin: docs/brainstorms/quest-system-requirements.md
---

# feat: Quest System Data

## Summary

Move quest content out of `index.html` into per-job quest data files, then build a scalable quest catalog with chained main quests and optional daily quests. The plan keeps UI/UX work out of scope, but prepares the data shape and state contract Claude or later UI work can consume.

---

## Problem Frame

Quest content currently lives inline in `index.html`, only covers Frontend Developer and Manual QA, and uses a simple boolean completion model. The new quest model needs per-job loading, main quest sequencing, required summaries, daily cooldown behavior, and an archive/history record without making the main HTML file heavier.

---

## Requirements

- R1. Quest data is external to `index.html` and split per job.
- R2. A quest index maps job titles to per-job quest files.
- R3. Each job quest file can contain `main` and `daily` quest sections.
- R4. Main quests are sequential and skill-driven, not fixed-count.
- R5. `IT Novice` main quests are skipped/delegated to Perguruan Ulong, but `IT Novice` daily quests are authored.
- R6. Every non-IT-Novice job eventually receives enough main quests to cover all listed skills from Lv1 to Lv3.
- R7. Daily quests are optional, job-specific, and one per job per day.
- R8. Quest completion requires a text summary and completed quest records must be available to archive/history.
- R9. Quest source links must point to usable learning, reference, practice, or task destinations.
- R10. Data creation is staged: schema/index first, then job batches, then review.

---

## Scope Boundaries

- No UI/UX design changes are included.
- No full quest modal redesign is included.
- No requirement to finish every quest data file in one PR or session.
- No fixed main quest count per job.
- No `IT Novice` main quest content beyond explicit delegation to Perguruan Ulong.
- Equipment, talent, achievement, mission, and vending systems stay separate.

### Deferred to Follow-Up Work

- Visual presentation of main/daily/archive quest sections.
- Polished quest randomization or rotation UX.
- Full migration/removal of legacy inline quest UI if Claude redesigns the card/action modal.

---

## Context & Research

### Relevant Code and Patterns

- `index.html` has `jobQuests` and `questData_en` inline objects for Frontend Developer and Manual QA.
- `index.html` currently stores quest completion as `quest::<id>` booleans in the same `progress` localStorage object as skill progress.
- `index.html` currently renders quest phases from `jobQuests[currentQuestJob]`, so no async per-job fetch exists yet.
- `data/equipment.json` and `data/talents.json` establish the repo's current external JSON data pattern: top-level version/date/schema metadata plus an array payload.
- `docs/brainstorms/card-actions-rework-requirements.md` already expects separate card actions including Quest, Equip, Talent, Achievement, and Mission.

### Institutional Learnings

- No `docs/solutions/` guidance was found in this repo during planning.

### External References

- Quest links will require per-job internet research during content batches. The plan intentionally does not preselect all links.

---

## Key Technical Decisions

- Per-job quest files with an index: keeps initial app load small and lets the Quest button load only the clicked job's content.
- Keep quest data independent from UI: data can be used by the current modal, a future Claude-designed UI, or generated export/showcase flows.
- New quest completion state should not reuse the old `quest::<id> = true` shape for summaries/daily cooldowns. The old shape can be migrated or left as legacy compatibility.
- Main quest authoring should target skill coverage by level bands rather than an arbitrary count.

---

## Open Questions

### Resolved During Planning

- Should quest JSON be one large file or per job? Per job, with an index.
- Should `IT Novice` main quests be authored here? No, main quest is delegated to Perguruan Ulong; only daily quests are authored.
- Should main quests have a fixed count per job? No, count follows the job's skills.

### Deferred to Implementation

- Exact daily selection rule: implementation can start deterministic, then later introduce shuffle/rotation if needed.
- Exact source link set for each quest: resolved during content authoring batches.
- Whether legacy inline Frontend/Manual QA quest data is migrated verbatim or replaced with new main/daily quest content.

---

## Output Structure

    data/
      quests/
        index.json
        it-novice.json
        frontend-developer.json
        backend-developer.json
        ...
        ciso.json
    docs/
      plans/
        2026-05-12-011-feat-quest-system-data-plan.md

---

## High-Level Technical Design

> This illustrates the intended approach and is directional guidance for review, not implementation specification.

Per-job quest files should be readable without the app needing to load every quest:

```text
Quest button clicked for job
  -> index maps "Frontend Developer" to "frontend-developer.json"
  -> app loads that one file
  -> app reads main chain + daily pool
  -> state decides current main quest, daily availability, archive/history
```

Completion state should preserve summaries:

```text
quest history record
  quest id
  job
  type: main | daily
  completedAt
  summary
```

Daily state should be date-aware:

```text
daily completion
  job
  date key
  quest id
  summary
```

---

## Implementation Units

- U1. **Quest Data Schema and Index**

**Goal:** Create the canonical external data shape for per-job quest files and the index that maps job names to files.

**Requirements:** R1, R2, R3, R5, R10

**Dependencies:** None

**Files:**
- Create: `data/quests/index.json`
- Create: `data/quests/it-novice.json`
- Create: `data/quests/frontend-developer.json`
- Create: `data/quests/manual-qa.json`
- Create: `scripts/validate-quests.mjs`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Define schema metadata consistent with `data/equipment.json` and `data/talents.json`.
- Include `job`, `slug`, `main`, `daily`, and a field representing `IT Novice` main quest delegation.
- Include stable quest IDs, title, description, source links, skill targets, summary requirement, and type.
- Build a validator that checks JSON parse, index/file consistency, duplicate quest IDs, valid job names, valid skill targets, and valid URL shape.

**Patterns to follow:**
- `data/equipment.json`
- `data/talents.json`
- job titles and skill names from `index.html`

**Test scenarios:**
- Happy path: `index.json` maps Frontend Developer to an existing file and the validator passes.
- Edge case: `it-novice.json` has no main quests but marks main quest delegation to Perguruan Ulong and has daily quests.
- Error path: duplicate quest IDs fail validation.
- Error path: quest skill target not present in that job's skills fails validation.
- Error path: index entry pointing to a missing file fails validation.

**Verification:**
- Validator passes for the seed files.
- Every index entry references an existing per-job file.

---

- U2. **Quest State Contract**

**Goal:** Define and implement the localStorage state shape for quest summaries, archive/history, main sequence progress, and daily cooldowns.

**Requirements:** R4, R7, R8

**Dependencies:** U1

**Files:**
- Modify: `index.html`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Introduce a new quest progress storage key instead of extending the old boolean-only `quest::<id>` shape.
- Store completed quest records with summary text and completion timestamp.
- Store daily quest completion by job and local date.
- Keep legacy `quest::<id>` data readable enough that existing users do not crash, but do not force old data to satisfy the new summary requirement.

**Patterns to follow:**
- Existing `loadProgress()` / `saveProgress()` localStorage helpers in `index.html`
- Existing `questKey(itemId)` compatibility behavior in `index.html`

**Test scenarios:**
- Happy path: completing a main quest stores id, job, type, completedAt, and summary.
- Happy path: completed quest appears in archive/history state.
- Edge case: summary is empty or whitespace-only and completion is rejected.
- Edge case: old `quest::<id>` boolean data exists and app still loads without throwing.
- Integration: daily completion for one job does not block daily quest completion for another job.

**Verification:**
- Quest state can represent all flows from the origin requirements without losing summary text.

---

- U3. **Per-Job Quest Loader**

**Goal:** Add the data-loading pathway that resolves a job through the index and loads only that job's quest file.

**Requirements:** R1, R2, R16, R17, R18, R19

**Dependencies:** U1, U2

**Files:**
- Modify: `index.html`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Add an async loader for quest index and per-job files.
- Cache loaded quest files in memory after first load.
- Surface a graceful empty/error state when a job has no quest file yet.
- Keep current quest modal usable as a minimal temporary renderer; avoid UI redesign.

**Patterns to follow:**
- Current `openQuest()`, `renderQuestContent()`, and `getQuestProgress()` flow in `index.html`

**Test scenarios:**
- Happy path: clicking Quest on Frontend Developer loads only `data/quests/frontend-developer.json`.
- Edge case: clicking Quest on a job whose file is not authored yet shows a non-crashing placeholder.
- Error path: invalid JSON or failed fetch shows a recoverable error message.
- Integration: language switch and existing card rendering still work after quest loader becomes async.

**Verification:**
- `index.html` no longer needs all quest content inline to open a job's quest panel.

---

- U4. **Main Quest Sequencing**

**Goal:** Make main quests behave as a chain where only the next unfinished quest is available.

**Requirements:** R2, R3, R4, R6, R7, R8, R9

**Dependencies:** U1, U2, U3

**Files:**
- Modify: `index.html`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Compute current main quest from ordered `main` array and completed quest records.
- Render completed main quests as archive/history records.
- Do not expose future locked main quest details beyond what the chosen UI can safely show.
- Preserve skill target metadata for future progress guidance; do not auto-level skills from quest completion unless explicitly added later.

**Test scenarios:**
- Happy path: first unfinished main quest is available.
- Happy path: completing quest 1 unlocks quest 2.
- Edge case: all main quests complete shows no active main quest and keeps history accessible.
- Edge case: `IT Novice` has delegated main quests and does not show an empty broken main chain.

**Verification:**
- Main quest behavior matches AE1, AE2, and AE3 from `docs/brainstorms/quest-system-requirements.md`.

---

- U5. **Daily Quest Availability**

**Goal:** Implement one daily quest per job per day using the per-job daily quest pool and date-aware completion state.

**Requirements:** R11, R12, R13, R14, R15

**Dependencies:** U1, U2, U3

**Files:**
- Modify: `index.html`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Select one daily quest from a job's daily pool for the current date.
- After completion, block additional daily completion for that job until the next local date.
- Allow different jobs to each have their own daily quest availability.
- Keep selection deterministic initially so repeated page reloads on the same date show the same daily quest.

**Test scenarios:**
- Happy path: a job with daily quests shows one available daily quest for today.
- Happy path: after completing today's daily with summary, the same job is locked until tomorrow.
- Edge case: a job with no daily quests shows a non-crashing empty state.
- Integration: completing a Backend daily quest does not block a Frontend daily quest on the same day.

**Verification:**
- Daily quest behavior matches AE4 from `docs/brainstorms/quest-system-requirements.md`.

---

- U6. **Migrate or Replace Legacy Inline Quest Data**

**Goal:** Remove reliance on inline `jobQuests` and `questData_en` for Frontend Developer and Manual QA.

**Requirements:** R1, R16, R20, R21, R22, R23

**Dependencies:** U1, U3, U4, U5

**Files:**
- Modify: `index.html`
- Modify: `data/quests/frontend-developer.json`
- Modify: `data/quests/manual-qa.json`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Decide during implementation whether old Frontend/Manual QA items are migrated as seed quest content or replaced by the new main/daily structure.
- Remove inline quest data only after external data path is working.
- Preserve old user completion compatibility where reasonable.

**Test scenarios:**
- Happy path: Frontend Developer quest opens from external JSON after inline quest data is removed.
- Happy path: Manual QA quest opens from external JSON after inline quest data is removed.
- Edge case: old quest progress booleans do not crash the new quest renderer.

**Verification:**
- `index.html` no longer contains large role-specific quest data objects.

---

- U7. **Job 1 Quest Content Batch**

**Goal:** Author main/daily quest content for Job 1 roles, excluding `IT Novice` main quests but including `IT Novice` daily quests.

**Requirements:** R5, R6, R7, R8, R9, R11, R14, R15, R21, R22, R23, R25

**Dependencies:** U1

**Files:**
- Create/Modify: `data/quests/it-novice.json`
- Create/Modify: `data/quests/frontend-developer.json`
- Create/Modify: `data/quests/backend-developer.json`
- Create/Modify: `data/quests/mobile-developer.json`
- Create/Modify: `data/quests/manual-qa.json`
- Create/Modify: `data/quests/data-analyst.json`
- Create/Modify: `data/quests/system-administrator.json`
- Create/Modify: `data/quests/network-engineer.json`
- Create/Modify: `data/quests/soc-analyst.json`
- Create/Modify: `data/quests/business-analyst.json`
- Create/Modify: `data/quests/ui-designer.json`
- Create/Modify: `data/quests/helpdesk.json`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- For each job, inspect its skills from `index.html`.
- Create a main quest chain that covers each non-IT-Novice job's skills from basic to advanced.
- Add a daily pool large enough to be useful initially without forcing the long-term 30-50 target in the first pass.
- Use strong, stable links: official docs, reputable tutorials, standards, vendor docs, MDN, Microsoft Learn, Atlassian, cloud docs, security docs, or mature learning references.

**Test scenarios:**
- Happy path: every Job 1 file validates against the schema.
- Happy path: each non-IT-Novice Job 1 file has main quest coverage for every listed skill.
- Edge case: `IT Novice` validates with delegated main quest and daily quests.
- Error path: broken or missing source URL fails validation if the validator can detect malformed URLs.

**Verification:**
- Job 1 quest batch is complete enough for later UI integration and review.

---

- U8. **Job 2 Quest Content Batch**

**Goal:** Author main/daily quest content for Job 2 roles.

**Requirements:** R6, R7, R8, R9, R11, R14, R21, R22, R23, R26

**Dependencies:** U1, U7

**Files:**
- Create/Modify: `data/quests/fullstack-developer.json`
- Create/Modify: `data/quests/qa-automation.json`
- Create/Modify: `data/quests/performance-tester.json`
- Create/Modify: `data/quests/bi-developer.json`
- Create/Modify: `data/quests/data-engineer.json`
- Create/Modify: `data/quests/data-scientist.json`
- Create/Modify: `data/quests/cloud-engineer.json`
- Create/Modify: `data/quests/devops-engineer.json`
- Create/Modify: `data/quests/database-admin.json`
- Create/Modify: `data/quests/security-engineer.json`
- Create/Modify: `data/quests/pentester.json`
- Create/Modify: `data/quests/grc-specialist.json`
- Create/Modify: `data/quests/product-owner.json`
- Create/Modify: `data/quests/project-manager.json`
- Create/Modify: `data/quests/ux-designer.json`
- Create/Modify: `data/quests/technical-support.json`
- Create/Modify: `data/quests/application-support.json`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Use the same authoring rules from U7.
- Keep Job 2 quests more advanced than prerequisite Job 1 quests.
- Avoid duplicating lower-tier fundamentals unless a quest explicitly applies them in a more complex context.

**Test scenarios:**
- Happy path: every Job 2 file validates.
- Happy path: main quest chains cover all Job 2 skills without fixed quest counts.
- Edge case: support/security/data jobs with overlapping skills still get job-specific quest framing and links.

**Verification:**
- Job 2 quest batch is ready for review and later UI integration.

---

- U9. **Job 3 and Final Quest Content Batch**

**Goal:** Author main/daily quest content for Job 3 and Final roles.

**Requirements:** R6, R7, R8, R9, R11, R14, R21, R22, R23, R26

**Dependencies:** U1, U7, U8

**Files:**
- Create/Modify: `data/quests/tech-lead.json`
- Create/Modify: `data/quests/ai-engineer.json`
- Create/Modify: `data/quests/sre.json`
- Create/Modify: `data/quests/appsec-engineer.json`
- Create/Modify: `data/quests/product-manager.json`
- Create/Modify: `data/quests/product-designer.json`
- Create/Modify: `data/quests/engineering-manager.json`
- Create/Modify: `data/quests/cto.json`
- Create/Modify: `data/quests/ciso.json`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Treat Job 3 and Final jobs as advanced judgment, leadership, architecture, governance, or systems-thinking quests.
- Prefer high-quality official or authoritative references over generic tutorials.
- Include daily quests that reinforce ongoing practice: review, writing, incident analysis, risk assessment, design critique, observability reading, or strategic communication.

**Test scenarios:**
- Happy path: every Job 3/Final file validates.
- Happy path: main quest chains map to advanced job skills instead of repeating entry-level tasks.
- Edge case: leadership jobs use credible management/strategy/security governance sources instead of only coding tutorials.

**Verification:**
- Final planned quest content batch completes all job coverage.

---

- U10. **Quest Content Review Pass**

**Goal:** Review all quest data for quality, consistency, source link usefulness, skill coverage, and noisy duplicates.

**Requirements:** R6, R7, R8, R9, R14, R21, R22, R23, R26

**Dependencies:** U7, U8, U9

**Files:**
- Modify: `data/quests/*.json`
- Modify: `scripts/validate-quests.mjs`
- Test: `scripts/validate-quests.mjs`

**Approach:**
- Add or extend validator checks for coverage summaries if practical.
- Check that every non-IT-Novice job skill appears in at least one main quest target.
- Check daily quest counts and flag jobs below the chosen minimum for that content batch.
- Manually review source links for quality and relevance.

**Test scenarios:**
- Happy path: all quest files pass validation.
- Error path: missing skill coverage is reported.
- Error path: duplicate quest title or duplicate source link within the same job is flagged or reviewed.
- Integration: index covers every job file expected by the current batch.

**Verification:**
- Quest catalog is coherent enough for UI work and future expansion.

---

## System-Wide Impact

- **Interaction graph:** Quest button/card flow moves from inline `jobQuests` lookup to index plus per-job data loading. Completion flow moves from boolean toggles to summary-bearing records.
- **Error propagation:** JSON load failures should show recoverable UI states rather than crashing card rendering.
- **State lifecycle risks:** Old boolean quest progress cannot satisfy new summary requirements; compatibility must avoid data loss while making new completions summary-based.
- **API surface parity:** Current app modal, future Claude UI, AUTO prompt generation, export/showcase, and sync/import/export features may eventually need to read the new quest state shape.
- **Integration coverage:** Unit validation of JSON is not enough; manual smoke tests should open quests, complete summaries, check daily lockout, and reopen history.
- **Unchanged invariants:** Skill progress keys and skill level behavior remain unchanged. Equipment and talent JSON files are not modified by this plan.

---

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Quest catalog becomes noisy because every job needs many links | Stage content batches and prioritize link quality over fixed counts |
| Huge data PR is hard to review | Split authoring into Job 1, Job 2, Job 3/Final, and review pass units |
| Legacy quest completion data becomes incompatible | Keep old boolean data readable and avoid destructive migration |
| UI work starts before data contract is stable | Land schema/index and validator first |
| Links rot or point to weak content | Prefer official docs, mature references, and validator/manual review pass |

---

## Documentation / Operational Notes

- The requirements source is `docs/brainstorms/quest-system-requirements.md`.
- Content authoring should cite source links inside quest data; no separate bibliography is required for every quest if the data itself contains URLs.
- If a later agent implements UI, it should treat this plan as data/logic scope and avoid inventing visual design.
- Supersession note: future quest data authoring should follow the target-owned model in `docs/brainstorms/target-quest-system-requirements.md` and `docs/plans/2026-05-13-013-feat-target-quest-data-plan.md`. The per-job files under `data/quests/` are legacy/transitional until explicitly migrated or removed.

---

## Sources & References

- **Origin document:** `docs/brainstorms/quest-system-requirements.md`
- Related code: `index.html`
- Related data pattern: `data/equipment.json`
- Related data pattern: `data/talents.json`
- Related brainstorm: `docs/brainstorms/card-actions-rework-requirements.md`
