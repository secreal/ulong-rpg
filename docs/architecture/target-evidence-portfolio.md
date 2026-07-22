# Target Evidence Portfolio

Target Evidence Portfolio is a derived, read-only view of completed quest summaries. It turns player-written quest logs into stable evidence grouped by skill, equipment, and talent without adding a new localStorage key or changing the target quest schema.

## Source of Truth

- Completion state: `questProgress.completed`
- Authored context: `data/target-quests/skills.json`, `equipment.json`, and `talents.json`
- Projector: `scripts/lib/target-evidence-portfolio.mjs`

Every build reads current state again. Consumers must mutate quest progress through the existing UI or `window.ulongAgent`, then request a new portfolio.

## Browser Contract

```javascript
const evidence = await window.ulongEvidenceReady;
const portfolio = await evidence.build_portfolio();
```

`window.ulongEvidence` is frozen and read-only. Its only data operation is `build_portfolio`; create, update, and delete remain the responsibility of the underlying `questProgress` resource.

The app emits `ulong:evidence-ready` after the browser capability is available.

## Portfolio Shape

```text
portfolio
├── version
├── generatedAt
├── status                 complete | degraded
├── summary
│   ├── totalCompleted
│   ├── resolvedEvidence
│   ├── targetsWithEvidence
│   ├── legacyEvidence
│   └── unresolvedEvidence
├── targets[]
│   ├── targetKey          skill::api-design
│   ├── kind               skill | equipment | talent
│   ├── targetId
│   ├── targetName
│   ├── progressKey
│   ├── fundamental
│   ├── learningStage
│   └── evidence[]
├── legacy[]
└── unresolved[]
```

Each resolved evidence entry contains the runtime completion id, authored quest id, title, description, links, intro/level stage, level, sequence, job, quest type, written summary, and completion time.

## Resolution Rules

Runtime target quest ids are resolved by their existing conventions:

| Runtime id | Canonical target |
|---|---|
| `skill::skill-api-design::lv1::0` | `skill::api-design` |
| `equip::visual-studio-code::intro` | `equipment::visual-studio-code` |
| `talent::react::lv2::1` | `talent::react` |

The runtime level index points to the authored entry in `levels`. Intro completions resolve to the target's top-level `intro` quest.

Records that do not use a target-shaped runtime id remain in `legacy`. Target-shaped records that cannot be resolved remain in `unresolved` with one of these reasons:

- `invalid-record`
- `missing-summary`
- `invalid-target-quest-id`
- `target-not-found`
- `quest-not-found`

Nothing is silently discarded. A portfolio with unresolved evidence has `status: "degraded"`.

## Showcase Metadata

Generated showcase HTML carries the complete portfolio as inert, HTML-safe JSON:

```javascript
const node = document.getElementById("ulong-evidence-portfolio");
const portfolio = node ? JSON.parse(node.textContent) : null;
```

The metadata element has `type="application/json"`; it does not execute or alter the visible showcase. Serialization escapes markup-significant characters so a user-written summary cannot terminate the element.

## Agent Context

`window.ulongAgent.get_context()` includes only `evidenceSummary`. Full summaries are intentionally excluded from the AUTO prompt to keep context bounded. An agent that needs the full evidence set calls `window.ulongEvidence.build_portfolio()` explicitly.

## Ownership Boundary

Codex owns this projector, schema, export metadata, and tests. Claude may later design visible evidence views by consuming the browser API or showcase metadata, without moving evidence derivation into UI code.
