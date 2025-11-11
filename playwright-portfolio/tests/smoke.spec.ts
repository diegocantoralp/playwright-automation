import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';

test.describe('Smoke Suite - Critical Path Tests', () => {
  test('@smoke should load homepage and display title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open(); // Usar open() en lugar de goto()
    const title = await homePage.getTitle();
    expect(title).toMatch(/example/i);
  });

  test('@smoke should display basic page structure', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open(); // Usar open() en lugar de goto()
    
    // Verificar que el título no esté vacío
    const title = await homePage.getTitle();
    expect(title).not.toBe('');
    
    // Verificar que la página tenga contenido básico
    const areElementsVisible = await homePage.areMainElementsVisible();
    expect(areElementsVisible).toBe(true);
  });

  test('@smoke should display correct content', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    
    // Verificar contenido específico
    const heading = await homePage.getMainHeading();
    expect(heading).toBe('Example Domain');
    
    const description = await homePage.getDescription();
    expect(description).toContain('This domain is for use in illustrative examples');
  });
});