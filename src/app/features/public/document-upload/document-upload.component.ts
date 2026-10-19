import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IntimationWizardService } from '../intimation-wizard.service';
import { ToastService } from '../../../core/services/toast.service';

interface ChecklistDoc {
  id: string;
  category: string;
  title: string;
  description: string;
  isRequired: boolean;
  uploadedFileName?: string;
  uploadedSize?: string;
  isUploading?: boolean;
}

@Component({
  selector: 'app-document-upload',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Symmetrical 3-Stage Progress Timeline with 3 Equal Columns -->
        <div class="stepper-grid">
          <div class="step-card completed">
            <div class="step-badge">✓</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 1 of 3</span>
              <span class="step-title">Accident & Parties Data</span>
            </div>
          </div>
          <div class="step-card active">
            <div class="step-badge">2</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 2 of 3</span>
              <span class="step-title">Document Upload</span>
            </div>
          </div>
          <div class="step-card">
            <div class="step-badge">3</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 3 of 3</span>
              <span class="step-title">Review & Declaration</span>
            </div>
          </div>
        </div>

        <div class="csp-card wizard-card compact-wizard-card">
          <div class="form-title-bar">
            <div class="form-title-left">
              <span class="step-pill">Section 2: Document Part</span>
              <h2 class="form-main-heading">Supporting Document Uploads</h2>
            </div>
            <span class="fields-hint">Attach copies of available evidence (PDF, JPG, PNG)</span>
          </div>

          <!-- Document Upload Checklist Cards (2-Column Grid) -->
          <div class="doc-checklist-grid">
            <div *ngFor="let item of checklist" class="doc-upload-card" [class.has-file]="!!item.uploadedFileName">
              <div class="doc-card-header">
                <div class="doc-title-row">
                  <h4 class="doc-title">{{ item.title }}</h4>
                  <span class="csp-badge" [ngClass]="item.isRequired ? 'csp-badge-ember' : 'csp-badge-charcoal'">
                    {{ item.isRequired ? 'Mandatory' : 'Optional' }}
                  </span>
                </div>
                <p class="doc-desc">{{ item.description }}</p>
              </div>

              <!-- Uploading simulated state -->
              <div *ngIf="item.isUploading" class="upload-progress-box">
                <app-icon name="refresh-cw" [size]="14" class="spin-icon"></app-icon>
                <span>Simulating file processing & scanning...</span>
              </div>

              <!-- File attached state -->
              <div *ngIf="item.uploadedFileName && !item.isUploading" class="file-attached-box">
                <div class="file-info-col">
                  <div class="file-name">
                    <app-icon name="file-text" [size]="14" class="file-icon"></app-icon>
                    <span>{{ item.uploadedFileName }}</span>
                  </div>
                  <div class="file-meta">
                    <span>{{ item.uploadedSize }}</span>
                    <span class="meta-dot">•</span>
                    <span class="status-text">Uploaded — Awaiting Verification</span>
                  </div>
                </div>

                <button type="button" (click)="removeFile(item)" class="remove-btn" title="Remove Document">
                  <app-icon name="x" [size]="13"></app-icon>
                </button>
              </div>

              <!-- Empty / Upload Action -->
              <div *ngIf="!item.uploadedFileName && !item.isUploading" class="upload-action-box">
                <label class="upload-btn-label">
                  <input type="file" (change)="simulateUpload($event, item)" class="hidden-file-input" />
                  <app-icon name="upload" [size]="14"></app-icon>
                  <span>Select or Drag File (PDF, JPG, PNG)</span>
                </label>
              </div>
            </div>
          </div>

          <div class="wizard-footer">
            <div class="footer-left">
              <a routerLink="/intimation" class="csp-btn csp-btn-secondary csp-btn-sm">
                <app-icon name="arrow-left" [size]="14"></app-icon>
                <span>Back to Section 1 (Data Intake)</span>
              </a>
              <button type="button" (click)="saveDraft()" class="csp-btn csp-btn-outline csp-btn-sm">
                <app-icon name="save" [size]="14"></app-icon>
                <span>Save Draft</span>
              </button>
            </div>
            <button (click)="onContinue()" class="csp-btn csp-btn-primary csp-btn-sm">
              <span>Continue to Step 3: Review & Declaration</span>
              <app-icon name="arrow-right" [size]="14"></app-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .wizard-page {
      padding: 1.25rem 0.75rem 2.5rem;
      background: var(--csp-bg-soft);
      min-height: calc(100vh - 180px);
    }
    .wizard-container {
      max-width: 1060px;
      margin: 0 auto;
    }

    /* Symmetrical 3-Stage Progress Timeline with 3 Equal Columns */
    .stepper-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 0.95rem;
      width: 100%;
      box-sizing: border-box;
    }
    .step-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.85rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      box-sizing: border-box;
      transition: var(--csp-transition);
    }
    .step-card.active {
      border-color: var(--csp-ember);
      background: #FFF9F6;
      box-shadow: 0 1px 3px rgba(232, 93, 50, 0.12);
    }
    .step-card.completed {
      border-color: rgba(85, 116, 95, 0.45);
      background: #F6F9F7;
    }
    .step-badge {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--csp-ivory);
      border: 1.5px solid var(--csp-border);
      color: var(--csp-warm-grey);
      font-weight: 800;
      font-size: 0.76rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-card.active .step-badge {
      background: var(--csp-ember);
      border-color: var(--csp-ember);
      color: var(--csp-white);
      box-shadow: 0 0 0 2px rgba(232, 93, 50, 0.2);
    }
    .step-card.completed .step-badge {
      background: var(--csp-sage);
      border-color: var(--csp-sage);
      color: var(--csp-white);
    }
    .step-text-col {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
    .step-kicker {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--csp-warm-grey);
      line-height: 1.2;
    }
    .step-card.active .step-kicker {
      color: var(--csp-ember);
    }
    .step-card.completed .step-kicker {
      color: var(--csp-sage);
    }
    .step-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .compact-wizard-card {
      padding: 1.15rem 1.4rem;
      background: var(--csp-white);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-sm);
      border: 1px solid var(--csp-border);
    }

    .form-title-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 0.65rem;
      margin-bottom: 0.65rem;
      border-bottom: 1px solid var(--csp-border);
    }
    .form-title-left {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .step-pill {
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.1);
      padding: 2px 7px;
      border-radius: var(--csp-radius-pill);
    }
    .form-main-heading {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .fields-hint {
      font-size: 0.72rem;
      color: var(--csp-warm-grey);
    }

    /* 2-Column Grid for Checklist to eliminate vertical scrolling */
    .doc-checklist-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.65rem;
      margin-bottom: 0.85rem;
    }

    .doc-upload-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.75rem 0.95rem;
      transition: var(--csp-transition);
    }
    .doc-upload-card.has-file {
      border-color: var(--csp-clay-dark);
      background: var(--csp-bg-soft);
    }

    .doc-title-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 0.2rem;
    }
    .doc-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .doc-desc {
      color: var(--csp-warm-grey);
      font-size: 0.74rem;
      margin-bottom: 0.45rem;
      line-height: 1.35;
    }

    .upload-action-box {
      border: 1px dashed var(--csp-border-dark);
      border-radius: var(--csp-radius-sm);
      padding: 0.55rem 0.75rem;
      text-align: center;
      background: var(--csp-ivory);
      cursor: pointer;
      transition: var(--csp-transition);
    }
    .upload-action-box:hover {
      border-color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.05);
    }
    .upload-btn-label {
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }
    .hidden-file-input { display: none; }

    .upload-progress-box {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem;
      font-size: 0.78rem;
      color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.08);
      border-radius: var(--csp-radius-sm);
    }
    .spin-icon { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

    .file-attached-box {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.45rem 0.75rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
    }
    .file-name {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }
    .file-icon { color: var(--csp-ember); }
    .file-meta {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.72rem;
      color: var(--csp-warm-grey);
      margin-top: 1px;
    }
    .status-text {
      color: var(--csp-terracotta);
      font-weight: 600;
    }

    .remove-btn {
      background: none;
      border: 1px solid var(--csp-border);
      color: var(--csp-warm-grey);
      width: 24px;
      height: 24px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    .remove-btn:hover { color: var(--csp-error); border-color: var(--csp-error); }

    .wizard-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--csp-border);
      padding-top: 0.75rem;
      margin-top: 0.5rem;
    }
    .footer-left { display: flex; gap: 0.5rem; }

    @media (max-width: 768px) {
      .doc-checklist-grid {
        grid-template-columns: 1fr;
      }
      .stepper-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      .wizard-footer {
        flex-direction: column;
        gap: 0.6rem;
      }
      .footer-left, .wizard-footer button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class DocumentUploadComponent {
  private wizard = inject(IntimationWizardService);
  private router = inject(Router);
  private toast = inject(ToastService);

  checklist: ChecklistDoc[] = [
    {
      id: 'doc_fir',
      category: 'Police & FIR',
      title: 'First Information Report (FIR) / Police Diary Entry',
      description: 'Certified copy from jurisdictional police station noting the accident circumstances.',
      isRequired: true,
      uploadedFileName: 'FIR_Mylapore_Station_Certified.pdf',
      uploadedSize: '1.2 MB'
    },
    {
      id: 'doc_id',
      category: 'Claimant Identity',
      title: 'Claimant Identity Proof',
      description: 'Government photo identification (Aadhaar with masked digits, Voter ID, or Passport).',
      isRequired: true,
      uploadedFileName: 'Aadhaar_Card_Kavitha_Masked.pdf',
      uploadedSize: '650 KB'
    },
    {
      id: 'doc_med',
      category: 'Medical Records',
      title: 'Hospital Records / Inpatient Admission Slip',
      description: 'Admission slip, clinical discharge summary, or doctor diagnostic notes detailing injuries.',
      isRequired: this.wizard.draft().lossType === 'Bodily Injury' || this.wizard.draft().lossType === 'Multiple Loss Types',
      uploadedFileName: 'Mylapore_Orthocare_Hospital_Bill.pdf',
      uploadedSize: '2.1 MB'
    },
    {
      id: 'doc_bills',
      category: 'Medical Bills',
      title: 'Original Medical Bills & Pharmacy Receipts',
      description: 'Itemized receipts with GSTIN numbers and corresponding doctor prescriptions.',
      isRequired: false
    },
    {
      id: 'doc_photos',
      category: 'Accident & Vehicle Photos',
      title: 'Accident Scene or Damaged Vehicle Photographs',
      description: 'Clear photographic evidence of the road scene, skid marks, or vehicle damage.',
      isRequired: false
    },
    {
      id: 'doc_repair',
      category: 'Property Damage / Repair Estimate',
      title: 'Repair Estimate from Authorized Workshop',
      description: 'Official quotation for vehicle repair or masonry property restoration (if claiming TPPD).',
      isRequired: this.wizard.draft().lossType === 'Third-Party Property Damage'
    }
  ];

  simulateUpload(event: any, item: ChecklistDoc) {
    const file = event.target.files?.[0];
    const name = file ? file.name : (item.title.replace(/[^a-zA-Z]/g, '_') + '.pdf');
    const size = file ? (file.size / 1024 / 1024).toFixed(1) + ' MB' : '1.5 MB';

    item.isUploading = true;
    setTimeout(() => {
      item.isUploading = false;
      item.uploadedFileName = name;
      item.uploadedSize = size;
      this.syncDraftFiles();
      this.toast.success(`Attached "${name}" to ${item.title}`);
    }, 800);
  }

  removeFile(item: ChecklistDoc) {
    item.uploadedFileName = undefined;
    item.uploadedSize = undefined;
    this.syncDraftFiles();
    this.toast.info(`Removed ${item.title}`);
  }

  syncDraftFiles() {
    const files = this.checklist
      .filter(i => !!i.uploadedFileName)
      .map(i => ({
        id: i.id,
        name: i.uploadedFileName!,
        category: i.category,
        size: i.uploadedSize!,
        status: 'Uploaded — Awaiting Verification'
      }));
    this.wizard.updateDraft({ uploadedFiles: files });
  }

  saveDraft() {
    this.syncDraftFiles();
    this.toast.success('Attached documents saved to draft.');
  }

  onContinue() {
    this.syncDraftFiles();
    const mandatoryMissing = this.checklist.filter(i => i.isRequired && !i.uploadedFileName);
    if (mandatoryMissing.length > 0) {
      this.toast.warning(`Please upload the mandatory document: ${mandatoryMissing[0].title}`);
      return;
    }
    this.router.navigate(['/public/review']);
  }
}
