import { test as base } from '@playwright/test';

/**
 * Extended test fixtures for the automation suite
 * Use this to create reusable setup/teardown logic
 */
export const test = base.extend({
  // Example custom fixture
  // customPage: async ({ page }, use) => {
  //   // Setup
  //   await page.goto('/');
  //   
  //   // Use the fixture
  //   await use(page);
  //   
  //   // Teardown (optional)
  // },
});

export { expect } from '@playwright/test';