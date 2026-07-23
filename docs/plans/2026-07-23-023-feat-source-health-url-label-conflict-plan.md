---
title: "feat: Add reverse source conflict reporting in target quest health"
type: feat
status: completed
date: 2026-07-23
---

# URL-to-Multiple-Labels Health Rule

## Summary

Improve quest-health linting by detecting when one source URL is used with
multiple different labels across quest links.

## Problem

The health report currently detects label-name collisions (same label, different
URLs), but it does not report the inverse case: one URL reused with mixed labels.
That makes source cleanup harder when migrating to a source catalog and can reduce
data quality visibility.

## Requirements

- R1: Add a warning in target-quest health output for URLs linked with multiple
  distinct labels.
- R2: Keep the rule stable/sorted so CI output is deterministic.
- R3: Cover the new warning in unit tests.

## Scope

In scope:
- Source usage aggregation logic in `scripts/lib/target-quest-health.mjs`.
- Health tests in `scripts/target-quest-health.test.mjs`.
- Minimal report behavior via existing reporters (automatic through report formatter).

Out of scope:
- Mutating quest source schema or source-library generation.
- UI rendering changes.

## Implementation Units

- U1. Health analysis rule for URL label conflicts

**Goal:** flag a URL with two or more distinct labels in one run.

**Files:**
- Modify: `scripts/lib/target-quest-health.mjs`
- Test: `scripts/target-quest-health.test.mjs`

**Approach:**
- Reuse existing per-URL usage aggregation (`sourceUsage`).
- For each URL entry, track unique labels.
- Emit `url-label-conflict` warning when label count > 1 with deterministic detail
  payload (`url`, `labels`).
- Add unit test fixture assertions for this new rule.

**Verification:**
- `node --test scripts/target-quest-health.test.mjs` passes with the new case.
