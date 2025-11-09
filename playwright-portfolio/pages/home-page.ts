import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Example Home Page Object
 * Demonstrates how to implement POM pattern
 */
export class HomePage extends BasePage {
  // Locators
  private readonly header: Locator;
  private readonly navigationMenu: Locator;
  private readonly searchBox: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.header = page.locator('header');
    this.navigationMenu = page.locator('nav[role="navigation"]');
    this.searchBox = page.locator('input[type="search"]');
    this.loginButton = page.locator('button:has-text("Login")');
  }

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Search for a term
   */
  async search(term: string): Promise<void> {
    await this.searchBox.fill(term);
    await this.searchBox.press('Enter');
  }

  /**
   * Click login button
   */
  async clickLogin(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Check if header is visible
   */
  async isHeaderVisible(): Promise<boolean> {
    return await this.header.isVisible();
  }

  /**
   * Get navigation menu items
   */
  async getNavigationItems(): Promise<string[]> {
    const items = await this.navigationMenu.locator('a').allTextContents();
    return items;
  }
}