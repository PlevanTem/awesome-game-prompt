import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const workflowPath = fileURLToPath(
  new URL('../.github/workflows/deploy.yml', import.meta.url),
);

describe('GitHub Pages deployment workflow', () => {
  it('runs the local quality gates before deploying the repository-scoped build', async () => {
    const workflow = await readFile(workflowPath, 'utf8');

    expect(workflow).toContain('branches: [master]');
    expect(workflow).toContain('contents: read');
    expect(workflow).toContain('pages: write');
    expect(workflow).toContain('id-token: write');
    expect(workflow).toContain('actions/checkout@v6');
    expect(workflow).toContain('actions/setup-node@v7');
    expect(workflow).toContain('actions/configure-pages@v5');
    expect(workflow).toContain('actions/upload-pages-artifact@v4');
    expect(workflow).toContain('actions/deploy-pages@v5');
    expect(workflow).toContain('npm ci');
    expect(workflow).toContain('npm run test');
    expect(workflow).toContain('npx playwright install --with-deps chromium');
    expect(workflow).toContain('npm run test:e2e');
    expect(workflow).toContain('BASE_PATH: /${{ github.event.repository.name }}');
    expect(workflow).toContain('GITHUB_REPOSITORY_URL: ${{ github.server_url }}/${{ github.repository }}');
    expect(workflow).toContain('npm run build');
    expect(workflow).toContain('path: ./dist');
    expect(workflow).not.toContain('sync:feishu');
  });
});
