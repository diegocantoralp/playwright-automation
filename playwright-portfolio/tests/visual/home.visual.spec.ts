import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  // Configure test to disable animations for stable screenshots
  test.use({
    // Disable animations and transitions for consistent screenshots
    extraHTTPHeaders: {
      'Reduce-Motion': '1'
    }
  });

  test.beforeEach(async ({ page }) => {
    // Inject CSS to disable animations and transitions
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  });

  test('@regression @visual homepage should match baseline screenshot', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Wait for content to load
    await page.waitForSelector('body');
    
    // Wait for any potential loading states
    await page.waitForLoadState('networkidle');
    
    // Take full page screenshot
    await expect(page).toHaveScreenshot('homepage-full.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('@regression @visual homepage header should be consistent', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('body');
    
    // Screenshot of just the header area
    const header = page.locator('h1').first();
    await expect(header).toHaveScreenshot('homepage-header.png');
  });

  test('@regression @visual homepage content area should be stable', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('body');
    
    // Screenshot of main content area
    const mainContent = page.locator('div').first();
    await expect(mainContent).toHaveScreenshot('homepage-content.png');
  });

  test('@regression @visual @responsive homepage should look good on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForSelector('body');
    
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('@regression @visual @responsive homepage should look good on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    await page.goto('/');
    await page.waitForSelector('body');
    
    await expect(page).toHaveScreenshot('homepage-tablet.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('@smoke @visual critical visual elements should be present', async ({ page }) => {
    await page.goto('/');
    
    await page.waitForSelector('body');
    
    // Quick visual check for critical elements
    const heading = page.locator('h1');
    const paragraph = page.locator('p').first();
    
    await expect(heading).toHaveScreenshot('critical-heading.png');
    await expect(paragraph).toHaveScreenshot('critical-paragraph.png');
  });
});