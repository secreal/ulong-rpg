---
date: 2026-07-22
topic: fundamental-dependency-graph
status: ready-for-planning
---

# Fundamental Dependency Graph Requirements

## Problem

Every target quest already declares `fundamental`, `learningStage`, and `prerequisiteTargets`, but all 551 prerequisite arrays are empty. The boolean can prioritize fundamentals, but it cannot explain which prior knowledge makes a dependent skill, equipment item, or talent ready for introduction.

## Product Decision

Use the existing `prerequisiteTargets` field as one cross-catalog directed acyclic graph. This remains a data contract for Claude's future daily-quest UI; this implementation does not change UI behavior.

## Requirements

- R1. A prerequisite reference uses the qualified form `<kind>:<targetId>`, where kind is `skill`, `equipment`, or `talent`.
- R2. Qualified references may cross catalogs. This is required because target IDs are not globally unique.
- R3. Every fundamental target has an empty `prerequisiteTargets` array.
- R4. Every non-fundamental target has at least one and at most three direct prerequisites.
- R5. Every prerequisite resolves to an existing target, is unique within its target, and is not a self-reference.
- R6. The complete graph is acyclic.
- R7. Every non-fundamental target has a transitive path to at least one fundamental target.
- R8. A prerequisite represents introduction readiness: the future consumer may introduce the target after every direct prerequisite has reached at least level 1. A skill prerequisite is shared conceptually, so its effective level is the highest matching level across all job-scoped skill keys plus the legacy shared key. Equipment and talent prerequisites use their global `source.progressKey`. Referenced prerequisites remain eligible for activation even when they are outside the current job's normal tag-based discovery. Level-2 and level-3 progression remain governed by the target's own main quests.
- R9. Dependencies should express the smallest credible conceptual or operational foundation, not every related technology. Prefer one prerequisite; use two or three only when the target genuinely combines foundations.
- R10. Validation reports malformed, unresolved, duplicate, self-referential, missing, cyclic, and unrooted dependencies as errors.
- R11. Health reporting includes dependency edge count, maximum dependency depth, and dependent targets without authored prerequisites.
- R12. Handoff documentation explains the reference format and readiness semantics without prescribing UI layout.

## Scope Boundaries

- Included: all skill, equipment, and talent entries in `data/target-quests/`.
- Included: validator, health metrics, tests, generated health report, and Claude handoff documentation.
- Excluded: daily-quest selection UI, progress-state changes, job-card changes, and visual design.
- Excluded: changing target quest `intro` or `levels` structure.
- Excluded: changing existing `fundamental` classifications unless a dependency cannot be modeled coherently without correcting an obvious contradiction.

## Approach Decision

Qualified inline references are preferred over unqualified IDs or a separate graph file. Unqualified IDs are ambiguous across catalogs, while a separate graph would duplicate ownership already established by `prerequisiteTargets`.

## Success Criteria

- All available targets pass graph validation.
- No fundamental target has prerequisites.
- No dependent target has an empty prerequisite list.
- The graph has no cycles and every dependent target reaches a fundamental root.
- Every edge passes a documented smallest-credible-foundation review.
- Existing 551-target and 5,510-quest schema remains valid.
- No UI code changes are required for this implementation.
