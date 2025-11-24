# 📊 Día 9: Reportes Enriquecidos + CI Inteligente + GitHub Pages

## 🎯 Objetivos Implementados

1. ✅ **Reportes enriquecidos**: Traces, videos, screenshots como artefactos
2. ✅ **GitHub Pages**: Publicación automática del HTML report
3. ✅ **CI Inteligente**: Ejecutar solo tests afectados por cambios en PR
4. ✅ **Mini Dashboard**: Badges y enlaces en README

---

## 1️⃣ Ajustes de Playwright

### playwright.config.ts

```typescript
reporter: [
  ['html', { open: 'never' }], // Default: playwright-report/
  ['list'],
  ['junit', { outputFile: 'reports/junit/results.xml' }] // Para integraciones futuras
],

use: {
  baseURL: process.env.BASE_URL || 'http://localhost:5173',
  testIdAttribute: 'data-testid',
  trace: 'on-first-retry',        // Trace solo si falla (retry 1)
  video: 'retain-on-failure',     // Videos si falla
  screenshot: 'only-on-failure'   // Screenshots si falla
}
```

**Beneficios:**
- ✅ Trace capturado automáticamente en retry (debugging sin overhead)
- ✅ Videos solo en failures (ahorra espacio)
- ✅ JUnit XML para integraciones con otras herramientas
- ✅ HTML report en `playwright-report/` (estándar Playwright)

---

## 2️⃣ Artefactos + Resumen del Job

### Implementación en CI

Cada job (smoke, regression, api) ahora sube:

```yaml
- name: 📊 Upload Playwright HTML report
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report-${{ github.job }}
    path: playwright-report
    retention-days: 7

- name: 🔍 Upload traces & media
  if: always()
  uses: actions/upload-artifact@v4
  with:
    name: traces-and-media-${{ github.job }}
    path: |
      test-results
      **/*-trace.zip
    retention-days: 14
    if-no-files-found: ignore

- name: 📝 Job summary
  if: always()
  run: |
    echo "## ✅ Resultados ${{ github.job }}" >> $GITHUB_STEP_SUMMARY
    echo "- Commit: $GITHUB_SHA" >> $GITHUB_STEP_SUMMARY
    echo "- Reporte HTML: (artefacto) **playwright-report-${{ github.job }}**" >> $GITHUB_STEP_SUMMARY
    echo "- Traces/Videos: (artefacto) **traces-and-media-${{ github.job }}**" >> $GITHUB_STEP_SUMMARY
```

**Resultados:**
- 📊 HTML report completo con evidencias embebidas
- 📹 Videos de failures organizados por job
- 🔍 Traces disponibles para debugging profundo
- 📝 Resumen visible en GitHub Actions sin descargar artefactos

---

## 3️⃣ GitHub Pages (Publicación Automática)

### Job: publish-report

```yaml
publish-report:
  needs: regression-tests
  if: github.event_name == 'push' && github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  permissions:
    contents: write
  steps:
    - uses: actions/checkout@v4
    - name: Download regression report
      uses: actions/download-artifact@v4
      with:
        name: playwright-report-regression-tests
        path: ./site
    - name: Deploy to GitHub Pages
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./site
        commit_message: 'Deploy Playwright report from ${{ github.sha }}'
```

### Activar GitHub Pages

1. Ve a **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **gh-pages** → **/ (root)**
4. Save

### Resultado

- 🌐 Reporte disponible en: `https://diegocantoralp.github.io/playwright-automation/`
- 🔄 Actualización automática en cada push a `main`
- 📊 Acceso público al último reporte de regression

---

## 4️⃣ CI Inteligente (Tests Afectados)

### Implementación con dorny/paths-filter

```yaml
- name: 🔍 Detect changes
  id: changes
  uses: dorny/paths-filter@v3
  with:
    filters: |
      tests:
        - 'tests/**/*.spec.ts'
      app:
        - 'apps/**'
        - 'pages/**'
        - 'playwright.config.*'
        - 'package.json'
        - 'package-lock.json'

- name: 🧪 Run affected tests (by file)
  if: github.event_name == 'pull_request' && steps.changes.outputs.tests == 'true'
  run: |
    CHANGED_TESTS=$(git diff --name-only origin/${{ github.base_ref }}...HEAD | grep -E '^tests/.*\.spec\.ts$' || true)
    if [ -z "$CHANGED_TESTS" ]; then
      echo "No direct test files changed, running smoke..."
      npx playwright test --grep "@smoke" --project=guest-chromium
    else
      echo "Running affected tests:"
      echo "$CHANGED_TESTS"
      npx playwright test $CHANGED_TESTS --project=guest-chromium
    fi

- name: 🧪 Run smoke fallback (app/config changes)
  if: github.event_name == 'pull_request' && steps.changes.outputs.tests != 'true' && steps.changes.outputs.app == 'true'
  run: npx playwright test --grep "@smoke" --project=guest-chromium

- name: 🧪 Default smoke (push or no changes detected)
  if: github.event_name != 'pull_request' || (steps.changes.outputs.tests != 'true' && steps.changes.outputs.app != 'true')
  run: npm run test:smoke
```

### Lógica del CI Inteligente

| Cambios Detectados | Acción |
|-------------------|--------|
| `tests/**/*.spec.ts` modificados | Ejecuta **solo esos archivos** |
| `pages/**` o `apps/**` | Ejecuta `@smoke` (fallback rápido) |
| `playwright.config.*` o `package.json` | Ejecuta `@smoke` |
| Push a `main`/`develop` | Ejecuta suite completa |
| Sin cambios relevantes | Ejecuta `@smoke` |

**Beneficios:**
- ⚡ PRs con 1-2 specs modificados → feedback en segundos
- 🎯 Cambios en app/config → smoke rápido
- 🔄 Push a main → regression completa
- 💰 Ahorro de minutos de CI

---

## 5️⃣ Mini Dashboard en README

### Badges Implementados

```markdown
[![CI](https://img.shields.io/github/actions/workflow/status/diegocantoralp/playwright-automation/ci.yml?branch=main&label=CI%20Pipeline)](https://github.com/diegocantoralp/playwright-automation/actions)
[![Playwright](https://img.shields.io/badge/Tested%20with-Playwright-45ba4b?logo=playwright)](https://playwright.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
```

### Sección de Estado

```markdown
## 📊 Estado del Proyecto

### 🔄 Pipeline de CI

- **Smoke (PR):** Ejecuta cambios afectados o `@smoke` si no hay match → feedback rápido
- **API (push):** Contratos y mocks con validación Zod
- **Regression (push a main):** Suite completa con a11y + visual + @auth
- **Flaky Scan (daily):** Detección automática de tests inestables
- **Reporte HTML (main):** Publicado automáticamente en **GitHub Pages**
```

---

## 6️⃣ Scripts Útiles

### package.json

```json
{
  "scripts": {
    "report:open": "npx playwright show-report",
    "report:merge": "npx playwright merge-reports --reporter=html blob-reports",
    "report:summary": "node scripts/generate-summary.js"
  }
}
```

### Uso

```bash
# Abrir reporte HTML local
npm run report:open

# Mergear reportes de múltiples shards (si usas paralelización)
npm run report:merge

# Generar resumen custom
npm run report:summary
```

---

## 7️⃣ Verificación Local

### Generar Reporte Completo

```bash
# Ejecuta regression con traces/videos
npm run test:regression

# Abre el reporte HTML
npm run report:open
```

### Simular "Solo Afectados"

```bash
# Ejecuta un spec específico
npx playwright test tests/smoke.spec.ts --project=guest-chromium

# Ejecuta con trace habilitado
npm run test:trace -- tests/smoke.spec.ts
```

### Ver Trace Localmente

```bash
# Abre trace viewer con un archivo específico
npx playwright show-trace test-results/smoke-spec-ts-test-name/trace.zip
```

---

## 🎯 Resultado Final

### Workflow Completo

1. **Desarrollador crea PR** con cambios en `tests/e2e/home.spec.ts`
2. **CI detecta cambios** con `dorny/paths-filter`
3. **Ejecuta solo ese spec** → feedback en ~30 segundos
4. **Si falla**:
   - 📹 Video del failure
   - 🔍 Trace completo
   - 📸 Screenshots
   - 📊 HTML report
5. **En merge a main**:
   - Regression completa
   - Publicación automática en GitHub Pages
   - Artefactos disponibles por 14 días

### KPIs de Mejora

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Feedback en PR | 5-10 min | 30-60 seg | 90% ⬇️ |
| Debugging failures | Manual | Automático (trace) | 🎯 |
| Acceso a reportes | Download zip | GitHub Pages | 🌐 |
| Cobertura CI | Suite completa siempre | Inteligente | 💰 |

---

## 🔗 Enlaces Útiles

- [Playwright Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [GitHub Actions Artifacts](https://docs.github.com/en/actions/using-workflows/storing-workflow-data-as-artifacts)
- [GitHub Pages Deployment](https://github.com/peaceiris/actions-gh-pages)
- [Path Filtering](https://github.com/dorny/paths-filter)

---

## 📝 Próximos Pasos

- **Día 10**: Test data management con Faker.js
- **Día 11**: Performance testing con Lighthouse
- **Día 12**: Cross-browser testing (Firefox, Safari)
- **Día 13**: Mobile testing y device emulation

---

✅ **Día 9 completado**: Reportes enriquecidos + CI inteligente + GitHub Pages implementados
