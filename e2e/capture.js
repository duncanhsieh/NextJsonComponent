const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 1800 } });
  await page.goto('http://localhost:3000/demo');
  await page.waitForLoadState('networkidle');
  await page.getByRole('tab', { name: 'Headless UI' }).click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'artifacts/headless_ui_demo.png', fullPage: true });
  await browser.close();
})();
