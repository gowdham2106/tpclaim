import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { PaymentTransaction } from '../../core/models/settlement.model';

@Component({
  selector: 'app-payment-tracking',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="payment-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Electronic Remittance Registry</div>
          <h1 class="page-main-title">Payment & UTR Reconciliation</h1>
          <p class="page-sub">Track electronic NEFT and RTGS payment batches, UTR confirmations, and beneficiary vouchers.</p>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="csp-card toolbar-card">
        <div class="toolbar-flex">
          <div class="search-box">
            <app-icon name="search" [size]="16" class="s-icon"></app-icon>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by claim number, transaction ref, beneficiary, or UTR..." class="csp-input" style="padding-left:2.4rem;" />
          </div>
          <div class="filters-box">
            <select [(ngModel)]="statusFilter" class="csp-select" style="width:auto;">
              <option value="ALL">All Payment Statuses</option>
              <option value="Settled">Settled</option>
              <option value="In Process">In Process</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Payments Table -->
      <div class="csp-table-wrapper">
        <table class="csp-table">
          <thead>
            <tr>
              <th>Txn Reference</th>
              <th>Claim Number</th>
              <th>Beneficiary Name</th>
              <th>Mode</th>
              <th>Amount Disbursed</th>
              <th>Initiated Date</th>
              <th>Status</th>
              <th>Bank UTR Reference</th>
              <th style="text-align: right;">Voucher</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of filteredPayments">
              <td class="font-mono font-bold">{{ p.transactionRef }}</td>
              <td>
                <a [routerLink]="['/ops/claim-360', p.claimRef]" class="claim-link font-mono font-bold">
                  {{ p.claimRef }}
                </a>
              </td>
              <td class="font-semibold">{{ p.beneficiaryName }}</td>
              <td><span class="csp-badge csp-badge-charcoal">{{ p.paymentMode }}</span></td>
              <td class="font-mono font-bold" style="color:var(--csp-sage); font-size:1rem;">
                ₹{{ p.amount.toLocaleString('en-IN') }}
              </td>
              <td>{{ p.requestDate }}</td>
              <td>
                <app-status-badge [status]="p.paymentStatus"></app-status-badge>
              </td>
              <td class="font-mono text-warm" style="font-size:0.8rem;">
                {{ p.utrNumber || 'Pending Gateway Cycle' }}
              </td>
              <td style="text-align: right;">
                <button (click)="openVoucher(p)" class="csp-btn csp-btn-secondary csp-btn-sm">
                  <app-icon name="file-text" [size]="12"></app-icon>
                  <span>View Slip</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Electronic Payment Advice Voucher Modal -->
      <div class="csp-modal-backdrop" *ngIf="selectedVoucher" (click)="selectedVoucher = null">
        <div class="csp-modal" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.15rem;">Electronic Payment Advice (Form 109)</h3>
            <button (click)="selectedVoucher = null" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body" *ngIf="selectedVoucher">
            <div class="voucher-top-box">
              <div class="v-brand">ClaimShield Plus Motor Assurance Operations</div>
              <div class="v-ref">Disbursement UTR: {{ selectedVoucher.utrNumber || 'Simulated Batch' }}</div>
            </div>

            <div class="v-grid">
              <div class="v-row"><span>Claim Number:</span><strong>{{ selectedVoucher.claimRef }}</strong></div>
              <div class="v-row"><span>Transaction Reference:</span><strong class="font-mono">{{ selectedVoucher.transactionRef }}</strong></div>
              <div class="v-row"><span>Beneficiary:</span><strong>{{ selectedVoucher.beneficiaryName }}</strong></div>
              <div class="v-row"><span>Payment Mode:</span><strong>{{ selectedVoucher.paymentMode }} Electronic Transfer</strong></div>
              <div class="v-row"><span>Disbursed Amount:</span><strong class="font-mono" style="color:var(--csp-sage); font-size:1.1rem;">₹{{ selectedVoucher.amount.toLocaleString('en-IN') }}</strong></div>
              <div class="v-row"><span>Date Completed:</span><strong>{{ selectedVoucher.completionDate || selectedVoucher.requestDate }}</strong></div>
            </div>

            <div class="v-disclaimer">
              Fictional demonstration voucher generated by ClaimShield Plus Claims Core engine.
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="selectedVoucher = null" class="csp-btn csp-btn-primary">Close Voucher</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .payment-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .toolbar-card { padding: 1.25rem 1.5rem; }
    .toolbar-flex { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 280px; position: relative; }
    .s-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); }

    .claim-link { color: var(--csp-ember); text-decoration: none; }
    .claim-link:hover { text-decoration: underline; }

    .voucher-top-box {
      background: var(--csp-ivory);
      padding: 1rem;
      border-radius: var(--csp-radius-sm);
      margin-bottom: 1.25rem;
      text-align: center;
      border: 1px dashed var(--csp-clay-dark);
    }
    .v-brand { font-weight: 800; color: var(--csp-charcoal); font-size: 0.95rem; }
    .v-ref { font-family: monospace; font-size: 0.8rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .v-grid { display: flex; flex-direction: column; gap: 0.65rem; }
    .v-row { display: flex; justify-content: space-between; font-size: 0.88rem; border-bottom: 1px solid var(--csp-bg-soft); padding-bottom: 0.4rem; }
    .v-row span { color: var(--csp-warm-grey); }

    .v-disclaimer {
      font-size: 0.76rem;
      color: var(--csp-warm-grey);
      margin-top: 1.25rem;
      text-align: center;
    }

    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .text-warm { color: var(--csp-warm-grey); }
  `]
})
export class PaymentTrackingComponent {
  mockData = inject(MockDataService);

  searchQuery = '';
  statusFilter = 'ALL';
  selectedVoucher: PaymentTransaction | null = null;

  get filteredPayments(): PaymentTransaction[] {
    return this.mockData.payments().filter(p => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesQ = !q || p.claimRef.toLowerCase().includes(q) || p.transactionRef.toLowerCase().includes(q) || p.beneficiaryName.toLowerCase().includes(q) || (p.utrNumber && p.utrNumber.toLowerCase().includes(q));
      const matchesStatus = this.statusFilter === 'ALL' || p.paymentStatus === this.statusFilter;
      return matchesQ && matchesStatus;
    });
  }

  openVoucher(payment: PaymentTransaction) {
    this.selectedVoucher = payment;
  }
}
