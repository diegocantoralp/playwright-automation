# Playwright Automation Portfolio

Repositorio de **pruebas automatizadas con Playwright** siguiendo la **arquitectura Page Object Model (POM)**.  
El objetivo es demostrar dominio en automatización progresiva (commits diarios) y buenas prácticas CI/CD.

## 🎯 Features

- ✅ **Page Object Model (POM)**: Arquitectura escalable y mantenible
- ✅ **Custom Fixtures**: API helpers, mock utilities, data management
- ✅ **Test Organization**: Separated by context (guest/authenticated/api)
- ✅ **Accessibility Testing**: WCAG 2A/AA compliance with @axe-core
- ✅ **Visual Regression**: Screenshot comparisons with toHaveScreenshot()
- ✅ **API Testing**: Contract validation with Zod schemas
- ✅ **HTTP Mocking**: Request/response simulation with page.route()
- ✅ **Authentication**: Guest vs authenticated user contexts
- ✅ **Deterministic Testing**: Data fixtures with reset/seed endpoints
- ✅ **Flaky Detection**: Repeat-each scanning in CI
- ✅ **CI/CD**: Multi-job GitHub Actions pipeline

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
│   └── health-demo/          # Legacy health check demo
├── docs/
│   ├── DATA_TESTID_GUIDE.md  # Best practices for data-testid
│   └── example-ui-with-testids.html
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
│   ├── accessibility.spec.ts # WCAG compliance (@a11y)
│   ├── visual.spec.ts        # Screenshot comparisons (@visual)
│   ├── api/
│   │   └── products.contract.mock.spec.ts
│   ├── authenticated/        # Tests requiring auth
│   │   ├── dashboard.spec.ts
│   │   └── profile.spec.ts
│   ├── guest/               # Public tests (no auth)
│   │   ├── home.spec.ts
│   │   └── auth-redirect.spec.ts
│   └── e2e/
│       └── products.seed.spec.ts  # Tests using seed fixtures
├── .github/
│   └── workflows/
│       └── ci.yml           # Multi-job CI pipeline
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
# Open HTML report
npm run test:report

# Run tests with UI
npm run test:ui
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

See [docs/DATA_TESTID_GUIDE.md](./docs/DATA_TESTID_GUIDE.md) for best practices.

## ⚙️ CI/CD Pipeline

GitHub Actions runs multiple jobs:

1. **🚀 Smoke Tests**: Fast critical path validation (guest + auth)
2. **🔄 Regression Tests**: Full suite with a11y, visual, auth
3. **🔌 API Tests**: Contract validation and mocking
4. **🔍 Flaky Scan**: Daily cron job (2 AM UTC) + on-demand with `[flaky-scan]` in commit message

### Trigger Flaky Scan Manually

```bash
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

- [Data TestId Guide](./playwright-portfolio/docs/DATA_TESTID_GUIDE.md)
- [Example UI with TestIds](./playwright-portfolio/docs/example-ui-with-testids.html)

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
