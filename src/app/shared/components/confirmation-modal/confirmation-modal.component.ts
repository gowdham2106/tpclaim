import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, IconComponent],
  template: `
    <div class="csp-modal-backdrop" *ngIf="isOpen" (click)="onCancel()">
      <div class="csp-modal" (click)="$event.stopPropagation()">
        <div class="csp-card-header">
          <div style="display:flex; align-items:center; gap:0.6rem;">
            <app-icon 
              [name]="icon" 
              [size]="20"
              [style.color]="isDanger ? 'var(--csp-error)' : 'var(--csp-ember)'"
            ></app-icon>
            <h3 style="margin:0; font-size:1.15rem;">{{ title }}</h3>
          </div>
          <button (click)="onCancel()" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none; padding:4px;">
            <app-icon name="x" [size]="16"></app-icon>
          </button>
        </div>
        <div class="csp-card-body">
          <p style="color:var(--csp-warm-grey); font-size:0.92rem; margin-bottom:1rem; line-height:1.5;">
            {{ message }}
          </p>
          <ng-content></ng-content>
        </div>
        <div class="csp-card-footer">
          <button type="button" class="csp-btn csp-btn-secondary" (click)="onCancel()">
            {{ cancelText }}
          </button>
          <button 
            type="button" 
            class="csp-btn" 
            [ngClass]="isDanger ? 'csp-btn-danger' : 'csp-btn-primary'" 
            (click)="onConfirm()"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  `
})
export class ConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirm Action';
  @Input() message = 'Are you sure you want to proceed?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() isDanger = false;
  @Input() icon = 'alert-triangle';

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    this.confirm.emit();
  }

  onCancel() {
    this.cancel.emit();
  }
}
