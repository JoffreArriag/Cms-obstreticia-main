import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GalleryMasonryComponent, GalleryImage } from './gallery-masonry.component';

describe('GalleryMasonryComponent (lazy loading, hover e interacción de detalle)', () => {
  let fixture: ComponentFixture<GalleryMasonryComponent>;
  let component: GalleryMasonryComponent;

  const mockImages: GalleryImage[] = [
    { id: 'img1', src: 'https://example.com/1.jpg', alt: 'Imagen 1', title: 'Primera', description: 'Desc 1' },
    { id: 'img2', src: 'https://example.com/2.jpg', alt: 'Imagen 2', title: 'Segunda' },
    { id: 'img3', src: 'https://example.com/3.jpg', alt: 'Imagen 3' }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GalleryMasonryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(GalleryMasonryComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('images', mockImages);
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('debe renderizar tantos items como imágenes recibe', () => {
    const el: HTMLElement = fixture.nativeElement;
    const items = el.querySelectorAll('.gallery__item');
    expect(items.length).toBe(3);
  });

  it('cada <img> debe llevar loading="lazy" y decoding="async"', () => {
    const el: HTMLElement = fixture.nativeElement;
    const imgs = el.querySelectorAll('img.gallery__img');
    expect(imgs.length).toBe(3);
    imgs.forEach(img => {
      expect(img.getAttribute('loading')).toBe('lazy');
      expect(img.getAttribute('decoding')).toBe('async');
    });
  });

  it('debe usar el thumb cuando existe, y el src en caso contrario', () => {
    const withThumb: GalleryImage[] = [
      { id: 'x', src: 'https://example.com/full.jpg', thumb: 'https://example.com/thumb.jpg', alt: 'x' }
    ];
    fixture.componentRef.setInput('images', withThumb);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img.gallery__img') as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('https://example.com/thumb.jpg');
  });

  it('al hacer click en un item debe abrirse el detalle con la imagen seleccionada', () => {
    const el: HTMLElement = fixture.nativeElement;
    const first = el.querySelector('[data-testid="gallery-item-img1"]') as HTMLElement;
    first.click();
    fixture.detectChanges();

    expect(component.selected()?.id).toBe('img1');
    expect(el.querySelector('[data-testid="gallery-detail"]')).toBeTruthy();
    expect(el.textContent).toContain('Primera');
    expect(el.textContent).toContain('Desc 1');
  });

  it('el detalle se cierra con el botón X', () => {
    component.open(mockImages[0]);
    fixture.detectChanges();
    expect(component.selected()).not.toBeNull();

    const close = fixture.nativeElement.querySelector('[data-testid="gallery-close"]') as HTMLElement;
    close.click();
    fixture.detectChanges();
    expect(component.selected()).toBeNull();
  });

  it('el detalle se cierra con la tecla Escape', () => {
    component.open(mockImages[1]);
    expect(component.selected()).not.toBeNull();

    component.onKeydown(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(component.selected()).toBeNull();
  });

  it('otras teclas no cierran el detalle', () => {
    component.open(mockImages[1]);
    component.onKeydown(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(component.selected()).not.toBeNull();
  });

  it('la clase de columnas se aplica según el input', () => {
    fixture.componentRef.setInput('columns', 4);
    fixture.detectChanges();
    const root = fixture.nativeElement.querySelector('.gallery') as HTMLElement;
    expect(root.classList.contains('gallery--cols-4')).toBeTrue();
  });

  it('cada item tiene las clases CSS base necesarias para el efecto hover', () => {
    const el: HTMLElement = fixture.nativeElement;
    const items = el.querySelectorAll('.gallery__item');
    items.forEach(item => {
      // La clase __item es la que expone el hover via SCSS (&:hover)
      expect(item.classList.contains('gallery__item')).toBeTrue();
      // Debe tener la imagen con la clase __img que recibe el transform en hover
      expect(item.querySelector('.gallery__img')).toBeTruthy();
    });
  });

  it('los items con title renderizan un caption que el hover muestra', () => {
    // Solo img1 e img2 tienen title. img3 no debe tener caption.
    const el: HTMLElement = fixture.nativeElement;
    const captions = el.querySelectorAll('.gallery__caption');
    expect(captions.length).toBe(2);
    expect(captions[0].textContent?.trim()).toBe('Primera');
    expect(captions[1].textContent?.trim()).toBe('Segunda');
  });

  it('los items son clickeables (cursor pointer / handler de open)', () => {
    const el: HTMLElement = fixture.nativeElement;
    const items = el.querySelectorAll('.gallery__item') as NodeListOf<HTMLElement>;
    // Cada item debe disparar component.open() al hacer click
    spyOn(component, 'open').and.callThrough();
    items[0].click();
    expect(component.open).toHaveBeenCalledWith(mockImages[0]);
  });
});
