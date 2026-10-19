import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { CommunicationLog } from '../../core/models/task.model';

@Component({
  selector: 'app-communication-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="breadcrumb-trail">
            <a routerLink="/ops/dashboard">Operations</a>
            <span class="sep">/</span>
            <span class="current">Communication History</span>
          </div>
          <h1 class="page-title">Communication & Interaction Log</h1>
          <p class="page-subtitle">Unified chronological audit trail of phone calls, email dispatches, SMS notices, and legal summons.</p>
        </div>
        <div class="header-actions">
          <button (click)="openLogModal()" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="16"></app-icon>
            Log New Interaction
          </button>
        </div>
      </div>

      <!-- Summary Metrics -->
      <div class="comm-metrics-row">
        <div class="c-stat-card">
          <div class="c-icon-wrap ember">
            <app-icon name="message-square" [size]="20"></app-icon>
          </div>
          <div class="c-stat-info">
            <div class="c-stat-val">{{ mockData.communications().length }}</div>
            <div class="c-stat-lbl">Total Interactions</div>
          </div>
        </div>
        <div class="c-stat-card">
          <div class="c-icon-wrap terracotta">
            <app-icon name="phone" [size]="20"></app-icon>
          </div>
          <div class="c-stat-info">
            <div class="c-stat-val">{{ callsCount() }}</div>
            <div class="c-stat-lbl">Telephony Calls Logged</div>
          </div>
        </div>
        <div class="c-stat-card">
          <div class="c-icon-wrap sage">
            <app-icon name="mail" [size]="20"></app-icon>
          </div>
          <div class="c-stat-info">
            <div class="c-stat-val">{{ digitalNoticesCount() }}</div>
            <div class="c-stat-lbl">Email & SMS Dispatches</div>
          </div>
        </div>
        <div class="c-stat-card">
          <div class="c-icon-wrap charcoal">
            <app-icon name="scale" [size]="20"></app-icon>
          </div>
          <div class="c-stat-info">
            <div class="c-stat-val">{{ legalNoticesCount() }}</div>
            <div class="c-stat-lbl">Legal & MACT Summons</div>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="csp-card filter-toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16" class="search-ico"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search by claim ID, participants, or conversation summary..." 
            class="csp-input search-input"
          />
        </div>

        <div class="filter-group">
          <label>Type:</label>
          <select [(ngModel)]="typeFilter" class="csp-select">
            <option value="All">All Types</option>
            <option value="Outbound Call">Outbound Call</option>
            <option value="Inbound Call">Inbound Call</option>
            <option value="Email">Email</option>
            <option value="SMS">SMS Notice</option>
            <option value="Legal Notice">Legal Notice</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Claim:</label>
          <select [(ngModel)]="claimFilter" class="csp-select">
            <option value="All">All Claims</option>
            <option *ngFor="let c of mockData.claims()" [value]="c.id">{{ c.id }} ({{ c.claimantName }})</option>
          </select>
        </div>
      </div>

      <!-- Chronological Interactions Timeline / Card Feed -->
      <div class="interactions-feed">
        <div *ngFor="let comm of filteredCommunications()" class="comm-card">
          <div class="comm-type-stripe" [ngClass]="getTypeClass(comm.type)"></div>

          <div class="comm-card-body">
            <div class="comm-top-bar">
              <div class="type-and-claim">
                <span class="type-badge" [ngClass]="getTypeClass(comm.type)">
                  <app-icon [name]="getTypeIcon(comm.type)" [size]="13"></app-icon>
                  {{ comm.type }}
                </span>
                <a [routerLink]="['/ops/claim-360', comm.claimRef]" class="claim-badge-link">
                  <app-icon name="file-text" [size]="12"></app-icon>
                  {{ comm.claimRef }}
                </a>
              </div>

              <div class="timestamp-box">
                <app-icon name="clock" [size]="12"></app-icon>
                <span>{{ comm.date }} • {{ comm.time }}</span>
              </div>
            </div>

            <div class="participants-line">
              <span class="part-label">Participants:</span>
              <span class="part-val">{{ comm.participants }}</span>
            </div>

            <div class="summary-box">
              <p class="summary-text">{{ comm.summary }}</p>
            </div>

            <div class="comm-footer">
              <div class="status-wrap">
                <span class="status-pill" [class.success]="comm.status === 'Connected' || comm.status === 'Delivered'">
                  {{ comm.status }}
                </span>
              </div>
              <div class="logged-by">
                <app-icon name="user" [size]="12"></app-icon>
                <span>Logged by <strong>{{ comm.loggedBy }}</strong></span>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredCommunications().length === 0" class="csp-card empty-card">
          <app-icon name="message-square" [size]="40" class="empty-ico"></app-icon>
          <h3>No communication logs found</h3>
          <p>No records match your search query or filter selection.</p>
        </div>
      </div>

      <!-- Log Interaction Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="phone" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="modal-title">Log Communication / Interaction</h3>
                <p class="modal-subtitle">Record calls, legal dispatches, or claimant correspondence for audit compliance.</p>
              </div>
            </div>
            <button class="modal-close-btn" (click)="closeModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Claim Reference <span class="req">*</span></label>
                <select [(ngModel)]="newComm.claimRef" class="csp-select w-full">
                  <option value="">-- Choose Claim --</option>
                  <option *ngFor="let c of mockData.claims()" [value]="c.id">
                    {{ c.id }} — {{ c.claimantName }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Communication Type <span class="req">*</span></label>
                <select [(ngModel)]="newComm.type" class="csp-select w-full">
                  <option value="Outbound Call">Outbound Call</option>
                  <option value="Inbound Call">Inbound Call</option>
                  <option value="Email">Email</option>
                  <option value="SMS">SMS Notice</option>
                  <option value="Legal Notice">Legal Notice</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Date <span class="req">*</span></label>
                <input type="date" [(ngModel)]="newComm.date" class="csp-input w-full" />
              </div>
              <div class="form-group">
                <label class="form-label">Time <span class="req">*</span></label>
                <input type="time" [(ngModel)]="newComm.time" class="csp-input w-full" />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Participants <span class="req">*</span></label>
              <input 
                type="text" 
                [(ngModel)]="newComm.participants" 
                placeholder="e.g. Handler Ananya Raman & Claimant Ravi Kumar (+91 98401 23456)" 
                class="csp-input w-full"
              />
            </div>

            <div class="form-group">
              <label class="form-label">Call / Delivery Status</label>
              <select [(ngModel)]="newComm.status" class="csp-select w-full">
                <option value="Connected">Connected / Answered</option>
                <option value="Delivered">Delivered</option>
                <option value="Pending Callback">Pending Callback</option>
                <option value="Failed">Unreachable / Failed</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Detailed Discussion Summary / Notes <span class="req">*</span></label>
              <textarea 
                rows="4" 
                [(ngModel)]="newComm.summary" 
                placeholder="Key details discussed, commitments made, claimant requests, or legal advisories provided..." 
                class="csp-textarea w-full"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="closeModal()" class="csp-btn csp-btn-outline">Cancel</button>
            <button (click)="saveCommunication()" class="csp-btn csp-btn-primary">
              <app-icon name="check" [size]="15"></app-icon>
              Save Communication Record
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1300px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--csp-warm-grey);
      margin-bottom: 0.35rem;
    }
    .breadcrumb-trail a {
      color: var(--csp-warm-grey);
      text-decoration: none;
    }
    .breadcrumb-trail a:hover {
      color: var(--csp-ember);
    }
    .breadcrumb-trail .current {
      color: var(--csp-charcoal);
      font-weight: 600;
    }
    .page-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0 0 0.25rem 0;
    }
    .page-subtitle {
      color: var(--csp-warm-grey);
      font-size: 0.9rem;
      margin: 0;
    }

    /* Metrics Row */
    .comm-metrics-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .c-stat-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--csp-shadow-sm);
    }
    .c-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .c-icon-wrap.ember { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .c-icon-wrap.terracotta { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .c-icon-wrap.sage { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .c-icon-wrap.charcoal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }

    .c-stat-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--csp-charcoal);
    }
    .c-stat-lbl {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      font-weight: 600;
    }

    /* Filter Toolbar */
    .filter-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
    }
    .search-ico {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--csp-warm-grey);
    }
    .search-input {
      padding-left: 36px !important;
      width: 100%;
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }

    /* Feed of Cards */
    .interactions-feed {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }
    .comm-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      display: flex;
      overflow: hidden;
      box-shadow: var(--csp-shadow-sm);
      transition: all 0.2s ease;
    }
    .comm-card:hover {
      box-shadow: var(--csp-shadow-md);
      border-color: var(--csp-warm-grey-light);
    }
    .comm-type-stripe {
      width: 6px;
      flex-shrink: 0;
    }
    .comm-type-stripe.outbound { background: var(--csp-ember); }
    .comm-type-stripe.inbound { background: var(--csp-terracotta); }
    .comm-type-stripe.email { background: var(--csp-sage); }
    .comm-type-stripe.sms { background: var(--csp-warm-grey); }
    .comm-type-stripe.legal { background: var(--csp-charcoal); }

    .comm-card-body {
      flex: 1;
      padding: 1.25rem 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .comm-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .type-and-claim {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .type-badge {
      font-size: 0.75rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }
    .type-badge.outbound { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .type-badge.inbound { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .type-badge.email { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .type-badge.sms { background: rgba(117, 109, 101, 0.12); color: var(--csp-warm-grey); }
    .type-badge.legal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }

    .claim-badge-link {
      font-family: monospace;
      font-weight: 700;
      font-size: 0.82rem;
      color: var(--csp-charcoal);
      text-decoration: none;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      padding: 2px 7px;
      border-radius: 4px;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .claim-badge-link:hover {
      border-color: var(--csp-ember);
      color: var(--csp-ember);
    }
    .timestamp-box {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
      display: flex;
      align-items: center;
      gap: 4px;
    }
    .participants-line {
      font-size: 0.85rem;
      color: var(--csp-charcoal);
    }
    .part-label {
      color: var(--csp-warm-grey);
      font-weight: 600;
      margin-right: 0.4rem;
    }
    .part-val {
      font-weight: 700;
    }
    .summary-box {
      background: var(--csp-ivory-light);
      border-radius: var(--csp-radius-sm);
      padding: 0.85rem 1rem;
      border: 1px solid var(--csp-border-light);
    }
    .summary-text {
      font-size: 0.88rem;
      color: var(--csp-charcoal);
      line-height: 1.5;
      margin: 0;
    }
    .comm-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.25rem;
      font-size: 0.78rem;
    }
    .status-pill {
      font-size: 0.72rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 12px;
      background: var(--csp-ivory);
      color: var(--csp-warm-grey-dark);
      border: 1px solid var(--csp-border);
    }
    .status-pill.success {
      background: rgba(85, 116, 95, 0.1);
      color: var(--csp-sage);
      border-color: rgba(85, 116, 95, 0.3);
    }
    .logged-by {
      color: var(--csp-warm-grey);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .empty-card {
      text-align: center;
      padding: 3rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--csp-warm-grey);
    }
    .empty-ico {
      color: var(--csp-clay);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(37, 35, 33, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }
    .modal-dialog {
      background: var(--csp-white);
      border-radius: var(--csp-radius-md);
      width: 100%;
      max-width: 620px;
      box-shadow: var(--csp-shadow-lg);
      border: 1px solid var(--csp-border);
      overflow: hidden;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--csp-border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: var(--csp-ivory-light);
    }
    .modal-title-wrap {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .modal-icon-badge {
      width: 38px;
      height: 38px;
      border-radius: var(--csp-radius-sm);
      background: var(--csp-ember);
      color: var(--csp-white);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .modal-subtitle {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      margin: 0.15rem 0 0 0;
    }
    .modal-close-btn {
      background: none;
      border: none;
      color: var(--csp-warm-grey);
      cursor: pointer;
    }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .req {
      color: var(--csp-ember);
    }
    .w-full {
      width: 100%;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      background: var(--csp-ivory-light);
      border-top: 1px solid var(--csp-border);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class CommunicationHistoryComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  searchQuery = '';
  typeFilter = 'All';
  claimFilter = 'All';

  // Modal
  isModalOpen = false;
  newComm: any = {
    claimRef: '',
    type: 'Outbound Call',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().substring(0, 5),
    participants: '',
    summary: '',
    status: 'Connected'
  };

  // Metrics
  callsCount = computed(() => 
    this.mockData.communications().filter(c => c.type.includes('Call')).length
  );
  digitalNoticesCount = computed(() => 
    this.mockData.communications().filter(c => c.type === 'Email' || c.type === 'SMS').length
  );
  legalNoticesCount = computed(() => 
    this.mockData.communications().filter(c => c.type === 'Legal Notice').length
  );

  filteredCommunications = computed(() => {
    let list = this.mockData.communications();
    if (this.typeFilter !== 'All') {
      list = list.filter(c => c.type === this.typeFilter);
    }
    if (this.claimFilter !== 'All') {
      list = list.filter(c => c.claimRef === this.claimFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(c => 
        c.claimRef.toLowerCase().includes(q) ||
        c.participants.toLowerCase().includes(q) ||
        c.summary.toLowerCase().includes(q) ||
        c.loggedBy.toLowerCase().includes(q)
      );
    }
    return list;
  });

  getTypeClass(type: string): string {
    switch (type) {
      case 'Outbound Call': return 'outbound';
      case 'Inbound Call': return 'inbound';
      case 'Email': return 'email';
      case 'SMS': return 'sms';
      case 'Legal Notice': return 'legal';
      default: return 'outbound';
    }
  }

  getTypeIcon(type: string): string {
    switch (type) {
      case 'Outbound Call': return 'phone-forwarded';
      case 'Inbound Call': return 'phone-incoming';
      case 'Email': return 'mail';
      case 'SMS': return 'message-circle';
      case 'Legal Notice': return 'scale';
      default: return 'message-square';
    }
  }

  openLogModal() {
    this.newComm = {
      claimRef: this.mockData.claims()[0]?.id || 'TP-2026-001842',
      type: 'Outbound Call',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().substring(0, 5),
      participants: `${this.mockData.currentUser().name} & Ravi Kumar (Claimant)`,
      summary: '',
      status: 'Connected'
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveCommunication() {
    if (!this.newComm.claimRef || !this.newComm.participants || !this.newComm.summary) {
      this.toast.showError('Required Fields Missing', 'Please select a claim and provide participants and summary.');
      return;
    }

    this.mockData.addCommunicationLog({
      claimRef: this.newComm.claimRef,
      date: this.newComm.date,
      time: this.newComm.time,
      type: this.newComm.type,
      participants: this.newComm.participants,
      summary: this.newComm.summary,
      status: this.newComm.status,
      loggedBy: this.mockData.currentUser().name
    });

    this.toast.showSuccess(
      'Communication Logged',
      `${this.newComm.type} recorded for claim ${this.newComm.claimRef}.`
    );
    this.closeModal();
  }
}
