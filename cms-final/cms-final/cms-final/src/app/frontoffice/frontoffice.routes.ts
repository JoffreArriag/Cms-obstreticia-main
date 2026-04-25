import { Routes } from '@angular/router';
import { gatekeeperGuard } from '../core/guards/gatekeeper.guard';

export const frontofficeRoutes: Routes = [
  {
    path: 'bienvenida',
    loadComponent: () =>
      import('./gatekeeper/gatekeeper.component').then(m => m.GatekeeperComponent)
  },
  {
    path: 'articulo/:slug',
    canActivate: [gatekeeperGuard],
    loadComponent: () =>
      import('./article-detail/article-detail.component').then(m => m.ArticleDetailComponent)
  },
  {
    path: '',
    canActivate: [gatekeeperGuard],
    loadComponent: () =>
      import('./home/home.component').then(m => m.HomeComponent)
  }
];
