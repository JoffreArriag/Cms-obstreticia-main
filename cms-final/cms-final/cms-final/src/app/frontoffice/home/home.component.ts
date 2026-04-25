import { Component, inject, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { BlockRendererComponent } from '../blocks/block-renderer/block-renderer.component';
import { PageBlock } from '../blocks/models/block.model';
import { ArticlesService } from '../../core/services/articles.service';

@Component({
  selector: 'app-home',
  imports: [BlockRendererComponent, RouterLink, DatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  private articlesService = inject(ArticlesService);

  articles = computed(() => this.articlesService.publishedArticles());

  blocks: PageBlock[] = [
    {
      id: 'hero-1',
      type: 'hero',
      visible: true,
      order: 1,
      data: {
        title: 'Clínica de Obstetricia y Ginecología',
        subtitle: 'Cuidamos de ti y de tu bebé con la más alta tecnología y calidez humana.',
        ctaLabel: 'Agendar consulta',
        ctaRoute: '/contacto',
        overlay: false
      }
    },
    {
      id: 'cards-1',
      type: 'cards-grid',
      visible: true,
      order: 2,
      data: {
        title: 'Nuestros servicios',
        subtitle: 'Atención integral para cada etapa de tu maternidad.',
        columns: 3,
        cards: [
          { title: 'Control prenatal', description: 'Seguimiento médico completo durante todo tu embarazo.' },
          { title: 'Ecografías',       description: 'Imágenes de alta resolución para monitorear el desarrollo de tu bebé.' },
          { title: 'Parto humanizado', description: 'Acompañamiento respetuoso en el momento más importante de tu vida.' }
        ]
      }
    },
    {
      id: 'cta-1',
      type: 'cta',
      visible: true,
      order: 3,
      data: {
        title: '¿Tienes dudas? Estamos aquí para ayudarte.',
        description: 'Nuestro equipo de especialistas está disponible para resolver todas tus consultas.',
        primaryLabel: 'Contáctanos',
        primaryRoute: '/contacto',
        secondaryLabel: 'Ver más servicios',
        secondaryRoute: '/servicios'
      }
    }
  ];
}
