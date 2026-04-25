import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';

import { GatekeeperComponent } from './gatekeeper.component';
import { CookieService } from '../../core/services/cookie.service';
import { GATEKEEPER_COOKIE, gatekeeperGuard } from '../../core/guards/gatekeeper.guard';

describe('GatekeeperComponent (bloqueo de navegación + cookie de primer acceso)', () => {
  let fixture: ComponentFixture<GatekeeperComponent>;
  let component: GatekeeperComponent;
  let cookies: CookieService;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GatekeeperComponent, ReactiveFormsModule],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(GatekeeperComponent);
    component = fixture.componentInstance;
    cookies = TestBed.inject(CookieService);
    router = TestBed.inject(Router);

    cookies.remove(GATEKEEPER_COOKIE);
    fixture.detectChanges();
  });

  afterEach(() => cookies.remove(GATEKEEPER_COOKIE));

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe mostrar el formulario con los campos nombre, correo y aceptación', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="gk-name"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="gk-email"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="gk-accept"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="gk-submit"]')).toBeTruthy();
  });

  it('no debe submit si el formulario es inválido (marca todos como touched)', () => {
    const spy = spyOn(cookies, 'set');
    component.onSubmit();
    expect(component.form.touched).toBeTrue();
    expect(spy).not.toHaveBeenCalled();
  });

  it('debe validar email incorrecto', () => {
    component.form.patchValue({ fullName: 'María Pérez', email: 'no-es-correo', accept: true });
    component.form.markAllAsTouched();
    fixture.detectChanges();
    expect(component.fieldError('email', 'email')).toBeTrue();
  });

  it('debe exigir el checkbox de aceptación', () => {
    component.form.patchValue({ fullName: 'María Pérez', email: 'm@test.com', accept: false });
    component.form.markAllAsTouched();
    fixture.detectChanges();
    expect(component.fieldError('accept', 'required')).toBeTrue();
  });

  it('en submit válido debe crear la cookie y redirigir a "/"', fakeAsync(() => {
    const setSpy = spyOn(cookies, 'set').and.callThrough();
    const navSpy = spyOn(router, 'navigate');

    component.form.patchValue({
      fullName: 'María Pérez',
      email: 'maria@test.com',
      accept: true
    });
    component.onSubmit();

    expect(component.submitting()).toBeTrue();
    tick(500); // latencia simulada

    expect(setSpy).toHaveBeenCalled();
    const [cookieName, value] = setSpy.calls.mostRecent().args;
    expect(cookieName).toBe(GATEKEEPER_COOKIE);
    const parsed = JSON.parse(value as string);
    expect(parsed.fullName).toBe('María Pérez');
    expect(parsed.email).toBe('maria@test.com');

    expect(navSpy).toHaveBeenCalledWith(['/']);
    expect(component.submitting()).toBeFalse();
  }));

  it('el guard debe permitir el acceso si la cookie ya existe', () => {
    cookies.set(GATEKEEPER_COOKIE, 'ok');
    const result = TestBed.runInInjectionContext(
      () => gatekeeperGuard({} as any, {} as any)
    );
    expect(result).toBeTrue();
  });

  it('el guard debe redirigir a /bienvenida si no hay cookie', () => {
    cookies.remove(GATEKEEPER_COOKIE);
    const result = TestBed.runInInjectionContext(
      () => gatekeeperGuard({} as any, {} as any)
    );
    // createUrlTree devuelve un UrlTree, no un boolean
    expect(typeof result === 'boolean').toBeFalse();
    expect(result.toString()).toContain('/bienvenida');
  });
});
