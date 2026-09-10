import type { APIRoute } from 'astro';

import { getArchivePrompts } from '../data/archive';

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;');

export const GET: APIRoute = async ({ site }) => {
  const configuredBase = process.env.BASE_PATH || '/';
  const base = configuredBase.endsWith('/') ? configuredBase : `${configuredBase}/`;
  const origin = site ?? new URL('https://plevantem.github.io');
  const prompts = await getArchivePrompts();
  const paths = [
    '',
    'about/',
    'workflows/character-production/',
    ...prompts.map((prompt) => `prompt/${prompt.slug}/`),
  ];
  const urls = paths.map((path) => `  <url><loc>${escapeXml(new URL(`${base}${path}`, origin).toString())}</loc></url>`).join('\n');

  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
};
