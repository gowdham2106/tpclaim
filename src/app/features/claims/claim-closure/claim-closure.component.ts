import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { ConfirmationModalComponent } from '../../../shared/components/confirmation-modal/confirmation-modal.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClaimRecord } from '../../../core/models/claim.model';

@Component({
  selector: 'app-claim-closure',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent, ConfirmationModalComponent],
  template: `
    <div class="closure-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Claims Finality & Archival</div>
          <h1 class="page-main-title">Claim Closure & File Retirement</h1>
          <p class="page-sub">Verify post-settlement discharge vouchers, archive evidence files, and execute formal claim closure.</p>
        </div>
      </div>

      <!-- Select Claim -->
      <div class="csp-card select-card">
        <label class="csp-label">Select Claim Dossier for Final Closure:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedClaimRef" (ngModelChange)="loadClaim($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let c of mockData.claims()" [value]="c.id || c.intimationRef">
              {{ c.id || c.intimationRef }} — {{ c.claimantName }} (Stage: {{ c.currentStage }}, Status: {{ c.status }})
            </option>
          </select>
          <a [routerLink]="['/ops/claim-360', selectedClaimRef]" class="csp-btn csp-btn-secondary">
            <span>Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div *ngIf="activeClaim" class="closure-grid">
        <!-- Main Closure Dossier -->
        <div class="csp-card dossier-card">
          <div class="csp-card-header">
            <div>
              <h3 class="card-head-h3">Final Closure Verification — {{ activeClaim.id || activeClaim.intimationRef }}</h3>
              <div class="sub-lead">Claimant: {{ activeClaim.claimantName }} • Paid: ₹{{ activeClaim.paidAmount.toLocaleString('en-IN') }}</div>
            </div>
            <app-status-badge [status]="activeClaim.status"></app-status-badge>
          </div>

          <div class="csp-card-body">
            <!-- Closed State Notice if already closed -->
            <div *ngIf="activeClaim.status === 'Closed'" class="already-closed-banner">
              <app-icon name="lock" [size]="24" class="lock-icon"></app-icon>
              <div>
                <h4 style="margin:0 0 4px; color:var(--csp-charcoal);">This Claim is Officially Closed</h4>
                <p style="margin:0; font-size:0.86rem; color:var(--csp-warm-grey);">
                  All liabilities have been satisfied, bank UTR verified, and audit trail retired.
                </p>
              </div>
              <button (click)="reopenClaim()" class="csp-btn csp-btn-secondary csp-btn-sm" style="margin-left:auto;">
                <app-icon name="refresh-cw" [size]="12"></app-icon>
                <span>Request Re-open</span>
              </button>
            </div>

            <!-- Mandatory Closure Checklist -->
            <div class="closure-checklist-box">
              <h4 class="chk-head">Mandatory Pre-Closure Audit Checklist</h4>
              <div class="chk-grid">
                <label class="chk-row">
                  <input type="checkbox" [(ngModel)]="chkDischarge" />
                  <span>Form 109 Full & Final Discharge Voucher executed on stamp paper</span>
                </label>
                <label class="chk-row">
                  <input type="checkbox" [(ngModel)]="chkPayment" />
                  <span>Bank NEFT / RTGS payment UTR confirmed credited to beneficiary</span>
                </label>
                <label class="chk-row">
                  <input type="checkbox" [(ngModel)]="chkMact" />
                  <span>Tribunal MACT petition disposed / Compromise recorded in Lok Adalat</span>
                </label>
                <label class="chk-row">
                  <input type="checkbox" [(ngModel)]="chkSubrogation" />
                  <span>No outstanding subrogation recovery pending against third parties</span>
                </label>
              </div>
            </div>

            <div class="form-grid-2" style="margin-top:1.5rem;">
              <div class="csp-form-group">
                <label class="csp-label">Final Closure Reason</label>
                <select [(ngModel)]="closureReason" class="csp-select font-bold">
                  <option value="Full & Final Mutual Settlement Disbursed">Full & Final Mutual Settlement Disbursed</option>
                  <option value="Lok Adalat Consent Award Satisfied">Lok Adalat Consent Award Satisfied</option>
                  <option value="MACT Tribunal Award Satisfied">MACT Tribunal Award Satisfied</option>
                  <option value="Repudiated — No Statutory Insurer Liability">Repudiated — No Statutory Insurer Liability</option>
                  <option value="Withdrawn by Claimant / Legal Heirs">Withdrawn by Claimant / Legal Heirs</option>
                </select>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Effective Closure Date</label>
                <input type="date" [(ngModel)]="closureDate" class="csp-input font-bold" />
              </div>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Final Audit Notes & File Retirement Summary</label>
              <textarea rows="3" [(ngModel)]="closureNotes" class="csp-textarea"></textarea>
            </div>

            <!-- Closure Action -->
            <div class="closure-action-row" *ngIf="activeClaim.status !== 'Closed'">
              <button 
                (click)="isConfirmModalOpen = true" 
                class="csp-btn csp-btn-charcoal csp-btn-lg"
                [disabled]="!canClose"
              >
                <app-icon name="lock" [size]="16"></app-icon>
                <span>Execute Final Claim Closure</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Closure Activity Trail -->
        <div class="sidebar-closure-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Claim Activity History</h4>
            </div>
            <div class="csp-card-body">
              <div class="csp-timeline">
                <div *ngFor="let act of activeClaim.activities.slice(0, 4)" class="csp-timeline-item completed">
                  <div class="csp-timeline-dot"></div>
                  <div style="font-size:0.86rem; font-weight:700; color:var(--csp-charcoal);">{{ act.action }}</div>
                  <div style="font-size:0.78rem; color:var(--csp-warm-grey); margin-top:2px;">{{ act.details }}</div>
                  <div style="font-size:0.72rem; color:var(--csp-warm-grey-light); margin-top:4px;">{{ act.timestamp }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <app-confirmation-modal
        [isOpen]="isConfirmModalOpen"
        title="Confirm Final Claim Closure"
        [message]="'You are about to close claim ' + (activeClaim?.id || activeClaim?.intimationRef) + '. This marks all liabilities as resolved and retires the case to audit archives.'"
        confirmText="Confirm Closure"
        (confirm)="executeClosure()"
        (cancel)="isConfirmModalOpen = false"
      ></app-confirmation-modal>
    </div>
  `,
  styles: [`
    .closure-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .select-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .closure-grid { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 1.5rem; }
    .card-head-h3 { font-size: 1.2rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .sub-lead { font-size: 0.82rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .already-closed-banner {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(85, 116, 95, 0.08);
      border: 1px solid var(--csp-sage);
      padding: 1.25rem 1.5rem;
      border-radius: var(--csp-radius-md);
      margin-bottom: 1.5rem;
    }
    .lock-icon { color: var(--csp-sage); }

    .closure-checklist-box {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem 1.5rem;
    }
    .chk-head { font-size: 0.95rem; font-weight: 700; color: var(--csp-charcoal); margin: 0 0 0.85rem; }
    .chk-grid { display: flex; flex-direction: column; gap: 0.65rem; }
    .chk-row { display: flex; align-items: center; gap: 0.65rem; font-size: 0.86rem; color: var(--csp-charcoal); cursor: pointer; }
    .chk-row input { accent-color: var(--csp-ember); width: 16px; height: 16px; }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .closure-action-row {
      display: flex;
      justify-content: flex-end;
      padding-top: 1.25rem;
      border-top: 1px solid var(--csp-border);
      margin-top: 1.5rem;
    }

    .font-bold { font-weight: 700; }

    @media (max-width: 900px) {
      .closure-grid { grid-template-columns: 1fr; }
      .form-grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class ClaimClosureComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  selectedClaimRef = 'TP-2026-002189';
  activeClaim?: ClaimRecord;

  chkDischarge = true;
  chkPayment = true;
  chkMact = true;
  chkSubrogation = true;

  closureReason = 'Full & Final Mutual Settlement Disbursed';
  closureDate = new Date().toISOString().split('T')[0];
  closureNotes = 'All statutory compliance requirements satisfied. Form 109 voucher verified and archived. File closed in good order.';

  isConfirmModalOpen = false;

  ngOnInit() {
    this.loadClaim(this.selectedClaimRef);
  }

  loadClaim(ref: string) {
    this.selectedClaimRef = ref;
    this.activeClaim = this.mockData.getClaimById(ref) || this.mockData.claims()[0];
  }

  get canClose(): boolean {
    return this.chkDischarge && this.chkPayment && this.chkMact && this.chkSubrogation;
  }

  executeClosure() {
    if (!this.activeClaim) return;
    const ref = this.activeClaim.id || this.activeClaim.intimationRef;

    this.mockData.closeClaim(ref, this.closureReason, this.closureNotes);
    this.activeClaim = this.mockData.getClaimById(ref);
    this.isConfirmModalOpen = false;
    this.toast.success(`Claim ${ref} is officially closed and archived!`, 'Claim Closed');
  }

  reopenClaim() {
    if (!this.activeClaim) return;
    const ref = this.activeClaim.id || this.activeClaim.intimationRef;
    this.mockData.updateClaimStage(ref, 'Compensation Assessment', 'Assessment In Progress', 'Reopened upon administrative review.');
    this.activeClaim = this.mockData.getClaimById(ref);
    this.toast.info(`Claim ${ref} reopened for administrative review.`);
  }
}
