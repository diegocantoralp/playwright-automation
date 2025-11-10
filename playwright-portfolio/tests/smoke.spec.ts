import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';

test.describe('Smoke Suite - Critical Path Tests', () => {
  test('@smoke should load homepage and display title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto('https://example.com');
    const title = await homePage.getTitle();
    expect(title).toMatch(/example/i);
  });

  test('@smoke should display basic page structure', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto('https://example.com');
    await homePage.waitForPageLoad();
    
    // Verificar que el título no esté vacío
    const title = await homePage.getTitle();
    expect(title).not.toBe('');
    
    // Verificar que la página tenga contenido básico
    await expect(page.locator('h1')).toBeVisible();
  });
});