import fs from "node:fs";
import path from "node:path";

const QUEST_KINDS = Object.freeze(["skill", "equipment", "talent"]);
const QUEST_LEVELS = Object.freeze(["1", "2", "3"]);

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readJson(filePath, addProblem) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    addProblem("invalid-json", `Unable to parse ${relative(filePath)}`, {
      file: relative(filePath),
      message: error.message,
    });
    return null;
  }
}

function relative(filePath) {
  return path.relative(process.cwd(), filePath).replaceAll("\\", "/");
}

function isValidHttpUrl(value) {
  if (typeof value !== "string") return false;
  const candidate = value.trim();
  try {
    const parsed = new URL(candidate);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function sortUsage(left, right) {
  return left.questId.localeCompare(right.questId) || left.targetId.localeCompare(right.targetId);
}

function makeSourceId(index) {
  return `source-${String(index).padStart(4, "0")}`;
}

export function collectSourceUsage({
  rootDir = process.cwd(),
  indexPath = path.join(rootDir, "data", "target-quests", "index.json"),
  addProblem = () => {},
} = {}) {
  const safeAddProblem = typeof addProblem === "function" ? addProblem : () => {};
  const sourceByUrl = new Map();
  const byLabel = new Map();
  const invalidLinks = [];
  const stats = {
    questFilesDeclared: 0,
    filesMissing: 0,
    linksTotal: 0,
    linksUsed: 0,
    targetCount: 0,
    questCount: 0,
  };

  if (!fs.existsSync(indexPath)) {
    safeAddProblem("missing-index", "Target quest index file missing.", { file: relative(indexPath) });
    return { sourceByUrl, byLabel, invalidLinks, stats };
  }

  const indexData = readJson(indexPath, safeAddProblem);
  if (!indexData || !Array.isArray(indexData.questFiles)) {
    safeAddProblem("invalid-index", "Target quest index payload is invalid or not an array.");
    return { sourceByUrl, byLabel, invalidLinks, stats };
  }

  for (const entry of indexData.questFiles) {
    if (!isObject(entry) || !QUEST_KINDS.includes(entry.kind) || entry.status !== "available" || typeof entry.file !== "string") {
      continue;
    }
    stats.questFilesDeclared += 1;
    const questPath = path.join(rootDir, "data", "target-quests", entry.file);
    if (!fs.existsSync(questPath)) {
      stats.filesMissing += 1;
      safeAddProblem("missing-quest-file", "Declared quest file does not exist.", {
        file: path.relative(rootDir, questPath).replaceAll("\\", "/"),
      });
      continue;
    }

    const questFile = readJson(questPath, safeAddProblem);
    if (!isObject(questFile) || !Array.isArray(questFile.targets)) {
      safeAddProblem("invalid-quest-file", "Quest file missing or has invalid targets.", { file: entry.file });
      continue;
    }

    for (const target of questFile.targets) {
      if (!isObject(target) || typeof target.targetId !== "string") continue;
      stats.targetCount += 1;
      const targetId = normalizeText(target.targetId);
      const kind = normalizeText(target.kind) || entry.kind;

      const allQuests = [];
      if (isObject(target.intro)) {
        allQuests.push({ questType: "intro", quest: target.intro });
      }
      if (isObject(target.levels)) {
        for (const level of QUEST_LEVELS) {
          for (const quest of target.levels[level] || []) {
            allQuests.push({ questType: `lv${level}`, quest });
          }
        }
      }
      for (const item of allQuests) {
        if (!isObject(item.quest) || !Array.isArray(item.quest.links)) continue;
        for (const rawLink of item.quest.links) {
          stats.linksTotal += 1;
          if (!isObject(rawLink)) continue;
          const label = normalizeText(rawLink.label);
          const url = normalizeText(rawLink.url);
          const questId = normalizeText(item.quest.id);
          if (!questId || !url) {
            continue;
          }
          if (!isValidHttpUrl(url)) {
            invalidLinks.push({
              kind,
              targetId,
              questId,
              questType: item.questType,
              label,
              url,
            });
            continue;
          }
          stats.linksUsed += 1;
          const existing = sourceByUrl.get(url) || {
            url,
            labels: new Set(),
            usage: [],
            targets: new Map(),
          };
          existing.labels.add(label || "__untitled__");
          existing.usage.push({
            kind,
            targetId,
            questId,
            questType: item.questType,
          });
          existing.targets.set(targetId, (existing.targets.get(targetId) || 0) + 1);
          sourceByUrl.set(url, existing);

          const labelSet = byLabel.get(label || "__untitled__") || new Set();
          labelSet.add(url);
          byLabel.set(label || "__untitled__", labelSet);
        }
      }
    }
  }
  stats.questCount = stats.linksUsed + invalidLinks.length;
  return { sourceByUrl, byLabel, invalidLinks, stats };
}

function sortByUrl(a, b) {
  return a.url.localeCompare(b.url);
}

export function buildLearningSourceLibrary(rootDir = process.cwd()) {
  const collected = collectSourceUsage({ rootDir });
  const rawSources = [];
  for (const source of collected.sourceByUrl.values()) {
    const byKind = { skill: 0, equipment: 0, talent: 0 };
    for (const usage of source.usage) byKind[usage.kind] += 1;
    rawSources.push({
      url: source.url,
      labels: [...source.labels].sort((left, right) => left.localeCompare(right)),
      usageCount: source.usage.length,
      usageByKind: byKind,
      targets: [...source.targets.entries()].sort(([a], [b]) => a.localeCompare(b)),
      usages: source.usage.sort(sortUsage),
    });
  }

  const sourceCatalog = rawSources
    .sort(sortByUrl)
    .map((entry, index) => ({ id: makeSourceId(index + 1), ...entry }));

  const labelUrlConflict = [...collected.byLabel.entries()]
    .filter(([, urls]) => urls.size > 1)
    .map(([label, urls]) => ({ label, urls: [...urls].sort() }))
    .sort((left, right) => left.label.localeCompare(right.label));

  const urlLabelConflict = sourceCatalog
    .filter(source => source.labels.length > 1)
    .map(source => ({ url: source.url, labels: source.labels.slice() }))
    .sort((left, right) => left.url.localeCompare(right.url));

  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    summary: {
      sources: sourceCatalog.length,
      links: {
        total: collected.stats.linksTotal,
        used: collected.stats.linksUsed,
        invalid: collected.invalidLinks.length,
      },
      targets: collected.stats.targetCount,
      questFiles: collected.stats.questFilesDeclared,
      filesMissing: collected.stats.filesMissing,
    },
    sources: sourceCatalog,
    conflicts: {
      labelUrlConflict,
      urlLabelConflict,
    },
    invalid: collected.invalidLinks,
  };
}

