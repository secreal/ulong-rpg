const BRIDGE_VERSION = 1;
const FORBIDDEN_PATH_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

const CAPABILITIES = Object.freeze([
  { name: "list_capabilities", description: "Discover bridge primitives and registered resources." },
  { name: "get_context", description: "Read bounded dynamic application context and the current revision." },
  { name: "read_resource", description: "Read a deep-cloned snapshot of one registered resource." },
  { name: "set_value", description: "Create or update one nested JSON value using an exact revision." },
  { name: "delete_value", description: "Delete one nested JSON value using an exact revision." },
  { name: "complete_task", description: "Explicitly signal that the requested outcome is complete." },
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function validateJsonValue(value, seen = new WeakSet(), location = "value") {
  if (value === null || typeof value === "string" || typeof value === "boolean") return;
  if (typeof value === "number") {
    if (!Number.isFinite(value)) throw new TypeError(`${location} must contain finite numbers.`);
    return;
  }
  if (typeof value !== "object") throw new TypeError(`${location} must be JSON-compatible.`);
  if (seen.has(value)) throw new TypeError(`${location} must not contain cycles.`);
  seen.add(value);

  if (Array.isArray(value)) {
    value.forEach((item, index) => validateJsonValue(item, seen, `${location}[${index}]`));
  } else {
    if (!isPlainObject(value)) throw new TypeError(`${location} must contain only plain objects and arrays.`);
    for (const [key, item] of Object.entries(value)) {
      if (FORBIDDEN_PATH_SEGMENTS.has(key)) throw new TypeError(`${location} contains an unsafe key.`);
      validateJsonValue(item, seen, `${location}.${key}`);
    }
  }
  seen.delete(value);
}

function cloneJson(value, location = "value") {
  validateJsonValue(value, new WeakSet(), location);
  return structuredClone(value);
}

function normalizePath(path) {
  if (!Array.isArray(path) || path.length === 0) {
    throw new TypeError("path must be a non-empty array; root mutation is not supported.");
  }
  return path.map((segment, index) => {
    const validString = typeof segment === "string" && segment.length > 0;
    const validIndex = Number.isInteger(segment) && segment >= 0;
    if (!validString && !validIndex) throw new TypeError(`path[${index}] must be a non-empty string or non-negative integer.`);
    if (typeof segment === "string" && FORBIDDEN_PATH_SEGMENTS.has(segment)) {
      throw new TypeError(`path[${index}] contains an unsafe key.`);
    }
    return segment;
  });
}

function assertSegmentMatchesContainer(container, segment, location) {
  if (Array.isArray(container) && !Number.isInteger(segment)) {
    throw new TypeError(`${location} must use a numeric array index.`);
  }
  if (isPlainObject(container) && typeof segment !== "string") {
    throw new TypeError(`${location} must use a string object key.`);
  }
  if (!Array.isArray(container) && !isPlainObject(container)) {
    throw new TypeError(`${location} is not a JSON container.`);
  }
}

function resolveParent(root, path, createMissing) {
  let current = root;
  for (let index = 0; index < path.length - 1; index += 1) {
    const segment = path[index];
    assertSegmentMatchesContainer(current, segment, `path[${index}]`);

    if (Array.isArray(current) && segment > current.length) {
      throw new RangeError(`path[${index}] would create a sparse array.`);
    }

    if (current[segment] === undefined) {
      if (!createMissing) throw new Error(`path does not exist at segment ${index}.`);
      const nextSegment = path[index + 1];
      current[segment] = Number.isInteger(nextSegment) ? [] : {};
    }
    current = current[segment];
  }
  return current;
}

function setAtPath(root, path, value) {
  const parent = resolveParent(root, path, true);
  const finalSegment = path.at(-1);
  assertSegmentMatchesContainer(parent, finalSegment, `path[${path.length - 1}]`);
  if (Array.isArray(parent) && finalSegment > parent.length) {
    throw new RangeError(`path[${path.length - 1}] would create a sparse array.`);
  }
  parent[finalSegment] = value;
}

function deleteAtPath(root, path) {
  const parent = resolveParent(root, path, false);
  const finalSegment = path.at(-1);
  assertSegmentMatchesContainer(parent, finalSegment, `path[${path.length - 1}]`);
  if (Array.isArray(parent)) {
    if (finalSegment >= parent.length) throw new Error("path does not exist.");
    parent.splice(finalSegment, 1);
    return;
  }
  if (!Object.hasOwn(parent, finalSegment)) throw new Error("path does not exist.");
  delete parent[finalSegment];
}

function validateResources(resources) {
  if (!isPlainObject(resources) || Object.keys(resources).length === 0) {
    throw new TypeError("resources must contain at least one adapter.");
  }
  for (const [name, adapter] of Object.entries(resources)) {
    if (!name || FORBIDDEN_PATH_SEGMENTS.has(name)) throw new TypeError(`Invalid resource name: ${name}`);
    if (!isPlainObject(adapter) || typeof adapter.read !== "function" || typeof adapter.write !== "function") {
      throw new TypeError(`Resource ${name} must provide read and write functions.`);
    }
  }
}

export function createAgentBridge({ resources, contextProvider = () => ({}), emit = () => {} } = {}) {
  validateResources(resources);
  if (typeof contextProvider !== "function") throw new TypeError("contextProvider must be a function.");
  if (typeof emit !== "function") throw new TypeError("emit must be a function.");

  const resourceNames = Object.keys(resources).sort();
  let revision = 0;

  function getAdapter(resource) {
    if (typeof resource !== "string" || !Object.hasOwn(resources, resource)) {
      throw new Error(`Unknown resource: ${String(resource)}`);
    }
    return resources[resource];
  }

  function assertRevision(expectedRevision) {
    if (!Number.isInteger(expectedRevision) || expectedRevision < 0) {
      throw new TypeError("expectedRevision must be a non-negative integer.");
    }
    if (expectedRevision !== revision) {
      throw new Error(`Stale revision: expected ${revision}, received ${expectedRevision}. Read context again before writing.`);
    }
  }

  function listCapabilities() {
    return {
      version: BRIDGE_VERSION,
      revision,
      capabilities: CAPABILITIES.map(capability => ({ ...capability })),
      resources: [...resourceNames],
    };
  }

  async function getContext() {
    const dynamicContext = await contextProvider({ revision, resources: [...resourceNames] });
    const context = isPlainObject(dynamicContext) ? cloneJson(dynamicContext, "context") : {};
    return {
      bridgeVersion: BRIDGE_VERSION,
      revision,
      capabilities: CAPABILITIES.map(capability => capability.name),
      resources: [...resourceNames],
      ...context,
      revision,
    };
  }

  function readResource({ resource } = {}) {
    return cloneJson(getAdapter(resource).read(), `resource ${resource}`);
  }

  function commitMutation(operation, { resource, path, expectedRevision, value }) {
    assertRevision(expectedRevision);
    const adapter = getAdapter(resource);
    const normalizedPath = normalizePath(path);
    const nextState = cloneJson(adapter.read(), `resource ${resource}`);

    if (operation === "set") {
      setAtPath(nextState, normalizedPath, cloneJson(value));
    } else {
      deleteAtPath(nextState, normalizedPath);
    }

    validateJsonValue(nextState, new WeakSet(), `resource ${resource}`);
    adapter.write(nextState);
    const previousRevision = revision;
    revision += 1;
    const detail = {
      operation,
      resource,
      path: [...normalizedPath],
      previousRevision,
      revision,
    };
    emit("ulong:agent-state-change", detail);
    return { status: "applied", ...detail };
  }

  function completeTask({ summary } = {}) {
    if (typeof summary !== "string" || !summary.trim()) throw new TypeError("summary is required.");
    const detail = { revision, summary: summary.trim() };
    emit("ulong:agent-complete", detail);
    return { status: "complete", ...detail };
  }

  return Object.freeze({
    list_capabilities: listCapabilities,
    get_context: getContext,
    read_resource: readResource,
    set_value: input => commitMutation("set", input || {}),
    delete_value: input => commitMutation("delete", input || {}),
    complete_task: completeTask,
  });
}
