import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/services/auth.service';

describe('LoginComponent (formulario, feedback visual y redirección post-login)', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let authService: AuthService;
  let router: Router;

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [LoginComponent, ReactiveFormsModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);

    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar los campos de email, password y el botón submit', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#email')).toBeTruthy();
    expect(el.querySelector('#password')).toBeTruthy();
    expect(el.querySelector('button[type="submit"]')).toBeTruthy();
    expect(el.querySelector('.toggle-password')).toBeTruthy();
  });

  it('el formulario arranca inválido y vacío', () => {
    expect(component.form.valid).toBeFalse();
    expect(component.form.value.email).toBe('');
    expect(component.form.value.password).toBe('');
  });

  it('valida email requerido + formato', () => {
    component.form.patchValue({ email: '', password: 'admin123' });
    expect(component.form.get('email')?.hasError('required')).toBeTrue();

    component.form.patchValue({ email: 'no-es-email' });
    expect(component.form.get('email')?.hasError('email')).toBeTrue();
  });

  it('valida password requerida + longitud mínima 6', () => {
    component.form.patchValue({ password: '' });
    expect(component.form.get('password')?.hasError('required')).toBeTrue();

    component.form.patchValue({ password: '123' });
    expect(component.form.get('password')?.hasError('minlength')).toBeTrue();

    component.form.patchValue({ password: '123456' });
    expect(component.form.get('password')?.valid).toBeTrue();
  });

  it('onSubmit con formulario inválido no llama a authService.login', () => {
    const spy = spyOn(authService, 'login').and.callThrough();
    component.onSubmit();
    expect(spy).not.toHaveBeenCalled();
    expect(component.form.touched).toBeTrue();
  });

  it('togglePassword alterna la visibilidad del campo', () => {
    expect(component.showPassword()).toBeFalse();
    component.togglePassword();
    expect(component.showPassword()).toBeTrue();

    fixture.detectChanges();
    const pwdInput = fixture.nativeElement.querySelector('#password') as HTMLInputElement;
    expect(pwdInput.getAttribute('type')).toBe('text');

    component.togglePassword();
    fixture.detectChanges();
    expect(pwdInput.getAttribute('type')).toBe('password');
  });

  it('muestra feedback visual cuando el email es inválido y touched', () => {
    const emailCtrl = component.form.get('email')!;
    emailCtrl.setValue('mal');
    emailCtrl.markAsTouched();
    fixture.detectChanges();

    expect(component.fieldError('email', 'email')).toBeTrue();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.form-error')?.textContent).toContain('correo válido');
  });

  it('muestra mensaje de error tras credenciales incorrectas', fakeAsync(() => {
    component.form.patchValue({ email: 'nope@test.com', password: 'wrongpwd' });
    component.onSubmit();
    tick(1000);
    fixture.detectChanges();

    expect(component.errorMessage()).toContain('incorrectos');
    expect(component.loading()).toBeFalse();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.alert--error')).toBeTruthy();
  }));

  it('login correcto con mock admin redirige a /admin/dashboard', fakeAsync(() => {
    const navSpy = spyOn(router, 'navigate');

    component.form.patchValue({ email: 'admin@clinica.com', password: 'admin123' });
    component.onSubmit();

    expect(component.loading()).toBeTrue();
    tick(1000);

    expect(navSpy).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(authService.isAuthenticated()).toBeTrue();
    expect(authService.currentUser()?.role).toBe('admin');
  }));

  it('login correcto con mock editor redirige a /admin/dashboard', fakeAsync(() => {
    const navSpy = spyOn(router, 'navigate');

    component.form.patchValue({ email: 'editor@clinica.com', password: 'editor123' });
    component.onSubmit();
    tick(1000);

    expect(navSpy).toHaveBeenCalledWith(['/admin/dashboard']);
    expect(authService.currentUser()?.role).toBe('editor');
  }));

  it('el botón submit muestra spinner y queda disabled mientras loading', fakeAsync(() => {
    spyOn(router, 'navigate');  // evitar resolución real de ruta
    component.form.patchValue({ email: 'admin@clinica.com', password: 'admin123' });
    component.onSubmit();
    fixture.detectChanges();

    const btn = fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    expect(btn.disabled).toBeTrue();
    expect(btn.textContent).toContain('Verificando');

    tick(1000);
    fixture.detectChanges();
  }));
});
