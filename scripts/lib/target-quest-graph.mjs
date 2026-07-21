const KINDS = new Set(["skill", "equipment", "talent"]);
const REFERENCE_PATTERN = /^(skill|equipment|talent):([a-z0-9]+(?:-[a-z0-9]+)*)$/;

function targetKey(target) {
  return `${target.kind}:${target.targetId}`;
}

function sortFindings(findings) {
  return findings.sort((left, right) =>
    left.ruleId.localeCompare(right.ruleId)
      || left.location.localeCompare(right.location)
      || left.message.localeCompare(right.message)
      || JSON.stringify(left.details || {}).localeCompare(JSON.stringify(right.details || {})),
  );
}

function findCycles(keys, adjacency) {
  let nextIndex = 0;
  const stack = [];
  const onStack = new Set();
  const indices = new Map();
  const lowLinks = new Map();
  const cycles = [];

  function visit(key) {
    indices.set(key, nextIndex);
    lowLinks.set(key, nextIndex);
    nextIndex += 1;
    stack.push(key);
    onStack.add(key);

    for (const prerequisite of adjacency.get(key) || []) {
      if (!indices.has(prerequisite)) {
        visit(prerequisite);
        lowLinks.set(key, Math.min(lowLinks.get(key), lowLinks.get(prerequisite)));
      } else if (onStack.has(prerequisite)) {
        lowLinks.set(key, Math.min(lowLinks.get(key), indices.get(prerequisite)));
      }
    }

    if (lowLinks.get(key) !== indices.get(key)) return;
    const component = [];
    let member;
    do {
      member = stack.pop();
      onStack.delete(member);
      component.push(member);
    } while (member !== key);
    if (component.length > 1) cycles.push(component.sort());
  }

  for (const key of keys) {
    if (!indices.has(key)) visit(key);
  }
  return cycles.sort((left, right) => left.join("|").localeCompare(right.join("|")));
}

function rootedTargets(keys, registry, adjacency) {
  const memo = new Map();

  function reachesFundamental(key, visiting = new Set()) {
    if (memo.has(key)) return memo.get(key);
    if (visiting.has(key)) return false;
    const target = registry.get(key);
    if (target?.fundamental === true) {
      memo.set(key, true);
      return true;
    }
    const nextVisiting = new Set(visiting).add(key);
    const rooted = (adjacency.get(key) || []).some(prerequisite =>
      reachesFundamental(prerequisite, nextVisiting),
    );
    memo.set(key, rooted);
    return rooted;
  }

  return new Set(keys.filter(key => reachesFundamental(key)));
}

function maximumDepth(keys, registry, adjacency) {
  const memo = new Map();
  function depth(key) {
    if (memo.has(key)) return memo.get(key);
    const target = registry.get(key);
    if (target.fundamental) {
      memo.set(key, 0);
      return 0;
    }
    const value = 1 + Math.max(...adjacency.get(key).map(depth));
    memo.set(key, value);
    return value;
  }
  return Math.max(0, ...keys.map(depth));
}

export function analyzeTargetQuestGraph(targets) {
  const findings = [];
  const addFinding = (ruleId, location, message, details) => {
    const finding = { ruleId, severity: "error", location, message };
    if (details && Object.keys(details).length > 0) finding.details = details;
    findings.push(finding);
  };

  const registry = new Map();
  for (const target of targets) {
    const key = targetKey(target);
    if (!KINDS.has(target.kind) || typeof target.targetId !== "string" || !target.targetId) continue;
    if (registry.has(key)) {
      addFinding("duplicate-target", target.location, `Target "${key}" is declared more than once.`);
      continue;
    }
    registry.set(key, target);
  }

  const keys = [...registry.keys()].sort();
  const adjacency = new Map(keys.map(key => [key, []]));
  const withoutPrerequisites = [];
  let edges = 0;

  for (const key of keys) {
    const target = registry.get(key);
    const references = target.prerequisiteTargets;
    if (!Array.isArray(references)) {
      addFinding(
        "prerequisite-targets-shape",
        target.location,
        "prerequisiteTargets must be an array.",
      );
      continue;
    }
    if (target.fundamental === true && references.length > 0) {
      addFinding(
        "fundamental-has-prerequisites",
        target.location,
        "Fundamental target must not declare prerequisites.",
      );
    }
    if (target.fundamental === false && references.length === 0) {
      withoutPrerequisites.push(key);
      addFinding(
        "missing-prerequisites",
        target.location,
        "Dependent target must declare at least one prerequisite.",
      );
    }
    if (references.length > 3) {
      addFinding(
        "too-many-prerequisites",
        target.location,
        "Target may declare at most three direct prerequisites.",
        { actual: references.length, maximum: 3 },
      );
    }

    const seenReferences = new Set();
    references.forEach((reference, referenceIndex) => {
      const location = `${target.location}.prerequisiteTargets[${referenceIndex}]`;
      if (typeof reference !== "string" || !REFERENCE_PATTERN.test(reference)) {
        addFinding(
          "malformed-prerequisite-reference",
          location,
          "Prerequisite reference must use <kind>:<kebab-case-target-id>.",
          { reference },
        );
        return;
      }
      if (seenReferences.has(reference)) {
        addFinding("duplicate-prerequisite", location, `Prerequisite "${reference}" is duplicated.`);
        return;
      }
      seenReferences.add(reference);
      if (reference === key) {
        addFinding("self-prerequisite", location, `Target "${key}" cannot require itself.`);
        return;
      }
      const prerequisite = registry.get(reference);
      if (!prerequisite) {
        addFinding("unresolved-prerequisite", location, `Prerequisite "${reference}" does not resolve.`);
        return;
      }

      adjacency.get(key).push(reference);
      edges += 1;
    });
    adjacency.get(key).sort();
  }

  const cycles = findCycles(keys, adjacency);
  for (const cycle of cycles) {
    addFinding(
      "prerequisite-cycle",
      registry.get(cycle[0]).location,
      "Prerequisite graph contains a cycle.",
      { targets: cycle },
    );
  }

  const rooted = rootedTargets(keys, registry, adjacency);
  for (const key of keys) {
    const target = registry.get(key);
    if (target.fundamental === false && !rooted.has(key)) {
      addFinding(
        "unrooted-dependent",
        target.location,
        `Dependent target "${key}" has no path to a fundamental target.`,
      );
    }
  }

  sortFindings(findings);
  const valid = findings.length === 0;
  return {
    findings,
    dependencies: {
      edges,
      maxDepth: valid ? maximumDepth(keys, registry, adjacency) : null,
      withoutPrerequisites: withoutPrerequisites.sort(),
    },
  };
}
