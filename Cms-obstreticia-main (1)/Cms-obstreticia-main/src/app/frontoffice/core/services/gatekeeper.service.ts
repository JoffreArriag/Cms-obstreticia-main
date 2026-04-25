import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { GatekeeperForm, GatekeeperResponse } from '../models/gatekeeper.model';

const TOKEN_KEY = 'ug_wiki_token';
const VISITOR_KEY = 'ug_wiki_visitor';
const TOKEN_EXPIRY = 'ug_wiki_token_expiry';

@Injectable({ providedIn: 'root' })
export class GatekeeperService {
  hasValidToken(): boolean {
    const token = localStorage.getItem(TOKEN_KEY);
    const expiry = localStorage.getItem(TOKEN_EXPIRY);
    if (!token || !expiry) return false;
    return Date.now() < Number(expiry);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  getVisitor(): GatekeeperResponse['visitor'] | null {
    const raw = localStorage.getItem(VISITOR_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  register(form: GatekeeperForm): Observable<GatekeeperResponse> {
    const mockResponse: GatekeeperResponse = {
      token: this.generateFakeToken(),
      expiresIn: 86400,
      visitor: {
        id: crypto.randomUUID(),
        nombres: form.nombres,
        apellidos: form.apellidos,
        correo: form.correo,
        facultad: form.facultad,
      },
    };

    this.saveToken(mockResponse);

    return of(mockResponse).pipe(delay(800));
  }

  private saveToken(res: GatekeeperResponse): void {
    const expiry = Date.now() + res.expiresIn * 1000;
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(TOKEN_EXPIRY, String(expiry));
    localStorage.setItem(VISITOR_KEY, JSON.stringify(res.visitor));
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRY);
    localStorage.removeItem(VISITOR_KEY);
  }

  private generateFakeToken(): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ sub: crypto.randomUUID(), iat: Date.now() }));
    const sig = btoa(Math.random().toString(36).slice(2));
    return `${header}.${payload}.${sig}`;
  }
}
