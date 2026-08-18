# Task 5 Report: Static Prompt Detail Routes

## Changed Files

- `src/components/PromptGallery.astro`: Attachment preview, accessible image-switch buttons, and client-side image switching.
- `src/pages/prompt/[slug].astro`: Static route generation, prompt detail rendering, clipboard copy handling, and previous/next navigation.
- `src/styles/global.css`: Responsive detail-page layout and gallery control presentation.
- `tests/detail-page.test.ts`: Rendered-detail regression coverage with a two-prompt fixture.

## RED

Command:

```powershell
npx vitest run tests/detail-page.test.ts
```

Result: failed as expected before implementation because `../src/pages/prompt/[slug].astro` could not be resolved. The dynamic route did not exist.

## GREEN

Command:

```powershell
npx vitest run tests/detail-page.test.ts
```

Result: passed, 1 test file and 1 test.

Final verification:

```powershell
npm test
$env:BASE_PATH = '/prompt-forge'
npm run build
```

Results:

- `npm test`: 4 test files passed, 14 tests passed.
- Base-path build: completed successfully with Astro static output.
- `git diff --check`: no whitespace errors.

## Commits

- Task implementation: `75b5c96 feat: add static prompt detail pages`

## Accessibility And Base-Path Proof

- The primary attachment image uses the prompt title as its `alt` text.
- Multi-image galleries render one semantic button per image with `aria-label="Show image N"`, `aria-controls`, and an updated `aria-pressed` state. Controls have 44px minimum targets and visible focus styling inherited from the global button focus rule.
- The copied text remains in a normal selectable `<pre>` element; clipboard failures set the button label to `SELECT TEXT` rather than hiding the text.
- The route and gallery normalize `BASE_PATH`; archive back links, neighbor links, and attachment URLs are generated below that base. A build with `BASE_PATH=/prompt-forge` completed successfully.
- Astro pages import only generated local JSON and local components. The final scan found no `Feishu` or `lark-cli` calls under `src/pages` or `src/components`.

## Acceptance Self-Check

- [x] Static `getStaticPaths` creates a path definition for every generated prompt slug.
- [x] Detail page shows title, categories, original prompt, gallery, copy control, and available neighbors.
- [x] Original prompt is rendered directly in `<pre>` without trimming or formatting; the regression test checks the complete two-line fixture string exactly.
- [x] Copy success changes the control to `COPIED`; failure changes it to `SELECT TEXT`.
- [x] Only Task 5 implementation, style support, tests, and this report were changed. No Feishu calls, prompt builder work, user data changes, gradients, or card UI were added.

## Remaining Concerns

- `src/generated/prompts.json` is currently an empty array. The successful static build therefore registers the dynamic route but emits no individual prompt HTML files. Once generated prompt data is present, `getStaticPaths` will emit one page per record. This task did not alter user-generated data.
- There is no repository Playwright configuration yet, so gallery switching and clipboard fallback are covered by emitted route markup and implementation review rather than an end-to-end browser test. Browser coverage belongs to the later planned browser-test task.
