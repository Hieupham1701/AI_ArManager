import { expect, test } from '@playwright/test';

test('invoice quick view full view navigates to strategy page', async ({ page }) => {
  await page.setViewportSize({ width: 1218, height: 620 });
  await page.goto('/invoices', { waitUntil: 'domcontentloaded' });

  // Wait for the page to hydrate and the target row action to be visible
  const openQuickView = page.getByRole('button', { name: 'Open quick view for Vertex Analytics' });
  await openQuickView.waitFor({ state: 'visible' });

  // Click the row action for Vertex Analytics to open the quick view panel
  await openQuickView.click();

  // Wait for the quick view panel to render
  const quickView = page.getByRole('complementary', { name: 'Invoice quick view' });
  await expect(quickView.getByText('Collection Progress')).toBeVisible({ timeout: 10000 });
  await expect(quickView.getByRole('link', { name: 'Full View' })).toBeVisible();
  await expect(quickView.getByRole('link', { name: 'Full View' })).toHaveAttribute(
    'href',
    '/invoices/INV-2024-0889/strategy',
  );

  await page.screenshot({ path: 'screenshots/invoices-quick-view.png', fullPage: true });

  await quickView.getByRole('link', { name: 'Full View' }).click();
  await expect(page).toHaveURL('/invoices/INV-2024-0889/strategy');
  await expect(page.getByText('Strategy Orchestration Timeline')).toBeVisible();
  await expect(page.getByText('Invoice Details')).toBeVisible();
  await expect(page.getByText('Primary Contact')).toBeVisible();
  await expect(page.getByText('Communication History')).toBeVisible();
  await expect(page.getByText('Next Scheduled Action')).toBeVisible();
  await expect(page.getByText('AI Reminder Preview')).toBeVisible();

  await page.screenshot({ path: 'screenshots/strategy-page-desktop.png', fullPage: true });
});

test('strategy page renders on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 900 });
  await page.goto('/invoices/INV-2024-0889/strategy', { waitUntil: 'domcontentloaded' });
  await expect(page.getByText('Vertex Analytics', { exact: true })).toBeVisible();
  await expect(page.getByText('AI Reminder Preview')).toBeVisible();
  await page.screenshot({ path: 'screenshots/strategy-page-mobile.png', fullPage: true });
});
