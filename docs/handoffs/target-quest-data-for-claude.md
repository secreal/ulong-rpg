---
date: 2026-07-22
topic: target-quest-data-for-claude
---

# Target Quest Data for Claude

## Purpose

Codex owns the target quest data. Claude-side UI should render this data instead of embedding quest copy directly in UI code.

## Current Data Shape

- Target quest index: `data/target-quests/index.json`
- Skill quest file: `data/target-quests/skills.json`
- Equipment quest file: `data/target-quests/equipment.json`
- Talent quest file: `data/target-quests/talents.json`
- Validator: `scripts/validate-target-quests.mjs`

Each target record has:

- `kind`: `skill`, `equipment`, or `talent`
- `targetId`: stable target identifier
- `targetName`: display name
- `source.progressKey`: current progress key shape
- `intro`: one daily activation quest
- `levels.1`, `levels.2`, `levels.3`: exactly three required main quests per level
- `fundamental`: whether the target can be introduced without prior target knowledge
- `learningStage`: `fundamental` or `dependent`
- `prerequisiteTargets`: zero to three qualified graph references

## Current Coverage

- 197 skill targets
- 189 equipment targets
- 165 talent targets
- 551 targets and 5,510 quests total

Each target has one `intro` quest and three required quests at each of levels 1, 2, and 3.

## Dependency Contract

- References use `<kind>:<targetId>`, for example `talent:javascript` or `equipment:git`.
- The allowed kinds are `skill`, `equipment`, and `talent`.
- Raw IDs are not globally unique, so consumers must resolve both kind and ID.
- Every fundamental target has an empty `prerequisiteTargets` array.
- Every dependent target has one to three direct prerequisites.
- Direct prerequisites use AND semantics: every reference must reach at least level 1 before the dependent target's `intro` quest becomes eligible.
- Completion of a graph-exposed skill outside the current job writes the shared `source.progressKey`, `skill::<exact skill name>`. Readers take the maximum level across that shared key and every matching job-scoped `skill::<job>::<exact skill name>` key; normal in-job completion can remain job-scoped.
- Equipment and talent prerequisites use the exact global key in `source.progressKey`, such as `equip::git` or `talent::javascript`.
- Job tags and job skill lists govern normal discovery. A target referenced as a prerequisite remains eligible for activation even outside the current job's normal discovery set; otherwise semantically correct cross-job edges can become impossible to satisfy.
- Level-2 and level-3 progression still comes only from the target's own `levels` quest groups.
- `prerequisiteTargets` are graph references with one colon. They are not progress keys, which use two colons.

## Product Rules to Preserve

- Quest ownership is target-based, not job-based.
- Jobs only determine which targets are relevant through skill lists and equipment/talent tags.
- Daily quest means target activation: use the target's `intro` quest to move an inactive target toward Lv1.
- Main quest means level progression: use all three quests in the current target level group.
- A dependent target cannot enter daily activation until all direct prerequisites satisfy the dependency contract above.
- All quest completion flows require a written summary.
- Per-job quest files in `data/quests/` are legacy/transitional and should not be expanded for new content unless the user explicitly reverses the product decision.

## UI Boundary

This handoff does not prescribe modal layout, card design, animation, or visual state. Claude can design the UI, but the UI should treat the target quest data as source content and should not duplicate the same quest text inside `index.html`.
