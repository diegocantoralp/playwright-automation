import { test, expect } from '@playwright/test';

test.describe('Authenticated User Tests', () => {
  test('@smoke @auth should access protected dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Verify user is authenticated
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page.locator('[data-testid="dashboard-content"]')).toBeVisible();
  });

  test('@regression @auth should manage user profile', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
    
    // Test profile updates
    await page.fill('[data-testid="display-name"]', 'Test User Updated');
    await page.click('[data-testid="save-profile"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('@visual @auth should display authenticated UI correctly', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
    await expect(page).toHaveScreenshot('authenticated-dashboard.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});

test.describe('Guest User Tests', () => {
  test('@smoke should access public homepage', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('[data-testid="login-link"]')).toBeVisible();
  });

  test('@regression should not access protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});