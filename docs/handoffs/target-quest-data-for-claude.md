---
date: 2026-05-13
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

## Seed Targets

- Skill: `version-control` / `version control`
- Equipment: `visual-studio-code` / `Visual Studio Code`
- Talent: `react` / `React`

The seed catalog contains 30 quests total: 10 quests per target.

## Product Rules to Preserve

- Quest ownership is target-based, not job-based.
- Jobs only determine which targets are relevant through skill lists and equipment/talent tags.
- Daily quest means target activation: use the target's `intro` quest to move an inactive target toward Lv1.
- Main quest means level progression: use all three quests in the current target level group.
- All quest completion flows require a written summary.
- Per-job quest files in `data/quests/` are legacy/transitional and should not be expanded for new content unless the user explicitly reverses the product decision.

## UI Boundary

This handoff does not prescribe modal layout, card design, animation, or visual state. Claude can design the UI, but the UI should treat the target quest data as source content and should not duplicate the same quest text inside `index.html`.
