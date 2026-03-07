import { test, expect } from '@playwright/test';

test.describe('Demo Counter', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    // Ensure we are on the Counter tab (it's the default, but just in case)
    await page.getByRole('tab', { name: '計數器' }).click();
  });

  test('Initial state displays 0', async ({ page }) => {
    const display = page.locator('.counter-display');
    await expect(display).toHaveText('0');
  });

  test('Clicking + increases count', async ({ page }) => {
    const btnPlus = page.locator('button[title="增加"]');
    await btnPlus.click({ force: true });
    await expect(page.locator('.counter-display')).toHaveText('1');
  });

  test('Clicking - decreases count but stops at 0', async ({ page }) => {
    const btnPlus = page.locator('button[title="增加"]');
    const btnMinus = page.locator('button[title="減少"]');
    
    await btnPlus.click({ force: true });
    await btnPlus.click({ force: true }); // Count = 2
    
    await btnMinus.click({ force: true }); // Count = 1
    await expect(page.locator('.counter-display')).toHaveText('1');
    
    await btnMinus.click({ force: true }); // Count = 0
    await btnMinus.click({ force: true }); // Count still 0
    await expect(page.locator('.counter-display')).toHaveText('0');
  });

  test('Rapid clicking 50 times', async ({ page }) => {
    const btnPlus = page.locator('button[title="增加"]');
    for (let i = 0; i < 50; i++) {
        await btnPlus.click({ force: true });
    }
    
    await expect(page.locator('.counter-display')).toHaveText('50');
    // Also $if conditional element should appear
    await expect(page.getByText('🎉 恭喜達到 10！')).toBeVisible();
  });

  test('Rapid toggling +/- causes no race conditions', async ({ page }) => {
    const btnPlus = page.locator('button[title="增加"]');
    const btnMinus = page.locator('button[title="減少"]');
    
    // +10
    for(let i=0; i<10; i++) await btnPlus.click({ force: true });

    // Alternate - and + rapidly
    for(let i=0; i<30; i++) {
        await btnMinus.click({ force: true });
        await btnPlus.click({ force: true });
    }

    // Should still be 10
    await expect(page.locator('.counter-display')).toHaveText('10');
  });

  test('Reset button works', async ({ page }) => {
    const btnPlus = page.locator('button[title="增加"]');
    const btnReset = page.getByRole('button', { name: '重設', exact: true });

    await btnPlus.click();
    await btnPlus.click();
    await expect(page.locator('.counter-display')).toHaveText('2');
    
    await btnReset.click({ force: true });
    await expect(page.locator('.counter-display')).toHaveText('0');
  });
});
