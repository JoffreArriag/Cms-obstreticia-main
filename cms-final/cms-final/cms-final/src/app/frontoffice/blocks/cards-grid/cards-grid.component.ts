import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardsGridBlock } from '../models/block.model';

@Component({
  selector: 'app-cards-grid',
  imports: [RouterLink],
  templateUrl: './cards-grid.component.html',
  styleUrl: './cards-grid.component.scss'
})
export class CardsGridComponent {
  block = input.required<CardsGridBlock>();
}
