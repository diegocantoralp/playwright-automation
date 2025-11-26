# Playwright Automation Portfolio

Repositorio de **pruebas automatizadas con Playwright** siguiendo la **arquitectura Page Object Model (POM)**.  
El objetivo es demostrar dominio en automatización progresiva (commits diarios) y buenas prácticas CI/CD.

## 📊 Estado del Proyecto

[![CI](https://img.shields.io/github/actions/workflow/status/diegocantoralp/playwright-automation/ci.yml?branch=main&label=CI%20Pipeline)](https://github.com/diegocantoralp/playwright-automation/actions)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-45ba4b?logo=playwright)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

### 🔄 Pipeline de CI

- **Smoke (PR):** Ejecuta cambios afectados o `@smoke` si no hay match → feedback rápido
- **API (push):** Contratos y mocks con validación Zod
- **Regression (push a main):** Suite completa con a11y + visual + @auth
- **Flaky Scan (daily):** Detección automática de tests inestables
- **Reporte HTML (main):** Publicado automáticamente en **[GitHub Pages](https://diegocantoralp.github.io/playwright-automation/)**

## 📈 Métricas

<!-- METRICS:START -->
_Pendiente de primera ejecución._
<!-- METRICS:END -->

## 🎯 Features

- ✅ **Page Object Model (POM)**: Arquitectura escalable y mantenible
- ✅ **Custom Fixtures**: API helpers, mock utilities, data management
- ✅ **Test Organization**: Separated by context (guest/authenticated/api)
- ✅ **Accessibility Testing**: WCAG 2A/AA compliance with @axe-core
- ✅ **Visual Regression**: Screenshot comparisons with toHaveScreenshot()
- ✅ **Component Visual Testing**: Isolated component snapshots with stable environment
- ✅ **API Testing**: Contract validation with Zod schemas
- ✅ **HTTP Mocking**: Request/response simulation with page.route()
- ✅ **Authentication**: Guest vs authenticated user contexts
- ✅ **Deterministic Testing**: Data fixtures with reset/seed endpoints
- ✅ **Flaky Detection**: Repeat-each scanning in CI
- ✅ **Enriched Reports**: Videos, traces, screenshots as artifacts
- ✅ **Automated Metrics**: Flaky rate, pass rate, duration tracking in README/CI
- ✅ **Snapshot Cleanup**: Automated orphan snapshot removal
- ✅ **CI/CD**: Multi-job GitHub Actions pipeline with intelligent test selection

## Tecnologías

- [Playwright](https://playwright.dev/) ^1.40.0
- TypeScript ^5.2.0
- Zod ^3.25.76 (API schema validation)
- @axe-core/playwright ^4.8.2 (Accessibility)
- GitHub Actions (CI/CD)
- ESLint / Prettier

## 📁 Project Structure

```
playwright-portfolio/
├── apps/
│   ├── demo-server/          # Demo server with /api/reset & /api/seed
│   │   ├── server.js
│   │   └── package.json
│   └── health-demo/          # Health check demo + component harnesses
│       ├── server.js
│       └── public/
│           └── components/   # Isolated component HTML for visual tests
│               ├── card.html
│               ├── product-item.html
│               └── navbar.html
├── docs/
│   ├── TEST-STRATEGY.md      # Testing strategy documentation
│   ├── ENRICHED-REPORTS.md   # Reports, videos, traces guide
│   ├── DAY-09-ENRICHED-CI.md # Day 9: CI intelligence + GitHub Pages
│   └── DAY-10-COMPONENT-VISUAL.md # Day 10: Component visual + metrics
├── fixtures/
│   ├── base-test.ts          # Custom test fixtures
│   ├── api-helper.ts         # API testing utilities
│   ├── api-fixtures.ts       # resetApp, seedProducts fixtures
│   ├── network-utils.ts      # HTTP mocking utilities
│   ├── enhanced-schemas.ts   # Zod schemas for validation
│   └── auth.setup.ts         # Authentication setup
├── pages/
│   ├── base-page.ts          # Base Page Object
│   ├── home-page.ts          # Homepage POM
│   └── products-page.ts      # Products POM
├── tests/
│   ├── smoke.spec.ts         # Critical path tests (@smoke)
│   ├── accessibility/
│   │   └── home.a11y.spec.ts # WCAG compliance (@a11y)
│   ├── visual/
│   │   ├── home.visual.spec.ts # Page-level visual tests
│   │   └── components/       # Component-level visual tests
│   │       ├── card.spec.ts
│   │       ├── product-item.spec.ts
│   │       └── navbar.spec.ts
│   ├── api/
│   │   └── products.contract.mock.spec.ts
│   ├── authenticated/        # Tests requiring auth
│   │   ├── dashboard.spec.ts
│   │   └── profile.spec.ts
│   └── e2e/
│       └── products.seed.spec.ts  # Tests using seed fixtures
├── scripts/
│   ├── merge-reports.js      # Merge multiple test reports
│   ├── generate-summary.js   # Generate enhanced HTML summary
│   ├── metrics/
│   │   ├── compute-metrics.mjs    # Calculate test metrics
│   │   └── update-readme.mjs      # Inject metrics into README
│   └── visual/
│       └── cleanup-snapshots.mjs  # Remove orphaned snapshots
├── .github/
│   └── workflows/
│       └── ci.yml           # Multi-job CI pipeline with metrics
├── playwright.config.ts     # Playwright configuration
└── package.json
```

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Install Playwright Browsers

```bash
npx playwright install --with-deps chromium
```

### 3. (Optional) Start Demo Server

```bash
# Terminal 1: Start demo server with reset/seed endpoints
cd apps/demo-server
npm install
npm start

# Server will run on http://localhost:3010
# Endpoints:
# - GET  /api/health
# - GET  /api/products
# - POST /api/reset (reset to default state)
# - POST /api/seed  (seed with custom data)
```

### 4. Run Tests

```bash
# All tests
npm test

# Smoke tests (critical path)
npm run test:smoke

# Regression tests (full suite)
npm run test:regression

# API tests
npm run test:api

# Accessibility tests
npm run test:a11y

# Visual regression tests
npm run test:visual

# Flaky test detection (5x repetition, 1 worker)
npm run test:flaky

# Authenticated user tests
npm run test:authenticated

# Guest user tests
npm run test:guest
```

### 5. View Reports

```bash
# View HTML report
npm run test:report

# Run tests with UI
npm run test:ui

# Run with video recording (local)
npm run test:with-video

# Run with trace enabled
npm run test:trace

# Merge multiple reports
npm run report:merge

# Generate enhanced summary
npm run report:summary
```

### 6. Metrics and Maintenance

```bash
# Generate test metrics (compute + update README)
npm run metrics

# Clean orphaned visual snapshots
npm run snapshots:prune

# View metrics summary
cat reports/summary.json
```

## 📊 Reports and Artifacts

### Local Reports

```bash
reports/
├── html-report/          # Interactive HTML report
├── test-results.json     # JSON for analysis
├── junit.xml            # JUnit XML for CI
├── merged-results.json   # Combined reports
└── summary.html         # Visual summary with charts
```

### CI Artifacts

Each CI job uploads separate artifacts:

**Smoke Tests** (7 days):
- HTML/JSON reports
- Videos of failures
- Screenshots
- Traces (14 days)

**Regression Tests** (7 days):
- All reports and media
- Visual snapshots (30 days)

**API Tests** (7 days):
- Reports and traces

**Flaky Scan** (30 days):
- Flaky test detection results

### View Traces

```bash
# Open trace viewer
npx playwright show-trace test-results/path-to-test/trace.zip
```

Traces include:
- Timeline of actions
- Screenshots at each step
- Network activity
- Console logs
- Source code
- Call stack
```

## 🎯 Test Tags

Tests are organized with tags for targeted execution:

- `@smoke`: Critical path tests (fast, run first)
- `@regression`: Full regression suite
- `@api`: API contract tests
- `@mock`: Tests using HTTP mocking
- `@edge`: Edge cases and error scenarios
- `@a11y`: Accessibility compliance tests
- `@visual`: Visual regression tests
- `@auth`: Tests requiring authentication
- `@flaky`: Known flaky tests (for detection)

## 🧪 Deterministic Testing

### Reset & Seed Pattern

```typescript
import { test, expect } from '../fixtures/api-fixtures';

test.describe('Products with controlled state', () => {
  test.beforeEach(async ({ resetApp }) => {
    // Reset to clean state before each test
    await resetApp();
  });

  test('should display seeded products', async ({ page, seedProducts }) => {
    // Seed specific test data
    await seedProducts([
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Test Product',
        price: 99.99,
        currency: 'PEN',
        inStock: true,
        updatedAt: new Date().toISOString()
      }
    ]);

    // Test with predictable data
    await page.goto('/products');
    await expect(page.getByTestId('product-item')).toHaveCount(1);
  });
});
```

### Stable Selectors with data-testid

```html
<!-- HTML -->
<button data-testid="add-to-cart-button">Add to Cart</button>
<div data-testid="product-list">...</div>
```

```typescript
// Test
await page.getByTestId('add-to-cart-button').click();
await expect(page.getByTestId('product-list')).toBeVisible();
```

Configure `testIdAttribute` in `playwright.config.ts`:
```typescript
export default defineConfig({
  use: {
    testIdAttribute: 'data-testid',
  },
});
```

## ⚙️ CI/CD Pipeline

### Pipeline Inteligente

GitHub Actions ejecuta jobs adaptativos según el contexto:

#### En Pull Requests (CI Inteligente)

1. **🔍 Detección de cambios**: Usa `dorny/paths-filter` para identificar archivos modificados
2. **🎯 Tests afectados**: Si se modifican specs, ejecuta **solo esos archivos**
3. **🚀 Smoke fallback**: Si se modifica app/config, ejecuta `@smoke`
4. **⚡ Feedback rápido**: Resultados en 30-60 segundos para PRs pequeños

#### En Push a Main

1. **🚀 Smoke Tests**: Critical paths (guest + auth)
2. **🔄 Regression Tests**: Suite completa (a11y + visual + auth)
3. **🔌 API Tests**: Contract validation y mocking
4. **📄 GitHub Pages**: Publicación automática del HTML report

#### Scheduled (Diario)

5. **🔍 Flaky Scan**: Detección automática a las 2 AM UTC

### Artefactos por Job

Cada job sube automáticamente:
- 📊 **HTML Report**: Reporte interactivo con evidencias
- 🔍 **Traces & Media**: Videos, traces y screenshots de failures
- 📝 **Job Summary**: Resumen visible en GitHub Actions

### GitHub Pages

- 🌐 **URL**: https://diegocantoralp.github.io/playwright-automation/
- 🔄 **Actualización**: Automática en cada push a `main`
- 📊 **Contenido**: Último reporte de regression completo

### Trigger Manual

```bash
# Flaky scan on-demand
git commit -m "feat: new feature [flaky-scan]"
git push
```

## 📊 Flaky Test Detection

```bash
# Run flaky scan locally
npm run test:flaky

# Full flaky scan (10x repetition, max 3 failures)
npm run test:flaky-full
```

Configuration in CI:
- `--repeat-each=5`: Run each test 5 times
- `--workers=1`: Single worker to avoid parallelism issues
- `--grep '@flaky|@edge|@visual'`: Target potentially flaky tests

## 🛡️ Best Practices

1. **Use stable selectors**: Prefer `getByRole`, `getByLabel`, `getByTestId` over CSS classes
2. **Reset state**: Use `resetApp` fixture before tests for determinism
3. **Seed data**: Use `seedProducts` for predictable test data
4. **Tag appropriately**: Use `@smoke` for critical paths, `@regression` for full coverage
5. **Mock when needed**: Use API mocking for edge cases (latency, errors)
6. **Check accessibility**: Include `@a11y` tests for WCAG compliance
7. **Visual regression**: Use `@visual` for UI consistency
8. **Separate contexts**: Use guest-chromium vs auth-chromium projects

## 📚 Documentation

- [Test Strategy](./playwright-portfolio/docs/TEST-STRATEGY.md)
- [Enriched Reports Guide](./playwright-portfolio/docs/ENRICHED-REPORTS.md)
- [Day 9: Enriched CI + GitHub Pages](./playwright-portfolio/docs/DAY-09-ENRICHED-CI.md)
- [Day 10: Component Visual + Metrics](./playwright-portfolio/docs/DAY-10-COMPONENT-VISUAL.md)

## 🔗 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Page Object Model Pattern](https://playwright.dev/docs/pom)
- [Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [Visual Comparisons](https://playwright.dev/docs/test-snapshots)

---

## Arquitectura del Proyecto

El proyecto adopta **POM (Page Object Model)**:
- Separación clara entre **lógica de prueba** y **elementos de interfaz**.
- Mejora la mantenibilidad y reutilización del código.
- Facilita agregar nuevos flujos o pantallas sin romper los existentes.
