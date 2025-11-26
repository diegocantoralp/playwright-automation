import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración especializada para Visual Testing
 * 
 * Características:
 * - Múltiples thresholds según tipo de componente
 * - Ambiente ultra-estable (fonts, animations, timezone)
 * - Parallel execution optimizada para visual tests
 * - Baseline management per environment
 */
export default defineConfig({
  testDir: './tests/visual',
  timeout: 30000,
  
  expect: {
    timeout: 10000,
    toHaveScreenshot: {
      // Threshold más estricto por defecto
      threshold: 0.1,
      maxDiffPixels: 100,
      maxDiffPixelRatio: 0.01,
      
      // Configuración de animaciones
      animations: 'disabled',
      
      // Ocultar elementos dinámicos comunes
      mask: [],
      
      // Scale factor fijo
      scale: 'css',
    },
  },
  
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0, // 1 retry en CI para visual tests
  workers: process.env.CI ? 2 : 4, // Parallel execution optimizado
  fullyParallel: true,
  
  reporter: [
    ['html', { open: 'never', outputFolder: 'reports/visual-html' }],
    ['list'],
    ['json', { outputFile: 'reports/visual-results.json' }],
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3011',
    testIdAttribute: 'data-testid',
    
    // Ambiente ultra-estable
    viewport: { width: 1280, height: 800 },
    deviceScaleFactor: 1,
    locale: 'es-PE',
    timezoneId: 'America/Lima',
    
    // Deshabilitar features que causan variabilidad
    hasTouch: false,
    isMobile: false,
    javaScriptEnabled: true,
    
    // Sin videos/traces para visual tests (optimización)
    video: 'off',
    trace: 'off',
    screenshot: 'only-on-failure',
    
    headless: true, // Siempre headless para consistencia
    
    // Colores forzados (no system preference)
    colorScheme: 'light',
    reducedMotion: 'reduce',
    
    // Fonts consistentes
    extraHTTPHeaders: {
      'Accept-Language': 'es-PE,es;q=0.9',
    },
  },

  outputDir: 'test-results/visual/',
  
  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        
        // Override para componentes con threshold flexible
        contextOptions: {
          reducedMotion: 'reduce',
        },
      },
    },
    
    // Proyecto para componentes críticos (threshold estricto)
    {
      name: 'critical-components',
      testMatch: /.*\/(navbar|header|footer)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        
        // Threshold ultra-estricto
        expect: {
          toHaveScreenshot: {
            threshold: 0.05,
            maxDiffPixels: 50,
          },
        },
      },
    },
    
    // Proyecto para componentes con contenido dinámico (threshold flexible)
    {
      name: 'dynamic-components',
      testMatch: /.*\/(card|product-item|gallery)\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        channel: 'chrome',
        
        // Threshold más permisivo
        expect: {
          toHaveScreenshot: {
            threshold: 0.2,
            maxDiffPixels: 200,
          },
        },
      },
    },
  ],
});
