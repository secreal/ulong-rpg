---
title: "feat: Generate Export README Link"
type: feat
status: completed
date: 2026-07-22
---

# feat: Generate Export README Link

## Summary

Extend the existing `/ulong` export flow with a guided README create/update action whose generated link points to the current user's GitHub Pages showcase at `https://<username>.github.io/ulong/`.

## Assumptions

*This plan was authored without synchronous user confirmation. These items are implementation choices inferred from the existing export flow.*

- The GitHub username stored in the export profile is the source for the Pages hostname.
- The app cannot write to GitHub without authentication, so the README action copies generated Markdown and opens GitHub's edit/create page for the user to commit.
- A file download remains available automatically only when clipboard access fails.
- The existing `index.html` clipboard and fallback-download behavior remains unchanged.

## Requirements

- R1. Export logic generates Markdown containing a clickable `https://<username>.github.io/ulong/` link for the current profile username.
- R2. The generated README has a concise title derived from the profile display name, with a safe fallback when the name is empty.
- R3. Every export guide variant offers a README action that copies the generated Markdown and opens the correct GitHub edit or create page.
- R4. Existing repositories with a README open the exact API-returned path, URL-encoding each path segment; new, empty, and explicitly README-less repositories open GitHub's create-file page.
- R5. Clipboard failure downloads the generated content as `README.md` instead of losing the export.
- R6. README generation must not hardcode `secreal` or alter the generated showcase `index.html` content.
- R7. The README link retains native `target="_blank"` navigation, and repeated clicks during pending clipboard work cannot start duplicate fallback downloads.

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
- Reuse the existing export-step button styling and attach copy/edit behavior to that action rather than adding a new UI component.
- Preserve the README anchor's native `target="_blank"` navigation; its click handler performs only clipboard and fallback-download work.
- Detect repository and README state through GitHub's public API, retaining the returned README `path` for existing files.
- Use create-file URLs for new or empty repositories and explicit README `404` responses. An unknown repository state shows a retry notice; a transient README-only failure conservatively retains a root `README.md` edit action.
- Encode the branch and every returned README path segment when constructing GitHub URLs.

## Implementation Units

- U1. **Generate username-specific README content**

**Goal:** Produce deterministic Markdown for the exported public repository.

**Requirements:** R1, R2, R6

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

- U2. **Expose README copy-and-edit in every export guide state**

**Goal:** Let users create or update the repository README without manually locating the file or managing downloads during the normal flow.

**Requirements:** R3, R4, R5, R6, R7

**Dependencies:** U1

**Files:**
- Modify: `index.html`
- Test: `scripts/export-readme.test.mjs`

**Approach:**
- Detect new, empty, existing, missing-README, and unknown API states, retaining a custom README path when GitHub returns one.
- Add a README action to the new-repository, empty-repository, and update guide variants using the same generated content and dynamic live URL.
- Let the README anchor open GitHub natively; on click, copy README Markdown and download `README.md` only when clipboard writing fails.
- Guard pending clipboard work so repeated clicks cannot cause duplicate fallback downloads.
- Keep the new-repository instructions consistent: `index.html` initializes the empty repository and the following step creates README, so the repository-creation step does not request GitHub's Add README option.
- Preserve the current automatic navigation to the `index.html` editor.

**Patterns to follow:**
- Existing `makeStep` action link and repository-state branches in `index.html`.

**Test scenarios:**
- Happy path: all 3 repository-state guide branches include a README copy-and-edit action.
- Existing README: the action opens `/edit/<encoded-branch>/<encoded-returned-path>`.
- Missing, new, or empty repository: the action opens `/new/<encoded-branch>`.
- Unknown repository lookup: suppress repository instructions and show a retry notice instead of guessing that the repository is new.
- Transient README-only lookup: an existing nonempty repository retains the conservative root `README.md` edit action.
- Error path: denied clipboard access downloads one `README.md` with MIME type `text/markdown`, even if the action is clicked repeatedly while pending.
- Clipboard success: Markdown is copied without triggering the fallback download.
- Integration: the README action uses the same profile username as the live showcase step.
- Regression: existing index clipboard, fallback download, Pages settings, and live showcase steps remain present.

**Verification:**
- Browser export with a non-owner test username copies dynamic Markdown and opens the correct GitHub README destination.

## System-Wide Impact

- **Interaction graph:** Export button builds showcase HTML and README content, then the existing guide renders both repository actions.
- **Error propagation:** Missing GitHub username continues to use the existing notice and suppresses repository steps.
- **State lifecycle risks:** No new persisted state is introduced.
- **API surface parity:** All repository detection states receive the same README capability.
- **Integration coverage:** Browser testing verifies generated content plus edit, create, and clipboard-fallback behavior.
- **Unchanged invariants:** Exported showcase HTML and existing localStorage data remain unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Markdown title contains line breaks from profile input | Normalize title text to one line before generation. |
| Repository or README API ambiguity selects the wrong action | Unit-test existing custom paths, explicit 404, empty, new, and unknown states. |
| Repeated clicks race clipboard fallback | Keep pending state in the action handler and unit-test a rejected delayed write. |
| Generated link uses the developer's username | Derive the hostname only from `prof.github` and test with a different username. |

## Documentation / Operational Notes

- No deployment configuration or migration is required.
- The extra README step should use the existing export-guide visual language; UI redesign remains outside scope.

## Sources & References

- Related code: `index.html`
- Existing tests: `scripts/target-quest-health.test.mjs`
- GitHub README documentation: `https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes`
