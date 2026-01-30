import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:3001';

test.describe('Whiteboard Basic Functionality', () => {
  test('app loads and shows canvas', async ({ page }) => {
    await page.goto(BASE_URL);

    const strokeCanvas = page.locator('canvas.stroke');
    await expect(strokeCanvas).toBeVisible();

    const backgroundCanvas = page.locator('canvas.background');
    await expect(backgroundCanvas).toBeVisible();
  });

  test('clear button exists and is clickable', async ({ page }) => {
    await page.goto(BASE_URL);

    const clearButton = page.locator('button.clear');
    await expect(clearButton).toBeVisible();
    await expect(clearButton).toBeEnabled();

    await clearButton.click();
  });

  test('reset button exists and is clickable', async ({ page }) => {
    await page.goto(BASE_URL);

    const resetButton = page.locator('button.reset');
    await expect(resetButton).toBeVisible();
    await expect(resetButton).toBeEnabled();

    await resetButton.click();
  });

  test('erase mode activates with e key', async ({ page }) => {
    await page.goto(BASE_URL);

    const canvas = page.locator('canvas.stroke');

    await page.keyboard.down('e');

    const hasEraseClass = await canvas.evaluate((el) =>
      el.classList.contains('erase-mode')
    );

    expect(hasEraseClass).toBe(true);

    await page.keyboard.up('e');

    const stillHasEraseClass = await canvas.evaluate((el) =>
      el.classList.contains('erase-mode')
    );

    expect(stillHasEraseClass).toBe(false);
  });

  test('background picker is visible', async ({ page }) => {
    await page.goto(BASE_URL);

    const picker = page.locator('#background-picker');
    await expect(picker).toBeVisible();

    const blankButton = page.locator('button[data-bg="blank"]');
    await expect(blankButton).toBeVisible();

    const natureButton = page.locator('button[data-bg="nature"]');
    await expect(natureButton).toBeVisible();
  });

  test('background button can be clicked', async ({ page }) => {
    await page.goto(BASE_URL);

    const natureButton = page.locator('button[data-bg="nature"]');
    await natureButton.click();

    // Wait a bit for background to load
    await page.waitForTimeout(500);
  });
});

