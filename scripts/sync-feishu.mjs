import { execFile } from 'node:child_process';
import {
  access,
  mkdir,
  mkdtemp,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import { dirname, extname, isAbsolute, join, relative, resolve } from 'node:path';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';

const execFileAsync = promisify(execFile);

/** @typedef {{ fileToken: string, name: string }} BasePromptAttachment */
/** @typedef {{ recordId: string, title: string, categories: string[], prompt: string, attachments: BasePromptAttachment[] }} BasePromptRecord */
/** @typedef {{ id: string, slug: string, title: string, categories: string[], prompt: string, attachments: string[] }} GeneratedPrompt */
/** @typedef {{ prompts: GeneratedPrompt[], skippedRecordIds: string[] }} SyncResult */
/** @typedef {{ records: BasePromptRecord[], hasMore?: boolean }} BasePromptRecordPage */
/** @typedef {{ runner?: CommandRunner, outputDir?: string, dataFile?: string, environment?: NodeJS.ProcessEnv, remove?: typeof rm }} SyncOptions */
/** @typedef {(command: string, args: string[]) => Promise<{ stdout: string, stderr: string }>} CommandRunner */

const projectRoot = join(import.meta.dirname, '..');
const defaultOutputDir = join(projectRoot, 'public', 'generated');
const defaultDataFile = join(projectRoot, 'src', 'generated', 'prompts.json');
const recordPageSize = 200;
const selectedRecordFields = new Set(['Text', '类型', 'Prompt', 'Attachment']);

function commandName() {
  return process.platform === 'win32' ? 'lark-cli.cmd' : 'lark-cli';
}

export function commandInvocation(command, args, platform = process.platform) {
  if (platform === 'win32' && command.toLowerCase().endsWith('.cmd')) {
    return {
      executable: 'cmd.exe',
      args: ['/d', '/s', '/c', command, ...args],
    };
  }

  return { executable: command, args };
}

/** @type {CommandRunner} */
async function runCommand(command, args) {
  const invocation = commandInvocation(command, args);
  return execFileAsync(invocation.executable, invocation.args, { encoding: 'utf8' });
}

async function pathExists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

function requiredEnvironment(environment, name) {
  const value = environment[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function stringField(value, fieldName, recordId) {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${fieldName} value for record ${recordId}`);
  }
  return value;
}

function requiredTextField(value, fieldName, recordId) {
  if (value === undefined || value === null) {
    return '';
  }
  return stringField(value, fieldName, recordId);
}

function categoriesField(value, recordId) {
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value) && value.every((category) => typeof category === 'string')) {
    return value;
  }
  if (value === undefined || value === null) {
    return [];
  }
  throw new Error(`Invalid 类型 value for record ${recordId}`);
}

function attachmentsField(value, recordId) {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error(`Invalid Attachment value for record ${recordId}`);
  }

  return value.map((attachment) => {
    if (!attachment || typeof attachment !== 'object') {
      throw new Error(`Invalid Attachment value for record ${recordId}`);
    }
    const fileToken = attachment.file_token ?? attachment.fileToken;
    if (typeof fileToken !== 'string' || typeof attachment.name !== 'string') {
      throw new Error(`Invalid Attachment value for record ${recordId}`);
    }
    return { fileToken, name: attachment.name };
  });
}

function baseRecord(recordId, fields) {
  if (typeof recordId !== 'string' || !fields || typeof fields !== 'object') {
    throw new Error('Feishu Base record export included an invalid record');
  }

  return {
    recordId,
    title: requiredTextField(fields.Text, 'Text', recordId),
    categories: categoriesField(fields.类型, recordId),
    prompt: requiredTextField(fields.Prompt, 'Prompt', recordId),
    attachments: attachmentsField(fields.Attachment, recordId),
  };
}

function optionalHasMore(value) {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value !== 'boolean') {
    throw new Error('Feishu Base record export included an invalid has_more value');
  }
  return value;
}

/** @returns {BasePromptRecordPage} */
function parseBaseRecords(stdout) {
  let envelope;
  try {
    envelope = JSON.parse(stdout);
  } catch {
    throw new Error('Feishu Base returned invalid JSON');
  }

  if (!envelope || envelope.ok !== true) {
    throw new Error('Feishu Base record export was not successful');
  }

  const responseData = envelope.data;
  const items = responseData?.items;
  if (Array.isArray(items)) {
    return {
      records: items.map((item) => baseRecord(item?.record_id ?? item?.recordId, item?.fields)),
      hasMore: optionalHasMore(responseData.has_more),
    };
  }

  const rows = responseData?.data;
  const fields = responseData?.fields;
  const recordIds = responseData?.record_id_list;
  if (!Array.isArray(rows) || !Array.isArray(fields) || !Array.isArray(recordIds)) {
    throw new Error('Feishu Base record export did not include items or a record matrix');
  }
  if (
    fields.length !== selectedRecordFields.size ||
    !fields.every((field) => typeof field === 'string' && selectedRecordFields.has(field)) ||
    new Set(fields).size !== fields.length
  ) {
    throw new Error('Feishu Base record export included invalid record matrix fields');
  }
  if (recordIds.length !== rows.length) {
    throw new Error('Feishu Base record export included an invalid record matrix');
  }

  return {
    records: rows.map((row, rowIndex) => {
      if (!Array.isArray(row) || row.length !== fields.length) {
        throw new Error('Feishu Base record export included an invalid record matrix row');
      }
      const values = Object.fromEntries(
        fields.map((field, fieldIndex) => [field, row[fieldIndex]]),
      );
      return baseRecord(recordIds[rowIndex], values);
    }),
    hasMore: optionalHasMore(responseData.has_more),
  };
}

async function fetchBaseRecords(runner, baseToken, tableId) {
  const records = [];
  const recordIds = new Set();
  let offset = 0;

  while (true) {
    const { stdout } = await runner(commandName(), [
      'base',
      '+record-list',
      '--base-token',
      baseToken,
      '--table-id',
      tableId,
      '--field-id',
      'Text',
      '--field-id',
      '类型',
      '--field-id',
      'Prompt',
      '--field-id',
      'Attachment',
      '--limit',
      String(recordPageSize),
      '--offset',
      String(offset),
      '--format',
      'json',
      '--as',
      'user',
    ]);
    const page = parseBaseRecords(stdout);
    if (page.records.some((record) => recordIds.has(record.recordId))) {
      throw new Error('Feishu Base record export repeated a record across pages');
    }
    page.records.forEach((record) => recordIds.add(record.recordId));
    records.push(...page.records);

    if (page.hasMore === false || (page.hasMore === undefined && page.records.length < recordPageSize)) {
      return records;
    }
    if (page.records.length === 0) {
      throw new Error('Feishu Base record export reported more records without returning records');
    }
    offset += page.records.length;
  }
}

function makeSlug(title, recordId) {
  const latinTitle = title
    .trim()
    .match(/[A-Za-z]+/g)
    ?.join('-')
    .toLowerCase();
  return `${latinTitle || 'prompt'}-${recordId.toLowerCase().slice(-6)}`;
}

function toGeneratedPrompt(record) {
  const title = record.title.trim();
  const assetRecordId = record.recordId.toLowerCase();
  return {
    id: record.recordId,
    slug: makeSlug(title, record.recordId),
    title,
    categories: record.categories,
    prompt: record.prompt,
    attachments: record.attachments.map((attachment, index) => {
      const extension = extname(attachment.name).toLowerCase() || '.bin';
      return `/generated/prompt-assets/${assetRecordId}-${index}${extension}`;
    }),
  };
}

function splitPublishableRecords(records) {
  const publishableRecords = [];
  const skippedRecordIds = [];

  for (const record of records) {
    if (!record.title.trim() || !record.prompt.trim()) {
      skippedRecordIds.push(record.recordId);
    } else {
      publishableRecords.push(record);
    }
  }

  return { publishableRecords, skippedRecordIds };
}

function assertUniqueSlugs(prompts) {
  const recordIdsBySlug = new Map();

  for (const prompt of prompts) {
    const recordIds = recordIdsBySlug.get(prompt.slug) ?? [];
    recordIds.push(prompt.id);
    recordIdsBySlug.set(prompt.slug, recordIds);
  }

  const conflictingRecordIds = [...recordIdsBySlug.values()]
    .filter((recordIds) => recordIds.length > 1)
    .flat()
    .sort();

  if (conflictingRecordIds.length > 0) {
    throw new Error(
      `Duplicate generated prompt slugs for records: ${conflictingRecordIds.join(', ')}`,
    );
  }
}

function attachmentDestination(stagingAssets, recordId, index, extension) {
  const destination = resolve(
    stagingAssets,
    `${recordId.toLowerCase()}-${index}${extension}`,
  );
  const pathWithinStaging = relative(stagingAssets, destination);
  if (
    pathWithinStaging === '' ||
    pathWithinStaging.startsWith('..') ||
    isAbsolute(pathWithinStaging)
  ) {
    throw new Error('Attachment destination escapes staging directory');
  }
  return destination;
}

async function removeBackup(remove, path, options) {
  try {
    await remove(path, options);
  } catch {
    // Publication has completed; a leftover backup is recoverable and non-fatal.
  }
}

async function publish(stagingAssets, dataTempFile, outputDir, dataFile, remove) {
  const assetsDirectory = join(outputDir, 'prompt-assets');
  const assetBackup = join(outputDir, `.prompt-assets-backup-${Date.now()}`);
  const dataBackup = join(dirname(dataFile), `.prompts-backup-${Date.now()}.json`);
  let assetsBackedUp = false;
  let assetsPublished = false;
  let dataBackedUp = false;
  let dataPublished = false;

  try {
    if (await pathExists(assetsDirectory)) {
      await rename(assetsDirectory, assetBackup);
      assetsBackedUp = true;
    }
    await rename(stagingAssets, assetsDirectory);
    assetsPublished = true;

    if (await pathExists(dataFile)) {
      await rename(dataFile, dataBackup);
      dataBackedUp = true;
    }
    await rename(dataTempFile, dataFile);
    dataPublished = true;
  } catch (error) {
    if (dataPublished) {
      await rm(dataFile, { force: true });
    }
    if (dataBackedUp) {
      await rename(dataBackup, dataFile);
    }
    if (assetsPublished) {
      await rm(assetsDirectory, { force: true, recursive: true });
    }
    if (assetsBackedUp) {
      await rename(assetBackup, assetsDirectory);
    }
    throw error;
  }

  await removeBackup(remove, assetBackup, { force: true, recursive: true });
  await removeBackup(remove, dataBackup, { force: true });
}

/** @returns {Promise<SyncResult>} */
export async function syncBase(options = {}) {
  const environment = options.environment ?? process.env;
  const baseToken = requiredEnvironment(environment, 'FEISHU_BASE_TOKEN');
  const tableId = requiredEnvironment(environment, 'FEISHU_TABLE_ID');
  const runner = options.runner ?? runCommand;
  const remove = options.remove ?? rm;
  const outputDir = options.outputDir ?? defaultOutputDir;
  const dataFile = options.dataFile ?? defaultDataFile;

  const records = await fetchBaseRecords(runner, baseToken, tableId);
  const { publishableRecords, skippedRecordIds } = splitPublishableRecords(records);
  const prompts = publishableRecords.map(toGeneratedPrompt);
  assertUniqueSlugs(prompts);

  await mkdir(outputDir, { recursive: true });
  await mkdir(dirname(dataFile), { recursive: true });
  const stagingAssets = await mkdtemp(join(outputDir, '.prompt-assets-'));
  const dataTempDirectory = await mkdtemp(join(dirname(dataFile), '.prompts-'));
  const dataTempFile = join(dataTempDirectory, 'prompts.json');

  try {
    for (const record of publishableRecords) {
      for (let index = 0; index < record.attachments.length; index += 1) {
        const attachment = record.attachments[index];
        const extension = extname(attachment.name).toLowerCase() || '.bin';
        const destination = attachmentDestination(
          stagingAssets,
          record.recordId,
          index,
          extension,
        );
        try {
          await runner(commandName(), [
            'base',
            '+record-download-attachment',
            '--base-token',
            baseToken,
            '--table-id',
            tableId,
            '--record-id',
            record.recordId,
            '--file-token',
            attachment.fileToken,
            '--output',
            destination,
            '--as',
            'user',
          ]);
        } catch (error) {
          throw new Error(
            `Attachment download failed for ${record.recordId}/${attachment.fileToken}`,
            { cause: error },
          );
        }
      }
    }

    await writeFile(dataTempFile, `${JSON.stringify(prompts, null, 2)}\n`, 'utf8');
    await publish(stagingAssets, dataTempFile, outputDir, dataFile, remove);
    return { prompts, skippedRecordIds };
  } finally {
    await rm(stagingAssets, { force: true, recursive: true });
    await rm(dataTempDirectory, { force: true, recursive: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  syncBase()
    .then(({ prompts, skippedRecordIds }) => {
      if (skippedRecordIds.length > 0) {
        console.warn(`Skipped records with blank Text or Prompt: ${skippedRecordIds.join(', ')}`);
      }
      console.log(`Synced ${prompts.length} prompts.`);
    })
    .catch((error) => {
      console.error(error.message);
      process.exitCode = 1;
    });
}
