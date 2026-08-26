import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import PromptDetailPage from '../src/pages/prompt/[slug].astro';
import type { GeneratedPrompt } from '../src/data/types';

const prompts: GeneratedPrompt[] = [
  {
    id: 'rec-current',
    slug: 'prompt-rec-current',
    title: '经典四视图',
    categories: ['角色设计'],
    prompt: '四宫格输出前、左、后、右四个正交视角。\n保留原始换行与空格。',
    attachments: [
      '/generated/prompt-assets/rec-current-0.png',
      '/generated/prompt-assets/rec-current-1.png',
    ],
  },
  {
    id: 'rec-next',
    slug: 'prompt-rec-next',
    title: '下一个提示词',
    categories: ['场景设计'],
    prompt: '下一条原始提示词。',
    attachments: [],
  },
];

describe('static prompt detail page', () => {
  it('renders a prompt verbatim with accessible gallery controls and the next archive link', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(PromptDetailPage, {
      props: { prompt: prompts[0], promptIndex: 0, archivePrompts: prompts },
    });

    expect(html).toContain('原始提示词');
    expect(html).toContain('复制提示词');
    expect(html).toContain('Show image 1');
    expect(html).toContain('Show image 2');
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('/prompt/prompt-rec-next/');

    const renderedPrompt = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/)?.[1];
    expect(renderedPrompt).toBe('四宫格输出前、左、后、右四个正交视角。\n保留原始换行与空格。');
  });
});
