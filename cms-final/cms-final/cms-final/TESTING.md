# Pruebas y Despliegue — CMS Obstetricia

Documento operacional para ejecutar las pruebas (unitarias + E2E) y desplegar el proyecto.

---

## Stack

| Tipo | Herramienta | Versión |
|---|---|---|
| Framework | Angular (standalone + signals + control flow nuevo) | 21.2.9 |
| Unit tests | Jasmine + Karma + ChromeHeadless | Jasmine 5.9, Karma 6.4 |
| E2E | Playwright (Chromium) | 1.56.0 |
| Cobertura | karma-coverage (Istanbul) | 2.2 |

---

## Arquitectura del contenido

El CMS maneja dos tipos de contenido:

**Páginas (`Page`)** — composiciones de bloques visuales (hero, cards-grid, cta, text, image) editadas con el *page-builder*.

**Artículos (`Article`)** — publicaciones tipo blog/noticia con título, slug, resumen, autor, fecha, tags y cuerpo HTML. Editables con el **WYSIWYG** (H1-H3, párrafos, subida de imagen). Se muestran:

- En `/` (home) en la sección *"Últimas publicaciones"* (solo los publicados).
- En `/articulo/:slug` (detalle completo).
- En `/admin/articles` (listado del backoffice).

El `ArticlesService` persiste en `localStorage` → los cambios sobreviven a recargas de página. Cuando se conecte el backend real, se reemplaza ese almacenamiento por HTTP.

---

## Pruebas unitarias

### Comandos

```bash
npm test          # modo watch (desarrollo)
npm run test:ci   # una sola corrida con ChromeHeadless + cobertura
```

Reporte de cobertura: `coverage/cms-obstetricia/` (HTML + lcov).

### Specs cubiertos

| Spec | Componente | Tests |
|---|---|---|
| `app.spec.ts` | App raíz | 2 |
| `gatekeeper.component.spec.ts` | Gatekeeper (bloqueo + cookie) | 8 |
| `wysiwyg-editor.component.spec.ts` | WYSIWYG (H1-H3 + párrafos + imágenes + reorden) | 10 |
| `gallery-masonry.component.spec.ts` | Galería (lazy + hover + detalle) | 12 |
| `login.component.spec.ts` | Login admin (validaciones + feedback + redirección) | 12 |

### Resultados

```
TOTAL: 44 SUCCESS

=============================== Coverage summary ===============================
Statements   : 87.34% ( 145/166 )
Branches     : 70.58% ( 24/34 )
Functions    : 81.25% ( 39/48 )
Lines        : 89.11% ( 131/147 )
================================================================================
```

---

## Pruebas E2E (Playwright)

### Instalación de navegadores (solo la primera vez)

```bash
npx playwright install chromium
```

### Comandos

```bash
npm run e2e           # corrida completa (arranca ng serve automáticamente)
npm run e2e:headed    # con ventana visible para depurar
npm run e2e:report    # ver reporte HTML de la última corrida
```

### Flujos cubiertos

| Spec | Flujo |
|---|---|
| `smoke.spec.ts` | La app responde en :4200 y el Gatekeeper se ve |
| `visitor-flow.spec.ts` | Gatekeeper → registro → desbloqueo → navegar CMS → **ver artículo completo** |
| `admin-flow.spec.ts` | Login → **crear artículo → publicar → verificar en frontend público** |

### Resultados

```
Running 3 tests using 1 worker
  ✓  admin-flow   › Login → crear artículo → publicar → verificar (10.9s)
  ✓  smoke        › la app arranca y responde en 4200 (1.9s)
  ✓  visitor-flow › Gatekeeper → registro → desbloqueo → navegar → ver artículo (5.0s)

  3 passed (22.6s)
```

---

## Build de producción

```bash
npm run build
# -> dist/cms-obstetricia/browser/
```

Resultado: **14.15s** de build, sin errores ni warnings. **316 KB raw / 91 KB gzip** iniciales.

---

## Despliegue

### Servir localmente el build (prueba rápida)

```bash
npx serve dist/cms-obstetricia/browser -s -l 8080
```

El flag `-s` activa modo SPA.

### Netlify (recomendada)

Ir a [app.netlify.com/drop](https://app.netlify.com/drop) y arrastrar `dist/cms-obstetricia/browser/` completa.

Para repos conectados, `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist/cms-obstetricia/browser"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Nginx (servidor propio)

```nginx
server {
  listen 80;
  server_name portal.tu-dominio.com;
  root /var/www/cms-obstetricia/browser;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|woff2?|png|jpg|svg|ico)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

### Vercel

`vercel.json`:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist/cms-obstetricia/browser",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|---|---|---|
| Admin | admin@clinica.com | admin123 |
| Editor | editor@clinica.com | editor123 |

---

## Estructura de rutas

### Frontoffice (público)

| Ruta | Componente | Guard |
|---|---|---|
| `/bienvenida` | Gatekeeper | — |
| `/` | Home con artículos | `gatekeeperGuard` |
| `/articulo/:slug` | Detalle de artículo | `gatekeeperGuard` |

### Backoffice (admin)

| Ruta | Componente | Guard |
|---|---|---|
| `/admin/login` | Login | `noAuthGuard` |
| `/admin/dashboard` | Dashboard | `authGuard` |
| `/admin/pages` | Listado de páginas | `authGuard` |
| `/admin/pages/new` | Editor de página | `authGuard` |
| `/admin/pages/:id/edit` | Editor de página | `authGuard` |
| `/admin/pages/:id/builder` | Page builder visual | `authGuard` |
| `/admin/articles` | Listado de artículos | `authGuard` |
| `/admin/articles/new` | Editor de artículo | `authGuard` |
| `/admin/articles/:id/edit` | Editor de artículo | `authGuard` |

---

## Checklist de release

- [x] `npm run test:ci` → 44/44 ✓
- [x] `npx playwright test` → 3/3 ✓
- [x] `npm run build` → sin errores ni warnings
- [x] Cobertura ≥ 80% en statements, lines y functions
- [ ] Reemplazar mocks por backend real
- [ ] Configurar HTTPS en el servidor
- [ ] Configurar CSP y headers de seguridad
- [ ] Configurar monitoreo (Sentry, LogRocket, etc.)
