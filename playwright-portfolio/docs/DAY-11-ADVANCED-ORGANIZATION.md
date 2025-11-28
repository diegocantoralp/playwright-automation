# Día 11: Advanced Test Organization & Reporting

## 🎯 Objetivos

1. **Sistema de categorización por prioridad**: Tags jerárquicos (@critical, @high, @medium, @low)
2. **Custom Reporter**: Reporter personalizado con notificaciones Slack/Discord
3. **Test Data Factories**: Patrón Factory para generar datos de prueba consistentes
4. **CI Sharding Strategy**: Optimización de ejecución paralela en CI
5. **Performance Tracking**: Análisis de tendencias de performance

## 📦 Implementación

### 1. Sistema de Priorización

#### Tags Jerárquicos

Los tests ahora se categorizan por prioridad:

- **@critical**: Tests de funcionalidad crítica (login, checkout, payments)
- **@high**: Features importantes pero no críticas (search, filters)
- **@medium**: Funcionalidad secundaria (tooltips, animations)
- **@low**: Edge cases y casos poco frecuentes

**Ejemplo:**

```typescript
test.describe('Login functionality @critical', () => {
  test('should login with valid credentials @smoke', async ({ page }) => {
    // Test implementation
  });
});

test.describe('Product filters @high', () => {
  test('should filter by price range', async ({ page }) => {
    // Test implementation
  });
});
```

#### Ejecución Priorizada

```bash
# Solo tests críticos
npx playwright test --grep "@critical"

# Critical + High priority
npx playwright test --grep "@critical|@high"

# Excluir tests de baja prioridad
npx playwright test --grep-invert "@low"
```

### 2. Custom Reporter

**Ubicación**: `reporters/custom-reporter.ts`

#### Características

- **Detección automática de tests lentos** (>30s)
- **Agrupación por prioridad** (@critical, @high, @medium, @low)
- **Notificaciones a Slack/Discord** en CI cuando hay failures
- **Reporte JSON** con métricas detalladas

#### Configuración en playwright.config.ts

```typescript
reporter: [
  ['html', { open: 'never' }],
  ['json', { outputFile: 'reports/results.json' }],
  ['./reporters/custom-reporter.ts'], // Custom reporter
],
```

#### Notificaciones Slack/Discord

Configurar webhook URL como variable de entorno:

```bash
# Slack
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# Discord
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/YOUR/WEBHOOK/URL"
```

En CI (GitHub Actions):

```yaml
env:
  SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

**Output del Custom Reporter:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Custom Reporter Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: PASSED
Duration: 45.23s

📋 Tests by Priority:
  🔴 Critical: 12
  🟠 High:     8
  🟡 Medium:   15
  🟢 Low:      5

⏱️  Slow Tests (>30s):
  - E2E checkout flow: 34.12s
  - Full product catalog load: 31.45s
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### 3. Test Data Factories

**Ubicación**: `fixtures/factories.ts`

#### Factory Pattern

Genera datos de prueba consistentes y reutilizables:

```typescript
import { UserFactory, ProductFactory, OrderFactory } from '../fixtures/factories';

test('should create order with factory data', async ({ page }) => {
  // Generar usuario de prueba
  const user = UserFactory.create({
    email: 'specific@example.com',
    role: 'admin',
  });

  // Generar productos
  const products = ProductFactory.createBatch(5);
  
  // Generar orden
  const order = OrderFactory.create({
    userId: user.id,
    items: products.map(p => ({
      productId: p.id,
      quantity: 2,
      price: p.price,
    })),
  });

  // Usar datos en test
  await seedData({ users: [user], products, orders: [order] });
  await page.goto('/orders');
  await expect(page.getByTestId(`order-${order.id}`)).toBeVisible();
});
```

#### Factories Disponibles

**UserFactory:**
- `create(overrides?)`: Usuario estándar
- `createAdmin(overrides?)`: Usuario admin
- `createBatch(count, overrides?)`: Múltiples usuarios
- `reset()`: Resetear contador de IDs

**ProductFactory:**
- `create(overrides?)`: Producto estándar
- `createOutOfStock(overrides?)`: Producto sin stock
- `createExpensive(overrides?)`: Producto premium
- `createBatch(count, overrides?)`: Múltiples productos
- `reset()`: Resetear contador

**OrderFactory:**
- `create(overrides?)`: Orden pendiente
- `createCompleted(overrides?)`: Orden completada
- `createCancelled(overrides?)`: Orden cancelada
- `reset()`: Resetear contador

#### Ventajas del Factory Pattern

- **Consistencia**: Misma estructura de datos en todos los tests
- **Flexibilidad**: Fácil override de propiedades específicas
- **Mantenibilidad**: Cambios centralizados
- **Realismo**: Datos que simulan producción

### 4. CI Sharding Strategy

**Configuración**: `playwright.ci.config.ts`

#### Sharding en GitHub Actions

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
    
steps:
  - name: Run tests (shard ${{ matrix.shard }}/4)
    run: npx playwright test --shard=${{ matrix.shard }}/4 --config=playwright.ci.config.ts
```

#### Ventajas del Sharding

- **Ejecución paralela**: 4 jobs en paralelo = 4x más rápido
- **Distribución inteligente**: Playwright balancea tests automáticamente
- **Retry aislado**: Si 1 shard falla, otros 3 continúan
- **Costos optimizados**: Menos tiempo de CI = menos costo

#### Priorización en Shards

El config CI prioriza:
1. **Critical tests primero** (shard independiente si es posible)
2. **High priority tests**
3. **Standard tests**
4. **Visual tests** (más lentos, en shard dedicado)

### 5. Performance Tracking

**Script**: `scripts/metrics/analyze-performance.mjs`

#### Análisis de Tendencias

```bash
npm run metrics:performance
```

**Output:**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Performance Trends Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Data points: 25

Averages (all time):
  ⏱️  Duration: 42.3s
  ✅ Pass Rate: 94.5%
  ⚠️  Flaky Rate: 2.1%

Trends (recent vs previous):
  ⏱️  Duration: 📈 improving (-8.5%)
  ✅ Pass Rate: ➡️ stable (+0.2%)
  ⚠️  Flaky Rate: 📈 improving (-0.8%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

#### Métricas Rastreadas

- **Duration trends**: Detecta si tests se vuelven más lentos
- **Pass rate trends**: Monitorea estabilidad general
- **Flaky rate trends**: Identifica aumento de flakiness
- **Slowest tests**: Top 10 tests más lentos
- **Improvements/Regressions**: Cambios significativos

## 🚀 Uso

### Ejecutar con Priorización

```bash
# Solo tests críticos (pre-deploy)
npx playwright test --grep "@critical"

# Critical + High (PR validation)
npx playwright test --grep "@critical|@high"

# Full suite con custom reporter
npx playwright test --config=playwright.ci.config.ts
```

### Generar Métricas Completas

```bash
# Métricas estándar + trending + performance
npm run metrics:full
```

### Usar Factories en Tests

```typescript
import { resetAllFactories, UserFactory, ProductFactory } from '../fixtures/factories';

test.beforeEach(() => {
  resetAllFactories(); // Resetear IDs para consistencia
});

test('factory example', async ({ page }) => {
  const user = UserFactory.createAdmin();
  const products = ProductFactory.createBatch(10, { category: 'electronics' });
  
  // Seed via API
  await seedData({ users: [user], products });
  
  // Test con datos conocidos
  await page.goto('/products');
  await expect(page.getByTestId('product-item')).toHaveCount(10);
});
```

### Configurar Notificaciones

1. Crear webhook en Slack o Discord
2. Añadir secret en GitHub:
   ```
   Settings → Secrets → New repository secret
   Name: SLACK_WEBHOOK_URL
   Value: https://hooks.slack.com/services/...
   ```
3. Actualizar workflow:
   ```yaml
   env:
     SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
   ```

## 📊 Scripts Añadidos

```json
{
  "scripts": {
    "test:critical": "npx playwright test --grep '@critical'",
    "test:high": "npx playwright test --grep '@critical|@high'",
    "test:sharded": "npx playwright test --config=playwright.ci.config.ts",
    "metrics:full": "npm run metrics:trending && npm run metrics:performance",
    "metrics:performance": "node scripts/metrics/analyze-performance.mjs"
  }
}
```

## 🎯 Ventajas del Día 11

### Sistema de Priorización
- **Feedback rápido**: Ejecuta solo críticos en PRs
- **Deploy seguro**: Valida critical antes de merge
- **Optimización de CI**: No ejecutar todo siempre

### Custom Reporter
- **Visibilidad**: Métricas por prioridad
- **Alertas proactivas**: Notificaciones automáticas
- **Detección temprana**: Tests lentos identificados

### Factories
- **Código DRY**: No repetir setup de datos
- **Tests legibles**: Menos boilerplate
- **Mantenimiento fácil**: Cambios centralizados

### Sharding
- **CI más rápido**: 4x speedup con 4 shards
- **Costos reducidos**: Menos minutos de CI
- **Escalabilidad**: Fácil añadir más shards

### Performance Tracking
- **Tendencias claras**: Detectar regresiones temprano
- **Optimización guiada**: Saber qué optimizar
- **Historial completo**: Tracking a largo plazo

## 📚 Referencias

- [Playwright Test Annotations](https://playwright.dev/docs/test-annotations)
- [Custom Reporters](https://playwright.dev/docs/test-reporters#custom-reporters)
- [Test Sharding](https://playwright.dev/docs/test-sharding)
- [Factory Pattern](https://refactoring.guru/design-patterns/factory-method)

---

**Día 11 implementado**: Test organization + custom reporting + data factories + CI optimization ✅
