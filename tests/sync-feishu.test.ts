import { execFile } from 'node:child_process';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

import { afterEach, describe, expect, it } from 'vitest';
import { commandInvocation, syncBase } from '../scripts/sync-feishu.mjs';

const temporaryDirectories: string[] = [];
const execFileAsync = promisify(execFile);

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { force: true, recursive: true }),
    ),
  );
});

describe('syncBase', () => {
  it('uses cmd.exe with fixed arguments for the Windows lark-cli launcher', () => {
    expect(
      commandInvocation(
        'lark-cli.cmd',
        ['base', '+record-list', '--base-token', 'base-test'],
        'win32',
      ),
    ).toEqual({
      args: ['/d', '/s', '/c', 'lark-cli.cmd', 'base', '+record-list', '--base-token', 'base-test'],
      executable: 'cmd.exe',
    });
  });

  it('fails visibly when started without the required environment variables', async () => {
    const script = join(process.cwd(), 'scripts', 'sync-feishu.mjs');

    await expect(
      execFileAsync(process.execPath, [script], { env: {} }),
    ).rejects.toMatchObject({
      code: 1,
      stderr: expect.stringContaining('Missing required environment variable: FEISHU_BASE_TOKEN'),
    });
  });

  it('leaves the current dataset unchanged when an attachment download fails', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    const existingDataset = '[{"id":"existing"}]\n';
    await mkdir(outputDir, { recursive: true });
    await mkdir(join(outputDir, 'prompt-assets'), { recursive: true });
    await mkdir(join(workspace, 'src', 'generated'), { recursive: true });
    await writeFile(dataFile, existingDataset, 'utf8');
    await writeFile(join(outputDir, 'prompt-assets', 'existing.png'), 'existing', 'utf8');

    const runner = async (_command: string, args: string[]) => {
      if (args.includes('+record-list')) {
        return {
          stderr: '',
          stdout: JSON.stringify({
            ok: true,
            data: {
              items: [
                {
                  record_id: 'rec-valid',
                  fields: {
                    Attachment: [{ file_token: 'file-good', name: 'good.png' }],
                    Prompt: 'Keep this prompt exactly.\n',
                    Text: 'Valid prompt',
                    类型: ['角色设计'],
                  },
                },
                {
                  record_id: 'rec-failed',
                  fields: {
                    Attachment: [{ file_token: 'file-bad', name: 'bad.png' }],
                    Prompt: 'This record should not publish.',
                    Text: 'Failed prompt',
                    类型: ['场景设计'],
                  },
                },
              ],
            },
          }),
        };
      }

      if (args.includes('file-bad')) {
        throw new Error('download unavailable');
      }

      const destination = args[args.indexOf('--output') + 1];
      await writeFile(destination, 'downloaded asset', 'utf8');
      return { stderr: '', stdout: '' };
    };

    await expect(
      syncBase({
        runner,
        outputDir,
        dataFile,
        environment: {
          FEISHU_BASE_TOKEN: 'base-test',
          FEISHU_TABLE_ID: 'table-test',
        },
      }),
    ).rejects.toThrow('Attachment download failed for rec-failed/file-bad');
    expect(await readFile(dataFile, 'utf8')).toBe(existingDataset);
    expect(await readFile(join(outputDir, 'prompt-assets', 'existing.png'), 'utf8')).toBe(
      'existing',
    );
  });

  it('keeps the published archive when post-publish backup cleanup fails', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    await mkdir(join(outputDir, 'prompt-assets'), { recursive: true });
    await mkdir(join(workspace, 'src', 'generated'), { recursive: true });
    await writeFile(dataFile, '[{"id":"old"}]\n', 'utf8');
    await writeFile(join(outputDir, 'prompt-assets', 'old.png'), 'old asset', 'utf8');

    let backupCleanupAttempted = false;
    const remove = async (path: string, options: Parameters<typeof rm>[1]) => {
      if (path.includes('.prompt-assets-backup-')) {
        backupCleanupAttempted = true;
        throw new Error('backup cleanup unavailable');
      }
      await rm(path, options);
    };
    const runner = async (_command: string, args: string[]) => {
      if (args.includes('+record-list')) {
        return {
          stderr: '',
          stdout: JSON.stringify({
            ok: true,
            data: {
              items: [
                {
                  record_id: 'recpublished',
                  fields: {
                    Attachment: [{ file_token: 'file-new', name: 'new.png' }],
                    Prompt: 'Published prompt.',
                    Text: 'Published',
                    类型: ['角色设计'],
                  },
                },
              ],
            },
          }),
        };
      }

      await writeFile(args[args.indexOf('--output') + 1], 'new asset', 'utf8');
      return { stderr: '', stdout: '' };
    };

    await expect(
      syncBase({
        runner,
        outputDir,
        dataFile,
        remove,
        environment: {
          FEISHU_BASE_TOKEN: 'base-test',
          FEISHU_TABLE_ID: 'table-test',
        },
      }),
    ).resolves.toMatchObject([{ id: 'recpublished' }]);
    expect(backupCleanupAttempted).toBe(true);
    expect(await readFile(dataFile, 'utf8')).toContain('Published prompt.');
    expect(await readFile(join(outputDir, 'prompt-assets', 'recpublished-0.png'), 'utf8')).toBe(
      'new asset',
    );
  });

  it('rejects an attachment path that escapes its staging directory', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    const runner = async (_command: string, args: string[]) => {
      if (args.includes('+record-list')) {
        return {
          stderr: '',
          stdout: JSON.stringify({
            ok: true,
            data: {
              items: [
                {
                  record_id: '../escape',
                  fields: {
                    Attachment: [{ file_token: 'file-escape', name: 'image.png' }],
                    Prompt: 'Unsafe path test.',
                    Text: 'Unsafe',
                    类型: [],
                  },
                },
              ],
            },
          }),
        };
      }
      throw new Error('attachment command must not run');
    };

    await expect(
      syncBase({
        runner,
        outputDir,
        dataFile,
        environment: {
          FEISHU_BASE_TOKEN: 'base-test',
          FEISHU_TABLE_ID: 'table-test',
        },
      }),
    ).rejects.toThrow('Attachment destination escapes staging directory');
  });
});
