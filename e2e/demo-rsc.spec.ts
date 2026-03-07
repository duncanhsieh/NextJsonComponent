import { test, expect } from '@playwright/test';

test.describe('Demo RSC & Server Actions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.getByRole('tab', { name: 'RSC 渲染' }).click();
  });

  test('Displays properly initially', async ({ page }) => {
    // Should have the primary button
    const actionBtn = page.getByRole('button', { name: '發送 Server Action' });
    await expect(actionBtn).toBeVisible();

    // Success response block should not be visible initially
    await expect(page.getByText('✅ 執行成功！')).not.toBeVisible();
  });

  test('Submitting server action successfully changes state', async ({ page }) => {
    const actionBtn = page.getByRole('button', { name: '發送 Server Action' });
    
    // Trigger action
    await actionBtn.click();
    
    // It should immediately enter pending state
    await expect(page.getByRole('button', { name: '⏳ 正在聯絡伺服器...' })).toBeVisible();
    await expect(page.getByRole('button', { name: '⏳ 正在聯絡伺服器...' })).toBeDisabled();

    // After a delay, the mock action finishes. The pending text reverts, and the result block shows up.
    await expect(actionBtn).toBeVisible(); // original text returns
    await expect(actionBtn).toBeEnabled();

    // Success block
    await expect(page.getByText('✅ 執行成功！')).toBeVisible();
    await expect(page.getByText(/最後更新/)).toBeVisible();
  });

  test('Button behaves safely while pending', async ({ page }) => {
    const actionBtn = page.getByRole('button', { name: '發送 Server Action' });
    await actionBtn.click();

    // Try to rapidly click while pending — Playwright will actually wait for it to be actionable,
    // but we can use force if we want to bypass actionability checks, or we can just verify the disabled property.
    const pendingBtn = page.getByRole('button', { name: '⏳ 正在聯絡伺服器...' });
    
    // It should be disabled with pointer-events block or disabled attribute.
    await expect(pendingBtn).toBeDisabled();
    
    // Wait for resolution
    await expect(page.getByText('✅ 執行成功！')).toBeVisible();
  });
});
