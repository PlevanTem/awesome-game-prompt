import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import ArchivePage from '../src/pages/index.astro';
import prompts from './fixtures/generated-prompts.json';

const execFileAsync = promisify(execFile);

describe('archive homepage', () => {
  it('keeps archive links valid below a GitHub Pages base path', async () => {
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
    const args = process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm.cmd', 'run', 'build']
      : ['run', 'build'];

    await execFileAsync(command, args, {
      cwd: process.cwd(),
      env: {
        ...process.env,
        BASE_PATH: '/prompt-forge',
        GITHUB_REPOSITORY_URL: 'https://git.example.test/open-source/prompt-forge',
      },
    });
    const html = await readFile(join(process.cwd(), 'dist', 'index.html'), 'utf8');

    expect(html).toContain('/prompt-forge/about/');
  }, 30_000);

  it('renders a generated prompt fixture in the production index', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(ArchivePage, { props: { prompts } });

    expect(html).toContain('经典四视图');
    expect(html).toContain('复制提示词');
    expect(html).toContain('展开提示词');
    expect(html).toContain('/prompt/prompt-b0f3js/');
    expect(html).toContain('CHARACTER DESIGN');
  });
});
