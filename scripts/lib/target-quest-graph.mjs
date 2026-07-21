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

function reverseAdjacency(keys, adjacency) {
  const reversed = new Map(keys.map(key => [key, []]));
  for (const key of keys) {
    for (const prerequisite of adjacency.get(key) || []) {
      reversed.get(prerequisite)?.push(key);
    }
  }
  for (const dependents of reversed.values()) dependents.sort();
  return reversed;
}

function findCycles(keys, adjacency) {
  const visited = new Set();
  const finishOrder = [];
  const cycles = [];

  for (const start of keys) {
    if (visited.has(start)) continue;
    visited.add(start);
    const stack = [{ key: start, nextIndex: 0 }];
    while (stack.length > 0) {
      const frame = stack.at(-1);
      const prerequisites = adjacency.get(frame.key) || [];
      if (frame.nextIndex < prerequisites.length) {
        const prerequisite = prerequisites[frame.nextIndex];
        frame.nextIndex += 1;
        if (!visited.has(prerequisite)) {
          visited.add(prerequisite);
          stack.push({ key: prerequisite, nextIndex: 0 });
        }
      } else {
        finishOrder.push(frame.key);
        stack.pop();
      }
    }
  }

  const reversed = reverseAdjacency(keys, adjacency);
  const assigned = new Set();
  for (let index = finishOrder.length - 1; index >= 0; index -= 1) {
    const start = finishOrder[index];
    if (assigned.has(start)) continue;
    const component = [];
    const stack = [start];
    assigned.add(start);
    while (stack.length > 0) {
      const member = stack.pop();
      component.push(member);
      const dependents = reversed.get(member) || [];
      for (let dependentIndex = dependents.length - 1; dependentIndex >= 0; dependentIndex -= 1) {
        const dependent = dependents[dependentIndex];
        if (!assigned.has(dependent)) {
          assigned.add(dependent);
          stack.push(dependent);
        }
      }
    }
    if (component.length > 1) cycles.push(component.sort());
  }
  return cycles.sort((left, right) => left.join("|").localeCompare(right.join("|")));
}

function rootedTargets(keys, registry, adjacency) {
  const reversed = reverseAdjacency(keys, adjacency);
  const rooted = new Set(keys.filter(key => registry.get(key)?.fundamental === true));
  const queue = [...rooted].sort();
  for (let index = 0; index < queue.length; index += 1) {
    for (const dependent of reversed.get(queue[index]) || []) {
      if (rooted.has(dependent)) continue;
      rooted.add(dependent);
      queue.push(dependent);
    }
  }
  return rooted;
}

function maximumDepth(keys, adjacency) {
  const reversed = reverseAdjacency(keys, adjacency);
  const remainingPrerequisites = new Map(
    keys.map(key => [key, (adjacency.get(key) || []).length]),
  );
  const depths = new Map(keys.map(key => [key, 0]));
  const queue = keys.filter(key => remainingPrerequisites.get(key) === 0).sort();
  let maxDepth = 0;
  let processed = 0;

  for (let index = 0; index < queue.length; index += 1) {
    const key = queue[index];
    processed += 1;
    for (const dependent of reversed.get(key) || []) {
      const candidateDepth = depths.get(key) + 1;
      depths.set(dependent, Math.max(depths.get(dependent), candidateDepth));
      maxDepth = Math.max(maxDepth, depths.get(dependent));
      const remaining = remainingPrerequisites.get(dependent) - 1;
      remainingPrerequisites.set(dependent, remaining);
      if (remaining === 0) queue.push(dependent);
    }
  }

  return processed === keys.length ? maxDepth : null;
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
      maxDepth: valid ? maximumDepth(keys, adjacency) : null,
      withoutPrerequisites: withoutPrerequisites.sort(),
    },
  };
}
