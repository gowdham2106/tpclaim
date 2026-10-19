import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IntimationWizardService } from '../intimation-wizard.service';
import { LossType } from '../../../core/models/claim.model';

interface LossOption {
  type: LossType;
  title: string;
  description: string;
  icon: string;
  placeholderText: string;
}

@Component({
  selector: 'app-loss-type',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Progress Stepper (Step 3 of 7) -->
        <div class="csp-stepper">
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">Role</div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">Incident</div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item active">
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

        <div class="csp-card wizard-card">
          <div class="wizard-header">
            <div class="step-indicator">Step 3 of 7</div>
            <h2 class="wizard-title">Classification of Loss or Damage</h2>
            <p class="wizard-subtitle">
              Select the primary category of loss. These selections capture factual claims information and do not automatically decide legal liability.
            </p>
          </div>

          <!-- Selectable Loss Cards -->
          <div class="loss-grid">
            <div 
              *ngFor="let opt of lossOptions" 
              class="loss-card" 
              [class.selected]="selectedLossType === opt.type"
              (click)="selectLossType(opt.type)"
            >
              <div class="loss-icon-box">
                <app-icon [name]="opt.icon" [size]="22"></app-icon>
              </div>
              <div class="loss-content">
                <h4 class="loss-title">{{ opt.title }}</h4>
                <p class="loss-desc">{{ opt.description }}</p>
              </div>
              <div class="loss-radio">
                <div class="radio-circle">
                  <div class="radio-dot" *ngIf="selectedLossType === opt.type"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Follow-up Field specific to selected loss type -->
          <div class="follow-up-card">
            <div class="csp-form-group">
              <label class="csp-label">
                Specific Particulars Regarding {{ selectedLossType }}
                <span class="required-dot">*</span>
              </label>
              <textarea 
                rows="3" 
                [(ngModel)]="lossDetails"
                [placeholder]="currentPlaceholder"
                class="csp-textarea"
              ></textarea>
              <span class="csp-helper-text">
                Mention hospital admission details, sustained injuries, vehicle damage areas, or property address.
              </span>
            </div>
          </div>

          <div class="wizard-footer">
            <a routerLink="/public/intimation" class="csp-btn csp-btn-secondary">
              <app-icon name="arrow-left" [size]="16"></app-icon>
              Back
            </a>
            <button (click)="onContinue()" class="csp-btn csp-btn-primary csp-btn-lg">
              <span>Continue to Claimant Information</span>
              <app-icon name="arrow-right" [size]="16"></app-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-page { padding: 2.5rem 1rem 4rem; }
    .wizard-container { max-width: 900px; margin: 0 auto; }
    .wizard-card { padding: 2.5rem; }
    .wizard-header { margin-bottom: 2rem; }
    .step-indicator { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); margin-bottom: 0.4rem; }
    .wizard-title { font-size: 1.75rem; font-weight: 800; color: var(--csp-charcoal); margin-bottom: 0.5rem; }
    .wizard-subtitle { color: var(--csp-warm-grey); font-size: 0.92rem; }

    .loss-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0.85rem;
      margin-bottom: 2rem;
    }

    .loss-card {
      display: flex;
      align-items: center;
      gap: 1.15rem;
      padding: 1.15rem 1.4rem;
      border: 2px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      background: var(--csp-white);
      cursor: pointer;
      transition: var(--csp-transition);
    }

    .loss-card:hover {
      border-color: var(--csp-clay-dark);
      background: var(--csp-bg-soft);
    }

    .loss-card.selected {
      border-color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.04);
      box-shadow: 0 0 0 1px var(--csp-ember);
    }

    .loss-icon-box {
      width: 44px;
      height: 44px;
      border-radius: var(--csp-radius-sm);
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .loss-card.selected .loss-icon-box {
      background: var(--csp-ember);
      color: var(--csp-white);
    }

    .loss-content {
      flex: 1;
    }

    .loss-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 0.2rem;
    }

    .loss-desc {
      color: var(--csp-warm-grey);
      font-size: 0.85rem;
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
    }

    .loss-card.selected .radio-circle { border-color: var(--csp-ember); }
    .radio-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--csp-ember); }

    .follow-up-card {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;
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
      .loss-card { padding: 1rem; }
    }
  `]
})
export class LossTypeComponent {
  private wizard = inject(IntimationWizardService);
  private router = inject(Router);

  selectedLossType: LossType = this.wizard.draft().lossType;
  lossDetails = this.wizard.draft().lossDetails;

  lossOptions: LossOption[] = [
    {
      type: 'Bodily Injury',
      title: 'Bodily Injury',
      description: 'Medical treatment, hospitalisation, fractures, surgical intervention, or temporary/permanent disability.',
      icon: 'user',
      placeholderText: 'Specify nature of injuries, treating hospital name, inpatient duration, and estimated medical expenses...'
    },
    {
      type: 'Fatal Accident',
      title: 'Fatal Accident',
      description: 'Accident resulted in the unfortunate demise of the victim. Involves post-mortem and legal heirship records.',
      icon: 'scale',
      placeholderText: 'Provide victim age, occupation, monthly income, names of dependent family members, and post-mortem hospital...'
    },
    {
      type: 'Third-Party Property Damage',
      title: 'Third-Party Property Damage (TPPD)',
      description: 'Damage caused to a third-party vehicle, compound wall, commercial shop front, or utility infrastructure.',
      icon: 'car',
      placeholderText: 'Describe damaged property particulars, authorized garage or repair estimate amount, and current location of vehicle...'
    },
    {
      type: 'Hit-and-Run',
      title: 'Hit-and-Run Incident',
      description: 'The offending motor vehicle caused the collision and fled the scene without stopping or rendering aid.',
      icon: 'alert-triangle',
      placeholderText: 'Provide vehicle color, make/model, partial registration numbers, eyewitness names, and police investigation status...'
    },
    {
      type: 'Multiple Loss Types',
      title: 'Multiple Loss Types',
      description: 'Combination of personal bodily injury, passenger casualties, and property or structural damage.',
      icon: 'clipboard-list',
      placeholderText: 'Summarize both personal injury consequences and physical property damage aspects...'
    }
  ];

  get currentPlaceholder(): string {
    const opt = this.lossOptions.find(o => o.type === this.selectedLossType);
    return opt ? opt.placeholderText : 'Provide specific details regarding the sustained loss...';
  }

  selectLossType(type: LossType) {
    this.selectedLossType = type;
    this.wizard.updateDraft({ lossType: type });
  }

  onContinue() {
    this.wizard.updateDraft({ 
      lossType: this.selectedLossType,
      lossDetails: this.lossDetails 
    });
    this.router.navigate(['/public/claimant-info']);
  }
}
