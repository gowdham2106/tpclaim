import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { DocumentItem } from '../../core/models/document.model';

@Component({
  selector: 'app-document-verification',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="verification-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Authentication & Scrutiny</div>
          <h1 class="page-main-title">Document Scrutiny & Verification Desk</h1>
          <p class="page-sub">Examine uploaded evidentiary records against legal and medical compliance checklists.</p>
        </div>
      </div>

      <!-- Select Document to Verify -->
      <div class="csp-card select-card">
        <label class="csp-label">Select Document Awaiting Verification:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedDocId" (ngModelChange)="loadDoc($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let d of mockData.documents()" [value]="d.id">
              {{ d.name }} — {{ d.claimRef }} [{{ d.status }}] (Uploaded: {{ d.uploadDate }})
            </option>
          </select>
          <a [routerLink]="['/ops/claim-360', activeDoc?.claimRef]" class="csp-btn csp-btn-secondary">
            <span>View Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div *ngIf="activeDoc" class="verification-grid">
        <!-- Left: Document Preview Placeholder & Metadata -->
        <div class="csp-card preview-panel-card">
          <div class="csp-card-header">
            <div>
              <h3 class="card-head-h3">{{ activeDoc.name }}</h3>
              <div class="doc-sub-text">File: {{ activeDoc.fileName }} ({{ activeDoc.fileSize }})</div>
            </div>
            <app-status-badge [status]="activeDoc.status"></app-status-badge>
          </div>

          <div class="csp-card-body">
            <!-- Simulated Inspection Canvas -->
            <div class="document-inspection-canvas">
              <div class="canvas-header-strip">
                <app-icon name="file-text" [size]="20" style="color:var(--csp-ember)"></app-icon>
                <span class="font-bold">{{ activeDoc.name }}</span>
                <span class="canvas-badge">ORIGINAL SUBMISSION</span>
              </div>
              <div class="canvas-content-box">
                <div class="stamp-seal">
                  <div class="seal-inner">
                    <span>POLICE / HOSPITAL</span>
                    <strong>AUTHENTICATED COPY</strong>
                    <span>CLAIMSHIELD PLUS TP</span>
                  </div>
                </div>
                <div class="sample-doc-lines">
                  <div class="line w-80"></div>
                  <div class="line w-60"></div>
                  <div class="line w-90"></div>
                  <div class="line w-40"></div>
                  <div class="line w-75"></div>
                </div>
              </div>
            </div>

            <!-- Metadata info -->
            <div class="meta-pairs-grid" style="margin-top:1.5rem;">
              <div class="m-pair"><span>Category:</span><strong>{{ activeDoc.category }}</strong></div>
              <div class="m-pair"><span>Uploaded By:</span><strong>{{ activeDoc.uploadedBy }}</strong></div>
              <div class="m-pair"><span>Upload Date:</span><strong>{{ activeDoc.uploadDate }}</strong></div>
              <div class="m-pair"><span>Version:</span><strong>v{{ activeDoc.version }}.0</strong></div>
            </div>
          </div>
        </div>

        <!-- Right: Verification Checklist & Action Form -->
        <div class="verification-action-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Compliance Verification Checklist</h4>
            </div>
            <div class="csp-card-body">
              <div class="checklist-items">
                <label class="check-box-row">
                  <input type="checkbox" [(ngModel)]="chkLegibility" />
                  <span>Document is clearly legible, unblurred, and intact</span>
                </label>
                <label class="check-box-row">
                  <input type="checkbox" [(ngModel)]="chkSignSeal" />
                  <span>Official rubber stamp and authorized signature present</span>
                </label>
                <label class="check-box-row">
                  <input type="checkbox" [(ngModel)]="chkMatchingParticulars" />
                  <span>Names, dates, and vehicle numbers match intimation facts</span>
                </label>
                <label class="check-box-row">
                  <input type="checkbox" [(ngModel)]="chkNoTampering" />
                  <span>No forensic evidence of alteration or digital tampering</span>
                </label>
              </div>

              <div class="csp-form-group" style="margin-top:1.25rem;">
                <label class="csp-label">Scrutiny Remarks / Rejection Rationale</label>
                <textarea rows="3" [(ngModel)]="reviewNotes" placeholder="Enter findings, verification notes, or detailed reason if rejecting..." class="csp-textarea"></textarea>
              </div>

              <!-- Action buttons -->
              <div class="action-buttons-stack">
                <button (click)="onVerify()" class="csp-btn csp-btn-sage" style="width:100%;">
                  <app-icon name="check-circle" [size]="16"></app-icon>
                  <span>Mark Verified</span>
                </button>
                <button (click)="onRequestReplacement()" class="csp-btn csp-btn-secondary" style="width:100%;">
                  <app-icon name="refresh-cw" [size]="14"></app-icon>
                  <span>Request Replacement Copy</span>
                </button>
                <button (click)="onReject()" class="csp-btn csp-btn-danger" style="width:100%;">
                  <app-icon name="x-circle" [size]="16"></app-icon>
                  <span>Reject with Reason</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .verification-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .select-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .verification-grid { display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.5rem; }
    .card-head-h3 { font-size: 1.15rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .doc-sub-text { font-size: 0.8rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .document-inspection-canvas {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      overflow: hidden;
    }

    .canvas-header-strip {
      background: var(--csp-white);
      padding: 0.65rem 1rem;
      border-bottom: 1px solid var(--csp-border);
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .canvas-badge {
      margin-left: auto;
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--csp-terracotta);
      background: var(--csp-clay);
      padding: 2px 6px;
      border-radius: 4px;
    }

    .canvas-content-box {
      padding: 2.5rem 2rem;
      position: relative;
      min-height: 220px;
    }

    .stamp-seal {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      transform: rotate(-12deg);
      border: 2px solid rgba(197, 106, 74, 0.4);
      padding: 6px;
      border-radius: 8px;
    }
    .seal-inner {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: var(--csp-terracotta);
      font-size: 0.65rem;
      font-weight: 800;
      letter-spacing: 0.05em;
    }

    .sample-doc-lines { display: flex; flex-direction: column; gap: 12px; }
    .line { height: 10px; background: rgba(37, 35, 33, 0.1); border-radius: 4px; }
    .w-80 { width: 80%; }
    .w-60 { width: 60%; }
    .w-90 { width: 90%; }
    .w-40 { width: 40%; }
    .w-75 { width: 75%; }

    .meta-pairs-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.86rem; }
    .m-pair { display: flex; justify-content: space-between; border-bottom: 1px solid var(--csp-bg-soft); padding-bottom: 0.35rem; }
    .m-pair span { color: var(--csp-warm-grey); }

    .checklist-items { display: flex; flex-direction: column; gap: 0.85rem; }
    .check-box-row { display: flex; align-items: flex-start; gap: 0.65rem; font-size: 0.86rem; color: var(--csp-charcoal); cursor: pointer; }
    .check-box-row input { accent-color: var(--csp-sage); width: 16px; height: 16px; margin-top: 2px; }

    .action-buttons-stack { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 1.5rem; }

    @media (max-width: 900px) {
      .verification-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class DocumentVerificationComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);

  selectedDocId = 'DOC-03';
  activeDoc?: DocumentItem;

  chkLegibility = true;
  chkSignSeal = true;
  chkMatchingParticulars = true;
  chkNoTampering = true;

  reviewNotes = 'Discharge summary signed by attending orthopedist. Patient admission records confirmed.';

  ngOnInit() {
    this.loadDoc(this.selectedDocId);
  }

  loadDoc(id: string) {
    this.selectedDocId = id;
    this.activeDoc = this.mockData.documents().find(d => d.id === id) || this.mockData.documents()[0];
  }

  onVerify() {
    if (!this.activeDoc) return;
    this.mockData.verifyDocument(this.activeDoc.id);
    this.activeDoc.status = 'Verified';
    this.toast.success(`Document ${this.activeDoc.name} marked as Verified!`);
  }

  onRequestReplacement() {
    if (!this.activeDoc) return;
    this.activeDoc.status = 'Replacement Requested';
    this.mockData.saveState();
    this.toast.warning(`Replacement requested for ${this.activeDoc.name}. Claimant notified.`);
  }

  onReject() {
    if (!this.activeDoc) return;
    this.mockData.rejectDocument(this.activeDoc.id, this.reviewNotes || 'Document illegible or missing official doctor stamp.');
    this.activeDoc.status = 'Rejected';
    this.toast.error(`Document rejected. Status updated.`);
  }
}
