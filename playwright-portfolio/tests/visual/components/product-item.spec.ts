import { test, expect } from '@playwright/test';

test.describe('Visual - Component: Product Item', () => {
  test('@visual product-item baseline', async ({ page }) => {
    await page.goto('/components/product-item.html');
    const productItem = page.getByTestId('product-item');
    await expect(productItem).toBeVisible();
    await expect(productItem).toHaveScreenshot('product-item.png');
  });
});
