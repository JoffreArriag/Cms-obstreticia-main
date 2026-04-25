import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ArticlesService } from '../../../core/services/articles.service';
import { ArticleStatus } from '../../../frontoffice/blocks/models/article.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { WysiwygEditorComponent, WysiwygBlock } from '../../shared/components/wysiwyg-editor/wysiwyg-editor.component';

type EditorMode = 'new' | 'edit';

@Component({
  selector: 'app-article-editor',
  imports: [ReactiveFormsModule, RouterLink, PageHeaderComponent, WysiwygEditorComponent],
  templateUrl: './article-editor.component.html',
  styleUrl: './article-editor.component.scss'
})
export class ArticleEditorComponent implements OnInit {
  private fb      = inject(FormBuilder);
  private route   = inject(ActivatedRoute);
  private router  = inject(Router);
  private service = inject(ArticlesService);

  mode       = signal<EditorMode>('new');
  articleId  = signal<string | null>(null);
  saving     = signal(false);
  saved      = signal(false);

  // Contenido del WYSIWYG (bloques serializados a HTML al guardar)
  wysiwygBlocks = signal<WysiwygBlock[]>([]);

  form = this.fb.group({
    title:      ['', [Validators.required, Validators.minLength(3)]],
    slug:       ['', Validators.required],
    summary:    ['', [Validators.required, Validators.minLength(10)]],
    author:     ['', Validators.required],
    coverImage: [''],
    status:     ['draft' as ArticleStatus],
    tags:       ['']
  });

  headerTitle = computed(() =>
    this.mode() === 'new' ? 'Nuevo artículo' : `Editar: ${this.form.value.title || '...'}`
  );

  breadcrumbs = computed(() => [
    { label: 'Inicio',    route: '/admin/dashboard' },
    { label: 'Artículos', route: '/admin/articles'  },
    { label: this.mode() === 'new' ? 'Nuevo' : 'Editar' }
  ]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.mode.set('edit');
      this.articleId.set(id);
      const article = this.service.getById(id)();
      if (article) {
        this.form.patchValue({
          title:      article.title,
          slug:       article.slug,
          summary:    article.summary,
          author:     article.author,
          coverImage: article.coverImage ?? '',
          status:     article.status,
          tags:       (article.tags ?? []).join(', ')
        });
        // Reconstruir bloques a partir del HTML guardado
        this.wysiwygBlocks.set(this.parseBodyToBlocks(article.body));
      }
    }

    // Auto-slug desde título (solo en modo nuevo)
    this.form.get('title')!.valueChanges.subscribe(title => {
      if (this.mode() === 'new' && title) {
        this.form.get('slug')!.setValue(this.service.slugify(title), { emitEvent: false });
      }
    });
  }

  onContentChange(blocks: WysiwygBlock[]): void {
    this.wysiwygBlocks.set(blocks);
  }

  fieldError(field: string, error: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.hasError(error) && ctrl?.touched);
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const formData = this.form.value as any;
    const tags = (formData.tags || '')
      .split(',')
      .map((t: string) => t.trim())
      .filter((t: string) => t.length > 0);

    const body = this.serializeBlocksToHtml(this.wysiwygBlocks());

    const payload = {
      title:      formData.title,
      slug:       formData.slug,
      summary:    formData.summary,
      author:     formData.author,
      coverImage: formData.coverImage || undefined,
      status:     formData.status as ArticleStatus,
      tags,
      body
    };

    setTimeout(() => {
      if (this.mode() === 'new') {
        const created = this.service.create(payload);
        this.articleId.set(created.id);
        this.mode.set('edit');
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
        this.router.navigate(['/admin/articles', created.id, 'edit']);
      } else {
        this.service.update(this.articleId()!, payload);
        this.saving.set(false);
        this.saved.set(true);
        setTimeout(() => this.saved.set(false), 2500);
      }
    }, 600);
  }

  // ── Serialización ──────────────────────────────────────

  private serializeBlocksToHtml(blocks: WysiwygBlock[]): string {
    return blocks.map(b => {
      switch (b.type) {
        case 'h1':        return `<h1>${this.escape(b.content)}</h1>`;
        case 'h2':        return `<h2>${this.escape(b.content)}</h2>`;
        case 'h3':        return `<h3>${this.escape(b.content)}</h3>`;
        case 'paragraph': return `<p>${this.escape(b.content)}</p>`;
        case 'image':     return `<img src="${b.content}" alt="${this.escape(b.alt || '')}" />`;
      }
    }).join('\n');
  }

  private parseBodyToBlocks(html: string): WysiwygBlock[] {
    if (!html) return [];
    // Parseo simple para recuperar bloques en modo edición
    const blocks: WysiwygBlock[] = [];
    const regex = /<(h1|h2|h3|p|img)\b[^>]*>(?:([^<]*)<\/\1>)?/gi;
    let match: RegExpExecArray | null;
    let idx = 0;
    while ((match = regex.exec(html)) !== null) {
      const tag = match[1].toLowerCase();
      const content = match[2] ?? '';
      const id = `wb-${Date.now()}-${idx++}`;
      if (tag === 'img') {
        const srcMatch = /src="([^"]*)"/.exec(match[0]);
        const altMatch = /alt="([^"]*)"/.exec(match[0]);
        blocks.push({ id, type: 'image', content: srcMatch?.[1] ?? '', alt: altMatch?.[1] });
      } else if (tag === 'p') {
        blocks.push({ id, type: 'paragraph', content });
      } else {
        blocks.push({ id, type: tag as 'h1'|'h2'|'h3', content });
      }
    }
    return blocks;
  }

  private escape(s: string): string {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
