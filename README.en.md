# Awesome Game Prompts 🎮

[中文](./README.md)

> Turn AI image generation into a reviewable, reusable game-art workflow.

A public collection of tested prompts and composed workflows for character, environment, concept art, UI, VFX, and 3D production. Prompt entries preserve the original text and example output; workflows add stage inputs, outputs, acceptance gates, and a final handoff manifest.

[Open the site](https://plevantem.github.io/awesome-game-prompt/) · [Run the character-production workflow](https://plevantem.github.io/awesome-game-prompt/workflows/character-production/)

## More than a prompt gallery

One polished image does not solve the hard production questions: whether the character stays consistent across views, what a 3D artist receives, which stage failed, and which work should be rerun.

The first composed workflow blueprint connects existing prompts into six stages:

`source repair → design breakdown → four-view turnaround → T-pose → controlled variants → gray sculpt reference`

Every stage has an acceptance gate. The page also includes an orchestration prompt for GPT-6 ASTRA and other tool-using agents. The ASTRA section is currently an executable blueprint, not a claimed end-to-end benchmark.

## Evidence boundary

- Example images come from prompt records already stored in this repository.
- “Tested” means a prompt has an attached generated result. It does not guarantee stability across every model, source, or production condition.
- Stage examples come from separate prompt records, not one end-to-end character run, so they do not prove cross-stage consistency.
- The GPT-6 ASTRA section currently demonstrates orchestration design. Runtime, cost, success rate, and human-intervention counts still need a controlled benchmark.
- This repository is licensed under the [MIT License](./LICENSE).

## Explore by craft

- Character Design
- Environment
- Concept Art
- UI / UX
- VFX
- 3D Modeling / Texturing / Rendering

## Featured prompts and results

Prompt names open their GitHub Pages detail page, where **Copy prompt** copies the full prompt. Results use separate thumbnails; open the detail page for the full image.

| Category | Made for | Prompt | Result |
| --- | --- | --- | --- |
| Character Design | Consistent character references for modeling. | [Four-view turnaround](https://plevantem.github.io/awesome-game-prompt/prompt/prompt-b0f3js/) | [<img src="./public/generated/prompt-assets/thumbnails/recvs8dvb0f3js-0.png" width="160" alt="Four-view turnaround result">](https://plevantem.github.io/awesome-game-prompt/prompt/prompt-b0f3js/) |
| Character Design | Hair, costume, props, and expression breakdowns on one sheet. | [Character design breakdown](https://plevantem.github.io/awesome-game-prompt/prompt/prompt-mi2rst/) | [<img src="./public/generated/prompt-assets/thumbnails/recvs8iqmi2rst-0.png" width="160" alt="Character design breakdown result">](https://plevantem.github.io/awesome-game-prompt/prompt/prompt-mi2rst/) |
| 3D Modeling / Texturing / Rendering | Turn a white model into a material and lighting study. | [Clay render](https://plevantem.github.io/awesome-game-prompt/prompt/prompt-r2igzf/) | [<img src="./public/generated/prompt-assets/thumbnails/recvs8iyr2igzf-0.png" width="160" alt="Clay render result">](https://plevantem.github.io/awesome-game-prompt/prompt/prompt-r2igzf/) |
| 3D Modeling / Texturing / Rendering | Readable building form and structure at an isometric angle. | [Isometric building](https://plevantem.github.io/awesome-game-prompt/prompt/d-vd2val/) | [<img src="./public/generated/prompt-assets/thumbnails/recvs8jqvd2val-0.png" width="160" alt="Isometric building result">](https://plevantem.github.io/awesome-game-prompt/prompt/d-vd2val/) |

## Use it

1. Browse results by category on the website.
2. Expand a prompt and decide whether it fits your source and goal.
3. Select **Copy prompt**, paste it into your image model, and adapt it to the project.

Prompt bodies remain in their original language and detail. Use them with your own references, model capabilities, and commercial-use requirements in mind.

## Changelog

### 2026-09-09

- Added character-design prompts for outfit, hairstyle, age-range, and body-type variations.
- Added a 3D / environment prompt for creative asset kitbashing.
- The creative asset kitbash entry now includes a result image; the remaining coverage depends on each prompt record.

## Contribute

Start with a reproducible [workflow failure report](https://github.com/PlevanTem/awesome-game-prompt/issues/new?template=workflow-failure.yml): identify the failed stage, model version, input conditions, violated acceptance gate, and retry history.

The repository license has not been decided. Do not submit prompts or images that require a contribution license yet. The content contribution path will open after licensing is explicit.
