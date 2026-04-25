import { Component, input, output, signal, computed } from '@angular/core';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

export type WysiwygBlockType = 'h1' | 'h2' | 'h3' | 'paragraph' | 'image';

export interface WysiwygBlock {
  id: string;
  type: WysiwygBlockType;
  /** Texto para headings y párrafos, o data-url/URL para imagen. */
  content: string;
  /** Texto alternativo (solo imágenes). */
  alt?: string;
}

/**
 * WysiwygEditorComponent
 * Editor visual mínimo para páginas CMS. Permite:
 *  - Añadir encabezados H1-H3 y párrafos.
 *  - Subir imágenes (quedan inline como data-url para preview).
 *  - Reordenar bloques con drag & drop (CDK).
 *  - Eliminar bloques.
 *  - Emitir contentChange cada vez que cambia el estado.
 */
@Component({
  selector: 'app-wysiwyg-editor',
  imports: [DragDropModule],
  templateUrl: './wysiwyg-editor.component.html',
  styleUrl: './wysiwyg-editor.component.scss'
})
export class WysiwygEditorComponent {
  /** Contenido inicial (opcional). */
  initialBlocks = input<WysiwygBlock[]>([]);

  /** Se emite en cada cambio con el estado completo. */
  contentChange = output<WysiwygBlock[]>();

  private _blocks = signal<WysiwygBlock[]>([]);
  blocks = computed(() => this._blocks());

  private initialized = false;

  ngOnInit(): void {
    // Cargar contenido inicial una sola vez
    if (!this.initialized) {
      this._blocks.set([...this.initialBlocks()]);
      this.initialized = true;
    }
  }

  // ── API pública usada por el template ────────────────────────

  addBlock(type: WysiwygBlockType): void {
    const block: WysiwygBlock = {
      id: `wb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      type,
      content: this.defaultContent(type)
    };
    this._blocks.update(arr => [...arr, block]);
    this.emit();
  }

  removeBlock(id: string): void {
    this._blocks.update(arr => arr.filter(b => b.id !== id));
    this.emit();
  }

  updateContent(id: string, content: string): void {
    this._blocks.update(arr =>
      arr.map(b => (b.id === id ? { ...b, content } : b))
    );
    this.emit();
  }

  updateAlt(id: string, alt: string): void {
    this._blocks.update(arr =>
      arr.map(b => (b.id === id ? { ...b, alt } : b))
    );
    this.emit();
  }

  onDrop(event: CdkDragDrop<WysiwygBlock[]>): void {
    const arr = [...this._blocks()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this._blocks.set(arr);
    this.emit();
  }

  /** Lee un archivo de imagen y lo inserta como nuevo bloque (data-url). */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      // Solo aceptamos imágenes
      input.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const block: WysiwygBlock = {
        id: `wb-img-${Date.now()}`,
        type: 'image',
        content: dataUrl,
        alt: file.name
      };
      this._blocks.update(arr => [...arr, block]);
      this.emit();
    };
    reader.readAsDataURL(file);

    input.value = '';
  }

  /** Accessor usado por tests para inspeccionar el estado. */
  getBlocks(): WysiwygBlock[] {
    return this._blocks();
  }

  // ── Helpers ──────────────────────────────────────────────────

  onContentInput(id: string, event: Event): void {
    const el = event.target as HTMLElement;
    this.updateContent(id, el.innerText);
  }

  trackById(_i: number, b: WysiwygBlock): string {
    return b.id;
  }

  private emit(): void {
    this.contentChange.emit(this._blocks());
  }

  private defaultContent(type: WysiwygBlockType): string {
    switch (type) {
      case 'h1':        return 'Encabezado H1';
      case 'h2':        return 'Encabezado H2';
      case 'h3':        return 'Encabezado H3';
      case 'paragraph': return 'Escribe tu contenido aquí...';
      case 'image':     return '';
    }
  }
}
