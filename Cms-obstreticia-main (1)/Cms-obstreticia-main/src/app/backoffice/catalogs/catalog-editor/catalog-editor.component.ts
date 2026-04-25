import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge';
import {
  Catalog,
  CatalogFormData,
  CatalogItem,
  CatalogItemStatus,
  CatalogStatus,
  CatalogTheme,
  CatalogVisibility,
} from '../models/catalog.model';
import { CatalogsService } from '../services/catalogs.service';

type EditorMode = 'new' | 'edit';

@Component({
  selector: 'app-catalog-editor',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    PageHeaderComponent,
    StatusBadgeComponent,
    ModalComponent,
  ],
  templateUrl: './catalog-editor.component.html',
  styleUrl: './catalog-editor.component.scss',
})
export class CatalogEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly catalogsService = inject(CatalogsService);

  readonly mode = signal<EditorMode>('new');
  readonly catalogId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly saved = signal(false);
  readonly items = signal<CatalogItem[]>([]);

  readonly itemModalOpen = signal(false);
  readonly itemDeleteTarget = signal<CatalogItem | null>(null);
  readonly editingItemId = signal<string | null>(null);
  readonly itemSaving = signal(false);
  readonly itemDeleteLoading = signal(false);

  readonly statusOptions: { value: CatalogStatus; label: string }[] = [
    { value: 'draft', label: 'Borrador' },
    { value: 'active', label: 'Activo' },
    { value: 'archived', label: 'Archivado' },
  ];

  readonly visibilityOptions: { value: CatalogVisibility; label: string }[] = [
    { value: 'public', label: 'Público' },
    { value: 'private', label: 'Privado' },
  ];

  readonly themeOptions: { value: CatalogTheme; label: string; accent: string }[] = [
    { value: 'blue', label: 'Institucional', accent: 'Azul' },
    { value: 'teal', label: 'Clínico', accent: 'Turquesa' },
    { value: 'sand', label: 'Editorial', accent: 'Arena' },
    { value: 'rose', label: 'Humano', accent: 'Rosa' },
  ];

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    slug: ['', Validators.required],
    description: ['', [Validators.required, Validators.minLength(12)]],
    status: ['draft' as CatalogStatus],
    visibility: ['public' as CatalogVisibility],
    theme: ['blue' as CatalogTheme],
    itemLabel: ['Entrada', [Validators.required, Validators.minLength(3)]],
  });

  readonly itemForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    slug: [''],
    category: ['', Validators.required],
    summary: ['', [Validators.required, Validators.minLength(12)]],
    status: ['active' as CatalogItemStatus],
    featured: [false],
    tags: [''],
  });

  readonly headerTitle = computed(() =>
    this.mode() === 'new'
      ? 'Nuevo catálogo'
      : `Editar: ${this.form.value.name?.trim() || 'Catálogo'}`,
  );

  readonly breadcrumbs = computed(() => [
    { label: 'Inicio', route: '/admin/dashboard' },
    { label: 'Catálogos', route: '/admin/catalogs' },
    { label: this.mode() === 'new' ? 'Nuevo' : 'Editar' },
  ]);

  readonly itemMetrics = computed(() => {
    const items = this.items();

    return {
      total: items.length,
      active: items.filter((item) => item.status === 'active').length,
      featured: items.filter((item) => item.featured).length,
    };
  });

  readonly itemModalTitle = computed(() =>
    this.editingItemId() ? 'Editar ítem del catálogo' : 'Nuevo ítem del catálogo',
  );

  readonly itemLabelPreview = computed(() => this.form.value.itemLabel?.trim() || 'Entrada');

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.mode.set('edit');
      this.catalogId.set(id);

      const catalog = this.catalogsService.getById(id)();

      if (catalog) {
        this.loadCatalog(catalog);
      }
    }

    this.form.controls.name.valueChanges.subscribe((name) => {
      if (this.mode() === 'new' && name) {
        this.form.controls.slug.setValue(this.catalogsService.slugify(name), {
          emitEvent: false,
        });
      }
    });

    this.itemForm.controls.title.valueChanges.subscribe((title) => {
      if (!this.editingItemId() && title && !this.itemForm.controls.slug.dirty) {
        this.itemForm.controls.slug.setValue(this.catalogsService.slugify(title), {
          emitEvent: false,
        });
      }
    });
  }

  openNewItem(): void {
    this.editingItemId.set(null);
    this.itemForm.reset({
      title: '',
      slug: '',
      category: '',
      summary: '',
      status: 'active',
      featured: false,
      tags: '',
    });
    this.itemForm.markAsPristine();
    this.itemForm.markAsUntouched();
    this.itemModalOpen.set(true);
  }

  openEditItem(item: CatalogItem): void {
    this.editingItemId.set(item.id);
    this.itemForm.reset({
      title: item.title,
      slug: item.slug,
      category: item.category,
      summary: item.summary,
      status: item.status,
      featured: item.featured,
      tags: item.tags.join(', '),
    });
    this.itemForm.markAsUntouched();
    this.itemModalOpen.set(true);
  }

  closeItemModal(): void {
    this.itemModalOpen.set(false);
    this.editingItemId.set(null);
    this.itemSaving.set(false);
  }

  saveItem(): void {
    if (this.itemForm.invalid) {
      this.itemForm.markAllAsTouched();
      return;
    }

    this.itemSaving.set(true);

    const value = this.itemForm.getRawValue();
    const item: CatalogItem = {
      id: this.editingItemId() ?? this.nextLocalId('item'),
      title: value.title?.trim() || '',
      slug: this.buildUniqueItemSlug(value.slug || value.title || ''),
      category: value.category?.trim() || '',
      summary: value.summary?.trim() || '',
      status: value.status as CatalogItemStatus,
      featured: !!value.featured,
      tags: this.parseTags(value.tags),
      updatedAt: new Date(),
    };

    setTimeout(() => {
      if (this.editingItemId()) {
        this.items.update((items) =>
          items.map((existing) => (existing.id === item.id ? item : existing)),
        );
      } else {
        this.items.update((items) => [item, ...items]);
      }

      this.closeItemModal();
    }, 220);
  }

  confirmDeleteItem(item: CatalogItem): void {
    this.itemDeleteTarget.set(item);
  }

  cancelDeleteItem(): void {
    this.itemDeleteTarget.set(null);
  }

  deleteItem(): void {
    const item = this.itemDeleteTarget();

    if (!item) {
      return;
    }

    this.itemDeleteLoading.set(true);

    setTimeout(() => {
      this.items.update((items) => items.filter((existing) => existing.id !== item.id));
      this.itemDeleteTarget.set(null);
      this.itemDeleteLoading.set(false);
    }, 260);
  }

  moveItem(index: number, direction: -1 | 1): void {
    const current = [...this.items()];
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= current.length) {
      return;
    }

    [current[index], current[nextIndex]] = [current[nextIndex], current[index]];
    this.items.set(current);
  }

  toggleFeatured(itemId: string): void {
    this.items.update((items) =>
      items.map((item) =>
        item.id === itemId ? { ...item, featured: !item.featured, updatedAt: new Date() } : item,
      ),
    );
  }

  toggleStatus(itemId: string): void {
    this.items.update((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              status: item.status === 'active' ? 'inactive' : 'active',
              updatedAt: new Date(),
            }
          : item,
      ),
    );
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const value = this.form.getRawValue();
    const data: CatalogFormData = {
      name: value.name?.trim() || '',
      slug: this.catalogsService.slugify(value.slug || value.name || ''),
      description: value.description?.trim() || '',
      status: value.status as CatalogStatus,
      visibility: value.visibility as CatalogVisibility,
      theme: value.theme as CatalogTheme,
      itemLabel: value.itemLabel?.trim() || 'Entrada',
    };

    setTimeout(() => {
      if (this.mode() === 'new') {
        const catalog = this.catalogsService.create(data, this.items());
        this.catalogId.set(catalog.id);
        this.mode.set('edit');
        this.router.navigate(['/admin/catalogs', catalog.id, 'edit']);
      } else {
        this.catalogsService.update(this.catalogId()!, data);
        this.catalogsService.replaceItems(this.catalogId()!, this.items());
      }

      this.saving.set(false);
      this.saved.set(true);
      setTimeout(() => this.saved.set(false), 2500);
    }, 650);
  }

  fieldError(field: keyof typeof this.form.controls, error: string): boolean {
    const control = this.form.controls[field];
    return !!(control.hasError(error) && control.touched);
  }

  itemFieldError(field: keyof typeof this.itemForm.controls, error: string): boolean {
    const control = this.itemForm.controls[field];
    return !!(control.hasError(error) && control.touched);
  }

  visibilityLabel(visibility: CatalogVisibility): string {
    return visibility === 'public' ? 'Público' : 'Privado';
  }

  themeLabel(theme: CatalogTheme): string {
    return this.themeOptions.find((option) => option.value === theme)?.label ?? theme;
  }

  trackTheme(index: number): number {
    return index;
  }

  private loadCatalog(catalog: Catalog): void {
    this.form.patchValue({
      name: catalog.name,
      slug: catalog.slug,
      description: catalog.description,
      status: catalog.status,
      visibility: catalog.visibility,
      theme: catalog.theme,
      itemLabel: catalog.itemLabel,
    });

    this.items.set(
      catalog.items.map((item) => ({
        ...item,
        tags: [...item.tags],
      })),
    );
  }

  private parseTags(tagsValue: string | null | undefined): string[] {
    return [
      ...new Set(
        (tagsValue ?? '')
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean),
      ),
    ];
  }

  private buildUniqueItemSlug(source: string): string {
    const baseSlug = this.catalogsService.slugify(source);
    const takenSlugs = new Set(
      this.items()
        .filter((item) => item.id !== this.editingItemId())
        .map((item) => item.slug),
    );

    let candidate = baseSlug;
    let counter = 2;

    while (takenSlugs.has(candidate)) {
      candidate = `${baseSlug}-${counter}`;
      counter += 1;
    }

    return candidate;
  }

  private nextLocalId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  }
}
