import { Component, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ArticlesService } from '../../../core/services/articles.service';
import { Article } from '../../../frontoffice/blocks/models/article.model';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';

@Component({
  selector: 'app-articles-list',
  imports: [RouterLink, DatePipe, PageHeaderComponent, StatusBadgeComponent, ModalComponent],
  templateUrl: './articles-list.component.html',
  styleUrl: './articles-list.component.scss'
})
export class ArticlesListComponent {
  private articlesService = inject(ArticlesService);

  articles         = this.articlesService.articles;
  searchQuery      = signal('');
  articleToDelete  = signal<Article | null>(null);
  deleteLoading    = signal(false);

  filteredArticles = computed(() => {
    const q = this.searchQuery().toLowerCase().trim();
    if (!q) return this.articles();
    return this.articles().filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.slug.toLowerCase().includes(q) ||
      a.author.toLowerCase().includes(q)
    );
  });

  confirmDelete(article: Article): void {
    this.articleToDelete.set(article);
  }

  cancelDelete(): void {
    this.articleToDelete.set(null);
  }

  deleteArticle(): void {
    const a = this.articleToDelete();
    if (!a) return;
    this.deleteLoading.set(true);
    setTimeout(() => {
      this.articlesService.delete(a.id);
      this.articleToDelete.set(null);
      this.deleteLoading.set(false);
    }, 500);
  }
}
