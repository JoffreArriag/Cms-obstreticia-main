import { BrowserContext, Page } from '@playwright/test';

export const GATEKEEPER_COOKIE_NAME = 'cms_visitor_registered';

/**
 * Siembra la cookie del Gatekeeper para saltarse la pantalla de bienvenida
 * en los tests que no la están probando explícitamente.
 */
export async function setGatekeeperCookie(context: BrowserContext): Promise<void> {
  await context.addCookies([
    {
      name: GATEKEEPER_COOKIE_NAME,
      value: encodeURIComponent(JSON.stringify({
        fullName: 'E2E Tester',
        email: 'e2e@test.com',
        at: new Date().toISOString()
      })),
      url: 'http://localhost:4200'
    }
  ]);
}

/**
 * Abre el login y autentica como administrador.
 */
export async function loginAsAdmin(page: Page): Promise<void> {
  await page.goto('/admin/login');
  await page.locator('#email').fill('admin@clinica.com');
  await page.locator('#password').fill('admin123');
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(/\/admin\/dashboard$/, { timeout: 5000 });
}
