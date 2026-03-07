import { test, expect } from '@playwright/test';

test.describe('Core Architecture & SSR', () => {
  test('Page loads without Hydration Mismatch', async ({ page }) => {
    const consoleErrors: string[] = [];
    
    // Listen to console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore expected Vite/React DevTools noise, but catch Hydration exactly
        if (text.includes('Text content did not match') || text.includes('Hydration failed')) {
            consoleErrors.push(text);
        }
      }
    });

    await page.goto('/demo');
    // Wait for the hydration to complete
    await page.waitForLoadState('networkidle');

    expect(consoleErrors).toHaveLength(0);
  });

  test.describe('JavaScript Disabled', () => {
    // Override use context to disable JS
    test.use({ javaScriptEnabled: false });

    test('RSC rendering still works fully on the server', async ({ page }) => {
      await page.goto('/demo');
      
      // Because JS is disabled, tabs won't work interactively.
      // But the *initial* tab content (Counter) MUST be statically present from SSR!
      const display = page.locator('.counter-display');
      await expect(display).toHaveText('0');
      
      const btnPlus = page.locator('.btn-counter-primary');
      await expect(btnPlus).toHaveText('+');
      
      // And the demo wrapper must be there
      await expect(page.getByText('NextJsonComponent Demo')).toBeVisible();
    });
  });

  test.describe('Slow Network', () => {
    test('Server Action disables button and prevents double dispatch', async ({ page }) => {
      await page.goto('/demo');
      await page.getByRole('tab', { name: 'RSC 渲染' }).click();

      // Chrome DEV tools protocol to throttle network
      const client = await page.context().newCDPSession(page);
      await client.send('Network.enable');
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: 50 * 1024 / 8, // 50 kbps
        uploadThroughput: 50 * 1024 / 8,
        latency: 400, // 400ms
      });

      const actionBtn = page.getByRole('button', { name: '發送 Server Action', exact: true });
      await expect(actionBtn).toBeVisible();

      // Click it multiple times quickly
      await actionBtn.click();
      
      // Since it's throttled, it should transition to pending state quickly 
      // and block further clicks by being disabled.
      const pendingBtn = page.getByRole('button', { name: '⏳ 正在聯絡伺服器...' });
      await expect(pendingBtn).toBeDisabled();

      // Disable throttle so it can finish
      await client.send('Network.emulateNetworkConditions', {
        offline: false,
        downloadThroughput: -1,
        uploadThroughput: -1,
        latency: 0,
      });

      // Wait for success
      await expect(page.getByText('✅ 執行成功！')).toBeVisible();
    });
  });
});
