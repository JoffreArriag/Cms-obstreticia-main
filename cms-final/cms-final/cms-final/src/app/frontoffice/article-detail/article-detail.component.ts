import { Component, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ArticlesService } from '../../core/services/articles.service';

@Component({
  selector: 'app-article-detail',
  imports: [RouterLink, DatePipe],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss'
})
export class ArticleDetailComponent {
  private route    = inject(ActivatedRoute);
  private service  = inject(ArticlesService);

  slug = signal<string>('');
  article = computed(() => this.service.getBySlug(this.slug())());

  ngOnInit(): void {
    const s = this.route.snapshot.paramMap.get('slug') ?? '';
    this.slug.set(s);
  }
}
