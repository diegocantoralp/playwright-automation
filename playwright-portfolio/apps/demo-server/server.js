const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3010;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../../docs')));

// In-memory database
let products = [
  {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Default Product 1',
    price: 99.99,
    currency: 'PEN',
    inStock: true,
    updatedAt: new Date().toISOString(),
    description: 'Default product for testing'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Default Product 2',
    price: 149.99,
    currency: 'PEN',
    inStock: true,
    updatedAt: new Date().toISOString(),
    description: 'Another default product'
  }
];

// Store original state for reset
const originalProducts = [...products];

// ===========================
// API ENDPOINTS
// ===========================

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

/**
 * GET /api/products
 * Get all products
 */
app.get('/api/products', (req, res) => {
  const { inStock, minPrice, maxPrice } = req.query;

  let filteredProducts = [...products];

  // Filter by stock status
  if (inStock !== undefined) {
    const stockFilter = inStock === 'true';
    filteredProducts = filteredProducts.filter(p => p.inStock === stockFilter);
  }

  // Filter by price range
  if (minPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price >= parseFloat(minPrice));
  }
  if (maxPrice !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.price <= parseFloat(maxPrice));
  }

  res.json({
    data: filteredProducts,
    meta: {
      total: filteredProducts.length,
      timestamp: new Date().toISOString()
    }
  });
});

/**
 * GET /api/products/:id
 * Get single product by ID
 */
app.get('/api/products/:id', (req, res) => {
  const product = products.find(p => p.id === req.params.id);
  
  if (!product) {
    return res.status(404).json({
      error: 'Product not found',
      code: 'PRODUCT_NOT_FOUND'
    });
  }

  res.json(product);
});

/**
 * POST /api/reset
 * Reset database to original state
 * Usage: await pwRequest.post('/api/reset')
 */
app.post('/api/reset', (req, res) => {
  console.log('🔄 Resetting database to original state');
  
  products = JSON.parse(JSON.stringify(originalProducts));
  
  res.json({
    success: true,
    message: 'Database reset to original state',
    productsCount: products.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/seed
 * Seed database with custom data
 * Usage: await pwRequest.post('/api/seed', { data: { items: [...] } })
 */
app.post('/api/seed', (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items)) {
    return res.status(400).json({
      error: 'Invalid request body',
      code: 'INVALID_SEED_DATA',
      message: 'Expected { items: [...] } in request body'
    });
  }

  console.log(`🌱 Seeding database with ${items.length} items`);

  // Validate items
  const validatedItems = items.map((item, index) => {
    if (!item.id || !item.name || item.price === undefined) {
      throw new Error(`Item at index ${index} is missing required fields (id, name, price)`);
    }

    return {
      id: item.id,
      name: item.name,
      price: item.price,
      currency: item.currency || 'PEN',
      inStock: item.inStock !== undefined ? item.inStock : true,
      updatedAt: item.updatedAt || new Date().toISOString(),
      description: item.description || ''
    };
  });

  // Replace products with seeded data
  products = validatedItems;

  res.json({
    success: true,
    message: `Database seeded with ${items.length} items`,
    productsCount: products.length,
    timestamp: new Date().toISOString()
  });
});

/**
 * DELETE /api/products
 * Clear all products (for testing empty state)
 */
app.delete('/api/products', (req, res) => {
  console.log('🗑️ Clearing all products');
  
  products = [];
  
  res.json({
    success: true,
    message: 'All products deleted',
    timestamp: new Date().toISOString()
  });
});

/**
 * POST /api/products
 * Create a new product
 */
app.post('/api/products', (req, res) => {
  const { name, price, currency, inStock, description } = req.body;

  if (!name || price === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      code: 'VALIDATION_ERROR',
      message: 'name and price are required'
    });
  }

  const newProduct = {
    id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    price: parseFloat(price),
    currency: currency || 'PEN',
    inStock: inStock !== undefined ? inStock : true,
    updatedAt: new Date().toISOString(),
    description: description || ''
  };

  products.push(newProduct);

  res.status(201).json(newProduct);
});

// ===========================
// UI ROUTES
// ===========================

/**
 * GET /
 * Serve example UI with data-testids
 */
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../../docs/example-ui-with-testids.html'));
});

/**
 * GET /products
 * Serve products page
 */
app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, '../../docs/example-ui-with-testids.html'));
});

// ===========================
// ERROR HANDLING
// ===========================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    code: 'NOT_FOUND',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    code: 'INTERNAL_ERROR',
    message: err.message
  });
});

// ===========================
// START SERVER
// ===========================

const server = app.listen(PORT, () => {
  console.log('\n🚀 Demo Server Started');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Server: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/products`);
  console.log(`🔄 Reset: POST http://localhost:${PORT}/api/reset`);
  console.log(`🌱 Seed: POST http://localhost:${PORT}/api/seed`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`\n💡 Example usage in Playwright:`);
  console.log(`   await pwRequest.post('http://localhost:${PORT}/api/reset');`);
  console.log(`   await pwRequest.post('http://localhost:${PORT}/api/seed', {`);
  console.log(`     data: { items: [...] }`);
  console.log(`   });\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n👋 Shutting down server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
