import { test, expect } from '@playwright/test';

test.describe('Demo Headless UI', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/demo');
    await page.getByRole('tab', { name: 'Headless UI' }).click();
  });

  test('Menu Dropdown interactions', async ({ page }) => {
    const menuBtn = page.getByRole('button', { name: 'Options ▾' });
    
    // Initial state: not expanded
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    
    // Open menu
    await menuBtn.click();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    
    // Items should be visible
    const menuItems = page.getByRole('menu');
    await expect(menuItems).toBeVisible();
    await expect(page.getByRole('menuitem', { name: 'Account settings' })).toBeVisible();

    // Close menu by clicking outside (Playwright keyboard Esc or clicking body)
    await page.keyboard.press('Escape');
    await expect(menuItems).not.toBeVisible();
  });

  test('Disclosure (Accordion) interactions', async ({ page }) => {
    const disclosureBtn = page.getByRole('button', { name: 'What is your refund policy? ▾' });
    
    await expect(disclosureBtn).toHaveAttribute('aria-expanded', 'false');
    
    // Open
    await disclosureBtn.click();
    await expect(disclosureBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByText("If you're unhappy with your purchase")).toBeVisible();
    
    // Close
    await disclosureBtn.click();
    await expect(page.getByText("If you're unhappy with your purchase")).not.toBeVisible();
  });

  test('Dialog (Modal) interactions', async ({ page }) => {
    // Cannot easily target by exact name if there are multiple similar buttons, but text is "Open Dialog"
    const openBtn = page.getByRole('button', { name: 'Open Dialog' });
    await openBtn.click();

    // Dialog should be open
    const dialog = page.getByRole('dialog', { name: 'Payment successful' });
    await expect(page.getByText("Your payment has been successfully submitted.")).toBeVisible();

    // Close by Got It button
    const closeBtn = dialog.getByRole('button', { name: 'Got it, thanks!' });
    await closeBtn.click();
    await expect(dialog).not.toBeVisible();
  });

  test('Popover interactions', async ({ page }) => {
    const popoverBtn = page.getByRole('button', { name: 'Solutions ▾' });
    
    await expect(popoverBtn).toHaveAttribute('aria-expanded', 'false');

    // Open
    await popoverBtn.click();
    await expect(popoverBtn).toHaveAttribute('aria-expanded', 'true');
    
    // Panel content should appear
    await expect(page.getByText('Analytics')).toBeVisible();

    // Close by Esc
    await page.keyboard.press('Escape');
    await expect(page.getByText('Analytics')).not.toBeVisible();
  });

  test('Listbox interactions', async ({ page }) => {
    const listboxBtn = page.getByRole('button', { name: 'Durward Reynolds ▾' });
    
    // Open Listbox
    await listboxBtn.click();
    
    // Options visible
    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    
    // Select the second option
    const option = page.getByRole('option', { name: 'Kenton Towne' });
    await option.click();
    
    // Should update state/UI correctly
    await expect(page.getByRole('button', { name: 'Kenton Towne ▾' })).toBeVisible();
  });

  test('Switch interactions', async ({ page }) => {
    const uiSwitch = page.getByRole('switch');
    
    // Initially false/disabled
    await expect(uiSwitch).toHaveAttribute('aria-checked', 'false');
    await expect(page.getByText('Disabled')).toBeVisible();

    // Trigger state change
    await uiSwitch.click();
    await expect(uiSwitch).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByText('Enabled')).toBeVisible();
  });

  test('RadioGroup interactions', async ({ page }) => {
    // Initial checked is Startup
    const startupGroup = page.getByRole('radio', { name: 'Startup Plan' });
    const businessGroup = page.getByRole('radio', { name: 'Business Plan' });

    await expect(startupGroup).toHaveAttribute('aria-checked', 'true');
    await expect(businessGroup).toHaveAttribute('aria-checked', 'false');

    // Click another plan
    await businessGroup.click();

    // UI state reflects selection
    await expect(startupGroup).toHaveAttribute('aria-checked', 'false');
    await expect(businessGroup).toHaveAttribute('aria-checked', 'true');
  });

  test('Combobox interactions', async ({ page }) => {
    const comboboxInput = page.getByRole('combobox');
    
    // Type into input
    await comboboxInput.fill('Wade');

    // It should open the autocomplete dropdown matching everything (since we didn't implement backend filtering in Demo just basic bindings)
    const option = page.getByRole('option', { name: 'Wade Cooper' });
    await expect(option).toBeVisible();
    
    // Select option
    await option.click();
    
    // State should reflect exact selected value
    await expect(comboboxInput).toHaveValue('Wade Cooper');
  });
});
