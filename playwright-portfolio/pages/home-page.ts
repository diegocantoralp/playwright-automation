import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base-page';

/**
 * HomePage - Page Object Model
 * Handles all interactions with the home page
 */
export class HomePage extends BasePage {
  // Page elements
  private readonly mainHeading: Locator;
  private readonly mainParagraph: Locator;
  private readonly secondaryParagraph: Locator;
  private readonly moreInfoLink: Locator;
  private readonly pageBody: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.mainHeading = page.locator('h1');
    this.mainParagraph = page.locator('div p').first();
    this.secondaryParagraph = page.locator('div p').nth(1);
    this.moreInfoLink = page.locator('a[href*="iana.org"]');
    this.pageBody = page.locator('body');
  }

  /**
   * Navigate to home page
   */
  async navigateToHome(): Promise<void> {
    await this.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Open specific URL (default: example.com)
   */
  async open(url: string = 'https://example.com'): Promise<void> {
    await this.goto(url);
    await this.waitForPageLoad();
  }

  /**
   * Get main heading text
   */
  async getMainHeading(): Promise<string> {
    await this.mainHeading.waitFor({ state: 'visible' });
    return await this.mainHeading.textContent() || '';
  }

  /**
   * Get main paragraph description
   */
  async getDescription(): Promise<string> {
    await this.mainParagraph.waitFor({ state: 'visible' });
    return await this.mainParagraph.textContent() || '';
  }

  /**
   * Get secondary paragraph text
   */
  async getSecondaryText(): Promise<string> {
    try {
      await this.secondaryParagraph.waitFor({ state: 'visible', timeout: 5000 });
      return await this.secondaryParagraph.textContent() || '';
    } catch {
      return '';
    }
  }

  /**
   * Click more information link
   */
  async clickMoreInfo(): Promise<void> {
    await this.moreInfoLink.click();
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Verify page structure is correct
   */
  async verifyPageStructure(): Promise<void> {
    await expect(this.mainHeading).toBeVisible();
    await expect(this.mainParagraph).toBeVisible();
    await expect(this.moreInfoLink).toBeVisible();
  }

  /**
   * Verify page content matches expected
   */
  async verifyExpectedContent(): Promise<void> {
    const heading = await this.getMainHeading();
    const description = await this.getDescription();
    
    await expect(this.page).toHaveTitle(/Example Domain/i);
    expect(heading).toBe('Example Domain');
    expect(description).toContain('This domain is for use in documentation examples');
  }

  /**
   * Check if all main elements are visible
   */
  async areMainElementsVisible(): Promise<boolean> {
    try {
      const elements = [this.mainHeading, this.mainParagraph, this.moreInfoLink];
      
      for (const element of elements) {
        const isVisible = await element.isVisible();
        if (!isVisible) return false;
      }
      
      return true;
    } catch (error) {
      console.log('Error checking element visibility:', error);
      return false;
    }
  }

  /**
   * Get all paragraphs for debugging
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

  /**
   * Verify page is responsive (mobile/tablet)
   */
  async verifyResponsiveDesign(): Promise<void> {
    // Test mobile viewport
    await this.page.setViewportSize({ width: 375, height: 667 });
    await expect(this.mainHeading).toBeVisible();
    
    // Test tablet viewport
    await this.page.setViewportSize({ width: 768, height: 1024 });
    await expect(this.mainHeading).toBeVisible();
    
    // Reset to desktop
    await this.page.setViewportSize({ width: 1280, height: 720 });
  }
}