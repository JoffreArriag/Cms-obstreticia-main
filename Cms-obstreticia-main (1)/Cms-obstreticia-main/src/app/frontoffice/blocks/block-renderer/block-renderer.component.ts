import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Block, HeroBlockData, CardsGridBlockData, GalleryBlockData } from '../../core/models/block.model';
import { HeroBlockComponent } from '../hero-block/hero-block.component';
import { CardsGridComponent } from '../cards-grid/cards-grid.component';
import { GalleryGridComponent } from '../gallery-grid/gallery-grid.component';

@Component({
  selector: 'app-block-renderer',
  standalone: true,
  imports: [
    CommonModule,
    HeroBlockComponent,
    CardsGridComponent,
    GalleryGridComponent,
  ],
  templateUrl: './block-renderer.component.html',
})
export class BlockRendererComponent implements OnChanges {
  @Input() block!: Block;

  heroData!: HeroBlockData;
  cardsData!: CardsGridBlockData;
  galleryData!: GalleryBlockData;

  ngOnChanges(): void {
    if (this.block.type === 'hero')         this.heroData    = this.block.data as HeroBlockData;
    if (this.block.type === 'cards-grid')   this.cardsData   = this.block.data as CardsGridBlockData;
    if (this.block.type === 'gallery-grid') this.galleryData = this.block.data as GalleryBlockData;
  }
}
