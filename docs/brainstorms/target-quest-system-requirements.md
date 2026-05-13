---
date: 2026-05-13
topic: target-quest-system
---

# Target Quest System

## Summary

Quest content will be organized around progression targets instead of jobs. Each skill, equipment, and talent can own intro and level quests, while jobs only determine which targets are relevant to a player at a given moment.

This requirements document is written for Codex-owned data/content work. Claude-side brainstorming and implementation should add the matching UI/UX behavior without changing the data ownership decision unless the product direction changes.

---

## Problem Frame

The earlier quest model tied quest content to jobs. That becomes noisy when the same skill, equipment, or talent appears across multiple jobs, because the content author would either duplicate the same learning quest or maintain many similar job-specific variants.

The project now has separate concepts for skill, equipment, and talent. Those concepts are shared across jobs and already carry their own meaning: a player can know a skill, use a tool, or specialize in a framework regardless of which job card exposed it. Quest content needs to follow that shared progression model so the catalog can scale without becoming a per-job content explosion.

---

## Actors

- A1. Player: selects jobs, levels skills/equipment/talents, completes quests, and writes summaries.
- A2. Quest data author: creates reusable quest content for each skill, equipment, and talent target.
- A3. Codex: owns the data/content side for this quest model.
- A4. UI implementer: later decides how quest targets, daily intros, level quest chains, summaries, and progress are presented.

---

## Key Flows

- F1. Daily intro activation
  - **Trigger:** Player has a relevant skill, equipment, or talent target that is not active yet.
  - **Actors:** A1
  - **Steps:** Player receives a daily intro quest for one inactive target, opens or studies the linked material, completes the intro task, and submits a summary.
  - **Outcome:** The target becomes active at Lv1, making it eligible for main quest progression.
  - **Covered by:** R1, R2, R3, R8, R9

- F2. Main quest level progression
  - **Trigger:** Player has an active target at Lv1, Lv2, or Lv3 with unfinished quests for that level.
  - **Actors:** A1
  - **Steps:** Player works through all required quests for the current target level, using the provided links and submitting summaries for each quest.
  - **Outcome:** The current level's quest set is complete and the target is ready for the next progression decision.
  - **Covered by:** R4, R5, R6, R7, R10

- F3. Reusable quest authoring
  - **Trigger:** A content batch assigns quest creation for skills, equipment, or talents.
  - **Actors:** A2, A3
  - **Steps:** Author chooses a target, writes one intro quest, writes three main quests for each level band, and keeps the content generic enough to be reused by every job that includes the target.
  - **Outcome:** A reusable target quest set is available for any job pool that references that target.
  - **Covered by:** R1, R4, R5, R11, R12, R13

---

## Requirements

**Target ownership**
- R1. Quest content is owned by progression targets, not directly by jobs.
- R2. A progression target can be a skill, equipment item, or talent.
- R3. Jobs determine the available pool of targets by their listed skills and by equipment/talent tags, but jobs do not own duplicate copies of the target quests.

**Daily intro quests**
- R4. Each target should have one intro quest intended for daily quest use.
- R5. A daily intro quest activates an inactive target by moving it from Lv0 or inactive state to Lv1 after completion.
- R6. Daily quests should not be a large random job-specific pool in this model; they are target-introduction tasks.
- R7. Daily intro quests should teach first contact with the target: what it is, when it is used, and a small practical action the player can perform.

**Main level quests**
- R8. Each target should have main quest content for Lv1, Lv2, and Lv3.
- R9. Each target level should contain exactly three required main quests.
- R10. All three quests for a level are required before that level's quest set is considered complete.
- R11. Main quests should deepen the target from basic familiarity toward confident use, applied practice, and proof of understanding.
- R12. Main quest content should be generic to the target and should not assume a single job context unless the target itself is job-specific.

**Completion evidence**
- R13. Completing any intro or main quest should require a written summary from the player.
- R14. Quest data should include links or source material that the player can open, study, use, or act on before writing the summary.
- R15. Summary and completion records should remain usable by later UI, archive, or portfolio features, but the visual presentation is not part of this brainstorm.

**Data authoring scope**
- R16. Codex-side work for this phase is to provide quest data that is ready for later UI/UX integration.
- R17. The first useful content milestone is a representative seed set that proves the target-owned model across at least one skill, one equipment item, and one talent.
- R18. Later content batches can expand the catalog across all skills, equipment, and talents after the seed model is validated.
- R19. Any Claude-side work should treat Codex's target-owned quest data as the source to render, not as UI copy embedded inside the design.

---

## Acceptance Examples

- AE1. **Covers R1, R2, R3.** Given the same talent is relevant to Frontend Developer and Fullstack Developer, when quest content is authored for that talent, the content exists once for the talent and can be reached from both job pools.
- AE2. **Covers R4, R5, R6, R7.** Given a player has never activated Visual Studio Code, when a daily quest selects that target, the player receives the intro quest for Visual Studio Code rather than a random unrelated job task.
- AE3. **Covers R8, R9, R10.** Given a target has Lv1 main quests, when only two of the three Lv1 quests are complete, the Lv1 quest set is not considered complete yet.
- AE4. **Covers R11, R12.** Given a target appears in several jobs, when its main quests are authored, the quests teach the target itself rather than referencing one specific job title.
- AE5. **Covers R13, R14, R15.** Given a player completes an intro or main quest, when they submit it, the completion includes a summary tied to the quest record.

---

## Success Criteria

- Quest data can scale across shared skills, equipment, and talents without duplicating content per job.
- Downstream UI work can render daily intro and main level quests without inventing ownership rules, quest counts, or completion expectations.
- Content authors can create target quest sets in batches with a clear definition of done.
- The model supports player progression from inactive target to Lv1, then through required Lv1/Lv2/Lv3 quest sets.

---

## Scope Boundaries

- No UI/UX design is included.
- No implementation of level-up logic is included.
- No mission or vending behavior is included.
- No per-job quest duplication is included.
- No large random daily quest pool per job is included.
- No automatic level increase without quest completion and summary evidence is included.
- The previous per-job quest model is treated as legacy or transitional content for future planning to reconcile.

---

## Key Decisions

- Target-owned quests: chosen because skill, equipment, and talent can be shared by many jobs.
- One intro quest per target: chosen because daily quest's job is activation, not long-term progression.
- Three main quests per target level: chosen because the player explicitly wants all three quests required at Lv1, Lv2, and Lv3.
- Generic target framing: chosen so a target quest remains reusable across every job that includes that target.
- Data-first scope: chosen because Codex is responsible for content/data while Claude handles UI/UX.
- Cross-agent handoff: chosen so Codex and Claude can work independently while sharing the same quest ownership model.

---

## Dependencies / Assumptions

- Skill names, equipment IDs/names, and talent IDs/names remain the source pool for target quest authoring.
- Equipment and talent relevance is determined by tags; skill relevance is determined by job skill lists.
- Future planning will decide how old per-job quest files are migrated, ignored, or converted into target-owned quest content.
- Future UI work will decide how required three-quest level sets are displayed and how completion affects visible levels.

---

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R1, R2][Technical] Decide the exact target identifier convention so skill, equipment, and talent quests cannot collide.
- [Affects R5, R8, R10][Technical] Decide how quest completion updates visible target levels while preserving the user's existing level data.
- [Affects R17, R18][Content] Decide which skill, equipment, and talent targets form the first seed batch.
