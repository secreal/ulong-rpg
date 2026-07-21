---
title: "feat: Generate Export README Link"
type: feat
status: completed
date: 2026-07-22
---

# feat: Generate Export README Link

## Summary

Extend the existing `/ulong` export flow with a downloadable `README.md` whose link points to the current user's GitHub Pages showcase at `https://<username>.github.io/ulong/`.

## Assumptions

*This plan was authored without synchronous user confirmation. These items are implementation choices inferred from the existing export flow.*

- The GitHub username stored in the export profile is the source for the Pages hostname.
- The app cannot write to GitHub without authentication, so the README is provided as a download within the existing export guide.
- The existing `index.html` clipboard and fallback-download behavior remains unchanged.

## Requirements

- R1. Export logic generates Markdown containing a clickable `https://<username>.github.io/ulong/` link for the current profile username.
- R2. The generated README has a concise title derived from the profile display name, with a safe fallback when the name is empty.
- R3. Every export guide variant offers the generated file as `README.md` and explains that it belongs in the repository root.
- R4. README generation must not hardcode `secreal` or alter the generated showcase `index.html` content.

## Scope Boundaries

- Do not authenticate with GitHub or push files automatically.
- Do not redesign the export modal or its step component.
- Do not change GitHub Pages setup, repository detection, or showcase rendering.
- Do not modify equipment, talent, skill, or quest data.

## Context & Research

### Relevant Code and Patterns

- `index.html` contains `buildExportHTML`, `triggerDownload`, `makeStep`, and the repository-state-specific export guide.
- The guide already derives `liveUrl` from `prof.github` and renders action links through `makeStep`.
- GitHub documents that a root README is shown on the repository landing page and that files can be uploaded through its web interface.

### External References

- GitHub Docs: `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes`
- GitHub Docs: `https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository`

## Key Technical Decisions

- Generate the README locally as plain Markdown from profile data; no network call is needed.
- Reuse the existing export-step button styling by extending `makeStep` with an optional download filename rather than adding a new UI component.
- Encode README content in a download URL created for the current export operation.

## Implementation Units

- U1. **Generate username-specific README content**

**Goal:** Produce deterministic Markdown for the exported public repository.

**Requirements:** R1, R2, R4

**Dependencies:** None

**Files:**
- Modify: `index.html`
- Create: `scripts/export-readme.test.mjs`

**Approach:**
- Add a pure helper that normalizes single-line display text, uses the profile username for the Pages URL, and returns the README Markdown.
- Keep the helper independent from DOM and storage so its output can be tested directly.

**Patterns to follow:**
- Existing profile fallbacks in `generateShowcaseHTML`.
- Existing Node test style under `scripts/*.test.mjs`.

**Test scenarios:**
- Happy path: username `budi` and display name `Budi` produce a link to `https://budi.github.io/ulong/` and never mention `secreal`.
- Edge case: an empty display name falls back to the GitHub username in the README title.
- Edge case: line breaks in display text are collapsed so they cannot break the Markdown structure.

**Verification:**
- The generated Markdown contains exactly the profile-specific Pages destination and a readable title.

- U2. **Expose README download in every export guide state**

**Goal:** Let users place the generated README in the root of new, empty, or existing `/ulong` repositories.

**Requirements:** R3, R4

**Dependencies:** U1

**Files:**
- Modify: `index.html`
- Test: `scripts/export-readme.test.mjs`

**Approach:**
- Extend the existing step renderer to support a filename-bearing download link.
- Add a README step to the new-repository, empty-repository, and update guide variants using the same generated content and dynamic live URL.
- Preserve the current automatic navigation to the `index.html` editor.

**Patterns to follow:**
- Existing `makeStep` action link and repository-state branches in `index.html`.

**Test scenarios:**
- Happy path: all 3 repository-state guide branches include a `README.md` download action.
- Integration: the README action uses the same profile username as the live showcase step.
- Regression: existing index clipboard, fallback download, Pages settings, and live showcase steps remain present.

**Verification:**
- Browser export with a non-owner test username exposes a `README.md` download whose content links to that username's GitHub Pages URL.

## System-Wide Impact

- **Interaction graph:** Export button builds showcase HTML and README content, then the existing guide renders both repository actions.
- **Error propagation:** Missing GitHub username continues to use the existing notice and suppresses repository steps.
- **State lifecycle risks:** No new persisted state is introduced.
- **API surface parity:** All repository detection states receive the same README capability.
- **Integration coverage:** Browser testing verifies generated content and the download filename.
- **Unchanged invariants:** Exported showcase HTML and existing localStorage data remain unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Markdown title contains line breaks from profile input | Normalize title text to one line before generation. |
| One repository-state branch misses the new action | Cover all 3 branches in a structural test and browser-check representative flows. |
| Generated link uses the developer's username | Derive the hostname only from `prof.github` and test with a different username. |

## Documentation / Operational Notes

- No deployment configuration or migration is required.
- The extra README step should use the existing export-guide visual language; UI redesign remains outside scope.

## Sources & References

- Related code: `index.html`
- Existing tests: `scripts/target-quest-health.test.mjs`
- GitHub README documentation: `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes`
