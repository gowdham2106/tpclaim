import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClaimRecord, ClaimStage, ClaimStatus } from '../../../core/models/claim.model';
import { DocumentItem } from '../../../core/models/document.model';

type Tab360 = 
  | 'overview' 
  | 'parties' 
  | 'accident' 
  | 'vehicle' 
  | 'documents' 
  | 'investigation' 
  | 'legal' 
  | 'liability' 
  | 'compensation' 
  | 'approvals' 
  | 'settlement' 
  | 'history';

@Component({
  selector: 'app-claim-360',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent, PriorityBadgeComponent],
  template: `
    <div class="workspace-page" *ngIf="claim">
      <!-- 360 Header Bar -->
      <div class="csp-card workspace-header-card">
        <div class="ws-header-top">
          <div class="ws-identity-col">
            <div class="ws-breadcrumbs">
              <a routerLink="/ops/intimations" class="ws-bc-link">Claims Intake</a>
              <span class="ws-bc-sep">/</span>
              <span>Claim 360 Workspace</span>
            </div>
            <div class="ws-title-row">
              <h1 class="ws-claim-id">{{ claim.id || claim.intimationRef }}</h1>
              <span class="ws-loss-chip">{{ claim.lossType }}</span>
              <app-priority-badge [priority]="claim.priority"></app-priority-badge>
            </div>
            <div class="ws-ref-sub">
              Intimation Reference: <strong>{{ claim.intimationRef }}</strong>
              <span class="meta-sep">•</span>
              Reported on: <strong>{{ claim.dateReported }}</strong>
            </div>
          </div>

          <div class="ws-status-actions-col">
            <div class="status-box">
              <app-status-badge [status]="claim.status"></app-status-badge>
              <div class="last-sync">Updated: {{ claim.lastUpdated }}</div>
            </div>

            <!-- Quick Stage Progression Action -->
            <div class="stage-stepper-btn-group">
              <button (click)="openQuickStageModal()" class="csp-btn csp-btn-primary csp-btn-sm">
                <app-icon name="arrow-right" [size]="14"></app-icon>
                <span>Update Claim Stage</span>
              </button>
              <button (click)="isNoteModalOpen = true" class="csp-btn csp-btn-secondary csp-btn-sm" title="Add Internal Note">
                <app-icon name="plus" [size]="14"></app-icon>
                <span>Internal Note</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Key Metrics Strip -->
        <div class="ws-summary-metrics-row">
          <div class="ws-m-item">
            <span class="ws-m-lbl">Current Stage</span>
            <span class="ws-m-val" style="color:var(--csp-ember)">{{ claim.currentStage }}</span>
          </div>
          <div class="ws-m-item">
            <span class="ws-m-lbl">Assigned Handler</span>
            <span class="ws-m-val">{{ claim.assignedHandler }}</span>
          </div>
          <div class="ws-m-item">
            <span class="ws-m-lbl">Insured Vehicle</span>
            <span class="ws-m-val font-mono">{{ claim.insuredVehicleNumber }}</span>
          </div>
          <div class="ws-m-item">
            <span class="ws-m-lbl">Claimed Amount</span>
            <span class="ws-m-val">₹{{ claim.claimedAmount.toLocaleString('en-IN') }}</span>
          </div>
          <div class="ws-m-item">
            <span class="ws-m-lbl">Assessed / Approved</span>
            <span class="ws-m-val" style="color:var(--csp-sage)">₹{{ (claim.approvedAmount || claim.assessedAmount).toLocaleString('en-IN') }}</span>
          </div>
        </div>
      </div>

      <!-- 12 Functional Tabs Navigation -->
      <div class="csp-tabs ws-tabs-bar">
        <button class="csp-tab-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">Overview</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'parties'" (click)="activeTab = 'parties'">Claimant & Parties</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'accident'" (click)="activeTab = 'accident'">Accident Details</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'vehicle'" (click)="activeTab = 'vehicle'">Policy & Vehicle</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">
          Documents ({{ claimDocs.length }})
        </button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'investigation'" (click)="activeTab = 'investigation'">Investigation</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'legal'" (click)="activeTab = 'legal'">Legal / MACT</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'liability'" (click)="activeTab = 'liability'">Liability Assessment</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'compensation'" (click)="activeTab = 'compensation'">Compensation Assessment</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'approvals'" (click)="activeTab = 'approvals'">Approvals</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'settlement'" (click)="activeTab = 'settlement'">Settlement</button>
        <button class="csp-tab-btn" [class.active]="activeTab === 'history'" (click)="activeTab = 'history'">Activity History</button>
      </div>

      <!-- TAB 1: OVERVIEW -->
      <div *ngIf="activeTab === 'overview'" class="tab-content-area">
        <div class="ws-grid-2">
          <!-- Left: Claim Snapshot & Evidence Checklist -->
          <div class="csp-card">
            <div class="csp-card-header">
              <h3 class="box-h3">Claims Executive Summary</h3>
              <span class="csp-badge csp-badge-charcoal">{{ claim.currentStage }}</span>
            </div>
            <div class="csp-card-body info-pairs">
              <div class="pair-row"><span class="pk">Claimant Name</span><span class="pv font-bold">{{ claim.claimantName }}</span></div>
              <div class="pair-row"><span class="pk">Incident Location</span><span class="pv">{{ claim.accidentLocation }}, {{ claim.accidentCity }}</span></div>
              <div class="pair-row"><span class="pk">Police Station & FIR</span><span class="pv">{{ claim.policeStation }} • {{ claim.firNumber }}</span></div>
              <div class="pair-row"><span class="pk">Insured Policy</span><span class="pv font-mono">{{ claim.policyNumber }}</span></div>
              <div class="pair-row"><span class="pk">Insured Policyholder</span><span class="pv">{{ claim.insuredPersonName }}</span></div>
              <div class="pair-row"><span class="pk">Investigator</span><span class="pv">{{ claim.assignedInvestigator || 'Unassigned' }}</span></div>
              <div class="pair-row"><span class="pk">Legal Officer</span><span class="pv">{{ claim.assignedLegalOfficer || 'Unassigned' }}</span></div>
            </div>
          </div>

          <!-- Right: Internal Notes & Quick Task Followup -->
          <div class="csp-card">
            <div class="csp-card-header">
              <h3 class="box-h3">Handler Internal Notes ({{ claim.notes.length }})</h3>
              <button (click)="isNoteModalOpen = true" class="csp-btn csp-btn-secondary csp-btn-sm">
                <app-icon name="plus" [size]="12"></app-icon> Add Note
              </button>
            </div>
            <div class="csp-card-body">
              <div *ngIf="claim.notes.length === 0" style="color:var(--csp-warm-grey); font-size:0.86rem;">
                No internal handler notes recorded yet.
              </div>
              <div *ngFor="let note of claim.notes" class="note-box">
                <div class="note-head">
                  <span class="note-author font-bold">{{ note.author }} ({{ note.role }})</span>
                  <span class="note-date">{{ note.date }}</span>
                </div>
                <p class="note-body">{{ note.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 2: CLAIMANT & PARTIES -->
      <div *ngIf="activeTab === 'parties'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Associated Parties & Witnesses</h3>
            <button (click)="openAddPartyModal()" class="csp-btn csp-btn-primary csp-btn-sm">
              <app-icon name="plus" [size]="14"></app-icon> Add Associated Party
            </button>
          </div>
          <div class="csp-card-body" style="padding:0;">
            <table class="csp-table">
              <thead>
                <tr>
                  <th>Party Name</th>
                  <th>Role in Claim</th>
                  <th>Contact Details</th>
                  <th>Address</th>
                  <th>Verification Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of claim.parties">
                  <td class="font-bold">{{ p.name }}</td>
                  <td><span class="csp-badge csp-badge-ember">{{ p.role }}</span></td>
                  <td>{{ p.phone }}<br><span style="font-size:0.75rem; color:var(--csp-warm-grey);">{{ p.email }}</span></td>
                  <td>{{ p.address }}</td>
                  <td>
                    <span class="csp-badge" [ngClass]="p.isVerified ? 'csp-badge-sage' : 'csp-badge-clay'">
                      {{ p.isVerified ? 'Verified' : 'Pending Verification' }}
                    </span>
                  </td>
                  <td>
                    <button (click)="togglePartyVerification(p)" class="csp-btn csp-btn-secondary csp-btn-sm">
                      {{ p.isVerified ? 'Re-verify' : 'Mark Verified' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 3: ACCIDENT DETAILS -->
      <div *ngIf="activeTab === 'accident'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header"><h3 class="box-h3">Accident Chronology & Location Facts</h3></div>
          <div class="csp-card-body">
            <div class="ws-grid-2">
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Accident Date</span><span class="pv font-bold">{{ claim.accidentDate }}</span></div>
                <div class="pair-row"><span class="pk">Accident Time</span><span class="pv">{{ claim.accidentTime }}</span></div>
                <div class="pair-row"><span class="pk">Street / Location</span><span class="pv">{{ claim.accidentLocation }}</span></div>
                <div class="pair-row"><span class="pk">City & State</span><span class="pv">{{ claim.accidentCity }}, {{ claim.accidentState }}</span></div>
              </div>
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Police Station</span><span class="pv">{{ claim.policeStation }}</span></div>
                <div class="pair-row"><span class="pk">FIR Reference</span><span class="pv font-bold">{{ claim.firNumber }}</span></div>
                <div class="pair-row"><span class="pk">Loss Classification</span><span class="pv">{{ claim.lossType }}</span></div>
              </div>
            </div>
            <div style="margin-top:1.5rem; padding-top:1.25rem; border-top:1px solid var(--csp-border);">
              <span class="pk font-bold">Factual Narrative:</span>
              <p style="margin-top:0.4rem; line-height:1.6; color:var(--csp-charcoal);">{{ claim.accidentDescription }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 4: POLICY & VEHICLE -->
      <div *ngIf="activeTab === 'vehicle'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header"><h3 class="box-h3">Insured Motor Vehicle & Policy Schedule</h3></div>
          <div class="csp-card-body ws-grid-2">
            <div class="info-pairs">
              <div class="pair-row"><span class="pk">Registration Number</span><span class="pv font-mono font-bold">{{ claim.insuredVehicleNumber }}</span></div>
              <div class="pair-row"><span class="pk">Make & Model</span><span class="pv">{{ claim.vehicleMakeModel }}</span></div>
              <div class="pair-row"><span class="pk">Vehicle Class</span><span class="pv">{{ claim.vehicleType }}</span></div>
              <div class="pair-row"><span class="pk">Insured Person</span><span class="pv">{{ claim.insuredPersonName }}</span></div>
            </div>
            <div class="info-pairs">
              <div class="pair-row"><span class="pk">Policy Number</span><span class="pv font-mono font-bold">{{ claim.policyNumber }}</span></div>
              <div class="pair-row"><span class="pk">Driver at Accident</span><span class="pv">{{ claim.driverName }}</span></div>
              <div class="pair-row"><span class="pk">Driver License No.</span><span class="pv font-mono">{{ claim.driverLicenseNo || 'Verified on Sarathi' }}</span></div>
              <div class="pair-row"><span class="pk">Third Party Vehicle</span><span class="pv">{{ claim.thirdPartyVehicleNumber || 'None (Pedestrian)' }}</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 5: DOCUMENTS -->
      <div *ngIf="activeTab === 'documents'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Documents Vault ({{ claimDocs.length }})</h3>
            <div style="display:flex; gap:0.5rem;">
              <a routerLink="/ops/document-requests" class="csp-btn csp-btn-secondary csp-btn-sm">
                Request Additional Document
              </a>
              <a routerLink="/ops/document-verification" class="csp-btn csp-btn-primary csp-btn-sm">
                Verification Desk
              </a>
            </div>
          </div>
          <div class="csp-card-body" style="padding:0;">
            <table class="csp-table">
              <thead>
                <tr>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Uploader</th>
                  <th>Date</th>
                  <th>Review Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let doc of claimDocs">
                  <td class="font-bold">
                    <div style="display:flex; align-items:center; gap:0.4rem;">
                      <app-icon name="file-text" [size]="16" style="color:var(--csp-ember)"></app-icon>
                      <span>{{ doc.name }}</span>
                    </div>
                  </td>
                  <td>{{ doc.category }}</td>
                  <td>{{ doc.uploadedBy }}</td>
                  <td>{{ doc.uploadDate }}</td>
                  <td><app-status-badge [status]="doc.status"></app-status-badge></td>
                  <td>
                    <button *ngIf="doc.status !== 'Verified'" (click)="verifyDoc(doc)" class="csp-btn csp-btn-sage csp-btn-sm">
                      Mark Verified
                    </button>
                    <span *ngIf="doc.status === 'Verified'" style="color:var(--csp-sage); font-weight:700; font-size:0.8rem;">
                      ✓ Verified
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- TAB 6: INVESTIGATION -->
      <div *ngIf="activeTab === 'investigation'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Field Investigation Report</h3>
            <a routerLink="/ops/investigation" class="csp-btn csp-btn-secondary csp-btn-sm">Open Full Investigation Desk</a>
          </div>
          <div class="csp-card-body" *ngIf="investigationRecord">
            <div class="pair-row" style="margin-bottom:0.75rem;">
              <span class="pk">Assigned Field Investigator:</span>
              <span class="pv font-bold">{{ investigationRecord.investigatorName }} (Assigned: {{ investigationRecord.assignedDate }})</span>
            </div>
            <div class="pair-row" style="margin-bottom:0.75rem;">
              <span class="pk">Investigation Status:</span>
              <span class="csp-badge csp-badge-ember">{{ investigationRecord.status }}</span>
            </div>
            <div class="sec-box-inner" style="margin-top:1rem;">
              <h4 style="font-size:0.95rem; margin-bottom:0.4rem;">Chronology & Police FIR Findings</h4>
              <p style="color:var(--csp-warm-grey); font-size:0.88rem; line-height:1.6;">{{ investigationRecord.accidentChronology }}</p>
            </div>
            <div class="sec-box-inner" style="margin-top:1rem;">
              <h4 style="font-size:0.95rem; margin-bottom:0.4rem;">Technical Inspection & Witness Statements</h4>
              <p style="color:var(--csp-warm-grey); font-size:0.88rem; line-height:1.6;">{{ investigationRecord.findings }}</p>
            </div>
          </div>
          <div class="csp-card-body" *ngIf="!investigationRecord" style="text-align:center; padding:2rem;">
            <p style="color:var(--csp-warm-grey);">No field investigation has been initiated yet for this claim.</p>
            <a routerLink="/ops/investigation" class="csp-btn csp-btn-primary csp-btn-sm">Assign Investigator</a>
          </div>
        </div>
      </div>

      <!-- TAB 7: LEGAL / MACT -->
      <div *ngIf="activeTab === 'legal'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Tribunal / MACT Litigation Records</h3>
            <a routerLink="/ops/legal-mact" class="csp-btn csp-btn-secondary csp-btn-sm">Open Legal Desk</a>
          </div>
          <div class="csp-card-body" *ngIf="legalRecord">
            <div class="ws-grid-2">
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Case Reference</span><span class="pv font-bold font-mono">{{ legalRecord.caseReference }}</span></div>
                <div class="pair-row"><span class="pk">Tribunal Court</span><span class="pv">{{ legalRecord.tribunalCourt }}</span></div>
                <div class="pair-row"><span class="pk">Petitioner</span><span class="pv">{{ legalRecord.petitioner }}</span></div>
              </div>
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Panel Advocate</span><span class="pv font-bold">{{ legalRecord.advocateName }}</span></div>
                <div class="pair-row"><span class="pk">Court Motion Status</span><span class="csp-badge csp-badge-ember">{{ legalRecord.caseStatus }}</span></div>
                <div class="pair-row"><span class="pk">Next Hearing</span><span class="pv font-bold" style="color:var(--csp-terracotta)">{{ legalRecord.nextHearingDate }}</span></div>
              </div>
            </div>
          </div>
          <div class="csp-card-body" *ngIf="!legalRecord" style="text-align:center; padding:2rem;">
            <p style="color:var(--csp-warm-grey);">No active court litigation notice received for this claim yet. Pre-litigation stage.</p>
            <a routerLink="/ops/legal-mact" class="csp-btn csp-btn-primary csp-btn-sm">Record MACT Notice</a>
          </div>
        </div>
      </div>

      <!-- TAB 8: LIABILITY ASSESSMENT -->
      <div *ngIf="activeTab === 'liability'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Liability & Policy Breach Analysis</h3>
            <a routerLink="/ops/liability-assessment" class="csp-btn csp-btn-secondary csp-btn-sm">Liability Assessment Desk</a>
          </div>
          <div class="csp-card-body" *ngIf="liabilityRecord">
            <div class="ws-grid-2">
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Assessed Liability</span><span class="pv font-bold font-mono" style="font-size:1.1rem; color:var(--csp-charcoal)">{{ liabilityRecord.liabilityPercentage }}% Statutory Liability</span></div>
                <div class="pair-row"><span class="pk">Contributory Negligence</span><span class="pv">{{ liabilityRecord.contributoryNegligence }}</span></div>
              </div>
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Policy Breach Check</span><span class="csp-badge csp-badge-sage">{{ liabilityRecord.policyBreachCheck }}</span></div>
                <div class="pair-row"><span class="pk">Assessor Name</span><span class="pv font-semibold">{{ liabilityRecord.assessorName }} ({{ liabilityRecord.assessmentDate }})</span></div>
              </div>
            </div>
            <div style="margin-top:1.5rem; padding:1.25rem; background:var(--csp-ivory); border-radius:var(--csp-radius-sm);">
              <strong>Liability Legal Rationale:</strong>
              <p style="margin-top:0.35rem; color:var(--csp-warm-grey); line-height:1.6;">{{ liabilityRecord.rationale }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 9: COMPENSATION ASSESSMENT -->
      <div *ngIf="activeTab === 'compensation'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Itemized Compensation Assessment</h3>
            <a routerLink="/ops/compensation-assessment" class="csp-btn csp-btn-secondary csp-btn-sm">Compensation Desk</a>
          </div>
          <div class="csp-card-body" *ngIf="compRecord">
            <div class="ws-grid-2">
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Medical Expenses Assessed</span><span class="pv font-bold">₹{{ compRecord.medicalExpensesAssessed.toLocaleString('en-IN') }}</span></div>
                <div class="pair-row"><span class="pk">Loss of Earnings Assessed</span><span class="pv font-bold">₹{{ compRecord.lossOfEarningsAssessed.toLocaleString('en-IN') }}</span></div>
                <div class="pair-row"><span class="pk">Pain & Suffering</span><span class="pv font-bold">₹{{ compRecord.painAndSufferingAssessed.toLocaleString('en-IN') }}</span></div>
              </div>
              <div class="info-pairs">
                <div class="pair-row"><span class="pk">Property Repair Assessed</span><span class="pv font-bold">₹{{ compRecord.propertyRepairAssessed.toLocaleString('en-IN') }}</span></div>
                <div class="pair-row"><span class="pk">Total Proposed Assessment</span><span class="pv font-bold" style="font-size:1.2rem; color:var(--csp-ember)">₹{{ compRecord.totalProposedAssessment.toLocaleString('en-IN') }}</span></div>
                <div class="pair-row"><span class="pk">Assessment Status</span><span class="csp-badge csp-badge-ember">{{ compRecord.status }}</span></div>
              </div>
            </div>
            <p style="margin-top:1.25rem; color:var(--csp-warm-grey); font-size:0.88rem; line-height:1.6;">
              <strong>Calculation Summary:</strong> {{ compRecord.calculationSummary }}
            </p>
          </div>
        </div>
      </div>

      <!-- TAB 10: APPROVALS -->
      <div *ngIf="activeTab === 'approvals'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Underwriting & Claims Approval History</h3>
            <a routerLink="/ops/approvals" class="csp-btn csp-btn-primary csp-btn-sm">Open Approvals Desk</a>
          </div>
          <div class="csp-card-body">
            <div *ngIf="approvalsList.length === 0" style="padding:2rem; text-align:center; color:var(--csp-warm-grey);">
              No formal approval records generated for this claim yet.
            </div>
            <div *ngFor="let app of approvalsList" class="approval-card-item">
              <div class="app-head">
                <span class="font-bold">{{ app.approverName }} ({{ app.approverRole }})</span>
                <span class="csp-badge csp-badge-sage">{{ app.decision }}</span>
              </div>
              <div class="app-amount font-mono">Approved Amount: ₹{{ (app.approvedAmount || 0).toLocaleString('en-IN') }}</div>
              <p class="app-notes">{{ app.notes }}</p>
              <div class="app-date" style="font-size:0.75rem; color:var(--csp-warm-grey);">Date: {{ app.decisionDate }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 11: SETTLEMENT -->
      <div *ngIf="activeTab === 'settlement'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header">
            <h3 class="box-h3">Disbursement & Settlement Processing</h3>
            <a routerLink="/ops/settlement-processing" class="csp-btn csp-btn-primary csp-btn-sm">Settlement Operations</a>
          </div>
          <div class="csp-card-body">
            <div *ngIf="settlementRecord">
              <div class="ws-grid-2">
                <div class="info-pairs">
                  <div class="pair-row"><span class="pk">Transaction Reference</span><span class="pv font-mono font-bold">{{ settlementRecord.transactionReference }}</span></div>
                  <div class="pair-row"><span class="pk">Beneficiary Name</span><span class="pv font-bold">{{ settlementRecord.beneficiaryName }}</span></div>
                  <div class="pair-row"><span class="pk">Disbursed Amount</span><span class="pv font-bold" style="color:var(--csp-sage); font-size:1.1rem;">₹{{ settlementRecord.approvedAmount.toLocaleString('en-IN') }}</span></div>
                </div>
                <div class="info-pairs">
                  <div class="pair-row"><span class="pk">Bank & Account</span><span class="pv">{{ settlementRecord.beneficiaryBank }} ({{ settlementRecord.accountNumberMasked }})</span></div>
                  <div class="pair-row"><span class="pk">Settlement Status</span><span class="csp-badge csp-badge-sage">{{ settlementRecord.settlementStatus }}</span></div>
                  <div class="pair-row"><span class="pk">Mandate Verified</span><span class="pv font-semibold" style="color:var(--csp-sage)">✓ Completed</span></div>
                </div>
              </div>
              <p style="margin-top:1.25rem; font-size:0.86rem; color:var(--csp-warm-grey);">
                {{ settlementRecord.settlementNotes }}
              </p>
            </div>
            <div *ngIf="!settlementRecord" style="text-align:center; padding:2rem; color:var(--csp-warm-grey);">
              Settlement processing not initiated. Awaiting final approval stage.
            </div>
          </div>
        </div>
      </div>

      <!-- TAB 12: ACTIVITY HISTORY -->
      <div *ngIf="activeTab === 'history'" class="tab-content-area">
        <div class="csp-card">
          <div class="csp-card-header"><h3 class="box-h3">Complete End-to-End Audit Log</h3></div>
          <div class="csp-card-body">
            <div class="csp-timeline">
              <div *ngFor="let act of claim.activities" class="csp-timeline-item completed">
                <div class="csp-timeline-dot"></div>
                <div class="font-bold text-charcoal">{{ act.action }}</div>
                <div class="text-warm" style="font-size:0.86rem; margin-top:2px;">{{ act.details }}</div>
                <div style="font-size:0.75rem; color:var(--csp-warm-grey-light); margin-top:4px;">
                  {{ act.timestamp }} • Actor: {{ act.actor }} ({{ act.actorRole }}) • Stage: {{ act.stage }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Stage Update Modal -->
      <div class="csp-modal-backdrop" *ngIf="isStageModalOpen" (click)="isStageModalOpen = false">
        <div class="csp-modal" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.15rem;">Advance Claim Operational Stage</h3>
            <button (click)="isStageModalOpen = false" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body">
            <div class="csp-form-group">
              <label class="csp-label">Select Target Stage</label>
              <select [(ngModel)]="newStage" class="csp-select">
                <option value="Accident Intimation">Accident Intimation</option>
                <option value="Claim Registration">Claim Registration</option>
                <option value="Document Verification">Document Verification</option>
                <option value="Investigation">Investigation</option>
                <option value="Legal / MACT">Legal / MACT</option>
                <option value="Liability Assessment">Liability Assessment</option>
                <option value="Compensation Assessment">Compensation Assessment</option>
                <option value="Approvals">Approvals</option>
                <option value="Settlement Processing">Settlement Processing</option>
                <option value="Payment Tracking">Payment Tracking</option>
                <option value="Claim Closure">Claim Closure</option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Stage Status Label</label>
              <select [(ngModel)]="newStatus" class="csp-select">
                <option value="New Intimation">New Intimation</option>
                <option value="Registration Pending">Registration Pending</option>
                <option value="Documents Under Review">Documents Under Review</option>
                <option value="Awaiting Additional Documents">Awaiting Additional Documents</option>
                <option value="Investigation In Progress">Investigation In Progress</option>
                <option value="Legal Review Pending">Legal Review Pending</option>
                <option value="Assessment In Progress">Assessment In Progress</option>
                <option value="Pending Approval">Pending Approval</option>
                <option value="Approved — Ready for Settlement">Approved — Ready for Settlement</option>
                <option value="Settlement Processing">Settlement Processing</option>
                <option value="Settlement Completed">Settlement Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Transition Rationale / Audit Remarks</label>
              <textarea rows="2" [(ngModel)]="stageTransitionNotes" placeholder="Reason for advancing stage..." class="csp-textarea"></textarea>
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="isStageModalOpen = false" class="csp-btn csp-btn-secondary">Cancel</button>
            <button (click)="confirmStageProgression()" class="csp-btn csp-btn-primary">Update Stage</button>
          </div>
        </div>
      </div>

      <!-- Internal Note Modal -->
      <div class="csp-modal-backdrop" *ngIf="isNoteModalOpen" (click)="isNoteModalOpen = false">
        <div class="csp-modal" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.15rem;">Add Internal Claims Note</h3>
            <button (click)="isNoteModalOpen = false" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body">
            <div class="csp-form-group">
              <label class="csp-label">Internal Note Content</label>
              <textarea rows="4" [(ngModel)]="newNoteContent" placeholder="Enter findings, discussion with counsel, or instructions for field officer..." class="csp-textarea"></textarea>
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="isNoteModalOpen = false" class="csp-btn csp-btn-secondary">Cancel</button>
            <button (click)="saveInternalNote()" class="csp-btn csp-btn-primary">Save Note</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .workspace-page { display: flex; flex-direction: column; gap: 1.5rem; }

    .workspace-header-card { padding: 1.75rem 2rem; }
    .ws-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1.25rem; }

    .ws-breadcrumbs { display: flex; gap: 0.5rem; font-size: 0.8rem; color: var(--csp-warm-grey); margin-bottom: 0.35rem; }
    .ws-bc-link { color: var(--csp-warm-grey); font-weight: 600; }
    .ws-bc-sep { color: var(--csp-border-dark); }

    .ws-title-row { display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; }
    .ws-claim-id { font-size: 2.1rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .ws-loss-chip { font-size: 0.8rem; font-weight: 700; color: var(--csp-ember); background: var(--csp-ember-subtle); padding: 3px 8px; border-radius: var(--csp-radius-pill); }

    .ws-ref-sub { font-size: 0.85rem; color: var(--csp-warm-grey); margin-top: 0.4rem; }
    .meta-sep { margin: 0 0.4rem; color: var(--csp-border-dark); }

    .ws-status-actions-col { display: flex; flex-direction: column; align-items: flex-end; gap: 0.75rem; }
    .status-box { text-align: right; }
    .last-sync { font-size: 0.75rem; color: var(--csp-warm-grey); margin-top: 2px; }

    .stage-stepper-btn-group { display: flex; gap: 0.5rem; }

    .ws-summary-metrics-row {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--csp-border);
    }
    .ws-m-item { display: flex; flex-direction: column; gap: 0.2rem; }
    .ws-m-lbl { font-size: 0.74rem; font-weight: 700; text-transform: uppercase; color: var(--csp-warm-grey); letter-spacing: 0.04em; }
    .ws-m-val { font-size: 0.95rem; font-weight: 700; color: var(--csp-charcoal); }

    .ws-tabs-bar { margin-bottom: 1.25rem; }
    .ws-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }

    .box-h3 { font-size: 1.05rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }

    .info-pairs { display: flex; flex-direction: column; gap: 0.75rem; }
    .pair-row { display: flex; justify-content: space-between; font-size: 0.88rem; border-bottom: 1px solid var(--csp-bg-soft); padding-bottom: 0.45rem; }
    .pk { color: var(--csp-warm-grey); font-weight: 500; }
    .pv { color: var(--csp-charcoal); text-align: right; }

    .note-box {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.85rem 1rem;
      margin-bottom: 0.75rem;
    }
    .note-head { display: flex; justify-content: space-between; font-size: 0.78rem; margin-bottom: 0.35rem; }
    .note-author { color: var(--csp-charcoal); }
    .note-date { color: var(--csp-warm-grey); }
    .note-body { font-size: 0.86rem; color: var(--csp-charcoal); margin: 0; line-height: 1.5; }

    .approval-card-item {
      padding: 1rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      background: var(--csp-bg-soft);
      margin-bottom: 0.75rem;
    }
    .app-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.4rem; }
    .app-amount { font-size: 1.1rem; font-weight: 700; color: var(--csp-sage); margin-bottom: 0.35rem; }
    .app-notes { font-size: 0.86rem; color: var(--csp-warm-grey); line-height: 1.5; margin: 0 0 0.4rem; }

    .font-bold { font-weight: 700; }
    .font-semibold { font-weight: 600; }
    .font-mono { font-family: monospace; }
    .text-charcoal { color: var(--csp-charcoal); }
    .text-warm { color: var(--csp-warm-grey); }

    @media (max-width: 900px) {
      .ws-summary-metrics-row { grid-template-columns: 1fr 1fr; }
      .ws-grid-2 { grid-template-columns: 1fr; }
      .ws-status-actions-col { align-items: flex-start; }
    }
  `]
})
export class Claim360Component implements OnInit {
  mockData = inject(MockDataService);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  claimId = 'TP-2026-001842';
  claim?: ClaimRecord;
  activeTab: Tab360 = 'overview';

  isStageModalOpen = false;
  newStage: ClaimStage = 'Document Verification';
  newStatus: ClaimStatus = 'Documents Under Review';
  stageTransitionNotes = '';

  isNoteModalOpen = false;
  newNoteContent = '';

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'] || 'TP-2026-001842';
      this.claimId = id;
      this.claim = this.mockData.getClaimById(id) || this.mockData.claims()[0];
      if (this.claim) {
        this.newStage = this.claim.currentStage;
        this.newStatus = this.claim.status;
      }
    });
  }

  get claimDocs(): DocumentItem[] {
    if (!this.claim) return [];
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.documents().filter(d => d.claimRef === id || d.claimRef === this.claim?.intimationRef);
  }

  get investigationRecord() {
    if (!this.claim) return undefined;
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.investigations().find(i => i.claimRef === id || i.claimRef === this.claim?.intimationRef);
  }

  get legalRecord() {
    if (!this.claim) return undefined;
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.legalCases().find(l => l.claimRef === id || l.claimRef === this.claim?.intimationRef);
  }

  get liabilityRecord() {
    if (!this.claim) return undefined;
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.liabilityAssessments().find(a => a.claimRef === id || a.claimRef === this.claim?.intimationRef);
  }

  get compRecord() {
    if (!this.claim) return undefined;
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.compensationAssessments().find(c => c.claimRef === id || c.claimRef === this.claim?.intimationRef);
  }

  get approvalsList() {
    if (!this.claim) return [];
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.approvals().filter(a => a.claimRef === id || a.claimRef === this.claim?.intimationRef);
  }

  get settlementRecord() {
    if (!this.claim) return undefined;
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.settlements().find(s => s.claimRef === id || s.claimRef === this.claim?.intimationRef);
  }

  openQuickStageModal() {
    if (this.claim) {
      this.newStage = this.claim.currentStage;
      this.newStatus = this.claim.status;
      this.stageTransitionNotes = '';
      this.isStageModalOpen = true;
    }
  }

  confirmStageProgression() {
    if (!this.claim) return;
    const ref = this.claim.id || this.claim.intimationRef;
    this.mockData.updateClaimStage(ref, this.newStage, this.newStatus, this.stageTransitionNotes);
    this.claim = this.mockData.getClaimById(ref);
    this.toast.success(`Claim transitioned to ${this.newStage} (${this.newStatus})!`);
    this.isStageModalOpen = false;
  }

  verifyDoc(doc: DocumentItem) {
    this.mockData.verifyDocument(doc.id);
    this.toast.success(`Verified document: ${doc.name}`);
  }

  togglePartyVerification(party: any) {
    party.isVerified = !party.isVerified;
    this.mockData.saveState();
    this.toast.success(`${party.name} verification status updated to ${party.isVerified ? 'Verified' : 'Pending'}.`);
  }

  openAddPartyModal() {
    const name = prompt('Enter Party Full Name:');
    if (!name) return;
    const role: any = prompt('Enter Role (e.g. Witness, Driver, Vehicle Owner):', 'Witness');
    const phone = prompt('Enter Phone Number:', '+91 98400 00000') || '';
    if (!this.claim) return;
    this.mockData.addParty(this.claim.id || this.claim.intimationRef, {
      name,
      role,
      phone,
      email: '',
      address: 'City',
      isVerified: true
    });
    this.toast.success(`Added ${role}: ${name} to claim parties roster.`);
  }

  saveInternalNote() {
    if (!this.newNoteContent.trim() || !this.claim) return;
    this.mockData.addInternalNote(this.claim.id || this.claim.intimationRef, this.newNoteContent.trim());
    this.toast.success('Internal handler note saved to audit log.');
    this.newNoteContent = '';
    this.isNoteModalOpen = false;
  }
}
