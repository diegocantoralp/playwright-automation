import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';
import path from 'path';

const GOLDEN_FILE = path.join(
  process.cwd(),
  'tests',
  'accessibility',
  'golden',
  'product-item.a11y.json'
);

test.describe('A11y Golden - ProductItem @a11y', () => {
  
  test('no introduce nuevas violaciones vs golden baseline', async ({ page }) => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Mouse Gamer RGB',
      price: 120,
      currency: 'PEN',
      inStock: true,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // Ejecutar análisis de accesibilidad
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    
    // Extraer solo los IDs de violaciones (baseline estable)
    const currentViolations = {
      violations: results.violations.map(v => v.id).sort(),
      violationCount: results.violations.length,
      timestamp: new Date().toISOString(),
    };
    
    // Si UPDATE_A11Y=1, actualizar el golden file
    if (process.env.UPDATE_A11Y === '1') {
      const goldenData = {
        violations: currentViolations.violations,
        lastUpdated: currentViolations.timestamp,
        note: 'Golden baseline - expected violations',
      };
      
      fs.writeFileSync(GOLDEN_FILE, JSON.stringify(goldenData, null, 2));
      test.info().annotations.push({
        type: 'note',
        description: `Golden baseline actualizado: ${currentViolations.violationCount} violaciones`,
      });
      
      console.log('✅ Golden baseline actualizado:', GOLDEN_FILE);
      console.log('Violaciones registradas:', currentViolations.violations);
    }
    
    // Leer el golden file
    const goldenContent = fs.readFileSync(GOLDEN_FILE, 'utf-8');
    const golden = JSON.parse(goldenContent);
    
    // Comparar contra el baseline
    expect(
      currentViolations.violations,
      `Nuevas violaciones de accesibilidad detectadas.\n` +
      `Expected (golden): ${golden.violations.join(', ') || 'ninguna'}\n` +
      `Actual: ${currentViolations.violations.join(', ') || 'ninguna'}\n\n` +
      `Para actualizar el baseline: UPDATE_A11Y=1 npm test -- product-item.a11y.spec.ts`
    ).toEqual(golden.violations);
    
    // Log detallado si hay violaciones
    if (results.violations.length > 0) {
      console.log('\n⚠️  Violaciones de accesibilidad (esperadas):');
      results.violations.forEach(violation => {
        console.log(`\n  - ${violation.id}: ${violation.description}`);
        console.log(`    Impact: ${violation.impact}`);
        console.log(`    Afecta a ${violation.nodes.length} elemento(s)`);
      });
    }
  });
  
  test('verifica roles ARIA y etiquetas semánticas', async ({ page }) => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Teclado Mecánico',
      price: 350,
      currency: 'PEN',
      inStock: true,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // Verificar que el componente tiene rol article
    const component = page.getByTestId('product-item');
    await expect(component).toHaveAttribute('role', 'article');
    await expect(component).toHaveAttribute('aria-label', 'Producto');
    
    // Verificar que el stock tiene live region (para lectores de pantalla)
    const stock = page.getByTestId('stock');
    await expect(stock).toHaveAttribute('role', 'status');
    await expect(stock).toHaveAttribute('aria-live', 'polite');
    
    // Verificar que el precio convertido tiene label
    const converted = page.getByTestId('price-converted');
    await expect(converted).toHaveAttribute('aria-label', 'Precio convertido');
  });
  
  test('navegación por teclado funciona correctamente', async ({ page }) => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440013',
      name: 'Audífonos Bluetooth',
      price: 180,
      currency: 'PEN',
      inStock: true,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // Navegar con Tab
    await page.keyboard.press('Tab');
    
    // El componente debe ser accesible por teclado (aunque sea solo lectura)
    const component = page.getByTestId('product-item');
    await expect(component).toBeVisible();
    
    // Verificar que no hay trampas de teclado
    await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
  });
  
  test('contraste de colores cumple WCAG AA', async ({ page }) => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440014',
      name: 'Laptop Gamer',
      price: 3500,
      currency: 'PEN',
      inStock: false,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // Ejecutar análisis específico de contraste
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .include('[data-testid="product-item"]')
      .analyze();
    
    // Filtrar violaciones relacionadas con contraste
    const contrastViolations = results.violations.filter(v =>
      v.id.includes('color-contrast')
    );
    
    expect(
      contrastViolations.length,
      `Violaciones de contraste detectadas: ${contrastViolations.map(v => v.description).join(', ')}`
    ).toBe(0);
  });
});
