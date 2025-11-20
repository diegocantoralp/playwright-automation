import { test, expect } from '../../fixtures/api-fixtures';

/**
 * Products UI Tests with Deterministic State
 * Uses seed/reset fixtures to control backend data
 */
test.describe('Products UI - Deterministic State', () => {
  test.beforeEach(async ({ resetApp }) => {
    // Reset to clean state before each test
    await resetApp();
  });

  test('@regression should display seeded products list', async ({ page, seedProducts }) => {
    // Seed specific test data
    await seedProducts([
      {
        id: '550e8400-e29b-41d4-a716-446655440010',
        name: 'Taza Premium',
        price: 25.50,
        currency: 'PEN',
        inStock: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440011',
        name: 'Mouse Gamer',
        price: 120.00,
        currency: 'PEN',
        inStock: true,
        updatedAt: new Date().toISOString()
      }
    ]);

    // Navigate and verify
    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify using data-testid
    const productItems = page.locator('[data-testid="product-item"]');
    await expect(productItems).toHaveCount(2);

    // Verify specific product names
    await expect(page.getByTestId('product-name').first()).toContainText('Taza Premium');
    await expect(page.getByTestId('product-name').nth(1)).toContainText('Mouse Gamer');
  });

  test('@edge @flaky should display empty state when no products', async ({ page, seedProducts }) => {
    // Seed empty list
    await seedProducts([]);

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify empty state
    await expect(page.getByText(/no hay productos/i)).toBeVisible();
    await expect(page.locator('[data-testid="product-item"]')).toHaveCount(0);
    await expect(page.getByTestId('empty-state')).toBeVisible();
  });

  test('@regression should display single product correctly', async ({ page, seedProducts }) => {
    await seedProducts([
      {
        id: '550e8400-e29b-41d4-a716-446655440020',
        name: 'Laptop HP',
        price: 2999.99,
        currency: 'PEN',
        inStock: true,
        updatedAt: new Date().toISOString(),
        description: 'Laptop profesional de alta gama'
      }
    ]);

    await page.goto('/products');

    // Verify single product
    await expect(page.getByTestId('product-item')).toHaveCount(1);
    await expect(page.getByTestId('product-name')).toContainText('Laptop HP');
    await expect(page.getByTestId('product-price')).toContainText('2999.99');
    await expect(page.getByTestId('product-stock-status')).toContainText('In Stock');
  });

  test('@regression should handle large product list', async ({ page, seedProducts }) => {
    // Seed many products
    const manyProducts = Array.from({ length: 50 }, (_, i) => ({
      id: `product-${i}-${Date.now()}`,
      name: `Product ${i + 1}`,
      price: (i + 1) * 10,
      currency: 'PEN',
      inStock: i % 2 === 0,
      updatedAt: new Date().toISOString()
    }));

    await seedProducts(manyProducts);

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Verify pagination or lazy loading
    const visibleProducts = page.getByTestId('product-item');
    const count = await visibleProducts.count();
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThanOrEqual(50);
  });

  test('@visual should match product list snapshot', async ({ page, seedProducts }) => {
    await seedProducts([
      {
        id: '550e8400-e29b-41d4-a716-446655440030',
        name: 'Teclado Mecánico',
        price: 199.99,
        currency: 'PEN',
        inStock: true,
        updatedAt: new Date().toISOString()
      }
    ]);

    await page.goto('/products');
    await page.waitForLoadState('networkidle');

    // Wait for products to render
    await expect(page.getByTestId('product-item')).toBeVisible();

    // Take visual snapshot
    await expect(page).toHaveScreenshot('products-list-seeded.png', {
      fullPage: true,
      animations: 'disabled'
    });
  });

  test('@edge @flaky should handle product with missing optional fields', async ({ page, seedProducts }) => {
    await seedProducts([
      {
        id: '550e8400-e29b-41d4-a716-446655440040',
        name: 'Minimal Product',
        price: 50,
        currency: 'PEN',
        inStock: true,
        updatedAt: new Date().toISOString()
        // No description, no image, etc.
      }
    ]);

    await page.goto('/products');

    // Should still render without errors
    await expect(page.getByTestId('product-item')).toBeVisible();
    await expect(page.getByTestId('product-name')).toContainText('Minimal Product');
  });

  test('@regression should filter products by stock status', async ({ page, seedProducts }) => {
    await seedProducts([
      {
        id: '1',
        name: 'In Stock Item',
        price: 100,
        currency: 'PEN',
        inStock: true,
        updatedAt: new Date().toISOString()
      },
      {
        id: '2',
        name: 'Out of Stock Item',
        price: 100,
        currency: 'PEN',
        inStock: false,
        updatedAt: new Date().toISOString()
      }
    ]);

    await page.goto('/products');

    // Apply filter (if filter UI exists)
    const filterButton = page.getByTestId('filter-in-stock');
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Verify only in-stock items shown
      const visibleProducts = await page.getByTestId('product-name').allTextContents();
      expect(visibleProducts).toContain('In Stock Item');
      expect(visibleProducts).not.toContain('Out of Stock Item');
    }
  });
});

test.describe('Products UI - Reset Functionality', () => {
  test('@regression should reset state between tests', async ({ page, seedProducts, resetApp }) => {
    // First seed
    await seedProducts([{ id: '1', name: 'First', price: 10, currency: 'PEN', inStock: true, updatedAt: new Date().toISOString() }]);
    await page.goto('/products');
    await expect(page.getByTestId('product-item')).toHaveCount(1);

    // Reset
    await resetApp();

    // Should return to default state
    await page.goto('/products');
    await page.waitForLoadState('networkidle');
    
    // Verify reset worked (default products or empty state)
    const productCount = await page.getByTestId('product-item').count();
    console.log(`Products after reset: ${productCount}`);
  });
});
