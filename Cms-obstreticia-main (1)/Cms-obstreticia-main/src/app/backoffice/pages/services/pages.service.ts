import { Injectable, signal, computed } from '@angular/core';
import { Page, PageFormData } from '../models/page.model';
import { PageBlock } from '../../../frontoffice/core/models/block.model';

const MOCK_PAGES: Page[] = [
  {
    id: '1',
    title: 'Inicio',
    slug: '/',
    status: 'published',
    description: 'Página principal del sitio público',
    blocks: [
      {
        id: 'h1',
        type: 'hero',
        visible: true,
        order: 1,
        data: {
          title: 'Clínica de Obstetricia y Ginecología',
          subtitle: 'Cuidamos de ti y de tu bebé.',
          ctaLabel: 'Agendar consulta',
          ctaRoute: '/contacto',
        },
      },
      {
        id: 'c1',
        type: 'cards-grid',
        visible: true,
        order: 2,
        data: {
          title: 'Nuestros servicios',
          columns: 3,
          cards: [
            { title: 'Control prenatal', description: 'Seguimiento completo durante tu embarazo.' },
            { title: 'Ecografías', description: 'Imágenes de alta resolución.' },
            { title: 'Parto humanizado', description: 'Acompañamiento respetuoso.' },
          ],
        },
      },
    ],
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-03-15'),
  },
  {
    id: '2',
    title: 'Servicios',
    slug: '/servicios',
    status: 'published',
    description: 'Detalle de todos los servicios ofrecidos',
    blocks: [
      {
        id: 't1',
        type: 'text',
        visible: true,
        order: 1,
        data: {
          title: 'Nuestros servicios',
          html: '<p>Ofrecemos atención integral en obstetricia y ginecología.</p>',
          align: 'center',
        },
      },
    ],
    createdAt: new Date('2025-01-12'),
    updatedAt: new Date('2025-02-20'),
  },
  {
    id: '3',
    title: 'Contacto',
    slug: '/contacto',
    status: 'draft',
    description: 'Formulario de contacto y ubicación',
    blocks: [],
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-02-01'),
  },
  {
    id: '4',
    title: 'Acerca de',
    slug: '/acerca-de',
    status: 'archived',
    description: 'Historia y misión del departamento',
    blocks: [],
    createdAt: new Date('2024-12-01'),
    updatedAt: new Date('2025-01-05'),
  },
];

@Injectable({ providedIn: 'root' })
export class PagesService {
  private _pages = signal<Page[]>(MOCK_PAGES);

  readonly pages = this._pages.asReadonly();

  getById(id: string) {
    return computed(() => this._pages().find((p) => p.id === id) ?? null);
  }

  create(data: PageFormData): Page {
    const newPage: Page = {
      id: Date.now().toString(),
      ...data,
      blocks: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this._pages.update((pages) => [newPage, ...pages]);
    return newPage;
  }

  update(id: string, data: Partial<PageFormData>): void {
    this._pages.update((pages) =>
      pages.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date() } : p)),
    );
  }

  updateBlocks(id: string, blocks: PageBlock[]): void {
    this._pages.update((pages) =>
      pages.map((p) => (p.id === id ? { ...p, blocks, updatedAt: new Date() } : p)),
    );
  }

  delete(id: string): void {
    this._pages.update((pages) => pages.filter((p) => p.id !== id));
  }

  slugify(title: string): string {
    return (
      '/' +
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
    );
  }
}
