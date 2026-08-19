import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import AboutPage from '../src/pages/about.astro';

describe('about page', () => {
  it('explains the archive without unsupported promotional claims', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(AboutPage);

    expect(html).toContain('Prompt Forge');
    expect(html).toContain('Feishu Base');
    expect(html).toContain('GitHub');
    expect(html).not.toMatch(/tested|best|marketplace|community/i);
  });
});
