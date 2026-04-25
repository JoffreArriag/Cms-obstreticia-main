import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { GatekeeperForm, FACULTADES } from '../../../core/models/gatekeeper.model';
import { GatekeeperService } from '../../../core/services/gatekeeper.service';
import { PrivacidadModalComponent } from '../privacidad-modal/privacidad-modal.component';

@Component({
  selector: 'app-register-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PrivacidadModalComponent],
  templateUrl: './register-form.component.html',
  styleUrls: ['./register-form.component.scss'],
})
export class RegisterFormComponent {
  showModalPrivacidad = false;

  @Output() registered = new EventEmitter<void>();

  facultades = FACULTADES;

  loading = signal(false);
  error = signal<string | null>(null);
  form!: ReturnType<FormBuilder['group']>;

  constructor(
    private fb: FormBuilder,
    private gatekeeper: GatekeeperService,
  ) {
    this.form = this.fb.group({
      nombres: ['', [Validators.required, Validators.minLength(2)]],
      apellidos: ['', [Validators.required, Validators.minLength(2)]],
      correo: ['', [Validators.required, Validators.email]],
      facultad: ['', Validators.required],
    });
  }

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.gatekeeper.register(this.form.value as GatekeeperForm).subscribe({
      next: () => {
        this.loading.set(false);
        this.registered.emit();
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(
          err.status === 409
            ? 'Este correo ya está registrado.'
            : 'Ocurrió un error. Intenta nuevamente.',
        );
      },
    });
  }

  //modal

  toggleModal(estado: boolean) {
    this.showModalPrivacidad = estado;
  }
}
