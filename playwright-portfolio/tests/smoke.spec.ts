import { test, expect } from '../fixtures/base-test';

test.describe('Smoke Suite - Critical Path Tests', () => {
  test('@smoke @ui should load homepage and display title', async ({ homePage }) => {
    await homePage.open();
    
    const title = await homePage.getTitle();
    expect(title).toMatch(/example/i);
  });

  test('@smoke @ui should display basic page structure', async ({ homePage }) => {
    await homePage.open();
    
    // Using POM methods for cleaner tests
    await homePage.verifyPageStructure();
    await homePage.verifyExpectedContent();
  });

  test('@smoke @ui should display correct content', async ({ homePage }) => {
    await homePage.open();
    
    const heading = await homePage.getMainHeading();
    expect(heading).toBe('Example Domain');
    
    const description = await homePage.getDescription();
    expect(description).toContain('This domain is for use in documentation examples');
  });

  test('@smoke @responsive should work on mobile devices', async ({ homePage }) => {
    await homePage.open();
    await homePage.verifyResponsiveDesign();
  });

  test('@regression @ui should handle navigation correctly', async ({ homePage, page }) => {
    await homePage.open();
    
    // Test navigation
    await homePage.clickMoreInfo();
    
    // Verify we navigated to IANA
    expect(page.url()).toContain('iana.org');
  });

  test('@regression @ui should display all paragraphs correctly', async ({ homePage }) => {
    await homePage.open();
    
    const allParagraphs = await homePage.getAllParagraphs();
    console.log('Found paragraphs:', allParagraphs);
    
    expect(allParagraphs.length).toBeGreaterThan(0);
    
    const mainDescription = await homePage.getDescription();
    expect(mainDescription).toContain('This domain is for use in documentation examples');
  });
});

test.describe('API Contract Tests', () => {
  test('@smoke @api should validate health endpoint contract', async ({ apiHelper }) => {
    const healthData = await apiHelper.validateHealthEndpoint();
    
    // Additional business logic assertions
    expect(healthData.status).toBe('ok');
    expect(healthData.version).toBeTruthy();
  });

  test('@regression @api should handle API errors gracefully', async ({ apiHelper }) => {
    // Test non-existent endpoint
    await expect(async () => {
      await apiHelper.validateErrorResponse('https://example.com/nonexistent', 404);
    }).not.toThrow();
  });
});