import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IntimationWizardService } from '../intimation-wizard.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-claimant-info',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Progress Stepper (Step 4 of 7) -->
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
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">Loss Type</div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item active">
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
            <div class="step-indicator">Step 4 of 7</div>
            <h2 class="wizard-title">Claimant & Contact Particulars</h2>
            <p class="wizard-subtitle">
              Enter official identification and contact details for claims correspondence.
            </p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onContinue()">
            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">
                  Claimant Full Name <span class="required-dot">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="claimantName" 
                  placeholder="As per Government ID (Aadhaar/PAN/Passport)" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantName')"
                />
                <span class="csp-error-text" *ngIf="isInvalid('claimantName')">Claimant name is required</span>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">
                  Relationship to Incident / Victim <span class="required-dot">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="claimantRole" 
                  class="csp-input"
                  readonly
                  style="background-color: var(--csp-ivory); font-weight: 600;"
                />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">
                  Mobile Number <span class="required-dot">*</span>
                </label>
                <input 
                  type="tel" 
                  formControlName="claimantPhone" 
                  placeholder="+91 98400 12345" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantPhone')"
                />
                <span class="csp-helper-text">SMS and status updates will be delivered here.</span>
                <span class="csp-error-text" *ngIf="isInvalid('claimantPhone')">Valid contact number required</span>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">
                  Email Address <span class="required-dot">*</span>
                </label>
                <input 
                  type="email" 
                  formControlName="claimantEmail" 
                  placeholder="claimant@example.com" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantEmail')"
                />
                <span class="csp-error-text" *ngIf="isInvalid('claimantEmail')">Valid email address required</span>
              </div>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">
                Residential Postal Address <span class="required-dot">*</span>
              </label>
              <input 
                type="text" 
                formControlName="claimantAddress" 
                placeholder="Door / Flat No., Street, Locality" 
                class="csp-input"
                [class.has-error]="isInvalid('claimantAddress')"
              />
              <span class="csp-error-text" *ngIf="isInvalid('claimantAddress')">Residential address is required</span>
            </div>

            <div class="form-grid-3">
              <div class="csp-form-group">
                <label class="csp-label">
                  City <span class="required-dot">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="claimantCity" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantCity')"
                />
                <span class="csp-error-text" *ngIf="isInvalid('claimantCity')">City is required</span>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">
                  State <span class="required-dot">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="claimantState" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantState')"
                />
                <span class="csp-error-text" *ngIf="isInvalid('claimantState')">State is required</span>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">
                  PIN Code <span class="required-dot">*</span>
                </label>
                <input 
                  type="text" 
                  formControlName="claimantPincode" 
                  placeholder="6-digit PIN" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantPincode')"
                />
                <span class="csp-error-text" *ngIf="isInvalid('claimantPincode')">PIN code required</span>
              </div>
            </div>

            <div class="csp-form-group" *ngIf="draft.claimantRole !== 'Third-party injured person'">
              <label class="csp-label">
                Representative / Legal Authority Particulars
                <span class="optional-text">(Bar Council ID or Relationship Affidavit)</span>
              </label>
              <textarea 
                rows="2" 
                formControlName="representativeDetails" 
                placeholder="Mention advocate enrollment number, legal heir succession relationship, or authorization letter reference..."
                class="csp-textarea"
              ></textarea>
            </div>

            <div class="wizard-footer">
              <div class="footer-left">
                <a routerLink="/public/loss-type" class="csp-btn csp-btn-secondary">
                  <app-icon name="arrow-left" [size]="16"></app-icon>
                  Back
                </a>
                <button type="button" (click)="saveDraft()" class="csp-btn csp-btn-secondary">
                  Save Draft
                </button>
              </div>
              <button type="submit" class="csp-btn csp-btn-primary csp-btn-lg">
                <span>Continue to Vehicle Details</span>
                <app-icon name="arrow-right" [size]="16"></app-icon>
              </button>
            </div>
          </form>
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

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1.25rem; }
    .has-error { border-color: var(--csp-error) !important; }

    .wizard-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--csp-border);
      padding-top: 1.5rem;
      margin-top: 2rem;
    }
    .footer-left { display: flex; gap: 0.75rem; }

    @media (max-width: 650px) {
      .wizard-card { padding: 1.5rem; }
      .form-grid-2, .form-grid-3 { grid-template-columns: 1fr; }
      .wizard-footer { flex-direction: column; gap: 1rem; }
      .footer-left { width: 100%; justify-content: space-between; }
      .wizard-footer button[type="submit"] { width: 100%; }
    }
  `]
})
export class ClaimantInfoComponent {
  private fb = inject(FormBuilder);
  private wizard = inject(IntimationWizardService);
  private router = inject(Router);
  private toast = inject(ToastService);

  draft = this.wizard.draft();

  form = this.fb.group({
    claimantName: [this.draft.claimantName, Validators.required],
    claimantRole: [this.draft.claimantRole],
    claimantPhone: [this.draft.claimantPhone, Validators.required],
    claimantEmail: [this.draft.claimantEmail, [Validators.required, Validators.email]],
    claimantAddress: [this.draft.claimantAddress, Validators.required],
    claimantCity: [this.draft.claimantCity || 'Chennai', Validators.required],
    claimantState: [this.draft.claimantState || 'Tamil Nadu', Validators.required],
    claimantPincode: [this.draft.claimantPincode || '600004', Validators.required],
    representativeDetails: [this.draft.representativeDetails]
  });

  isInvalid(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  saveDraft() {
    this.wizard.updateDraft(this.form.value as any);
    this.toast.success('Claimant contact particulars saved to draft.');
  }

  onContinue() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please complete all required fields.');
      return;
    }
    this.wizard.updateDraft(this.form.value as any);
    this.router.navigate(['/public/vehicle-details']);
  }
}
