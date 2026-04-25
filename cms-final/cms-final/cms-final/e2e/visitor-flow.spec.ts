import { test, expect } from '@playwright/test';

test.describe('E2E: flujo visitante completo', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    await page.goto('/bienvenida');
    await page.evaluate(() => localStorage.clear());
  });

  test('Gatekeeper → registro → desbloqueo → navegar CMS → ver artículo', async ({ page }) => {
    // 1. El guard redirige a /bienvenida
    await page.goto('/');
    await expect(page).toHaveURL(/\/bienvenida$/);
    await expect(page.getByTestId('gatekeeper-form')).toBeVisible();

    // 2. Submit vacío: no desbloquea, aparecen errores
    await page.getByTestId('gk-submit').click();
    await expect(page).toHaveURL(/\/bienvenida$/);
    await expect(page.getByTestId('gk-name-error')).toBeVisible();

    // 3. Registro válido
    await page.getByTestId('gk-name').fill('María Visitante');
    await page.getByTestId('gk-email').fill('maria@test.com');
    await page.getByTestId('gk-accept').check();
    await page.getByTestId('gk-submit').click();

    // 4. Desbloqueo: aterriza en el home
    await expect(page).toHaveURL('http://localhost:4200/');

    // 5. Hero + servicios + sección de artículos visibles
    await expect(page.locator('.hero-block__title')).toContainText('Clínica de Obstetricia');
    await expect(page.locator('.cards-grid-block__title')).toContainText('Nuestros servicios');
    await expect(page.getByTestId('articles-section')).toBeVisible();

    // 6. Hay al menos un artículo publicado en la lista
    const cards = page.locator('[data-testid^="article-card-"]');
    await expect(cards.first()).toBeVisible();
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(1);

    // 7. Navegar al detalle del primer artículo (slug conocido de los seeds)
    await page.getByTestId('article-link-control-prenatal-todo-lo-que-debes-saber').click();

    // 8. Página de detalle cargada correctamente
    await expect(page).toHaveURL(/\/articulo\/control-prenatal-todo-lo-que-debes-saber$/);
    await expect(page.getByTestId('article-detail')).toBeVisible();
    await expect(page.getByTestId('article-title')).toContainText('Control prenatal');
    await expect(page.getByTestId('article-author')).toContainText('Dra. María Elena Rivera');
    await expect(page.getByTestId('article-body')).toBeVisible();

    // 9. Al recargar, cookie persiste (no vuelve al Gatekeeper)
    await page.reload();
    await expect(page).toHaveURL(/\/articulo\/control-prenatal-todo-lo-que-debes-saber$/);
    await expect(page.getByTestId('article-title')).toBeVisible();
  });
});
