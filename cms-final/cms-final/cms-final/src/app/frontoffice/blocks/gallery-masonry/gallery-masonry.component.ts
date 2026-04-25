import { Component, input, signal } from '@angular/core';

export interface GalleryImage {
  id: string;
  src: string;
  thumb?: string;
  alt: string;
  title?: string;
  description?: string;
}

/**
 * GalleryMasonryComponent
 * Galería en columnas (masonry via CSS columns) con:
 *  - `loading="lazy"` nativo en cada imagen.
 *  - Hover con overlay y título.
 *  - Click: abre modal de detalle (propiedad expuesta como signal).
 */
@Component({
  selector: 'app-gallery-masonry',
  imports: [],
  templateUrl: './gallery-masonry.component.html',
  styleUrl: './gallery-masonry.component.scss'
})
export class GalleryMasonryComponent {
  images  = input.required<GalleryImage[]>();
  columns = input<2 | 3 | 4>(3);

  selected = signal<GalleryImage | null>(null);

  open(image: GalleryImage): void {
    this.selected.set(image);
  }

  close(): void {
    this.selected.set(null);
  }

  /** Cierra con Escape. */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') this.close();
  }

  trackById(_i: number, img: GalleryImage): string {
    return img.id;
  }
}
