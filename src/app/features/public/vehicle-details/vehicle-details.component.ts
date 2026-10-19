import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IntimationWizardService } from '../intimation-wizard.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-vehicle-details',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Progress Stepper (Step 5 of 7) -->
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
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">Claimant</div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item active">
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
            <div class="step-indicator">Step 5 of 7</div>
            <h2 class="wizard-title">Vehicle & Driver Details</h2>
            <p class="wizard-subtitle">
              Enter particulars of the motor vehicle involved in the collision. Fields marked optional may be left blank if currently unknown.
            </p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onContinue()">
            <!-- Offending / Insured Vehicle Section -->
            <div class="section-box">
              <div class="section-heading-row">
                <app-icon name="car" [size]="18" class="section-icon"></app-icon>
                <h3 class="section-box-title">Insured / Offending Motor Vehicle</h3>
              </div>

              <div class="form-grid-2">
                <div class="csp-form-group">
                  <label class="csp-label">
                    Vehicle Registration Number <span class="required-dot">*</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="insuredVehicleNumber" 
                    placeholder="e.g. TN 07 CQ 8819 or DL 01 AB 1234" 
                    class="csp-input text-uppercase font-mono"
                    [class.has-error]="isInvalid('insuredVehicleNumber')"
                  />
                  <span class="csp-helper-text">Format: State Code - RTO - Series - Numbers</span>
                  <span class="csp-error-text" *ngIf="isInvalid('insuredVehicleNumber')">Vehicle registration number is required</span>
                </div>

                <div class="csp-form-group">
                  <label class="csp-label">
                    Vehicle Category / Class <span class="required-dot">*</span>
                  </label>
                  <select formControlName="vehicleType" class="csp-select">
                    <option value="Private Motor Car">Private Motor Car</option>
                    <option value="Two Wheeler">Two Wheeler (Motorcycle / Scooter)</option>
                    <option value="Commercial Goods Carrier">Commercial Goods Carrier (Truck / LCV / Tipper)</option>
                    <option value="Passenger Carrying Vehicle">Passenger Bus / Maxi Cab / Auto Rickshaw</option>
                    <option value="Agricultural Tractor / Trailer">Agricultural Tractor / Trailer</option>
                  </select>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="csp-form-group">
                  <label class="csp-label">
                    Make & Model
                    <span class="optional-text">(if known)</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="vehicleMakeModel" 
                    placeholder="e.g. Maruti Suzuki Swift / Hyundai Creta" 
                    class="csp-input"
                  />
                </div>

                <div class="csp-form-group">
                  <label class="csp-label">
                    Insurance Policy Number
                    <span class="optional-text">(if known from FIR / Driver)</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="policyNumber" 
                    placeholder="e.g. CSP-MOT-2025-441092" 
                    class="csp-input"
                  />
                  <span class="csp-helper-text">Our operations team will also verify policy status via Parivahan records.</span>
                </div>
              </div>

              <div class="form-grid-2">
                <div class="csp-form-group">
                  <label class="csp-label">
                    Vehicle Registered Owner Name
                    <span class="optional-text">(as per RC if known)</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="insuredPersonName" 
                    placeholder="Name of vehicle owner" 
                    class="csp-input"
                  />
                </div>

                <div class="csp-form-group">
                  <label class="csp-label">
                    Driver Name at Time of Accident
                    <span class="optional-text">(if known from FIR)</span>
                  </label>
                  <input 
                    type="text" 
                    formControlName="driverName" 
                    placeholder="Name of driver" 
                    class="csp-input"
                  />
                </div>
              </div>
            </div>

            <!-- Third Party Victim Vehicle Section -->
            <div class="section-box" style="margin-top: 1.5rem;">
              <div class="section-heading-row">
                <app-icon name="shield" [size]="18" class="section-icon"></app-icon>
                <h3 class="section-box-title">Claimant / Third-Party Vehicle (If Applicable)</h3>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">
                  Claimant Vehicle Number
                  <span class="optional-text">(if you were riding or driving another vehicle)</span>
                </label>
                <input 
                  type="text" 
                  formControlName="thirdPartyVehicleNumber" 
                  placeholder="e.g. TN 07 BM 3310 (Honda Activa) or N/A for pedestrian" 
                  class="csp-input"
                />
              </div>
            </div>

            <div class="wizard-footer">
              <div class="footer-left">
                <a routerLink="/public/claimant-info" class="csp-btn csp-btn-secondary">
                  <app-icon name="arrow-left" [size]="16"></app-icon>
                  Back
                </a>
                <button type="button" (click)="saveDraft()" class="csp-btn csp-btn-secondary">
                  Save Draft
                </button>
              </div>
              <button type="submit" class="csp-btn csp-btn-primary csp-btn-lg">
                <span>Continue to Document Upload</span>
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

    .section-box {
      background: var(--csp-bg-soft);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.5rem;
    }

    .section-heading-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.25rem;
      color: var(--csp-charcoal);
    }

    .section-icon { color: var(--csp-ember); }
    .section-box-title { font-size: 1.05rem; font-weight: 700; margin: 0; }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .text-uppercase { text-transform: uppercase; }
    .font-mono { font-family: monospace, sans-serif; letter-spacing: 0.05em; font-weight: 600; }
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
      .form-grid-2 { grid-template-columns: 1fr; }
      .wizard-footer { flex-direction: column; gap: 1rem; }
      .footer-left { width: 100%; justify-content: space-between; }
      .wizard-footer button[type="submit"] { width: 100%; }
    }
  `]
})
export class VehicleDetailsComponent {
  private fb = inject(FormBuilder);
  private wizard = inject(IntimationWizardService);
  private router = inject(Router);
  private toast = inject(ToastService);

  draft = this.wizard.draft();

  form = this.fb.group({
    insuredVehicleNumber: [this.draft.insuredVehicleNumber, Validators.required],
    vehicleType: [this.draft.vehicleType || 'Private Motor Car', Validators.required],
    vehicleMakeModel: [this.draft.vehicleMakeModel],
    policyNumber: [this.draft.policyNumber],
    insuredPersonName: [this.draft.insuredPersonName],
    driverName: [this.draft.driverName],
    thirdPartyVehicleNumber: [this.draft.thirdPartyVehicleNumber]
  });

  isInvalid(ctrl: string): boolean {
    const c = this.form.get(ctrl);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  saveDraft() {
    this.wizard.updateDraft(this.form.value as any);
    this.toast.success('Vehicle information saved to draft.');
  }

  onContinue() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Please enter the insured vehicle registration number.');
      return;
    }
    this.wizard.updateDraft(this.form.value as any);
    this.router.navigate(['/public/document-upload']);
  }
}
