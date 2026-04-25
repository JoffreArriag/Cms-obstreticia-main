import { Routes } from '@angular/router';

export const articlesRoutes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./articles-list/articles-list.component').then(m => m.ArticlesListComponent)
  },
  {
    path: 'new',
    loadComponent: () =>
      import('./article-editor/article-editor.component').then(m => m.ArticleEditorComponent)
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./article-editor/article-editor.component').then(m => m.ArticleEditorComponent)
  }
];
