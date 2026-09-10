export interface WorkflowStep {
  number: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  output: string;
  outputZh: string;
  promptSlug: string;
  promptTitle: string;
  image?: string;
  gate: string;
  gateZh: string;
}

export const characterProductionWorkflow = {
  slug: 'character-production',
  title: 'Reference to Rig-Ready Character Pack',
  titleZh: '从参考图到可绑定角色交付包',
  description:
    'A reproducible AI game-art workflow blueprint for turning one character reference into a complete source image, design breakdown, turnaround, rigging pose, variants, and 3D handoff reference.',
  descriptionZh:
    '把一张角色参考图逐步转成完整全身图、设计拆解、四视图、绑定姿势、角色变体与 3D 交接参考。',
  steps: [
    {
      number: '01',
      title: 'Repair the source',
      titleZh: '修复源图',
      description: 'Complete cropped or occluded anatomy before any downstream generation inherits the missing information.',
      descriptionZh: '先补全被裁切或遮挡的身体与服装，避免缺失信息污染后续生成。',
      output: 'One complete, readable full-body source image.',
      outputZh: '一张完整、清晰、可读的全身源图。',
      promptSlug: 'prompt-pywn1f',
      promptTitle: '角色补全',
      image: '/generated/prompt-assets/recvs8iwpywn1f-1.png',
      gate: 'No cropped limbs; silhouette and costume remain faithful to the source.',
      gateZh: '肢体无裁切；轮廓与服装忠于原始素材。',
    },
    {
      number: '02',
      title: 'Make the design explicit',
      titleZh: '显式拆解设计',
      description: 'Separate hair, clothing, props, expressions, and identifying marks into a reviewable design sheet.',
      descriptionZh: '把发型、服装、道具、表情与识别特征拆成可审查的设定页。',
      output: 'A character design breakdown with visible components.',
      outputZh: '一张部件清晰可见的角色设计拆解图。',
      promptSlug: 'prompt-mi2rst',
      promptTitle: '角色设定拆解',
      image: '/generated/prompt-assets/recvs8iqmi2rst-0.png',
      gate: 'Every identity-critical detail appears once and is readable.',
      gateZh: '每个影响角色身份的细节都至少清晰出现一次。',
    },
    {
      number: '03',
      title: 'Lock the turnaround',
      titleZh: '锁定四视图',
      description: 'Generate front, left, back, and right orthographic views with shared scale, materials, and construction.',
      descriptionZh: '生成比例、材质与结构一致的前、左、后、右正交视图。',
      output: 'A four-view turnaround for modeling review.',
      outputZh: '一张供建模评审的四视图。',
      promptSlug: 'prompt-b0f3js',
      promptTitle: '经典四视图',
      image: '/generated/prompt-assets/recvs8dvb0f3js-0.png',
      gate: 'View directions are correct; proportions and details do not drift between panels.',
      gateZh: '视图方向正确；各格比例和细节不漂移。',
    },
    {
      number: '04',
      title: 'Prepare for rigging',
      titleZh: '准备绑定姿势',
      description: 'Move the approved design into a neutral T-pose while keeping identity, costume, and proportions fixed.',
      descriptionZh: '在角色身份、服装和比例不变的前提下，把已确认设计转成中性 T Pose。',
      output: 'A rigging reference with unobstructed limbs.',
      outputZh: '一张四肢无遮挡的绑定参考图。',
      promptSlug: 't-pose-lufduf',
      promptTitle: 'T Pose',
      image: '/generated/prompt-assets/recvs8ihlufduf-0.png',
      gate: 'Symmetry, anatomy, hand visibility, and costume continuity pass review.',
      gateZh: '对称性、解剖、手部可见性与服装连续性全部通过。',
    },
    {
      number: '05',
      title: 'Explore controlled variants',
      titleZh: '生成可控变体',
      description: 'Change one variable at a time—outfit, hair, age, or body type—against the locked identity reference.',
      descriptionZh: '基于锁定的角色身份，一次只改变服饰、发型、年龄或体型中的一个变量。',
      output: 'Comparable variant sheets without uncontrolled redesign.',
      outputZh: '一组可横向比较、没有失控重设计的变体图。',
      promptSlug: 'outfit-sheet-260909',
      promptTitle: '服饰衍生',
      image: '/generated/prompt-assets/local-20260909-outfit-sheet-0.jpg',
      gate: 'Only the requested variable changes; face, palette, and signature details stay recognizable.',
      gateZh: '只有指定变量发生变化；面部、配色和标志细节仍可辨认。',
    },
    {
      number: '06',
      title: 'Hand off the form',
      titleZh: '交接几何结构',
      description: 'Remove color and material noise so a 3D artist can judge geometry, volume, folds, and hard-surface transitions.',
      descriptionZh: '移除颜色和材质干扰，让 3D 美术能判断几何、体积、褶皱和硬表面转折。',
      output: 'A neutral gray sculpt reference for the 3D handoff.',
      outputZh: '一张用于 3D 交接的中性灰雕刻参考图。',
      promptSlug: 'prompt-d93pto',
      promptTitle: '提取主体转灰模',
      image: '/generated/prompt-assets/recvs8j4d93pto-0.png',
      gate: 'Geometry reads without textures; no important construction detail is lost.',
      gateZh: '没有贴图仍能读清几何；重要结构细节没有丢失。',
    },
  ] satisfies WorkflowStep[],
} as const;

export const astraOrchestratorPrompt = `You are the production coordinator for a game-character art pipeline.

Goal: turn the supplied character reference into a reviewable, rig-ready handoff pack. Use the six workflow stages on this page in order. Treat every accepted output as the reference for the next stage.

For each stage:
1. Inspect the current reference and list missing or ambiguous identity details.
2. Prepare the image-generation prompt from the linked template, replacing vague language with facts visible in the reference.
3. Ask the image tool to generate the stage output.
4. Evaluate the result against that stage's acceptance gate. Report PASS or FAIL with concrete evidence.
5. If it fails, revise only the cause of failure and retry. Do not silently redesign the character.
6. Save a compact handoff record: source used, prompt version, accepted output, rejected defects, and unresolved uncertainty.

Stop for human art direction after the design breakdown and four-view turnaround. If I change a requirement while you are working, preserve accepted stages unless the change invalidates them. At the end, return a manifest of every accepted artifact and any unresolved risk.`;
