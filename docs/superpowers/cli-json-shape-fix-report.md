# CLI JSON Shape Fix Report

## Scope

Updated the local Feishu Base sync parser to support the confirmed real
`lark-cli base +record-list --format json` response. No remote command was
run and no Base data was changed.

## Confirmed Response Contract

Successful record-list responses use:

- `ok: true`
- `data.data` for row arrays
- `data.fields` for the selected field names
- `data.record_id_list` for row record IDs
- `data.has_more` for pagination

## Implementation

- Maps each row through its corresponding `fields` entry into a
  `BasePromptRecord`; field order is read from the response rather than
  assumed.
- Rejects malformed matrices before publication when row and record-ID counts
  differ, row widths differ from the field list, field names are invalid or
  repeated, or `has_more` is not boolean.
- Uses `has_more` when supplied. Legacy `data.items` responses remain
  supported and retain the prior short-page fallback.
- Rejects an empty page with `has_more: true` and duplicate record IDs across
  pages so a malformed CLI response cannot loop indefinitely.

## Regression Coverage

`tests/sync-feishu.test.ts` covers:

- The real matrix response shape, including a short first page with
  `has_more: true` followed by `has_more: false`.
- Misaligned row and record-ID counts.
- An empty page that incorrectly reports `has_more: true`.

## Verification

The following local commands ran with
`GITHUB_REPOSITORY_URL=https://github.com/example/prompt-forge`:

- `npm test`: 7 test files and 24 tests passed.
- `npm run build`: Astro static build completed successfully.
