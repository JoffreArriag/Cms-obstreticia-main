import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CmsService } from '../../core/services/cms.service';
import { Article, ArticleCategory } from '../../core/models/article.model';
import { ArticleCardComponent } from '../../shared/components/article-card/article-card.component';

@Component({
  selector: 'app-category',
  standalone: true,
  imports: [CommonModule, ArticleCardComponent, RouterLink],
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.scss'],
})
export class CategoryComponent implements OnInit {
  articles = signal<Article[]>([]);
  categoryName = signal('');
  loading = signal(true);

  private readonly categoryTitles: Record<ArticleCategory, string> = {
    'investigacion': 'Investigación',
    'tecnologia': 'Tecnología',
    'cultura': 'Cultura',
    'eventos': 'Eventos',
    'proyectos': 'Proyectos'
  };

  constructor(
    private route: ActivatedRoute,
    private cms: CmsService,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const cat = params.get('slug') as ArticleCategory;
      this.categoryName.set(cat);
      this.loading.set(true);
      
      this.cms.getArticles(cat).subscribe({
        next: (articles) => {
          this.articles.set(articles);
          this.loading.set(false);
        },
        error: () => {
          this.articles.set([]);
          this.loading.set(false);
        }
      });
    });
  }

  getCategoryTitle(): string {
    const cat = this.categoryName() as ArticleCategory;
    return this.categoryTitles[cat] || cat;
  }
}