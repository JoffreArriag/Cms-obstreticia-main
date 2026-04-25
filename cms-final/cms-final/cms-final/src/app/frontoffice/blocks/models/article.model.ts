export type ArticleStatus = 'published' | 'draft' | 'archived';

/**
 * Article — unidad de contenido principal del CMS público.
 * Diferente a `Page`: una página es una colección de bloques de layout,
 * un artículo es contenido tipo blog/noticia con un detalle dedicado.
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  summary: string;
  body: string;              // HTML enriquecido
  coverImage?: string;
  author: string;
  status: ArticleStatus;
  publishedAt: Date;
  updatedAt: Date;
  tags?: string[];
}

export interface ArticleFormData {
  title: string;
  slug: string;
  summary: string;
  body: string;
  coverImage?: string;
  author: string;
  status: ArticleStatus;
  tags?: string[];
}
