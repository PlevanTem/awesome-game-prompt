# Game Art Prompt Archive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and publish Prompt Forge, a fast static archive for sharing game-art prompts from a Feishu Base on GitHub Pages.

**Architecture:** An Astro static site reads a generated JSON dataset and locally downloaded Feishu attachment images. A local owner-only sync command uses `lark-cli` before publishing; the deployed browser never calls Feishu and never receives credentials. Astro renders the archive and one page per prompt at build time; small vanilla browser scripts handle category filtering, random navigation, image switching, and copying.

**Tech Stack:** Astro, TypeScript, plain CSS, Vitest, Playwright, Node.js 22, GitHub Actions, GitHub Pages, local `lark-cli`.

**Spec:** `docs/superpowers/specs/2026-08-18-game-art-prompt-archive-design.md`

## Global Constraints

- Use only the current Base fields: `Text`, `类型`, `Prompt`, and `Attachment`; do not modify the Base schema.
- Preserve each Prompt exactly as authored; never translate, normalize, or rewrite its text.
- Feishu is the sole editing source; GitHub stores generated static data and attachment images only.
- Do not expose Feishu credentials, user tokens, Base identifiers, or `lark-cli` calls to the browser or GitHub Actions.
- No accounts, comments, likes, prompt builder, online generation, payments, embedded Feishu views, analytics, or search in the first release.
- Use real Attachment images in production. Use a deliberate graphic fallback only when a source record has no attachment.
- Preserve the selected Production Index visual system: `#E9E8E0`, `#171814`, `#E55330`, and `#C9FF3E`; square borders; no gradients, glass effects, soft card UI, or generic AI stock art.
- Generate static routes `/`, `/prompt/[slug]/`, and `/about/`; deploy only `dist/` to GitHub Pages.

---

## Planned File Structure

```text
.
├── .github/workflows/deploy.yml                 # GitHub Pages build and deployment
├── .env.example                                 # Required local sync variable names only
├── astro.config.mjs                             # Static-output and GitHub Pages base path
├── package.json                                 # Scripts and dependencies
├── playwright.config.ts                         # Browser test server and viewports
├── scripts/sync-feishu.mjs                      # Owner-only Feishu export entry point
├── src/
│   ├── components/
│   │   ├── ArchiveControls.astro                # Category filter and random button
│   │   ├── PromptGallery.astro                  # Attachment gallery and image switching
│   │   ├── PromptTile.astro                     # Homepage visual tile
│   │   └── SiteHeader.astro                     # Shared Prompt Forge header
│   ├── data/
│   │   ├── categories.ts                        # Base category-to-label mapping
│   │   ├── prompt.ts                            # Record validation, slug, asset path helpers
│   │   └── types.ts                             # PromptRecord and GeneratedPrompt contracts
│   ├── generated/prompts.json                   # Sync output committed for static builds
│   ├── layouts/BaseLayout.astro                 # Global metadata, header, CSS import
│   ├── pages/
│   │   ├── about.astro                          # Scope and source statement
│   │   ├── index.astro                          # Archive index
│   │   └── prompt/[slug].astro                  # Static prompt detail route
│   └── styles/global.css                         # Production Index tokens and responsive rules
├── public/generated/prompt-assets/              # Sync output, committed Attachment images
├── tests/
│   ├── fixtures/base-records.json                # Sanitized Base API response fixture
│   ├── prompt.test.ts                            # Mapping and slug unit tests
│   ├── sync-feishu.test.ts                       # Sync failure and atomic-write tests
│   ├── archive-page.test.ts                       # Static archive render test
│   ├── detail-page.test.ts                        # Static detail render test
│   ├── about-page.test.ts                         # Supported-claim test
│   ├── deploy-workflow.test.ts                    # Pages workflow content test
│   └── site.spec.ts                              # Playwright interaction and screenshot tests
└── README.md                                     # Local sync, development, and GitHub Pages guide
```

## Data Contracts

```ts
// src/data/types.ts
export type BaseAttachment = {
  fileToken: string;
  name: string;
};

export type BasePromptRecord = {
  recordId: string;
  title: string;
  categories: string[];
  prompt: string;
  attachments: BaseAttachment[];
};

export type GeneratedPrompt = {
  id: string;
  slug: string;
  title: string;
  categories: string[];
  prompt: string;
  attachments: string[];
};
```

`attachments` contains site-root paths such as `/generated/prompt-assets/rec123-0.png`. The first path is the card preview. `slug` is generated as `<normalized-title>-<last-6-record-id-characters>` and is never written back to Feishu.

## Task 1: Create the Static Astro Foundation

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Create: `src/pages/index.astro`
- Create: `src/styles/global.css`
- Create: `.env.example`

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run test`, and `npm run test:e2e`.
- Produces: an Astro project that respects `BASE_PATH` when deployed below a GitHub Pages repository path.

- [ ] **Step 1: Initialize Astro with strict TypeScript and install test tooling**

Run:

```bash
npm create astro@latest . -- --template minimal --typescript strict --no-install
npm install
npm install -D vitest @playwright/test
npx playwright install --with-deps chromium
```

Keep existing `.gitignore` and the design documents. Do not overwrite `.agents/` or `skills-lock.json`.

- [ ] **Step 2: Configure static output and repository-relative deployment paths**

Create `astro.config.mjs` with this behavior:

```ts
import { defineConfig } from 'astro/config';

const base = process.env.BASE_PATH || '/';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://example.github.io',
  base,
});
```

Add the following scripts to `package.json`:

```json
{
  "dev": "astro dev",
  "build": "astro build",
  "preview": "astro preview",
  "test": "vitest run",
  "test:e2e": "playwright test",
  "sync:feishu": "node scripts/sync-feishu.mjs"
}
```

- [ ] **Step 3: Add a temporary static smoke page and global reset**

Use `src/pages/index.astro` to render `<h1>Prompt Forge</h1>` and import `src/styles/global.css`. In the CSS, set `box-sizing: border-box`, remove default body margin, and use `#E9E8E0` as the page background.

- [ ] **Step 4: Verify the foundation builds**

Run:

```bash
npm run build
```

Expected: Astro exits with code `0` and writes `dist/index.html`.

- [ ] **Step 5: Commit the foundation**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json src .env.example
git commit -m "feat: scaffold static prompt archive"
```

## Task 2: Define and Test Prompt Mapping

**Files:**
- Create: `src/data/types.ts`
- Create: `src/data/categories.ts`
- Create: `src/data/prompt.ts`
- Create: `tests/fixtures/base-records.json`
- Create: `tests/prompt.test.ts`

**Interfaces:**
- Consumes: raw Base row values and field names from the sync command.
- Produces: `toGeneratedPrompt(record: BasePromptRecord): GeneratedPrompt` and `makeSlug(title: string, recordId: string): string`.

- [ ] **Step 1: Write failing mapping and slug tests**

Create `tests/prompt.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { makeSlug, toGeneratedPrompt } from '../src/data/prompt';

describe('makeSlug', () => {
  it('keeps Chinese titles routable and adds an ID suffix', () => {
    expect(makeSlug('经典四视图', 'recvs8dvb0F3Js')).toBe('prompt-b0f3js');
  });
});

describe('toGeneratedPrompt', () => {
  it('preserves original prompt text and maps attachment paths', () => {
    const result = toGeneratedPrompt({
      recordId: 'recvs8dvb0F3Js',
      title: '经典四视图',
      categories: ['角色设计'],
      prompt: '四宫格输出前、左、后、右四个正交视角。',
      attachments: [{ fileToken: 'fileA', name: 'image.png' }],
    });

    expect(result.prompt).toBe('四宫格输出前、左、后、右四个正交视角。');
    expect(result.attachments).toEqual([
      '/generated/prompt-assets/recvs8dvb0f3js-0.png',
    ]);
  });
});
```

- [ ] **Step 2: Run the focused test and confirm it fails**

Run:

```bash
npx vitest run tests/prompt.test.ts
```

Expected: FAIL because `src/data/prompt.ts` does not exist.

- [ ] **Step 3: Implement the exact data contracts and helpers**

`makeSlug` must use the ASCII word `prompt` plus the lower-cased record ID when the title has no Latin letters. `toGeneratedPrompt` must trim only the title, keep `prompt` byte-for-byte unchanged, and generate asset paths with `path.extname(attachment.name).toLowerCase() || '.bin'`.

Create `src/data/categories.ts` with this mapping:

```ts
export const categoryLabels: Record<string, string> = {
  '角色设计': 'CHARACTER DESIGN',
  '场景设计': 'ENVIRONMENT',
  '原画设计': 'CONCEPT ART',
  'UI/UX 美术': 'UI / UX',
  '动画与特效': 'VFX',
  '3D建模/贴图/渲染': '3D',
};
```

- [ ] **Step 4: Add validation tests for source gaps**

Add tests that `toGeneratedPrompt` throws `Missing title for record <id>` when title is blank and `Missing prompt for record <id>` when prompt is blank. Add a test that an empty attachment list is valid and returns `attachments: []`.

- [ ] **Step 5: Run all mapping tests**

Run:

```bash
npm run test -- tests/prompt.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit data mapping**

```bash
git add src/data tests/fixtures/base-records.json tests/prompt.test.ts
git commit -m "feat: add prompt data mapping"
```

## Task 3: Build the Owner-Only Feishu Sync Pipeline

**Files:**
- Create: `scripts/sync-feishu.mjs`
- Create: `tests/sync-feishu.test.ts`
- Create: `src/generated/prompts.json`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `FEISHU_BASE_TOKEN`, `FEISHU_TABLE_ID`, a logged-in local `lark-cli`, and the four permitted Base fields.
- Produces: `src/generated/prompts.json` and `public/generated/prompt-assets/*` atomically.
- Exposes: `syncBase(options: SyncOptions): Promise<GeneratedPrompt[]>` from the script module for tests.

- [ ] **Step 1: Write a failing atomic-sync test**

Create a fake command runner that returns one valid record and one attachment download failure. In `tests/sync-feishu.test.ts`, assert that the existing dataset remains unchanged:

```ts
await expect(syncBase({ runner, outputDir, dataFile })).rejects.toThrow(
  'Attachment download failed for rec-failed/file-bad',
);
expect(await readFile(dataFile, 'utf8')).toBe(existingDataset);
```

- [ ] **Step 2: Run the focused sync test and confirm it fails**

Run:

```bash
npx vitest run tests/sync-feishu.test.ts
```

Expected: FAIL because the sync module does not exist.

- [ ] **Step 3: Implement Base record export without shell interpolation**

Use `node:child_process` `execFile`, never `exec`, and use `lark-cli.cmd` on Windows and `lark-cli` elsewhere. Fetch data through:

```text
lark-cli base +record-list --base-token <env token> --table-id <env table> --field-id Text --field-id 类型 --field-id Prompt --field-id Attachment --limit 2000 --format json --as user
```

Parse only successful JSON envelopes where `ok === true`. Convert row values to `BasePromptRecord`; do not invent model, date, author, or quality fields.

- [ ] **Step 4: Implement attachment staging and atomic publish**

For each attachment call `lark-cli base +record-download-attachment` with its exact `recordId` and `fileToken`, writing to a fresh temporary directory inside `public/generated/`. On success, replace the old `prompt-assets` directory and write `prompts.json` to a temporary file before renaming it into `src/generated/prompts.json`. On any error, remove only the temporary directory and leave the current generated files untouched.

- [ ] **Step 5: Add local environment documentation**

Set `.env.example` to exactly:

```dotenv
FEISHU_BASE_TOKEN=
FEISHU_TABLE_ID=
```

Do not commit `.env` or `.env.local`. The values are entered only in the owner machine's local environment.

- [ ] **Step 6: Run sync tests and one real local dry export**

Run:

```bash
npm run test -- tests/sync-feishu.test.ts
npm run sync:feishu
```

Expected: test passes; the local export produces valid JSON and local attachment assets. If the CLI lacks user authorization, stop and complete the Feishu authorization flow before retrying; do not replace data with an empty dataset.

- [ ] **Step 7: Commit generated archive data and sync pipeline**

```bash
git add scripts/sync-feishu.mjs src/generated/prompts.json public/generated/prompt-assets .env.example tests/sync-feishu.test.ts
git commit -m "feat: sync prompts from Feishu Base"
```

## Task 4: Implement the Production Index Archive Page

**Files:**
- Create: `src/layouts/BaseLayout.astro`
- Create: `src/components/SiteHeader.astro`
- Create: `src/components/PromptTile.astro`
- Create: `src/components/ArchiveControls.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/global.css`

**Interfaces:**
- Consumes: `GeneratedPrompt[]` from `src/generated/prompts.json` and `categoryLabels`.
- Produces: a static archive grid where every tile links to `/prompt/<slug>/`.

- [ ] **Step 1: Write a failing archive-render test**

Add an Astro page fixture or server-render test that imports the generated fixture and asserts that `经典四视图`, `/prompt/prompt-b0f3js/`, and `CHARACTER DESIGN` appear in the generated homepage HTML.

- [ ] **Step 2: Run the archive test and confirm it fails**

Run:

```bash
npx vitest run tests/archive-page.test.ts
```

Expected: FAIL because the archive components do not exist.

- [ ] **Step 3: Implement the shared header and index grid**

Render the header as `PROMPT FORGE / 001`, `ARCHIVE`, `ABOUT`, and `EN / 中文`. Render the main heading exactly as `GAME ART PROMPTS, INDEXED.`. Use the first attachment as the tile image. A no-attachment record uses a typography-only tile with the category color, never a stock image.

- [ ] **Step 4: Implement browser-only category filtering and random navigation**

`ArchiveControls.astro` must render buttons with `data-category` values. An inline module toggles a tile's `hidden` attribute based on its `data-categories` string. The random button chooses from currently visible tile links and sets `window.location.href` to the chosen href. If no tile is visible, disable the random button.

- [ ] **Step 5: Apply the Production Index styles**

Implement CSS grid columns with a minimum tile width of `220px`, responsive image aspect ratios, square control borders, and visible keyboard focus rings. Use only the approved colors. Do not use `linear-gradient`, `radial-gradient`, `backdrop-filter`, or rounded card corners.

- [ ] **Step 6: Run archive tests and build**

Run:

```bash
npx vitest run tests/archive-page.test.ts
npm run build
```

Expected: both exit with code `0`; `dist/index.html` contains static tile links.

- [ ] **Step 7: Commit the archive page**

```bash
git add src/layouts src/components src/pages/index.astro src/styles tests/archive-page.test.ts
git commit -m "feat: add production index archive"
```

## Task 5: Implement Static Prompt Detail Routes

**Files:**
- Create: `src/components/PromptGallery.astro`
- Create: `src/pages/prompt/[slug].astro`
- Create: `tests/detail-page.test.ts`

**Interfaces:**
- Consumes: one `GeneratedPrompt`, its archive index, and neighboring prompts.
- Produces: one static page per `slug` with a gallery, original Prompt, copy control, and previous/next navigation.

- [ ] **Step 1: Write failing detail route tests**

Create tests that build routes from a fixture with two prompts and assert:

```ts
expect(detailHtml).toContain('ORIGINAL PROMPT');
expect(detailHtml).toContain('四宫格输出前、左、后、右四个正交视角。');
expect(detailHtml).toContain('COPY PROMPT +');
expect(detailHtml).toContain('/prompt/prompt-rec-next/');
```

- [ ] **Step 2: Run the detail test and confirm it fails**

Run:

```bash
npx vitest run tests/detail-page.test.ts
```

Expected: FAIL because the dynamic route and gallery do not exist.

- [ ] **Step 3: Implement `getStaticPaths` and data lookup**

In `[slug].astro`, import `prompts.json`, create one path per prompt, and pass the prompt index as a prop. Unknown slugs are not generated and therefore resolve through the host's static 404 behavior. Do not call Feishu or `lark-cli` in Astro pages.

- [ ] **Step 4: Implement the attachment gallery and exact Prompt rendering**

`PromptGallery.astro` renders the first attachment in an `<img>` with the prompt title as `alt`. For more than one attachment, render one button per image with `aria-label="Show image N"`; an inline script updates the image `src` and `aria-pressed`. Render the original Prompt in a `<pre>` element without trimming or formatting it.

- [ ] **Step 5: Implement copy and neighbors**

The copy button must call `navigator.clipboard.writeText(promptText)`. On success, change its label to `COPIED`; on failure, change it to `SELECT TEXT` and keep the `<pre>` selectable. Render previous/next links only when the corresponding prompt exists.

- [ ] **Step 6: Run detail tests and build**

Run:

```bash
npx vitest run tests/detail-page.test.ts
npm run build
```

Expected: PASS and one HTML file is emitted for each generated prompt.

- [ ] **Step 7: Commit prompt details**

```bash
git add src/components/PromptGallery.astro src/pages/prompt tests/detail-page.test.ts
git commit -m "feat: add static prompt detail pages"
```

## Task 6: Add About Page and Repository Documentation

**Files:**
- Create: `src/pages/about.astro`
- Create: `README.md`
- Modify: `src/layouts/BaseLayout.astro`

**Interfaces:**
- Produces: a concise public explanation and exact local publishing instructions.

- [ ] **Step 1: Write a failing about-page content test**

Assert that the rendered About page includes `Prompt Forge`, `Feishu Base`, and `GitHub` and does not include claims such as `tested`, `best`, `marketplace`, or `community`.

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npx vitest run tests/about-page.test.ts
```

Expected: FAIL because `about.astro` does not exist.

- [ ] **Step 3: Implement About with only supported claims**

Explain that Prompt Forge is a personal archive of game-art prompts, authored and maintained in a Feishu Base, exported as a static site, and open-source on GitHub. Do not state or imply that every prompt is model-specific or quality-tested.

- [ ] **Step 4: Write the README operating guide**

Include these exact commands and their purposes:

```bash
npm install
cp .env.example .env.local
npm run sync:feishu
npm run dev
npm run test
npm run test:e2e
npm run build
```

Explain that the user must set `FEISHU_BASE_TOKEN` and `FEISHU_TABLE_ID` locally and have authenticated `lark-cli`; `.env.local` must never be committed. Include the update workflow: edit Base, run sync, review generated content, test, commit, push.

- [ ] **Step 5: Run About tests and build**

Run:

```bash
npx vitest run tests/about-page.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit public documentation**

```bash
git add src/pages/about.astro src/layouts/BaseLayout.astro README.md tests/about-page.test.ts
git commit -m "docs: explain archive source and publishing"
```

## Task 7: Verify Browser Interactions and Responsive Rendering

**Files:**
- Create: `playwright.config.ts`
- Create: `tests/site.spec.ts`
- Modify: `package.json`

**Interfaces:**
- Consumes: the built Astro application.
- Produces: automated evidence for filtering, random navigation, copying, gallery controls, and mobile/desktop layout.

- [ ] **Step 1: Write failing Playwright specifications**

Create `tests/site.spec.ts` with these cases:

```ts
test('filters to the selected category', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'CHARACTERS' }).click();
  await expect(page.locator('[data-prompt-tile]:visible')).toHaveCount(1);
});

test('copies the exact original prompt', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/prompt/prompt-b0f3js/');
  await page.getByRole('button', { name: 'COPY PROMPT +' }).click();
  await expect(page.getByRole('button', { name: 'COPIED' })).toBeVisible();
});
```

- [ ] **Step 2: Run Playwright and confirm the new cases fail before final selectors are added**

Run:

```bash
npx playwright test tests/site.spec.ts
```

Expected: FAIL until the archive and detail components expose the tested accessible names and `data-prompt-tile` attribute.

- [ ] **Step 3: Add only the required semantic hooks**

Add `data-prompt-tile` to each archive article, use actual `<button>` elements for controls, and ensure the selected filter has `aria-pressed="true"`. Do not add hidden duplicate controls only to satisfy tests.

- [ ] **Step 4: Add desktop and mobile screenshot assertions**

Use one `1440x1000` viewport and one `390x844` viewport. Capture homepage and detail page screenshots into Playwright's test output. Assert that the primary attachment image is visible and the `COPY PROMPT +` button is within the viewport after loading the detail page.

- [ ] **Step 5: Run all test and build gates**

Run:

```bash
npm run test
npm run test:e2e
npm run build
```

Expected: all commands exit with code `0`.

- [ ] **Step 6: Commit verification coverage**

```bash
git add playwright.config.ts tests package.json package-lock.json src
git commit -m "test: cover archive interactions and responsive layout"
```

## Task 8: Configure GitHub Pages Deployment

**Files:**
- Create: `.github/workflows/deploy.yml`
- Modify: `README.md`

**Interfaces:**
- Consumes: committed static dataset and attachment assets.
- Produces: GitHub Pages deployment from `dist/` on pushes to `master`.

- [ ] **Step 1: Write a workflow content check**

Create `tests/deploy-workflow.test.ts` that reads `.github/workflows/deploy.yml` and asserts the workflow includes `actions/configure-pages`, `actions/upload-pages-artifact`, `actions/deploy-pages`, `npm run test`, `npm run test:e2e`, and `npm run build`.

- [ ] **Step 2: Run the test and confirm it fails**

Run:

```bash
npx vitest run tests/deploy-workflow.test.ts
```

Expected: FAIL because the workflow file does not exist.

- [ ] **Step 3: Implement the GitHub Pages workflow**

Create a `push` workflow for `master` with `pages: write`, `id-token: write`, and `contents: read` permissions. Set Node to `22`, run `npm ci`, `npm run test`, `npx playwright install --with-deps chromium`, `npm run test:e2e`, then `BASE_PATH=/${{ github.event.repository.name }} npm run build`. Upload `./dist` and deploy it using the official Pages actions. Do not run `sync:feishu` in CI.

- [ ] **Step 4: Update README deployment instructions**

Document these one-time repository settings: push the repository to GitHub, open **Settings > Pages**, select **GitHub Actions** as the source, and use the deployed Pages URL shown by the workflow. State that content changes require a local Feishu sync followed by review, tests, commit, and push.

- [ ] **Step 5: Run final local verification**

Run:

```bash
npm run test
npm run test:e2e
BASE_PATH=/prompt-forge npm run build
```

Expected: all checks pass and links in `dist/` include `/prompt-forge/`.

- [ ] **Step 6: Commit deployment configuration**

```bash
git add .github/workflows/deploy.yml README.md tests/deploy-workflow.test.ts
git commit -m "ci: deploy prompt archive to GitHub Pages"
```

## Final Acceptance Check

- [ ] Run `git status --short` and confirm no `.env`, `.env.local`, `.superpowers`, or temporary sync directory is staged.
- [ ] Run `npm run test`, `npm run test:e2e`, and `npm run build` one final time.
- [ ] Confirm the public build has no `lark-cli`, Feishu token, user token, or raw local file path in `dist/` with:

```bash
rg -n "lark-cli|FEISHU_BASE_TOKEN|FEISHU_TABLE_ID|C:\\Users" dist
```

- [ ] Open the deployed GitHub Pages URL on desktop and mobile. Confirm a real Attachment is visible on both the homepage and a detail route, category filtering works, and copying retains the original Prompt text.
