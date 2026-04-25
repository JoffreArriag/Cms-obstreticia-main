import { Article } from './article.model';

export type BlockType = 'hero' | 'text' | 'image' | 'cards-grid' | 'cta' | 'gallery-grid';

export interface BaseBlock {
  id: string;
  type: BlockType;
  visible: boolean;
  order: number;
}

// ── Hero ──────────────────────────────────────
export interface HeroBlock extends BaseBlock {
  type: 'hero';
  data: {
    title: string;
    subtitle?: string;
    backgroundImage?: string;
    ctaLabel?: string;
    ctaRoute?: string;
    overlay?: boolean;
  };
}

// ── Text ──────────────────────────────────────
export interface TextBlock extends BaseBlock {
  type: 'text';
  data: {
    title?: string;
    html: string;
    align?: 'left' | 'center' | 'right';
  };
}

// ── Image ─────────────────────────────────────
export interface ImageBlock extends BaseBlock {
  type: 'image';
  data: {
    src: string;
    alt: string;
    caption?: string;
    fullWidth?: boolean;
  };
}

// ── Cards grid ────────────────────────────────
export interface CardItem {
  title: string;
  description: string;
  icon?: string;
  linkLabel?: string;
  linkRoute?: string;
}

export interface CardsGridBlock extends BaseBlock {
  type: 'cards-grid';
  data: {
    title?: string;
    subtitle?: string;
    columns?: 2 | 3 | 4;
    cards: CardItem[];
  };
}

// ── CTA ───────────────────────────────────────
export interface CtaBlock extends BaseBlock {
  type: 'cta';
  data: {
    title: string;
    description?: string;
    primaryLabel: string;
    primaryRoute: string;
    secondaryLabel?: string;
    secondaryRoute?: string;
    variant?: 'primary' | 'accent';
  };
}

export interface GalleryBlock extends BaseBlock {
  type: 'gallery-grid';
  data: {
    title: string;
    items: GalleryItem[];
  };
}

// ── Unión discriminada ────────────────────────
export type PageBlock =
  | HeroBlock
  | TextBlock
  | ImageBlock
  | CardsGridBlock
  | CtaBlock
  | GalleryBlock;

export interface Block {
  id: string;
  type: BlockType;
  data:
    | HeroBlockData
    | CardsGridBlockData
    | GalleryBlockData
    | TextBlockData
    | ImageBlockData
    | CtaBlockData;
}

export interface HeroBlockData {
  article: Article;
  tag?: string;
}

export interface CardsGridBlockData {
  title: string;
  articles: Article[];
}

export interface GalleryBlockData {
  title: string;
  items: GalleryItem[];
}

export interface GalleryItem {
  id: string;
  label: string;
  emoji: string;
  color: 'green' | 'pink' | 'blue' | 'amber';
}

export interface TextBlockData {
  content: string;
}

export interface ImageBlockData {
  src: string;
  alt: string;
  caption?: string;
}

export interface CtaBlockData {
  title: string;
  description: string;
  buttonText: string;
  buttonUrl: string;
}
