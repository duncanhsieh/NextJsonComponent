import { test, expect } from '@playwright/test';

test.describe('Demo Todo List', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.getByRole('tab', { name: '待辦清單' }).click();
  });

  test('Initial state displays empty message', async ({ page }) => {
    await expect(page.getByText('尚無待辦事項，點擊新增！')).toBeVisible();
    await expect(page.locator('.todo-count')).toHaveText('0 項');
  });

  test('Adding a single todo', async ({ page }) => {
    await page.getByRole('button', { name: '+ 新增待辦' }).click();
    
    // The empty state should disappear
    await expect(page.getByText('尚無待辦事項，點擊新增！')).not.toBeVisible();
    
    // There should be 1 item
    await expect(page.locator('.todo-count')).toHaveText('1 項');
    await expect(page.locator('.todo-item')).toHaveCount(1);
    
    // The clear all button should appear
    await expect(page.getByRole('button', { name: '清除全部' })).toBeVisible();
  });

  test('Toggling a todo state', async ({ page }) => {
    await page.getByRole('button', { name: '+ 新增待辦' }).click();
    const todoItem = page.locator('.todo-item').first();
    const toggleBtn = todoItem.locator('button[title="切換狀態"]');
    const todoText = todoItem.locator('span.todo-text');

    // Initially not done
    await expect(todoText).not.toHaveClass(/done/);

    // Toggle to done
    await toggleBtn.click();
    await expect(todoText).toHaveClass(/done/);

    // Toggle back
    await toggleBtn.click();
    await expect(todoText).not.toHaveClass(/done/);
  });

  test('Deleting a single todo', async ({ page }) => {
    await page.getByRole('button', { name: '+ 新增待辦' }).click();
    await expect(page.locator('.todo-item')).toHaveCount(1);

    const deleteBtn = page.locator('.todo-item').first().locator('button[title="刪除"]');
    await deleteBtn.click();

    await expect(page.locator('.todo-item')).toHaveCount(0);
    await expect(page.getByText('尚無待辦事項，點擊新增！')).toBeVisible();
  });

  test('Clear all todos works', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: '+ 新增待辦' });
    for (let i = 0; i < 3; i++) await addBtn.click();
    
    await expect(page.locator('.todo-item')).toHaveCount(3);

    await page.getByRole('button', { name: '清除全部' }).click();
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });

  test('Adding 50 todos rapidly (pressure testing)', async ({ page }) => {
    const addBtn = page.getByRole('button', { name: '+ 新增待辦' });
    for (let i = 0; i < 50; i++) {
        await addBtn.click({ force: true });
    }
    
    await expect(page.locator('.todo-item')).toHaveCount(50);
    await expect(page.locator('.todo-count')).toHaveText('50 項');

    // Toggle the 25th item directly
    const item25 = page.locator('.todo-item').nth(24);
    await item25.locator('button[title="切換狀態"]').click();
    await expect(item25.locator('span.todo-text')).toHaveClass(/done/);

    // Clear all
    await page.getByRole('button', { name: '清除全部' }).click();
    await expect(page.locator('.todo-item')).toHaveCount(0);
  });
});
