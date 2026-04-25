import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from '../services/cookie.service';

export const GATEKEEPER_COOKIE = 'cms_visitor_registered';

/**
 * Guard que bloquea el acceso al CMS público hasta que el visitante
 * complete el formulario del Gatekeeper (y quede la cookie de primer acceso).
 */
export const gatekeeperGuard: CanActivateFn = () => {
  const cookies = inject(CookieService);
  const router  = inject(Router);

  return cookies.has(GATEKEEPER_COOKIE)
    ? true
    : router.createUrlTree(['/bienvenida']);
};
