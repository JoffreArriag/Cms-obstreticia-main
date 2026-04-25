import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CmsService } from '../../core/services/cms.service';
import { Article } from '../../core/models/article.model';
import { CategoryBadgeComponent } from '../../shared/components/category-badge/category-badge.component';
import { ReadingTimePipe } from '../../core/pipes/reading-time.pipe';
import { StatusBadgeComponent } from '../../../backoffice/shared/components/status-badge/status-badge';
import { LoadingSpinnerComponent } from '../../shared/components/loading-spinner/loading-spinner';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    CategoryBadgeComponent,
    ReadingTimePipe,
    StatusBadgeComponent,
    LoadingSpinnerComponent,
  ],
  templateUrl: './article-detail.component.html',
  styleUrls: ['./article-detail.component.scss'],
})
export class ArticleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private cms = inject(CmsService);
  article = signal<Article | undefined>(undefined);
  loading = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.cms.getArticleById(id).subscribe((article) => {
      this.article.set(article);
      this.loading.set(false);
    });
  }
}
