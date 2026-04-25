// ──────────────────────────────────────────────
// Tipos de bloques disponibles en el CMS
// ──────────────────────────────────────────────

export type BlockType = 'hero' | 'text' | 'image' | 'cards-grid' | 'cta';

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

// ── Unión discriminada ────────────────────────
export type PageBlock = HeroBlock | TextBlock | ImageBlock | CardsGridBlock | CtaBlock;
