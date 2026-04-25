import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración E2E del CMS Obstetricia.
 *
 * Usa el dev-server de Angular (ng serve) en localhost:4200.
 *
 * Sobre el navegador:
 *  - Por defecto Playwright usa su propio Chromium descargado con:
 *      npx playwright install chromium
 *  - Si trabajas en un entorno donde no puedes descargar ese binario,
 *    puedes exportar PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH apuntando a
 *    cualquier Chrome/Chromium del sistema y esta config lo usará.
 */
const customChromiumPath = process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH;

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],

  use: {
    baseURL: 'http://localhost:4200',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
    headless: true
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(customChromiumPath
          ? {
              launchOptions: {
                executablePath: customChromiumPath,
                args: ['--no-sandbox', '--disable-dev-shm-usage']
              }
            }
          : {})
      }
    }
  ],

  webServer: {
    command: 'npx ng serve --port 4200 --host 0.0.0.0',
    url: 'http://localhost:4200',
    reuseExistingServer: true,
    timeout: 180_000
  }
});
