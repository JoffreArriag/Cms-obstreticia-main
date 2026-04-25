import { Injectable, signal, computed, effect } from '@angular/core';
import { Article, ArticleFormData } from '../../frontoffice/blocks/models/article.model';

const STORAGE_KEY = 'cms_articles_v1';

const MOCK_ARTICLES: Article[] = [
  {
    id: '1',
    title: 'Control prenatal: todo lo que debes saber',
    slug: 'control-prenatal-todo-lo-que-debes-saber',
    summary: 'Una guía completa sobre la importancia del seguimiento médico durante el embarazo.',
    body: '<p>El control prenatal es el conjunto de acciones y procedimientos, sistemáticos y periódicos, destinados a la prevención, diagnóstico y tratamiento de los factores que puedan condicionar la morbi-mortalidad materna y perinatal.</p><h2>Beneficios principales</h2><p>Permite detectar a tiempo complicaciones del embarazo, prevenir enfermedades en el bebé, y preparar a la madre para el parto con información confiable.</p><h2>Frecuencia recomendada</h2><p>En embarazos de bajo riesgo se recomienda al menos 8 controles durante toda la gestación, con mayor frecuencia en el último trimestre.</p>',
    coverImage: 'https://placehold.co/1200x600/1e5fa8/ffffff?text=Control+Prenatal',
    author: 'Dra. María Elena Rivera',
    status: 'published',
    publishedAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-03-15'),
    tags: ['embarazo', 'prenatal', 'salud']
  },
  {
    id: '2',
    title: 'Ecografías durante el embarazo: tipos y momentos clave',
    slug: 'ecografias-durante-el-embarazo',
    summary: 'Conoce los distintos tipos de ecografía obstétrica y en qué momento realizarlas.',
    body: '<p>La ecografía obstétrica es una herramienta fundamental para monitorear el desarrollo del bebé y detectar posibles anomalías.</p><h2>Tipos principales</h2><p>Existen ecografías de primer trimestre, morfológicas de segundo trimestre, y de crecimiento en el tercer trimestre. Cada una tiene objetivos específicos.</p><h2>Cuándo realizarlas</h2><p>Se recomienda la primera ecografía entre las semanas 11 y 14, la morfológica entre la 20 y 22, y la de crecimiento entre la 32 y 36.</p>',
    coverImage: 'https://placehold.co/1200x600/5cb8b2/ffffff?text=Ecografias',
    author: 'Dr. Carlos Mendoza',
    status: 'published',
    publishedAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-22'),
    tags: ['ecografia', 'diagnostico']
  },
  {
    id: '3',
    title: 'Parto humanizado: una experiencia respetada',
    slug: 'parto-humanizado-experiencia-respetada',
    summary: 'El modelo de atención que pone a la madre y su bebé en el centro del proceso.',
    body: '<p>El parto humanizado es un enfoque de atención que respeta los tiempos biológicos del parto, las decisiones de la madre y promueve el vínculo inmediato con el recién nacido.</p><h2>Principios fundamentales</h2><p>Incluye el acompañamiento continuo, el respeto a la fisiología del parto, la libertad de movimiento y posición, y el contacto piel con piel inmediato.</p>',
    coverImage: 'https://placehold.co/1200x600/1a2d4a/ffffff?text=Parto+Humanizado',
    author: 'Dra. Ana Paredes',
    status: 'published',
    publishedAt: new Date('2026-04-01'),
    updatedAt: new Date('2026-04-01'),
    tags: ['parto', 'maternidad']
  }
];

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  private _articles = signal<Article[]>(this.loadFromStorage());

  /** Todos los artículos, incluyendo drafts (uso del backoffice). */
  readonly articles = this._articles.asReadonly();

  /** Solo artículos publicados, para el frontoffice público. */
  readonly publishedArticles = computed(() =>
    this._articles().filter(a => a.status === 'published')
  );

  constructor() {
    // Persistencia automática en cada cambio
    effect(() => {
      this.saveToStorage(this._articles());
    });
  }

  getById(id: string) {
    return computed(() => this._articles().find(a => a.id === id) ?? null);
  }

  getBySlug(slug: string) {
    return computed(() => this._articles().find(a => a.slug === slug) ?? null);
  }

  create(data: ArticleFormData): Article {
    const now = new Date();
    const article: Article = {
      id: Date.now().toString(),
      ...data,
      publishedAt: now,
      updatedAt: now
    };
    this._articles.update(arr => [article, ...arr]);
    return article;
  }

  update(id: string, data: Partial<ArticleFormData>): void {
    this._articles.update(arr =>
      arr.map(a => (a.id === id ? { ...a, ...data, updatedAt: new Date() } : a))
    );
  }

  delete(id: string): void {
    this._articles.update(arr => arr.filter(a => a.id !== id));
  }

  slugify(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }

  // ── Persistencia ──────────────────────────────────────

  private loadFromStorage(): Article[] {
    if (typeof localStorage === 'undefined') return [...MOCK_ARTICLES];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...MOCK_ARTICLES];
      const parsed = JSON.parse(raw) as Article[];
      // Revivir fechas
      return parsed.map(a => ({
        ...a,
        publishedAt: new Date(a.publishedAt),
        updatedAt: new Date(a.updatedAt)
      }));
    } catch {
      return [...MOCK_ARTICLES];
    }
  }

  private saveToStorage(articles: Article[]): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(articles));
    } catch {
      // silent fail (quota exceeded, etc.)
    }
  }
}
