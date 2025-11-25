import { test, expect } from '@playwright/test';

test.describe('Visual - Component: Card', () => {
  test('@visual card baseline', async ({ page }) => {
    await page.goto('/components/card.html');
    const card = page.getByTestId('card');
    await expect(card).toBeVisible();
    await expect(card).toHaveScreenshot('card.png');
  });
});
