import { test, expect } from '../../fixtures/base-test';

/**
 * User Profile Tests - Requires Authentication
 * These tests run with auth-chromium project
 */
test.describe('Authenticated - User Profile', () => {
  test('@regression @auth should manage user profile', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
    
    // Test profile updates
    await page.fill('[data-testid="display-name"]', 'Test User Updated');
    await page.click('[data-testid="save-profile"]');
    
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
  });

  test('@smoke @auth should view profile information', async ({ page }) => {
    await page.goto('/profile');
    
    // Verify profile elements are visible
    await expect(page.locator('[data-testid="profile-avatar"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-email"]')).toBeVisible();
    await expect(page.locator('[data-testid="profile-name"]')).toBeVisible();
  });

  test('@regression @auth should update profile picture', async ({ page }) => {
    await page.goto('/profile');
    
    // Click avatar to upload
    await page.click('[data-testid="avatar-upload"]');
    
    // Simulate file upload
    const fileInput = page.locator('[data-testid="file-input"]');
    await fileInput.setInputFiles({
      name: 'avatar.png',
      mimeType: 'image/png',
      buffer: Buffer.from('fake-image-data')
    });
    
    await expect(page.locator('[data-testid="upload-success"]')).toBeVisible();
  });

  test('@regression @auth should change password', async ({ page }) => {
    await page.goto('/profile/security');
    
    await page.fill('[data-testid="current-password"]', 'Test123!');
    await page.fill('[data-testid="new-password"]', 'NewTest123!');
    await page.fill('[data-testid="confirm-password"]', 'NewTest123!');
    await page.click('[data-testid="change-password-btn"]');
    
    await expect(page.locator('[data-testid="password-changed"]')).toBeVisible();
  });

  test('@visual @auth should display profile page correctly', async ({ page }) => {
    await page.goto('/profile');
    
    await expect(page.locator('[data-testid="profile-form"]')).toBeVisible();
    await expect(page).toHaveScreenshot('authenticated-profile.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });
});