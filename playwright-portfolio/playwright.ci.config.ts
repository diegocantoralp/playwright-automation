import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración optimizada para CI con sharding
 * 
 * Estrategia:
 * - Sharding automático basado en workers disponibles
 * - Priorización de tests críticos primero
 * - Parallel execution máximo
 * - Retry strategy inteligente
 */
export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  
  expect: {
    timeout: 10000,
  },
  
  forbidOnly: !!process.env.CI,
  
  // Retry strategy inteligente
  retries: process.env.CI ? 2 : 0,
  
  // Optimización de workers para CI
  workers: process.env.CI 
    ? process.env.CI_SHARD_INDEX 
      ? 2  // 2 workers por shard
      : 4  // 4 workers si no hay sharding
    : undefined, // Automático en local
  
  fullyParallel: true,
  
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/html-report' }],
    ['list'],
    ['json', { outputFile: 'reports/results.json' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
    ['./reporters/custom-reporter.ts'], // Custom reporter
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    testIdAttribute: 'data-testid',
    headless: true,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15000,
    navigationTimeout: 30000,
    
    trace: process.env.CI ? 'retain-on-failure' : 'on-first-retry',
    video: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
    
    locale: 'es-ES',
    timezoneId: 'America/Mexico_City',
  },

  outputDir: 'test-results/',
  
  // Ordenar tests por prioridad (critical primero)
  grep: process.env.TEST_PRIORITY === 'critical' ? /@critical/ : undefined,
  
  projects: [
    // Setup project
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },

    // Critical tests (máxima prioridad)
    {
      name: 'critical-chromium',
      testMatch: /.*@critical.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup'],
    },
    
    // High priority tests
    {
      name: 'high-chromium',
      testMatch: /.*@high.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup', 'critical-chromium'],
    },

    // Standard tests (guest)
    {
      name: 'guest-chromium',
      testMatch: /tests\/(?!.*(@critical|@high)).*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
      },
      dependencies: ['setup'],
    },
    
    // Authenticated tests
    {
      name: 'auth-chromium',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        storageState: 'auth/user.json',
      },
      dependencies: ['setup'],
    },

    // Visual tests (parallel safe)
    {
      name: 'visual-chromium',
      testMatch: /.*\.visual\.spec\.ts|tests\/visual\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        deviceScaleFactor: 1,
        locale: 'es-PE',
        timezoneId: 'America/Lima',
        channel: 'chrome',
      },
    },
  ],
});
