import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { DocumentRequest, DocumentCategory } from '../../core/models/document.model';

@Component({
  selector: 'app-document-requests',
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
            <a routerLink="/ops/document-centre">Document Management</a>
            <span class="sep">/</span>
            <span class="current">Additional Document Requests</span>
          </div>
          <h1 class="page-title">Additional Document Requests</h1>
          <p class="page-subtitle">Track, dispatch, and process formal document requisitions issued to third-party claimants.</p>
        </div>
        <div class="header-actions">
          <button (click)="openCreateModal()" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="16"></app-icon>
            Issue Document Request
          </button>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="stats-row">
        <div class="stat-card">
          <div class="stat-icon-wrap ember">
            <app-icon name="upload" [size]="20"></app-icon>
          </div>
          <div class="stat-meta">
            <div class="stat-label">Total Requests</div>
            <div class="stat-val">{{ mockData.documentRequests().length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap clay">
            <app-icon name="clock" [size]="20"></app-icon>
          </div>
          <div class="stat-meta">
            <div class="stat-label">Awaiting Claimant</div>
            <div class="stat-val">{{ awaitingClaimantCount() }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap sage">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="stat-meta">
            <div class="stat-label">Submitted by Claimant</div>
            <div class="stat-val">{{ submittedCount() }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon-wrap charcoal">
            <app-icon name="check" [size]="20"></app-icon>
          </div>
          <div class="stat-meta">
            <div class="stat-label">Fulfilled & Closed</div>
            <div class="stat-val">{{ completedCount() }}</div>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="csp-card filter-toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16" class="search-ico"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchTerm" 
            placeholder="Search by claim ID, document name, or reason..." 
            class="csp-input search-input"
          />
        </div>
        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="selectedStatus" class="csp-select">
            <option value="All">All Statuses</option>
            <option value="Requested">Requested (Pending)</option>
            <option value="Submitted — Awaiting Review">Submitted by Claimant</option>
            <option value="Completed">Completed</option>
            <option value="Waived">Waived</option>
          </select>
        </div>
        <div class="filter-group">
          <label>Category:</label>
          <select [(ngModel)]="selectedCategory" class="csp-select">
            <option value="All">All Categories</option>
            <option value="Medical Records">Medical Records</option>
            <option value="Police / Legal">Police / Legal</option>
            <option value="Repair & Property Damage">Repair & Property</option>
            <option value="Identity Proof">Identity Proof</option>
            <option value="Other Supporting">Other Supporting</option>
          </select>
        </div>
      </div>

      <!-- Requests Table -->
      <div class="csp-card table-card">
        <div class="table-responsive">
          <table class="csp-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Claim Ref</th>
                <th>Requested Document</th>
                <th>Category</th>
                <th>Reason / Justification</th>
                <th>Issue Date</th>
                <th>Due Date</th>
                <th>Claimant Status</th>
                <th>Handler</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let req of filteredRequests()">
                <td>
                  <span class="req-id">{{ req.id }}</span>
                </td>
                <td>
                  <a [routerLink]="['/ops/claim-360', req.claimRef]" class="claim-link" title="Open Claim 360 Workspace">
                    {{ req.claimRef }}
                  </a>
                </td>
                <td>
                  <div class="doc-name-cell">
                    <strong>{{ req.requestedDocument }}</strong>
                    <div *ngIf="req.submittedFile" class="submitted-file-tag">
                      <app-icon name="file" [size]="12"></app-icon>
                      {{ req.submittedFile }}
                    </div>
                  </div>
                </td>
                <td>
                  <span class="cat-pill">{{ req.category }}</span>
                </td>
                <td>
                  <span class="reason-text" [title]="req.reason">{{ req.reason }}</span>
                </td>
                <td class="date-cell">{{ req.requestedDate }}</td>
                <td>
                  <span class="due-date" [class.overdue]="isOverdue(req.dueDate, req.claimantStatus)">
                    {{ req.dueDate }}
                  </span>
                </td>
                <td>
                  <app-status-badge [status]="req.claimantStatus"></app-status-badge>
                </td>
                <td class="handler-cell">{{ req.assignedHandler }}</td>
                <td style="text-align: right;">
                  <div class="action-btn-group">
                    <button 
                      *ngIf="req.claimantStatus === 'Requested'" 
                      (click)="sendReminder(req)" 
                      class="csp-btn-sm" 
                      title="Send SMS / Email reminder to claimant"
                    >
                      <app-icon name="bell" [size]="13"></app-icon>
                      Remind
                    </button>
                    <button 
                      *ngIf="req.claimantStatus === 'Submitted — Awaiting Review'"
                      [routerLink]="['/ops/document-verification']" 
                      class="csp-btn-sm csp-btn-ember"
                      title="Verify submitted file"
                    >
                      <app-icon name="check-circle" [size]="13"></app-icon>
                      Verify
                    </button>
                    <button 
                      *ngIf="req.claimantStatus !== 'Completed' && req.claimantStatus !== 'Waived'"
                      (click)="markCompleted(req)" 
                      class="csp-btn-sm"
                      title="Mark as completed or fulfilled"
                    >
                      <app-icon name="check" [size]="13"></app-icon>
                      Close
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredRequests().length === 0">
                <td colspan="10" class="empty-row">
                  <div class="empty-state">
                    <app-icon name="files" [size]="36" class="empty-icon"></app-icon>
                    <h3>No document requests match your criteria</h3>
                    <p>Adjust your search query or status filter to see requests.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create New Request Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="upload" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="modal-title">Issue New Document Request</h3>
                <p class="modal-subtitle">Official requisition sent directly to claimant with tracking alert.</p>
              </div>
            </div>
            <button class="modal-close-btn" (click)="closeModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Select Claim Reference <span class="req">*</span></label>
              <select [(ngModel)]="newRequest.claimRef" class="csp-select w-full">
                <option value="">-- Choose Claim --</option>
                <option *ngFor="let c of mockData.claims()" [value]="c.id">
                  {{ c.id }} — {{ c.claimantName }} ({{ c.lossType }})
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Document Title / Name <span class="req">*</span></label>
              <input 
                type="text" 
                [(ngModel)]="newRequest.requestedDocument" 
                placeholder="e.g. Itemised Hospital Discharge Bill with Pharmacy Breakdown" 
                class="csp-input w-full"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Document Category <span class="req">*</span></label>
                <select [(ngModel)]="newRequest.category" class="csp-select w-full">
                  <option value="Medical Records">Medical Records</option>
                  <option value="Police / Legal">Police / Legal</option>
                  <option value="Repair & Property Damage">Repair & Property Damage</option>
                  <option value="Identity Proof">Identity Proof</option>
                  <option value="Legal Representative Authority">Legal Representative Authority</option>
                  <option value="Other Supporting">Other Supporting</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Submission Due Date <span class="req">*</span></label>
                <input 
                  type="date" 
                  [(ngModel)]="newRequest.dueDate" 
                  class="csp-input w-full"
                />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Reason / Justification for Claimant <span class="req">*</span></label>
              <textarea 
                rows="3" 
                [(ngModel)]="newRequest.reason" 
                placeholder="Explain clearly why this document is required to proceed with compensation or liability evaluation..." 
                class="csp-textarea w-full"
              ></textarea>
              <span class="field-hint">This text will be visible to the claimant on their public tracking portal.</span>
            </div>

            <div class="checkbox-line">
              <input type="checkbox" id="sendAlert" [(ngModel)]="sendClaimantNotification" />
              <label for="sendAlert">Send simulated SMS and email notification to claimant immediately</label>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="closeModal()" class="csp-btn csp-btn-outline">Cancel</button>
            <button (click)="saveRequest()" class="csp-btn csp-btn-primary">
              <app-icon name="send" [size]="15"></app-icon>
              Issue Requisition
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
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

    /* Stats Row */
    .stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--csp-shadow-sm);
    }
    .stat-icon-wrap {
      width: 44px;
      height: 44px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .stat-icon-wrap.ember { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .stat-icon-wrap.clay { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .stat-icon-wrap.sage { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .stat-icon-wrap.charcoal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }

    .stat-label {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      font-weight: 600;
    }
    .stat-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--csp-charcoal);
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
      flex: 1;
      min-width: 260px;
      position: relative;
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

    /* Table */
    .table-card {
      padding: 0;
      overflow: hidden;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .req-id {
      font-family: monospace;
      font-weight: 700;
      color: var(--csp-charcoal);
      font-size: 0.85rem;
    }
    .claim-link {
      font-weight: 700;
      color: var(--csp-ember);
      text-decoration: none;
    }
    .claim-link:hover {
      text-decoration: underline;
    }
    .doc-name-cell strong {
      display: block;
      color: var(--csp-charcoal);
      font-size: 0.88rem;
    }
    .submitted-file-tag {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.75rem;
      color: var(--csp-sage);
      background: rgba(85, 116, 95, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      margin-top: 3px;
    }
    .cat-pill {
      font-size: 0.78rem;
      padding: 3px 8px;
      border-radius: 12px;
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
      border: 1px solid var(--csp-border);
      white-space: nowrap;
    }
    .reason-text {
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      font-size: 0.82rem;
      color: var(--csp-warm-grey-dark);
      max-width: 220px;
    }
    .date-cell {
      font-size: 0.82rem;
      color: var(--csp-warm-grey);
    }
    .due-date {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }
    .due-date.overdue {
      color: #B91C1C;
      font-weight: 700;
    }
    .handler-cell {
      font-size: 0.82rem;
      color: var(--csp-charcoal);
    }
    .action-btn-group {
      display: flex;
      justify-content: flex-end;
      gap: 0.4rem;
    }
    .csp-btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: var(--csp-radius-sm);
      border: 1px solid var(--csp-border);
      background: var(--csp-white);
      color: var(--csp-charcoal);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .csp-btn-sm:hover {
      background: var(--csp-ivory);
      border-color: var(--csp-warm-grey);
    }
    .csp-btn-sm.csp-btn-ember {
      background: var(--csp-ember);
      color: var(--csp-white);
      border-color: var(--csp-ember);
    }
    .csp-btn-sm.csp-btn-ember:hover {
      background: #D04F27;
    }

    .empty-row {
      text-align: center;
      padding: 3rem 1rem;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--csp-warm-grey);
    }
    .empty-icon {
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
      max-width: 580px;
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
    .field-hint {
      font-size: 0.75rem;
      color: var(--csp-warm-grey);
    }
    .checkbox-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--csp-charcoal);
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
export class DocumentRequestsComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  searchTerm = '';
  selectedStatus = 'All';
  selectedCategory = 'All';

  // Modal state
  isModalOpen = false;
  sendClaimantNotification = true;
  newRequest = {
    claimRef: '',
    requestedDocument: '',
    category: 'Medical Records' as DocumentCategory,
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    reason: ''
  };

  // Metrics
  awaitingClaimantCount = computed(() => 
    this.mockData.documentRequests().filter(r => r.claimantStatus === 'Requested').length
  );
  submittedCount = computed(() => 
    this.mockData.documentRequests().filter(r => r.claimantStatus === 'Submitted — Awaiting Review').length
  );
  completedCount = computed(() => 
    this.mockData.documentRequests().filter(r => r.claimantStatus === 'Completed' || r.claimantStatus === 'Waived').length
  );

  filteredRequests = computed(() => {
    let list = this.mockData.documentRequests();
    if (this.selectedStatus !== 'All') {
      list = list.filter(r => r.claimantStatus === this.selectedStatus);
    }
    if (this.selectedCategory !== 'All') {
      list = list.filter(r => r.category === this.selectedCategory);
    }
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      list = list.filter(r => 
        r.id.toLowerCase().includes(q) ||
        r.claimRef.toLowerCase().includes(q) ||
        r.requestedDocument.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q)
      );
    }
    return list;
  });

  isOverdue(dueDateStr: string, status: string): boolean {
    if (status === 'Completed' || status === 'Waived') return false;
    const due = new Date(dueDateStr);
    return due.getTime() < Date.now();
  }

  sendReminder(req: DocumentRequest) {
    this.toast.showSuccess(
      `Claimant Reminder Sent`, 
      `Simulated SMS & Email notice dispatched for ${req.requestedDocument} on claim ${req.claimRef}.`
    );
  }

  markCompleted(req: DocumentRequest) {
    this.mockData.closeDocumentRequest(req.id, 'Completed');
    this.toast.showSuccess(
      'Document Requisition Closed',
      `Requisition ${req.id} marked as satisfied and closed.`
    );
  }

  openCreateModal() {
    this.newRequest = {
      claimRef: this.mockData.claims()[0]?.id || 'TP-2026-001842',
      requestedDocument: '',
      category: 'Medical Records',
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      reason: ''
    };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveRequest() {
    if (!this.newRequest.claimRef || !this.newRequest.requestedDocument || !this.newRequest.reason) {
      this.toast.showError('Required Information Missing', 'Please fill in claim reference, document title, and reason.');
      return;
    }

    this.mockData.requestDocument(
      this.newRequest.claimRef,
      this.newRequest.requestedDocument,
      this.newRequest.category,
      this.newRequest.reason,
      this.newRequest.dueDate
    );

    this.toast.showSuccess(
      'Document Request Issued',
      `Requisition for "${this.newRequest.requestedDocument}" sent to claimant for claim ${this.newRequest.claimRef}.`
    );
    this.closeModal();
  }
}
