# CLI Pagination Compatibility Fix Report

Date: 2026-08-19

## Root Cause

The installed `lark-cli base +record-list` accepts JSON page sizes from 1 through 200.
`scripts/sync-feishu.mjs` requested `--limit 2000`, so sync could fail before the
existing record parser, mapping, attachment download, and atomic publication paths ran.

## Change

- Added a local `fetchBaseRecords` loop in `scripts/sync-feishu.mjs`.
- Every projected JSON request uses `--limit 200` and `--offset <n>`.
- Parsed records from each page are aggregated before existing blank-record filtering,
  mapping, attachment handling, and publication.
- The loop ends after a page with fewer than 200 records. Existing CLI transport errors
  and JSON/record validation errors continue to propagate unchanged.

## Test Coverage

`tests/sync-feishu.test.ts` now runs `syncBase` with 401 fixture records returned as
three CLI pages: 200, 200, and 1. It verifies:

- every request sends `--limit 200`;
- offsets are `0`, `200`, and `400`;
- records from the first and final pages are present in the generated output;
- exactly 401 records are published; and
- no request follows the one-record short page.

TDD evidence: before the implementation change, the new test failed at the first call
because the script sent `--limit 2000` and the test CLI boundary rejected it. It passed
after the pagination loop was added.

## Verification

| Command | Result |
| --- | --- |
| `npm test -- tests/sync-feishu.test.ts -t "requests Base records in 200-record offset pages and stops after a short page"` | Passed: 1 test. |
| `npm test -- tests/sync-feishu.test.ts` | Passed: 10 tests. |
| `npm run build` | Expected existing-environment failure: `GITHUB_REPOSITORY_URL` was absent. |
| `GITHUB_REPOSITORY_URL=https://example.invalid/prompt-forge npm run build` | Passed: Astro built 2 pages. |

No Feishu command, Base read, attachment download, remote operation, or production prompt-data change was performed.
