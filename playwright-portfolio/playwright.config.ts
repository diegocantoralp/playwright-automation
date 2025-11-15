import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: {
    timeout: 10000,
    // Configure visual comparison
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
  fullyParallel: !process.env.CI, // Disable parallel in CI for visual stability
  
  reporter: [
    ['html', { outputFolder: 'reports/html-report', open: 'never' }],
    ['json', { outputFile: 'reports/results.json' }],
    ['list'],
    // Uncomment when allure is working properly
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
    // Smoke tests - fast feedback
    {
      name: 'chromium-smoke',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      testMatch: /.*@smoke.*/,
    },
    
    // Regression tests - comprehensive
    {
      name: 'chromium-regression',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      testMatch: /.*@regression.*/,
    },
    
    // Visual tests - specific configuration
    {
      name: 'chromium-visual',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        // Specific settings for visual tests
          },
      testMatch: /.*@visual.*/,
    },
    
    // Accessibility tests
    {
      name: 'chromium-a11y',
      use: { 
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      testMatch: /.*@a11y.*/,
    },
  ]
});