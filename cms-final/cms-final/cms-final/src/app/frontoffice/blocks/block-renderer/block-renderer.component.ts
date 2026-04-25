import { Component, input } from '@angular/core';
import { PageBlock } from '../models/block.model';
import { HeroBlockComponent } from '../hero-block/hero-block.component';
import { TextBlockComponent } from '../text-block/text-block.component';
import { ImageBlockComponent } from '../image-block/image-block.component';
import { CardsGridComponent } from '../cards-grid/cards-grid.component';
import { CtaBlockComponent } from '../cta-block/cta-block.component';

@Component({
  selector: 'app-block-renderer',
  imports: [
    HeroBlockComponent,
    TextBlockComponent,
    ImageBlockComponent,
    CardsGridComponent,
    CtaBlockComponent
  ],
  template: `
    @for (block of blocks(); track block.id) {
      @if (block.visible) {
        @switch (block.type) {
          @case ('hero') {
            <app-hero-block [block]="$any(block)" />
          }
          @case ('text') {
            <app-text-block [block]="$any(block)" />
          }
          @case ('image') {
            <app-image-block [block]="$any(block)" />
          }
          @case ('cards-grid') {
            <app-cards-grid [block]="$any(block)" />
          }
          @case ('cta') {
            <app-cta-block [block]="$any(block)" />
          }
        }
      }
    }
  `
})
export class BlockRendererComponent {
  blocks = input.required<PageBlock[]>();
}
