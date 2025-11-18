import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      threshold: 0.2,
    },
    toMatchSnapshot: {
      threshold: 0.2
    }
  },
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  fullyParallel: !process.env.CI,
  
  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
    // ['allure-playwright', { outputFolder: 'reports/allure-results' }]
  ],
  
  use: {
    baseURL: 'https://example.com',
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
    acceptDownloads: true,
    locale: 'es-ES',
    timezoneId: 'America/Mexico_City',
  },

  testIgnore: [
    '**/node_modules/**',
    '**/dist/**',
    '**/build/**'
  ],

  outputDir: `test-results/`,
  
  projects: [
    // Guest user tests (not authenticated)
    {
      name: 'guest-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // No authentication context
      },
    },
    
    // Authenticated user tests
    {
      name: 'auth-chromium',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Will use storageState with authentication
        storageState: 'auth/user.json', // If auth file exists
      },
      dependencies: ['setup'], // Run setup project first (for auth)
    },

    // Setup project for authentication
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
    },
  ]
});