import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { EvidenceItem } from '../../core/models/assessment.model';

@Component({
  selector: 'app-evidence',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="evidence-page">
      <!-- Page Top Header -->
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Chain of Custody</div>
          <h1 class="page-main-title">Evidence & Material Repository</h1>
          <p class="page-sub">Central registry of physical, digital, and photographic evidence for all motor third-party claims.</p>
        </div>
        <div>
          <button (click)="openAddModal()" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="15"></app-icon>
            <span>Log New Evidence</span>
          </button>
        </div>
      </div>

      <!-- Quick Metric Counters Row -->
      <div class="metric-summary-grid">
        <div class="metric-card">
          <div class="metric-icon-box ember">
            <app-icon name="archive" [size]="18"></app-icon>
          </div>
          <div class="metric-data">
            <span class="metric-label">Total Logged Evidence</span>
            <span class="metric-value">{{ mockData.evidenceItems().length }} Items</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box sage">
            <app-icon name="check-circle" [size]="18"></app-icon>
          </div>
          <div class="metric-data">
            <span class="metric-label">Verified Materials</span>
            <span class="metric-value">{{ getVerifiedCount() }} Verified</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box terracotta">
            <app-icon name="clock" [size]="18"></app-icon>
          </div>
          <div class="metric-data">
            <span class="metric-label">Pending Verification</span>
            <span class="metric-value">{{ getPendingCount() }} Pending</span>
          </div>
        </div>

        <div class="metric-card">
          <div class="metric-icon-box charcoal">
            <app-icon name="shield" [size]="18"></app-icon>
          </div>
          <div class="metric-data">
            <span class="metric-label">Claims Covered</span>
            <span class="metric-value">{{ getDistinctClaimsCount() }} Active Files</span>
          </div>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="csp-card toolbar-card">
        <div class="toolbar-flex">
          <div class="search-box">
            <app-icon name="search" [size]="15" class="s-icon"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search evidence by claim ref, category, or description..." 
              class="csp-input table-search" 
            />
          </div>
          <div class="filters-box">
            <select [(ngModel)]="categoryFilter" class="csp-select table-filter">
              <option value="ALL">All Categories</option>
              <option value="Accident Scene">Accident Scene</option>
              <option value="Vehicle Damage">Vehicle Damage</option>
              <option value="CCTV Footage">CCTV Footage</option>
              <option value="Witness Statement">Witness Statement</option>
              <option value="Police Spot Map">Police Spot Map</option>
            </select>
            <select [(ngModel)]="statusFilter" class="csp-select table-filter">
              <option value="ALL">All Review Statuses</option>
              <option value="Received">Received</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Even, Zero-Scroll Evidence Table -->
      <div class="table-card-wrapper">
        <div class="table-top-bar">
          <div class="table-title">
            <app-icon name="layers" [size]="15" class="table-icon"></app-icon>
            <span>Evidence Records Table</span>
            <span class="table-count-badge">{{ filteredEvidence.length }} of {{ mockData.evidenceItems().length }} Records</span>
          </div>
          <div class="table-legend">
            <span>Fixed column layout • Zero horizontal scroll • Hover for full notes</span>
          </div>
        </div>

        <div class="table-scroll-container">
          <table class="csp-table evidence-table">
            <colgroup>
              <col style="width: 8%;">
              <col style="width: 11%;">
              <col style="width: 11%;">
              <col style="width: 28%;">
              <col style="width: 12%;">
              <col style="width: 9%;">
              <col style="width: 9%;">
              <col style="width: 7%;">
              <col style="width: 5%;">
            </colgroup>
            <thead>
              <tr>
                <th class="col-id">Evidence ID</th>
                <th class="col-ref">Claim Ref</th>
                <th class="col-cat">Category</th>
                <th class="col-desc">Description & Findings</th>
                <th class="col-source">Source</th>
                <th class="col-date">Received Date</th>
                <th class="col-reviewer">Reviewer</th>
                <th class="col-status text-center">Status</th>
                <th class="col-action text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let ev of filteredEvidence">
                <td class="col-id">
                  <span class="id-badge">{{ ev.id }}</span>
                </td>
                <td class="col-ref">
                  <a [routerLink]="['/ops/claim-360', ev.claimRef]" class="claim-link" [title]="'Open ' + ev.claimRef">
                    {{ ev.claimRef }}
                  </a>
                </td>
                <td class="col-cat">
                  <span class="csp-badge" [ngClass]="getCategoryBadgeClass(ev.category)">{{ ev.category }}</span>
                </td>
                <td class="col-desc">
                  <div class="desc-col-content" [title]="ev.description + (ev.comments ? ' — ' + ev.comments : '')">
                    <span class="desc-main">{{ ev.description }}</span>
                    <span class="desc-sub" *ngIf="ev.comments">{{ ev.comments }}</span>
                  </div>
                </td>
                <td class="col-source">
                  <span class="source-text" [title]="ev.source">{{ ev.source }}</span>
                </td>
                <td class="col-date">
                  <span class="date-text">{{ ev.receivedDate }}</span>
                </td>
                <td class="col-reviewer">
                  <div class="reviewer-cell" [title]="ev.reviewer">
                    <span class="avatar-dot">{{ ev.reviewer.charAt(0) }}</span>
                    <span class="reviewer-name">{{ ev.reviewer }}</span>
                  </div>
                </td>
                <td class="col-status text-center">
                  <app-status-badge [status]="ev.reviewStatus"></app-status-badge>
                </td>
                <td class="col-action text-right">
                  <button 
                    (click)="toggleVerified(ev)" 
                    class="action-btn"
                    [ngClass]="ev.reviewStatus === 'Verified' ? 'reopen' : 'verify'"
                    [title]="ev.reviewStatus === 'Verified' ? 'Re-open for Review' : 'Mark as Verified'"
                  >
                    <app-icon [name]="ev.reviewStatus === 'Verified' ? 'rotate-ccw' : 'check'" [size]="12"></app-icon>
                    <span>{{ ev.reviewStatus === 'Verified' ? 'Re-open' : 'Verify' }}</span>
                  </button>
                </td>
              </tr>

              <tr *ngIf="filteredEvidence.length === 0">
                <td colspan="9" class="empty-table-cell">
                  <app-icon name="inbox" [size]="28" class="empty-icon"></app-icon>
                  <div class="empty-title">No matching evidence records found</div>
                  <div class="empty-sub">Try adjusting your search terms or category/status filters.</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="table-footer-bar">
          <span>Showing {{ filteredEvidence.length }} evidence items</span>
          <span>Chain of Custody Authenticated • Tamper-sealed Digital Evidence</span>
        </div>
      </div>

      <!-- Add Evidence Modal -->
      <div class="csp-modal-backdrop" *ngIf="isModalOpen" (click)="isModalOpen = false">
        <div class="csp-modal" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.15rem;">Log Evidentiary Material</h3>
            <button (click)="isModalOpen = false" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body">
            <div class="csp-form-group">
              <label class="csp-label">Associated Claim Reference</label>
              <select [(ngModel)]="newClaimRef" class="csp-select">
                <option *ngFor="let c of mockData.claims()" [value]="c.id || c.intimationRef">
                  {{ c.id || c.intimationRef }} ({{ c.claimantName }})
                </option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Evidence Category</label>
              <select [(ngModel)]="newCategory" class="csp-select">
                <option value="Accident Scene">Accident Scene</option>
                <option value="Vehicle Damage">Vehicle Damage</option>
                <option value="CCTV Footage">CCTV Footage</option>
                <option value="Witness Statement">Witness Statement</option>
                <option value="Police Spot Map">Police Spot Map</option>
                <option value="Forensic Report">Forensic Report</option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Description</label>
              <input type="text" [(ngModel)]="newDescription" placeholder="e.g. CCTV recording from junction traffic pole #12" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Origin / Source</label>
              <input type="text" [(ngModel)]="newSource" placeholder="e.g. Greater Chennai Traffic Police HQ" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Reviewer Notes</label>
              <textarea rows="2" [(ngModel)]="newComments" placeholder="Preliminary observations..." class="csp-textarea"></textarea>
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="isModalOpen = false" class="csp-btn csp-btn-secondary">Cancel</button>
            <button (click)="saveEvidence()" class="csp-btn csp-btn-primary">Save to Registry</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .evidence-page { 
      display: flex; 
      flex-direction: column; 
      gap: 1.15rem; 
      width: 100%;
      box-sizing: border-box;
    }

    .page-top-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .page-eyebrow { 
      font-size: 0.74rem; 
      font-weight: 700; 
      text-transform: uppercase; 
      color: var(--csp-ember); 
      letter-spacing: 0.05em; 
      margin-bottom: 0.2rem; 
    }
    .page-main-title { 
      font-size: 1.6rem; 
      font-weight: 800; 
      color: var(--csp-charcoal); 
      margin: 0; 
    }
    .page-sub { 
      color: var(--csp-warm-grey); 
      font-size: 0.88rem; 
      margin-top: 0.2rem; 
      margin-bottom: 0;
    }

    /* Metric Summary Grid */
    .metric-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      width: 100%;
      box-sizing: border-box;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.7rem 0.95rem;
      box-sizing: border-box;
      box-shadow: var(--csp-shadow-sm);
    }
    .metric-icon-box {
      width: 36px;
      height: 36px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .metric-icon-box.ember {
      background: rgba(232, 93, 50, 0.1);
      color: var(--csp-ember);
    }
    .metric-icon-box.sage {
      background: rgba(85, 116, 95, 0.1);
      color: var(--csp-sage);
    }
    .metric-icon-box.terracotta {
      background: rgba(197, 106, 74, 0.1);
      color: var(--csp-terracotta);
    }
    .metric-icon-box.charcoal {
      background: rgba(37, 35, 33, 0.08);
      color: var(--csp-charcoal);
    }
    .metric-data {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .metric-label {
      font-size: 0.68rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--csp-warm-grey);
      white-space: nowrap;
    }
    .metric-value {
      font-size: 0.92rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      white-space: nowrap;
    }

    /* Toolbar */
    .toolbar-card { 
      padding: 0.75rem 1rem; 
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-sm);
    }
    .toolbar-flex { 
      display: flex; 
      justify-content: space-between; 
      align-items: center;
      gap: 0.85rem; 
      flex-wrap: wrap; 
    }
    .search-box { 
      flex: 1; 
      min-width: 260px; 
      position: relative; 
    }
    .s-icon { 
      position: absolute; 
      left: 0.75rem; 
      top: 50%; 
      transform: translateY(-50%); 
      color: var(--csp-warm-grey); 
    }
    .csp-input.table-search {
      height: 36px;
      line-height: normal;
      padding: 0 0.75rem 0 2.2rem;
      font-size: 0.82rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      width: 100%;
      box-sizing: border-box;
    }
    .filters-box { 
      display: flex; 
      gap: 0.65rem; 
      align-items: center;
    }
    .csp-select.table-filter {
      height: 36px;
      padding: 0 1.8rem 0 0.65rem;
      font-size: 0.82rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      background-color: var(--csp-white);
      color: var(--csp-charcoal);
      appearance: none;
      -webkit-appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236B6764' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 0.65rem center;
      cursor: pointer;
    }

    /* Table Wrapper & Table Form */
    .table-card-wrapper {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-sm);
      overflow: hidden;
      width: 100%;
      box-sizing: border-box;
    }

    .table-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.6rem 1rem;
      background: var(--csp-white);
      border-bottom: 1px solid var(--csp-border);
    }
    .table-title {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    .table-icon {
      color: var(--csp-ember);
    }
    .table-count-badge {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.1);
      padding: 2px 7px;
      border-radius: var(--csp-radius-pill);
    }
    .table-legend {
      font-size: 0.72rem;
      color: var(--csp-warm-grey);
    }

    .table-scroll-container {
      width: 100%;
      overflow-x: hidden;
      box-sizing: border-box;
    }

    .evidence-table {
      width: 100%;
      table-layout: fixed;
      border-collapse: collapse;
      text-align: left;
      box-sizing: border-box;
    }

    .evidence-table th {
      background: var(--csp-ivory);
      height: 38px;
      padding: 0 0.85rem;
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--csp-warm-grey);
      border-bottom: 1px solid var(--csp-border);
      vertical-align: middle;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
    }

    .evidence-table td {
      height: 48px;
      padding: 0 0.85rem;
      font-size: 0.82rem;
      border-bottom: 1px solid var(--csp-border);
      color: var(--csp-charcoal);
      vertical-align: middle;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      box-sizing: border-box;
    }

    .evidence-table tbody tr {
      transition: background 0.15s ease;
    }
    .evidence-table tbody tr:hover {
      background: #FAF7F2;
    }
    .evidence-table tbody tr:last-child td {
      border-bottom: none;
    }

    .text-center { text-align: center; }
    .text-right { text-align: right; }

    .id-badge {
      font-family: monospace;
      font-weight: 800;
      color: var(--csp-charcoal);
      font-size: 0.8rem;
    }

    .claim-link {
      font-family: monospace;
      font-weight: 700;
      color: var(--csp-ember);
      text-decoration: none;
      font-size: 0.8rem;
    }
    .claim-link:hover {
      text-decoration: underline;
    }

    .desc-col-content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      overflow: hidden;
    }
    .desc-main {
      font-weight: 600;
      color: var(--csp-charcoal);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.25;
    }
    .desc-sub {
      font-size: 0.72rem;
      color: var(--csp-warm-grey);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      line-height: 1.25;
      margin-top: 2px;
    }

    .source-text {
      color: var(--csp-charcoal);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      display: block;
    }

    .date-text {
      font-family: monospace;
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
    }

    .reviewer-cell {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .avatar-dot {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: var(--csp-charcoal);
      color: var(--csp-white);
      font-weight: 700;
      font-size: 0.65rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .reviewer-name {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .action-btn {
      padding: 3px 8px;
      font-size: 0.72rem;
      font-weight: 700;
      border-radius: 4px;
      height: 26px;
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      cursor: pointer;
      border: 1px solid var(--csp-border);
      background: var(--csp-white);
      color: var(--csp-charcoal);
      transition: var(--csp-transition);
    }
    .action-btn.verify {
      border-color: rgba(85, 116, 95, 0.4);
      background: rgba(85, 116, 95, 0.08);
      color: var(--csp-sage);
    }
    .action-btn.verify:hover {
      background: var(--csp-sage);
      color: var(--csp-white);
    }
    .action-btn.reopen {
      border-color: rgba(232, 93, 50, 0.4);
      background: rgba(232, 93, 50, 0.08);
      color: var(--csp-ember);
    }
    .action-btn.reopen:hover {
      background: var(--csp-ember);
      color: var(--csp-white);
    }

    .empty-table-cell {
      padding: 2.5rem 1rem !important;
      text-align: center;
      color: var(--csp-warm-grey);
      background: var(--csp-white);
    }
    .empty-icon {
      color: var(--csp-border-dark);
      margin-bottom: 0.4rem;
    }
    .empty-title {
      font-size: 0.88rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 0.2rem;
    }
    .empty-sub {
      font-size: 0.76rem;
      color: var(--csp-warm-grey);
    }

    .table-footer-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.55rem 1rem;
      background: var(--csp-ivory);
      border-top: 1px solid var(--csp-border);
      font-size: 0.74rem;
      color: var(--csp-warm-grey);
    }

    @media (max-width: 960px) {
      .metric-summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      .table-scroll-container {
        overflow-x: auto;
      }
      .evidence-table {
        min-width: 900px;
      }
    }
    @media (max-width: 580px) {
      .metric-summary-grid {
        grid-template-columns: 1fr;
      }
      .toolbar-flex {
        flex-direction: column;
        align-items: stretch;
      }
      .filters-box {
        flex-direction: column;
      }
      .csp-select.table-filter {
        width: 100%;
      }
    }
  `]
})
export class EvidenceComponent {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);

  searchQuery = '';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';

  isModalOpen = false;
  newClaimRef = 'TP-2026-001842';
  newCategory: any = 'Accident Scene';
  newDescription = '';
  newSource = '';
  newComments = '';

  get filteredEvidence(): EvidenceItem[] {
    return this.mockData.evidenceItems().filter(e => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesQ = !q || e.claimRef.toLowerCase().includes(q) || e.description.toLowerCase().includes(q) || e.category.toLowerCase().includes(q);
      const matchesCat = this.categoryFilter === 'ALL' || e.category === this.categoryFilter;
      const matchesStat = this.statusFilter === 'ALL' || e.reviewStatus === this.statusFilter;
      return matchesQ && matchesCat && matchesStat;
    });
  }

  getVerifiedCount(): number {
    return this.mockData.evidenceItems().filter(e => e.reviewStatus === 'Verified').length;
  }

  getPendingCount(): number {
    return this.mockData.evidenceItems().filter(e => e.reviewStatus !== 'Verified').length;
  }

  getDistinctClaimsCount(): number {
    const claims = new Set(this.mockData.evidenceItems().map(e => e.claimRef));
    return claims.size;
  }

  getCategoryBadgeClass(category: string): string {
    switch (category) {
      case 'Accident Scene': return 'csp-badge-ember';
      case 'Vehicle Damage': return 'csp-badge-terracotta';
      case 'CCTV Footage': return 'csp-badge-charcoal';
      case 'Witness Statement': return 'csp-badge-sage';
      case 'Police Spot Map': return 'csp-badge-clay';
      default: return 'csp-badge-ember';
    }
  }

  toggleVerified(ev: EvidenceItem) {
    ev.reviewStatus = ev.reviewStatus === 'Verified' ? 'Under Review' : 'Verified';
    this.mockData.saveState();
    this.toast.success(`Evidence ID ${ev.id} marked as ${ev.reviewStatus}.`);
  }

  openAddModal() {
    this.newClaimRef = this.mockData.claims()[0]?.id || 'TP-2026-001842';
    this.newDescription = '';
    this.newSource = '';
    this.newComments = '';
    this.isModalOpen = true;
  }

  saveEvidence() {
    if (!this.newDescription.trim()) {
      this.toast.error('Please enter evidence description.');
      return;
    }
    const id = 'EVD-0' + (this.mockData.evidenceItems().length + 1);
    this.mockData.addEvidence({
      id,
      claimRef: this.newClaimRef,
      category: this.newCategory,
      description: this.newDescription,
      source: this.newSource || 'Internal Fieldwork',
      receivedDate: new Date().toISOString().split('T')[0],
      reviewer: this.mockData.currentUser().name,
      reviewStatus: 'Received',
      comments: this.newComments
    });
    this.toast.success(`Evidence ${id} added to chain of custody.`);
    this.isModalOpen = false;
  }
}
