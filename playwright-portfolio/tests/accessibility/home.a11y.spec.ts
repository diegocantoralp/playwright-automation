import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests - WCAG Compliance', () => {
  test('@regression @a11y should have no critical accessibility violations on homepage', async ({ page }) => {
    // Navigate to the homepage (uses baseURL from Playwright config)
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Run accessibility scan with axe-core
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    const violations = accessibilityScanResults.violations;
    if (violations.length > 0) {
      console.log('🚨 Accessibility violations found:');
      violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.helpUrl}`);
        violation.nodes.forEach(node => {
          console.log(`   Element: ${node.target.join(', ')}`);
        });
      });
    }

    // Fail test if violations exist
    expect(violations, `Found ${violations.length} accessibility violations. See console for details.`).toHaveLength(0);
  });

  test('@regression @a11y should have proper heading structure', async ({ page }) => {
    // Navigate to the homepage (uses baseURL from Playwright config)
    await page.goto('/');
    
    // Check heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length, 'Page should have at least one heading').toBeGreaterThan(0);
    
    // Verify h1 exists and is visible
    const h1Elements = await page.locator('h1').all();
    expect(h1Elements.length, 'Page should have exactly one H1 element').toBe(1);
    
    await expect(page.locator('h1').first()).toBeVisible();
  });

  test('@regression @a11y should have accessible navigation', async ({ page }) => {
    // Navigate to the homepage (uses baseURL from Playwright config)
    await page.goto('/');
    
    // Check that interactive elements are focusable
    const links = await page.locator('a').all();
    
    for (const link of links) {
      const isVisible = await link.isVisible();
      if (isVisible) {
        // Focus the link
        await link.focus();
        
        // Verify it has proper attributes
        const href = await link.getAttribute('href');
        const text = await link.textContent();
        
        expect(href, 'Link should have href attribute').toBeTruthy();
        expect(text?.trim(), 'Link should have descriptive text').toBeTruthy();
      }
    }
  });

  test('@smoke @a11y should have proper color contrast', async ({ page }) => {
    // Navigate to the homepage (uses baseURL from Playwright config)
    await page.goto('/');
    
    // Run contrast-specific accessibility check
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .withRules(['color-contrast'])
      .analyze();

    const contrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );

    expect(contrastViolations, 'Color contrast should meet WCAG AA standards').toHaveLength(0);
  });
});