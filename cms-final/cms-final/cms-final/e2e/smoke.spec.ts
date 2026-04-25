import { test, expect } from '@playwright/test';

test.describe('Smoke test', () => {
  test('la app arranca y responde en 4200', async ({ page }) => {
    const response = await page.goto('/bienvenida');
    expect(response?.ok()).toBeTruthy();
    await expect(page.getByTestId('gatekeeper-form')).toBeVisible();
  });
});
