import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Products Page Object Model
 * For testing product listing functionality
 */
export class ProductsPage extends BasePage {
  // Page elements
  private readonly productsList: Locator;
  private readonly productItems: Locator;
  private readonly emptyState: Locator;
  private readonly loadingSpinner: Locator;
  private readonly errorMessage: Locator;
  private readonly searchInput: Locator;
  private readonly filterButton: Locator;
  private readonly paginationNext: Locator;
  private readonly paginationPrev: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators using data-testid for stability
    this.productsList = page.locator('[data-testid="products-list"]');
    this.productItems = page.locator('[data-testid="product-item"]');
    this.emptyState = page.locator('[data-testid="empty-state"]');
    this.loadingSpinner = page.locator('[data-testid="loading-spinner"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
    this.filterButton = page.locator('[data-testid="filter-button"]');
    this.paginationNext = page.locator('[data-testid="pagination-next"]');
    this.paginationPrev = page.locator('[data-testid="pagination-prev"]');
  }

  /**
   * Navigate to products page
   */
  async open(): Promise<void> {
    await this.goto('/products');
    await this.waitForPageLoad();
  }

  /**
   * Wait for products to load (no loading spinner)
   */
  async waitForProductsToLoad(): Promise<void> {
    await expect(this.loadingSpinner).toBeHidden({ timeout: 10000 });
  }

  /**
   * Expect specific number of products
   */
  async expectProductCount(count: number): Promise<void> {
    await this.waitForProductsToLoad();
    await expect(this.productItems).toHaveCount(count);
  }

  /**
   * Expect empty state to be visible
   */
  async expectEmptyState(): Promise<void> {
    await this.waitForProductsToLoad();
    await expect(this.emptyState).toBeVisible();
    await expect(this.productItems).toHaveCount(0);
  }

  /**
   * Expect error message
   */
  async expectErrorMessage(message?: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Get product by name
   */
  async getProductByName(name: string): Promise<Locator> {
    return this.productItems.filter({ hasText: name });
  }

  /**
   * Search for products
   */
  async searchProducts(query: string): Promise<void> {
    await this.searchInput.fill(query);
    await this.searchInput.press('Enter');
    await this.waitForProductsToLoad();
  }

  /**
   * Click filter button
   */
  async clickFilter(): Promise<void> {
    await this.filterButton.click();
  }

  /**
   * Navigate to next page
   */
  async goToNextPage(): Promise<void> {
    await this.paginationNext.click();
    await this.waitForProductsToLoad();
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage(): Promise<void> {
    await this.paginationPrev.click();
    await this.waitForProductsToLoad();
  }

  /**
   * Get all visible product names
   */
  async getVisibleProductNames(): Promise<string[]> {
    await this.waitForProductsToLoad();
    const products = await this.productItems.all();
    const names = [];
    
    for (const product of products) {
      const nameElement = product.locator('[data-testid="product-name"]');
      const name = await nameElement.textContent();
      if (name) names.push(name.trim());
    }
    
    return names;
  }

  /**
   * Verify product data attributes
   */
  async verifyProductData(productName: string, expectedData: any): Promise<void> {
    const product = await this.getProductByName(productName);
    await expect(product).toBeVisible();
    
    if (expectedData.price) {
      const priceElement = product.locator('[data-testid="product-price"]');
      await expect(priceElement).toContainText(expectedData.price.toString());
    }
    
    if (expectedData.currency) {
      const currencyElement = product.locator('[data-testid="product-currency"]');
      await expect(currencyElement).toContainText(expectedData.currency);
    }
    
    if (typeof expectedData.inStock === 'boolean') {
      const stockElement = product.locator('[data-testid="product-stock"]');
      const expectedStockText = expectedData.inStock ? 'In Stock' : 'Out of Stock';
      await expect(stockElement).toContainText(expectedStockText);
    }
  }
}