# Target Dependency Review

The target dependency graph contains one reviewed direct prerequisite for each of the 429 dependent targets. Every edge uses a qualified `<kind>:<targetId>` reference and records the smallest credible conceptual or operational foundation chosen during authoring.

| Kind | Fundamental | Dependent | Authored edges | Review ledger |
| --- | ---: | ---: | ---: | --- |
| Skill | 39 | 158 | 158 | [Skill dependency review](dependency-review/skills.md) |
| Equipment | 63 | 126 | 126 | [Equipment dependency review](dependency-review/equipment.md) |
| Talent | 20 | 145 | 145 | [Talent dependency review](dependency-review/talents.md) |
| **Total** | **122** | **429** | **429** | |

## Acceptance Checks

- Every fundamental target has no prerequisites.
- Every dependent target has exactly one direct prerequisite.
- Every reference resolves by qualified kind and target ID.
- The graph is acyclic and every dependent reaches a fundamental root.
- Existing target identity, classification, progress keys, quest copy, links, intro objects, and level groups are unchanged.
