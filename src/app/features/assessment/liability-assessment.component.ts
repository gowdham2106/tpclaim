import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { LiabilityAssessment } from '../../core/models/assessment.model';

@Component({
  selector: 'app-liability-assessment',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="liability-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Statutory Underwriting Analysis</div>
          <h1 class="page-main-title">Liability & Policy Breach Assessment</h1>
          <p class="page-sub">Apportion statutory fault, investigate driver license validity, and verify policy terms under Motor Vehicle laws.</p>
        </div>
      </div>

      <!-- Claim Selection -->
      <div class="csp-card select-card">
        <label class="csp-label">Select Claim Assessment Case:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedRef" (ngModelChange)="loadAssessment($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let lia of mockData.liabilityAssessments()" [value]="lia.claimRef">
              {{ lia.claimRef }} — Assessor: {{ lia.assessorName }} ({{ lia.liabilityPercentage }}% Liability)
            </option>
          </select>
          <a [routerLink]="['/ops/claim-360', selectedRef]" class="csp-btn csp-btn-secondary">
            <span>Open Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div *ngIf="activeAssessment" class="assessment-grid">
        <!-- Main Form -->
        <div class="csp-card form-card">
          <div class="csp-card-header">
            <div>
              <h3 class="card-head-h3">Liability Determination — {{ activeAssessment.claimRef }}</h3>
              <div class="sub-lead">Statutory liability under Motor Vehicles Act, 1988</div>
            </div>
            <span class="csp-badge" [ngClass]="activeAssessment.status === 'Assessed & Verified' ? 'csp-badge-sage' : 'csp-badge-ember'">
              {{ activeAssessment.status }}
            </span>
          </div>

          <div class="csp-card-body">
            <!-- Circumstances Summary -->
            <div class="csp-form-group">
              <label class="csp-label">Accident Circumstances Summary</label>
              <textarea rows="2" [(ngModel)]="activeAssessment.accidentCircumstances" class="csp-textarea"></textarea>
            </div>

            <div class="form-grid-2">
              <!-- Liability % -->
              <div class="csp-form-group">
                <label class="csp-label">
                  Apportioned Insured Vehicle Liability (%): <strong style="color:var(--csp-ember)">{{ activeAssessment.liabilityPercentage }}%</strong>
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  step="5" 
                  [(ngModel)]="activeAssessment.liabilityPercentage" 
                  class="csp-range-slider"
                />
                <span class="csp-helper-text">100% represents sole liability on insured motor vehicle.</span>
              </div>

              <!-- Policy Breach -->
              <div class="csp-form-group">
                <label class="csp-label">Policy Breach & Defense Verification</label>
                <select [(ngModel)]="activeAssessment.policyBreachCheck" class="csp-select font-bold">
                  <option value="No Breach Found">No Breach Found (Full Cover in Force)</option>
                  <option value="Suspected Drunk Driving">Suspected Drunk Driving (Sec 185)</option>
                  <option value="Invalid DL">Invalid / Expired Driving License</option>
                  <option value="Permit Lapsed">Commercial Permit / Fitness Lapsed</option>
                  <option value="Under Investigation">Under Investigation by RTO Liaison</option>
                </select>
              </div>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Contributory Negligence Analysis</label>
              <input type="text" [(ngModel)]="activeAssessment.contributoryNegligence" class="csp-input" />
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Legal & Factual Rationale for Assessment</label>
              <textarea rows="3" [(ngModel)]="activeAssessment.rationale" class="csp-textarea"></textarea>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Senior Reviewer Comments & Guidance</label>
              <textarea rows="2" [(ngModel)]="activeAssessment.reviewerComments" class="csp-textarea"></textarea>
            </div>

            <div class="form-actions-bar">
              <div class="left-btns">
                <button (click)="requestMoreInvestigation()" class="csp-btn csp-btn-secondary">
                  <app-icon name="search" [size]="14"></app-icon>
                  <span>Request Further Investigation</span>
                </button>
              </div>
              <div class="right-btns">
                <button (click)="saveDraft()" class="csp-btn csp-btn-secondary">Save Draft</button>
                <button (click)="confirmAssessment()" class="csp-btn csp-btn-primary csp-btn-lg">
                  <app-icon name="check-circle" [size]="16"></app-icon>
                  <span>Confirm & Finalize Liability</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Side: Statutory Guideline Box -->
        <div class="sidebar-guide-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Statutory Legal Precedents</h4>
            </div>
            <div class="csp-card-body">
              <div class="law-point">
                <strong>Rear-End Collisions (Res Ipsa Loquitur):</strong>
                <span>Presumption of negligence lies against the trailing vehicle failing to maintain safe stopping interval.</span>
              </div>
              <div class="law-point" style="margin-top:1rem;">
                <strong>Pay and Recover Doctrine:</strong>
                <span>Where policy breach is established (e.g. invalid DL), tribunal may direct insurer to satisfy third-party victim award and recover from insured owner.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .liability-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .select-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .assessment-grid { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 1.5rem; }
    .card-head-h3 { font-size: 1.2rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .sub-lead { font-size: 0.82rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; }
    .csp-range-slider { width: 100%; accent-color: var(--csp-ember); cursor: pointer; height: 8px; margin: 0.5rem 0; }

    .form-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.25rem;
      border-top: 1px solid var(--csp-border);
      flex-wrap: wrap;
      gap: 1rem;
    }
    .right-btns { display: flex; gap: 0.75rem; }

    .law-point { font-size: 0.85rem; line-height: 1.55; }
    .law-point strong { color: var(--csp-charcoal); display: block; margin-bottom: 2px; }
    .law-point span { color: var(--csp-warm-grey); }

    .font-bold { font-weight: 700; }

    @media (max-width: 900px) {
      .assessment-grid { grid-template-columns: 1fr; }
      .form-grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class LiabilityAssessmentComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);

  selectedRef = 'TP-2026-001842';
  activeAssessment?: LiabilityAssessment;

  ngOnInit() {
    this.loadAssessment(this.selectedRef);
  }

  loadAssessment(ref: string) {
    this.selectedRef = ref;
    this.activeAssessment = this.mockData.liabilityAssessments().find(a => a.claimRef === ref) || this.mockData.liabilityAssessments()[0];
  }

  saveDraft() {
    if (!this.activeAssessment) return;
    this.activeAssessment.status = 'Draft';
    this.mockData.saveLiabilityAssessment(this.activeAssessment);
    this.toast.success('Liability assessment draft saved.');
  }

  requestMoreInvestigation() {
    if (!this.activeAssessment) return;
    this.activeAssessment.status = 'Further Investigation Required';
    this.mockData.saveLiabilityAssessment(this.activeAssessment);
    this.toast.warning('Marked for further investigation. Notified field investigator.');
  }

  confirmAssessment() {
    if (!this.activeAssessment) return;
    this.activeAssessment.status = 'Assessed & Verified';
    this.mockData.saveLiabilityAssessment(this.activeAssessment);
    this.toast.success(
      `Liability confirmed at ${this.activeAssessment.liabilityPercentage}%! Ready for compensation assessment.`,
      'Assessment Finalized'
    );
  }
}
