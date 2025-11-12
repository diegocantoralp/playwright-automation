import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home-page';

test.describe('Smoke Suite - Critical Path Tests', () => {
  test('@smoke should load homepage and display title', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    
    const title = await homePage.getTitle();
    expect(title).toMatch(/example/i);
  });

  test('@smoke should display basic page structure', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    
    // Verificar que el título no esté vacío
    const title = await homePage.getTitle();
    expect(title).not.toBe('');
    expect(title).toContain('Example Domain');
    
    // Verificar que la página tenga contenido básico usando método mejorado
    const areElementsVisible = await homePage.areMainElementsVisible();
    expect(areElementsVisible).toBe(true);
    
    // Verificar contenido esperado usando método específico
    const hasExpectedContent = await homePage.hasExpectedContent();
    expect(hasExpectedContent).toBe(true);
  });

  test('@smoke should display correct content', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    
    // Verificar contenido específico del heading
    const heading = await homePage.getMainHeading();
    expect(heading).toBe('Example Domain');
    
    // Verificar contenido del párrafo principal - TEXTO CORREGIDO
    const description = await homePage.getDescription();
    expect(description).toContain('This domain is for use in documentation examples');
    
    // Opcional: verificar que existe el enlace "More information"
    await expect(page.locator('a[href*="iana.org"]')).toBeVisible();
  });

  test('@smoke should handle multiple paragraphs correctly', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.open();
    
    // Obtener todos los párrafos para debug
    const allParagraphs = await homePage.getAllParagraphs();
    console.log('Found paragraphs:', allParagraphs);
    
    // Verificar que hay al menos 1 párrafo
    expect(allParagraphs.length).toBeGreaterThan(0);
    
    // Verificar contenido del primer párrafo - TEXTO CORREGIDO
    const mainDescription = await homePage.getDescription();
    expect(mainDescription).toContain('This domain is for use in documentation examples');
  });
});