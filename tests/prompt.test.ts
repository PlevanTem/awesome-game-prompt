import { describe, expect, it } from 'vitest';
import { categoryLabels } from '../src/data/categories';
import { makeSlug, toGeneratedPrompt } from '../src/data/prompt';

describe('categoryLabels', () => {
  it('maps each approved Base category to its display label', () => {
    expect(categoryLabels).toEqual({
      '角色设计': 'CHARACTER DESIGN',
      '场景设计': 'ENVIRONMENT',
      '原画设计': 'CONCEPT ART',
      'UI/UX 美术': 'UI / UX',
      '动画与特效': 'VFX',
      '3D建模/贴图/渲染': '3D',
    });
  });
});

describe('makeSlug', () => {
  it('keeps Chinese titles routable and adds an ID suffix', () => {
    expect(makeSlug('经典四视图', 'recvs8dvb0F3Js')).toBe('prompt-b0f3js');
  });
});

describe('toGeneratedPrompt', () => {
  it('preserves original prompt text and maps attachment paths', () => {
    const result = toGeneratedPrompt({
      recordId: 'recvs8dvb0F3Js',
      title: '经典四视图',
      categories: ['角色设计'],
      prompt: '四宫格输出前、左、后、右四个正交视角。',
      attachments: [{ fileToken: 'fileA', name: 'image.png' }],
    });

    expect(result.id).toBe('recvs8dvb0F3Js');
    expect(result).not.toHaveProperty('recordId');
    expect(result.prompt).toBe('四宫格输出前、左、后、右四个正交视角。');
    expect(result.attachments).toEqual([
      '/generated/prompt-assets/recvs8dvb0f3js-0.png',
    ]);
  });

  it('throws when the source title is blank', () => {
    expect(() =>
      toGeneratedPrompt({
        recordId: 'recMissingTitle',
        title: '   ',
        categories: [],
        prompt: 'A preserved prompt.',
        attachments: [],
      }),
    ).toThrow('Missing title for record recMissingTitle');
  });

  it('throws when the source prompt is blank', () => {
    expect(() =>
      toGeneratedPrompt({
        recordId: 'recMissingPrompt',
        title: 'Concept',
        categories: [],
        prompt: '   ',
        attachments: [],
      }),
    ).toThrow('Missing prompt for record recMissingPrompt');
  });

  it('accepts records without attachments', () => {
    const result = toGeneratedPrompt({
      recordId: 'recNoAssets',
      title: 'Concept',
      categories: [],
      prompt: 'No image reference.',
      attachments: [],
    });

    expect(result.attachments).toEqual([]);
  });
});
