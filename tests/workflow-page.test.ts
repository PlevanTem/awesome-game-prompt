import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, it } from 'vitest';

import WorkflowPage from '../src/pages/workflows/character-production.astro';

describe('character production workflow', () => {
  it('renders the seven-stage reviewed workflow, carousel and 3D handoff', async () => {
    const container = await AstroContainer.create();
    const html = await container.renderToString(WorkflowPage);

    expect(html.match(/data-workflow-step/g)).toHaveLength(7);
    expect(html).toContain('ACCEPTANCE GATE');
    expect(html).toContain('USER REVIEW');
    expect(html).toContain('ORCHESTRATION PROMPT');
    expect(html).toContain('复制工作流提示');
    expect(html).not.toContain('SKILL.md');
    expect(html).toContain('WAITING FOR 3D REVIEW');
    expect(html).toContain('REPLY FORMAT');
    expect(html).toContain('/generated/workflows/athena-mecha/01-visual-research.png');
    expect(html).toContain('/generated/workflows/athena-mecha/04-final-design.png');
    expect(html).toContain('/generated/workflows/athena-mecha/05-orthographic-views.png');
    expect(html).toContain('/generated/workflows/athena-mecha/05-rigging-t-pose.png');
    expect(html).toContain('/generated/workflows/athena-mecha/05-rigging-a-pose-four-view.png');
    expect(html).toContain('/generated/workflows/athena-mecha/05-rigging-a-pose-four-view-equipped-color.png');
    expect(html).toContain('/generated/workflows/athena-mecha/06-white-model.png');
    expect(html).toContain('/generated/workflows/athena-mecha/07-tripo-generated-model.glb');
    expect(html).toContain('data-load-model');
    expect(html).toContain('data-gallery-next');
    expect(html).toContain('workflow-step__gallery--carousel');
    expect(html).toContain('下载原始 GLB');
    expect(html).toContain('1,989,089 triangles');
    expect(html).not.toContain('尚未生成');
    expect(html).toContain('application/ld+json');
    expect(html).toContain('HowToStep');
  });
});
