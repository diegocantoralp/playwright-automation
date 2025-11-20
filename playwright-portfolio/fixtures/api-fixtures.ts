import { test as base, request as pwRequest, Page } from '@playwright/test';

/**
 * API Fixtures for data management and app state control
 * These fixtures help create deterministic tests by controlling backend state
 */

type ApiFixtures = {
  resetApp: () => Promise<void>;
  seedProducts: (items: any[]) => Promise<void>;
  resetAndNavigate: (page: Page, url: string) => Promise<void>;
};

/**
 * Extended test with API fixtures for data management
 */
export const test = base.extend<ApiFixtures>({
  /**
   * Reset app to initial state
   * Runs before each test to ensure clean state
   */
  resetApp: async ({ baseURL }, use) => {
    const resetFn = async () => {
      try {
        const ctx = await pwRequest.newContext();
        const response = await ctx.post(new URL('/api/reset', baseURL!).toString());
        
        if (!response.ok()) {
          console.warn('⚠️  Reset API returned non-OK status:', response.status());
        } else {
          console.log('✅ App state reset successfully');
        }
        
        await ctx.dispose();
      } catch (error) {
        console.warn('⚠️  Reset API not available, continuing without reset:', error);
      }
    };

    // Reset before test
    await resetFn();
    
    // Provide reset function to test
    await use(resetFn);
    
    // Cleanup after test (optional)
    // await resetFn();
  },

  /**
   * Seed products into the application
   * Allows tests to control exact data state
   */
  seedProducts: async ({ baseURL }, use) => {
    await use(async (items: any[]) => {
      try {
        const ctx = await pwRequest.newContext();
        const response = await ctx.post(new URL('/api/seed', baseURL!).toString(), {
          data: { items }
        });

        if (!response.ok()) {
          console.warn('⚠️  Seed API returned non-OK status:', response.status());
        } else {
          const result = await response.json();
          console.log(`✅ Seeded ${result.total || items.length} products successfully`);
        }

        await ctx.dispose();
      } catch (error) {
        console.warn('⚠️  Seed API not available:', error);
        throw error;
      }
    });
  },

  /**
   * Combined fixture: reset app and navigate to page
   * Convenient for common test setup pattern
   */
  resetAndNavigate: async ({ baseURL, resetApp }, use) => {
    await use(async (page: Page, url: string) => {
      await resetApp();
      await page.goto(url);
      await page.waitForLoadState('networkidle');
    });
  },
});

export { expect } from '@playwright/test';
