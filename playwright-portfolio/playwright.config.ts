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
    ['html', { 
      outputFolder: 'reports/html-report', 
      open: 'never',
      attachmentsBaseURL: process.env.ARTIFACTS_URL // For CI artifacts linking
    }],
    ['json', { outputFile: 'reports/test-results.json' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
    ['list'],
    // ['allure-playwright', { outputFolder: 'reports/allure-results' }]
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'https://example.com',
    testIdAttribute: 'data-testid', // Stable selector attribute
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    trace: 'on-first-retry', // Capture detailed trace on retry for debugging
    video: process.env.CI ? 'retain-on-failure' : 'off', // Videos only in CI to save space
    screenshot: 'only-on-failure', // Auto screenshot on test failure
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