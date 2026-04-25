import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HeroBlock } from '../models/block.model';

@Component({
  selector: 'app-hero-block',
  imports: [RouterLink],
  templateUrl: './hero-block.component.html',
  styleUrl: './hero-block.component.scss'
})
export class HeroBlockComponent {
  block = input.required<HeroBlock>();
}
