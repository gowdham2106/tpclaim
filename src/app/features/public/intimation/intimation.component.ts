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
        <!-- Symmetrical 3-Stage Progress Timeline with 3 Equal Columns -->
        <div class="stepper-grid">
          <div class="step-card active">
            <div class="step-badge">1</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 1 of 3</span>
              <span class="step-title">Accident & Parties Data</span>
            </div>
          </div>
          <div class="step-card">
            <div class="step-badge">2</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 2 of 3</span>
              <span class="step-title">Document Upload</span>
            </div>
          </div>
          <div class="step-card">
            <div class="step-badge">3</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 3 of 3</span>
              <span class="step-title">Review & Declaration</span>
            </div>
          </div>
        </div>

        <!-- Master Data Intake Card with Equal Grid Alignment -->
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
              <!-- Row 1: 4 equal cols (1+1+1+1) -->
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

              <!-- Row 2: 2 cols + 1 col + 1 col (2+1+1) -->
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

              <div class="csp-form-group col-span-1">
                <label class="csp-label">Police Station (If Reported)</label>
                <input 
                  type="text" 
                  formControlName="policeStation" 
                  placeholder="e.g. E-1 Mylapore PS" 
                  class="csp-input"
                />
              </div>

              <div class="csp-form-group col-span-1">
                <label class="csp-label">FIR / GD / DDR Number</label>
                <input 
                  type="text" 
                  formControlName="firNumber" 
                  placeholder="e.g. FIR/198/2026 or CSR-4402" 
                  class="csp-input"
                />
              </div>

              <!-- Row 3: Full 4 cols -->
              <div class="csp-form-group col-span-4">
                <label class="csp-label">Accident Brief Narrative <span class="required-dot">*</span></label>
                <input 
                  type="text" 
                  formControlName="accidentDescription" 
                  placeholder="Brief description of collision, vehicle movement, and impact facts..." 
                  class="csp-input"
                  [class.has-error]="isInvalid('accidentDescription')"
                />
              </div>
            </div>

            <!-- Section 1C: Claimant Contact Particulars -->
            <div class="form-sec-divider">3. Claimant Contact Particulars</div>
            <div class="grid-4">
              <!-- Row 1: 4 equal cols (1+1+1+1) -->
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

              <!-- Row 2: 2 cols + 2 cols (2+2) -->
              <div class="csp-form-group col-span-2">
                <label class="csp-label">Residential Address</label>
                <input 
                  type="text" 
                  formControlName="claimantAddress" 
                  placeholder="House, street address, and area" 
                  class="csp-input"
                />
              </div>

              <div class="csp-form-group col-span-2">
                <label class="csp-label">City & State</label>
                <input 
                  type="text" 
                  formControlName="claimantCity" 
                  placeholder="e.g. Chennai, Tamil Nadu" 
                  class="csp-input"
                />
              </div>
            </div>

            <!-- Section 1D: Involved Vehicle & Policy Details -->
            <div class="form-sec-divider">4. Involved Vehicle & Policy Details</div>
            <div class="grid-4">
              <!-- Row 1: 4 equal cols (1+1+1+1) -->
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

              <!-- Row 2: 2 cols + 2 cols (2+2) -->
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
      box-sizing: border-box;
      width: 100%;
    }

    /* Symmetrical 3-Stage Progress Timeline with 3 Equal Columns */
    .stepper-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 0.95rem;
      width: 100%;
      box-sizing: border-box;
    }
    .step-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.85rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      box-sizing: border-box;
      transition: var(--csp-transition);
    }
    .step-card.active {
      border-color: var(--csp-ember);
      background: #FFF9F6;
      box-shadow: 0 1px 3px rgba(232, 93, 50, 0.12);
    }
    .step-card.completed {
      border-color: rgba(85, 116, 95, 0.45);
      background: #F6F9F7;
    }
    .step-badge {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--csp-ivory);
      border: 1.5px solid var(--csp-border);
      color: var(--csp-warm-grey);
      font-weight: 800;
      font-size: 0.76rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-card.active .step-badge {
      background: var(--csp-ember);
      border-color: var(--csp-ember);
      color: var(--csp-white);
      box-shadow: 0 0 0 2px rgba(232, 93, 50, 0.2);
    }
    .step-card.completed .step-badge {
      background: var(--csp-sage);
      border-color: var(--csp-sage);
      color: var(--csp-white);
    }
    .step-text-col {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
    .step-kicker {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--csp-warm-grey);
      line-height: 1.2;
    }
    .step-card.active .step-kicker {
      color: var(--csp-ember);
    }
    .step-card.completed .step-kicker {
      color: var(--csp-sage);
    }
    .step-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* High-density Form Card with Symmetrical Inner Padding */
    .intake-form-card {
      padding: 1.25rem 1.5rem;
      background: var(--csp-white);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-sm);
      border: 1px solid var(--csp-border);
      box-sizing: border-box;
      width: 100%;
    }

    .form-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.65rem;
      margin-bottom: 0.75rem;
      border-bottom: 1px solid var(--csp-border);
      width: 100%;
      box-sizing: border-box;
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

    /* Clean Uniform Section Dividers */
    .form-sec-divider {
      font-size: 0.72rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--csp-terracotta);
      background: rgba(197, 106, 74, 0.06);
      padding: 0.3rem 0.65rem;
      border-radius: 4px;
      border-left: 3px solid var(--csp-ember);
      margin: 0.85rem 0 0.55rem 0;
      box-sizing: border-box;
      width: 100%;
    }
    .form-sec-divider:first-of-type {
      margin-top: 0.2rem;
    }

    /* Symmetrical 4-Column Grids */
    .grid-4 {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.65rem 0.85rem;
      margin-bottom: 0.55rem;
      width: 100%;
      box-sizing: border-box;
    }
    .col-span-1 {
      grid-column: span 1;
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
      width: 100%;
      box-sizing: border-box;
    }
    .csp-label {
      display: flex;
      align-items: center;
      height: 20px;
      line-height: 20px;
      font-size: 0.73rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 4px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
    }
    .required-dot {
      color: var(--csp-ember);
      margin-left: 2px;
    }

    .csp-input, .csp-select {
      height: 36px;
      min-height: 36px;
      max-height: 36px;
      line-height: normal;
      font-size: 0.82rem;
      padding: 0 0.75rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      background-color: var(--csp-white);
      color: var(--csp-charcoal);
      font-family: inherit;
      width: 100%;
      box-sizing: border-box;
      display: block;
      outline: none;
      transition: var(--csp-transition);
    }
    .csp-select {
      appearance: none;
      -webkit-appearance: none;
      -moz-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6764' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.75rem center;
      padding-right: 2rem;
      cursor: pointer;
    }
    .csp-input:focus, .csp-select:focus {
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
      margin-top: 1rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--csp-border);
      width: 100%;
      box-sizing: border-box;
    }
    .actions-right {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    @media (max-width: 860px) {
      .grid-4 {
        grid-template-columns: repeat(2, 1fr);
      }
      .col-span-2, .col-span-3, .col-span-4 {
        grid-column: span 2;
      }
      .stepper-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
    }

    @media (max-width: 520px) {
      .grid-4 {
        grid-template-columns: 1fr;
      }
      .col-span-1, .col-span-2, .col-span-3, .col-span-4 {
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
      claimantCity: [draft.claimantCity || 'Chennai, Tamil Nadu'],
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
