const PORTFOLIO_VERSION = 1;
const KIND_ORDER = new Map([
  ["equipment", 0],
  ["skill", 1],
  ["talent", 2],
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function normalizeKind(kind) {
  if (kind === "equip" || kind === "equipment") return "equipment";
  if (kind === "skill" || kind === "talent") return kind;
  return null;
}

function normalizeGeneratedAt(value) {
  const date = value === undefined ? new Date() : new Date(value);
  if (Number.isNaN(date.getTime())) throw new TypeError("generatedAt must be a valid date value.");
  return date.toISOString();
}

function catalogEntries(catalogs, key) {
  if (!isPlainObject(catalogs)) return [];
  const value = catalogs[key];
  if (Array.isArray(value)) return value;
  if (value instanceof Map) return [...value.values()];
  if (isPlainObject(value) && Array.isArray(value.targets)) return value.targets;
  return [];
}

function cloneLinks(value) {
  if (!Array.isArray(value)) return [];
  return value.flatMap(link => {
    if (!isPlainObject(link) || typeof link.url !== "string" || !link.url.trim()) return [];
    return [{
      label: typeof link.label === "string" ? link.label.trim() : "",
      url: link.url.trim(),
    }];
  });
}

function buildRegistry(catalogs) {
  const registry = new Map();
  const sources = [
    ["skill", catalogEntries(catalogs, "skill")],
    ["equipment", [
      ...catalogEntries(catalogs, "equipment"),
      ...catalogEntries(catalogs, "equip"),
    ]],
    ["talent", catalogEntries(catalogs, "talent")],
  ];

  for (const [fallbackKind, entries] of sources) {
    for (const entry of entries) {
      if (!isPlainObject(entry) || typeof entry.targetId !== "string" || !entry.targetId.trim()) continue;
      const kind = normalizeKind(entry.kind) || fallbackKind;
      const targetId = entry.targetId.trim();
      const targetKey = `${kind}::${targetId}`;
      if (registry.has(targetKey)) throw new Error(`Duplicate target identity: ${targetKey}`);
      registry.set(targetKey, {
        entry,
        kind,
        targetId,
        targetKey,
      });
    }
  }
  return registry;
}

function parseTargetQuestId(questId) {
  if (typeof questId !== "string") return null;
  const parts = questId.split("::");
  const runtimeKind = parts[0];
  const kind = normalizeKind(runtimeKind);
  if (!kind || (runtimeKind !== "skill" && runtimeKind !== "equip" && runtimeKind !== "talent")) return null;

  if (parts.length === 3 && parts[2] === "intro") {
    return {
      kind,
      targetId: runtimeKind === "skill" ? parts[1].replace(/^skill-/, "") : parts[1],
      stage: "intro",
      level: null,
      index: null,
    };
  }

  const levelMatch = parts.length === 4 ? /^lv([123])$/.exec(parts[2]) : null;
  const index = parts.length === 4 && /^\d+$/.test(parts[3]) ? Number(parts[3]) : null;
  if (!levelMatch || index === null) return null;
  return {
    kind,
    targetId: runtimeKind === "skill" ? parts[1].replace(/^skill-/, "") : parts[1],
    stage: "level",
    level: Number(levelMatch[1]),
    index,
  };
}

function completionFields(record, runtimeQuestId, summary) {
  return {
    runtimeQuestId,
    job: typeof record?.job === "string" && record.job.trim() ? record.job.trim() : null,
    questType: typeof record?.type === "string" && record.type.trim() ? record.type.trim() : null,
    summary,
    completedAt: typeof record?.completedAt === "string" && record.completedAt.trim()
      ? record.completedAt.trim()
      : null,
  };
}

function unresolvedEvidence(record, runtimeQuestId, reason, summary = "") {
  return {
    ...completionFields(isPlainObject(record) ? record : null, runtimeQuestId, summary),
    reason,
  };
}

function evidenceSort(left, right) {
  const byDate = String(right.completedAt || "").localeCompare(String(left.completedAt || ""));
  if (byDate !== 0) return byDate;
  return left.runtimeQuestId.localeCompare(right.runtimeQuestId);
}

function targetSort(left, right) {
  const byKind = (KIND_ORDER.get(left.kind) ?? 99) - (KIND_ORDER.get(right.kind) ?? 99);
  if (byKind !== 0) return byKind;
  const byName = left.targetName.localeCompare(right.targetName);
  return byName || left.targetId.localeCompare(right.targetId);
}

function makeTargetGroup(registryItem) {
  const { entry, kind, targetId, targetKey } = registryItem;
  return {
    targetKey,
    kind,
    targetId,
    targetName: typeof entry.targetName === "string" && entry.targetName.trim()
      ? entry.targetName.trim()
      : targetId,
    progressKey: typeof entry.source?.progressKey === "string" ? entry.source.progressKey : null,
    fundamental: entry.fundamental === true,
    learningStage: typeof entry.learningStage === "string" ? entry.learningStage : null,
    evidence: [],
  };
}

function resolveAuthoredQuest(entry, parsed) {
  if (parsed.stage === "intro") return isPlainObject(entry.intro) ? entry.intro : null;
  const quests = entry.levels?.[String(parsed.level)];
  return Array.isArray(quests) && isPlainObject(quests[parsed.index]) ? quests[parsed.index] : null;
}

export function buildTargetEvidencePortfolio({ questProgress = {}, catalogs = {}, generatedAt } = {}) {
  const registry = buildRegistry(catalogs);
  const completed = isPlainObject(questProgress?.completed) ? questProgress.completed : {};
  const groups = new Map();
  const legacy = [];
  const unresolved = [];
  const runtimeIdCounts = new Map();

  for (const [recordKey, rawRecord] of Object.entries(completed)) {
    const runtimeQuestId = isPlainObject(rawRecord) && typeof rawRecord.id === "string" && rawRecord.id.trim()
      ? rawRecord.id.trim()
      : recordKey;
    runtimeIdCounts.set(runtimeQuestId, (runtimeIdCounts.get(runtimeQuestId) || 0) + 1);
  }

  for (const [recordKey, rawRecord] of Object.entries(completed).sort(([left], [right]) => left.localeCompare(right))) {
    const runtimeQuestId = isPlainObject(rawRecord) && typeof rawRecord.id === "string" && rawRecord.id.trim()
      ? rawRecord.id.trim()
      : recordKey;

    if (runtimeIdCounts.get(runtimeQuestId) > 1) {
      const summary = isPlainObject(rawRecord) && typeof rawRecord.summary === "string" ? rawRecord.summary.trim() : "";
      unresolved.push(unresolvedEvidence(rawRecord, runtimeQuestId, "duplicate-runtime-quest-id", summary));
      continue;
    }

    if (!isPlainObject(rawRecord)) {
      unresolved.push(unresolvedEvidence(rawRecord, runtimeQuestId, "invalid-record"));
      continue;
    }

    const summary = typeof rawRecord.summary === "string" ? rawRecord.summary.trim() : "";
    if (!summary) {
      unresolved.push(unresolvedEvidence(rawRecord, runtimeQuestId, "missing-summary"));
      continue;
    }

    const parsed = parseTargetQuestId(runtimeQuestId);
    const targetShaped = /^(skill|equip|talent)::/.test(runtimeQuestId);
    if (!parsed) {
      if (targetShaped) {
        unresolved.push(unresolvedEvidence(rawRecord, runtimeQuestId, "invalid-target-quest-id", summary));
      } else {
        legacy.push(completionFields(rawRecord, runtimeQuestId, summary));
      }
      continue;
    }

    const targetKey = `${parsed.kind}::${parsed.targetId}`;
    const registryItem = registry.get(targetKey);
    if (!registryItem) {
      unresolved.push(unresolvedEvidence(rawRecord, runtimeQuestId, "target-not-found", summary));
      continue;
    }

    const authoredQuest = resolveAuthoredQuest(registryItem.entry, parsed);
    if (!authoredQuest) {
      unresolved.push(unresolvedEvidence(rawRecord, runtimeQuestId, "quest-not-found", summary));
      continue;
    }

    if (!groups.has(targetKey)) groups.set(targetKey, makeTargetGroup(registryItem));
    groups.get(targetKey).evidence.push({
      ...completionFields(rawRecord, runtimeQuestId, summary),
      authoredQuestId: typeof authoredQuest.id === "string" ? authoredQuest.id : null,
      title: typeof authoredQuest.title === "string" ? authoredQuest.title : null,
      description: typeof authoredQuest.description === "string" ? authoredQuest.description : null,
      links: cloneLinks(authoredQuest.links),
      stage: parsed.stage,
      level: parsed.level,
      sequence: parsed.index === null ? null : parsed.index + 1,
    });
  }

  const targets = [...groups.values()]
    .map(group => ({ ...group, evidence: group.evidence.sort(evidenceSort) }))
    .sort(targetSort);
  legacy.sort(evidenceSort);
  unresolved.sort((left, right) => left.reason.localeCompare(right.reason) || evidenceSort(left, right));
  const resolvedEvidence = targets.reduce((total, target) => total + target.evidence.length, 0);

  return {
    version: PORTFOLIO_VERSION,
    generatedAt: normalizeGeneratedAt(generatedAt),
    status: unresolved.length ? "degraded" : "complete",
    summary: {
      totalCompleted: Object.keys(completed).length,
      resolvedEvidence,
      targetsWithEvidence: targets.length,
      legacyEvidence: legacy.length,
      unresolvedEvidence: unresolved.length,
    },
    targets,
    legacy,
    unresolved,
  };
}

export function serializeEvidencePortfolioForHtml(portfolio) {
  return JSON.stringify(portfolio)
    .replaceAll("&", "\\u0026")
    .replaceAll("<", "\\u003c")
    .replaceAll(">", "\\u003e")
    .replaceAll("\u2028", "\\u2028")
    .replaceAll("\u2029", "\\u2029");
}
