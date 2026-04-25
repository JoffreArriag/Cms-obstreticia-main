import { Injectable, computed, signal } from '@angular/core';
import {
  Catalog,
  CatalogFormData,
  CatalogItem,
} from '../models/catalog.model';

const MOCK_CATALOGS: Catalog[] = [
  {
    id: 'catalog-1',
    name: 'Servicios Obstétricos',
    slug: 'servicios-obstetricos',
    description: 'Catálogo principal de servicios clínicos y programas de acompañamiento.',
    status: 'active',
    visibility: 'public',
    theme: 'blue',
    itemLabel: 'Servicio',
    items: [
      {
        id: 'item-1',
        title: 'Control prenatal',
        slug: 'control-prenatal',
        category: 'Seguimiento',
        summary: 'Atención periódica durante el embarazo con valoración clínica y educación materna.',
        status: 'active',
        featured: true,
        tags: ['Embarazo', 'Prevención', 'Consulta'],
        updatedAt: new Date('2026-03-12')
      },
      {
        id: 'item-2',
        title: 'Psicoprofilaxis obstétrica',
        slug: 'psicoprofilaxis-obstetrica',
        category: 'Preparación',
        summary: 'Sesiones educativas para preparar a la gestante y su familia para el parto.',
        status: 'active',
        featured: false,
        tags: ['Taller', 'Parto', 'Familia'],
        updatedAt: new Date('2026-03-21')
      },
      {
        id: 'item-3',
        title: 'Consejería en lactancia',
        slug: 'consejeria-en-lactancia',
        category: 'Acompañamiento',
        summary: 'Orientación antes y después del nacimiento para fortalecer la lactancia materna.',
        status: 'inactive',
        featured: false,
        tags: ['Lactancia', 'Postparto'],
        updatedAt: new Date('2026-02-26')
      }
    ],
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2026-03-21')
  },
  {
    id: 'catalog-2',
    name: 'Procedimientos y Estudios',
    slug: 'procedimientos-y-estudios',
    description: 'Inventario editorial de procedimientos, estudios diagnósticos y atenciones complementarias.',
    status: 'active',
    visibility: 'private',
    theme: 'teal',
    itemLabel: 'Procedimiento',
    items: [
      {
        id: 'item-4',
        title: 'Ecografía obstétrica',
        slug: 'ecografia-obstetrica',
        category: 'Diagnóstico',
        summary: 'Registro del estudio, preparación previa y hallazgos esperados por trimestre.',
        status: 'active',
        featured: true,
        tags: ['Imagen', 'Seguimiento'],
        updatedAt: new Date('2026-03-30')
      },
      {
        id: 'item-5',
        title: 'Monitoreo fetal',
        slug: 'monitoreo-fetal',
        category: 'Diagnóstico',
        summary: 'Control de bienestar fetal con recomendaciones de uso y frecuencia de revisión.',
        status: 'active',
        featured: false,
        tags: ['Feto', 'Control'],
        updatedAt: new Date('2026-03-28')
      }
    ],
    createdAt: new Date('2025-12-05'),
    updatedAt: new Date('2026-03-30')
  },
  {
    id: 'catalog-3',
    name: 'Recursos para Gestantes',
    slug: 'recursos-para-gestantes',
    description: 'Biblioteca de materiales descargables, guías breves y recursos de orientación.',
    status: 'draft',
    visibility: 'public',
    theme: 'sand',
    itemLabel: 'Recurso',
    items: [
      {
        id: 'item-6',
        title: 'Checklist del primer trimestre',
        slug: 'checklist-del-primer-trimestre',
        category: 'Guías',
        summary: 'Material de apoyo con controles, signos de alarma y hábitos recomendados.',
        status: 'active',
        featured: true,
        tags: ['Checklist', 'Primer trimestre'],
        updatedAt: new Date('2026-04-02')
      }
    ],
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-04-02')
  }
];

@Injectable({ providedIn: 'root' })
export class CatalogsService {
  private readonly _catalogs = signal<Catalog[]>(MOCK_CATALOGS);

  readonly catalogs = this._catalogs.asReadonly();

  readonly metrics = computed(() => {
    const catalogs = this._catalogs();
    const items = catalogs.flatMap(catalog => catalog.items);

    return {
      totalCatalogs: catalogs.length,
      activeCatalogs: catalogs.filter(catalog => catalog.status === 'active').length,
      totalItems: items.length,
      featuredItems: items.filter(item => item.featured).length
    };
  });

  getById(id: string) {
    return computed(() => this._catalogs().find(catalog => catalog.id === id) ?? null);
  }

  create(data: CatalogFormData, items: CatalogItem[] = []): Catalog {
    const now = new Date();
    const newCatalog: Catalog = {
      id: this.nextId('catalog'),
      ...data,
      slug: this.ensureUniqueCatalogSlug(data.slug),
      itemLabel: data.itemLabel.trim() || 'Entrada',
      items: this.normalizeItems(items, now),
      createdAt: now,
      updatedAt: now
    };

    this._catalogs.update(catalogs => [newCatalog, ...catalogs]);
    return newCatalog;
  }

  update(id: string, data: Partial<CatalogFormData>): void {
    this._catalogs.update(catalogs =>
      catalogs.map(catalog => {
        if (catalog.id !== id) {
          return catalog;
        }

        const nextSlug = data.slug
          ? this.ensureUniqueCatalogSlug(data.slug, id)
          : catalog.slug;

        return {
          ...catalog,
          ...data,
          slug: nextSlug,
          itemLabel: data.itemLabel?.trim() || catalog.itemLabel,
          updatedAt: new Date()
        };
      })
    );
  }

  replaceItems(id: string, items: CatalogItem[]): void {
    const now = new Date();

    this._catalogs.update(catalogs =>
      catalogs.map(catalog =>
        catalog.id === id
          ? {
              ...catalog,
              items: this.normalizeItems(items, now),
              updatedAt: now
            }
          : catalog
      )
    );
  }

  duplicate(id: string): Catalog | null {
    const source = this._catalogs().find(catalog => catalog.id === id);

    if (!source) {
      return null;
    }

    const now = new Date();
    const duplicated: Catalog = {
      ...source,
      id: this.nextId('catalog'),
      name: `${source.name} (copia)`,
      slug: this.ensureUniqueCatalogSlug(`${source.slug}-copia`),
      status: 'draft',
      items: this.normalizeItems(
        source.items.map(item => ({
          ...item,
          id: this.nextId('item'),
          tags: [...item.tags],
          updatedAt: now
        })),
        now
      ),
      createdAt: now,
      updatedAt: now
    };

    this._catalogs.update(catalogs => [duplicated, ...catalogs]);
    return duplicated;
  }

  delete(id: string): void {
    this._catalogs.update(catalogs => catalogs.filter(catalog => catalog.id !== id));
  }

  slugify(value: string): string {
    const slug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');

    return slug || 'nuevo-elemento';
  }

  private normalizeItems(items: CatalogItem[], now: Date): CatalogItem[] {
    const takenSlugs = new Set<string>();

    return items.map(item => {
      const normalizedSlug = this.makeUniqueSlug(
        this.slugify(item.slug || item.title),
        takenSlugs
      );

      takenSlugs.add(normalizedSlug);

      return {
        ...item,
        id: item.id || this.nextId('item'),
        slug: normalizedSlug,
        tags: [...new Set(item.tags.map(tag => tag.trim()).filter(Boolean))],
        updatedAt: item.updatedAt ?? now
      };
    });
  }

  private ensureUniqueCatalogSlug(baseSlug: string, excludedId?: string): string {
    const takenSlugs = new Set(
      this._catalogs()
        .filter(catalog => catalog.id !== excludedId)
        .map(catalog => catalog.slug)
    );

    return this.makeUniqueSlug(this.slugify(baseSlug), takenSlugs);
  }

  private makeUniqueSlug(baseSlug: string, takenSlugs: Set<string>): string {
    const normalizedBase = baseSlug || 'nuevo-elemento';
    let candidate = normalizedBase;
    let counter = 2;

    while (takenSlugs.has(candidate)) {
      candidate = `${normalizedBase}-${counter}`;
      counter += 1;
    }

    return candidate;
  }

  private nextId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
