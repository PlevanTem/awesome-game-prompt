import { expect, test } from '@playwright/test';

const promptPath = '/prompt/prompt-b0f3js/';
const originalPrompt = '四宫格输出前、左、后、右四个正交视角。';

test('filters to the selected category', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '角色设计' }).click();

  await expect(page.locator('[data-prompt-tile]:visible')).toHaveCount(1);
  await expect(page.getByRole('button', { name: '角色设计' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
});

test('opens the filtered prompt from random navigation', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '角色设计' }).click();
  await page.getByRole('button', { name: '随机查看 +' }).click();

  await expect(page).toHaveURL(promptPath);
});

test('copies the exact original prompt', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto(promptPath);
  await page.getByRole('button', { name: '复制提示词' }).click();

  await expect(page.getByRole('button', { name: '已复制' })).toBeVisible();
  await expect(page.evaluate(() => navigator.clipboard.readText())).resolves.toBe(originalPrompt);
});


test('switches interface labels to English', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'EN' }).click();

  await expect(page.getByRole('link', { name: 'PROMPTS', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'CHARACTERS' })).toBeVisible();
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
  await expect(page.getByRole('heading', { name: '把 AI 出图变成生产流程' })).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath(`homepage-${testInfo.project.name}.png`),
    fullPage: true,
  });

  await page.goto(promptPath);
  await expect(page.getByRole('img', { name: '经典四视图' })).toBeVisible();
  await expect(page.getByRole('button', { name: '复制提示词' })).toBeInViewport();
  await page.screenshot({
    path: testInfo.outputPath(`detail-${testInfo.project.name}.png`),
    fullPage: true,
  });
});
