# Attachment Output Path Fix Report

## Scope

Fixed the Feishu attachment sync command so `lark-cli` receives a repository-cwd-relative `--output` path instead of an absolute path.

## Root Cause

Attachment staging is intentionally created under the generated-assets output directory so publication can continue to use same-directory atomic renames. The previous sync passed the absolute staging-file path directly to `lark-cli`, which rejects absolute output paths.

## Change

- Run the real CLI command with the repository root as its cwd.
- Require the configured generated-assets output directory to be inside that repository root before any Base record request.
- Convert each validated staging-file destination to a relative path before it is passed as `--output`.
- Keep staging under the generated-assets output directory and preserve the existing publish/rollback sequence.

## Tests

`tests/sync-feishu.test.ts` now verifies that attachment output is relative, resolves inside the repository cwd, and is published successfully. It also verifies that an output directory outside the repository cwd is rejected before any command runner invocation.

## Verification

- `npm run test -- tests/sync-feishu.test.ts` passed: 16 tests.
- `GITHUB_REPOSITORY_URL=https://github.com/example/prompt-forge npm run build` passed.
- No sync command or remote data operation was run.
