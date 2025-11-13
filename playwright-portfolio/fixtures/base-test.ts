import { test as base, Page } from '@playwright/test';
import { HomePage } from '../pages/home-page';

/**
 * Custom test fixtures that inject page objects
 * This provides a clean, reusable way to access page objects in tests
 */
export interface TestFixtures {
  homePage: HomePage;
}

/**
 * Extended test with custom fixtures
 * Usage: import { test, expect } from '../fixtures/base-test';
 */
export const test = base.extend<TestFixtures>({
  /**
   * HomePage fixture - automatically creates and provides HomePage instance
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },
});

export { expect } from '@playwright/test';