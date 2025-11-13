import { z } from 'zod';

/**
 * API Response Schemas using Zod
 * These ensure our API responses match expected contracts
 */

// Health check response schema
export const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'error', 'maintenance']),
  timestamp: z.string().datetime(),
  version: z.string(),
  environment: z.string(),
  services: z.object({
    database: z.enum(['connected', 'disconnected', 'error']),
    cache: z.enum(['connected', 'disconnected', 'error']),
  }).optional(),
  uptime: z.number().positive().optional(),
});

export type HealthCheck = z.infer<typeof HealthCheckSchema>;

// Example user schema for future API tests
export const UserSchema = z.object({
  id: z.number().positive(),
  name: z.string().min(1),
  email: z.string().email(),
  active: z.boolean(),
  createdAt: z.string().datetime(),
});

export type User = z.infer<typeof UserSchema>;

// API Error schema
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number(),
  timestamp: z.string().datetime(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;