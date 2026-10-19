import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ConfirmationModalComponent } from '../../shared/components/confirmation-modal/confirmation-modal.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { ClaimRecord } from '../../core/models/claim.model';

@Component({
  selector: 'app-approvals',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent, ConfirmationModalComponent],
  template: `
    <div class="approvals-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Governance & Mandate Authority</div>
          <h1 class="page-main-title">Underwriting & Claims Approval Desk</h1>
          <p class="page-sub">Review proposed liability assessments and authorize settlement disbursements within institutional financial authority.</p>
        </div>
      </div>

      <!-- Queue of Pending Approvals -->
      <div class="csp-card selection-card">
        <label class="csp-label">Select Claim Dossier Awaiting Authorization:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedClaimRef" (ngModelChange)="loadDossier($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let c of pendingClaims" [value]="c.id || c.intimationRef">
              {{ c.id || c.intimationRef }} — {{ c.claimantName }} (Proposed: ₹{{ (c.assessedAmount || c.claimedAmount).toLocaleString('en-IN') }})
            </option>
          </select>
          <a [routerLink]="['/ops/claim-360', selectedClaimRef]" class="csp-btn csp-btn-secondary">
            <span>Open Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div *ngIf="activeClaim" class="dossier-grid">
        <!-- Main Decision Sheet -->
        <div class="csp-card dossier-card">
          <div class="csp-card-header">
            <div>
              <h3 class="card-head-h3">Decision Sheet — {{ activeClaim.id || activeClaim.intimationRef }}</h3>
              <div class="sub-lead">Claimant: {{ activeClaim.claimantName }} • Vehicle: {{ activeClaim.insuredVehicleNumber }}</div>
            </div>
            <app-status-badge [status]="activeClaim.status"></app-status-badge>
          </div>

          <div class="csp-card-body">
            <!-- Assessment Highlights Banner -->
            <div class="highlight-banner">
              <div class="hl-col">
                <span class="hl-k">Claimed Amount</span>
                <span class="hl-v font-mono">₹{{ activeClaim.claimedAmount.toLocaleString('en-IN') }}</span>
              </div>
              <div class="hl-col">
                <span class="hl-k">Proposed Settlement</span>
                <span class="hl-v font-mono text-ember">₹{{ (activeClaim.assessedAmount || 375000).toLocaleString('en-IN') }}</span>
              </div>
              <div class="hl-col">
                <span class="hl-k">Assigned Handler</span>
                <span class="hl-v font-semibold">{{ activeClaim.assignedHandler }}</span>
              </div>
              <div class="hl-col">
                <span class="hl-k">Policy Status</span>
                <span class="hl-v font-semibold" style="color:var(--csp-sage)">Active & Verified</span>
              </div>
            </div>

            <!-- Review Summary Text -->
            <div class="dossier-section">
              <h4 class="sec-h4">Liability & Factual Assessment Summary</h4>
              <p class="sec-p">
                Independent investigation confirmed rear-end collision by insured commercial/passenger vehicle with zero contributory negligence. Driver license verified on Parivahan Sarathi database. Medical bills cross-referenced against MIOT Hospital admission records.
              </p>
            </div>

            <div class="dossier-section">
              <h4 class="sec-h4">Approver Decision Notes</h4>
              <textarea 
                rows="3" 
                [(ngModel)]="approverNotes" 
                placeholder="Enter mandatory governance rationale, terms of payment, or reasons for return..."
                class="csp-textarea"
              ></textarea>
            </div>

            <!-- Decision Action Buttons -->
            <div class="decision-buttons-row">
              <button (click)="openDecisionModal('Return for Reassessment')" class="csp-btn csp-btn-secondary">
                <app-icon name="arrow-left" [size]="14"></app-icon>
                <span>Return for Reassessment</span>
              </button>
              <button (click)="openDecisionModal('Information Requested')" class="csp-btn csp-btn-secondary">
                <app-icon name="help-circle" [size]="14"></app-icon>
                <span>Request More Information</span>
              </button>
              <button (click)="openDecisionModal('Declined')" class="csp-btn csp-btn-danger">
                <app-icon name="x" [size]="14"></app-icon>
                <span>Decline / Close</span>
              </button>
              <button (click)="openDecisionModal('Approved')" class="csp-btn csp-btn-primary csp-btn-lg">
                <app-icon name="check-circle" [size]="16"></app-icon>
                <span>Approve for Settlement</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar: Checklist & Audit History -->
        <div class="sidebar-approval-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Pre-Approval Checklist</h4>
            </div>
            <div class="csp-card-body chk-body">
              <div class="chk-item checked">
                <app-icon name="check-circle" [size]="16" class="check-icon"></app-icon>
                <span>Police FIR / CSR Verified</span>
              </div>
              <div class="chk-item checked">
                <app-icon name="check-circle" [size]="16" class="check-icon"></app-icon>
                <span>DL & Insurance Parivahan Match</span>
              </div>
              <div class="chk-item checked">
                <app-icon name="check-circle" [size]="16" class="check-icon"></app-icon>
                <span>Medical Treatment Reconciled</span>
              </div>
              <div class="chk-item checked">
                <app-icon name="check-circle" [size]="16" class="check-icon"></app-icon>
                <span>Within Financial Delegated Limit</span>
              </div>
            </div>
          </div>

          <!-- Past Approvals Log -->
          <div class="csp-card" style="margin-top:1.5rem;">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Recent Authorizations</h4>
            </div>
            <div class="csp-card-body">
              <div *ngFor="let app of mockData.approvals().slice(0, 3)" class="app-log-entry">
                <div style="font-weight:700; font-size:0.85rem; color:var(--csp-charcoal);">{{ app.claimRef }} — {{ app.decision }}</div>
                <div style="font-size:0.78rem; color:var(--csp-warm-grey);">{{ app.approverName }} • ₹{{ (app.approvedAmount || app.proposedAmount).toLocaleString('en-IN') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirmation Modal -->
      <app-confirmation-modal
        [isOpen]="isModalOpen"
        [title]="'Confirm ' + pendingDecision"
        [message]="'Are you sure you want to record decision: ' + pendingDecision + ' for claim ' + (activeClaim?.id || activeClaim?.intimationRef) + '?'"
        [isDanger]="pendingDecision === 'Declined'"
        [confirmText]="'Confirm ' + pendingDecision"
        (confirm)="executeDecision()"
        (cancel)="isModalOpen = false"
      ></app-confirmation-modal>
    </div>
  `,
  styles: [`
    .approvals-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .select-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .dossier-grid { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 1.5rem; }
    .card-head-h3 { font-size: 1.2rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .sub-lead { font-size: 0.82rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .highlight-banner {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .hl-col { display: flex; flex-direction: column; gap: 0.25rem; }
    .hl-k { font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--csp-warm-grey); }
    .hl-v { font-size: 1.15rem; font-weight: 700; color: var(--csp-charcoal); }
    .text-ember { color: var(--csp-ember); }

    .dossier-section { margin-bottom: 1.5rem; }
    .sec-h4 { font-size: 0.95rem; font-weight: 700; color: var(--csp-charcoal); margin-bottom: 0.4rem; }
    .sec-p { font-size: 0.88rem; color: var(--csp-warm-grey); line-height: 1.6; }

    .decision-buttons-row {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
      padding-top: 1.25rem;
      border-top: 1px solid var(--csp-border);
      flex-wrap: wrap;
    }

    .chk-body { display: flex; flex-direction: column; gap: 0.75rem; }
    .chk-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.85rem; color: var(--csp-charcoal); }
    .check-icon { color: var(--csp-sage); }

    .app-log-entry { padding: 0.5rem 0; border-bottom: 1px solid var(--csp-bg-soft); }
    .app-log-entry:last-child { border-bottom: none; }

    .font-mono { font-family: monospace; }
    .font-semibold { font-weight: 600; }

    @media (max-width: 900px) {
      .dossier-grid { grid-template-columns: 1fr; }
      .highlight-banner { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class ApprovalsComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  selectedClaimRef = 'TP-2026-002104';
  activeClaim?: ClaimRecord;
  approverNotes = 'Approved under institutional delegated authority. Full and final discharge voucher mandated.';

  isModalOpen = false;
  pendingDecision: any = 'Approved';

  ngOnInit() {
    this.loadDossier(this.selectedClaimRef);
  }

  get pendingClaims(): ClaimRecord[] {
    return this.mockData.claims().filter(c => c.status === 'Pending Approval' || c.currentStage === 'Approvals' || c.id === 'TP-2026-002104');
  }

  loadDossier(ref: string) {
    this.selectedClaimRef = ref;
    this.activeClaim = this.mockData.getClaimById(ref) || this.mockData.claims()[0];
  }

  openDecisionModal(decision: string) {
    this.pendingDecision = decision;
    this.isModalOpen = true;
  }

  executeDecision() {
    if (!this.activeClaim) return;
    const ref = this.activeClaim.id || this.activeClaim.intimationRef;
    const amount = this.activeClaim.assessedAmount || this.activeClaim.claimedAmount;

    this.mockData.recordApprovalDecision(ref, this.pendingDecision, this.approverNotes, amount);
    this.isModalOpen = false;

    if (this.pendingDecision === 'Approved') {
      this.toast.success(
        `Claim ${ref} approved for settlement of ₹${amount.toLocaleString('en-IN')}. Transferred to Settlement Desk.`,
        'Approval Authorized'
      );
      this.router.navigate(['/ops/settlement-processing']);
    } else {
      this.toast.warning(`Claim ${ref} updated with decision: ${this.pendingDecision}.`);
    }
  }
}
