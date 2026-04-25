import { test, expect } from '@playwright/test';
import { setGatekeeperCookie } from './helpers';

test.describe('E2E: flujo administrador completo', () => {
  test.beforeEach(async ({ context, page }) => {
    await context.clearCookies();
    // Sembramos la cookie del Gatekeeper para poder validar luego el frontend público
    await setGatekeeperCookie(context);
    // Limpiamos localStorage para arrancar con los artículos seed
    await page.goto('/bienvenida');
    await page.evaluate(() => localStorage.clear());
  });

  test('Login → crear artículo → publicar → verificar en frontend', async ({ page }) => {
    // 1. Login
    await page.goto('/admin/login');
    await expect(page.locator('.form-panel__title')).toContainText('Acceder al Sistema');

    // 2. Submit vacío: validaciones visibles
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/login$/);
    await expect(page.locator('.form-error').first()).toBeVisible();

    // 3. Credenciales inválidas
    await page.locator('#email').fill('nope@clinica.com');
    await page.locator('#password').fill('wrongpwd');
    await page.locator('button[type="submit"]').click();
    await expect(page.locator('.alert--error')).toBeVisible({ timeout: 3000 });

    // 4. Credenciales válidas
    await page.locator('#email').fill('');
    await page.locator('#password').fill('');
    await page.locator('#email').fill('admin@clinica.com');
    await page.locator('#password').fill('admin123');
    await page.locator('button[type="submit"]').click();
    await expect(page).toHaveURL(/\/admin\/dashboard$/, { timeout: 5000 });

    // 5. Ir al listado de Artículos
    await page.locator('a.sidebar__link', { hasText: 'Artículos' }).click();
    await expect(page).toHaveURL(/\/admin\/articles$/);
    await expect(page.getByTestId('articles-table')).toBeVisible();

    // 6. Crear nuevo artículo
    await page.getByTestId('btn-new-article').click();
    await expect(page).toHaveURL(/\/admin\/articles\/new$/);

    const uniqueTitle = `Artículo E2E ${Date.now()}`;
    await page.getByTestId('article-title-input').fill(uniqueTitle);
    // Slug autogenerado a partir del título
    await expect(page.getByTestId('article-slug-input')).not.toHaveValue('');

    await page.getByTestId('article-summary-input').fill(
      'Este artículo fue creado automáticamente por el test E2E para validar el flujo completo admin → frontend.'
    );
    await page.getByTestId('article-author-input').fill('Equipo QA');
    await page.getByTestId('article-tags-input').fill('qa, automatizado');

    // Añadir contenido en el WYSIWYG: un H2 y un párrafo
    await page.getByTestId('add-h2').click();
    await page.getByTestId('add-paragraph').click();

    // 7. Publicar (seleccionar published)
    await page.getByTestId('article-status-select').selectOption('published');

    // 8. Guardar
    await page.getByTestId('btn-save-article').click();
    // Tras guardar pasa a modo edit (URL cambia)
    await expect(page).toHaveURL(/\/admin\/articles\/.+\/edit$/, { timeout: 8000 });

    // 9. Volver al listado y confirmar que aparece publicado
    await page.getByTestId('btn-cancel').click();
    await expect(page).toHaveURL(/\/admin\/articles$/);
    const row = page.locator('tr.table__row', { hasText: uniqueTitle }).first();
    await expect(row).toBeVisible({ timeout: 5000 });
    await expect(row.locator('.badge--published')).toBeVisible();

    // Capturamos el slug desde la celda de la tabla
    const slugText = await row.locator('.slug-chip').textContent();
    expect(slugText).toBeTruthy();
    const slug = (slugText || '').trim();

    // 10. Verificar en frontend público
    await page.goto('/');
    await expect(page).toHaveURL('http://localhost:4200/');
    await expect(page.getByTestId('articles-section')).toBeVisible();

    // El artículo recién creado debe aparecer en la grilla
    const publicCard = page.getByTestId(`article-card-${slug}`);
    await expect(publicCard).toBeVisible({ timeout: 5000 });
    await expect(publicCard).toContainText(uniqueTitle);

    // 11. Clic en "Leer más" → detalle completo
    await page.getByTestId(`article-link-${slug}`).click();
    await expect(page).toHaveURL(new RegExp(`/articulo/${slug}$`));
    await expect(page.getByTestId('article-title')).toContainText(uniqueTitle);
    await expect(page.getByTestId('article-author')).toContainText('Equipo QA');
  });
});
