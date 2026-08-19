import { execFile } from 'node:child_process';
import { chmod, copyFile, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
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

  it('requests Base records in 200-record offset pages and stops after a short page', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    const requestedPages: Array<{ limit: string | undefined; offset: string | undefined }> = [];
    const records = Array.from({ length: 401 }, (_, index) => ({
      record_id: `rec-page-${String(index).padStart(4, '0')}`,
      fields: {
        Attachment: [],
        Prompt: `Prompt ${index}`,
        Text: `Prompt title ${index}`,
        类型: [],
      },
    }));
    const runner = async (_command: string, args: string[]) => {
      if (!args.includes('+record-list')) {
        throw new Error('attachment command must not run');
      }

      const limit = args[args.indexOf('--limit') + 1];
      const offset = args[args.indexOf('--offset') + 1];
      requestedPages.push({ limit, offset });
      if (limit !== '200') {
        throw new Error(`lark-cli only accepts --limit 200, received ${limit}`);
      }

      const start = Number(offset);
      return {
        stderr: '',
        stdout: JSON.stringify({
          ok: true,
          data: { items: records.slice(start, start + Number(limit)) },
        }),
      };
    };

    const { prompts, skippedRecordIds } = await syncBase({
      runner,
      outputDir,
      dataFile,
      environment: {
        FEISHU_BASE_TOKEN: 'base-test',
        FEISHU_TABLE_ID: 'table-test',
      },
    });

    expect(prompts).toHaveLength(401);
    expect(prompts[0]).toMatchObject({ id: 'rec-page-0000' });
    expect(prompts.at(-1)).toMatchObject({ id: 'rec-page-0400' });
    expect(skippedRecordIds).toEqual([]);
    expect(JSON.parse(await readFile(dataFile, 'utf8'))).toHaveLength(401);
    expect(requestedPages).toEqual([
      { limit: '200', offset: '0' },
      { limit: '200', offset: '200' },
      { limit: '200', offset: '400' },
    ]);
  });

  it('maps the real lark-cli record matrix and follows has_more through a short page', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    const requestedOffsets: string[] = [];
    const runner = async (_command: string, args: string[]) => {
      if (!args.includes('+record-list')) {
        throw new Error('attachment command must not run');
      }

      const offset = args[args.indexOf('--offset') + 1];
      requestedOffsets.push(offset);
      const pages: Record<string, unknown> = {
        '0': {
          ok: true,
          data: {
            data: [['First prompt', ['角色设计'], 'First prompt body', []]],
            fields: ['Text', '类型', 'Prompt', 'Attachment'],
            has_more: true,
            record_id_list: ['rec-matrix-0001'],
          },
        },
        '1': {
          ok: true,
          data: {
            data: [['Second prompt', ['场景设计'], 'Second prompt body', []]],
            fields: ['Text', '类型', 'Prompt', 'Attachment'],
            has_more: false,
            record_id_list: ['rec-matrix-0002'],
          },
        },
      };

      return { stderr: '', stdout: JSON.stringify(pages[offset]) };
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
    ).resolves.toEqual({
      prompts: [
        {
          attachments: [],
          categories: ['角色设计'],
          id: 'rec-matrix-0001',
          prompt: 'First prompt body',
          slug: 'first-prompt-x-0001',
          title: 'First prompt',
        },
        {
          attachments: [],
          categories: ['场景设计'],
          id: 'rec-matrix-0002',
          prompt: 'Second prompt body',
          slug: 'second-prompt-x-0002',
          title: 'Second prompt',
        },
      ],
      skippedRecordIds: [],
    });
    expect(requestedOffsets).toEqual(['0', '1']);
  });

  it('rejects a real lark-cli matrix when rows and record IDs do not align', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    let recordListCalls = 0;
    await expect(
      syncBase({
        runner: async (_command, args) => {
          if (!args.includes('+record-list')) {
            throw new Error('attachment command must not run');
          }
          recordListCalls += 1;
          return {
            stderr: '',
            stdout: JSON.stringify({
              ok: true,
              data: {
                data: [['Misaligned prompt', [], 'Prompt body', []]],
                fields: ['Text', '类型', 'Prompt', 'Attachment'],
                has_more: false,
                record_id_list: [],
              },
            }),
          };
        },
        outputDir: join(workspace, 'public', 'generated'),
        dataFile: join(workspace, 'src', 'generated', 'prompts.json'),
        environment: {
          FEISHU_BASE_TOKEN: 'base-test',
          FEISHU_TABLE_ID: 'table-test',
        },
      }),
    ).rejects.toThrow('Feishu Base record export included an invalid record matrix');
    expect(recordListCalls).toBe(1);
  });

  it('rejects a real lark-cli matrix with unselected field names', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    await expect(
      syncBase({
        runner: async (_command, args) => {
          if (!args.includes('+record-list')) {
            throw new Error('attachment command must not run');
          }
          return {
            stderr: '',
            stdout: JSON.stringify({
              ok: true,
              data: {
                data: [['Unexpected field prompt', [], 'Prompt body', []]],
                fields: ['Text', '类型', 'Prompt', 'Unexpected'],
                has_more: false,
                record_id_list: ['rec-unexpected-field'],
              },
            }),
          };
        },
        outputDir: join(workspace, 'public', 'generated'),
        dataFile: join(workspace, 'src', 'generated', 'prompts.json'),
        environment: {
          FEISHU_BASE_TOKEN: 'base-test',
          FEISHU_TABLE_ID: 'table-test',
        },
      }),
    ).rejects.toThrow('Feishu Base record export included invalid record matrix fields');
  });

  it('rejects an empty real lark-cli page that claims has_more to prevent pagination loops', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    let recordListCalls = 0;
    await expect(
      syncBase({
        runner: async (_command, args) => {
          if (!args.includes('+record-list')) {
            throw new Error('attachment command must not run');
          }
          recordListCalls += 1;
          return {
            stderr: '',
            stdout: JSON.stringify({
              ok: true,
              data: {
                data: [],
                fields: ['Text', '类型', 'Prompt', 'Attachment'],
                has_more: true,
                record_id_list: [],
              },
            }),
          };
        },
        outputDir: join(workspace, 'public', 'generated'),
        dataFile: join(workspace, 'src', 'generated', 'prompts.json'),
        environment: {
          FEISHU_BASE_TOKEN: 'base-test',
          FEISHU_TABLE_ID: 'table-test',
        },
      }),
    ).rejects.toThrow('Feishu Base record export reported more records without returning records');
    expect(recordListCalls).toBe(1);
  });

  it('loads .env.local through npm run sync:feishu before invoking lark-cli', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-entry-'));
    temporaryDirectories.push(workspace);

    const scriptsDirectory = join(workspace, 'scripts');
    const binDirectory = join(workspace, 'bin');
    const captureFile = join(workspace, 'lark-cli-args.json');
    await mkdir(scriptsDirectory, { recursive: true });
    await mkdir(binDirectory, { recursive: true });
    await copyFile(join(process.cwd(), 'package.json'), join(workspace, 'package.json'));
    await copyFile(
      join(process.cwd(), 'scripts', 'sync-feishu.mjs'),
      join(scriptsDirectory, 'sync-feishu.mjs'),
    );
    await writeFile(
      join(workspace, '.env.local'),
      'FEISHU_BASE_TOKEN=base-from-env-file\nFEISHU_TABLE_ID=table-from-env-file\n',
      'utf8',
    );
    await writeFile(
      join(binDirectory, 'fake-lark.mjs'),
      [
        "import { writeFile } from 'node:fs/promises';",
        'await writeFile(process.env.SYNC_CAPTURE, JSON.stringify(process.argv.slice(2)), \'utf8\');',
        "process.stdout.write(JSON.stringify({ ok: true, data: { items: [{ record_id: 'recblank-entry', fields: { Attachment: [], Prompt: 'Ignored prompt', Text: '   ', 类型: [] } }] } }));",
      ].join('\n'),
      'utf8',
    );

    if (process.platform === 'win32') {
      await writeFile(
        join(binDirectory, 'lark-cli.cmd'),
        `@echo off\r\n"${process.execPath}" "%~dp0fake-lark.mjs" %*\r\n`,
        'utf8',
      );
    } else {
      const launcher = join(binDirectory, 'lark-cli');
      await writeFile(launcher, `#!${process.execPath}\nimport './fake-lark.mjs';\n`, 'utf8');
      await chmod(launcher, 0o755);
    }

    const pathKey = Object.keys(process.env).find((name) => name.toUpperCase() === 'PATH') ?? 'PATH';
    const command = process.platform === 'win32' ? 'cmd.exe' : 'npm';
    const args = process.platform === 'win32'
      ? ['/d', '/s', '/c', 'npm.cmd', 'run', 'sync:feishu']
      : ['run', 'sync:feishu'];

    const { stderr, stdout } = await execFileAsync(command, args, {
      cwd: workspace,
      env: {
        ...process.env,
        [pathKey]: `${binDirectory}${delimiter}${process.env[pathKey] ?? ''}`,
        SYNC_CAPTURE: captureFile,
      },
    });

    const invocation = JSON.parse(await readFile(captureFile, 'utf8')) as string[];
    expect(invocation).toEqual(
      expect.arrayContaining([
        '+record-list',
        '--base-token',
        'base-from-env-file',
        '--table-id',
        'table-from-env-file',
      ]),
    );
    expect(stderr).toContain('Skipped records with blank Text or Prompt: recblank-entry');
    expect(stdout).toContain('Synced 0 prompts.');
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

  it('leaves the current dataset unchanged when the Base record export transport fails', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    const existingDataset = '[{"id":"existing"}]\n';
    await mkdir(join(outputDir, 'prompt-assets'), { recursive: true });
    await mkdir(join(workspace, 'src', 'generated'), { recursive: true });
    await writeFile(dataFile, existingDataset, 'utf8');
    await writeFile(join(outputDir, 'prompt-assets', 'existing.png'), 'existing', 'utf8');

    await expect(
      syncBase({
        runner: async () => {
          throw new Error('record export unavailable');
        },
        outputDir,
        dataFile,
        environment: {
          FEISHU_BASE_TOKEN: 'base-test',
          FEISHU_TABLE_ID: 'table-test',
        },
      }),
    ).rejects.toThrow('record export unavailable');
    expect(await readFile(dataFile, 'utf8')).toBe(existingDataset);
    expect(await readFile(join(outputDir, 'prompt-assets', 'existing.png'), 'utf8')).toBe(
      'existing',
    );
  });

  it('omits blank Text or Prompt records and reports every skipped record ID', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    const runner = async () => ({
      stderr: '',
      stdout: JSON.stringify({
        ok: true,
        data: {
          items: [
            {
              record_id: 'recblanktext',
              fields: { Attachment: [], Prompt: 'This must be skipped.', Text: '   ', 类型: [] },
            },
            {
              record_id: 'recblankprompt',
              fields: { Attachment: [], Prompt: '   ', Text: 'Also skipped', 类型: [] },
            },
            {
              record_id: 'recvalid000001',
              fields: {
                Attachment: [],
                Prompt: 'Preserve this prompt exactly.',
                Text: 'Valid Prompt',
                类型: ['角色设计'],
              },
            },
          ],
        },
      }),
    });

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
    ).resolves.toEqual({
      prompts: [
        {
          attachments: [],
          categories: ['角色设计'],
          id: 'recvalid000001',
          prompt: 'Preserve this prompt exactly.',
          slug: 'valid-prompt-000001',
          title: 'Valid Prompt',
        },
      ],
      skippedRecordIds: ['recblanktext', 'recblankprompt'],
    });
    expect(JSON.parse(await readFile(dataFile, 'utf8'))).toEqual([
      {
        attachments: [],
        categories: ['角色设计'],
        id: 'recvalid000001',
        prompt: 'Preserve this prompt exactly.',
        slug: 'valid-prompt-000001',
        title: 'Valid Prompt',
      },
    ]);
  });

  it('fails before publication with every record ID that has a colliding slug', async () => {
    const workspace = await mkdtemp(join(tmpdir(), 'prompt-forge-sync-'));
    temporaryDirectories.push(workspace);

    const outputDir = join(workspace, 'public', 'generated');
    const dataFile = join(workspace, 'src', 'generated', 'prompts.json');
    const existingDataset = '[{"id":"existing"}]\n';
    await mkdir(join(outputDir, 'prompt-assets'), { recursive: true });
    await mkdir(join(workspace, 'src', 'generated'), { recursive: true });
    await writeFile(dataFile, existingDataset, 'utf8');
    await writeFile(join(outputDir, 'prompt-assets', 'existing.png'), 'existing asset', 'utf8');

    let attachmentDownloadAttempts = 0;
    const runner = async (_command: string, args: string[]) => {
      if (args.includes('+record-list')) {
        return {
          stderr: '',
          stdout: JSON.stringify({
            ok: true,
            data: {
              items: [
                {
                  record_id: 'rec-alpha-abcdef',
                  fields: {
                    Attachment: [{ file_token: 'file-alpha', name: 'alpha.png' }],
                    Prompt: 'Alpha prompt.',
                    Text: 'Same Prompt',
                    类型: [],
                  },
                },
                {
                  record_id: 'rec-beta-abcdef',
                  fields: {
                    Attachment: [{ file_token: 'file-beta', name: 'beta.png' }],
                    Prompt: 'Beta prompt.',
                    Text: 'same prompt',
                    类型: [],
                  },
                },
                {
                  record_id: 'rec-gamma-fedcba',
                  fields: {
                    Attachment: [{ file_token: 'file-gamma', name: 'gamma.png' }],
                    Prompt: 'Gamma prompt.',
                    Text: 'Other Prompt',
                    类型: [],
                  },
                },
                {
                  record_id: 'rec-delta-fedcba',
                  fields: {
                    Attachment: [{ file_token: 'file-delta', name: 'delta.png' }],
                    Prompt: 'Delta prompt.',
                    Text: 'other prompt',
                    类型: [],
                  },
                },
              ],
            },
          }),
        };
      }

      attachmentDownloadAttempts += 1;
      await writeFile(args[args.indexOf('--output') + 1], 'new asset', 'utf8');
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
    ).rejects.toThrow(
      'Duplicate generated prompt slugs for records: rec-alpha-abcdef, rec-beta-abcdef, rec-delta-fedcba, rec-gamma-fedcba',
    );
    expect(attachmentDownloadAttempts).toBe(0);
    expect(await readFile(dataFile, 'utf8')).toBe(existingDataset);
    expect(await readFile(join(outputDir, 'prompt-assets', 'existing.png'), 'utf8')).toBe(
      'existing asset',
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
    ).resolves.toMatchObject({ prompts: [{ id: 'recpublished' }], skippedRecordIds: [] });
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
