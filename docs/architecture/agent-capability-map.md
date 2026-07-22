# Agent Capability Map

ulong RPG exposes a browser bridge at `window.ulongAgent`. The bridge is a primitive state interface, not an embedded agent runtime. External agents still use ordinary browser actions for navigation, downloads, OAuth, and links that require a user gesture.

## Primitive Contract

| Capability | Outcome |
|---|---|
| `list_capabilities()` | Discover bridge version, revision, primitives, and resources. |
| `get_context()` | Read bounded live application context before deciding or writing. |
| `read_resource({ resource })` | Read a deep-cloned resource snapshot. |
| `set_value({ resource, path, value, expectedRevision })` | Create or update one nested JSON value. |
| `delete_value({ resource, path, expectedRevision })` | Delete one nested JSON value. |
| `complete_task({ summary })` | Explicitly signal verified completion. |

Every mutation uses a non-empty path array and the exact latest revision. Root replacement is intentionally unavailable.

## Registered Resources

| Resource | User-facing state | Read | Create/Update | Delete |
|---|---|---:|---:|---:|
| `progress` | Skill, equipment, and talent levels | Yes | `set_value` | `delete_value` |
| `questProgress` | Quest summaries, completion dates, daily state | Yes | `set_value` | `delete_value` |
| `profile` | Hero name, nickname, GitHub username | Yes | `set_value` | `delete_value` |
| `links` | Per-job portfolio links | Yes | `set_value` | `delete_value` |
| `auto` | Preferred external AI CLI | Yes | `set_value` | `delete_value` |
| `language` | Current `id` or `en` language | Yes | `set_value` at `["value"]` | No root delete |
| `jobChange` | Primary and included jobs | Yes | `set_value` below `["value"]` | `delete_value` below `["value"]` |
| `guild` | Current and past employment entries | Yes | `set_value` | `delete_value` |
| `achievements` | Earned achievement records | Yes | `set_value` | `delete_value` |
| `ulongProgress` | Perguruan Ulong completion evidence | Yes | `set_value` | `delete_value` |

## UI Action Parity

| UI action | UI location | Agent outcome | Status |
|---|---|---|---|
| View current career progress | Job cards, My Progress | `get_context` plus `read_resource` | Covered |
| Change a skill/equipment/talent level | Job card and detail tabs | `set_value` or `delete_value` on `progress` | Covered |
| Complete or remove a quest record | Quest tab | `set_value` or `delete_value` on `questProgress` | Covered |
| Edit hero profile | Hero modal | `set_value` or `delete_value` on `profile` | Covered |
| Edit portfolio links | Achievement tab | `set_value` or `delete_value` on `links` | Covered |
| Select external AI CLI | AUTO popover | `set_value` on `auto` | Covered |
| Switch language | Header language control | `set_value` on `language` | Covered |
| Configure or clear multi-job state | Job Change modal | `set_value` or `delete_value` on `jobChange` | Covered |
| Edit guild history | Hero modal | `set_value` or `delete_value` on `guild` | Covered |
| Record Perguruan Ulong completion | IT Novice quest tab | `set_value` or `delete_value` on `ulongProgress` | Covered |
| Import a progress backup | Sync modal | Compose writes across registered resources | Covered |
| Export progress/showcase | Sync and Export modals | Use browser click/download; user gesture is intentionally preserved | Browser parity |
| Google Drive OAuth/sync | Sync modal | Use browser UI; OAuth consent is intentionally not bypassed | Browser parity |
| Open learning or job-search links | Quest and Find Guild views | Use ordinary browser navigation | Browser parity |

## State Events

- `ulong:agent-ready`: bridge initialized and capability discovery is available.
- `ulong:agent-state-change`: a validated mutation persisted and the UI refresh path ran.
- `ulong:agent-complete`: the agent explicitly reported a verified outcome.

Consumers should wait for `window.ulongAgentReady`, refresh context before each write sequence, and stop on stale-revision errors rather than retrying blindly.

`get_context()` also publishes relative catalog URLs for equipment, talents, and target quests. Agents can inspect those files when deciding about targets that are not active yet without injecting the full catalogs into every prompt.

If state persistence succeeds but an event subscriber fails, a mutation still returns `status: "applied"` with `notificationError`. The caller should verify the resource and may refresh the UI; it must not repeat the write blindly.

## Ownership Boundary

Codex owns this state/capability contract and its tests. Claude owns any future visible chat, approval, activity, or progress UI that consumes it. Adding a visible UI action should update this map and provide either bridge parity or an explicit browser-only rationale in the same change.
