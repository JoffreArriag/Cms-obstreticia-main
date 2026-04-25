import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

interface Categoria {
  slug: string;
  nombre: string;
}

@Component({
  selector: 'app-barra-categorias',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './barra-categorias.html',
  styleUrls: ['./barra-categorias.scss']
})
export class BarraCategoriasComponent implements OnInit {
  categorias: Categoria[] = [
    { slug: 'investigacion', nombre: 'Investigación' },
    { slug: 'tecnologia', nombre: 'Tecnología' },
    { slug: 'cultura', nombre: 'Cultura' },
    { slug: 'eventos', nombre: 'Eventos' },
    { slug: 'proyectos', nombre: 'Proyectos' }
  ];

  categoriaActiva: string | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.actualizarCategoriaActiva());
    this.actualizarCategoriaActiva();
  }

  private actualizarCategoriaActiva(): void {
    const slug = this.route.snapshot.firstChild?.params['slug'];
    this.categoriaActiva = slug || null;
  }

  navegarACategoria(slug: string): void {
    this.router.navigate(['/categoria', slug]);
  }

  navegarATodos(): void {
    this.router.navigate(['/']);
  }
}