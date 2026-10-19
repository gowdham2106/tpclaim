import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { DocumentRequest } from '../../../core/models/document.model';

@Component({
  selector: 'app-additional-documents',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="add-doc-page">
      <div class="add-doc-container">
        <!-- Top Back Bar -->
        <div class="top-nav-bar">
          <a [routerLink]="['/public/claim-details', claimRef]" class="csp-btn csp-btn-secondary csp-btn-sm">
            <app-icon name="arrow-left" [size]="14"></app-icon>
            Back to Claim File
          </a>
          <span class="ref-chip">Claim Ref: {{ claimRef }}</span>
        </div>

        <div class="csp-card doc-submission-card">
          <div class="card-header-block">
            <div class="step-tag">Requested Document Fulfillment</div>
            <h1 class="page-title">Submit Outstanding Claim Documentation</h1>
            <p class="page-desc">
              Your assigned claims handler has requested supplementary documentation to complete verification and proceed with liability assessment.
            </p>
          </div>

          <!-- Active Requests Selector if multiple exist -->
          <div class="requests-selector" *ngIf="requests.length > 0">
            <label class="csp-label">Select Requested Item to Fulfill:</label>
            <div class="req-cards-list">
              <div 
                *ngFor="let req of requests" 
                class="req-choice-card"
                [class.selected]="selectedRequestId === req.id"
                (click)="selectRequest(req)"
              >
                <div class="req-choice-header">
                  <span class="req-name">{{ req.requestedDocument }}</span>
                  <span class="csp-badge csp-badge-ember">{{ req.claimantStatus }}</span>
                </div>
                <div class="req-due-date">Due Date: {{ req.dueDate }} • Assigned Handler: {{ req.assignedHandler }}</div>
              </div>
            </div>
          </div>

          <!-- Active Selected Request Details -->
          <div class="selected-details-box" *ngIf="activeRequest">
            <div class="details-heading-row">
              <app-icon name="file-text" [size]="18" class="details-icon"></app-icon>
              <h3 class="req-h3">{{ activeRequest.requestedDocument }}</h3>
            </div>
            <div class="reason-block">
              <span class="reason-label">Official Reason for Request:</span>
              <p class="reason-text">{{ activeRequest.reason }}</p>
            </div>
            <div class="meta-row">
              <span>Category: <strong>{{ activeRequest.category }}</strong></span>
              <span>Requested on: <strong>{{ activeRequest.requestedDate }}</strong></span>
              <span>Deadline: <strong style="color:var(--csp-terracotta)">{{ activeRequest.dueDate }}</strong></span>
            </div>
          </div>

          <!-- Upload Dropzone Simulation -->
          <div class="upload-section">
            <div class="dropzone" (click)="fileInput.click()">
              <input 
                #fileInput 
                type="file" 
                (change)="onFileSelected($event)" 
                class="hidden-file-input" 
              />
              <div class="dropzone-content">
                <div class="upload-icon-circle">
                  <app-icon name="upload" [size]="28"></app-icon>
                </div>
                <div class="dropzone-title">Click to Browse or Drag File Here</div>
                <div class="dropzone-hint">Accepted formats: PDF, JPG, PNG, TIFF (Max 10MB per file)</div>
              </div>
            </div>

            <!-- Attached File Preview -->
            <div *ngIf="selectedFileName" class="attached-card">
              <div class="attached-info">
                <app-icon name="file-text" [size]="20" class="attached-icon"></app-icon>
                <div>
                  <div class="attached-name">{{ selectedFileName }}</div>
                  <div class="attached-size">{{ selectedFileSize }} • Ready to dispatch</div>
                </div>
              </div>
              <button (click)="clearFile()" class="clear-btn" title="Remove File">
                <app-icon name="x" [size]="16"></app-icon>
              </button>
            </div>
          </div>

          <!-- Claimant Comments Field -->
          <div class="csp-form-group" style="margin-top: 1.5rem;">
            <label class="csp-label">
              Claimant Comments or Clarifications
              <span class="optional-text">(Optional)</span>
            </label>
            <textarea 
              rows="3" 
              [(ngModel)]="comments" 
              placeholder="Add any clarifying remarks for the handler, doctor notes, or pharmacy cross-references..."
              class="csp-textarea"
            ></textarea>
          </div>

          <div class="card-footer-actions">
            <a [routerLink]="['/public/claim-details', claimRef]" class="csp-btn csp-btn-secondary">
              Cancel
            </a>
            <button 
              (click)="onSubmitDocument()" 
              class="csp-btn csp-btn-primary csp-btn-lg"
              [disabled]="!selectedFileName || isSubmitting"
            >
              <app-icon name="check-circle" [size]="16"></app-icon>
              <span>{{ isSubmitting ? 'Uploading & Dispatching...' : 'Submit Documents for Review' }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .add-doc-page { padding: 3rem 1.5rem 5rem; }
    .add-doc-container { max-width: 820px; margin: 0 auto; }

    .top-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .ref-chip {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--csp-warm-grey);
      background: var(--csp-ivory);
      padding: 0.3rem 0.75rem;
      border-radius: var(--csp-radius-pill);
      border: 1px solid var(--csp-border);
    }

    .doc-submission-card {
      padding: 2.5rem;
    }

    .card-header-block { margin-bottom: 2rem; }
    .step-tag { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--csp-ember); margin-bottom: 0.35rem; }
    .page-title { font-size: 1.85rem; font-weight: 800; color: var(--csp-charcoal); margin: 0 0 0.5rem; }
    .page-desc { color: var(--csp-warm-grey); font-size: 0.95rem; line-height: 1.55; }

    .requests-selector { margin-bottom: 1.5rem; }
    .req-cards-list { display: flex; flex-direction: column; gap: 0.65rem; margin-top: 0.5rem; }
    .req-choice-card {
      padding: 0.85rem 1.15rem;
      border: 2px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      cursor: pointer;
      background: var(--csp-white);
      transition: var(--csp-transition);
    }
    .req-choice-card:hover { border-color: var(--csp-clay-dark); }
    .req-choice-card.selected {
      border-color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.04);
    }

    .req-choice-header { display: flex; justify-content: space-between; align-items: center; }
    .req-name { font-size: 0.92rem; font-weight: 700; color: var(--csp-charcoal); }
    .req-due-date { font-size: 0.78rem; color: var(--csp-warm-grey); margin-top: 3px; }

    .selected-details-box {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem 1.5rem;
      margin-bottom: 1.75rem;
    }

    .details-heading-row { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.75rem; }
    .details-icon { color: var(--csp-ember); }
    .req-h3 { font-size: 1.05rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }

    .reason-block { margin-bottom: 0.75rem; }
    .reason-label { font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--csp-warm-grey); }
    .reason-text { font-size: 0.88rem; color: var(--csp-charcoal); margin-top: 2px; }

    .meta-row { display: flex; gap: 1.5rem; font-size: 0.82rem; color: var(--csp-warm-grey); flex-wrap: wrap; }

    /* Dropzone */
    .dropzone {
      border: 2px dashed var(--csp-border-dark);
      border-radius: var(--csp-radius-md);
      padding: 2.5rem 1.5rem;
      text-align: center;
      background: var(--csp-bg-soft);
      cursor: pointer;
      transition: var(--csp-transition);
    }
    .dropzone:hover {
      border-color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.04);
    }

    .hidden-file-input { display: none; }

    .upload-icon-circle {
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 0.75rem;
      color: var(--csp-ember);
      box-shadow: var(--csp-shadow-sm);
    }

    .dropzone-title { font-size: 1rem; font-weight: 700; color: var(--csp-charcoal); margin-bottom: 0.25rem; }
    .dropzone-hint { font-size: 0.8rem; color: var(--csp-warm-grey); }

    .attached-card {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.85rem 1.25rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      margin-top: 1rem;
      box-shadow: var(--csp-shadow-sm);
    }

    .attached-info { display: flex; align-items: center; gap: 0.75rem; }
    .attached-icon { color: var(--csp-ember); }
    .attached-name { font-size: 0.9rem; font-weight: 700; color: var(--csp-charcoal); }
    .attached-size { font-size: 0.78rem; color: var(--csp-warm-grey); }

    .clear-btn {
      background: none;
      border: none;
      color: var(--csp-warm-grey);
      cursor: pointer;
      padding: 4px;
    }
    .clear-btn:hover { color: var(--csp-error); }

    .card-footer-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid var(--csp-border);
      padding-top: 1.5rem;
      margin-top: 2rem;
    }

    @media (max-width: 600px) {
      .doc-submission-card { padding: 1.5rem; }
      .meta-row { flex-direction: column; gap: 0.4rem; }
      .card-footer-actions { flex-direction: column; gap: 1rem; }
      .card-footer-actions a, .card-footer-actions button { width: 100%; justify-content: center; }
    }
  `]
})
export class AdditionalDocumentsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private mockData = inject(MockDataService);
  private toast = inject(ToastService);

  claimRef = 'TP-2026-001842';
  requests: DocumentRequest[] = [];
  selectedRequestId = '';
  activeRequest?: DocumentRequest;

  selectedFileName = 'Discharge_Summary_Certified_Hospital.pdf';
  selectedFileSize = '2.4 MB';
  comments = 'Discharge summary signed by Dr. K. Radhakrishnan, Department of Orthopedics, MIOT Hospitals.';
  isSubmitting = false;

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.claimRef = params['id'] || 'TP-2026-001842';
      this.loadRequests();
    });
  }

  loadRequests() {
    this.requests = this.mockData.documentRequests().filter(
      r => r.claimRef === this.claimRef || r.claimRef === 'TP-2026-001842'
    );
    if (this.requests.length > 0) {
      this.selectRequest(this.requests[0]);
    }
  }

  selectRequest(req: DocumentRequest) {
    this.selectedRequestId = req.id;
    this.activeRequest = req;
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFileName = file.name;
      this.selectedFileSize = (file.size / 1024 / 1024).toFixed(2) + ' MB';
    }
  }

  clearFile() {
    this.selectedFileName = '';
    this.selectedFileSize = '';
  }

  onSubmitDocument() {
    if (!this.selectedFileName) {
      this.toast.error('Please attach a document file.');
      return;
    }

    this.isSubmitting = true;
    setTimeout(() => {
      this.mockData.submitDocumentResponse(
        this.selectedRequestId,
        this.selectedFileName,
        this.comments
      );
      this.isSubmitting = false;
      this.toast.success(
        `Document "${this.selectedFileName}" submitted. Status updated to "Submitted — Awaiting Review".`,
        'Document Dispatched'
      );
      this.router.navigate(['/public/claim-details', this.claimRef]);
    }, 800);
  }
}
