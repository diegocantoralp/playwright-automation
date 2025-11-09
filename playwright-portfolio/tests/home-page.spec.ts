import { test, expect } from '../fixtures/base-test';
import { HomePage } from '../pages/home-page';

/**
 * Home Page Test Suite
 * Example tests demonstrating best practices
 */
test.describe('Home Page Tests', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.navigateToHome();
  });

  test('should display home page correctly', async () => {
    // Verify page title
    const title = await homePage.getTitle();
    expect(title).toContain('Home');

    // Verify header is visible
    const isHeaderVisible = await homePage.isHeaderVisible();
    expect(isHeaderVisible).toBe(true);
  });

  test('should have navigation menu', async () => {
    // Get navigation items
    const navItems = await homePage.getNavigationItems();
    expect(navItems.length).toBeGreaterThan(0);
  });

  test.skip('search functionality', async () => {
    // Example of a skipped test
    await homePage.search('test query');
    // Add assertions here
  });

  test('responsive design check', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await homePage.navigateToHome();
    
    const isHeaderVisible = await homePage.isHeaderVisible();
    expect(isHeaderVisible).toBe(true);
  });
});