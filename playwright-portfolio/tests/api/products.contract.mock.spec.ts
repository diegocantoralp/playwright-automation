import { test, expect } from '../../fixtures/base-test';
import { ProductsResponseSchema, ProductResponseSchema } from '../../packages/schemas/product.schema';
import { fulfillJson, delay } from '../../packages/test-utils/network';

const API_PATH = '**/api/products';

test.describe('Products API - Contract Testing (Mocked)', () => {
  test('@api @mock @smoke should return valid products schema', async ({ page, request, baseURL, apiHelperWithMocking }) => {
    // Mock successful response with valid data
    const mockProducts = [
      apiHelperWithMocking.createMockProduct({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Wireless Headphones',
        price: 149.99,
        currency: 'USD',
        inStock: true,
      }),
      apiHelperWithMocking.createMockProduct({
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Gaming Mouse',
        price: 79.99,
        currency: 'USD',
        inStock: false,
      })
    ];

    await apiHelperWithMocking.mockApiSuccess(
      API_PATH, 
      apiHelperWithMocking.createMockProductsResponse(mockProducts).data
    );

    // Make request and validate
    const response = await request.get(new URL('/api/products', baseURL).toString());
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('📦 Products response:', JSON.stringify(data, null, 2));

    // Validate with Zod schema
    const parsed = ProductsResponseSchema.safeParse(data);
    if (!parsed.success) {
      console.error('❌ Schema validation failed:', parsed.error.errors);
    }
    expect(parsed.success, `Invalid schema: ${JSON.stringify(parsed.error?.errors)}`).toBe(true);
    
    // Additional business validations
    expect(data.data.items).toHaveLength(2);
    expect(data.data.total).toBe(2);
    expect(data.success).toBe(true);
  });

  test('@api @mock @edge should handle server error (500)', async ({ page, request, baseURL, apiHelperWithMocking }) => {
    await apiHelperWithMocking.mockApiError(
      API_PATH, 
      'Database connection failed', 
      500
    );

    const response = await request.get(new URL('/api/products', baseURL).toString());
    expect(response.status()).toBe(500);
    
    const body = await response.json();
    expect(body).toMatchObject({ 
      message: 'Database connection failed',
      statusCode: 500
    });
  });

  test('@api @mock @edge should handle latency and timeout scenarios', async ({ page, request, baseURL, apiHelperWithMocking }) => {
    test.setTimeout(15_000); // Extended timeout for this test
    
    const latency = 2000; // 2 seconds
    await apiHelperWithMocking.mockApiWithLatency(
      API_PATH,
      { items: [], total: 0 },
      latency
    );

    const start = Date.now();
    const response = await request.get(new URL('/api/products', baseURL).toString());
    const elapsed = Date.now() - start;

    expect(response.ok()).toBeTruthy();
    expect(elapsed).toBeGreaterThanOrEqual(latency - 100); // Allow some variance
    
    const data = await response.json();
    expect(data.meta.duration).toBe(latency);
  });

  test('@api @mock @edge should handle empty product list', async ({ page, request, baseURL, apiHelperWithMocking }) => {
    await apiHelperWithMocking.mockApiSuccess(
      API_PATH,
      { items: [], total: 0, hasMore: false }
    );

    const response = await request.get(new URL('/api/products', baseURL).toString());
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const parsed = ProductsResponseSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    
    expect(data.data.items).toHaveLength(0);
    expect(data.data.total).toBe(0);
  });

  test('@api @mock @edge should validate strict product field requirements', async ({ page, request, baseURL, apiHelperWithMocking }) => {
    // Mock response with invalid product data
    await page.route(API_PATH, async (route) => {
      await fulfillJson(route, {
        success: true,
        data: {
          items: [
            {
              id: 'invalid-uuid', // Invalid UUID
              name: '', // Empty name
              price: -10, // Negative price
              currency: 'INVALID', // Invalid currency
              inStock: 'yes', // Invalid boolean
              updatedAt: 'invalid-date' // Invalid date
            }
          ],
          total: 1
        },
        meta: {
          timestamp: new Date().toISOString()
        }
      });
    });

    const response = await request.get(new URL('/api/products', baseURL).toString());
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // This should fail schema validation
    const parsed = ProductsResponseSchema.safeParse(data);
    expect(parsed.success).toBe(false);
    
    if (!parsed.success) {
      console.log('✅ Expected validation errors:', parsed.error.errors);
      expect(parsed.error.errors.length).toBeGreaterThan(0);
    }
  });

  test('@regression @api @mock should handle pagination correctly', async ({ page, request, baseURL, apiHelperWithMocking }) => {
    const mockProducts = Array.from({ length: 5 }, (_, i) => 
      apiHelperWithMocking.createMockProduct({
        id: crypto.randomUUID(),
        name: `Product ${i + 1}`,
        price: (i + 1) * 10,
      })
    );

    await apiHelperWithMocking.mockApiSuccess(
      '**/api/products?page=1&limit=5',
      {
        items: mockProducts,
        total: 50,
        page: 1,
        limit: 5,
        hasMore: true
      }
    );

    const response = await request.get(new URL('/api/products?page=1&limit=5', baseURL).toString());
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    const parsed = ProductsResponseSchema.safeParse(data);
    expect(parsed.success).toBe(true);
    
    expect(data.data.items).toHaveLength(5);
    expect(data.data.total).toBe(50);
    expect(data.data.page).toBe(1);
    expect(data.data.limit).toBe(5);
    expect(data.data.hasMore).toBe(true);
  });
});