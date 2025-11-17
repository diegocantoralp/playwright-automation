import { z } from 'zod';

/**
 * Strict Product API Schemas with enhanced validation
 */

// Product schema with strict validation
export const ProductSchema = z.object({
  id: z.string().uuid('Invalid product ID format'),
  name: z.string().min(1, 'Product name is required').max(100, 'Product name too long'),
  price: z.number().nonnegative('Price must be non-negative').finite('Price must be a valid number'),
  currency: z.enum(['USD', 'PEN', 'EUR', 'MXN'], {
    errorMap: () => ({ message: 'Currency must be USD, PEN, EUR, or MXN' })
  }),
  inStock: z.boolean(),
  updatedAt: z.string().datetime('Invalid ISO 8601 datetime format'),
  createdAt: z.string().datetime('Invalid ISO 8601 datetime format').optional(),
  category: z.string().min(1, 'Category is required').optional(),
  description: z.string().max(500, 'Description too long').optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
  tags: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type Product = z.infer<typeof ProductSchema>;

// Products API response schema
export const ProductsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    items: z.array(ProductSchema),
    total: z.number().int().nonnegative('Total must be non-negative integer'),
    page: z.number().int().positive('Page must be positive integer').optional(),
    limit: z.number().int().positive('Limit must be positive integer').optional(),
    hasMore: z.boolean().optional(),
  }),
  meta: z.object({
    timestamp: z.string().datetime(),
    requestId: z.string().uuid().optional(),
    duration: z.number().nonnegative().optional(),
  }),
});

export type ProductsResponse = z.infer<typeof ProductsResponseSchema>;

// Single product response schema
export const ProductResponseSchema = z.object({
  success: z.boolean(),
  data: ProductSchema,
  meta: z.object({
    timestamp: z.string().datetime(),
    requestId: z.string().uuid().optional(),
  }),
});

export type ProductResponse = z.infer<typeof ProductResponseSchema>;

// Error response schema
export const ApiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
  timestamp: z.string().datetime(),
  details: z.array(z.object({
    field: z.string().optional(),
    message: z.string(),
    code: z.string().optional(),
  })).optional(),
});

export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;

// Health check response (enhanced)
export const HealthCheckResponseSchema = z.object({
  success: z.boolean(),
  status: z.enum(['healthy', 'degraded', 'unhealthy']),
  timestamp: z.string().datetime(),
  version: z.string().min(1),
  environment: z.enum(['development', 'staging', 'production', 'test']),
  services: z.object({
    database: z.object({
      status: z.enum(['connected', 'disconnected', 'error']),
      latency: z.number().nonnegative().optional(),
    }),
    cache: z.object({
      status: z.enum(['connected', 'disconnected', 'error']),
      latency: z.number().nonnegative().optional(),
    }),
    externalApi: z.object({
      status: z.enum(['connected', 'disconnected', 'error']),
      latency: z.number().nonnegative().optional(),
    }).optional(),
  }),
  uptime: z.number().nonnegative(),
  memory: z.object({
    used: z.number().nonnegative(),
    total: z.number().positive(),
    percentage: z.number().min(0).max(100),
  }).optional(),
});

export type HealthCheckResponse = z.infer<typeof HealthCheckResponseSchema>;