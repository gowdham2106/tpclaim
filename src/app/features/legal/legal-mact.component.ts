import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { LegalCaseRecord } from '../../core/models/assessment.model';

@Component({
  selector: 'app-legal-mact',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="legal-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Litigation & Tribunal Affairs</div>
          <h1 class="page-main-title">Motor Accidents Claims Tribunal (MACT) Desk</h1>
          <p class="page-sub">Management of Section 166 & 163A petitions, panel advocate written statements, and Lok Adalat conciliation awards.</p>
        </div>
      </div>

      <!-- Case Selection Bar -->
      <div class="csp-card select-card">
        <label class="csp-label">Select Active MACT Litigation Proceeding:</label>
        <div class="select-row">
          <select [(ngModel)]="selectedCaseId" (ngModelChange)="loadCase($event)" class="csp-select" style="flex:1;">
            <option *ngFor="let leg of mockData.legalCases()" [value]="leg.id">
              {{ leg.caseReference }} — {{ leg.tribunalCourt }} (Claim: {{ leg.claimRef }})
            </option>
          </select>
          <a [routerLink]="['/ops/claim-360', activeCase?.claimRef]" class="csp-btn csp-btn-secondary">
            <span>View Claim 360</span>
            <app-icon name="arrow-right" [size]="14"></app-icon>
          </a>
        </div>
      </div>

      <div *ngIf="activeCase" class="legal-grid">
        <!-- Main Form & Hearing Calendar -->
        <div class="csp-card form-card">
          <div class="csp-card-header">
            <div>
              <h3 class="card-head-h3">{{ activeCase.caseReference }}</h3>
              <div class="court-sub">{{ activeCase.tribunalCourt }}</div>
            </div>
            <span class="csp-badge csp-badge-terracotta">{{ activeCase.caseStatus }}</span>
          </div>
          <div class="csp-card-body">
            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">Petitioner / Claimant</label>
                <input type="text" [(ngModel)]="activeCase.petitioner" class="csp-input font-bold" />
              </div>
              <div class="csp-form-group">
                <label class="csp-label">Panel Advocate (In-house / Retained)</label>
                <input type="text" [(ngModel)]="activeCase.advocateName" class="csp-input" />
              </div>
            </div>

            <div class="form-grid-2">
              <div class="csp-form-group">
                <label class="csp-label">Current Litigation Stage</label>
                <select [(ngModel)]="activeCase.caseStatus" class="csp-select">
                  <option value="Notice Received">Notice Received</option>
                  <option value="Written Statement Filed">Written Statement Filed</option>
                  <option value="Evidence Stage">Evidence Stage</option>
                  <option value="Arguments Scheduled">Arguments Scheduled</option>
                  <option value="Award Pronounced">Award Pronounced</option>
                  <option value="Out of Court Settlement">Out of Court Settlement (Lok Adalat)</option>
                </select>
              </div>
              <div class="csp-form-group">
                <label class="csp-label">Upcoming Hearing / Motion Date</label>
                <input type="date" [(ngModel)]="activeCase.nextHearingDate" class="csp-input font-bold" />
              </div>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Legal Strategy & Defense Notes</label>
              <textarea rows="3" [(ngModel)]="activeCase.legalNotes" class="csp-textarea"></textarea>
            </div>

            <div class="csp-form-group">
              <label class="csp-label">Immediate Next Procedural Motion</label>
              <input type="text" [(ngModel)]="activeCase.nextAction" class="csp-input" />
            </div>

            <div class="form-actions-bar">
              <button (click)="saveCase()" class="csp-btn csp-btn-primary csp-btn-lg">
                <app-icon name="check-circle" [size]="16"></app-icon>
                <span>Save Legal Case Record</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right Side: Hearing Schedule & Summons -->
        <div class="sidebar-legal-col">
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Tribunal Hearing History</h4>
            </div>
            <div class="csp-card-body">
              <div class="hearings-list">
                <div *ngFor="let h of activeCase.hearingDates" class="hearing-item">
                  <app-icon name="calendar" [size]="14" class="h-icon"></app-icon>
                  <span>{{ h }}</span>
                </div>
              </div>
              <button (click)="addHearingDate()" class="csp-btn csp-btn-secondary csp-btn-sm" style="width:100%; margin-top:1rem;">
                <app-icon name="plus" [size]="12"></app-icon>
                <span>Log Next Hearing Date</span>
              </button>
            </div>
          </div>

          <div class="csp-card" style="margin-top:1.5rem;">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">National Lok Adalat Settlement</h4>
            </div>
            <div class="csp-card-body">
              <p style="font-size:0.86rem; color:var(--csp-warm-grey); line-height:1.55;">
                Cases marked for mutual compromise can be referred to the upcoming quarterly Lok Adalat bench for zero-interest award execution.
              </p>
              <button (click)="referToLokAdalat()" class="csp-btn csp-btn-terracotta csp-btn-sm" style="width:100%; margin-top:0.75rem;">
                <app-icon name="scale" [size]="14"></app-icon>
                <span>Refer to Lok Adalat Bench</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .select-card { padding: 1.25rem 1.5rem; }
    .select-row { display: flex; gap: 0.75rem; margin-top: 0.35rem; }

    .legal-grid { display: grid; grid-template-columns: 1.5fr 0.9fr; gap: 1.5rem; }
    .card-head-h3 { font-size: 1.2rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .court-sub { font-size: 0.82rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .form-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
    .form-actions-bar { display: flex; justify-content: flex-end; padding-top: 1rem; border-top: 1px solid var(--csp-border); }

    .hearings-list { display: flex; flex-direction: column; gap: 0.6rem; }
    .hearing-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--csp-charcoal); background: var(--csp-bg-soft); padding: 0.5rem 0.75rem; border-radius: var(--csp-radius-sm); border: 1px solid var(--csp-border); }
    .h-icon { color: var(--csp-terracotta); }

    .font-bold { font-weight: 700; }

    @media (max-width: 900px) {
      .legal-grid { grid-template-columns: 1fr; }
      .form-grid-2 { grid-template-columns: 1fr; }
    }
  `]
})
export class LegalMactComponent implements OnInit {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);

  selectedCaseId = 'LEG-01';
  activeCase?: LegalCaseRecord;

  ngOnInit() {
    this.loadCase(this.selectedCaseId);
  }

  loadCase(id: string) {
    this.selectedCaseId = id;
    this.activeCase = this.mockData.legalCases().find(l => l.id === id) || this.mockData.legalCases()[0];
  }

  saveCase() {
    if (!this.activeCase) return;
    this.mockData.updateLegalCase(this.activeCase);
    this.toast.success(`Legal case ${this.activeCase.caseReference} updated successfully!`);
  }

  addHearingDate() {
    const nextDate = prompt('Enter Next Hearing Date (YYYY-MM-DD):', '2026-04-10');
    if (!nextDate || !this.activeCase) return;
    this.activeCase.hearingDates = [...this.activeCase.hearingDates, `${nextDate} (Scheduled Hearing)`];
    this.activeCase.nextHearingDate = nextDate;
    this.mockData.saveState();
    this.toast.success(`Hearing date ${nextDate} scheduled.`);
  }

  referToLokAdalat() {
    if (!this.activeCase) return;
    this.activeCase.caseStatus = 'Out of Court Settlement';
    this.activeCase.nextAction = 'Draft compromise deed for National Lok Adalat calendar.';
    this.mockData.saveState();
    this.toast.success(`Case ${this.activeCase.caseReference} referred to Lok Adalat compromise bench.`);
  }
}
