import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="csp-toast-container" *ngIf="toastService.toasts().length > 0">
      <div 
        *ngFor="let toast of toastService.toasts()" 
        class="csp-toast" 
        [ngClass]="toast.type"
      >
        <app-icon 
          [name]="getIconName(toast.type)" 
          [size]="18"
          [class]="getIconColor(toast.type)"
        ></app-icon>
        <div style="flex: 1;">
          <div *ngIf="toast.title" style="font-weight: 700; margin-bottom: 2px;">{{ toast.title }}</div>
          <div style="font-size: 0.84rem; opacity: 0.95;">{{ toast.message }}</div>
        </div>
        <button 
          (click)="toastService.dismiss(toast.id)" 
          style="background:none; border:none; color:var(--csp-warm-grey-light); cursor:pointer; padding:4px;"
        >
          <app-icon name="x" [size]="14"></app-icon>
        </button>
      </div>
    </div>
  `
})
export class ToastContainerComponent {
  toastService = inject(ToastService);

  getIconName(type: string): string {
    switch (type) {
      case 'success': return 'check-circle';
      case 'error': return 'x-circle';
      case 'warning': return 'alert-triangle';
      default: return 'alert-circle';
    }
  }

  getIconColor(type: string): string {
    switch (type) {
      case 'success': return 'color-sage';
      case 'error': return 'color-error';
      case 'warning': return 'color-terracotta';
      default: return 'color-ember';
    }
  }
}
