import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../auth/user.json');

/**
 * Setup authentication for tests
 * This runs once before all tests that need authentication
 */
setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('https://example.com/login'); // Adjust to your login URL
  
  // Perform authentication steps
  await page.fill('[data-testid="username"]', process.env.TEST_USER || 'test@example.com');
  await page.fill('[data-testid="password"]', process.env.TEST_PASSWORD || 'Test123!');
  await page.click('[data-testid="login-button"]');
  
  // Wait for successful authentication
  await page.waitForURL('**/dashboard'); // Adjust to your post-login URL
  
  // Verify authentication was successful
  await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  
  // Save authentication state
  await page.context().storageState({ path: authFile });
  
  console.log('✅ Authentication setup completed');
});