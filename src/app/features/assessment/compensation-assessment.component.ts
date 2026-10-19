import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { CompensationAssessment } from '../../core/models/assessment.model';

@Component({
  selector: 'app-compensation-assessment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="comp-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Actuarial & Compensation Sizing</div>
          <h1 class="page-main-title">Compensation Quantum Assessment Desk</h1>
          <p class="page-sub">Evaluate itemized medical hospitalization expenses, loss of income multipliers, and property restoration costs.</p>
        </div>
      </div>

      <!-- Selection Bar -->
      <div class="csp-card select-card">
        <label class="csp-label">Select Active Compensation Dossier:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedRef" (ngModelChange)="loadAssessment($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let c of mockData.compensationAssessments()" [value]="c.claimRef">
              {{ c.claimRef }} — Proposed Assessment: ₹{{ c.totalProposedAssessment.toLocaleString('en-IN') }} ({{ c.status }})
            </option>
          </select>
          <a [routerLink]="['/ops/claim-360', selectedRef]" class="csp-btn csp-btn-secondary">
            <span>Open Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div *ngIf="activeComp" class="comp-layout-grid">
        <!-- Main Assessment Calculation Form -->
        <div class="csp-card form-card">
          <div class="csp-card-header">
            <div>
              <h3 class="card-head-h3">Compensation Schedule — {{ activeComp.claimRef }}</h3>
              <div class="demo-data-note">Demonstration data — Fictional calculations under statutory tariff guidelines</div>
            </div>
            <span class="csp-badge csp-badge-ember">{{ activeComp.status }}</span>
          </div>

          <div class="csp-card-body">
            <!-- Quantum Breakdown Table -->
            <div class="breakdown-table-box">
              <table class="csp-table">
                <thead>
                  <tr>
                    <th>Loss Component</th>
                    <th>Claimed Amount</th>
                    <th>Assessed & Verified Amount</th>
                    <th>Verification Basis</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="font-bold">Medical & Hospital Inpatient</td>
                    <td class="font-mono">₹{{ activeComp.medicalExpensesClaimed.toLocaleString('en-IN') }}</td>
                    <td>
                      <div class="input-inline-wrap">
                        <span>₹</span>
                        <input 
                          type="number" 
                          [(ngModel)]="activeComp.medicalExpensesAssessed" 
                          (ngModelChange)="recalculateTotal()"
                          class="csp-input font-bold font-mono"
                        />
                      </div>
                    </td>
                    <td class="text-sm text-warm">MIOT Hospital Discharge & authenticated pharmacy bills</td>
                  </tr>

                  <tr>
                    <td class="font-bold">Loss of Earnings / Income Multiplier</td>
                    <td class="font-mono">₹{{ activeComp.lossOfEarningsClaimed.toLocaleString('en-IN') }}</td>
                    <td>
                      <div class="input-inline-wrap">
                        <span>₹</span>
                        <input 
                          type="number" 
                          [(ngModel)]="activeComp.lossOfEarningsAssessed" 
                          (ngModelChange)="recalculateTotal()"
                          class="csp-input font-bold font-mono"
                        />
                      </div>
                    </td>
                    <td class="text-sm text-warm">2 Months recovery period @ ₹40,000/mo (ITR verified)</td>
                  </tr>

                  <tr>
                    <td class="font-bold">Pain, Suffering & Loss of Amenities</td>
                    <td class="font-mono text-warm">As Per Discretion</td>
                    <td>
                      <div class="input-inline-wrap">
                        <span>₹</span>
                        <input 
                          type="number" 
                          [(ngModel)]="activeComp.painAndSufferingAssessed" 
                          (ngModelChange)="recalculateTotal()"
                          class="csp-input font-bold font-mono"
                        />
                      </div>
                    </td>
                    <td class="text-sm text-warm">Standard tribunal precedent for lower limb fracture</td>
                  </tr>

                  <tr>
                    <td class="font-bold">Third-Party Property / Vehicle Repair</td>
                    <td class="font-mono">₹{{ activeComp.propertyRepairClaimed.toLocaleString('en-IN') }}</td>
                    <td>
                      <div class="input-inline-wrap">
                        <span>₹</span>
                        <input 
                          type="number" 
                          [(ngModel)]="activeComp.propertyRepairAssessed" 
                          (ngModelChange)="recalculateTotal()"
                          class="csp-input font-bold font-mono"
                        />
                      </div>
                    </td>
                    <td class="text-sm text-warm">Surveyor depot report after statutory parts depreciation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Total Banner -->
            <div class="total-banner">
              <div>
                <div class="total-lbl">Total Proposed Compensation Quantum</div>
                <div class="total-words">Rupees {{ amountInWords }} Only (Demo Value)</div>
              </div>
              <div class="total-val font-mono">
                ₹{{ activeComp.totalProposedAssessment.toLocaleString('en-IN') }}
              </div>
            </div>

            <!-- Notes & Calculation Rationale -->
            <div class="csp-form-group" style="margin-top: 1.5rem;">
              <label class="csp-label">Actuarial & Legal Rationale for Proposed Quantum</label>
              <textarea rows="3" [(ngModel)]="activeComp.calculationSummary" class="csp-textarea"></textarea>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Reviewer Comments for Senior Approver</label>
              <textarea rows="2" [(ngModel)]="activeComp.reviewerComments" placeholder="Recommendations for authorization..." class="csp-textarea"></textarea>
            </div>

            <div class="form-actions-row">
              <button (click)="saveDraft()" class="csp-btn csp-btn-secondary">Save Assessment Draft</button>
              <button (click)="submitForApproval()" class="csp-btn csp-btn-primary csp-btn-lg">
                <app-icon name="check-circle" [size]="16"></app-icon>
                <span>Submit Dossier for Senior Approval</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar: Verification Checklist & Guidance -->
        <div class="comp-sidebar-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Statutory Formula Benchmarks</h4>
            </div>
            <div class="csp-card-body">
              <div class="law-point">
                <strong>Sarla Verma (2009) Multiplier:</strong>
                <span>Age 41-45: Multiplier of 14 applied on annual dependency after statutory personal deductions.</span>
              </div>
              <div class="law-point" style="margin-top:1rem;">
                <strong>Pranay Sethi (2017) Guidelines:</strong>
                <span>Addition of 25% future prospects for self-employed / fixed salary victims aged 40-50.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .comp-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .select-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .comp-layout-grid { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 1.5rem; }
    .card-head-h3 { font-size: 1.2rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .demo-data-note { font-size: 0.78rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .breakdown-table-box { overflow-x: auto; margin-bottom: 1.5rem; }
    .input-inline-wrap { display: flex; align-items: center; gap: 0.35rem; font-weight: 700; }
    .input-inline-wrap input { width: 130px; padding: 0.4rem 0.6rem; }

    .total-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--csp-ivory);
      border: 2px solid var(--csp-clay-dark);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .total-lbl { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--csp-charcoal); }
    .total-words { font-size: 0.78rem; color: var(--csp-warm-grey); margin-top: 2px; }
    .total-val { font-size: 1.85rem; font-weight: 800; color: var(--csp-ember); }

    .form-actions-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.25rem;
      border-top: 1px solid var(--csp-border);
      margin-top: 1.5rem;
    }

    .law-point { font-size: 0.85rem; line-height: 1.55; }
    .law-point strong { color: var(--csp-charcoal); display: block; margin-bottom: 2px; }
    .law-point span { color: var(--csp-warm-grey); }

    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-sm { font-size: 0.82rem; }
    .text-warm { color: var(--csp-warm-grey); }

    @media (max-width: 900px) {
      .comp-layout-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class CompensationAssessmentComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  selectedRef = 'TP-2026-001842';
  activeComp?: CompensationAssessment;

  ngOnInit() {
    this.loadAssessment(this.selectedRef);
  }

  loadAssessment(ref: string) {
    this.selectedRef = ref;
    this.activeComp = this.mockData.compensationAssessments().find(c => c.claimRef === ref) || this.mockData.compensationAssessments()[0];
  }

  recalculateTotal() {
    if (!this.activeComp) return;
    this.activeComp.totalProposedAssessment = 
      (Number(this.activeComp.medicalExpensesAssessed) || 0) +
      (Number(this.activeComp.lossOfEarningsAssessed) || 0) +
      (Number(this.activeComp.painAndSufferingAssessed) || 0) +
      (Number(this.activeComp.propertyRepairAssessed) || 0);
  }

  get amountInWords(): string {
    const val = this.activeComp?.totalProposedAssessment || 0;
    return `${val.toLocaleString('en-IN')}`;
  }

  saveDraft() {
    if (!this.activeComp) return;
    this.activeComp.status = 'Draft';
    this.mockData.saveCompensationAssessment(this.activeComp);
    this.toast.success('Compensation assessment draft saved.');
  }

  submitForApproval() {
    if (!this.activeComp) return;
    this.activeComp.status = 'Submitted for Approval';
    this.mockData.saveCompensationAssessment(this.activeComp);
    this.toast.success(
      `Quantum of ₹${this.activeComp.totalProposedAssessment.toLocaleString('en-IN')} submitted to Approvals desk!`,
      'Submitted for Approval'
    );
    this.router.navigate(['/ops/approvals']);
  }
}
