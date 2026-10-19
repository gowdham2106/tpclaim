import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { SettlementRecord } from '../../core/models/settlement.model';

@Component({
  selector: 'app-settlement-processing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="settlement-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Finance & Treasury Operations</div>
          <h1 class="page-main-title">Settlement Disbursement Processing</h1>
          <p class="page-sub">Electronic payout dispatch, bank mandate validation, and NEFT/RTGS transaction generation.</p>
        </div>
      </div>

      <!-- Select Case -->
      <div class="csp-card select-card">
        <label class="csp-label">Select Claim Ready for Disbursement:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedClaimRef" (ngModelChange)="loadSettlement($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let s of mockData.settlements()" [value]="s.claimRef">
              {{ s.claimRef }} — {{ s.beneficiaryName }} (₹{{ s.approvedAmount.toLocaleString('en-IN') }}) [{{ s.settlementStatus }}]
            </option>
            <option value="TP-2026-002104">TP-2026-002104 — Venkatesh Iyer (₹5,80,000) [Approved — Ready]</option>
          </select>
          <a [routerLink]="['/ops/claim-360', selectedClaimRef]" class="csp-btn csp-btn-secondary">
            <span>Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div class="settlement-grid">
        <!-- Settlement Mandate Card -->
        <div class="csp-card mandate-card">
          <div class="csp-card-header">
            <div>
              <h3 class="card-head-h3">Electronic Funds Transfer Mandate</h3>
              <div class="sub-lead">Automated clearing through Indian Banking RTGS/NEFT gateway simulation</div>
            </div>
            <span class="csp-badge" [ngClass]="currentRecord.settlementStatus === 'Completed' ? 'csp-badge-sage' : 'csp-badge-ember'">
              {{ currentRecord.settlementStatus }}
            </span>
          </div>

          <div class="csp-card-body">
            <!-- Amount Banner -->
            <div class="payout-banner">
              <div>
                <div class="payout-lbl">Authorized Payout Amount</div>
                <div class="payout-words">Direct Account Credit</div>
              </div>
              <div class="payout-sum font-mono">₹{{ currentRecord.approvedAmount.toLocaleString('en-IN') }}</div>
            </div>

            <!-- Beneficiary Banking Details -->
            <div class="form-grid-2" style="margin-top:1.5rem;">
              <div class="csp-form-group">
                <label class="csp-label">Beneficiary Account Name</label>
                <input type="text" [(ngModel)]="currentRecord.beneficiaryName" class="csp-input font-bold" />
              </div>
              <div class="csp-form-group">
                <label class="csp-label">Bank Name</label>
                <input type="text" [(ngModel)]="currentRecord.beneficiaryBank" class="csp-input" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">Masked Account Number</label>
                <input type="text" [(ngModel)]="currentRecord.accountNumberMasked" class="csp-input font-mono" />
              </div>
              <div class="csp-form-group">
                <label class="csp-label">IFSC Code</label>
                <input type="text" [(ngModel)]="currentRecord.ifscCode" class="csp-input font-mono font-bold" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">Transaction Reference (Generated)</label>
                <input type="text" [value]="currentRecord.transactionReference" class="csp-input font-mono font-bold text-ember" readonly />
              </div>
              <div class="csp-form-group">
                <label class="csp-label">Finance Review Status</label>
                <select [(ngModel)]="currentRecord.financeReviewStatus" class="csp-select">
                  <option value="Pending Review">Pending Review</option>
                  <option value="Finance Approved">Finance Approved</option>
                  <option value="Correction Needed">Correction Needed</option>
                </select>
              </div>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Settlement Audit Remarks</label>
              <textarea rows="2" [(ngModel)]="currentRecord.settlementNotes" class="csp-textarea"></textarea>
            </div>

            <!-- Dispatch Action -->
            <div class="payout-actions-bar">
              <div class="disclaimer-mini">
                <app-icon name="alert-circle" [size]="14"></app-icon>
                <span>Demo simulation only. No real banking transfer executed.</span>
              </div>
              <button 
                (click)="dispatchPayout()" 
                class="csp-btn csp-btn-primary csp-btn-lg"
                [disabled]="isProcessing || currentRecord.settlementStatus === 'Completed'"
              >
                <app-icon name="credit-card" [size]="16"></app-icon>
                <span>{{ isProcessing ? 'Executing Clearing Batch...' : (currentRecord.settlementStatus === 'Completed' ? 'Disbursed (Settled)' : 'Execute Simulated Payout') }}</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar: Mandate Verification Checklist -->
        <div class="sidebar-settle-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Mandate Verification Checklist</h4>
            </div>
            <div class="csp-card-body">
              <div class="mandate-item checked">
                <app-icon name="check-circle" [size]="16" class="check-icon"></app-icon>
                <div>
                  <strong>Form 109 Full Discharge Voucher</strong>
                  <div class="text-xs text-warm">Signed on ₹100 non-judicial stamp</div>
                </div>
              </div>
              <div class="mandate-item checked">
                <app-icon name="check-circle" [size]="16" class="check-icon"></app-icon>
                <div>
                  <strong>Cancelled Cheque / Bank Passbook</strong>
                  <div class="text-xs text-warm">Name and IFSC match bank records</div>
                </div>
              </div>
              <div class="mandate-item checked">
                <app-icon name="check-circle" [size]="16" class="check-icon"></app-icon>
                <div>
                  <strong>PAN & Aadhaar Masked Verification</strong>
                  <div class="text-xs text-warm">TDS compliance Section 194A verified</div>
                </div>
              </div>
            </div>
          </div>

          <div class="csp-card" style="margin-top:1.5rem;">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Direct Navigation</h4>
            </div>
            <div class="csp-card-body" style="display:flex; flex-direction:column; gap:0.5rem;">
              <a routerLink="/ops/payment-tracking" class="csp-btn csp-btn-secondary" style="justify-content:flex-start;">
                <app-icon name="clock" [size]="14"></app-icon>
                <span>Payment Tracking Registry</span>
              </a>
              <a routerLink="/ops/claim-closure" class="csp-btn csp-btn-secondary" style="justify-content:flex-start;">
                <app-icon name="lock" [size]="14"></app-icon>
                <span>Proceed to Claim Closure</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settlement-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .select-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .settlement-grid { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 1.5rem; }
    .card-head-h3 { font-size: 1.2rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .sub-lead { font-size: 0.82rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .payout-banner {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem 1.5rem;
    }
    .payout-lbl { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-warm-grey); }
    .payout-words { font-size: 0.8rem; color: var(--csp-charcoal); font-weight: 600; margin-top: 2px; }
    .payout-sum { font-size: 1.9rem; font-weight: 800; color: var(--csp-sage); }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }

    .payout-actions-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 1.25rem;
      border-top: 1px solid var(--csp-border);
      margin-top: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .disclaimer-mini { display: flex; align-items: center; gap: 0.4rem; font-size: 0.76rem; color: var(--csp-terracotta); }

    .mandate-item { display: flex; gap: 0.65rem; margin-bottom: 0.85rem; }
    .check-icon { color: var(--csp-sage); margin-top: 2px; }
    .text-xs { font-size: 0.75rem; }
    .text-warm { color: var(--csp-warm-grey); }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-ember { color: var(--csp-ember); }

    @media (max-width: 900px) {
      .settlement-grid { grid-template-columns: 1fr; }
      .form-grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class SettlementProcessingComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  selectedClaimRef = 'TP-2026-002189';
  currentRecord: SettlementRecord = {
    id: 'SET-01',
    claimRef: 'TP-2026-002189',
    approvedAmount: 260000,
    beneficiaryName: 'Gurpreet Singh',
    beneficiaryBank: 'State Bank of India',
    accountNumberMasked: '•••• •••• 9921',
    ifscCode: 'SBIN0001428',
    mandateVerified: true,
    financeReviewStatus: 'Finance Approved',
    settlementStatus: 'Processing',
    transactionReference: 'TXN-CSP-2026-88192',
    initiatedDate: '2026-03-11',
    settlementNotes: 'Direct bank mandate validated with cancelled cheque copy.'
  };

  isProcessing = false;

  ngOnInit() {
    this.loadSettlement(this.selectedClaimRef);
  }

  loadSettlement(ref: string) {
    this.selectedClaimRef = ref;
    const existing = this.mockData.settlements().find(s => s.claimRef === ref);
    if (existing) {
      this.currentRecord = { ...existing };
    } else {
      // Default for newly approved claim (e.g. TP-2026-002104)
      this.currentRecord = {
        id: 'SET-' + Math.floor(100 + Math.random() * 900),
        claimRef: ref,
        approvedAmount: 580000,
        beneficiaryName: 'Venkatesh Iyer',
        beneficiaryBank: 'HDFC Bank',
        accountNumberMasked: '•••• •••• 3310',
        ifscCode: 'HDFC0000184',
        mandateVerified: true,
        financeReviewStatus: 'Finance Approved',
        settlementStatus: 'Ready for Processing',
        transactionReference: 'TXN-CSP-2026-90412',
        initiatedDate: new Date().toISOString().split('T')[0],
        settlementNotes: 'Surveyor approved garage mandate.'
      };
    }
  }

  dispatchPayout() {
    this.isProcessing = true;
    setTimeout(() => {
      this.isProcessing = false;
      this.currentRecord.settlementStatus = 'Completed';
      this.mockData.processSettlement(this.currentRecord);
      this.toast.success(
        `Disbursement of ₹${this.currentRecord.approvedAmount.toLocaleString('en-IN')} completed via simulated NEFT. Ref: ${this.currentRecord.transactionReference}`,
        'Payout Dispatched'
      );
      this.router.navigate(['/ops/payment-tracking']);
    }, 1000);
  }
}
