import { extname } from 'node:path';

import type { BasePromptRecord, GeneratedPrompt } from './types';

export function makeSlug(title: string, recordId: string): string {
  const idSuffix = recordId.toLowerCase().slice(-6);
  const latinTitle = title
    .trim()
    .match(/[A-Za-z]+/g)
    ?.join('-')
    .toLowerCase();

  return `${latinTitle || 'prompt'}-${idSuffix}`;
}

export function toGeneratedPrompt(record: BasePromptRecord): GeneratedPrompt {
  const title = record.title.trim();

  if (!title) {
    throw new Error(`Missing title for record ${record.recordId}`);
  }

  if (!record.prompt.trim()) {
    throw new Error(`Missing prompt for record ${record.recordId}`);
  }

  const assetRecordId = record.recordId.toLowerCase();

  return {
    recordId: record.recordId,
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
