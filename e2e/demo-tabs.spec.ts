import { test, expect } from '@playwright/test';

test.describe('Demo Tabs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
  });

  test('Displays the first tab as active by default', async ({ page }) => {
    const defaultTab = page.getByRole('tab', { selected: true });
    await expect(defaultTab).toBeVisible();
    await expect(defaultTab).toHaveText(/計數器/);
    await expect(page.getByRole('tabpanel')).toContainText('對應的 JSON AST 片段');
  });

  test('Switches correctly to other tabs', async ({ page }) => {
    await page.getByRole('tab', { name: '待辦清單' }).click();
    await expect(page.getByRole('tab', { name: '待辦清單' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('+ 新增待辦');

    await page.getByRole('tab', { name: 'RSC 渲染' }).click();
    await expect(page.getByRole('tabpanel')).toContainText('伺服器端渲染 (RSC) + Server Actions');
  });

  test('Rapid toggling between tabs leaves no residual state', async ({ page }) => {
    for (let i = 0; i < 10; i++) {
        await page.getByRole('tab', { name: '計數器' }).click();
        await page.getByRole('tab', { name: 'RSC 渲染' }).click();
    }
    
    // Final active tab is RSC
    await expect(page.getByRole('tab', { name: 'RSC 渲染' })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('tabpanel')).toContainText('伺服器端渲染 (RSC) + Server Actions');
    await expect(page.getByRole('tabpanel')).not.toContainText('對應的 JSON AST 片段');
  });
});
