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

Set `FEISHU_BASE_TOKEN` and `FEISHU_TABLE_ID` in `.env.local`. You must also have an
authenticated `lark-cli` available locally. Keep all secret values local: `.env.local` must
never be committed.

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
