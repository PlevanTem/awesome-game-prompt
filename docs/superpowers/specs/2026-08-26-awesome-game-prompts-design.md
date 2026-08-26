# Awesome Game Prompts Brand and Discovery Design

## Goal

Make Awesome Game Prompts a shareable, user-facing game-art prompt library: visitors can browse visual results, read enough of a prompt to judge it, and copy the full original without leaving the homepage. Chinese is the default language; English is available through a persistent UI switch.

## Scope

### Public experience

- Replace every public-facing `Prompt Forge` label with `Awesome Game Prompts`.
- Make Chinese the server-rendered default and the document language.
- Add an accessible Chinese / EN language toggle that updates navigation, headings, category labels, filter buttons, prompt actions, copy feedback, and the About page in place. The chosen language is saved in `localStorage`; prompt titles and prompt bodies remain original source content.
- Replace the homepage's index-only framing with a concise user message: browse visual results, open or expand a prompt, then copy it.
- Extend every homepage item with an image/effect preview, a short prompt preview, an expand/collapse action, a copy button, and a detail-link action. Existing detail-page URLs stay stable.
- Keep category filtering and random selection. Random selection continues to open an existing detail page.
- Simplify the About page into a visitor-oriented one-paragraph description and repository link. It must not need a repository URL at build time.
- Update document titles and the shared meta description for the new project identity.

### Repository experience

- Make `README.md` the concise Chinese landing page and add `README.en.md` as the English equivalent.
- Put reciprocal language links at the top of both README files.
- Show the library's categories and a curated, copied-from-source sample list linking to prompt detail pages. Do not invent online URLs, usage counts, or generated results.
- Keep developer-only setup, sync, and deployment details out of the primary README. No deployment instructions will be surfaced to visitors.

## UI and interaction design

### Homepage

The page opens with the name `Awesome Game Prompts` and one short value statement. Category filters sit directly below. The card gallery keeps the existing visual-forward layout but changes the card contents to this order:

1. effect image or a category-colored fallback;
2. category and title;
3. an excerpt of the source prompt, capped in the browser display only;
4. `展开提示词` / `收起提示词` and `复制提示词` buttons; and
5. an accessible `查看详情` link.

Expanded content exposes the full verbatim prompt in a preformatted block. Copy writes the unmodified source prompt to the clipboard. Button feedback is temporary and localized (`已复制` / `Copied`). Clipboard failure falls back to a localized selection instruction.

### Language switch

The static HTML is Chinese first for sharing, SEO, and no-JavaScript browsing. A small switch in the header has semantic button behavior and an `aria-pressed` state. The client script applies English labels when selected, stores `awesome-game-prompts-language`, and returns to Chinese when toggled back. It never translates user-created prompt bodies.

### Detail and About pages

The detail page retains its gallery, full prompt, copy action, and previous/next links, but uses the new brand and localized UI text. The About page is a light, one-screen orientation page, not a maintenance manual.

## Implementation boundaries

- Create one client-side localization module or inline shared mechanism with a single Chinese/English dictionary. Components consume data attributes rather than duplicating page variants.
- Keep prompt data schema and sync output unchanged.
- Keep current static-site and GitHub Pages architecture unchanged.
- Update unit and Playwright tests before the matching production behavior. Tests cover the brand/title output, Chinese default labels, card-level expansion/copy, English switching, and existing category/random/detail flows.
- Browser tests use the existing fixture server and mock clipboard permissions as they do today.

## Files expected to change

- `README.md`, `README.en.md`
- `src/layouts/BaseLayout.astro`
- `src/components/SiteHeader.astro`
- `src/components/PromptTile.astro`
- `src/components/ArchiveControls.astro`
- `src/pages/index.astro`
- `src/pages/about.astro`
- `src/pages/prompt/[slug].astro`
- `src/styles/global.css`
- unit and browser test files that assert visible copy, page titles, or user flows

## Error handling and accessibility

- A prompt without an attachment still shows a usable fallback card and copy controls.
- Empty prompts remain copyable and visible in expanded form.
- The language preference is optional; invalid or unavailable saved values fall back to Chinese.
- Copy, expand, and language controls are keyboard-operable and expose their current state through text and ARIA attributes.

## Verification

- Run targeted unit tests after each behavior change, then `npm run test`.
- Run `npm run build` with required public build variables.
- Run `npm run test:e2e` and inspect the generated homepage screenshot to confirm cards visibly show result, prompt excerpt, and copy action.
- Run `git diff --check` before committing.