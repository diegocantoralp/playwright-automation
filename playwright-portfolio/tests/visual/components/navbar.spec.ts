import { test, expect } from '@playwright/test';

test.describe('Visual - Component: Navbar', () => {
  test('@visual navbar baseline', async ({ page }) => {
    await page.goto('/components/navbar.html');
    const navbar = page.getByTestId('navbar');
    await expect(navbar).toBeVisible();
    await expect(navbar).toHaveScreenshot('navbar.png');
  });
});
