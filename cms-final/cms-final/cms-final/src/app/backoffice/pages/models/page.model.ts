import { PageBlock } from '../../../frontoffice/blocks/models/block.model';

export type PageStatus = 'published' | 'draft' | 'archived';

export interface Page {
  id: string;
  title: string;
  slug: string;
  status: PageStatus;
  description?: string;
  blocks: PageBlock[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PageFormData {
  title: string;
  slug: string;
  status: PageStatus;
  description?: string;
}
