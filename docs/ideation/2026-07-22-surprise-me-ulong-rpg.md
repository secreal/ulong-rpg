---
date: 2026-07-22
topic: surprise-me-ulong-rpg
mode: ideation
status: selected
---

# Surprise-Me Ideation: ulong RPG

## Grounding

Repo ini adalah single-file vanilla JS app untuk gamifikasi career tracking IT. Surface utama ada di `index.html`, sementara data besar sudah mulai dipisah ke `data/equipment.json`, `data/talents.json`, dan `data/target-quests/*.json`.

Sinyal repo:
- `README.md` memposisikan app sebagai career tracker gamified dengan 37+ job class, quest, export showcase, dan integrasi prompt AI.
- `docs/brainstorms/target-quest-system-requirements.md` menetapkan quest ownership berbasis target, bukan job.
- `docs/handoffs/target-quest-data-for-claude.md` menegaskan Codex owns data/content, Claude owns UI.
- `data/target-quests` sudah besar: 553 target dan 5.530 quest.
- `data/quests` masih ada sebagai legacy/transitional job-based quest untuk beberapa job.
- Skill di `jobs` array ada 38 job row, 198 unique skill, tetapi hanya 3 skill yang shared lintas job setelah Title Case.
- Banyak quest link memakai sumber yang sama berulang: contoh `freeCodeCamp - Problem Solving` muncul 810 kali di skill quests, `Microsoft API Design` 430 kali di talent quests, dan `Microsoft Learn - Troubleshooting` 220 kali di equipment quests.

External context:
- Roadmap dan upskilling 2026 banyak menekankan project-based learning, AI fluency, cloud, cybersecurity, SQL/Python, agentic AI, dan skill taxonomy.
- Gamification research memperingatkan bahwa gamifikasi bisa meningkatkan engagement, tetapi gamifikasi yang tidak terencana bisa menurunkan motivasi.
- Skills taxonomy tooling cenderung menghubungkan vocabulary skill, role expectations, development, dan evidence of actual capability.

Sources:
- https://roadmap.sh/
- https://www.pluralsight.com/resources/blog/upskilling/top-tech-skills-2026-with-tests
- https://acorn.works/best/the-8-best-skills-taxonomy-software-in-2026
- https://arxiv.org/abs/2405.05209
- https://arxiv.org/abs/2506.00202

## Rejected Ideas

1. **Build a full LMS inside ulong RPG**
   - Rejected because it replaces the lightweight career tracker identity with a much heavier product.

2. **Add more job classes immediately**
   - Rejected because current data depth and validation matter more than breadth. More jobs would multiply taxonomy drift.

3. **Auto-grade summaries with AI**
   - Rejected for now because it creates trust, cost, and UX questions before the evidence model is mature.

4. **Make daily quests fully random again**
   - Rejected because recent product direction says daily quest is target activation, with fundamentals first.

5. **Move all app logic out of `index.html` as the next step**
   - Rejected as too broad for the current repo style. It may become necessary, but the stronger immediate ideas are smaller data/product contracts.

## Top Ideas

### 1. Quest Data Health Dashboard

**Status:** Implemented on `main`.

Create a repo-side data health report for `data/target-quests/*.json`: duplicated source labels, suspicious generic links, missing bilingual description fields, missing `fundamental`, invalid level counts, broken URLs, and target names that no longer match progress keys.

Warrant: `data/target-quests` has 553 targets and 5.530 quests; repeated link labels are extremely concentrated. That is a maintainability risk before it is a UI problem.

Why it matters: The game is becoming data-driven. If the data quality is not visible, future content work will silently drift.

### 2. Fundamental Dependency Graph

**Status:** Selected for the next autonomous implementation.

Upgrade `fundamental: true/false` from a simple daily sorting flag into a lightweight dependency graph: each non-fundamental target can list prerequisite target ids, while fundamentals stay dependency-free.

Warrant: The current schema already has `prerequisiteTargets`, but previous work left most arrays empty. User intent says fundamental targets should remove “belum ngerti dasarnya” blockers before introducing advanced items.

Why it matters: This turns daily quest ordering from random-ish sorting into a learning path engine without requiring new UI design first.

### 3. Target Evidence Portfolio

Treat every quest summary as evidence. Export showcase could later group completed summaries by skill/equip/talent, showing “what I learned” and “proof links” rather than only level pills.

Warrant: Quest requirements already require written summaries. README positions export as shareable career showcase.

Why it matters: This bridges RPG progress with HR/recruiter usefulness. Levels are game signals; summaries are human-readable evidence.

### 4. Legacy Quest Migration Plan

Create a formal migration map from `data/quests/*.json` job-based quests into target-owned quest entries, then freeze legacy quest expansion.

Warrant: `docs/handoffs/target-quest-data-for-claude.md` calls per-job quest files legacy/transitional, but the app still has both models.

Why it matters: Two quest systems create product ambiguity. A migration map lets Claude UI continue safely while Codex data work stays coherent.

### 5. Source Library Layer

Extract repeated quest links into a source catalog such as `data/learning-sources.json`, then target quests reference source ids instead of repeating label/url pairs thousands of times.

Warrant: Link labels repeat hundreds of times across quest files.

Why it matters: It makes source replacement, auditing, localization, and broken-link checks cheaper. It also avoids editing thousands of quest entries when one canonical source changes.

### 6. Career “Build Project” Quest Packs

Add optional project packs that combine multiple target quests into one visible artifact: e.g. “Frontend Portfolio Card”, “Helpdesk Ticket Runbook”, “Backend Auth API”, “SOC Alert Report”.

Warrant: External roadmap guidance increasingly emphasizes project-based learning, and the app already tracks target-level learning.

Why it matters: Individual target quests teach pieces; project packs help players produce portfolio-ready outcomes.

### 7. Role Readiness Profiles

For each job, define what “ready” means as a weighted mix of skills, equipment, talents, and completed evidence. Keep levels as self-assessment, but show readiness as a derived signal.

Warrant: Skills taxonomy tools connect skill vocabulary to role expectations and evidence. This repo already has jobs, target catalogs, and quest completions.

Why it matters: It prevents “I clicked Lv3 everywhere” from being the only meaning of progress.

### 8. Content Ownership Lint Rules

Create a data ownership rule set: skills stay in `index.html`, equipment/talent in separate catalogs, target quests in target files, UI copy in Claude-owned surfaces. Then add a small checklist or validator output for PR review.

Warrant: The project already has explicit ownership boundaries between Codex data and Claude UI, and the user has corrected accidental script/UI crossing before.

Why it matters: It reduces collaboration friction between agents and prevents future work from landing in the wrong layer.

## Best Next Brainstorm Candidate

The strongest next `ce-brainstorm` topic is **Fundamental Dependency Graph**.

**Status:** Selected for implementation on 2026-07-22 through the autonomous LFG pipeline. The implementation scope is data contracts, dependency authoring, validation, and handoff documentation; UI remains Claude-owned.

Reason: The health dashboard is now implemented. The next compounding move is to turn the existing but empty `prerequisiteTargets` arrays into a trustworthy learning-path contract before Claude consumes them for daily-quest eligibility.

Suggested prompt:

```text
$ce-brainstorm Fundamental Dependency Graph untuk ulong RPG. Fokus pada kontrak referensi lintas skill/equipment/talent, aturan eligibility, authoring seluruh dependency, dan validasi graph; UI tetap di luar scope.
```
