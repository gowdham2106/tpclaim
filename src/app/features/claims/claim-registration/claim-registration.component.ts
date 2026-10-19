import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClaimRecord } from '../../../core/models/claim.model';

@Component({
  selector: 'app-claim-registration',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="registration-page">
      <!-- Header -->
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Claim Intake & Onboarding</div>
          <h1 class="page-main-title">Official Claim Registration</h1>
          <p class="page-sub">Validate intimation facts, Parivahan policy records, and issue an official TP Claim Number.</p>
        </div>
      </div>

      <!-- Intimation Selector Card -->
      <div class="csp-card intimation-select-card">
        <div class="select-header">
          <label class="csp-label" style="font-size:0.95rem;">Select Intimation to Register:</label>
          <span class="unregistered-tag">{{ pendingIntimations.length }} Intimations Awaiting Registration</span>
        </div>
        <div class="select-picker-row">
          <select [(ngModel)]="selectedIntimationRef" (ngModelChange)="loadIntimationDetails($event)" class="csp-select picker-select">
            <option *ngFor="let item of pendingIntimations" [value]="item.intimationRef">
              {{ item.intimationRef }} — {{ item.claimantName }} ({{ item.lossType }}, {{ item.accidentCity }})
            </option>
          </select>
          <button (click)="runPolicyValidation()" class="csp-btn csp-btn-secondary">
            <app-icon name="refresh-cw" [size]="14"></app-icon>
            <span>Re-verify Parivahan DB</span>
          </button>
        </div>
      </div>

      <!-- Validation Outcomes Strip -->
      <div class="validation-outcomes-grid" *ngIf="activeClaim">
        <div class="outcome-card success">
          <div class="outcome-icon-box">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="outcome-text">
            <div class="outcome-title">Parivahan Policy: Match Found</div>
            <div class="outcome-desc">Valid third-party cover confirmed for vehicle {{ activeClaim.insuredVehicleNumber }} (Policy {{ activeClaim.policyNumber }}).</div>
          </div>
        </div>

        <div class="outcome-card warning">
          <div class="outcome-icon-box">
            <app-icon name="alert-circle" [size]="20"></app-icon>
          </div>
          <div class="outcome-text">
            <div class="outcome-title">FIR Verification: Manual Review Required</div>
            <div class="outcome-desc">FIR recorded at Saidapet PS. Investigator must collect signed Form 54 from local RTO.</div>
          </div>
        </div>
      </div>

      <!-- Registration Form Body -->
      <div class="csp-card reg-form-card" *ngIf="activeClaim">
        <!-- Section 1: Intimation & Reporter Details -->
        <div class="form-section-box">
          <div class="section-title-row">
            <app-icon name="file-text" [size]="18" class="sec-icon"></app-icon>
            <h3 class="sec-title">1. Intimation & Claimant Details</h3>
          </div>
          <div class="grid-3">
            <div class="csp-form-group">
              <label class="csp-label">Intimation Reference</label>
              <input type="text" [value]="activeClaim.intimationRef" class="csp-input font-bold" readonly />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Claimant Full Name</label>
              <input type="text" [(ngModel)]="activeClaim.claimantName" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Reporting Role</label>
              <input type="text" [(ngModel)]="activeClaim.claimantRole" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Contact Number</label>
              <input type="text" [(ngModel)]="activeClaim.claimantPhone" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Email Address</label>
              <input type="text" [(ngModel)]="activeClaim.claimantEmail" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Reported Date</label>
              <input type="text" [value]="activeClaim.dateReported" class="csp-input" readonly />
            </div>
          </div>
        </div>

        <!-- Section 2: Accident Facts -->
        <div class="form-section-box">
          <div class="section-title-row">
            <app-icon name="map-pin" [size]="18" class="sec-icon"></app-icon>
            <h3 class="sec-title">2. Incident Circumstances</h3>
          </div>
          <div class="grid-3">
            <div class="csp-form-group">
              <label class="csp-label">Accident Date</label>
              <input type="date" [(ngModel)]="activeClaim.accidentDate" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Accident Time</label>
              <input type="time" [(ngModel)]="activeClaim.accidentTime" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Location / Landmark</label>
              <input type="text" [(ngModel)]="activeClaim.accidentLocation" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">City</label>
              <input type="text" [(ngModel)]="activeClaim.accidentCity" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">State</label>
              <input type="text" [(ngModel)]="activeClaim.accidentState" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">FIR / Police Entry</label>
              <input type="text" [(ngModel)]="activeClaim.firNumber" class="csp-input" />
            </div>
          </div>
          <div class="csp-form-group" style="margin-top:0.5rem;">
            <label class="csp-label">Accident Description</label>
            <textarea rows="2" [(ngModel)]="activeClaim.accidentDescription" class="csp-textarea"></textarea>
          </div>
        </div>

        <!-- Section 3: Vehicle & Policy Particulars -->
        <div class="form-section-box">
          <div class="section-title-row">
            <app-icon name="car" [size]="18" class="sec-icon"></app-icon>
            <h3 class="sec-title">3. Insured Vehicle & Policy Verification</h3>
          </div>
          <div class="grid-3">
            <div class="csp-form-group">
              <label class="csp-label">Insured Vehicle Number</label>
              <input type="text" [(ngModel)]="activeClaim.insuredVehicleNumber" class="csp-input font-mono font-bold" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Vehicle Make & Model</label>
              <input type="text" [(ngModel)]="activeClaim.vehicleMakeModel" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Policy Number</label>
              <input type="text" [(ngModel)]="activeClaim.policyNumber" class="csp-input font-mono" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Insured Owner Name</label>
              <input type="text" [(ngModel)]="activeClaim.insuredPersonName" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Driver at Incident</label>
              <input type="text" [(ngModel)]="activeClaim.driverName" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Third-Party Vehicle Reg</label>
              <input type="text" [(ngModel)]="activeClaim.thirdPartyVehicleNumber" class="csp-input" />
            </div>
          </div>
        </div>

        <!-- Section 4: Handler Assignment -->
        <div class="form-section-box">
          <div class="section-title-row">
            <app-icon name="user" [size]="18" class="sec-icon"></app-icon>
            <h3 class="sec-title">4. Operational Assignment & Priority</h3>
          </div>
          <div class="grid-2">
            <div class="csp-form-group">
              <label class="csp-label">Assigned Claims Handler</label>
              <select [(ngModel)]="selectedHandler" class="csp-select">
                <option value="Ananya Raman">Ananya Raman (South Hub • 14 active)</option>
                <option value="Rajesh Menon">Rajesh Menon (North Hub • 18 active)</option>
                <option value="Priya Deshmukh">Priya Deshmukh (West Hub • 11 active)</option>
                <option value="Vikram Sethi">Vikram Sethi (East Hub • 16 active)</option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Priority Level</label>
              <select [(ngModel)]="selectedPriority" class="csp-select">
                <option value="Urgent">Urgent (24h SLA)</option>
                <option value="High">High (48h SLA)</option>
                <option value="Medium">Medium (72h SLA)</option>
                <option value="Low">Low (Standard SLA)</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="reg-footer-actions">
          <div class="left-actions">
            <button (click)="saveDraft()" class="csp-btn csp-btn-secondary">Save Registration Draft</button>
            <button (click)="requestInformation()" class="csp-btn csp-btn-secondary">Request More Information</button>
          </div>
          <button (click)="onRegisterClaim()" class="csp-btn csp-btn-primary csp-btn-lg">
            <app-icon name="shield-check" [size]="18"></app-icon>
            <span>Register Official TP Claim</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .registration-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .intimation-select-card { padding: 1.25rem 1.5rem; }
    .select-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .unregistered-tag { font-size: 0.78rem; font-weight: 700; color: var(--csp-ember); background: var(--csp-ember-subtle); padding: 2px 8px; border-radius: 4px; }
    .select-picker-row { display: flex; gap: 0.75rem; }
    .picker-select { flex: 1; font-weight: 600; color: var(--csp-charcoal); }

    .validation-outcomes-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    .outcome-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem 1.25rem;
      border-radius: var(--csp-radius-md);
      border: 1px solid var(--csp-border);
      background: var(--csp-white);
    }
    .outcome-card.success { border-color: var(--csp-sage); background: rgba(85, 116, 95, 0.05); }
    .outcome-card.success .outcome-icon-box { color: var(--csp-sage); }
    .outcome-card.warning { border-color: var(--csp-terracotta); background: rgba(197, 106, 74, 0.05); }
    .outcome-card.warning .outcome-icon-box { color: var(--csp-terracotta); }

    .outcome-title { font-size: 0.88rem; font-weight: 700; color: var(--csp-charcoal); }
    .outcome-desc { font-size: 0.8rem; color: var(--csp-warm-grey); margin-top: 2px; line-height: 1.45; }

    .reg-form-card { padding: 2rem; display: flex; flex-direction: column; gap: 1.75rem; }
    .form-section-box {
      background: var(--csp-bg-soft);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem 1.5rem;
    }

    .section-title-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem; }
    .sec-icon { color: var(--csp-ember); }
    .sec-title { font-size: 1.05rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }

    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .reg-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.5rem;
      border-top: 1px solid var(--csp-border);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .left-actions { display: flex; gap: 0.75rem; }

    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }

    @media (max-width: 900px) {
      .grid-3 { grid-template-columns: 1fr; }
      .grid-2 { grid-template-columns: 1fr; }
      .validation-outcomes-grid { grid-template-columns: 1fr; }
      .select-picker-row { flex-direction: column; }
    }
  `]
})
export class ClaimRegistrationComponent implements OnInit {
  mockData = inject(MockDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toast = inject(ToastService);

  selectedIntimationRef = 'INT-2026-000249';
  activeClaim?: ClaimRecord;
  selectedHandler = 'Ananya Raman';
  selectedPriority: any = 'High';

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['ref']) {
        this.selectedIntimationRef = params['ref'];
      }
      this.loadIntimationDetails(this.selectedIntimationRef);
    });
  }

  get pendingIntimations(): ClaimRecord[] {
    return this.mockData.claims().filter(c => !c.id || c.status === 'New Intimation' || c.status === 'Registration Pending');
  }

  loadIntimationDetails(ref: string) {
    this.selectedIntimationRef = ref;
    this.activeClaim = this.mockData.claims().find(c => c.intimationRef === ref) || this.mockData.claims()[0];
    if (this.activeClaim) {
      this.selectedHandler = this.activeClaim.assignedHandler || 'Ananya Raman';
      this.selectedPriority = this.activeClaim.priority || 'High';
    }
  }

  runPolicyValidation() {
    this.toast.success(
      'Parivahan Sarathi national database query succeeded. Policy active with no break-in.',
      'Validation Passed'
    );
  }

  saveDraft() {
    this.toast.success('Registration details saved to draft.');
  }

  requestInformation() {
    this.toast.info('Information request dispatch simulated. Claimant notified via SMS.');
  }

  onRegisterClaim() {
    if (!this.activeClaim) return;
    const registered = this.mockData.registerClaim(this.activeClaim.intimationRef, this.selectedHandler);
    if (registered && registered.id) {
      this.toast.success(
        `Intimation ${registered.intimationRef} successfully registered as official claim ${registered.id}!`,
        'Claim Registered'
      );
      this.router.navigate(['/ops/claim-360', registered.id]);
    }
  }
}
