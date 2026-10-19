import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IntimationWizardService } from '../intimation-wizard.service';

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  badge: string;
}

@Component({
  selector: 'app-role-selection',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Progress Stepper (Step 1 of 7) -->
        <div class="csp-stepper">
          <div class="csp-step-item active">
            <div class="csp-step-circle">1</div>
            <div class="csp-step-label">Role</div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">2</div>
            <div class="csp-step-label">Incident</div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">3</div>
            <div class="csp-step-label">Loss Type</div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">4</div>
            <div class="csp-step-label">Claimant</div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">5</div>
            <div class="csp-step-label">Vehicles</div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">6</div>
            <div class="csp-step-label">Documents</div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">7</div>
            <div class="csp-step-label">Review</div>
          </div>
        </div>

        <!-- Role Selection Card -->
        <div class="csp-card wizard-card">
          <div class="wizard-header">
            <div class="step-indicator">Step 1 of 7</div>
            <h2 class="wizard-title">Who is Reporting this Accident?</h2>
            <p class="wizard-subtitle">
              Select the capacity in which you are intimating this third-party claim. This ensures we collect the appropriate legal and medical information.
            </p>
          </div>

          <div class="roles-grid">
            <div 
              *ngFor="let role of roles" 
              class="role-card" 
              [class.selected]="selectedRole === role.title"
              (click)="selectRole(role.title)"
            >
              <div class="role-icon-box">
                <app-icon [name]="role.icon" [size]="24"></app-icon>
              </div>
              <div class="role-details">
                <div class="role-top-row">
                  <h3 class="role-title">{{ role.title }}</h3>
                  <span class="role-badge">{{ role.badge }}</span>
                </div>
                <p class="role-desc">{{ role.description }}</p>
              </div>
              <div class="select-indicator">
                <div class="radio-circle">
                  <div class="radio-dot" *ngIf="selectedRole === role.title"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="wizard-footer">
            <a routerLink="/" class="csp-btn csp-btn-secondary">
              <app-icon name="arrow-left" [size]="16"></app-icon>
              Cancel
            </a>
            <button (click)="onContinue()" class="csp-btn csp-btn-primary csp-btn-lg">
              <span>Continue to Incident Details</span>
              <app-icon name="arrow-right" [size]="16"></app-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-page {
      padding: 2.5rem 1rem 4rem;
    }

    .wizard-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .wizard-card {
      padding: 2.5rem;
    }

    .wizard-header {
      margin-bottom: 2rem;
    }

    .step-indicator {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--csp-ember);
      margin-bottom: 0.4rem;
    }

    .wizard-title {
      font-size: 1.75rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin-bottom: 0.5rem;
    }

    .wizard-subtitle {
      color: var(--csp-warm-grey);
      font-size: 0.92rem;
      line-height: 1.55;
    }

    .roles-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2.5rem;
    }

    .role-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      padding: 1.25rem 1.5rem;
      border: 2px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      background: var(--csp-white);
      cursor: pointer;
      transition: var(--csp-transition);
    }

    .role-card:hover {
      border-color: var(--csp-clay-dark);
      background-color: var(--csp-bg-soft);
    }

    .role-card.selected {
      border-color: var(--csp-ember);
      background-color: rgba(232, 93, 50, 0.04);
      box-shadow: 0 0 0 1px var(--csp-ember);
    }

    .role-icon-box {
      width: 48px;
      height: 48px;
      border-radius: var(--csp-radius-sm);
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: var(--csp-transition);
    }

    .role-card.selected .role-icon-box {
      background: var(--csp-ember);
      color: var(--csp-white);
    }

    .role-details {
      flex: 1;
    }

    .role-top-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.25rem;
    }

    .role-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin: 0;
    }

    .role-badge {
      font-size: 0.72rem;
      font-weight: 600;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      padding: 2px 8px;
      border-radius: var(--csp-radius-pill);
      color: var(--csp-warm-grey);
    }

    .role-desc {
      color: var(--csp-warm-grey);
      font-size: 0.85rem;
      line-height: 1.45;
      margin: 0;
    }

    .radio-circle {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      border: 2px solid var(--csp-border-dark);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: var(--csp-transition);
    }

    .role-card.selected .radio-circle {
      border-color: var(--csp-ember);
    }

    .radio-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: var(--csp-ember);
    }

    .wizard-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--csp-border);
      padding-top: 1.5rem;
    }

    @media (max-width: 600px) {
      .wizard-card { padding: 1.5rem; }
      .role-card { padding: 1rem; }
      .role-top-row { flex-direction: column; align-items: flex-start; gap: 0.25rem; }
    }
  `]
})
export class RoleSelectionComponent {
  private wizard = inject(IntimationWizardService);
  private router = inject(Router);

  selectedRole = this.wizard.draft().claimantRole;

  roles: RoleOption[] = [
    {
      id: 'injured',
      title: 'Third-party injured person',
      description: 'You were a pedestrian, cyclist, passenger, or rider injured due to the operation of the insured motor vehicle.',
      icon: 'user',
      badge: 'Personal Injury'
    },
    {
      id: 'property',
      title: 'Vehicle or property owner',
      description: 'Your motor vehicle, residential wall, storefront, or other physical property was damaged by the insured vehicle.',
      icon: 'car',
      badge: 'Property Damage'
    },
    {
      id: 'deceased_rep',
      title: 'Representative of a deceased victim',
      description: 'You are the spouse, parent, child, or legal dependent reporting on behalf of a victim who passed away.',
      icon: 'scale',
      badge: 'Fatal Casualty'
    },
    {
      id: 'legal_rep',
      title: 'Legal representative',
      description: 'You are an advocate, attorney, or court-appointed guardian acting on behalf of the affected party.',
      icon: 'file-text',
      badge: 'Authorized Counsel'
    },
    {
      id: 'other',
      title: 'Other authorised representative',
      description: 'You hold power of attorney or formal authorization to report on behalf of the claimant.',
      icon: 'shield-check',
      badge: 'Formal Proxy'
    }
  ];

  selectRole(role: string) {
    this.selectedRole = role;
    this.wizard.updateDraft({ claimantRole: role });
  }

  onContinue() {
    this.wizard.updateDraft({ claimantRole: this.selectedRole });
    this.router.navigate(['/public/intimation']);
  }
}
