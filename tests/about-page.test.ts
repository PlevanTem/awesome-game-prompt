import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import AboutPage from '../src/pages/about.astro';

describe('about page', () => {
  it('explains the archive with the configured GitHub repository anchor', async () => {
    const repositoryUrl = 'https://git.example.test/open-source/prompt-forge';
    const originalRepositoryUrl = process.env.GITHUB_REPOSITORY_URL;
    process.env.GITHUB_REPOSITORY_URL = repositoryUrl;

    try {
      const container = await AstroContainer.create();
      const html = await container.renderToString(AboutPage);

      expect(html).toContain('Awesome Game Prompts');
      expect(html).toContain('面向实际制作环节');
      expect(html).toContain('我是卜凡');
      expect(html).toContain(': Wechat');
      expect(html).toContain('lelouchdbf');
      expect(html).toContain('https://plevantem.github.io/bufan.ux/');
      expect(html).toContain(`href="${repositoryUrl}"`);
      expect(html).not.toMatch(/tested|best|marketplace|community/i);
    } finally {
      if (originalRepositoryUrl === undefined) {
        delete process.env.GITHUB_REPOSITORY_URL;
      } else {
        process.env.GITHUB_REPOSITORY_URL = originalRepositoryUrl;
      }
    }
  });
});
