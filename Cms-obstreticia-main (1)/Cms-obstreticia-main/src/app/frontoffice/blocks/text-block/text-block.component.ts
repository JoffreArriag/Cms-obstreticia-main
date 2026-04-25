import { Component, input } from '@angular/core';
import { TextBlock } from '../../core/models/block.model';

@Component({
  selector: 'app-text-block',
  imports: [],
  template: `
    <section class="text-block text-block--{{ block().data.align ?? 'left' }}">
      @if (block().data.title) {
        <h2 class="text-block__title">{{ block().data.title }}</h2>
      }
      <div class="text-block__body" [innerHTML]="block().data.html"></div>
    </section>
  `,
  styles: [
    `
      .text-block {
        padding: 3rem 2rem;
        max-width: 860px;
        margin: 0 auto;

        &--center {
          text-align: center;
        }
        &--right {
          text-align: right;
        }

        &__title {
          font-size: 1.875rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        &__body {
          font-size: 1rem;
          line-height: 1.8;
          color: #334155;
        }
      }
    `,
  ],
})
export class TextBlockComponent {
  block = input.required<TextBlock>();
}
