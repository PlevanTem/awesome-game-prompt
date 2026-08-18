# Game Art Prompt Archive - Design

## Purpose

Build a personal, open-source website that shares game-art prompts from a single Feishu Base. It is a fast visual archive for indie game developers and AI-art creators, not a community, marketplace, prompt generator, or embedded Feishu app.

The public product name is **Prompt Forge**. Its homepage headline is **GAME ART PROMPTS, INDEXED.**

## Confirmed Scope

- Source of truth: the Feishu Wiki's embedded Base `CBhDbOabfaVkh3swYs9caEXVneh`, table `tbl8T2q4xSI4ODCh`.
- Existing source fields only: `Text`, `类型`, `Prompt`, and `Attachment`.
- Prompts are displayed exactly as authored. Do not translate or rewrite them.
- Interface navigation and category labels are English-first, with Chinese category text where useful.
- No accounts, comments, likes, prompt builder, online image generation, payments, or embedded Feishu table.
- Website data and images are statically generated for GitHub Pages. Feishu credentials never enter the browser or the repository.

## Product Shape

### Homepage

The homepage is the archive index, not a marketing landing page.

- Compact header: Prompt Forge mark, Archive, About, language label.
- Main heading: `GAME ART PROMPTS, INDEXED.`
- Horizontal category filter: All, Characters, Environments, Concept Art, UI/UX, VFX, and 3D.
- `Random prompt` control for exploration.
- Dense, responsive asymmetric image grid. Each tile uses the first `Attachment` image as its preview.
- Tile metadata: category and index number by default; title is always visible.
- Tiles link directly to a prompt detail route.

### Prompt Detail

- Desktop: attachment preview on the left, content on the right.
- Mobile: preview above content.
- Data shown only from the Base: title, category, original prompt, and all attachments.
- A prominent `Copy prompt` control copies the exact original prompt.
- If a record has multiple attachments, show the first one by default and allow small dot controls to switch images.
- Previous and next prompt links follow the static archive order.

### About

One concise page: purpose of the archive, Feishu as source, and a link to the GitHub repository. It must not claim that prompts are universally tested or model-specific because the source table does not contain those facts.

## Visual System

Visual direction: **Production Index**.

- The design feels like a contemporary game-art production index, not an AI SaaS dashboard or prompt marketplace.
- Base colors: mineral white `#E9E8E0`, ink `#171814`, signal orange `#E55330`, and acid green `#C9FF3E` only for exploration actions or selected states.
- Typography: forceful neo-grotesk display type for index titles; monospace for category, sequence, and control labels.
- Borders are thin and square. Avoid soft cards, gradients, glass effects, oversized marketing copy, or generic AI imagery.
- Real `Attachment` images are the primary visual material. Never substitute stock art in production.

## Data Build

The public site must not request Feishu data at runtime.

1. A local sync command calls `lark-cli base +record-list` with the Base token and table ID.
2. It converts the four fields to a generated prompt dataset:
   - `id`: Feishu record ID
   - `slug`: normalized title plus a short record-ID suffix to avoid collisions
   - `title`: `Text`
   - `categories`: `类型`
   - `prompt`: `Prompt`
   - `attachments`: local generated paths from `Attachment`
3. It downloads every file token through `lark-cli base +record-download-attachment` into generated public assets.
4. It writes a deterministic JSON file used by the static site build.
5. The generated dataset and public images are committed with the site so GitHub Pages has no Feishu dependency.

The sync process is run locally by the authenticated owner before publishing. It must stop without modifying the last successful dataset if a Feishu read or attachment download fails.

## Implementation Architecture

- Framework: Astro with TypeScript, static output, and GitHub Pages deployment.
- Styling: plain component-scoped CSS or a small global token layer. No component library is needed.
- Content: generated JSON and local attachment assets only.
- Routes:
  - `/` archive index
  - `/prompt/[slug]/` prompt details
  - `/about/`
- Client interaction is limited to filtering, random selection, copy-to-clipboard, and attachment switching.

## Failure Behavior

- Missing title: omit the record from the build and report its record ID.
- Missing prompt: omit the record from the build and report its record ID.
- Missing attachment: keep the prompt card with a deliberate graphic fallback; do not fetch unrelated images.
- Attachment download failure: fail the sync command before writing a new dataset.
- Copy API unavailable: show the original prompt in a selectable text block and a short local error state.

## Verification

- Unit tests for Feishu field mapping, slug collision handling, empty fields, and multiple attachments.
- Build check confirms every generated detail route has a title and prompt.
- Browser checks for category filtering, random routing, copy action, and attachment switching.
- Playwright screenshots at desktop and mobile sizes verify that real attachments render, text does not overlap, and the index remains usable with long Chinese titles.
- GitHub Actions builds the static site and publishes `dist/` to GitHub Pages only after all checks pass.

## Explicit Non-Goals

- Base field changes.
- User-generated submissions.
- Live Feishu embeds or client-side Feishu API calls.
- Search engine or analytics integrations in the first release.
- Any claim about prompt quality beyond the source data.
