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
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Chain of Custody</div>
          <h1 class="page-main-title">Evidence & Material Repository</h1>
          <p class="page-sub">Central registry of physical, digital, and photographic evidence for all motor third-party claims.</p>
        </div>
        <div>
          <button (click)="openAddModal()" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Log New Evidence</span>
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="csp-card toolbar-card">
        <div class="toolbar-flex">
          <div class="search-box">
            <app-icon name="search" [size]="16" class="s-icon"></app-icon>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search evidence by claim ref, category, or description..." class="csp-input" style="padding-left:2.4rem;" />
          </div>
          <div class="filters-box">
            <select [(ngModel)]="categoryFilter" class="csp-select" style="width:auto;">
              <option value="ALL">All Categories</option>
              <option value="Accident Scene">Accident Scene</option>
              <option value="Vehicle Damage">Vehicle Damage</option>
              <option value="CCTV Footage">CCTV Footage</option>
              <option value="Witness Statement">Witness Statement</option>
            </select>
            <select [(ngModel)]="statusFilter" class="csp-select" style="width:auto;">
              <option value="ALL">All Review Statuses</option>
              <option value="Received">Received</option>
              <option value="Under Review">Under Review</option>
              <option value="Verified">Verified</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Evidence Table -->
      <div class="csp-table-wrapper">
        <table class="csp-table">
          <thead>
            <tr>
              <th>Evidence ID</th>
              <th>Claim Ref</th>
              <th>Category</th>
              <th>Description & Findings</th>
              <th>Source</th>
              <th>Received Date</th>
              <th>Reviewer</th>
              <th>Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ev of filteredEvidence">
              <td class="font-bold font-mono">{{ ev.id }}</td>
              <td>
                <a [routerLink]="['/ops/claim-360', ev.claimRef]" class="claim-link font-bold">
                  {{ ev.claimRef }}
                </a>
              </td>
              <td><span class="csp-badge csp-badge-ember">{{ ev.category }}</span></td>
              <td style="max-width: 280px;">
                <div style="font-weight: 600; color: var(--csp-charcoal);">{{ ev.description }}</div>
                <div style="font-size: 0.78rem; color: var(--csp-warm-grey); margin-top: 2px;">{{ ev.comments }}</div>
              </td>
              <td>{{ ev.source }}</td>
              <td>{{ ev.receivedDate }}</td>
              <td>{{ ev.reviewer }}</td>
              <td>
                <app-status-badge [status]="ev.reviewStatus"></app-status-badge>
              </td>
              <td style="text-align: right;">
                <button (click)="toggleVerified(ev)" class="csp-btn csp-btn-secondary csp-btn-sm">
                  {{ ev.reviewStatus === 'Verified' ? 'Re-open' : 'Verify' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
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
    .evidence-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .toolbar-card { padding: 1.25rem 1.5rem; }
    .toolbar-flex { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 280px; position: relative; }
    .s-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); }
    .filters-box { display: flex; gap: 0.75rem; }

    .claim-link { color: var(--csp-ember); text-decoration: none; }
    .claim-link:hover { text-decoration: underline; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
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
