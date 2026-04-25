import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PagesService } from '../services/pages.service';
import { PageBlock, BlockType } from '../../../frontoffice/blocks/models/block.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

type EditorMode = 'new' | 'edit';

interface BlockOption { type: BlockType; label: string; description: string; icon: string; }

@Component({
  selector: 'app-page-editor',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent],
  templateUrl: './page-editor.component.html',
  styleUrl: './page-editor.component.scss'
})
export class PageEditorComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private service = inject(PagesService);

  mode         = signal<EditorMode>('new');
  pageId       = signal<string | null>(null);
  saving       = signal(false);
  saved        = signal(false);
  blocks       = signal<PageBlock[]>([]);
  showPicker   = signal(false);
  expandedBlock= signal<string | null>(null);

  form = this.fb.group({
    title:       ['', [Validators.required, Validators.minLength(3)]],
    slug:        ['', Validators.required],
    status:      ['draft' as 'published' | 'draft' | 'archived'],
    description: ['']
  });

  blockOptions: BlockOption[] = [
    { type: 'hero',       label: 'Hero',          description: 'Banner principal con título y CTA',  icon: 'hero'    },
    { type: 'text',       label: 'Texto',          description: 'Bloque de contenido HTML',            icon: 'text'    },
    { type: 'image',      label: 'Imagen',         description: 'Imagen con pie de foto opcional',     icon: 'image'   },
    { type: 'cards-grid', label: 'Tarjetas',       description: 'Cuadrícula de tarjetas informativas', icon: 'cards'   },
    { type: 'cta',        label: 'Call to Action', description: 'Sección de llamada a la acción',      icon: 'cta'     },
  ];

  headerTitle = computed(() =>
    this.mode() === 'new' ? 'Nueva página' : `Editar: ${this.form.value.title || '...'}`
  );

  breadcrumbs = computed(() => [
    { label: 'Inicio',   route: '/admin/dashboard' },
    { label: 'Páginas',  route: '/admin/pages'     },
    { label: this.mode() === 'new' ? 'Nueva' : 'Editar' }
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode.set('edit');
      this.pageId.set(id);
      const page = this.service.getById(id)();
      if (page) {
        this.form.patchValue({
          title: page.title, slug: page.slug,
          status: page.status, description: page.description ?? ''
        });
        this.blocks.set([...page.blocks]);
      }
    }

    // Auto-slug desde el título (solo en modo nuevo)
    this.form.get('title')!.valueChanges.subscribe(title => {
      if (this.mode() === 'new' && title) {
        this.form.get('slug')!.setValue(this.service.slugify(title), { emitEvent: false });
      }
    });
  }

  // ── Bloques ──────────────────────────────────────────────────

  addBlock(type: BlockType): void {
    const id = `block-${Date.now()}`;
    const newBlock = this.buildDefaultBlock(id, type);
    this.blocks.update(b => [...b, newBlock]);
    this.showPicker.set(false);
    this.expandedBlock.set(id);
  }

  removeBlock(id: string): void {
    this.blocks.update(b => b.filter(bl => bl.id !== id));
    if (this.expandedBlock() === id) this.expandedBlock.set(null);
  }

  toggleBlock(id: string): void {
    this.expandedBlock.update(cur => cur === id ? null : id);
  }

  moveBlock(index: number, dir: -1 | 1): void {
    const arr = [...this.blocks()];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    this.blocks.set(arr.map((b, i) => ({ ...b, order: i + 1 })));
  }

  updateBlockData(id: string, patch: Record<string, unknown>): void {
    this.blocks.update(arr =>
      arr.map(b => b.id === id ? { ...b, data: { ...(b as any).data, ...patch } } : b)
    );
  }

  toggleBlockVisibility(id: string): void {
    this.blocks.update(arr =>
      arr.map(b => b.id === id ? { ...b, visible: !b.visible } : b)
    );
  }

  // ── Guardar ──────────────────────────────────────────────────

  onSave(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);

    const formData = this.form.value as any;

    setTimeout(() => {
      if (this.mode() === 'new') {
        const page = this.service.create(formData);
        this.service.updateBlocks(page.id, this.blocks());
        this.router.navigate(['/admin/pages', page.id, 'edit']);
      } else {
        this.service.update(this.pageId()!, formData);
        this.service.updateBlocks(this.pageId()!, this.blocks());
      }
      this.saving.set(false);
      this.saved.set(true);
      this.mode.set('edit');
      setTimeout(() => this.saved.set(false), 2500);
    }, 700);
  }

  fieldError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }

  blockLabel(type: BlockType): string {
    return this.blockOptions.find(o => o.type === type)?.label ?? type;
  }

  // ── Builder bloques por defecto ───────────────────────────────

  private buildDefaultBlock(id: string, type: BlockType): PageBlock {
    const order = this.blocks().length + 1;
    switch (type) {
      case 'hero':
        return { id, type, visible: true, order, data: { title: 'Nuevo hero', subtitle: '', ctaLabel: '', ctaRoute: '/', overlay: false } };
      case 'text':
        return { id, type, visible: true, order, data: { title: '', html: '<p>Contenido aquí...</p>', align: 'left' } };
      case 'image':
        return { id, type, visible: true, order, data: { src: '', alt: '', caption: '', fullWidth: false } };
      case 'cards-grid':
        return { id, type, visible: true, order, data: { title: '', subtitle: '', columns: 3, cards: [{ title: 'Tarjeta 1', description: 'Descripción' }] } };
      case 'cta':
        return { id, type, visible: true, order, data: { title: 'Título CTA', description: '', primaryLabel: 'Ver más', primaryRoute: '/', variant: 'primary' } };
    }
  }
}
