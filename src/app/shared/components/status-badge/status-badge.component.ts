import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="csp-badge" [ngClass]="badgeClass">
      <span class="badge-dot" [ngClass]="dotClass"></span>
      {{ status }}
    </span>
  `,
  styles: [`
    .badge-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      display: inline-block;
      margin-right: 4px;
    }
    .dot-ember { background-color: var(--csp-ember); }
    .dot-sage { background-color: var(--csp-sage); }
    .dot-clay { background-color: var(--csp-terracotta); }
    .dot-charcoal { background-color: var(--csp-charcoal); }
    .dot-error { background-color: var(--csp-error); }
  `]
})
export class StatusBadgeComponent {
  @Input() status: string = '';

  get badgeClass(): string {
    const s = (this.status || '').toLowerCase();
    if (s.includes('closed') || s.includes('completed') || s.includes('verified') || s.includes('approved') || s.includes('settled')) {
      return 'csp-badge-sage';
    }
    if (s.includes('rejected') || s.includes('breach') || s.includes('failed') || s.includes('overdue')) {
      return 'csp-badge-error';
    }
    if (s.includes('awaiting') || s.includes('request') || s.includes('review') || s.includes('progress') || s.includes('pending')) {
      return 'csp-badge-ember';
    }
    if (s.includes('legal') || s.includes('mact') || s.includes('assessment')) {
      return 'csp-badge-terracotta';
    }
    return 'csp-badge-clay';
  }

  get dotClass(): string {
    const s = (this.status || '').toLowerCase();
    if (s.includes('closed') || s.includes('completed') || s.includes('verified') || s.includes('approved') || s.includes('settled')) {
      return 'dot-sage';
    }
    if (s.includes('rejected') || s.includes('failed') || s.includes('overdue')) {
      return 'dot-error';
    }
    if (s.includes('awaiting') || s.includes('request') || s.includes('review') || s.includes('progress') || s.includes('pending')) {
      return 'dot-ember';
    }
    if (s.includes('legal') || s.includes('mact')) {
      return 'dot-clay';
    }
    return 'dot-charcoal';
  }
}
