import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildTargetEvidencePortfolio,
  serializeEvidencePortfolioForHtml,
} from "./lib/target-evidence-portfolio.mjs";

function quest(id, title, url = "https://example.com/learn") {
  return {
    id,
    title,
    description: `${title} description`,
    summaryRequired: true,
    links: [{ label: "Learning source", url }],
  };
}

function target(kind, targetId, targetName) {
  return {
    kind,
    targetId,
    targetName,
    source: {
      type: kind,
      progressKey: `${kind}::${targetName}`,
    },
    intro: quest(`${kind}-${targetId}-intro`, `Meet ${targetName}`),
    levels: {
      "1": [
        quest(`${kind}-${targetId}-lv1-01`, `${targetName} first`),
        quest(`${kind}-${targetId}-lv1-02`, `${targetName} second`),
        quest(`${kind}-${targetId}-lv1-03`, `${targetName} third`),
      ],
      "2": [],
      "3": [],
    },
    fundamental: kind === "skill",
    learningStage: kind === "skill" ? "fundamental" : "dependent",
  };
}

const catalogs = {
  skill: [target("skill", "api-design", "API Design")],
  equipment: [target("equipment", "visual-studio-code", "Visual Studio Code")],
  talent: [target("talent", "react", "React")],
};

test("groups intro and level evidence under canonical targets", () => {
  const questProgress = {
    completed: {
      "skill::skill-api-design::lv1::0": {
        id: "skill::skill-api-design::lv1::0",
        job: "Backend Developer",
        type: "main",
        summary: "I designed a small resource API.",
        completedAt: "2026-07-22T10:00:00.000Z",
      },
      "equip::visual-studio-code::intro": {
        id: "equip::visual-studio-code::intro",
        job: "Frontend Developer",
        type: "daily",
        summary: "I learned the editor layout and command palette.",
        completedAt: "2026-07-21T10:00:00.000Z",
      },
      "talent::react::lv1::1": {
        id: "talent::react::lv1::1",
        job: "Frontend Developer",
        type: "main",
        summary: "I compared component state approaches.",
        completedAt: "2026-07-23T10:00:00.000Z",
      },
    },
  };

  const result = buildTargetEvidencePortfolio({
    questProgress,
    catalogs,
    generatedAt: "2026-07-23T12:00:00.000Z",
  });

  assert.deepEqual(result.summary, {
    totalCompleted: 3,
    resolvedEvidence: 3,
    targetsWithEvidence: 3,
    legacyEvidence: 0,
    unresolvedEvidence: 0,
  });
  assert.equal(result.status, "complete");
  assert.deepEqual(result.targets.map(item => item.targetKey), [
    "equipment::visual-studio-code",
    "skill::api-design",
    "talent::react",
  ]);

  const skillEvidence = result.targets.find(item => item.targetKey === "skill::api-design");
  assert.equal(skillEvidence.targetName, "API Design");
  assert.equal(skillEvidence.evidence[0].authoredQuestId, "skill-api-design-lv1-01");
  assert.equal(skillEvidence.evidence[0].level, 1);
  assert.equal(skillEvidence.evidence[0].sequence, 1);
  assert.equal(skillEvidence.evidence[0].job, "Backend Developer");

  const equipmentEvidence = result.targets.find(item => item.targetKey === "equipment::visual-studio-code");
  assert.equal(equipmentEvidence.evidence[0].stage, "intro");
  assert.equal(equipmentEvidence.evidence[0].level, null);
});

test("sorts evidence deterministically without mutating inputs", () => {
  const questProgress = {
    completed: {
      later: {
        id: "skill::skill-api-design::lv1::1",
        summary: "Later completion",
        completedAt: "2026-07-23T10:00:00.000Z",
      },
      earlier: {
        id: "skill::skill-api-design::lv1::0",
        summary: "Earlier completion",
        completedAt: "2026-07-21T10:00:00.000Z",
      },
    },
  };
  const before = structuredClone(questProgress);

  const first = buildTargetEvidencePortfolio({ questProgress, catalogs, generatedAt: 0 });
  const second = buildTargetEvidencePortfolio({ questProgress, catalogs, generatedAt: 0 });

  assert.deepEqual(first, second);
  assert.deepEqual(questProgress, before);
  assert.deepEqual(first.targets[0].evidence.map(item => item.summary), [
    "Later completion",
    "Earlier completion",
  ]);
});

test("preserves legacy and unresolved completions with reasons", () => {
  const result = buildTargetEvidencePortfolio({
    questProgress: {
      completed: {
        legacy: {
          id: "backend-api-main-01",
          job: "Backend Developer",
          type: "main",
          summary: "Legacy quest evidence.",
          completedAt: "2026-07-20T10:00:00.000Z",
        },
        missingTarget: {
          id: "talent::unknown-library::lv1::0",
          summary: "The catalog target no longer exists.",
        },
        missingQuest: {
          id: "skill::skill-api-design::lv3::9",
          summary: "The authored quest position does not exist.",
        },
        invalidTargetId: {
          id: "equip::visual-studio-code::lvX::0",
          summary: "Malformed runtime id.",
        },
        missingSummary: {
          id: "talent::react::intro",
          summary: "   ",
        },
        invalidRecord: null,
      },
    },
    catalogs,
    generatedAt: "2026-07-23T12:00:00.000Z",
  });

  assert.equal(result.status, "degraded");
  assert.equal(result.summary.totalCompleted, 6);
  assert.equal(result.summary.legacyEvidence, 1);
  assert.equal(result.summary.unresolvedEvidence, 5);
  assert.equal(result.legacy[0].runtimeQuestId, "backend-api-main-01");
  assert.deepEqual(result.unresolved.map(item => item.reason).sort(), [
    "invalid-record",
    "invalid-target-quest-id",
    "missing-summary",
    "quest-not-found",
    "target-not-found",
  ]);
});

test("works without catalogs by retaining target-shaped records as unresolved", () => {
  const result = buildTargetEvidencePortfolio({
    questProgress: {
      completed: {
        evidence: {
          id: "skill::skill-api-design::lv1::0",
          summary: "Still retained when catalog loading fails.",
        },
      },
    },
    generatedAt: 0,
  });

  assert.equal(result.summary.totalCompleted, 1);
  assert.equal(result.summary.resolvedEvidence, 0);
  assert.equal(result.unresolved[0].reason, "target-not-found");
  assert.equal(result.unresolved[0].summary, "Still retained when catalog loading fails.");
});

test("does not double-count duplicate runtime quest ids from imported state", () => {
  const result = buildTargetEvidencePortfolio({
    questProgress: {
      completed: {
        first: {
          id: "skill::skill-api-design::lv1::0",
          summary: "First imported copy.",
        },
        second: {
          id: "skill::skill-api-design::lv1::0",
          summary: "Second imported copy.",
        },
      },
    },
    catalogs,
    generatedAt: 0,
  });

  assert.equal(result.summary.resolvedEvidence, 0);
  assert.equal(result.summary.unresolvedEvidence, 2);
  assert.deepEqual(result.unresolved.map(item => item.reason), [
    "duplicate-runtime-quest-id",
    "duplicate-runtime-quest-id",
  ]);
});

test("escapes portfolio JSON for an inert HTML script element", () => {
  const portfolio = {
    version: 1,
    note: "</script><img src=x onerror=alert(1)>&\u2028\u2029",
  };

  const serialized = serializeEvidencePortfolioForHtml(portfolio);

  assert.doesNotMatch(serialized, /<\/script/i);
  assert.doesNotMatch(serialized, /<img/i);
  assert.doesNotMatch(serialized, /[\u2028\u2029]/u);
  assert.deepEqual(JSON.parse(serialized), portfolio);
});

test("rejects duplicate target identities instead of resolving ambiguously", () => {
  assert.throws(() => buildTargetEvidencePortfolio({
    questProgress: { completed: {} },
    catalogs: {
      skill: [
        target("skill", "api-design", "API Design"),
        target("skill", "api-design", "Duplicate API Design"),
      ],
    },
  }), /duplicate target/i);
});

test("index exposes a read-only evidence API and bounded agent context", async () => {
  const html = await readFile(new URL("../index.html", import.meta.url), "utf8");

  assert.match(html, /window\.ulongEvidenceReady\s*=\s*initEvidencePortfolio\(\)/);
  assert.match(html, /build_portfolio:\s*buildCurrentEvidencePortfolio/);
  assert.match(html, /Object\.freeze\(\{\s*version:\s*1,\s*build_portfolio:/s);
  assert.match(html, /evidenceSummary/);
  assert.match(html, /summariesAvailable/);
  const contextStart = html.indexOf("function buildAgentContext(");
  const contextEnd = html.indexOf("\n    async function initAgentBridge", contextStart);
  assert.notEqual(contextStart, -1);
  assert.notEqual(contextEnd, -1);
  assert.doesNotMatch(html.slice(contextStart, contextEnd), /buildCurrentEvidencePortfolio|loadTargetQuestData/);
  assert.doesNotMatch(html, /id="ulong-evidence-portfolio"\s+type="application\/json"/);
  assert.doesNotMatch(html, /set_evidence|delete_evidence|saveEvidencePortfolio/);
});
