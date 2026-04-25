import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

import { PagesService } from '../services/pages.service';
import { PageBlock, BlockType } from '../../../frontoffice/core/models/block.model';
import { HeroBlockComponent } from '../../../frontoffice/blocks/hero-block/hero-block.component';
import { TextBlockComponent } from '../../../frontoffice/blocks/text-block/text-block.component';
import { ImageBlockComponent } from '../../../frontoffice/blocks/image-block/image-block.component';
import { CardsGridComponent } from '../../../frontoffice/blocks/cards-grid/cards-grid.component';
import { CtaBlockComponent } from '../../../frontoffice/blocks/cta-block/cta-block.component';
import { GalleryGridComponent } from '../../../frontoffice/blocks/gallery-grid/gallery-grid.component';

type Device = 'desktop' | 'tablet' | 'mobile';

interface BlockPaletteItem {
  type: BlockType;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-page-builder',
  imports: [
    RouterLink,
    DragDropModule,
    HeroBlockComponent,
    TextBlockComponent,
    ImageBlockComponent,
    CardsGridComponent,
    CtaBlockComponent,
    GalleryGridComponent,
  ],
  templateUrl: './page-builder.component.html',
  styleUrl: './page-builder.component.scss',
})
export class PageBuilderComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(PagesService);

  pageId = signal<string>('');
  pageTitle = signal('');
  blocks = signal<PageBlock[]>([]);
  selectedId = signal<string | null>(null);
  device = signal<Device>('desktop');
  saving = signal(false);
  saved = signal(false);
  panelOpen = signal(true);

  selectedBlock = computed(() => this.blocks().find((b) => b.id === this.selectedId()) ?? null);

  palette: BlockPaletteItem[] = [
    { type: 'hero', label: 'Hero', icon: 'hero' },
    { type: 'text', label: 'Texto', icon: 'text' },
    { type: 'image', label: 'Imagen', icon: 'image' },
    { type: 'cards-grid', label: 'Tarjetas', icon: 'cards' },
    { type: 'cta', label: 'Call to Action', icon: 'cta' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id') ?? '';
    this.pageId.set(id);
    const page = this.service.getById(id)();
    if (!page) {
      this.router.navigate(['/admin/pages']);
      return;
    }
    this.pageTitle.set(page.title);
    this.blocks.set([...page.blocks].sort((a, b) => a.order - b.order));
  }

  // ── Drag & Drop ───────────────────────────────────────────────

  onDrop(event: CdkDragDrop<PageBlock[]>): void {
    const arr = [...this.blocks()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.blocks.set(arr.map((b, i) => ({ ...b, order: i + 1 })));
  }

  // ── Selección ─────────────────────────────────────────────────

  selectBlock(id: string): void {
    this.selectedId.set(this.selectedId() === id ? null : id);
  }

  deselect(): void {
    this.selectedId.set(null);
  }

  // ── Añadir / Eliminar ─────────────────────────────────────────

  addBlock(type: BlockType): void {
    const id = `block-${Date.now()}`;
    const block = this.buildDefault(id, type);
    this.blocks.update((b) => [...b, block]);
    this.selectedId.set(id);
    // scroll al final del canvas
    setTimeout(() => {
      document.querySelector('.builder-canvas__end')?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
  }

  removeBlock(id: string, event: Event): void {
    event.stopPropagation();
    this.blocks.update((b) => b.filter((bl) => bl.id !== id));
    if (this.selectedId() === id) this.selectedId.set(null);
  }

  duplicateBlock(id: string, event: Event): void {
    event.stopPropagation();
    const original = this.blocks().find((b) => b.id === id);
    if (!original) return;
    const clone: PageBlock = {
      ...(original as any),
      id: `block-${Date.now()}`,
      data: { ...(original as any).data },
    };
    const idx = this.blocks().findIndex((b) => b.id === id);
    const arr = [...this.blocks()];
    arr.splice(idx + 1, 0, clone);
    this.blocks.set(arr.map((b, i) => ({ ...b, order: i + 1 })));
    this.selectedId.set(clone.id);
  }

  toggleVisibility(id: string, event: Event): void {
    event.stopPropagation();
    this.blocks.update((arr) => arr.map((b) => (b.id === id ? { ...b, visible: !b.visible } : b)));
  }

  // ── Propiedades ───────────────────────────────────────────────

  updateProp(key: string, value: unknown): void {
    const id = this.selectedId();
    if (!id) return;
    this.blocks.update((arr) =>
      arr.map((b) => (b.id === id ? { ...b, data: { ...(b as any).data, [key]: value } } : b)),
    );
  }

  // ── Guardar ───────────────────────────────────────────────────

  save(): void {
    this.saving.set(true);
    setTimeout(() => {
      this.service.updateBlocks(this.pageId(), this.blocks());
      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2000);
    }, 600);
  }

  // ── Helpers ───────────────────────────────────────────────────

  blockLabel(type: BlockType): string {
    return this.palette.find((p) => p.type === type)?.label ?? type;
  }

  numVal(event: Event): number {
    return Number((event.target as HTMLInputElement).value);
  }

  strVal(event: Event): string {
    return (event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement).value;
  }

  private buildDefault(id: string, type: BlockType): PageBlock {
    const order = this.blocks().length + 1;
    switch (type) {
      case 'hero':
        return {
          id,
          type,
          visible: true,
          order,
          data: {
            title: 'Nuevo Hero',
            subtitle: 'Agrega un subtítulo aquí',
            ctaLabel: 'Ver más',
            ctaRoute: '/',
            overlay: false,
          },
        };
      case 'text':
        return {
          id,
          type,
          visible: true,
          order,
          data: {
            title: 'Título de sección',
            html: '<p>Escribe tu contenido aquí...</p>',
            align: 'left',
          },
        };
      case 'image':
        return {
          id,
          type,
          visible: true,
          order,
          data: {
            src: 'https://placehold.co/1200x400',
            alt: 'Imagen',
            caption: '',
            fullWidth: false,
          },
        };
      case 'cards-grid':
        return {
          id,
          type,
          visible: true,
          order,
          data: {
            title: 'Nuestros servicios',
            subtitle: '',
            columns: 3,
            cards: [
              { title: 'Servicio 1', description: 'Descripción del servicio.' },
              { title: 'Servicio 2', description: 'Descripción del servicio.' },
              { title: 'Servicio 3', description: 'Descripción del servicio.' },
            ],
          },
        };
      case 'cta':
        return {
          id,
          type,
          visible: true,
          order,
          data: {
            title: '¿Listo para comenzar?',
            description: 'Contáctanos hoy.',
            primaryLabel: 'Contactar',
            primaryRoute: '/contacto',
            variant: 'primary',
          },
        };
      default:
        throw new Error(`Tipo de bloque desconocido: ${type}`);
    }
  }
}
