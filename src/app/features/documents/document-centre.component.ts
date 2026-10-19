import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { DocumentItem } from '../../core/models/document.model';

@Component({
  selector: 'app-document-centre',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="doc-centre-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Enterprise Electronic Records</div>
          <h1 class="page-main-title">Central Claims Document Vault</h1>
          <p class="page-sub">Central repository for FIR copies, medical records, invoices, photos, and legal submissions.</p>
        </div>
        <div style="display:flex; gap:0.75rem;">
          <a routerLink="/ops/document-verification" class="csp-btn csp-btn-secondary">
            <app-icon name="check-circle" [size]="14"></app-icon>
            <span>Verification Desk</span>
          </a>
          <button (click)="openUploadModal()" class="csp-btn csp-btn-primary">
            <app-icon name="upload" [size]="14"></app-icon>
            <span>Upload Document</span>
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="csp-card toolbar-card">
        <div class="toolbar-flex">
          <div class="search-box">
            <app-icon name="search" [size]="16" class="s-icon"></app-icon>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by claim reference, filename, document title..." class="csp-input" style="padding-left:2.4rem;" />
          </div>
          <div class="filters-box">
            <select [(ngModel)]="categoryFilter" class="csp-select" style="width:auto;">
              <option value="ALL">All Categories</option>
              <option value="Police & FIR">Police & FIR</option>
              <option value="Claimant Identity">Claimant Identity</option>
              <option value="Medical Records">Medical Records</option>
              <option value="Medical Bills">Medical Bills</option>
              <option value="Accident & Vehicle Photos">Accident & Vehicle Photos</option>
              <option value="Property Damage / Repair Estimate">Property Damage / Repair Estimate</option>
              <option value="Legal & MACT Documents">Legal & MACT Documents</option>
            </select>
            <select [(ngModel)]="statusFilter" class="csp-select" style="width:auto;">
              <option value="ALL">All Statuses</option>
              <option value="Verified">Verified</option>
              <option value="Under Review">Under Review</option>
              <option value="Submitted — Awaiting Review">Submitted — Awaiting Review</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Documents Table -->
      <div class="csp-table-wrapper">
        <table class="csp-table">
          <thead>
            <tr>
              <th>Document Title & File</th>
              <th>Claim Reference</th>
              <th>Category</th>
              <th>Uploaded By</th>
              <th>Upload Date</th>
              <th>Version</th>
              <th>Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let doc of filteredDocs">
              <td>
                <div class="doc-lead">
                  <app-icon name="file-text" [size]="16" class="lead-icon"></app-icon>
                  <span class="font-bold">{{ doc.name }}</span>
                </div>
                <div class="doc-sub">{{ doc.fileName }} ({{ doc.fileSize }})</div>
              </td>
              <td>
                <a [routerLink]="['/ops/claim-360', doc.claimRef]" class="claim-link font-mono font-bold">
                  {{ doc.claimRef }}
                </a>
              </td>
              <td>{{ doc.category }}</td>
              <td>{{ doc.uploadedBy }}</td>
              <td>{{ doc.uploadDate }}</td>
              <td><span class="csp-badge csp-badge-charcoal">v{{ doc.version }}.0</span></td>
              <td><app-status-badge [status]="doc.status"></app-status-badge></td>
              <td style="text-align: right;">
                <button (click)="previewDoc(doc)" class="csp-btn csp-btn-secondary csp-btn-sm" title="Preview Document">
                  <app-icon name="eye" [size]="12"></app-icon>
                  <span>Preview</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Document Preview Modal Simulation -->
      <div class="csp-modal-backdrop" *ngIf="previewModalDoc" (click)="previewModalDoc = null">
        <div class="csp-modal" style="max-width:680px;" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.1rem;">{{ previewModalDoc.name }}</h3>
            <button (click)="previewModalDoc = null" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body" *ngIf="previewModalDoc">
            <div class="preview-box">
              <app-icon name="file-text" [size]="48" style="color:var(--csp-ember); margin-bottom:0.75rem;"></app-icon>
              <div class="font-bold text-charcoal">{{ previewModalDoc.fileName }}</div>
              <div class="text-warm text-sm">{{ previewModalDoc.fileType }} • {{ previewModalDoc.fileSize }}</div>
              <div class="preview-watermark">CLAIMSHIELD PLUS COMPLIANCE ARCHIVE</div>
            </div>
            <div class="preview-meta-row" style="margin-top:1.25rem;">
              <div><span>Claim:</span> <strong>{{ previewModalDoc.claimRef }}</strong></div>
              <div><span>Uploader:</span> <strong>{{ previewModalDoc.uploadedBy }}</strong></div>
              <div><span>Status:</span> <app-status-badge [status]="previewModalDoc.status"></app-status-badge></div>
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="previewModalDoc = null" class="csp-btn csp-btn-primary">Close Preview</button>
          </div>
        </div>
      </div>

      <!-- Upload Modal Simulation -->
      <div class="csp-modal-backdrop" *ngIf="isUploadModalOpen" (click)="isUploadModalOpen = false">
        <div class="csp-modal" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.15rem;">Upload Document to Vault</h3>
            <button (click)="isUploadModalOpen = false" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body">
            <div class="csp-form-group">
              <label class="csp-label">Associated Claim Reference</label>
              <select [(ngModel)]="uploadClaimRef" class="csp-select">
                <option *ngFor="let c of mockData.claims()" [value]="c.id || c.intimationRef">
                  {{ c.id || c.intimationRef }} ({{ c.claimantName }})
                </option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Document Title</label>
              <input type="text" [(ngModel)]="uploadDocName" placeholder="e.g. MVI Mechanical Fitness Certificate" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Category</label>
              <select [(ngModel)]="uploadCategory" class="csp-select">
                <option value="Police & FIR">Police & FIR</option>
                <option value="Claimant Identity">Claimant Identity</option>
                <option value="Medical Records">Medical Records</option>
                <option value="Medical Bills">Medical Bills</option>
                <option value="Accident & Vehicle Photos">Accident & Vehicle Photos</option>
                <option value="Property Damage / Repair Estimate">Property Damage / Repair Estimate</option>
                <option value="Legal & MACT Documents">Legal & MACT Documents</option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">File Name Simulation</label>
              <input type="text" [(ngModel)]="uploadFileName" placeholder="e.g. MVI_Report_Signed.pdf" class="csp-input" />
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="isUploadModalOpen = false" class="csp-btn csp-btn-secondary">Cancel</button>
            <button (click)="confirmUpload()" class="csp-btn csp-btn-primary">Store in Vault</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .doc-centre-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .toolbar-card { padding: 1.25rem 1.5rem; }
    .toolbar-flex { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 280px; position: relative; }
    .s-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); }
    .filters-box { display: flex; gap: 0.75rem; flex-wrap: wrap; }

    .doc-lead { display: flex; align-items: center; gap: 0.4rem; color: var(--csp-charcoal); }
    .lead-icon { color: var(--csp-ember); }
    .doc-sub { font-size: 0.75rem; color: var(--csp-warm-grey); margin-left: 20px; }

    .claim-link { color: var(--csp-ember); text-decoration: none; }
    .claim-link:hover { text-decoration: underline; }

    .preview-box {
      background: var(--csp-ivory);
      border: 2px dashed var(--csp-clay-dark);
      border-radius: var(--csp-radius-md);
      padding: 3rem 1.5rem;
      text-align: center;
      position: relative;
    }
    .preview-watermark {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--csp-warm-grey-light);
      margin-top: 1rem;
    }

    .preview-meta-row { display: flex; justify-content: space-between; font-size: 0.86rem; color: var(--csp-warm-grey); }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-charcoal { color: var(--csp-charcoal); }
    .text-warm { color: var(--csp-warm-grey); }
    .text-sm { font-size: 0.82rem; }
  `]
})
export class DocumentCentreComponent {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);

  searchQuery = '';
  categoryFilter = 'ALL';
  statusFilter = 'ALL';

  previewModalDoc: DocumentItem | null = null;
  isUploadModalOpen = false;

  uploadClaimRef = 'TP-2026-001842';
  uploadDocName = '';
  uploadCategory: any = 'Medical Records';
  uploadFileName = '';

  get filteredDocs(): DocumentItem[] {
    return this.mockData.documents().filter(d => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesQ = !q || d.name.toLowerCase().includes(q) || d.fileName.toLowerCase().includes(q) || d.claimRef.toLowerCase().includes(q);
      const matchesCat = this.categoryFilter === 'ALL' || d.category === this.categoryFilter;
      const matchesStat = this.statusFilter === 'ALL' || d.status === this.statusFilter;
      return matchesQ && matchesCat && matchesStat;
    });
  }

  previewDoc(doc: DocumentItem) {
    this.previewModalDoc = doc;
  }

  openUploadModal() {
    this.uploadClaimRef = this.mockData.claims()[0]?.id || 'TP-2026-001842';
    this.uploadDocName = '';
    this.uploadFileName = '';
    this.isUploadModalOpen = true;
  }

  confirmUpload() {
    if (!this.uploadDocName.trim()) {
      this.toast.error('Please enter document title.');
      return;
    }
    const newDoc: DocumentItem = {
      id: 'DOC-' + Math.floor(100 + Math.random() * 900),
      claimRef: this.uploadClaimRef,
      name: this.uploadDocName,
      category: this.uploadCategory,
      fileName: this.uploadFileName || (this.uploadDocName.replace(/\s+/g, '_') + '.pdf'),
      fileSize: '1.8 MB',
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: this.mockData.currentUser().name,
      version: 1,
      status: 'Under Review'
    };
    this.mockData.documents.update(docs => [newDoc, ...docs]);
    this.mockData.saveState();
    this.toast.success(`Uploaded "${newDoc.name}" to vault.`);
    this.isUploadModalOpen = false;
  }
}
