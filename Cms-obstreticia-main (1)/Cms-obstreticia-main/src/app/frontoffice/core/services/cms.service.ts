import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Article, ArticleCategory } from '../models/article.model';
import { Page } from '../models/page.model';

@Injectable({ providedIn: 'root' })
export class CmsService {

  private mockArticles: Article[] = [
    {
      id: '1',
      title: 'Nuevos avances en inteligencia artificial aplicada a la medicina.',
      category: 'investigacion',
      date: '8 Mar 2026',
      readingTime: 5,
      emoji: '🔬',
      excerpt: 'Investigadores de la facultad de medicina presentan resultados de su estudio sobre diagnóstico asistido por IA.',
      featured: false,
    },
    {
      id: '2',
      title: 'Exposición fotográfica en el campus conmemora los 150 años.',
      category: 'cultura',
      date: '5 Mar 2026',
      readingTime: 3,
      emoji: '🏛️',
      excerpt: 'Una muestra de 200 fotografías históricas recorre la historia de la universidad desde su fundación.',
      featured: false,
    },
    {
      id: '3',
      title: 'Sistema CMS Web oficialmente por la Facultad de CCMM.',
      category: 'tecnologia',
      date: '1 Mar 2026',
      readingTime: 4,
      emoji: '🚀',
      excerpt: 'El nuevo portal centraliza la información académica de todas las facultades en una sola plataforma.',
      featured: false,
    },
    {
      id: '4',
      title: 'Portal del Conocimiento Académico de la Universidad',
      category: 'tecnologia',
      date: '10 Mar 2026',
      readingTime: 6,
      emoji: '🎓',
      excerpt: 'Accede a investigaciones, eventos y noticias de todas las facultades en un solo lugar.',
      featured: true,
    },
  ];

  getHomePage(): Observable<Page> {
    const page: Page = {
      id: 'home',
      slug: '/',
      title: 'Inicio',
      blocks: [
        {
          id: 'b1',
          type: 'hero',
          data: {
            article: this.mockArticles.find(a => a.featured)!,
            tag: 'Publicación Destacada',
          },
        },
        {
          id: 'b2',
          type: 'cards-grid',
          data: {
            title: 'Publicaciones Recientes',
            articles: this.mockArticles.filter(a => !a.featured),
          },
        },
        {
          id: 'b3',
          type: 'gallery-grid',
          data: {
            title: 'Galería de Contenidos',
            items: [
              { id: 'g1', label: 'Ciencias de la Vida', emoji: '🧬', color: 'green' },
              { id: 'g2', label: 'Medio Ambiente', emoji: '🌱', color: 'pink' },
              { id: 'g3', label: 'Datos y Estadística', emoji: '📊', color: 'blue' },
            ],
          },
        },
      ],
    };
    return of(page);
  }

  getArticles(category?: ArticleCategory): Observable<Article[]> {
    const result = category
      ? this.mockArticles.filter(a => a.category === category)
      : this.mockArticles;
    return of(result);
  }

  getArticleById(id: string): Observable<Article | undefined> {
    return of(this.mockArticles.find(a => a.id === id));
  }
}
