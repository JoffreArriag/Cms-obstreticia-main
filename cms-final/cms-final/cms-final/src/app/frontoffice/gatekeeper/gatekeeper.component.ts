import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CookieService } from '../../core/services/cookie.service';
import { GATEKEEPER_COOKIE } from '../../core/guards/gatekeeper.guard';

/**
 * GatekeeperComponent
 * Pantalla de bienvenida que bloquea la navegación del CMS público
 * hasta que el visitante se registre por primera vez.
 * Al completar el formulario se crea la cookie `cms_visitor_registered`.
 */
@Component({
  selector: 'app-gatekeeper',
  imports: [ReactiveFormsModule],
  templateUrl: './gatekeeper.component.html',
  styleUrl: './gatekeeper.component.scss'
})
export class GatekeeperComponent {
  private fb      = inject(FormBuilder);
  private cookies = inject(CookieService);
  private router  = inject(Router);

  submitting = signal(false);
  submitted  = signal(false);

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
    accept:   [false, [Validators.requiredTrue]]
  });

  fieldError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);

    // Simulamos latencia de registro y guardamos la cookie
    setTimeout(() => {
      const { fullName, email } = this.form.value;
      const payload = JSON.stringify({ fullName, email, at: new Date().toISOString() });
      this.cookies.set(GATEKEEPER_COOKIE, payload, 365);
      this.submitting.set(false);
      this.submitted.set(true);
      // Desbloqueo → ir al Home público
      this.router.navigate(['/']);
    }, 400);
  }
}
