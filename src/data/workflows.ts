export interface WorkflowStep {
  number: string;
  title: string;
  titleZh: string;
  description: string;
  descriptionZh: string;
  output: string;
  outputZh: string;
  images: readonly string[];
  gate: string;
  gateZh: string;
  review: string;
  reviewZh: string;
  prompt: string;
  options?: readonly string[];
  model?: {
    src: string;
    poster: string;
    alt: string;
    stats: readonly string[];
  };
}

const identity = `adult mechanical female warrior; calm strategic face; dark cobalt braided cable hair; owl-sensor crown; ivory ceramic armor; aged bronze structure; deep navy flexible under-suit; narrow amber lights; round aegis shield with an abstract serpent-ring motif; transforming spear; left-shoulder short cape`;

export const characterProductionWorkflow = {
  slug: 'character-production',
  title: 'Athena-Inspired Mecha Character: Model Handoff',
  titleZh: '从角色概念设计到模型交付',
  description: 'A user-reviewed image-generation workflow that preserves one character identity from myth-inspired visual research through exploration, final design, modeling views, and a neutral white-model handoff.',
  descriptionZh: '以雅典娜神话意象为起点，在人的关键确认下，把同一机械少女从视觉调研、方案探索推进到定稿、建模视图与中性白模交付。',
  steps: [
    {
      number: '01', title: 'Research and set the visual language', titleZh: '调研并确定视觉语言',
      description: 'Translate Athena motifs into an original, buildable game-character language: owl sensor, aegis shield, spear, strategic temperament, armor materials and palette.',
      descriptionZh: '把猫头鹰、神盾、长矛与战略气质转译为原创、可制作的游戏角色语言，并确定材质与配色。',
      output: 'Visual-research board with a central concept sketch and construction studies.', outputZh: '包含主概念草图、装备结构和材质研究的视觉板。',
      images: ['/generated/workflows/athena-mecha/01-visual-research.png'],
      gate: 'The mythology reference is recognizable without copying an existing franchise; body, joints, weapon and material system are readable.',
      gateZh: '神话来源可辨识但不复制现有 IP；身型、关节、武器和材质体系清楚。',
      review: 'User confirms mythology intensity, mechanical level, palette and material direction before exploration.',
      reviewZh: '用户确认神话元素浓度、机械化程度、配色与材质方向后再探索。',
      prompt: `Create an original adult mechanical female warrior inspired by Athena. Establish this continuity contract: ${identity}. Produce a landscape visual-research board with one complete central figure and close studies of crown, shield, spear, armor seams and materials. AAA game concept art, graphite and ink with restrained color. Functional joints, adult proportions, no text, logos, watermark, sexualized armor, high heels or cropped anatomy.`,
    },
    {
      number: '02', title: 'Explore silhouettes and combat roles', titleZh: '探索轮廓与战斗定位',
      description: 'Create six comparable directions by changing mass distribution and tactical role while keeping the approved identity and material anchors.',
      descriptionZh: '保持已确认的身份与材质锚点，只改变体量分布和战斗定位，生成六个可横向比较的方向。',
      output: 'Six full-body directions: scout, commander, guardian, strategist, lancer and urban defender.', outputZh: '六个全身方向：侦察、指挥、守卫、谋略、破甲与城战。',
      images: ['/generated/workflows/athena-mecha/02-silhouette-exploration.png'],
      gate: 'Exactly six readable full-body options; the same person, palette, shield, spear and owl crown remain recognizable.',
      gateZh: '六个全身方案清晰可比；同一面部、配色、神盾、长矛和猫头鹰冠保持可辨认。',
      review: 'User selects one option or specifies which parts to combine. Do not refine a direction before this choice.',
      reviewZh: '用户选择一个方案，或指定组合哪些部分；确认前不得继续细化。',
      options: ['01 轻装长矛侦察', '02 均衡战场指挥', '03 重盾守卫', '04 礼仪谋略', '05 锐角破甲枪骑', '06 紧凑城战防卫'],
      prompt: `Use the approved stage-01 board as the identity reference. Generate exactly six full-body directions in a 2 × 3 sheet: lightweight spear scout, balanced field commander, shield-heavy guardian, ceremonial strategist, angular anti-armor lancer, compact urban defender. Preserve ${identity}. Equal scale, clean gutters, no labels, color drift, unrelated faces, cropped feet or extra limbs.`,
    },
    {
      number: '03', title: 'Derive outfit and physique variants', titleZh: '衍生服装与身型方案',
      description: 'On the chosen direction, vary outfit construction and physique in controlled groups so the user can decide what actually improves the role.',
      descriptionZh: '基于选定方向，分组控制服装结构与身型变化，让用户判断哪些变化真正强化角色定位。',
      output: 'Two comparable sheets: outfit variants and physique variants.', outputZh: '两张可比较的设定页：服装衍生与身型衍生。',
      images: ['/generated/workflows/athena-mecha/03a-outfit-variants.png', '/generated/workflows/athena-mecha/03b-physique-variants.png'],
      gate: 'Each row changes one variable only; face, palette, equipment language and signature motifs stay fixed.',
      gateZh: '每一组只改变一个变量；面部、配色、装备语言与标志意象保持不变。',
      review: 'User confirms the outfit and physique combination to carry into final design.',
      reviewZh: '用户确认进入定稿的服装与身型组合。',
      prompt: `Use only the user-selected stage-02 direction and make two separate image-generation calls. IMAGE A — create four outfit-construction variants at equal scale; change clothing and armor construction only. IMAGE B — create four physique/proportion variants at equal scale; change body mass and proportion only. In both images preserve ${identity}. Keep pose, camera, face, palette, shield and spear comparable. No labels, redesign drift or mixed variables.`,
    },
    {
      number: '04', title: 'Lock the final character design', titleZh: '锁定最终角色设计',
      description: 'Combine only the approved direction, outfit and physique into one authoritative character sheet with front three-quarter, back three-quarter and detail callouts.',
      descriptionZh: '只组合已确认的方向、服装与身型，形成包含前后角度和关键结构细节的权威定稿页。',
      output: 'Approved final-design master used by every downstream stage.', outputZh: '后续所有阶段唯一使用的角色定稿母版。',
      images: ['/generated/workflows/athena-mecha/04-final-design.png'],
      gate: 'Front and back construction agree; joints, cape attachment, shield grip and spear storage are unambiguous.',
      gateZh: '正背结构一致；关节、披风连接、持盾方式和长矛收纳清楚。',
      review: 'User signs off the final design before any modeling reference is generated.',
      reviewZh: '用户确认角色定稿后，才能生成建模参考。',
      prompt: `Use the user attachment as STYLE REFERENCE ONLY: adopt crisp anime cel-shading, clean line art, sci-fi military mecha-girl hard-surface rendering and cyberpunk signal lights; do not inherit its character identity, pink hair, costume, cable tail, pose or equipment. Use direction 04 ceremonial strategist, Outfit C segmented armored peplos and Physique B balanced athletic commander. Create an authoritative landscape final sheet for the same ${identity}: large front three-quarter hero view, matching back three-quarter view, and close-ups of face/owl crown, cape mount, joints, shield grip and spear storage. Render in a premium naval sci-fi anime gacha-game finish similar to Azur Lane without copying any existing character or design. Use graphite black, cool white, deep navy, electric cyan, restrained hot magenta and small aged-bronze Athena trims. Replace raised heels with broad flat mechanical combat feet. No text, logos or watermark.`,
    },
    {
      number: '05', title: 'Prepare modeling and rigging views', titleZh: '准备建模与绑定视图',
      description: 'Convert the approved master into aligned orthographic views and a neutral rigging pose without redesigning the character.',
      descriptionZh: '把已确认母版转成对齐的正交视图与中性绑定姿势，不允许重新设计角色。',
      output: 'Front, side and back orthographic views, an unobstructed T-pose, and neutral-clay plus colored-equipped 2 × 2 A-pose turnarounds.', outputZh: '前、侧、后正交视图、四肢无遮挡的 T Pose，以及白模版和上色装备版 2 × 2 A-Pose 四视图。',
      images: ['/generated/workflows/athena-mecha/05-orthographic-views.png', '/generated/workflows/athena-mecha/05-rigging-t-pose.png', '/generated/workflows/athena-mecha/05-rigging-a-pose-four-view.png', '/generated/workflows/athena-mecha/05-rigging-a-pose-four-view-equipped-color.png'],
      gate: 'Shared scale and landmarks align; accessories do not hide joints; front/back details remain consistent.',
      gateZh: '比例与关键点对齐；配件不遮挡关节；正背细节一致。',
      review: 'User checks construction completeness before the white-model handoff.',
      reviewZh: '用户检查结构完整性，通过后进入白模交付。',
      prompt: `Use the approved stage-04 master as the sole design reference. IMAGE A — aligned front, side and back orthographic views of the exact same character. IMAGE B — a symmetrical T-pose with cape, shield and spear removed from the body and shown beside it as separate parts. IMAGE C — an evenly divided 2 × 2 neutral-clay A-pose sheet ordered front, back, left side and right side, with identical scale and no held equipment. IMAGE D — repeat the same 2 × 2 A-pose grid in the approved full-color materials, with the character holding exactly one shield on the left arm and one vertical spear in the right hand in every view. Preserve proportions, panel seams and joint landmarks. Flat neutral lighting, no perspective distortion, labels, text or watermark.`,
    },
    {
      number: '06', title: 'Deliver the neutral white model', titleZh: '交付中性白模',
      description: 'Translate the approved construction into a material-neutral sculpt presentation so modeling can be reviewed without color or texture noise.',
      descriptionZh: '把确认后的结构转成材质中性的雕刻展示，排除颜色和贴图对几何判断的干扰。',
      output: 'Neutral white/clay front three-quarter and back three-quarter model renders with separate shield and spear.', outputZh: '中性白色/黏土材质的前后 3/4 白模，以及独立神盾和长矛。',
      images: ['/generated/workflows/athena-mecha/06-white-model.png'],
      gate: 'Silhouette, volumes, seams and articulation match the approved design; no texture is used to fake geometry.',
      gateZh: '轮廓、体积、结构缝和活动关节匹配定稿；不得用贴图伪造几何。',
      review: 'User accepts the handoff or identifies exact geometry to revise. Re-run only the affected stage.',
      reviewZh: '用户验收交付，或指出需修改的具体几何；只重跑受影响阶段。',
      prompt: `Use the approved stage-05 views as construction reference. Render the same character as a neutral matte-white clay hard-surface model: front three-quarter and back three-quarter on a gray studio turntable, with shield and spear presented separately. No color, texture decals, glow, cloth simulation, environment, text or watermark. Geometry must carry every panel seam, volume transition and articulation point.`,
    },
    {
      number: '07', title: 'Review the generated 3D model', titleZh: '交互验收 Tripo 3D 模型',
      description: 'Load the GLB generated in Tripo AI from the approved multi-view references and inspect silhouette, equipment, materials and back-side continuity interactively.',
      descriptionZh: '加载用户基于已确认多视图在 Tripo AI 中生成的 GLB，交互检查轮廓、装备、材质与背面连续性。',
      output: 'Interactive textured GLB review with recorded file and geometry facts.', outputZh: '可旋转、缩放的贴图 GLB 验收视图，以及可核验的模型结构信息。',
      images: [],
      gate: 'The model loads in-browser; front, side and back remain inspectable; identity and equipment survive reconstruction; known production limits are stated.',
      gateZh: '模型可在浏览器加载；正侧背均可检查；角色身份与装备在重建后仍可辨认；生产限制被明确记录。',
      review: 'User rotates and zooms the model, then accepts the 3D handoff or names exact geometry, texture or optimization changes.',
      reviewZh: '用户旋转、缩放检查模型，然后确认 3D 交付，或指出具体几何、贴图与性能修改项。',
      prompt: `REPRODUCTION NOTE — the exact Tripo AI submission prompt was not supplied, so this is not presented as the original provider prompt.\n\nSubject: the approved Athena-inspired adult mechanical female warrior.\nShape: balanced athletic commander proportions in a neutral A-pose, with segmented armor, broad flat mechanical feet, round shield and vertical transforming spear.\nMaterial: ivory ceramic armor, aged bronze structure, deep-navy flexible layers and restrained cyan/magenta signal lights.\nKey details: owl-sensor crown, braided cable hair, left-shoulder cape, readable joints, shield grip and consistent front/back construction.\nStyle: anime cel-shaded mecha warrior translated into coherent textured 3D game-character geometry.\n\nUse the approved front, back, left and right images as a single identity set. Do not invent a different face, duplicate equipment, fuse the shield into the torso, close the limb gaps or crop the spear.`,
      model: {
        src: '/generated/workflows/athena-mecha/07-tripo-generated-model.glb',
        poster: '/generated/workflows/athena-mecha/05-rigging-a-pose-four-view-equipped-color.png',
        alt: 'Interactive 3D model of the Athena-inspired mechanical warrior generated with Tripo AI',
        stats: ['61.1 MB GLB', '1 mesh · 1 material', '1,053,500 vertices', '1,989,089 triangles', '3 embedded JPEG texture maps', 'No rig · no animation'],
      },
    },
  ] satisfies WorkflowStep[],
} as const;
