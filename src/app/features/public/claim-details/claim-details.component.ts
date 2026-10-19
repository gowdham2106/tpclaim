import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ClaimRecord } from '../../../core/models/claim.model';

type DetailTab = 'overview' | 'progress' | 'documents' | 'requests' | 'communications' | 'support';

@Component({
  selector: 'app-claim-details',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="claim-details-page">
      <div class="details-container">
        <!-- Top Back Bar -->
        <div class="top-nav-bar">
          <a routerLink="/public/track-claim" class="csp-btn csp-btn-secondary csp-btn-sm">
            <app-icon name="arrow-left" [size]="14"></app-icon>
            Back to Claim Tracker
          </a>
          <span class="view-tag">Claimant Self-Service View</span>
        </div>

        <div *ngIf="claim" class="details-body">
          <!-- Claim Main Header Banner -->
          <div class="csp-card header-banner">
            <div class="banner-main">
              <div class="banner-title-col">
                <div class="banner-meta-top">
                  <span class="loss-badge">{{ claim.lossType }}</span>
                  <span class="meta-sep">•</span>
                  <span class="date-reported">Intimated on {{ claim.dateReported }}</span>
                </div>
                <h1 class="claim-ref-title">
                  {{ claim.id || claim.intimationRef }}
                </h1>
                <div class="intimation-sub" *ngIf="claim.id && claim.intimationRef">
                  Intimation Reference: <strong>{{ claim.intimationRef }}</strong>
                </div>
              </div>

              <div class="banner-status-col">
                <app-status-badge [status]="claim.status"></app-status-badge>
                <div class="stage-tag">Current Stage: <strong>{{ claim.currentStage }}</strong></div>
              </div>
            </div>

            <!-- Quick Metrics Grid -->
            <div class="header-metrics-row">
              <div class="metric-item">
                <span class="metric-label">Claimant</span>
                <span class="metric-val">{{ claim.claimantName }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Insured Vehicle</span>
                <span class="metric-val font-mono">{{ claim.insuredVehicleNumber }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Accident Location</span>
                <span class="metric-val">{{ claim.accidentLocation }}, {{ claim.accidentCity }}</span>
              </div>
              <div class="metric-item">
                <span class="metric-label">Assigned Handler</span>
                <span class="metric-val">{{ claim.assignedHandler || 'Intake Team' }}</span>
              </div>
            </div>
          </div>

          <!-- Functional Tabs -->
          <div class="csp-tabs">
            <button class="csp-tab-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">
              <app-icon name="file-text" [size]="16"></app-icon>
              Overview
            </button>
            <button class="csp-tab-btn" [class.active]="activeTab === 'progress'" (click)="activeTab = 'progress'">
              <app-icon name="clock" [size]="16"></app-icon>
              Progress Timeline
            </button>
            <button class="csp-tab-btn" [class.active]="activeTab === 'documents'" (click)="activeTab = 'documents'">
              <app-icon name="files" [size]="16"></app-icon>
              Uploaded Documents ({{ claimDocuments.length }})
            </button>
            <button class="csp-tab-btn" [class.active]="activeTab === 'requests'" (click)="activeTab = 'requests'">
              <app-icon name="upload" [size]="16"></app-icon>
              Document Requests ({{ pendingRequests.length }})
            </button>
            <button class="csp-tab-btn" [class.active]="activeTab === 'communications'" (click)="activeTab = 'communications'">
              <app-icon name="message-square" [size]="16"></app-icon>
              Communications
            </button>
            <button class="csp-tab-btn" [class.active]="activeTab === 'support'" (click)="activeTab = 'support'">
              <app-icon name="help-circle" [size]="16"></app-icon>
              Help & Support
            </button>
          </div>

          <!-- TAB 1: OVERVIEW -->
          <div *ngIf="activeTab === 'overview'" class="tab-pane">
            <div class="grid-2-sections">
              <!-- Incident & Accident Facts -->
              <div class="csp-card">
                <div class="csp-card-header">
                  <h3 class="pane-card-title">Accident Particulars</h3>
                </div>
                <div class="csp-card-body info-list">
                  <div class="info-row">
                    <span class="k">Date & Time</span>
                    <span class="v">{{ claim.accidentDate }} at {{ claim.accidentTime }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">Location</span>
                    <span class="v">{{ claim.accidentLocation }}, {{ claim.accidentCity }}, {{ claim.accidentState }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">Police Station</span>
                    <span class="v">{{ claim.policeStation || 'Not recorded' }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">FIR Number</span>
                    <span class="v">{{ claim.firNumber || 'Pending verification' }}</span>
                  </div>
                  <div class="desc-section">
                    <span class="k">Accident Summary</span>
                    <p class="summary-text">{{ claim.accidentDescription }}</p>
                  </div>
                </div>
              </div>

              <!-- Vehicle & Policy Facts -->
              <div class="csp-card">
                <div class="csp-card-header">
                  <h3 class="pane-card-title">Vehicle & Policy Particulars</h3>
                </div>
                <div class="csp-card-body info-list">
                  <div class="info-row">
                    <span class="k">Insured Vehicle</span>
                    <span class="v font-mono font-bold">{{ claim.insuredVehicleNumber }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">Category / Model</span>
                    <span class="v">{{ claim.vehicleType }} — {{ claim.vehicleMakeModel }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">Policy Number</span>
                    <span class="v font-mono">{{ claim.policyNumber }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">Insurer</span>
                    <span class="v">{{ claim.insurerName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">Vehicle Owner</span>
                    <span class="v">{{ claim.insuredPersonName }}</span>
                  </div>
                  <div class="info-row">
                    <span class="k">Claimant Vehicle</span>
                    <span class="v">{{ claim.thirdPartyVehicleNumber || 'N/A (Pedestrian)' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 2: PROGRESS TIMELINE -->
          <div *ngIf="activeTab === 'progress'" class="tab-pane">
            <div class="csp-card">
              <div class="csp-card-header">
                <h3 class="pane-card-title">Milestone Activity Log</h3>
              </div>
              <div class="csp-card-body">
                <div class="csp-timeline">
                  <div *ngFor="let act of claim.activities" class="csp-timeline-item completed">
                    <div class="csp-timeline-dot"></div>
                    <div style="font-weight: 700; font-size: 0.95rem; color: var(--csp-charcoal);">
                      {{ act.action }}
                    </div>
                    <div style="font-size: 0.88rem; color: var(--csp-warm-grey); margin-top: 3px;">
                      {{ act.details }}
                    </div>
                    <div style="font-size: 0.78rem; color: var(--csp-warm-grey-light); margin-top: 5px;">
                      {{ act.timestamp }} • Logged by {{ act.actor }} ({{ act.actorRole }})
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 3: DOCUMENTS -->
          <div *ngIf="activeTab === 'documents'" class="tab-pane">
            <div class="csp-card">
              <div class="csp-card-header">
                <h3 class="pane-card-title">Submitted Evidentiary Files</h3>
                <a [routerLink]="['/public/additional-documents', claim.id || claim.intimationRef]" class="csp-btn csp-btn-primary csp-btn-sm">
                  <app-icon name="plus" [size]="14"></app-icon>
                  Upload New Document
                </a>
              </div>
              <div class="csp-card-body" style="padding:0;">
                <table class="csp-table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Category</th>
                      <th>Uploaded By</th>
                      <th>Date</th>
                      <th>Verification Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let doc of claimDocuments">
                      <td style="font-weight: 600;">
                        <div style="display:flex; align-items:center; gap:0.5rem;">
                          <app-icon name="file-text" [size]="16" style="color:var(--csp-ember)"></app-icon>
                          <span>{{ doc.name }}</span>
                        </div>
                        <span style="font-size:0.75rem; color:var(--csp-warm-grey); margin-left:24px;">{{ doc.fileName }} ({{ doc.fileSize }})</span>
                      </td>
                      <td>{{ doc.category }}</td>
                      <td>{{ doc.uploadedBy }}</td>
                      <td>{{ doc.uploadDate }}</td>
                      <td>
                        <app-status-badge [status]="doc.status"></app-status-badge>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- TAB 4: REQUESTS -->
          <div *ngIf="activeTab === 'requests'" class="tab-pane">
            <div class="csp-card">
              <div class="csp-card-header">
                <h3 class="pane-card-title">Outstanding Document Requests from Claims Officer</h3>
              </div>
              <div class="csp-card-body">
                <div *ngIf="pendingRequests.length === 0" style="padding:2rem; text-align:center; color:var(--csp-warm-grey);">
                  <app-icon name="check-circle" [size]="32" style="color:var(--csp-sage); margin-bottom:0.5rem;"></app-icon>
                  <p>All requested documentation has been reviewed. No additional items needed currently.</p>
                </div>

                <div *ngFor="let req of pendingRequests" class="request-box">
                  <div class="req-top">
                    <div>
                      <h4 class="req-head">{{ req.requestedDocument }}</h4>
                      <div class="req-cat">{{ req.category }}</div>
                    </div>
                    <span class="csp-badge csp-badge-ember">{{ req.claimantStatus }}</span>
                  </div>
                  <p class="req-note"><strong>Reason for request:</strong> {{ req.reason }}</p>
                  <div class="req-meta-row">
                    <span>Requested by: {{ req.assignedHandler }} on {{ req.requestedDate }}</span>
                    <span>Due Date: <strong>{{ req.dueDate }}</strong></span>
                  </div>
                  <div style="margin-top: 1rem;">
                    <a [routerLink]="['/public/additional-documents', claim.id || claim.intimationRef]" class="csp-btn csp-btn-primary csp-btn-sm">
                      <app-icon name="upload" [size]="14"></app-icon>
                      Submit Requested Document
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 5: COMMUNICATIONS -->
          <div *ngIf="activeTab === 'communications'" class="tab-pane">
            <div class="csp-card">
              <div class="csp-card-header">
                <h3 class="pane-card-title">Official Communications & Calls Log</h3>
              </div>
              <div class="csp-card-body">
                <div *ngFor="let com of communications" class="comm-item">
                  <div class="comm-header">
                    <span class="csp-badge csp-badge-charcoal">{{ com.type }}</span>
                    <span style="font-size:0.8rem; color:var(--csp-warm-grey);">{{ com.date }} at {{ com.time }}</span>
                  </div>
                  <div style="font-size:0.86rem; font-weight:600; color:var(--csp-charcoal); margin:0.4rem 0 0.2rem;">
                    {{ com.participants }}
                  </div>
                  <p style="font-size:0.85rem; color:var(--csp-warm-grey); line-height:1.5; margin:0;">
                    {{ com.summary }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- TAB 6: SUPPORT -->
          <div *ngIf="activeTab === 'support'" class="tab-pane">
            <div class="grid-2-sections">
              <div class="csp-card">
                <div class="csp-card-header">
                  <h3 class="pane-card-title">Assigned Claims Representative</h3>
                </div>
                <div class="csp-card-body">
                  <div class="rep-box">
                    <div class="rep-avatar">AR</div>
                    <div class="rep-info">
                      <div class="rep-name">{{ claim.assignedHandler }}</div>
                      <div class="rep-role">Senior Claims Specialist — TP Motor Hub</div>
                      <div class="rep-email">Direct Claim Contact: ananya.raman&#64;claimshieldplus.internal</div>
                    </div>
                  </div>
                  <p style="font-size:0.88rem; color:var(--csp-warm-grey); line-height:1.6; margin-top:1rem;">
                    Your claims handler reviews evidence, coordinates with police and surveyor field reports, and prepares compensation calculations under statutory Motor Accident guidelines.
                  </p>
                </div>
              </div>

              <div class="csp-card">
                <div class="csp-card-header">
                  <h3 class="pane-card-title">Helpful Resources</h3>
                </div>
                <div class="csp-card-body">
                  <div class="help-links-list">
                    <a routerLink="/public/help" class="help-link-card">
                      <app-icon name="help-circle" [size]="18" class="link-icon"></app-icon>
                      <div>
                        <strong>Tribunal & Settlement FAQs</strong>
                        <p>How compensation is determined in bodily injury and property claims.</p>
                      </div>
                    </a>
                    <a routerLink="/public/help" class="help-link-card">
                      <app-icon name="file-text" [size]="18" class="link-icon"></app-icon>
                      <div>
                        <strong>Document Checklist Guide</strong>
                        <p>Detailed verification requirements for medical invoices and repair quotes.</p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .claim-details-page { padding: 2.5rem 1.5rem 5rem; }
    .details-container { max-width: 1140px; margin: 0 auto; }

    .top-nav-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .view-tag {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--csp-warm-grey);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Header Banner */
    .header-banner {
      padding: 1.75rem 2rem;
      margin-bottom: 1.5rem;
      background: var(--csp-white);
    }

    .banner-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .banner-meta-top {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      margin-bottom: 0.4rem;
    }

    .loss-badge {
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
      color: var(--csp-ember);
      letter-spacing: 0.04em;
    }

    .meta-sep { color: var(--csp-border-dark); }
    .date-reported { font-size: 0.8rem; color: var(--csp-warm-grey); }

    .claim-ref-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }

    .intimation-sub { font-size: 0.88rem; color: var(--csp-warm-grey); margin-top: 0.25rem; }

    .banner-status-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.4rem;
    }

    .stage-tag { font-size: 0.82rem; color: var(--csp-warm-grey); }

    .header-metrics-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      padding-top: 1.25rem;
      border-top: 1px solid var(--csp-border);
    }

    .metric-item { display: flex; flex-direction: column; gap: 0.2rem; }
    .metric-label { font-size: 0.75rem; font-weight: 600; text-transform: uppercase; color: var(--csp-warm-grey); }
    .metric-val { font-size: 0.95rem; font-weight: 700; color: var(--csp-charcoal); }

    .font-mono { font-family: monospace; }
    .font-bold { font-weight: 700; }

    /* Tabs & Content */
    .tab-pane { margin-top: 1rem; }
    .grid-2-sections { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .pane-card-title { font-size: 1.1rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }

    .info-list { display: flex; flex-direction: column; gap: 0.85rem; }
    .info-row { display: flex; justify-content: space-between; font-size: 0.88rem; border-bottom: 1px solid var(--csp-bg-soft); padding-bottom: 0.5rem; }
    .k { color: var(--csp-warm-grey); font-weight: 500; }
    .v { color: var(--csp-charcoal); font-weight: 600; text-align: right; }

    .desc-section { padding-top: 0.5rem; }
    .summary-text { font-size: 0.88rem; color: var(--csp-charcoal); line-height: 1.55; margin-top: 0.35rem; }

    /* Request box */
    .request-box {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 1.25rem;
      margin-bottom: 1rem;
    }
    .req-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .req-head { font-size: 1rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }
    .req-cat { font-size: 0.78rem; color: var(--csp-warm-grey); margin-top: 2px; }
    .req-note { font-size: 0.86rem; color: var(--csp-charcoal); margin: 0.75rem 0; }
    .req-meta-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--csp-warm-grey); }

    /* Comm */
    .comm-item {
      padding: 1rem;
      border-bottom: 1px solid var(--csp-border);
    }
    .comm-item:last-child { border-bottom: none; }
    .comm-header { display: flex; justify-content: space-between; align-items: center; }

    /* Rep */
    .rep-box { display: flex; align-items: center; gap: 1rem; }
    .rep-avatar {
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: var(--csp-ember);
      color: var(--csp-white);
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rep-name { font-size: 1.05rem; font-weight: 700; color: var(--csp-charcoal); }
    .rep-role { font-size: 0.8rem; color: var(--csp-warm-grey); }
    .rep-email { font-size: 0.78rem; color: var(--csp-ember); font-weight: 600; margin-top: 2px; }

    .help-links-list { display: flex; flex-direction: column; gap: 0.75rem; }
    .help-link-card {
      display: flex;
      gap: 0.85rem;
      padding: 0.85rem 1rem;
      background: var(--csp-bg-soft);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      text-decoration: none;
      color: inherit;
      transition: var(--csp-transition);
    }
    .help-link-card:hover { border-color: var(--csp-ember); transform: translateX(3px); }
    .link-icon { color: var(--csp-ember); flex-shrink: 0; margin-top: 3px; }
    .help-link-card strong { font-size: 0.88rem; color: var(--csp-charcoal); }
    .help-link-card p { font-size: 0.8rem; color: var(--csp-warm-grey); margin: 2px 0 0; }

    @media (max-width: 800px) {
      .header-metrics-row { grid-template-columns: 1fr 1fr; }
      .grid-2-sections { grid-template-columns: 1fr; }
      .banner-status-col { align-items: flex-start; }
    }
  `]
})
export class ClaimDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mockData = inject(MockDataService);

  claimId = 'TP-2026-001842';
  claim?: ClaimRecord;
  activeTab: DetailTab = 'overview';

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = params['id'] || 'TP-2026-001842';
      this.claimId = id;
      this.claim = this.mockData.getClaimById(id) || this.mockData.claims()[0];
    });
  }

  get claimDocuments() {
    if (!this.claim) return [];
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.documents().filter(d => d.claimRef === id || d.claimRef === this.claim?.intimationRef);
  }

  get pendingRequests() {
    if (!this.claim) return [];
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.documentRequests().filter(r => r.claimRef === id || r.claimRef === this.claim?.intimationRef);
  }

  get communications() {
    if (!this.claim) return [];
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.communications().filter(c => c.claimRef === id || c.claimRef === this.claim?.intimationRef);
  }
}
