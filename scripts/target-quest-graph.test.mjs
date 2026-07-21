import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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

test("valid fan-in graph supports one to three prerequisites at unequal depths", () => {
  const result = analyzeTargetQuestGraph([
    target("skill", "root", { fundamental: true }),
    target("skill", "depth-one", { prerequisites: ["skill:root"] }),
    target("skill", "depth-two", {
      prerequisites: ["skill:root", "skill:depth-one"],
    }),
    target("talent", "fan-in", {
      prerequisites: ["skill:root", "skill:depth-one", "skill:depth-two"],
    }),
  ]);

  assert.deepEqual(result, {
    findings: [],
    dependencies: {
      edges: 6,
      maxDepth: 3,
      withoutPrerequisites: [],
    },
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

test("a cycle with an exit to a fundamental is rooted", () => {
  const result = analyzeTargetQuestGraph([
    target("skill", "root", { fundamental: true }),
    target("skill", "cycle-a", { prerequisites: ["skill:cycle-b"] }),
    target("skill", "cycle-b", {
      prerequisites: ["skill:cycle-a", "skill:root"],
    }),
  ]);

  assert.deepEqual(ruleIds(result), ["prerequisite-cycle"]);
  assert.deepEqual(result.findings[0].details, {
    targets: ["skill:cycle-a", "skill:cycle-b"],
  });
  assert.equal(result.dependencies.maxDepth, null);
});

test("a 20,000-node DAG does not depend on the JavaScript call stack", () => {
  const targets = [target("skill", "node-0", { fundamental: true })];
  for (let index = 1; index < 20_000; index += 1) {
    targets.push(target("skill", `node-${index}`, {
      prerequisites: [`skill:node-${index - 1}`],
    }));
  }

  const first = analyzeTargetQuestGraph(targets);
  const second = analyzeTargetQuestGraph(targets);

  assert.deepEqual(first, second);
  assert.deepEqual(first, {
    findings: [],
    dependencies: {
      edges: 19_999,
      maxDepth: 19_999,
      withoutPrerequisites: [],
    },
  });
});

test("live catalogs form a complete rooted dependency graph", () => {
  const files = [
    ["skill", "skills.json"],
    ["equipment", "equipment.json"],
    ["talent", "talents.json"],
  ];
  const targets = [];
  let questCount = 0;

  for (const [kind, file] of files) {
    const data = JSON.parse(fs.readFileSync(path.join("data", "target-quests", file), "utf8"));
    for (const target of data.targets) {
      questCount += 1 + Object.values(target.levels).reduce((total, quests) => total + quests.length, 0);
      targets.push({
        kind,
        targetId: target.targetId,
        fundamental: target.fundamental,
        prerequisiteTargets: target.prerequisiteTargets,
        location: `data/target-quests/${file}:${target.targetId}`,
      });
    }
  }

  const result = analyzeTargetQuestGraph(targets);
  assert.equal(targets.length, 551);
  assert.equal(questCount, 5_510);
  assert.equal(targets.filter(target => target.fundamental).length, 122);
  assert.equal(targets.filter(target => !target.fundamental).length, 429);
  assert.deepEqual(result.findings, []);
  assert.deepEqual(result.dependencies, {
    edges: 429,
    maxDepth: 3,
    withoutPrerequisites: [],
  });
});

test("every live dependency edge has a matching non-empty review rationale", () => {
  const files = [
    ["skill", "skills.json", "skills.md"],
    ["equipment", "equipment.json", "equipment.md"],
    ["talent", "talents.json", "talents.md"],
  ];

  for (const [kind, jsonFile, reviewFile] of files) {
    const catalog = JSON.parse(fs.readFileSync(path.join("data", "target-quests", jsonFile), "utf8"));
    const markdown = fs.readFileSync(
      path.join("docs", "reports", "dependency-review", reviewFile),
      "utf8",
    );
    const reviewed = new Map();
    for (const line of markdown.split("\n")) {
      const match = line.match(/^\| `([^`]+)` \| (.+) \| (.+) \|$/);
      if (!match) continue;
      reviewed.set(match[1], {
        prerequisites: [...match[2].matchAll(/`([^`]+)`/g)].map(reference => reference[1]),
        rationale: match[3].trim(),
      });
    }

    for (const targetRecord of catalog.targets.filter(item => !item.fundamental)) {
      const key = `${kind}:${targetRecord.targetId}`;
      assert.ok(reviewed.has(key), `missing review row for ${key}`);
      assert.deepEqual(reviewed.get(key).prerequisites, targetRecord.prerequisiteTargets, key);
      assert.notEqual(reviewed.get(key).rationale, "", `empty rationale for ${key}`);
    }
  }
});
