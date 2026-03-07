import { test, expect } from '@playwright/test';

test.describe('Demo Converter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.getByRole('tab', { name: '轉換器' }).click(); // The icon + label gives "🔄 JSX ↔ JSON 轉換器"
  });

  test('JSX to JSON conversion works with valid input', async ({ page }) => {
    const inputArea = page.locator('.converter-textarea');
    await inputArea.clear();
    await inputArea.fill('<button className="btn" onClick={() => submit()}>Hello</button>');

    // Output area updates automatically or via button? 
    // From DemoConverter.tsx, it's usually automatic real-time conversion or on click of arrow button.
    const arrowBtn = page.locator('.converter-arrow-btn');
    if (await arrowBtn.isVisible()) {
        await arrowBtn.click();
    }

    const output = page.locator('.converter-output');
    await expect(output).toContainText('"type": "button"');
    await expect(output).toContainText('"className": "btn"');
    await expect(output).not.toHaveClass(/converter-error/);
  });

  test('Invalid JSX throws error gracefully', async ({ page }) => {
    const inputArea = page.locator('.converter-textarea');
    await inputArea.clear();
    await inputArea.fill('<button class');

    const arrowBtn = page.locator('.converter-arrow-btn');
    if (await arrowBtn.isVisible()) {
        await arrowBtn.click();
    }

    const output = page.locator('.converter-output');
    // It should have the error class and some error text
    await expect(output).toHaveClass(/converter-error/);
    await expect(output).toContainText(/Error|Unexpected/i);
  });

  test('Empty input handles gracefully', async ({ page }) => {
    const inputArea = page.locator('.converter-textarea');
    await inputArea.clear();
    
    const arrowBtn = page.locator('.converter-arrow-btn');
    if (await arrowBtn.isVisible()) {
        await arrowBtn.click();
    }
    
    const output = page.locator('.converter-output');
    await expect(output).toHaveClass(/converter-error/);
    await expect(output).toContainText(/Missing `input` field/);
  });

  test('Template strings in JSX are preserved', async ({ page }) => {
    const inputArea = page.locator('.converter-textarea');
    await inputArea.clear();
    await inputArea.fill('<div id={`user-${id}`}>Hello</div>');

    const arrowBtn = page.locator('.converter-arrow-btn');
    if (await arrowBtn.isVisible()) {
        await arrowBtn.click();
    }

    const output = page.locator('.converter-output');
    await expect(output).toContainText('{{');
  });
});
