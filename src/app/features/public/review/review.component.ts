import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { IntimationWizardService } from '../intimation-wizard.service';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="wizard-page">
      <div class="wizard-container">
        <!-- Compact 3-Stage Progress Timeline -->
        <div class="csp-stepper compact-stepper">
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">
              <span class="step-num">Step 1 of 3</span>
              <span class="step-name">Accident & Parties Data</span>
            </div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">
              <span class="step-num">Step 2 of 3</span>
              <span class="step-name">Document Upload</span>
            </div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item active">
            <div class="csp-step-circle">3</div>
            <div class="csp-step-label">
              <span class="step-num">Step 3 of 3</span>
              <span class="step-name">Review & Declaration</span>
            </div>
          </div>
        </div>

        <div class="csp-card wizard-card compact-wizard-card">
          <div class="form-title-bar">
            <div class="form-title-left">
              <span class="step-pill">Section 3: Review Part</span>
              <h2 class="form-main-heading">Review & Formal Declaration</h2>
            </div>
            <span class="fields-hint">Verify all entered facts and documents before submitting</span>
          </div>

          <!-- 2-Column Review Blocks Grid -->
          <div class="review-grid-2">
            <!-- Section 1A: Role & Standing -->
            <div class="review-block">
              <div class="block-header">
                <div class="block-title">
                  <app-icon name="user" [size]="14" class="block-icon"></app-icon>
                  <span>Reporting Capacity & Role</span>
                </div>
                <a routerLink="/public/intimation" class="edit-btn">
                  <app-icon name="edit" [size]="12"></app-icon>
                  Edit
                </a>
              </div>
              <div class="info-grid-2">
                <div class="info-item">
                  <span class="info-label">Claimant Role:</span>
                  <span class="info-val font-semibold">{{ draft.claimantRole }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Preferred Contact:</span>
                  <span class="info-val">{{ draft.contactPreference }}</span>
                </div>
              </div>
            </div>

            <!-- Section 1C: Loss Classification -->
            <div class="review-block">
              <div class="block-header">
                <div class="block-title">
                  <app-icon name="clipboard-list" [size]="14" class="block-icon"></app-icon>
                  <span>Loss Classification</span>
                </div>
                <a routerLink="/public/intimation" class="edit-btn">
                  <app-icon name="edit" [size]="12"></app-icon>
                  Edit
                </a>
              </div>
              <div class="info-grid-2">
                <div class="info-item">
                  <span class="info-label">Primary Loss Type:</span>
                  <span class="csp-badge csp-badge-ember" style="display: inline-block;">{{ draft.lossType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Damage Scope:</span>
                  <span class="info-val">{{ draft.lossDetails || 'As per report' }}</span>
                </div>
              </div>
            </div>

            <!-- Section 1B: Accident Circumstances -->
            <div class="review-block">
              <div class="block-header">
                <div class="block-title">
                  <app-icon name="calendar" [size]="14" class="block-icon"></app-icon>
                  <span>Incident Circumstances</span>
                </div>
                <a routerLink="/public/intimation" class="edit-btn">
                  <app-icon name="edit" [size]="12"></app-icon>
                  Edit
                </a>
              </div>
              <div class="info-grid-2">
                <div class="info-item">
                  <span class="info-label">Date & Time:</span>
                  <span class="info-val font-semibold">{{ draft.accidentDate }} at {{ draft.accidentTime }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Location / City:</span>
                  <span class="info-val">{{ draft.accidentLocation }}, {{ draft.accidentCity }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Police Station:</span>
                  <span class="info-val">{{ draft.policeStation || 'Not provided' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">FIR / GD Number:</span>
                  <span class="info-val">{{ draft.firNumber || 'Pending / Under Process' }}</span>
                </div>
              </div>
              <div class="desc-box">
                <span class="info-label">Accident Description:</span>
                <p class="desc-text">{{ draft.accidentDescription }}</p>
              </div>
            </div>

            <!-- Section 1D: Claimant Contact -->
            <div class="review-block">
              <div class="block-header">
                <div class="block-title">
                  <app-icon name="user" [size]="14" class="block-icon"></app-icon>
                  <span>Claimant Contact Information</span>
                </div>
                <a routerLink="/public/intimation" class="edit-btn">
                  <app-icon name="edit" [size]="12"></app-icon>
                  Edit
                </a>
              </div>
              <div class="info-grid-2">
                <div class="info-item">
                  <span class="info-label">Full Name:</span>
                  <span class="info-val font-semibold">{{ draft.claimantName }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Mobile Phone:</span>
                  <span class="info-val">{{ draft.claimantPhone }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Email Address:</span>
                  <span class="info-val">{{ draft.claimantEmail }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Residential Address:</span>
                  <span class="info-val">{{ draft.claimantAddress }}, {{ draft.claimantCity }}</span>
                </div>
              </div>
            </div>

            <!-- Section 1E: Vehicle & Policy Details -->
            <div class="review-block">
              <div class="block-header">
                <div class="block-title">
                  <app-icon name="car" [size]="14" class="block-icon"></app-icon>
                  <span>Vehicle & Policy Information</span>
                </div>
                <a routerLink="/public/intimation" class="edit-btn">
                  <app-icon name="edit" [size]="12"></app-icon>
                  Edit
                </a>
              </div>
              <div class="info-grid-2">
                <div class="info-item">
                  <span class="info-label">Insured Vehicle No:</span>
                  <span class="info-val font-mono font-bold" style="color:var(--csp-charcoal);">
                    {{ draft.insuredVehicleNumber }}
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">Vehicle Category:</span>
                  <span class="info-val">{{ draft.vehicleType }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Make & Model:</span>
                  <span class="info-val">{{ draft.vehicleMakeModel || 'Unknown' }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Policy Number:</span>
                  <span class="info-val">{{ draft.policyNumber || 'Pending verification' }}</span>
                </div>
              </div>
            </div>

            <!-- Section 2: Uploaded Evidentiary Documents -->
            <div class="review-block">
              <div class="block-header">
                <div class="block-title">
                  <app-icon name="files" [size]="14" class="block-icon"></app-icon>
                  <span>Attached Documents ({{ draft.uploadedFiles.length }})</span>
                </div>
                <a routerLink="/public/document-upload" class="edit-btn">
                  <app-icon name="edit" [size]="12"></app-icon>
                  Edit
                </a>
              </div>
              <div class="doc-review-list">
                <div *ngFor="let file of draft.uploadedFiles" class="doc-review-item">
                  <app-icon name="file-text" [size]="14" class="doc-icon"></app-icon>
                  <div class="doc-review-info">
                    <span class="doc-name">{{ file.name }}</span>
                    <span class="doc-cat">{{ file.category }} ({{ file.size }})</span>
                  </div>
                  <span class="csp-badge csp-badge-clay">Uploaded</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Declaration Checkbox Card -->
          <div class="declaration-box">
            <label class="declaration-label">
              <input type="checkbox" [(ngModel)]="isDeclarationAccepted" class="declaration-check" />
              <div class="declaration-text">
                <strong>Statutory Declaration & Consent:</strong>
                I hereby declare that the accident circumstances and information provided herein are true, accurate, and complete to the best of my knowledge. I understand that submitting this intimation creates an official claims record for verification and does not constitute guaranteed compensation or admission of insurer liability.
              </div>
            </label>
          </div>

          <div class="wizard-footer">
            <a routerLink="/public/document-upload" class="csp-btn csp-btn-secondary csp-btn-sm">
              <app-icon name="arrow-left" [size]="14"></app-icon>
              <span>Back to Step 2: Document Upload</span>
            </a>
            <button 
              (click)="onSubmit()" 
              class="csp-btn csp-btn-primary csp-btn-sm"
              [disabled]="!isDeclarationAccepted"
            >
              <app-icon name="check-circle" [size]="15"></app-icon>
              <span>Submit Accident Intimation (Step 4)</span>
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

    /* 3-Stage Stepper */
    .compact-stepper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
      position: relative;
    }
    .csp-step-item {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      position: relative;
      flex: 1;
    }
    .csp-step-item:last-child {
      flex: 0 0 auto;
    }
    .csp-step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--csp-ivory);
      border: 2px solid var(--csp-border);
      color: var(--csp-warm-grey);
      font-weight: 800;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 2;
    }
    .csp-step-item.active .csp-step-circle {
      background: var(--csp-ember);
      border-color: var(--csp-ember);
      color: var(--csp-white);
      box-shadow: 0 0 0 3px rgba(232, 93, 50, 0.2);
    }
    .csp-step-item.completed .csp-step-circle {
      background: var(--csp-sage);
      border-color: var(--csp-sage);
      color: var(--csp-white);
    }
    .csp-step-label {
      display: flex;
      flex-direction: column;
    }
    .step-num {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--csp-warm-grey);
    }
    .step-name {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .csp-step-item.active .step-name {
      color: var(--csp-ember);
    }
    .csp-step-line {
      flex: 1;
      height: 2px;
      background: var(--csp-border);
      margin: 0 0.75rem;
    }
    .csp-step-line.filled {
      background: var(--csp-sage);
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

    /* 2-Column Review Blocks Grid */
    .review-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.65rem;
      margin-bottom: 0.65rem;
    }

    .review-block {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.75rem 0.95rem;
      margin-bottom: 0;
      transition: var(--csp-transition);
    }
    .review-block:hover {
      border-color: rgba(232, 93, 50, 0.35);
    }

    .block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--csp-border);
      padding-bottom: 0.35rem;
      margin-bottom: 0.5rem;
    }

    .block-title {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .block-icon { color: var(--csp-ember); }

    .edit-btn {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--csp-ember);
      display: flex;
      align-items: center;
      gap: 0.2rem;
      padding: 2px 6px;
      border-radius: var(--csp-radius-pill);
      background: rgba(232, 93, 50, 0.08);
      text-decoration: none;
      transition: var(--csp-transition);
    }
    .edit-btn:hover {
      background: rgba(232, 93, 50, 0.16);
      text-decoration: none;
    }

    .info-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.4rem 0.85rem;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 0.1rem;
    }

    .info-label {
      font-size: 0.68rem;
      color: var(--csp-warm-grey);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    .info-val {
      font-size: 0.82rem;
      color: var(--csp-charcoal);
    }

    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }

    .desc-box {
      margin-top: 0.4rem;
      padding-top: 0.4rem;
      border-top: 1px solid var(--csp-border);
    }

    .desc-text {
      color: var(--csp-charcoal);
      font-size: 0.8rem;
      line-height: 1.4;
      margin-top: 0.15rem;
    }

    .doc-review-list {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .doc-review-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.35rem 0.6rem;
      background: var(--csp-bg-soft);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
    }

    .doc-icon { color: var(--csp-ember); margin-right: 0.35rem; }
    .doc-review-info { flex: 1; display: flex; flex-direction: column; }
    .doc-name { font-size: 0.78rem; font-weight: 600; color: var(--csp-charcoal); }
    .doc-cat { font-size: 0.68rem; color: var(--csp-warm-grey); }

    .declaration-box {
      background: rgba(232, 93, 50, 0.06);
      border: 1px solid rgba(232, 93, 50, 0.25);
      border-radius: var(--csp-radius-sm);
      padding: 0.75rem 1rem;
      margin: 0.65rem 0 0.85rem;
    }

    .declaration-label {
      display: flex;
      gap: 0.65rem;
      cursor: pointer;
    }

    .declaration-check {
      margin-top: 2px;
      width: 16px;
      height: 16px;
      accent-color: var(--csp-ember);
      cursor: pointer;
      flex-shrink: 0;
    }

    .declaration-text {
      font-size: 0.78rem;
      line-height: 1.45;
      color: var(--csp-charcoal);
    }

    .wizard-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid var(--csp-border);
      padding-top: 0.75rem;
    }

    @media (max-width: 768px) {
      .review-grid-2 {
        grid-template-columns: 1fr;
      }
      .compact-stepper {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
      }
      .csp-step-line {
        display: none;
      }
      .wizard-footer {
        flex-direction: column;
        gap: 0.6rem;
      }
      .wizard-footer a, .wizard-footer button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class ReviewComponent {
  private wizard = inject(IntimationWizardService);
  private mockData = inject(MockDataService);
  private router = inject(Router);
  private toast = inject(ToastService);

  draft = this.wizard.draft();
  isDeclarationAccepted = this.draft.declarationAccepted;

  onSubmit() {
    if (!this.isDeclarationAccepted) {
      this.toast.error('You must accept the statutory declaration before submitting.');
      return;
    }

    // Submit into mock data service
    const createdClaim = this.mockData.addIntimation({
      accidentDate: this.draft.accidentDate,
      accidentTime: this.draft.accidentTime,
      accidentLocation: this.draft.accidentLocation,
      accidentCity: this.draft.accidentCity,
      accidentState: this.draft.accidentState,
      policeStation: this.draft.policeStation,
      firNumber: this.draft.firNumber,
      accidentDescription: this.draft.accidentDescription,
      claimantName: this.draft.claimantName,
      claimantRole: this.draft.claimantRole,
      claimantPhone: this.draft.claimantPhone,
      claimantEmail: this.draft.claimantEmail,
      claimantAddress: this.draft.claimantAddress,
      contactPreference: this.draft.contactPreference,
      lossType: this.draft.lossType,
      lossDetails: this.draft.lossDetails,
      insuredVehicleNumber: this.draft.insuredVehicleNumber,
      vehicleMakeModel: this.draft.vehicleMakeModel,
      vehicleType: this.draft.vehicleType,
      policyNumber: this.draft.policyNumber,
      insuredPersonName: this.draft.insuredPersonName,
      driverName: this.draft.driverName,
      thirdPartyVehicleNumber: this.draft.thirdPartyVehicleNumber
    });

    this.toast.success(`Accident Intimation ${createdClaim.intimationRef} recorded successfully!`, 'Submission Received');
    this.router.navigate(['/public/acknowledgement'], { queryParams: { ref: createdClaim.intimationRef } });
  }
}
