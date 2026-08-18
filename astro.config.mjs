import { defineConfig } from 'astro/config';

const base = process.env.BASE_PATH || '/';

export default defineConfig({
  output: 'static',
  site: process.env.SITE_URL || 'https://example.github.io',
  base,
});
