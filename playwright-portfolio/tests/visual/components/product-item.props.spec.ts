import { test, expect } from '@playwright/test';
import { ProductPropsSchema } from '../../../packages/schemas/product.props.schema';

test.describe('Component: ProductItem (Props → DOM) @visual @regression', () => {
  
  test('renderiza correctamente con props válidos', async ({ page }) => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440011',
      name: 'Mouse Gamer RGB',
      price: 120,
      currency: 'PEN' as const,
      inStock: true,
    };
    
    // Validar props antes de usar (contract testing)
    const parsed = ProductPropsSchema.safeParse(props);
    expect(parsed.success, `Props inválidos: ${parsed.success ? '' : parsed.error.message}`).toBe(true);
    
    // Navegar al componente con props vía query string
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // Aserciones DOM: verificar que props se renderizan correctamente
    const component = page.getByTestId('product-item');
    await expect(component).toBeVisible();
    
    await expect(page.getByTestId('name')).toHaveText('Mouse Gamer RGB');
    await expect(page.getByTestId('price')).toHaveText(/PEN\s*120/);
    await expect(page.getByTestId('stock')).toHaveText(/Disponible/);
    
    // Visual snapshot del componente aislado
    await expect(component).toHaveScreenshot('product-item-in-stock.png');
  });
  
  test('renderiza producto agotado correctamente', async ({ page }) => {
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440012',
      name: 'Teclado Mecánico',
      price: 350,
      currency: 'PEN' as const,
      inStock: false,
    };
    
    const parsed = ProductPropsSchema.safeParse(props);
    expect(parsed.success).toBe(true);
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    await expect(page.getByTestId('name')).toHaveText('Teclado Mecánico');
    await expect(page.getByTestId('stock')).toHaveText(/Agotado/);
    
    // Verificar que el estilo de "agotado" se aplica
    const stockElement = page.getByTestId('stock');
    await expect(stockElement).toHaveClass(/out-of-stock/);
    
    await expect(page.getByTestId('product-item')).toHaveScreenshot('product-item-out-of-stock.png');
  });
  
  test('maneja diferentes monedas (USD, EUR)', async ({ page }) => {
    const testCases = [
      { currency: 'USD', price: 32, expected: /USD/ },
      { currency: 'EUR', price: 28, expected: /EUR/ },
    ];
    
    for (const { currency, price, expected } of testCases) {
      const props = {
        id: '550e8400-e29b-41d4-a716-446655440013',
        name: 'Producto Internacional',
        price,
        currency: currency as 'USD' | 'EUR' | 'PEN',
        inStock: true,
      };
      
      const parsed = ProductPropsSchema.safeParse(props);
      expect(parsed.success).toBe(true);
      
      const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
      await page.goto(url);
      
      await expect(page.getByTestId('price')).toHaveText(expected);
    }
  });
  
  test('rechaza props inválidos (contract violation)', async ({ page }) => {
    const invalidProps = {
      id: 'not-a-uuid',  // ❌ Inválido
      name: '',          // ❌ Vacío
      price: -10,        // ❌ Negativo
      currency: 'XXX',   // ❌ No permitido
      inStock: 'yes',    // ❌ No booleano
    };
    
    const parsed = ProductPropsSchema.safeParse(invalidProps);
    expect(parsed.success).toBe(false);
    
    if (!parsed.success) {
      // Verificar que Zod detectó todos los errores
      expect(parsed.error.errors.length).toBeGreaterThan(0);
      console.log('Errores de validación detectados:', parsed.error.errors.map(e => e.message));
    }
  });
});
