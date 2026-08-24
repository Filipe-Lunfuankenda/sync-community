import { test, expect } from '@playwright/test';

const testViewports = [
  { name: 'Desktop (1080p)', width: 1920, height: 1080 },
  { name: 'Tablet (iPad Pro)', width: 1024, height: 1366 },
  { name: 'Mobile (iPhone X)', width: 375, height: 812 },
];

testViewports.forEach((viewport) => {
test.describe(`Sync Community E2E Tests - ${viewport.name}`, () => {
    test.use({ viewport });

    test('should load the app and test core layout responsivity', async ({ page }) => {
      await page.goto('http://localhost');
      
      // Ensure the main layout doesn't horizontally scroll excessively (responsiveness check)
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewport.width); 
    });

    test('should perform exhaustive UI component interaction', async ({ page }) => {
      await page.goto('http://localhost');
      
      // 1. Authentication Check
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      if (await emailInput.isVisible()) {
        await emailInput.fill('admin@comunidade.pt');
        await passwordInput.fill('Sync@Sec!2026');
        await page.click('button[type="submit"]');
        await page.waitForTimeout(2000); // Wait for auth token and redirect
      }

      // 2. Navigation Interaction
      // If it's a smaller screen, we might need to open the hamburger menu first
      if (viewport.width < 1024) {
        const hamburger = page.locator('button[aria-label="menu"], .hamburger, .menu-icon').first();
        if (await hamburger.isVisible()) {
            await hamburger.click();
            await page.waitForTimeout(500);
        }
      }

      // 3. Click Testing (Buttons, Modals, Selects)
      // This section simulates a user clicking on various interactive elements
      
      // Find and click all safe buttons (avoiding destructive actions like 'delete' or 'logout')
      const buttons = page.locator('button:not([type="submit"])');
      const buttonCount = await buttons.count();
      for (let i = 0; i < Math.min(buttonCount, 5); i++) {
        const btn = buttons.nth(i);
        const text = await btn.textContent();
        if (btn && await btn.isVisible() && !text?.toLowerCase().includes('delete') && !text?.toLowerCase().includes('logout')) {
          await btn.click({ force: true });
          await page.waitForTimeout(300); // Wait for modal or state change
          
          // If a modal opened, try to close it
          const closeBtn = page.locator('button[aria-label="close"], .close-modal, .cancel-btn').first();
          if (await closeBtn.isVisible()) {
             await closeBtn.click();
          }
        }
      }

      // Find and interact with Select/Dropdown components
      const selects = page.locator('select');
      if (await selects.count() > 0) {
         // Just interact with the first one found to test the mechanism
         await selects.first().selectOption({ index: 1 });
      }

      // Click on generic links (Navigation)
      const navLinks = page.locator('a');
      const linkCount = await navLinks.count();
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
          if (await navLinks.nth(i).isVisible()) {
              await navLinks.nth(i).click();
              await page.waitForTimeout(500); // Wait for navigation render
          }
      }
    });
  });
});

// Security & Breaking Tests (Form validation & Error handling)
test.describe('Sync Community Security & Validation Tests', () => {
  test('should resist SQL injection attempts in login', async ({ page }) => {
    await page.goto('http://localhost');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    if (await emailInput.isVisible()) {
      await emailInput.fill("' OR '1'='1"); // Classic SQLi payload
      await passwordInput.fill("Sync@Sec!2026");
      await page.click('button[type="submit"]');
      
      // It should NOT redirect to the dashboard, it should show an error
      await page.waitForTimeout(1000);
      const url = page.url();
      expect(url).not.toContain('/dashboard');
    }
  });
});
