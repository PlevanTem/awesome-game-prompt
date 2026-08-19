import { getViteConfig } from 'astro/config';

export default getViteConfig({
  test: {
    fileParallelism: false,
    include: ['tests/**/*.test.ts'],
  },
});
