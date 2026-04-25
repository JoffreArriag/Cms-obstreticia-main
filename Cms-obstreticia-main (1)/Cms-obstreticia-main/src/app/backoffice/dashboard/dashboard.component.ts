import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PageHeaderComponent } from '../shared/components/page-header/page-header.component';

export interface StatCard {
  label: string;
  value: string;
  change: string;
  changeType: 'up' | 'down' | 'neutral';
  icon: string;
  color: string;
}

export interface RecentActivity {
  user: string;
  action: string;
  target: string;
  time: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [DatePipe, PageHeaderComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  today = new Date();

  stats: StatCard[] = [
    { label: 'Páginas publicadas', value: '24',  change: '+3 este mes',  changeType: 'up',      icon: 'pages',   color: 'blue'   },
    { label: 'Catálogos activos',  value: '8',   change: '+1 este mes',  changeType: 'up',      icon: 'catalog', color: 'teal'   },
    { label: 'Usuarios activos',   value: '12',  change: 'Sin cambios',  changeType: 'neutral', icon: 'users',   color: 'purple' },
    { label: 'Archivos multimedia',value: '156', change: '+22 esta semana',changeType: 'up',    icon: 'media',   color: 'orange' },
  ];

  recentActivity: RecentActivity[] = [
    { user: 'Ana García',    action: 'publicó la página',    target: 'Servicios de Obstetricia', time: 'Hace 5 min'  },
    { user: 'Carlos López',  action: 'actualizó el catálogo', target: 'Procedimientos 2025',     time: 'Hace 20 min' },
    { user: 'María Torres',  action: 'subió multimedia a',   target: 'Galería de la clínica',    time: 'Hace 1 hora' },
    { user: 'Admin',         action: 'creó usuario',          target: 'nuevo.editor@clinica.com', time: 'Hace 2 horas'},
    { user: 'Ana García',    action: 'editó la página',       target: 'Contacto',                 time: 'Hace 3 horas'},
  ];
}
