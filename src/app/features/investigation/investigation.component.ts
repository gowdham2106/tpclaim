import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { InvestigationRecord } from '../../core/models/assessment.model';

@Component({
  selector: 'app-investigation',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="inv-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Forensic & Field Operations</div>
          <h1 class="page-main-title">Investigation & Site Forensics Desk</h1>
          <p class="page-sub">Manage independent field inspections, witness interviews, police liaison, and technical MVI assessments.</p>
        </div>
      </div>

      <!-- Claim Selection Strip -->
      <div class="csp-card selection-card">
        <label class="csp-label">Select Active Investigation Case:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedClaimRef" (ngModelChange)="loadCase($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let inv of mockData.investigations()" [value]="inv.claimRef">
              {{ inv.claimRef }} — {{ inv.investigatorName }} (Status: {{ inv.status }})
            </option>
          </select>
          <a [routerLink]="['/ops/claim-360', selectedClaimRef]" class="csp-btn csp-btn-secondary">
            <span>View Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div *ngIf="activeRecord" class="inv-workspace-grid">
        <!-- Main Form: Investigation Findings & Notes -->
        <div class="csp-card inv-form-card">
          <div class="csp-card-header">
            <h3 class="card-head-h3">Investigation Chronology & Technical Findings</h3>
            <span class="csp-badge csp-badge-ember">{{ activeRecord.status }}</span>
          </div>
          <div class="csp-card-body">
            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">Assigned Field Investigator</label>
                <select [(ngModel)]="activeRecord.investigatorName" class="csp-select">
                  <option value="Dinesh Balan">Dinesh Balan (Forensics Specialist)</option>
                  <option value="Kavita Chhabra">Kavita Chhabra (Senior Investigator)</option>
                  <option value="Nitin Kadam">Nitin Kadam (Commercial Vehicle Inspector)</option>
                  <option value="Gopal Hegde">Gopal Hegde (Accident Reconstructionist)</option>
                </select>
              </div>

              <div class="csp-form-group">
                <label class="csp-label">Investigation Progress Status</label>
                <select [(ngModel)]="activeRecord.status" class="csp-select">
                  <option value="Assigned">Assigned</option>
                  <option value="Field Visit Scheduled">Field Visit Scheduled</option>
                  <option value="Site Inspected">Site Inspected</option>
                  <option value="Report Submitted">Report Submitted</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Accident Scene Chronology</label>
              <textarea rows="3" [(ngModel)]="activeRecord.accidentChronology" class="csp-textarea"></textarea>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Police Diary & FIR Findings</label>
              <textarea rows="2" [(ngModel)]="activeRecord.policeFirDetails" class="csp-textarea"></textarea>
            </div>

            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">Witness Statements & Eyewitness Contacts</label>
                <textarea rows="3" [(ngModel)]="activeRecord.witnessDetails" class="csp-textarea"></textarea>
              </div>
              <div class="csp-form-group">
                <label class="csp-label">Vehicle Damage & Mechanical Inspection</label>
                <textarea rows="3" [(ngModel)]="activeRecord.inspectionNotes" class="csp-textarea"></textarea>
              </div>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Final Investigative Findings & Liability Conclusion</label>
              <textarea rows="3" [(ngModel)]="activeRecord.findings" class="csp-textarea" style="font-weight:600;"></textarea>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Follow-up Action Tasks for Claims Team</label>
              <input type="text" [(ngModel)]="activeRecord.followUpTasks" class="csp-input" />
            </div>

            <div class="form-actions-row">
              <button (click)="saveInvestigation()" class="csp-btn csp-btn-primary csp-btn-lg">
                <app-icon name="check-circle" [size]="16"></app-icon>
                <span>Save Investigation Report</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Sidebar: Checklist & Associated Evidence -->
        <div class="inv-sidebar-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Evidentiary Checklist</h4>
            </div>
            <div class="csp-card-body check-list-body">
              <label class="chk-item">
                <input type="checkbox" checked />
                <span>Scene Spot Map & Geometry</span>
              </label>
              <label class="chk-item">
                <input type="checkbox" checked />
                <span>Police FIR / CSR Verified</span>
              </label>
              <label class="chk-item">
                <input type="checkbox" checked />
                <span>Driver DL Verification on Sarathi</span>
              </label>
              <label class="chk-item">
                <input type="checkbox" />
                <span>Motor Vehicle Inspector (MVI) Form 54</span>
              </label>
              <label class="chk-item">
                <input type="checkbox" />
                <span>Toll Plaza RFID Cross-Reference</span>
              </label>
              <label class="chk-item">
                <input type="checkbox" />
                <span>Hospital Admission Register Inspection</span>
              </label>
            </div>
          </div>

          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Quick Actions</h4>
            </div>
            <div class="csp-card-body action-buttons-vertical">
              <a routerLink="/ops/evidence" class="csp-btn csp-btn-secondary" style="width:100%; justify-content:flex-start;">
                <app-icon name="files" [size]="14"></app-icon>
                <span>Evidence Repository</span>
              </a>
              <a routerLink="/ops/liability-assessment" class="csp-btn csp-btn-secondary" style="width:100%; justify-content:flex-start;">
                <app-icon name="shield-check" [size]="14"></app-icon>
                <span>Liability Assessment</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .inv-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .selection-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .inv-workspace-grid { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 1.5rem; align-items: flex-start; }
    .card-head-h3 { font-size: 1.05rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions-row { display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--csp-border); }

    .check-list-body { display: flex; flex-direction: column; gap: 0.75rem; }
    .chk-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.86rem; color: var(--csp-charcoal); cursor: pointer; }
    .chk-item input { accent-color: var(--csp-ember); width: 16px; height: 16px; }

    .action-buttons-vertical { display: flex; flex-direction: column; gap: 0.65rem; }

    @media (max-width: 900px) {
      .inv-workspace-grid { grid-template-columns: 1fr; }
      .form-grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class InvestigationComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);

  selectedClaimRef = 'TP-2026-001842';
  activeRecord?: InvestigationRecord;

  ngOnInit() {
    this.loadCase(this.selectedClaimRef);
  }

  loadCase(ref: string) {
    this.selectedClaimRef = ref;
    this.activeRecord = this.mockData.investigations().find(i => i.claimRef === ref) || this.mockData.investigations()[0];
  }

  saveInvestigation() {
    if (!this.activeRecord) return;
    this.mockData.updateInvestigation(this.activeRecord);
    this.toast.success(`Investigation findings updated for ${this.activeRecord.claimRef}!`);
  }
}
