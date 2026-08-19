import { expect, test } from '@playwright/test';

const promptPath = '/prompt/prompt-b0f3js/';
const originalPrompt = '四宫格输出前、左、后、右四个正交视角。';

test('filters to the selected category', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'CHARACTERS' }).click();

  await expect(page.locator('[data-prompt-tile]:visible')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'CHARACTERS' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('opens the filtered prompt from random navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'CHARACTERS' }).click();
  await page.getByRole('button', { name: 'RANDOM PROMPT +' }).click();

  await expect(page).toHaveURL(promptPath);
});

test('copies the exact original prompt', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(promptPath);
  await page.getByRole('button', { name: 'COPY PROMPT +' }).click();

  await expect(page.getByRole('button', { name: 'COPIED' })).toBeVisible();
  await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(originalPrompt);
});

test('updates the primary attachment from gallery controls', async ({ page }) => {
  await page.goto(promptPath);
  const primaryImage = page.getByRole('img', { name: '经典四视图' });

  await page.getByRole('button', { name: 'Show image 2' }).click();

  await expect(primaryImage).toHaveAttribute(
    'src',
    '/generated/e2e-fixtures/recvs8dvb0f3js-1.svg',
  );
  await expect(page.getByRole('button', { name: 'Show image 2' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('renders fixture pages with a visible attachment and in-viewport copy control', async (
  { page },
  testInfo,
) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'GAME ART PROMPTS, INDEXED.' })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`homepage-${testInfo.project.name}.png`),
    fullPage: true,
  });

  await page.goto(promptPath);
  await expect(page.getByRole('img', { name: '经典四视图' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'COPY PROMPT +' })).toBeInViewport();
  await page.screenshot({
    path: testInfo.outputPath(`detail-${testInfo.project.name}.png`),
    fullPage: true,
  });
});
