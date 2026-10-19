import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-priority-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="csp-badge" [ngClass]="badgeClass">
      {{ priority }}
    </span>
  `,
  styles: [`
    .priority-urgent {
      background-color: var(--csp-error-subtle);
      color: var(--csp-error);
      border: 1px solid rgba(185, 56, 38, 0.3);
    }
    .priority-high {
      background-color: var(--csp-ember-subtle);
      color: var(--csp-ember);
      border: 1px solid rgba(232, 93, 50, 0.3);
    }
    .priority-medium {
      background-color: rgba(240, 216, 202, 0.5);
      color: var(--csp-terracotta);
      border: 1px solid var(--csp-clay-dark);
    }
    .priority-low {
      background-color: rgba(37, 35, 33, 0.05);
      color: var(--csp-warm-grey);
      border: 1px solid var(--csp-border);
    }
  `]
})
export class PriorityBadgeComponent {
  @Input() priority: string = 'Medium';

  get badgeClass(): string {
    switch (this.priority) {
      case 'Urgent': return 'priority-urgent';
      case 'High': return 'priority-high';
      case 'Medium': return 'priority-medium';
      case 'Low': return 'priority-low';
      default: return 'priority-medium';
    }
  }
}
