import { FullConfig } from '@playwright/test';

/**
 * Global setup that runs before all tests
 * Use this for authentication, database setup, etc.
 */
async function globalSetup(config: FullConfig) {
  console.log('🚀 Starting global setup...');
  
  // Example: Set up test database
  // await setupTestDatabase();
  
  // Example: Authenticate and save state
  // await authenticateUser();
  
  console.log('✅ Global setup completed');
}

export default globalSetup;