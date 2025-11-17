import type { Route } from '@playwright/test';

/**
 * Network utilities for mocking HTTP responses in tests
 */

/**
 * Fulfill a route with JSON response
 * @param route - Playwright Route object
 * @param body - Response body (will be JSON stringified)
 * @param status - HTTP status code (default: 200)
 * @param headers - Additional headers
 */
export async function fulfillJson(
  route: Route, 
  body: unknown, 
  status: number = 200, 
  headers: Record<string, string> = {}
): Promise<void> {
  await route.fulfill({
    status,
    contentType: 'application/json',
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      ...headers,
    },
    body: JSON.stringify(body)
  });
}

/**
 * Create a delay promise
 * @param ms - Milliseconds to delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Fulfill a route with error response
 * @param route - Playwright Route object
 * @param message - Error message
 * @param status - HTTP status code (default: 500)
 */
export async function fulfillError(
  route: Route,
  message: string = 'Internal Server Error',
  status: number = 500
): Promise<void> {
  await fulfillJson(route, {
    error: 'API_ERROR',
    message,
    statusCode: status,
    timestamp: new Date().toISOString()
  }, status);
}

/**
 * Fulfill a route with network timeout simulation
 * @param route - Playwright Route object
 */
export async function fulfillTimeout(route: Route): Promise<void> {
  await route.abort('timedout');
}

/**
 * Common API response wrapper
 * @param data - Response data
 * @param meta - Additional metadata
 */
export function createApiResponse<T>(data: T, meta: Record<string, any> = {}) {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta
    }
  };
}