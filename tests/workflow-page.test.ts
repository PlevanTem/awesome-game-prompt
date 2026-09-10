import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import WorkflowPage from '../src/pages/workflows/character-production.astro';

describe('character production workflow', () => {
  it('renders six gated stages and the ASTRA orchestration prompt', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WorkflowPage);

    expect(html.match(/class="workflow-step"/g)).toHaveLength(6);
    expect(html).toContain('ACCEPTANCE GATE');
    expect(html).toContain('GPT-6 ASTRA ORCHESTRATION BLUEPRINT');
    expect(html).toContain('/prompt/prompt-b0f3js/');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('HowToStep');
  });
});
