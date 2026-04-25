import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthResponse, LoginCredentials, User } from '../models/user.model';

// ─── Usuarios mock ──────────────────────────────────────────────
const MOCK_USERS: Array<{ email: string; password: string; user: User; token: string }> = [
  {
    email: 'admin@clinica.com',
    password: 'admin123',
    token: 'mock-token-admin',
    user: { id: 1, name: 'Administrador', email: 'admin@clinica.com', role: 'admin' }
  },
  {
    email: 'editor@clinica.com',
    password: 'editor123',
    token: 'mock-token-editor',
    user: { id: 2, name: 'Editor CMS', email: 'editor@clinica.com', role: 'editor' }
  }
];
// ────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);

  private _token       = signal<string | null>(localStorage.getItem('cms_token'));
  private _currentUser = signal<User | null>(this._loadUserFromStorage());

  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly currentUser     = this._currentUser.asReadonly();

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const match = MOCK_USERS.find(
      u => u.email === credentials.email && u.password === credentials.password
    );

    const response$: Observable<AuthResponse> = match
      ? of({ token: match.token, user: match.user })
      : throwError(() => ({ error: { message: 'Correo o contraseña incorrectos.' } }));

    return response$.pipe(
      delay(800), // simula latencia de red
      tap(({ token, user }) => {
        this._token.set(token);
        this._currentUser.set(user);
        localStorage.setItem('cms_token', token);
        localStorage.setItem('cms_user', JSON.stringify(user));
      })
    );
  }

  logout(): void {
    this._token.set(null);
    this._currentUser.set(null);
    localStorage.removeItem('cms_token');
    localStorage.removeItem('cms_user');
    this.router.navigate(['/admin/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  private _loadUserFromStorage(): User | null {
    try {
      const raw = localStorage.getItem('cms_user');
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }
}
