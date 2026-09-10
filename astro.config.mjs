import { defineConfig } from 'astro/config';

const base = process.env.BASE_PATH || '/';
const useE2EFixtures = process.env.PROMPT_FORGE_E2E_FIXTURES === '1';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://plevantem.github.io',
  base,
  publicDir: useE2EFixtures ? './tests/fixtures/e2e-public' : './public',
});
