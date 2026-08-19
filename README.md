# Prompt Forge

Prompt Forge is a personal archive of game-art prompts. Prompt records are authored and
maintained in Feishu Base, then exported into this static site. The project is open-source
on GitHub.

## Local setup

Install the project dependencies:

```bash
npm install
```

Create a local environment file from the template:

```bash
cp .env.example .env.local
```

Set `FEISHU_BASE_TOKEN`, `FEISHU_TABLE_ID`, and `GITHUB_REPOSITORY_URL` in `.env.local`.
Use the canonical repository URL for `GITHUB_REPOSITORY_URL`; it is rendered as the About-page
link and is not a secret. You must also have an authenticated `lark-cli` available locally.
`npm run sync:feishu` loads `.env.local` automatically. Keep secret values local:
`.env.local` must never be committed.

## Local workflow

Synchronize the current Feishu Base records and attachments into generated site content:

```bash
npm run sync:feishu
```

Start the local development server:

```bash
npm run dev
```

Run the unit tests:

```bash
npm run test
```

Run the browser tests:

```bash
npm run test:e2e
```

Build the static site:

```bash
npm run build
```

To publish an update, edit the Feishu Base, run the sync command, review the generated
content, run the tests, commit the resulting changes, and push them.

## GitHub Pages deployment

Before the first deployment, push this repository to GitHub. In the repository, open
**Settings > Pages** and select **GitHub Actions** as the publishing source. Pushes to
`master` then run the deployment workflow; use the GitHub Pages URL shown by that workflow
after it completes.

Content changes are prepared locally: synchronize Feishu, review the generated content, run
the unit and browser tests, commit the reviewed changes, and push them to `master`. The
deployment workflow does not synchronize Feishu or use local credentials.
