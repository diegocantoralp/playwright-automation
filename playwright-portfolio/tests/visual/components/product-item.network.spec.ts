import { test, expect } from '@playwright/test';

test.describe('Component: ProductItem (Network Mocked) @mock', () => {
  
  test('muestra precio convertido cuando /api/convert responde correctamente', async ({ page }) => {
    // Mock de la API de conversión
    await page.route('**/api/convert?**', async (route) => {
      const url = new URL(route.request().url());
      const amount = Number(url.searchParams.get('amount') || '0');
      const currency = url.searchParams.get('currency') || 'PEN';
      
      // Simular conversión PEN → USD
      let convertedAmount = amount;
      let convertedCurrency = 'USD';
      
      if (currency === 'PEN') {
        convertedAmount = amount / 3.7;  // Tasa de ejemplo
      }
      
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          amount: convertedAmount.toFixed(2),
          currency: convertedCurrency,
        }),
      });
    });
    
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440099',
      name: 'Gorra Deportiva',
      price: 37,
      currency: 'PEN',
      inStock: true,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // Esperar a que la conversión se cargue
    await expect(page.getByTestId('price-converted')).toHaveText(/USD/, { timeout: 5000 });
    
    // Verificar que el monto convertido es aproximadamente correcto
    const convertedText = await page.getByTestId('price-converted').textContent();
    expect(convertedText).toContain('10.00'); // 37 / 3.7 ≈ 10
  });
  
  test('maneja error 500 sin romper el DOM @edge', async ({ page }) => {
    // Mock que simula error del servidor
    await page.route('**/api/convert?**', route => {
      route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Internal Server Error',
      });
    });
    
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440100',
      name: 'Polo Básico',
      price: 80,
      currency: 'PEN',
      inStock: false,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // El componente debe renderizarse correctamente a pesar del error de red
    await expect(page.getByTestId('product-item')).toBeVisible();
    await expect(page.getByTestId('name')).toHaveText('Polo Básico');
    await expect(page.getByTestId('price')).toHaveText(/80/);
    
    // El precio convertido debe mostrar mensaje de error o estar vacío
    const convertedEl = page.getByTestId('price-converted');
    await expect(convertedEl).toBeVisible();
    
    // Puede ser "Conversión no disponible" o texto similar
    const text = await convertedEl.textContent();
    expect(text).toBeTruthy();
  });
  
  test('maneja timeout de red (slow network) @edge', async ({ page }) => {
    // Mock con delay extremo (simulando timeout)
    await page.route('**/api/convert?**', async (route) => {
      // No responder nunca (simula timeout)
      await new Promise(resolve => setTimeout(resolve, 10000));
      await route.abort('timedout');
    });
    
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440101',
      name: 'Zapatillas Running',
      price: 250,
      currency: 'PEN',
      inStock: true,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // El componente debe renderizarse incluso si la conversión está "cargando"
    await expect(page.getByTestId('product-item')).toBeVisible();
    await expect(page.getByTestId('name')).toHaveText('Zapatillas Running');
    
    // El elemento de conversión puede estar en estado "loading"
    const convertedEl = page.getByTestId('price-converted');
    await expect(convertedEl).toBeVisible();
  });
  
  test('maneja respuesta JSON malformada @edge', async ({ page }) => {
    await page.route('**/api/convert?**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: '{invalid json}',  // JSON inválido
      });
    });
    
    const props = {
      id: '550e8400-e29b-41d4-a716-446655440102',
      name: 'Mochila Escolar',
      price: 120,
      currency: 'PEN',
      inStock: true,
    };
    
    const url = `/components/product-item.html?props=${encodeURIComponent(JSON.stringify(props))}`;
    await page.goto(url);
    
    // El componente debe ser resiliente a errores de parsing
    await expect(page.getByTestId('product-item')).toBeVisible();
    await expect(page.getByTestId('name')).toHaveText('Mochila Escolar');
  });
});
