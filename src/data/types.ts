export interface BasePromptAttachment {
  fileToken: string;
  name: string;
}

export interface BasePromptRecord {
  recordId: string;
  title: string;
  categories: string[];
  prompt: string;
  attachments: BasePromptAttachment[];
}

export interface GeneratedPrompt {
  id: string;
  slug: string;
  title: string;
  categories: string[];
  prompt: string;
  attachments: string[];
}
