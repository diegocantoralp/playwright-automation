import { test as base, Page, APIRequestContext } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ApiHelper } from './api-helper';

/**
 * Enhanced test fixtures with mocking capabilities
 */
export interface TestFixtures {
  homePage: HomePage;
  apiHelper: ApiHelper;
  apiHelperWithMocking: ApiHelper;
}

export const test = base.extend<TestFixtures>({
  /**
   * HomePage fixture
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  /**
   * API Helper fixture (without page for real requests)
   */
  apiHelper: async ({ request }, use) => {
    const apiHelper = new ApiHelper(request);
    await use(apiHelper);
  },

  /**
   * API Helper with mocking capabilities
   */
  apiHelperWithMocking: async ({ request, page }, use) => {
    const apiHelper = new ApiHelper(request, page);
    await use(apiHelper);
  },
});

export { expect } from '@playwright/test';