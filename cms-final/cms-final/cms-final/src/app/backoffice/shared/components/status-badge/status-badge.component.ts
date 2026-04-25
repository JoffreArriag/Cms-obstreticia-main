import { Component, input, computed } from '@angular/core';

export type BadgeStatus = 'published' | 'draft' | 'archived' | 'active' | 'inactive';

const STATUS_LABELS: Record<BadgeStatus, string> = {
  published: 'Publicado',
  draft:     'Borrador',
  archived:  'Archivado',
  active:    'Activo',
  inactive:  'Inactivo'
};

@Component({
  selector: 'app-status-badge',
  imports: [],
  template: `
    <span class="badge badge--{{ status() }}">{{ label() }}</span>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      padding: .2rem .625rem;
      border-radius: 999px;
      font-size: .75rem;
      font-weight: 600;
      line-height: 1.4;
      white-space: nowrap;

      &--published { background: #dcfce7; color: #15803d; }
      &--draft     { background: #fef9c3; color: #a16207; }
      &--archived  { background: #f1f5f9; color: #64748b; }
      &--active    { background: #dbeafe; color: #1d4ed8; }
      &--inactive  { background: #fee2e2; color: #dc2626; }
    }
  `]
})
export class StatusBadgeComponent {
  status = input.required<BadgeStatus>();
  label  = computed(() => STATUS_LABELS[this.status()] ?? this.status());
}
