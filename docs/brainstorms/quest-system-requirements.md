---
date: 2026-05-12
topic: quest-system
---

# Quest System

## Summary

Quest content will move out of `index.html` into per-job data files. Each job will eventually have chained main quests and optional daily quests, with completion summaries and archive/history behavior, while `IT Novice` main quests stay delegated to Perguruan Ulong.

---

## Problem Frame

The current quest content is small, inline, and only covers a couple of jobs. That does not scale to a full RPG progression system where every job needs role-specific learning paths, links, repeatable practice, and completion records. The next phase needs durable quest requirements so data creation can proceed in batches without forcing downstream agents to invent quest behavior or file organization.

---

## Actors

- A1. Player: uses ulong RPG to learn job skills, open quests, complete tasks, and write summaries.
- A2. Quest content author: creates main and daily quest data for each job.
- A3. UI implementer: later wires the quest button/modal UI to the external quest data without redesign decisions in this brainstorm.

---

## Key Flows

- F1. Main quest progression
  - **Trigger:** Player opens Quest for a job.
  - **Actors:** A1
  - **Steps:** Player sees the currently available main quest, opens the linked resource, completes the task, writes a summary, and marks the quest done.
  - **Outcome:** Completed quest moves to archive/history and the next main quest in that job chain becomes available.
  - **Covered by:** R1, R2, R3, R4, R6

- F2. Daily quest completion
  - **Trigger:** Player opens Quest for a job on a new day.
  - **Actors:** A1
  - **Steps:** Player receives one available daily quest for that job, opens the linked resource, completes the optional task, writes a summary, and marks it done.
  - **Outcome:** That daily quest is recorded and the player must wait until the next day for another daily quest.
  - **Covered by:** R7, R8, R9, R10

- F3. Quest data authoring
  - **Trigger:** A content batch is assigned through later work.
  - **Actors:** A2
  - **Steps:** Author selects the assigned jobs, creates per-job quest files, maps main quests to the job's skills and levels, adds daily quests, and uses internet links as sources.
  - **Outcome:** The assigned job files are ready for UI integration and validation.
  - **Covered by:** R11, R12, R13, R14, R15

---

## Requirements

**Quest types and completion**
- R1. Quest content is split into two types: main quests and daily quests.
- R2. A main quest is sequential: only the next unfinished quest in a job's main chain should be available until it is completed.
- R3. Completing any quest requires the player to fill a text summary of what they learned or did.
- R4. Completed quests must remain accessible through archive/history.
- R5. Quest archive/history is about completed quest records, not about showing future locked quest content.

**Main quests**
- R6. Main quests are job-focused self-development quests that progressively help the player raise the job's listed skills from Lv1 to Lv3.
- R7. Main quest count is skill-driven, not fixed; each job gets as many main quests as needed to cover its skills naturally.
- R8. One main quest may target one skill or multiple closely related skills when that creates a more realistic learning task.
- R9. Main quests should progress from fundamentals to applied work, proof/project work, and advanced judgment.
- R10. `IT Novice` main quests are intentionally skipped because they come from Perguruan Ulong.

**Daily quests**
- R11. Daily quests are optional job-specific tasks that add extra practice or value but are not required for main progression.
- R12. Only one daily quest per job should be completable per day.
- R13. After a daily quest is completed, the player must wait until the next day for another daily quest for that job.
- R14. Daily quest pools can be large and expandable; 30-50+ daily quests per job is an acceptable long-term direction.
- R15. `IT Novice` still needs daily quests even though its main quests are skipped.

**Quest data organization**
- R16. Quest data should be external to `index.html`.
- R17. Quest data should be split per job so clicking Quest for a job can load only that job's file.
- R18. A quest index should map job titles to their quest files.
- R19. All job quest files should follow a consistent structure so later UI work can load them predictably.
- R20. The final scope includes all jobs, but data creation should happen in staged batches.

**Quest source links**
- R21. Main and daily quests should include internet links as source material or task destinations.
- R22. Quest links should lead to material the player can open, study, use, or act on before writing their completion summary.
- R23. Link quality matters more than filling a fixed number of quests; noisy or weak links should be avoided even if that means fewer quests in an early batch.

**Batching**
- R24. Later implementation/data work should start with schema/index and a small representative batch before filling every job.
- R25. After schema/index, a practical first content batch is Job 1 except `IT Novice`, plus `IT Novice` daily quests.
- R26. Later batches should cover Job 2, then Job 3 and Final jobs, then a review pass.

---

## Acceptance Examples

- AE1. **Covers R2, R3, R4.** Given a player has not completed any main quest for Frontend Developer, when they open the Frontend quest panel, only the first main quest is available; after they submit a summary and complete it, that quest appears in history and the second main quest becomes available.
- AE2. **Covers R7, R8, R9.** Given a job has five listed skills, when quests are authored for that job, the number of main quests may be more or less than nine as long as the sequence reasonably covers all five skills from basic to advanced levels.
- AE3. **Covers R10, R15.** Given the job is `IT Novice`, when quest data is authored, the main quest list is empty or marked as delegated to Perguruan Ulong, but the daily quest pool still exists.
- AE4. **Covers R12, R13.** Given a player completes a daily quest for Backend Developer today, when they reopen Backend daily quests on the same date, another daily quest is not completable until the next day.
- AE5. **Covers R16, R17, R18.** Given the player clicks Quest on Product Owner, the app can resolve Product Owner through the quest index and load only the Product Owner quest file rather than loading all quest content.

---

## Success Criteria

- Quest requirements let content work proceed job-by-job without touching UI design.
- Downstream planning does not need to invent main vs daily quest behavior, summary requirements, archive behavior, or per-job data organization.
- Quest data remains scalable enough for hundreds or thousands of daily quests without making `index.html` heavy.
- Every non-IT-Novice job can eventually receive a complete main quest chain tied to its skills.

---

## Scope Boundaries

- No UI/UX design work is included in this brainstorm.
- No immediate implementation of quest rendering, modals, archive screens, or daily cooldown logic is required here.
- No fixed number of main quests per job is required.
- No requirement to complete all jobs in a single work session.
- `IT Novice` main quest authoring is out of scope because it uses Perguruan Ulong.
- Equipment, talent, achievement, mission, and vending content are separate systems.

---

## Key Decisions

- Per-job quest files: chosen because quest content can become large and the app should only load the clicked job's quest data.
- Skill-driven main quest count: chosen because jobs have different skill counts and complexity.
- `IT Novice` main quest skip: chosen because its main learning path is Perguruan Ulong, while daily quests still belong in ulong RPG.
- Batch execution: chosen because all-job quest content is large and should be built in reviewable increments.

---

## Dependencies / Assumptions

- Job titles and skills in `index.html` are the source of truth for quest targeting until a later refactor moves them elsewhere.
- Quest source links require internet research during content creation.
- Existing inline quest data for Frontend Developer and Manual QA may be migrated, replaced, or treated as old seed content during later work.

---

## Outstanding Questions

### Resolve Before Planning

- None.

### Deferred to Planning

- [Affects R18, R19][Technical] Decide the exact JSON schema for quest index and per-job quest files.
- [Affects R3, R4][Technical] Decide where quest summaries and completion history are stored.
- [Affects R12, R13][Technical] Decide how daily quest date/cooldown state is represented.
- [Affects R21, R22][Needs research] Select source links for each quest during content creation batches.
