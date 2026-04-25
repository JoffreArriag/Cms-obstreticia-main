import { Injectable } from '@angular/core';

/**
 * CookieService
 * Servicio ligero para manejar cookies del navegador.
 * Usado por el Gatekeeper para recordar el primer acceso del visitante.
 */
@Injectable({ providedIn: 'root' })
export class CookieService {
  /** Devuelve el valor de la cookie o null si no existe. */
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;
    const target = `${name}=`;
    const parts = document.cookie.split(';');
    for (const raw of parts) {
      const c = raw.trim();
      if (c.startsWith(target)) {
        return decodeURIComponent(c.substring(target.length));
      }
    }
    return null;
  }

  /** Crea / actualiza una cookie con duración en días (por defecto 365). */
  set(name: string, value: string, days = 365): void {
    if (typeof document === 'undefined') return;
    const expires = new Date();
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
    document.cookie =
      `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/; SameSite=Lax`;
  }

  /** Elimina la cookie (útil para tests y para reiniciar el Gatekeeper). */
  remove(name: string): void {
    if (typeof document === 'undefined') return;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  }

  /** Comprueba si existe una cookie. */
  has(name: string): boolean {
    return this.get(name) !== null;
  }
}
