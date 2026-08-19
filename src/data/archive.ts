import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import type { GeneratedPrompt } from './types';

const dataFile = resolve(
  process.cwd(),
  process.env.PROMPT_FORGE_E2E_FIXTURES === '1'
    ? 'tests/fixtures/e2e-prompts.json'
    : 'src/generated/prompts.json',
);

export async function getArchivePrompts(): Promise<GeneratedPrompt[]> {
  return JSON.parse(await readFile(dataFile, 'utf8')) as GeneratedPrompt[];
}
