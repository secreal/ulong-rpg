import assert from "node:assert/strict";
import test from "node:test";

import { analyzeTargetQuestGraph } from "./lib/target-quest-graph.mjs";

function target(kind, targetId, {
  fundamental = false,
  prerequisites = [],
} = {}) {
  return {
    kind,
    targetId,
    fundamental,
    prerequisiteTargets: prerequisites,
    location: `${kind}.json:${targetId}`,
  };
}

function ruleIds(result) {
  return result.findings.map(finding => finding.ruleId);
}

test("valid cross-kind DAG resolves qualified collisions and reports metrics", () => {
  const targets = [
    target("skill", "version-control", { fundamental: true }),
    target("equipment", "git", {
      prerequisites: ["skill:version-control"],
    }),
    target("talent", "git", { fundamental: true }),
    target("talent", "react", { prerequisites: ["equipment:git"] }),
  ];

  const result = analyzeTargetQuestGraph(targets);

  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.dependencies, {
    edges: 2,
    maxDepth: 2,
    withoutPrerequisites: [],
  });
});

test("malformed references produce deterministic syntax findings", () => {
  const invalid = [
    "version-control",
    "skill::version-control",
    "unknown:version-control",
    "skill:",
    "skill:version-control:extra",
    42,
  ];
  const targets = [
    target("skill", "version-control", { fundamental: true }),
    target("talent", "react", { prerequisites: invalid }),
  ];

  const first = analyzeTargetQuestGraph(targets);
  const second = analyzeTargetQuestGraph(targets);

  assert.equal(ruleIds(first).filter(id => id === "malformed-prerequisite-reference").length, invalid.length);
  assert.deepEqual(first, second);
  assert.deepEqual(first.dependencies, {
    edges: 0,
    maxDepth: null,
    withoutPrerequisites: [],
  });
});

test("declaration rules reject duplicate, unresolved, self, missing, and excessive prerequisites", () => {
  const targets = [
    target("skill", "foundation", { fundamental: true }),
    target("skill", "fundamental-with-edge", {
      fundamental: true,
      prerequisites: ["skill:foundation"],
    }),
    target("skill", "missing"),
    target("skill", "invalid", {
      prerequisites: [
        "skill:foundation",
        "skill:foundation",
        "skill:invalid",
        "skill:unknown",
      ],
    }),
  ];

  const result = analyzeTargetQuestGraph(targets);
  const ids = new Set(ruleIds(result));

  for (const expected of [
    "fundamental-has-prerequisites",
    "missing-prerequisites",
    "too-many-prerequisites",
    "duplicate-prerequisite",
    "self-prerequisite",
    "unresolved-prerequisite",
  ]) {
    assert.ok(ids.has(expected), `missing rule ${expected}`);
  }
  assert.deepEqual(result.dependencies.withoutPrerequisites, ["skill:missing"]);
  assert.equal(result.dependencies.maxDepth, null);
});

test("cycles and unrooted chains are reported without calculating depth", () => {
  const result = analyzeTargetQuestGraph([
    target("skill", "root", { fundamental: true }),
    target("skill", "cycle-a", { prerequisites: ["skill:cycle-b"] }),
    target("skill", "cycle-b", { prerequisites: ["skill:cycle-a"] }),
    target("skill", "unrooted", { prerequisites: ["skill:cycle-a"] }),
  ]);

  assert.ok(ruleIds(result).includes("prerequisite-cycle"));
  assert.ok(ruleIds(result).includes("unrooted-dependent"));
  assert.equal(result.dependencies.maxDepth, null);
});
