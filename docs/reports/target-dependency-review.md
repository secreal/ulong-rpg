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

## Preservation Audit

Before authoring, each catalog was parsed and normalized by removing only the `schema.prerequisiteTargets` description and every target's `prerequisiteTargets` value, then compactly serializing the remaining JSON. The normalized SHA-256 values matched after authoring:

| Catalog | Pre-authoring SHA-256 | Post-authoring SHA-256 |
| --- | --- | --- |
| Skill | `36f28473555a0b05bf0e1dae49c6c9e0e209eb50840f49b9c608d91515e2426a` | `36f28473555a0b05bf0e1dae49c6c9e0e209eb50840f49b9c608d91515e2426a` |
| Equipment | `81b240599b58804b80cbcdc1f0e9828f171b68e2fe0a40269695b5554c85fdfe` | `81b240599b58804b80cbcdc1f0e9828f171b68e2fe0a40269695b5554c85fdfe` |
| Talent | `ba804276ac653bcf9bc563f0c506859ddf222ca9a69e9c2bac13db7a09ed782f` | `ba804276ac653bcf9bc563f0c506859ddf222ca9a69e9c2bac13db7a09ed782f` |

These hashes are durable evidence for this authoring pass, not permanent CI assertions; catalog content is expected to evolve.
