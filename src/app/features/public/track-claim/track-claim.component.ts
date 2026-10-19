import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ClaimRecord, ClaimStage } from '../../../core/models/claim.model';

@Component({
  selector: 'app-track-claim',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="track-page">
      <div class="track-container">
        <!-- Search Card -->
        <div class="csp-card search-card">
          <div class="search-header">
            <h2 class="search-title">Track Claim or Intimation Status</h2>
            <p class="search-subtitle">
              Enter your reference number (e.g. INT-2026-000184) or registered claim number (e.g. TP-2026-001842).
            </p>
          </div>

          <div class="search-bar-row">
            <div class="input-with-icon">
              <app-icon name="search" [size]="18" class="input-icon"></app-icon>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="search()"
                placeholder="Enter reference number (e.g. INT-2026-000184 or TP-2026-001842)..."
                class="track-input"
              />
            </div>
            <button (click)="search()" class="csp-btn csp-btn-primary csp-btn-lg">
              <span>Track Status</span>
            </button>
          </div>

          <!-- Quick presets for easy demonstration -->
          <div class="demo-presets">
            <span class="preset-label">Sample demo records:</span>
            <button (click)="loadSample('INT-2026-000184')" class="preset-chip">INT-2026-000184 (Ravi Kumar)</button>
            <button (click)="loadSample('TP-2026-001955')" class="preset-chip">TP-2026-001955 (Fatal Case)</button>
            <button (click)="loadSample('TP-2026-002104')" class="preset-chip">TP-2026-002104 (Property Loss)</button>
          </div>
        </div>

        <!-- Tracking Results Box -->
        <div *ngIf="claim" class="results-box">
          <!-- Summary Header -->
          <div class="csp-card status-header-card">
            <div class="status-top">
              <div class="identifiers-col">
                <div class="claim-type-label">{{ claim.lossType }} Claim</div>
                <h3 class="claim-main-ref">
                  {{ claim.id || claim.intimationRef }}
                </h3>
                <div class="sub-ref" *ngIf="claim.id && claim.intimationRef">
                  Intimation Reference: <strong>{{ claim.intimationRef }}</strong>
                </div>
              </div>

              <div class="status-col">
                <app-status-badge [status]="claim.status"></app-status-badge>
                <div class="last-update">Last Updated: {{ claim.lastUpdated }}</div>
              </div>
            </div>

            <div class="meta-pills-row">
              <div class="meta-pill">
                <app-icon name="user" [size]="14"></app-icon>
                <span>Claimant: <strong>{{ claim.claimantName }}</strong></span>
              </div>
              <div class="meta-pill">
                <app-icon name="car" [size]="14"></app-icon>
                <span>Insured Vehicle: <strong>{{ claim.insuredVehicleNumber }}</strong></span>
              </div>
              <div class="meta-pill">
                <app-icon name="map-pin" [size]="14"></app-icon>
                <span>{{ claim.accidentCity }}, {{ claim.accidentState }}</span>
              </div>
              <div class="meta-pill" *ngIf="claim.assignedHandler">
                <app-icon name="shield-check" [size]="14"></app-icon>
                <span>Handler: <strong>{{ claim.assignedHandler }}</strong></span>
              </div>
            </div>
          </div>

          <!-- Progress Timeline -->
          <div class="csp-card timeline-card">
            <div class="csp-card-header">
              <h3 style="font-size:1.1rem; margin:0;">Claims Stage Progress</h3>
              <span class="csp-badge csp-badge-ember">Current: {{ claim.currentStage }}</span>
            </div>
            <div class="csp-card-body">
              <div class="horizontal-timeline">
                <div 
                  *ngFor="let stage of allStages; let i = index" 
                  class="stage-node" 
                  [ngClass]="getStageClass(stage)"
                >
                  <div class="node-marker">
                    <span *ngIf="isStageCompleted(stage)">✓</span>
                    <span *ngIf="!isStageCompleted(stage)">{{ i + 1 }}</span>
                  </div>
                  <div class="node-title">{{ stage }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Two-column info: Pending Requests & Recent Activity -->
          <div class="details-grid-2">
            <!-- Left: Document Requests & Pending Items -->
            <div class="csp-card">
              <div class="csp-card-header">
                <h4 style="margin:0; font-size:1rem; display:flex; align-items:center; gap:0.4rem;">
                  <app-icon name="upload" [size]="16" style="color:var(--csp-ember)"></app-icon>
                  Outstanding Document Requests
                </h4>
              </div>
              <div class="csp-card-body">
                <div *ngIf="pendingRequests.length === 0" class="empty-state-small">
                  <app-icon name="check-circle" [size]="20" style="color:var(--csp-sage)"></app-icon>
                  <span>No outstanding document requests from the claims team.</span>
                </div>

                <div *ngFor="let req of pendingRequests" class="request-item">
                  <div class="req-title-row">
                    <span class="req-doc-title">{{ req.requestedDocument }}</span>
                    <span class="csp-badge csp-badge-ember">{{ req.claimantStatus }}</span>
                  </div>
                  <p class="req-reason">{{ req.reason }}</p>
                  <div class="req-footer">
                    <span class="req-due">Due Date: {{ req.dueDate }}</span>
                    <a [routerLink]="['/public/additional-documents', claim.id || claim.intimationRef]" class="csp-btn csp-btn-primary csp-btn-sm">
                      Upload Now
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right: Activity History & Quick Contact -->
            <div class="csp-card">
              <div class="csp-card-header">
                <h4 style="margin:0; font-size:1rem; display:flex; align-items:center; gap:0.4rem;">
                  <app-icon name="clock" [size]="16" style="color:var(--csp-charcoal)"></app-icon>
                  Recent Claim Milestones
                </h4>
                <a [routerLink]="['/public/claim-details', claim.id || claim.intimationRef]" class="text-link">
                  View Full File
                </a>
              </div>
              <div class="csp-card-body">
                <div class="csp-timeline">
                  <div *ngFor="let act of claim.activities.slice(0, 4)" class="csp-timeline-item completed">
                    <div class="csp-timeline-dot"></div>
                    <div style="font-weight: 700; font-size: 0.88rem; color: var(--csp-charcoal);">
                      {{ act.action }}
                    </div>
                    <div style="font-size: 0.82rem; color: var(--csp-warm-grey); margin-top: 2px;">
                      {{ act.details }}
                    </div>
                    <div style="font-size: 0.74rem; color: var(--csp-warm-grey-light); margin-top: 4px;">
                      {{ act.timestamp }} • {{ act.actor }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Bottom Action Strip -->
          <div class="results-actions">
            <a [routerLink]="['/public/claim-details', claim.id || claim.intimationRef]" class="csp-btn csp-btn-primary csp-btn-lg">
              <app-icon name="eye" [size]="16"></app-icon>
              <span>View Comprehensive Claim Details</span>
            </a>
            <a routerLink="/public/help" class="csp-btn csp-btn-secondary csp-btn-lg">
              <app-icon name="help-circle" [size]="16"></app-icon>
              <span>Need Help with this Stage?</span>
            </a>
          </div>
        </div>

        <!-- Not Found State -->
        <div *ngIf="hasSearched && !claim" class="csp-card empty-search-card">
          <app-icon name="alert-circle" [size]="40" class="empty-icon"></app-icon>
          <h3>No Record Found for "{{ searchQuery }}"</h3>
          <p>Please double-check the intimation reference (e.g. INT-2026-000184) or registered claim number.</p>
          <button (click)="loadSample('INT-2026-000184')" class="csp-btn csp-btn-primary" style="margin-top:1rem;">
            Load Demonstration Sample (INT-2026-000184)
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .track-page { padding: 3rem 1.5rem 5rem; }
    .track-container { max-width: 1080px; margin: 0 auto; }

    .search-card { padding: 2rem; margin-bottom: 2rem; }
    .search-header { margin-bottom: 1.5rem; }
    .search-title { font-size: 1.6rem; font-weight: 800; color: var(--csp-charcoal); margin-bottom: 0.4rem; }
    .search-subtitle { color: var(--csp-warm-grey); font-size: 0.92rem; }

    .search-bar-row {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .input-with-icon {
      flex: 1;
      position: relative;
    }

    .input-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--csp-warm-grey);
    }

    .track-input {
      width: 100%;
      padding: 0.8rem 1rem 0.8rem 2.75rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      font-size: 0.95rem;
      outline: none;
      font-family: inherit;
    }
    .track-input:focus {
      border-color: var(--csp-ember);
      box-shadow: 0 0 0 3px rgba(232, 93, 50, 0.12);
    }

    .demo-presets {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      font-size: 0.8rem;
    }
    .preset-label { color: var(--csp-warm-grey); font-weight: 600; }
    .preset-chip {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      padding: 3px 10px;
      border-radius: var(--csp-radius-pill);
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--csp-charcoal);
      cursor: pointer;
      transition: var(--csp-transition);
    }
    .preset-chip:hover { background: var(--csp-clay); }

    /* Results */
    .status-header-card { padding: 1.75rem; margin-bottom: 1.5rem; }
    .status-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .claim-type-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--csp-ember);
      margin-bottom: 0.25rem;
    }

    .claim-main-ref {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0 0 0.25rem;
    }

    .sub-ref { font-size: 0.85rem; color: var(--csp-warm-grey); }

    .status-col {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.35rem;
    }
    .last-update { font-size: 0.78rem; color: var(--csp-warm-grey); }

    .meta-pills-row {
      display: flex;
      gap: 1.25rem;
      flex-wrap: wrap;
      padding-top: 1rem;
      border-top: 1px solid var(--csp-border);
    }

    .meta-pill {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--csp-charcoal);
    }

    /* Horizontal Timeline */
    .timeline-card { margin-bottom: 1.5rem; }
    .horizontal-timeline {
      display: flex;
      justify-content: space-between;
      overflow-x: auto;
      padding: 1rem 0;
      scrollbar-width: none;
      gap: 1rem;
    }

    .stage-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      min-width: 120px;
      position: relative;
      flex: 1;
    }

    .node-marker {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--csp-white);
      border: 2px solid var(--csp-border-dark);
      color: var(--csp-warm-grey);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.85rem;
      margin-bottom: 0.5rem;
      z-index: 2;
    }

    .stage-node.completed .node-marker {
      background: var(--csp-sage);
      border-color: var(--csp-sage);
      color: var(--csp-white);
    }

    .stage-node.active .node-marker {
      background: var(--csp-ember);
      border-color: var(--csp-ember);
      color: var(--csp-white);
      box-shadow: 0 0 0 4px var(--csp-ember-subtle);
    }

    .node-title {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--csp-warm-grey);
    }
    .stage-node.active .node-title { color: var(--csp-charcoal); font-weight: 700; }

    /* Grid 2 */
    .details-grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .empty-state-small {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 1rem;
      background: var(--csp-bg-soft);
      border-radius: var(--csp-radius-sm);
      font-size: 0.85rem;
      color: var(--csp-warm-grey);
    }

    .request-item {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 1rem;
      margin-bottom: 0.75rem;
    }

    .req-title-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.35rem;
    }

    .req-doc-title { font-size: 0.9rem; font-weight: 700; color: var(--csp-charcoal); }
    .req-reason { font-size: 0.82rem; color: var(--csp-warm-grey); margin-bottom: 0.75rem; line-height: 1.45; }
    .req-footer { display: flex; justify-content: space-between; align-items: center; }
    .req-due { font-size: 0.78rem; font-weight: 600; color: var(--csp-terracotta); }

    .text-link { font-size: 0.82rem; font-weight: 700; color: var(--csp-ember); }

    .results-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .empty-search-card {
      padding: 3rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .empty-icon { color: var(--csp-terracotta); margin-bottom: 1rem; }

    @media (max-width: 800px) {
      .details-grid-2 { grid-template-columns: 1fr; }
      .search-bar-row { flex-direction: column; }
      .status-col { align-items: flex-start; }
    }
  `]
})
export class TrackClaimComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mockData = inject(MockDataService);

  searchQuery = 'INT-2026-000184';
  claim?: ClaimRecord;
  hasSearched = false;

  allStages: ClaimStage[] = [
    'Accident Intimation',
    'Claim Registration',
    'Document Verification',
    'Investigation',
    'Liability Assessment',
    'Compensation Assessment',
    'Approvals',
    'Settlement Processing',
    'Claim Closure'
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['ref']) {
        this.searchQuery = params['ref'];
        this.search();
      } else {
        this.search();
      }
    });
  }

  search() {
    this.hasSearched = true;
    const term = this.searchQuery.trim();
    if (!term) return;

    this.claim = this.mockData.getClaimById(term);
  }

  loadSample(ref: string) {
    this.searchQuery = ref;
    this.search();
  }

  get pendingRequests() {
    if (!this.claim) return [];
    const id = this.claim.id || this.claim.intimationRef;
    return this.mockData.documentRequests().filter(r => r.claimRef === id || r.claimRef === this.claim?.intimationRef);
  }

  getStageClass(stage: ClaimStage): string {
    if (!this.claim) return '';
    const currentIndex = this.allStages.indexOf(this.claim.currentStage);
    const thisIndex = this.allStages.indexOf(stage);

    if (thisIndex < currentIndex) return 'completed';
    if (thisIndex === currentIndex) return 'active';
    return '';
  }

  isStageCompleted(stage: ClaimStage): boolean {
    if (!this.claim) return false;
    const currentIndex = this.allStages.indexOf(this.claim.currentStage);
    const thisIndex = this.allStages.indexOf(stage);
    return thisIndex < currentIndex;
  }
}
