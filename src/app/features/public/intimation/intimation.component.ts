import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IntimationWizardService } from '../intimation-wizard.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-intimation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Compact 3-Stage Progress Timeline -->
        <div class="csp-stepper compact-stepper">
          <div class="csp-step-item active">
            <div class="csp-step-circle">1</div>
            <div class="csp-step-label">
              <span class="step-num">Step 1 of 3</span>
              <span class="step-name">Accident & Parties Data</span>
            </div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">2</div>
            <div class="csp-step-label">
              <span class="step-num">Step 2 of 3</span>
              <span class="step-name">Document Upload</span>
            </div>
            <div class="csp-step-line"></div>
          </div>
          <div class="csp-step-item">
            <div class="csp-step-circle">3</div>
            <div class="csp-step-label">
              <span class="step-num">Step 3 of 3</span>
              <span class="step-name">Review & Declaration</span>
            </div>
          </div>
        </div>

        <!-- Master Data Intake Card -->
        <div class="csp-card intake-form-card">
          <div class="form-title-bar">
            <div class="form-title-left">
              <span class="step-pill">Section 1: Data Intake</span>
              <h2 class="form-main-heading">Accident & Parties Intake Form</h2>
            </div>
            <span class="fields-hint">Fields with <span class="required-dot">*</span> are mandatory</span>
          </div>

          <form [formGroup]="form" (ngSubmit)="onContinue()" class="compact-form">
            <!-- Section 1A: Claimant Role & Loss Classification -->
            <div class="form-sec-divider">1. Claimant Role & Loss Scope</div>
            <div class="grid-4">
              <div class="csp-form-group">
                <label class="csp-label">Claimant Role <span class="required-dot">*</span></label>
                <select formControlName="claimantRole" class="csp-select">
                  <option value="Third-party injured person">Third-Party Injured Person</option>
                  <option value="Vehicle or property owner">Vehicle / Property Owner (TPPD)</option>
                  <option value="Representative of a deceased victim">Representative of Deceased</option>
                  <option value="Legal representative">Legal Representative / Advocate</option>
                  <option value="Other authorised representative">Other Authorised Kin</option>
                </select>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Authority / Rep Details</label>
                <input 
                  type="text" 
                  formControlName="representativeDetails" 
                  placeholder="e.g. Legal heir #9928 / POA" 
                  class="csp-input"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Loss Classification <span class="required-dot">*</span></label>
                <select formControlName="lossType" class="csp-select">
                  <option value="Bodily Injury">Bodily Injury</option>
                  <option value="Fatal Accident">Fatal Accident</option>
                  <option value="Third-Party Property Damage">Property Damage (TPPD)</option>
                  <option value="Hit-and-Run">Hit-and-Run</option>
                  <option value="Multiple Loss Types">Multiple Loss Types</option>
                </select>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Specific Injury / Damage Scope</label>
                <input 
                  type="text" 
                  formControlName="lossDetails" 
                  placeholder="e.g. Fracture in right leg" 
                  class="csp-input"
                />
              </div>
            </div>

            <!-- Section 1B: Accident Circumstances & Police Records -->
            <div class="form-sec-divider">2. Incident Circumstances & Police Records</div>
            <div class="grid-4">
              <div class="csp-form-group">
                <label class="csp-label">Accident Date <span class="required-dot">*</span></label>
                <input 
                  type="date" 
                  formControlName="accidentDate" 
                  class="csp-input"
                  [class.has-error]="isInvalid('accidentDate')"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Approx Time <span class="required-dot">*</span></label>
                <input 
                  type="time" 
                  formControlName="accidentTime" 
                  class="csp-input"
                  [class.has-error]="isInvalid('accidentTime')"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">State / Region <span class="required-dot">*</span></label>
                <select formControlName="accidentState" class="csp-select">
                  <option value="Tamil Nadu">Tamil Nadu</option>
                  <option value="Delhi">Delhi</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Kerala">Kerala</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Telangana">Telangana</option>
                  <option value="West Bengal">West Bengal</option>
                  <option value="Gujarat">Gujarat</option>
                </select>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">City / District <span class="required-dot">*</span></label>
                <input 
                  type="text" 
                  formControlName="accidentCity" 
                  placeholder="e.g. Chennai" 
                  class="csp-input"
                  [class.has-error]="isInvalid('accidentCity')"
                />
              </div>
            </div>

            <div class="grid-4">
              <div class="csp-form-group col-span-2">
                <label class="csp-label">Location Landmark / Street <span class="required-dot">*</span></label>
                <input 
                  type="text" 
                  formControlName="accidentLocation" 
                  placeholder="e.g. Near Guindy Flyover, GST Road" 
                  class="csp-input"
                  [class.has-error]="isInvalid('accidentLocation')"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Police Station (If Reported)</label>
                <input 
                  type="text" 
                  formControlName="policeStation" 
                  placeholder="e.g. E-1 Mylapore PS" 
                  class="csp-input"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">FIR / GD / DDR Number</label>
                <input 
                  type="text" 
                  formControlName="firNumber" 
                  placeholder="e.g. FIR/198/2026 or CSR-4402" 
                  class="csp-input"
                />
              </div>
            </div>

            <div class="csp-form-group" style="margin-bottom: 0.45rem;">
              <label class="csp-label">Accident Brief Narrative <span class="required-dot">*</span></label>
              <textarea 
                formControlName="accidentDescription" 
                rows="1" 
                placeholder="Brief description of collision, vehicle movement, and impact facts..." 
                class="csp-textarea"
                [class.has-error]="isInvalid('accidentDescription')"
              ></textarea>
            </div>

            <!-- Section 1C: Claimant Contact Particulars -->
            <div class="form-sec-divider">3. Claimant Contact Particulars</div>
            <div class="grid-4">
              <div class="csp-form-group">
                <label class="csp-label">Full Name <span class="required-dot">*</span></label>
                <input 
                  type="text" 
                  formControlName="claimantName" 
                  placeholder="e.g. Kavitha Ramachandran" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantName')"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Mobile Number <span class="required-dot">*</span></label>
                <input 
                  type="tel" 
                  formControlName="claimantPhone" 
                  placeholder="e.g. +91 98410 44321" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantPhone')"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Email Address <span class="required-dot">*</span></label>
                <input 
                  type="email" 
                  formControlName="claimantEmail" 
                  placeholder="e.g. claimant@example.com" 
                  class="csp-input"
                  [class.has-error]="isInvalid('claimantEmail')"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Notification Mode</label>
                <select formControlName="contactPreference" class="csp-select">
                  <option value="Phone">Phone Calls & SMS</option>
                  <option value="Email">Email Communication</option>
                  <option value="WhatsApp">WhatsApp Updates</option>
                  <option value="SMS">SMS Alerts Only</option>
                </select>
              </div>
            </div>

            <div class="grid-4">
              <div class="csp-form-group col-span-3">
                <label class="csp-label">Residential Address</label>
                <input 
                  type="text" 
                  formControlName="claimantAddress" 
                  placeholder="House, street address, and area" 
                  class="csp-input"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">City / State</label>
                <input 
                  type="text" 
                  formControlName="claimantCity" 
                  placeholder="e.g. Chennai" 
                  class="csp-input"
                />
              </div>
            </div>

            <!-- Section 1D: Involved Vehicle & Policy Details -->
            <div class="form-sec-divider">4. Involved Vehicle & Policy Details</div>
            <div class="grid-4">
              <div class="csp-form-group">
                <label class="csp-label">Insured Vehicle Reg No <span class="required-dot">*</span></label>
                <input 
                  type="text" 
                  formControlName="insuredVehicleNumber" 
                  placeholder="e.g. TN 07 CQ 8819" 
                  class="csp-input uppercase-input"
                  [class.has-error]="isInvalid('insuredVehicleNumber')"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Vehicle Category <span class="required-dot">*</span></label>
                <select formControlName="vehicleType" class="csp-select">
                  <option value="Private Motor Car">Private Motor Car / Sedan</option>
                  <option value="SUV / MUV">SUV / MUV</option>
                  <option value="Two-Wheeler / Motorcycle">Two-Wheeler / Motorcycle</option>
                  <option value="Auto Rickshaw / 3W">Auto Rickshaw / 3W</option>
                  <option value="Light Commercial Vehicle (LCV)">Light Commercial (LCV)</option>
                  <option value="Heavy Goods Vehicle (HGV)">Heavy Goods Vehicle</option>
                  <option value="Passenger Bus">Passenger Bus</option>
                </select>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Make & Model</label>
                <input 
                  type="text" 
                  formControlName="vehicleMakeModel" 
                  placeholder="e.g. Maruti Suzuki Swift Dzire" 
                  class="csp-input"
                />
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Policy / Cover Note No</label>
                <input 
                  type="text" 
                  formControlName="policyNumber" 
                  placeholder="e.g. CSP-MOT-2025-441092" 
                  class="csp-input"
                />
              </div>
            </div>

            <div class="grid-4">
              <div class="csp-form-group col-span-2">
                <label class="csp-label">Driver Name at Time of Accident</label>
                <input 
                  type="text" 
                  formControlName="driverName" 
                  placeholder="e.g. Sanjay Kumar Verma" 
                  class="csp-input"
                />
              </div>

              <div class="csp-form-group col-span-2">
                <label class="csp-label">Victim / Other Vehicle Registration</label>
                <input 
                  type="text" 
                  formControlName="thirdPartyVehicleNumber" 
                  placeholder="e.g. TN 07 BM 3310 (Honda Activa)" 
                  class="csp-input"
                />
              </div>
            </div>

            <!-- Footer Action Buttons -->
            <div class="form-actions-bar">
              <a routerLink="/" class="csp-btn csp-btn-secondary csp-btn-sm">
                <app-icon name="arrow-left" [size]="14"></app-icon>
                <span>Return to Home</span>
              </a>

              <div class="actions-right">
                <button type="button" (click)="saveDraftOnly()" class="csp-btn csp-btn-outline csp-btn-sm">
                  <app-icon name="save" [size]="14"></app-icon>
                  <span>Save Draft</span>
                </button>
                <button type="submit" class="csp-btn csp-btn-primary csp-btn-sm">
                  <span>Continue to Step 2: Document Upload</span>
                  <app-icon name="arrow-right" [size]="14"></app-icon>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-page {
      padding: 1.25rem 0.75rem 2.5rem;
      background: var(--csp-bg-soft);
      min-height: calc(100vh - 180px);
    }
    .wizard-container {
      max-width: 1060px;
      margin: 0 auto;
    }

    /* 3-Stage Stepper */
    .compact-stepper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
      position: relative;
    }
    .csp-step-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      position: relative;
      flex: 1;
    }
    .csp-step-item:last-child {
      flex: 0 0 auto;
    }
    .csp-step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--csp-ivory);
      border: 2px solid var(--csp-border);
      color: var(--csp-warm-grey);
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 2;
    }
    .csp-step-item.active .csp-step-circle {
      background: var(--csp-ember);
      border-color: var(--csp-ember);
      color: var(--csp-white);
      box-shadow: 0 0 0 3px rgba(232, 93, 50, 0.2);
    }
    .csp-step-item.completed .csp-step-circle {
      background: var(--csp-sage);
      border-color: var(--csp-sage);
      color: var(--csp-white);
    }
    .csp-step-label {
      display: flex;
      flex-direction: column;
    }
    .step-num {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--csp-warm-grey);
    }
    .step-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .csp-step-item.active .step-name {
      color: var(--csp-ember);
    }
    .csp-step-line {
      flex: 1;
      height: 2px;
      background: var(--csp-border);
      margin: 0 0.75rem;
    }
    .csp-step-line.filled {
      background: var(--csp-sage);
    }

    /* High-density Form Card */
    .intake-form-card {
      padding: 1.15rem 1.4rem;
      background: var(--csp-white);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-sm);
      border: 1px solid var(--csp-border);
    }

    .form-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.65rem;
      margin-bottom: 0.65rem;
      border-bottom: 1px solid var(--csp-border);
    }
    .form-title-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .step-pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.1);
      padding: 2px 7px;
      border-radius: var(--csp-radius-pill);
    }
    .form-main-heading {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .fields-hint {
      font-size: 0.72rem;
      color: var(--csp-warm-grey);
    }

    /* Clean Section Dividers */
    .form-sec-divider {
      font-size: 0.74rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--csp-terracotta);
      background: rgba(197, 106, 74, 0.08);
      padding: 0.25rem 0.6rem;
      border-radius: 4px;
      border-left: 3px solid var(--csp-ember);
      margin: 0.55rem 0 0.45rem 0;
    }

    /* Grids & Spans */
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.45rem 0.7rem;
      margin-bottom: 0.4rem;
    }
    .col-span-2 {
      grid-column: span 2;
    }
    .col-span-3 {
      grid-column: span 3;
    }
    .col-span-4 {
      grid-column: span 4;
    }

    .csp-form-group {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .csp-label {
      font-size: 0.73rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 1px;
    }
    .required-dot {
      color: var(--csp-ember);
    }

    .csp-input, .csp-select {
      height: 33px;
      font-size: 0.81rem;
      padding: 0.25rem 0.55rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      background: var(--csp-white);
      color: var(--csp-charcoal);
      font-family: inherit;
    }
    .csp-textarea {
      height: 36px;
      min-height: 36px;
      font-size: 0.81rem;
      padding: 0.25rem 0.55rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      background: var(--csp-white);
      color: var(--csp-charcoal);
      font-family: inherit;
      resize: vertical;
    }
    .csp-input:focus, .csp-select:focus, .csp-textarea:focus {
      outline: none;
      border-color: var(--csp-ember);
      box-shadow: 0 0 0 2px rgba(232, 93, 50, 0.15);
    }
    .has-error {
      border-color: #B91C1C !important;
    }
    .uppercase-input {
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
    }

    /* Actions Bar */
    .form-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.75rem;
      padding-top: 0.65rem;
      border-top: 1px solid var(--csp-border);
    }
    .actions-right {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    @media (max-width: 820px) {
      .grid-4 {
        grid-template-columns: repeat(2, 1fr);
      }
      .col-span-2, .col-span-3, .col-span-4 {
        grid-column: span 2;
      }
      .compact-stepper {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .csp-step-line {
        display: none;
      }
    }

    @media (max-width: 520px) {
      .grid-4 {
        grid-template-columns: 1fr;
      }
      .col-span-2, .col-span-3, .col-span-4 {
        grid-column: span 1;
      }
      .form-actions-bar {
        flex-direction: column;
        gap: 0.6rem;
      }
      .actions-right {
        width: 100%;
        justify-content: space-between;
      }
    }
  `]
})
export class IntimationComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private wizardService = inject(IntimationWizardService);
  private toast = inject(ToastService);

  form!: FormGroup;

  ngOnInit() {
    const draft = this.wizardService.draft();
    this.form = this.fb.group({
      claimantRole: [draft.claimantRole || 'Third-party injured person', Validators.required],
      representativeDetails: [draft.representativeDetails || ''],
      accidentDate: [draft.accidentDate || new Date().toISOString().split('T')[0], Validators.required],
      accidentTime: [draft.accidentTime || '14:30', Validators.required],
      accidentLocation: [draft.accidentLocation || 'Anna Salai, Near Mount Road Junction', Validators.required],
      accidentCity: [draft.accidentCity || 'Chennai', Validators.required],
      accidentState: [draft.accidentState || 'Tamil Nadu', Validators.required],
      policeStation: [draft.policeStation || 'E-1 Mylapore Police Station'],
      firNumber: [draft.firNumber || 'FIR/198/2026'],
      accidentDescription: [draft.accidentDescription || 'Insured vehicle failed to stop at crossing and caused damage.', Validators.required],
      lossType: [draft.lossType || 'Bodily Injury', Validators.required],
      lossDetails: [draft.lossDetails || 'Ligament injury in left leg.'],
      claimantName: [draft.claimantName || 'Kavitha Ramachandran', Validators.required],
      claimantPhone: [draft.claimantPhone || '+91 98410 44321', Validators.required],
      claimantEmail: [draft.claimantEmail || 'kavitha.ram@example.com', [Validators.required, Validators.email]],
      claimantAddress: [draft.claimantAddress || '42/1, Oliver Road, Mylapore'],
      claimantCity: [draft.claimantCity || 'Chennai'],
      contactPreference: [draft.contactPreference || 'Phone'],
      insuredVehicleNumber: [draft.insuredVehicleNumber || 'TN 07 CQ 8819', Validators.required],
      vehicleType: [draft.vehicleType || 'Private Motor Car', Validators.required],
      vehicleMakeModel: [draft.vehicleMakeModel || 'Maruti Suzuki Swift Dzire'],
      policyNumber: [draft.policyNumber || 'CSP-MOT-2025-441092'],
      driverName: [draft.driverName || 'Sanjay Kumar Verma'],
      thirdPartyVehicleNumber: [draft.thirdPartyVehicleNumber || 'TN 07 BM 3310 (Honda Activa)']
    });
  }

  isRepresentative(): boolean {
    const role = this.form.get('claimantRole')?.value;
    return role === 'Legal representative' || role === 'Representative of a deceased victim' || role === 'Other authorised representative';
  }

  isInvalid(controlName: string): boolean {
    const c = this.form.get(controlName);
    return !!(c && c.invalid && (c.dirty || c.touched));
  }

  saveDraftOnly() {
    this.wizardService.updateDraft(this.form.value);
    this.toast.showSuccess('Draft Saved', 'Your accident intimation data has been stored locally.');
  }

  onContinue() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.showError('Required Fields Missing', 'Please complete the highlighted mandatory fields before proceeding to document upload.');
      return;
    }

    this.wizardService.updateDraft(this.form.value);
    this.toast.showSuccess('Section 1 Complete', 'Proceeding to Step 2: Document Upload.');
    this.router.navigate(['/document-upload']);
  }
}
