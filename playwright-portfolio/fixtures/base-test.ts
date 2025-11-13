import { test as base, Page, APIRequestContext } from '@playwright/test';
import { HomePage } from '../pages/home-page';
import { ApiHelper } from './api-helper';

/**
 * Custom test fixtures
 */
export interface TestFixtures {
  homePage: HomePage;
  apiHelper: ApiHelper;
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
   * API Helper fixture
   */
  apiHelper: async ({ request }, use) => {
    const apiHelper = new ApiHelper(request);
    await use(apiHelper);
  },
});

export { expect } from '@playwright/test';