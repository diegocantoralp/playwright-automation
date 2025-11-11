import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * Example.com Page Object
 * Specific implementation for https://example.com
 */
export class HomePage extends BasePage {
  // Specific locators for example.com
  private readonly mainHeading: Locator;
  private readonly mainParagraph: Locator; // Más específico
  private readonly secondaryParagraph: Locator; // Para el segundo párrafo
  private readonly moreInfoLink: Locator;

  constructor(page: Page) {
    super(page);
    
    // Example.com specific locators - más precisos
    this.mainHeading = page.locator('h1');
    this.mainParagraph = page.locator('div p').first(); // Solo el primer párrafo
    this.secondaryParagraph = page.locator('div p').nth(1); // Segundo párrafo
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
   * Get the main description paragraph (first paragraph)
   */
  async getDescription(): Promise<string> {
    return await this.mainParagraph.textContent() || '';
  }

  /**
   * Get the secondary paragraph text
   */
  async getSecondaryText(): Promise<string> {
    return await this.secondaryParagraph.textContent() || '';
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
    try {
      const isHeadingVisible = await this.mainHeading.isVisible();
      const isParagraphVisible = await this.mainParagraph.isVisible();
      const isLinkVisible = await this.moreInfoLink.isVisible();
      
      return isHeadingVisible && isParagraphVisible && isLinkVisible;
    } catch (error) {
      console.log('Error checking element visibility:', error);
      return false;
    }
  }

  /**
   * Check if specific content is present
   */
  async hasExpectedContent(): Promise<boolean> {
    try {
      const heading = await this.getMainHeading();
      const description = await this.getDescription();
      
      return heading.includes('Example Domain') && 
             description.includes('This domain is for use in illustrative examples');
    } catch (error) {
      console.log('Error checking content:', error);
      return false;
    }
  }

  /**
   * Get all paragraphs text (for debugging)
   */
  async getAllParagraphs(): Promise<string[]> {
    const paragraphs = await this.page.locator('div p').all();
    const texts = [];
    for (const p of paragraphs) {
      const text = await p.textContent();
      if (text) texts.push(text.trim());
    }
    return texts;
  }
}