import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Example.com Page Object
 * Specific implementation for https://example.com
 */
export class HomePage extends BasePage {
  // Specific locators for example.com
  private readonly mainHeading: Locator;
  private readonly paragraph: Locator;
  private readonly moreInfoLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Example.com specific locators
    this.mainHeading = page.locator('h1');
    this.paragraph = page.locator('div p');
    this.moreInfoLink = page.locator('a[href*="iana.org"]');
  }

  /**
   * Open example.com website
   */
  async open(): Promise<void> {
    await this.goto('https://example.com');
    await this.waitForPageLoad();
  }

  /**
   * Get the main heading text
   */
  async getMainHeading(): Promise<string> {
    return await this.mainHeading.textContent() || '';
  }

  /**
   * Get the description paragraph
   */
  async getDescription(): Promise<string> {
    return await this.paragraph.textContent() || '';
  }

  /**
   * Click on "More information" link
   */
  async clickMoreInfo(): Promise<void> {
    await this.moreInfoLink.click();
  }

  /**
   * Check if all main elements are visible
   */
  async areMainElementsVisible(): Promise<boolean> {
    const isHeadingVisible = await this.mainHeading.isVisible();
    const isParagraphVisible = await this.paragraph.isVisible();
    const isLinkVisible = await this.moreInfoLink.isVisible();
    
    return isHeadingVisible && isParagraphVisible && isLinkVisible;
  }
}