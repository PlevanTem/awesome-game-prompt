# Awesome Game Prompts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the deployed site and repository README into a Chinese-default, bilingual, copy-first Awesome Game Prompts library.

**Architecture:** Keep the existing Astro static site and prompt-data schema. Add one shared browser localization script and declarative `data-i18n` labels, then extend homepage cards to reveal and copy the source prompts without breaking their existing detail links.

**Tech Stack:** Astro 5, TypeScript, Vitest, Playwright, browser Clipboard API.

**Spec:** `docs/superpowers/specs/2026-08-26-awesome-game-prompts-design.md`

## Global Constraints

- Public-facing branding must be `Awesome Game Prompts`; Chinese is the server-rendered default.
- Prompt text is source data and must never be translated or altered by the UI.
- The site stays static and its generated prompt-data schema stays unchanged.
- All new interaction must be keyboard accessible and tested before production code.
- Do not stage or commit the pre-existing `.gitignore` change.

---

### Task 1: Add regression coverage for the new public identity

**Files:**
- Modify: `tests/about-page.test.ts`, `tests/archive-page.test.ts`, `tests/detail-page.test.ts`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: existing Astro container rendering and Playwright fixture server.
- Produces: failing assertions for new branding, Chinese-first homepage content, card copy/expand controls, and the language switch.

- [ ] **Step 1: Change the page-render tests to expect `Awesome Game Prompts` and Chinese default copy.**
- [ ] **Step 2: Add a failing browser test that opens a homepage prompt, expands it, copies its exact source text, and switches labels to English.**
- [ ] **Step 3: Run `npm run test` and `npm run test:e2e`; confirm failures identify missing new UI.**
- [ ] **Step 4: Do not modify production files until the failures are observed.**

### Task 2: Build the reusable Chinese-default language layer

**Files:**
- Create: `src/scripts/localization.ts`
- Modify: `src/layouts/BaseLayout.astro`, `src/components/SiteHeader.astro`, `src/components/ArchiveControls.astro`
- Test: `tests/about-page.test.ts`, `tests/archive-page.test.ts`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: elements with `data-i18n-zh`, `data-i18n-en`, and optional `data-i18n-aria-*` attributes.
- Produces: `initLocalization()` which applies a saved language, updates `document.documentElement.lang`, and persists `awesome-game-prompts-language`.

- [ ] **Step 1: Implement `initLocalization()` with a strict `zh` fallback and safe `localStorage` access.**
- [ ] **Step 2: Add Chinese default metadata and language-marked labels to shared layout, header, and filters.**
- [ ] **Step 3: Run targeted unit tests and the new language browser test; confirm they pass.**

### Task 3: Expose prompt preview, expansion, and copy on homepage cards

**Files:**
- Modify: `src/components/PromptTile.astro`, `src/styles/global.css`
- Test: `tests/archive-page.test.ts`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: `GeneratedPrompt` with `title`, `prompt`, `attachments`, `categories`, and `slug`.
- Produces: a `data-prompt-tile` card containing an image, short preview, native accessible details control, full verbatim prompt, copy button, and stable detail link.

- [ ] **Step 1: Render a short display-only excerpt and full escaped source prompt in each card.**
- [ ] **Step 2: Add a delegated client copy handler that writes the exact source body and provides localized success/failure feedback.**
- [ ] **Step 3: Add focused card styles without reducing image visibility or breaking responsive layout.**
- [ ] **Step 4: Run unit and browser tests; confirm expanded text and clipboard output equal the original source.**

### Task 4: Apply brand and user-facing copy across pages

**Files:**
- Modify: `src/pages/index.astro`, `src/pages/about.astro`, `src/pages/prompt/[slug].astro`, `src/layouts/BaseLayout.astro`, `src/styles/global.css`
- Test: `tests/about-page.test.ts`, `tests/detail-page.test.ts`, `tests/site.spec.ts`

**Interfaces:**
- Consumes: localization attributes and current static paths.
- Produces: matching Chinese-first public copy and `Awesome Game Prompts` titles on homepage, detail, and About pages.

- [ ] **Step 1: Replace index framing with a concise browse-and-copy value statement.**
- [ ] **Step 2: Simplify About into visitor copy and make the repository link optional rather than build-required.**
- [ ] **Step 3: Localize detail actions and preserve full source prompt and previous/next navigation.**
- [ ] **Step 4: Run targeted rendering tests and browser tests.**

### Task 5: Replace maintenance README with bilingual project landing pages

**Files:**
- Modify: `README.md`
- Create: `README.en.md`

**Interfaces:**
- Consumes: verified generated prompt titles, categories, assets, and stable `/prompt/<slug>/` paths.
- Produces: Chinese and English landing README files with reciprocal language links and source-backed featured prompts.

- [ ] **Step 1: Write Chinese README with project statement, copy-first usage, category list, and selected prompt/effect links.**
- [ ] **Step 2: Write English README with the same structure and scope.**
- [ ] **Step 3: Remove setup, sync, secret, and deployment procedures from both primary readmes.**
- [ ] **Step 4: Run `git diff --check` and manually verify every local README link target.**

### Task 6: Full verification and delivery

**Files:**
- Verify: all modified files

- [ ] **Step 1: Run `npm run test`.**
- [ ] **Step 2: Run `npm run build` with `GITHUB_REPOSITORY_URL` set to a valid public URL.**
- [ ] **Step 3: Run `npm run test:e2e` and inspect the homepage screenshot.**
- [ ] **Step 4: Run `git diff --check` and verify only intended files are staged.**
- [ ] **Step 5: Commit the implementation without `.gitignore`, then push the current branch.**