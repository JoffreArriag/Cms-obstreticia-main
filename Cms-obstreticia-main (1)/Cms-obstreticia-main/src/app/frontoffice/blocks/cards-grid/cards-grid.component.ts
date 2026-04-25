import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardsGridBlockData } from '../../core/models/block.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-cards-grid',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent],
  templateUrl: './cards-grid.component.html',
  styleUrls: ['./cards-grid.component.scss'],
})
export class CardsGridComponent {
  @Input() data!: CardsGridBlockData;
}
