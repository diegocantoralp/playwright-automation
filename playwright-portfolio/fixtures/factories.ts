/**
 * Test Data Factory Pattern
 * 
 * Genera datos de prueba consistentes y realistas
 * usando el patrón Factory
 */

export class UserFactory {
  private static idCounter = 1;

  static create(overrides: Partial<User> = {}): User {
    return {
      id: `user-${this.idCounter++}`,
      email: `test.user${this.idCounter}@example.com`,
      name: `Test User ${this.idCounter}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static createAdmin(overrides: Partial<User> = {}): User {
    return this.create({
      role: 'admin',
      email: `admin${this.idCounter}@example.com`,
      ...overrides,
    });
  }

  static createBatch(count: number, overrides: Partial<User> = {}): User[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static reset() {
    this.idCounter = 1;
  }
}

export class ProductFactory {
  private static idCounter = 1;

  static create(overrides: Partial<Product> = {}): Product {
    return {
      id: `550e8400-e29b-41d4-a716-44665544${String(this.idCounter++).padStart(4, '0')}`,
      name: `Test Product ${this.idCounter}`,
      description: `Description for test product ${this.idCounter}`,
      price: Math.floor(Math.random() * 1000) + 10,
      currency: 'PEN',
      inStock: true,
      stock: Math.floor(Math.random() * 100) + 1,
      category: 'test',
      imageUrl: `https://via.placeholder.com/300x200?text=Product+${this.idCounter}`,
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static createOutOfStock(overrides: Partial<Product> = {}): Product {
    return this.create({
      inStock: false,
      stock: 0,
      ...overrides,
    });
  }

  static createExpensive(overrides: Partial<Product> = {}): Product {
    return this.create({
      price: Math.floor(Math.random() * 5000) + 1000,
      category: 'premium',
      ...overrides,
    });
  }

  static createBatch(count: number, overrides: Partial<Product> = {}): Product[] {
    return Array.from({ length: count }, () => this.create(overrides));
  }

  static reset() {
    this.idCounter = 1;
  }
}

export class OrderFactory {
  private static idCounter = 1;

  static create(overrides: Partial<Order> = {}): Order {
    return {
      id: `order-${String(this.idCounter++).padStart(8, '0')}`,
      userId: `user-${Math.floor(Math.random() * 100) + 1}`,
      items: ProductFactory.createBatch(Math.floor(Math.random() * 3) + 1).map(p => ({
        productId: p.id,
        quantity: Math.floor(Math.random() * 3) + 1,
        price: p.price,
      })),
      total: 0, // Calculated below
      status: 'pending',
      createdAt: new Date().toISOString(),
      ...overrides,
    };
  }

  static createCompleted(overrides: Partial<Order> = {}): Order {
    return this.create({
      status: 'completed',
      completedAt: new Date().toISOString(),
      ...overrides,
    });
  }

  static createCancelled(overrides: Partial<Order> = {}): Order {
    return this.create({
      status: 'cancelled',
      cancelledAt: new Date().toISOString(),
      ...overrides,
    });
  }

  static reset() {
    this.idCounter = 1;
  }
}

// Type definitions
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin' | 'guest';
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  inStock: boolean;
  stock: number;
  category: string;
  imageUrl: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
  cancelledAt?: string;
}

// Helper para resetear todos los factories
export function resetAllFactories() {
  UserFactory.reset();
  ProductFactory.reset();
  OrderFactory.reset();
}
