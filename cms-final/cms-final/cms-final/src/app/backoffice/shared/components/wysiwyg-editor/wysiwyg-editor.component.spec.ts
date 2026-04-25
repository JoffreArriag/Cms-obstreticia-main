import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WysiwygEditorComponent, WysiwygBlock } from './wysiwyg-editor.component';

describe('WysiwygEditorComponent (H1-H3, párrafos, reorden y subida de imagen)', () => {
  let fixture: ComponentFixture<WysiwygEditorComponent>;
  let component: WysiwygEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WysiwygEditorComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(WysiwygEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('initialBlocks', []);
    fixture.detectChanges();
  });

  it('debe crearse', () => {
    expect(component).toBeTruthy();
  });

  it('arranca vacío y muestra el mensaje de canvas vacío', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(component.blocks().length).toBe(0);
    expect(el.querySelector('[data-testid="wysiwyg-empty"]')).toBeTruthy();
  });

  it('debe añadir un bloque H1, H2 y H3', () => {
    component.addBlock('h1');
    component.addBlock('h2');
    component.addBlock('h3');
    fixture.detectChanges();

    const blocks = component.blocks();
    expect(blocks.length).toBe(3);
    expect(blocks[0].type).toBe('h1');
    expect(blocks[1].type).toBe('h2');
    expect(blocks[2].type).toBe('h3');

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('[data-testid="block-h1"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="block-h2"]')).toBeTruthy();
    expect(el.querySelector('[data-testid="block-h3"]')).toBeTruthy();
  });

  it('debe añadir un párrafo con contenido por defecto', () => {
    component.addBlock('paragraph');
    const [b] = component.blocks();
    expect(b.type).toBe('paragraph');
    expect(b.content).toContain('Escribe');
  });

  it('debe actualizar el contenido de un bloque', () => {
    component.addBlock('h1');
    const id = component.blocks()[0].id;
    component.updateContent(id, 'Título personalizado');
    expect(component.blocks()[0].content).toBe('Título personalizado');
  });

  it('debe eliminar un bloque', () => {
    component.addBlock('paragraph');
    const id = component.blocks()[0].id;
    component.removeBlock(id);
    expect(component.blocks().length).toBe(0);
  });

  it('debe reordenar bloques (moveItemInArray vía onDrop)', () => {
    component.addBlock('h1');
    component.addBlock('paragraph');
    component.addBlock('h2');

    // Mover el último al principio
    component.onDrop({ previousIndex: 2, currentIndex: 0 } as any);

    const types = component.blocks().map(b => b.type);
    expect(types).toEqual(['h2', 'h1', 'paragraph']);
  });

  it('debe emitir contentChange en cada mutación', () => {
    const emissions: WysiwygBlock[][] = [];
    component.contentChange.subscribe(v => emissions.push(v));

    component.addBlock('h1');
    component.updateContent(component.blocks()[0].id, 'Editado');
    component.removeBlock(component.blocks()[0].id);

    expect(emissions.length).toBe(3);
    expect(emissions[0][0].type).toBe('h1');
    expect(emissions[1][0].content).toBe('Editado');
    expect(emissions[2].length).toBe(0);
  });

  it('debe subir una imagen vía FileReader y crear un bloque image', (done) => {
    const file = new File(['dummy'], 'foto.png', { type: 'image/png' });
    const fakeEvent = { target: { files: [file], value: '' } } as unknown as Event;

    component.contentChange.subscribe(blocks => {
      if (blocks.length === 1 && blocks[0].type === 'image') {
        expect(blocks[0].content.startsWith('data:image/')).toBeTrue();
        expect(blocks[0].alt).toBe('foto.png');
        done();
      }
    });

    component.onFileSelected(fakeEvent);
  });

  it('debe ignorar archivos que no son imagen', () => {
    const file = new File(['hola'], 'notas.txt', { type: 'text/plain' });
    const fakeEvent = { target: { files: [file], value: '' } } as unknown as Event;
    component.onFileSelected(fakeEvent);
    expect(component.blocks().length).toBe(0);
  });
});
