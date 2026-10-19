import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClaimRecord } from '../../../core/models/claim.model';

@Component({
  selector: 'app-work-queue',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent, PriorityBadgeComponent],
  template: `
    <div class="queue-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Operations Workload</div>
          <h1 class="page-main-title">Claims Work Queue</h1>
          <p class="page-sub">Operational task queue monitoring claim assignments, SLAs, and active stage milestones.</p>
        </div>
      </div>

      <!-- Queue Metrics Strip -->
      <div class="queue-stats-row">
        <div class="stat-box" (click)="selectedFilter = 'ALL'" [class.active]="selectedFilter === 'ALL'">
          <span class="stat-lbl">Total Work Items</span>
          <span class="stat-num">{{ mockData.claims().length }}</span>
        </div>
        <div class="stat-box" (click)="selectedFilter = 'URGENT'" [class.active]="selectedFilter === 'URGENT'">
          <span class="stat-lbl">Urgent / High Priority</span>
          <span class="stat-num" style="color:var(--csp-ember)">
            {{ urgentClaimsCount }}
          </span>
        </div>
        <div class="stat-box" (click)="selectedFilter = 'DOCS'" [class.active]="selectedFilter === 'DOCS'">
          <span class="stat-lbl">Doc Verification</span>
          <span class="stat-num" style="color:var(--csp-terracotta)">
            {{ docVerificationCount }}
          </span>
        </div>
        <div class="stat-box" (click)="selectedFilter = 'INVESTIGATION'" [class.active]="selectedFilter === 'INVESTIGATION'">
          <span class="stat-lbl">Active Investigation</span>
          <span class="stat-num" style="color:var(--csp-charcoal)">
            {{ investigationCount }}
          </span>
        </div>
      </div>

      <!-- Filters & Actions Toolbar -->
      <div class="csp-card filter-card">
        <div class="filter-row">
          <div class="search-wrap">
            <app-icon name="search" [size]="16" class="s-icon"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchKeyword" 
              placeholder="Filter queue by reference, claimant, or handler..."
              class="queue-search"
            />
          </div>

          <div class="dropdowns-wrap">
            <select [(ngModel)]="handlerFilter" class="csp-select" style="width: auto;">
              <option value="ALL">All Handlers</option>
              <option value="Ananya Raman">Ananya Raman</option>
              <option value="Rajesh Menon">Rajesh Menon</option>
              <option value="Priya Deshmukh">Priya Deshmukh</option>
              <option value="Vikram Sethi">Vikram Sethi</option>
            </select>

            <select [(ngModel)]="stageFilter" class="csp-select" style="width: auto;">
              <option value="ALL">All Claim Stages</option>
              <option value="Accident Intimation">Accident Intimation</option>
              <option value="Document Verification">Document Verification</option>
              <option value="Investigation">Investigation</option>
              <option value="Legal / MACT">Legal / MACT</option>
              <option value="Liability Assessment">Liability Assessment</option>
              <option value="Approvals">Approvals</option>
              <option value="Settlement Processing">Settlement Processing</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Work Queue Table -->
      <div class="csp-table-wrapper">
        <table class="csp-table">
          <thead>
            <tr>
              <th>Priority</th>
              <th>Claim / Reference</th>
              <th>Claimant & Loss</th>
              <th>Current Stage</th>
              <th>Status</th>
              <th>Assigned Handler</th>
              <th>Target SLA</th>
              <th style="text-align: right;">Queue Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of queueItems" class="queue-row" (click)="openClaim(item)">
              <td>
                <app-priority-badge [priority]="item.priority"></app-priority-badge>
              </td>
              <td>
                <div class="font-bold text-charcoal">{{ item.id || item.intimationRef }}</div>
                <div class="font-mono text-warm" style="font-size:0.75rem;">{{ item.insuredVehicleNumber }}</div>
              </td>
              <td>
                <div class="font-semibold">{{ item.claimantName }}</div>
                <div class="text-warm" style="font-size:0.78rem;">{{ item.lossType }}</div>
              </td>
              <td>
                <span class="stage-tag">{{ item.currentStage }}</span>
              </td>
              <td>
                <app-status-badge [status]="item.status"></app-status-badge>
              </td>
              <td>
                <div style="display:flex; align-items:center; gap:0.4rem;">
                  <app-icon name="user" [size]="14" style="color:var(--csp-warm-grey)"></app-icon>
                  <span class="font-semibold" style="font-size:0.85rem;">{{ item.assignedHandler }}</span>
                </div>
              </td>
              <td>
                <div class="sla-badge" [class.urgent]="item.priority === 'Urgent'">
                  <app-icon name="clock" [size]="12"></app-icon>
                  <span>{{ getSlaText(item) }}</span>
                </div>
              </td>
              <td style="text-align: right;" (click)="$event.stopPropagation()">
                <div class="actions-cell">
                  <button (click)="openReassignModal(item)" class="csp-btn csp-btn-secondary csp-btn-sm" title="Reassign Handler">
                    <span>Reassign</span>
                  </button>
                  <button (click)="openClaim(item)" class="csp-btn csp-btn-primary csp-btn-sm" title="Open Claim 360 Workspace">
                    <span>Open 360</span>
                    <app-icon name="arrow-right" [size]="12"></app-icon>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Reassignment Modal Simulation -->
      <div class="csp-modal-backdrop" *ngIf="reassignModalOpen" (click)="reassignModalOpen = false">
        <div class="csp-modal" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.1rem;">Reassign Claim Handler</h3>
            <button (click)="reassignModalOpen = false" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body" *ngIf="selectedClaimForReassign">
            <p style="font-size:0.88rem; color:var(--csp-warm-grey); margin-bottom:1.25rem;">
              Reassign claim <strong>{{ selectedClaimForReassign.id || selectedClaimForReassign.intimationRef }}</strong> ({{ selectedClaimForReassign.claimantName }}) to another available claims officer.
            </p>
            <div class="csp-form-group">
              <label class="csp-label">Select New Handler</label>
              <select [(ngModel)]="newHandlerName" class="csp-select">
                <option value="Ananya Raman">Ananya Raman (Workload: 14 claims)</option>
                <option value="Rajesh Menon">Rajesh Menon (Workload: 18 claims)</option>
                <option value="Priya Deshmukh">Priya Deshmukh (Workload: 11 claims)</option>
                <option value="Vikram Sethi">Vikram Sethi (Workload: 16 claims)</option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Reason for Reassignment</label>
              <textarea rows="2" [(ngModel)]="reassignReason" placeholder="e.g. Workload balancing, language preference, specialized fatal loss investigation..." class="csp-textarea"></textarea>
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="reassignModalOpen = false" class="csp-btn csp-btn-secondary">Cancel</button>
            <button (click)="confirmReassignment()" class="csp-btn csp-btn-primary">Confirm Reassignment</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .queue-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .queue-stats-row {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .stat-box {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1rem 1.25rem;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      transition: var(--csp-transition);
    }
    .stat-box:hover { border-color: var(--csp-clay-dark); }
    .stat-box.active { border-color: var(--csp-ember); background: rgba(232, 93, 50, 0.04); }

    .stat-lbl { font-size: 0.76rem; font-weight: 700; text-transform: uppercase; color: var(--csp-warm-grey); }
    .stat-num { font-size: 1.6rem; font-weight: 800; color: var(--csp-charcoal); font-family: var(--csp-font-heading); }

    .filter-card { padding: 1rem 1.25rem; }
    .filter-row { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .search-wrap { flex: 1; min-width: 280px; position: relative; }
    .s-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); }
    .queue-search {
      width: 100%;
      padding: 0.55rem 0.85rem 0.55rem 2.4rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      font-size: 0.88rem;
      outline: none;
    }
    .queue-search:focus { border-color: var(--csp-ember); }
    .dropdowns-wrap { display: flex; gap: 0.75rem; }

    .queue-row { cursor: pointer; }
    .queue-row:hover { background-color: rgba(247, 241, 232, 0.5) !important; }

    .stage-tag {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }

    .sla-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.76rem;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: var(--csp-radius-pill);
      background: var(--csp-ivory);
      color: var(--csp-warm-grey);
      border: 1px solid var(--csp-border);
    }
    .sla-badge.urgent {
      background: var(--csp-error-subtle);
      color: var(--csp-error);
      border-color: rgba(185, 56, 38, 0.3);
    }

    .actions-cell { display: flex; gap: 0.4rem; justify-content: flex-end; }
    .text-charcoal { color: var(--csp-charcoal); }
    .text-warm { color: var(--csp-warm-grey); }
    .font-semibold { font-weight: 600; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }

    @media (max-width: 800px) {
      .queue-stats-row { grid-template-columns: 1fr 1fr; }
      .dropdowns-wrap { width: 100%; }
      .dropdowns-wrap select { flex: 1; }
    }
  `]
})
export class WorkQueueComponent {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  searchKeyword = '';
  handlerFilter = 'ALL';
  stageFilter = 'ALL';
  selectedFilter = 'ALL';

  reassignModalOpen = false;
  selectedClaimForReassign?: ClaimRecord;
  newHandlerName = 'Ananya Raman';
  reassignReason = '';

  get urgentClaimsCount() {
    return this.mockData.claims().filter(c => c.priority === 'Urgent' || c.priority === 'High').length;
  }
  get docVerificationCount() {
    return this.mockData.claims().filter(c => c.currentStage === 'Document Verification').length;
  }
  get investigationCount() {
    return this.mockData.claims().filter(c => c.currentStage === 'Investigation').length;
  }

  get queueItems(): ClaimRecord[] {
    let list = this.mockData.claims();

    if (this.selectedFilter === 'URGENT') {
      list = list.filter(c => c.priority === 'Urgent' || c.priority === 'High');
    } else if (this.selectedFilter === 'DOCS') {
      list = list.filter(c => c.currentStage === 'Document Verification');
    } else if (this.selectedFilter === 'INVESTIGATION') {
      list = list.filter(c => c.currentStage === 'Investigation');
    }

    if (this.searchKeyword.trim()) {
      const q = this.searchKeyword.toLowerCase().trim();
      list = list.filter(c => 
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.intimationRef && c.intimationRef.toLowerCase().includes(q)) ||
        c.claimantName.toLowerCase().includes(q) ||
        c.assignedHandler.toLowerCase().includes(q)
      );
    }

    if (this.handlerFilter !== 'ALL') {
      list = list.filter(c => c.assignedHandler === this.handlerFilter);
    }

    if (this.stageFilter !== 'ALL') {
      list = list.filter(c => c.currentStage === this.stageFilter);
    }

    return list;
  }

  getSlaText(claim: ClaimRecord): string {
    if (claim.priority === 'Urgent') return 'Target: 24 hrs';
    if (claim.status.includes('Awaiting')) return 'Waiting for Claimant';
    return 'Within SLA (3 Days)';
  }

  openClaim(claim: ClaimRecord) {
    this.router.navigate(['/ops/claim-360', claim.id || claim.intimationRef]);
  }

  openReassignModal(claim: ClaimRecord) {
    this.selectedClaimForReassign = claim;
    this.newHandlerName = claim.assignedHandler;
    this.reassignReason = '';
    this.reassignModalOpen = true;
  }

  confirmReassignment() {
    if (!this.selectedClaimForReassign) return;
    const ref = this.selectedClaimForReassign.id || this.selectedClaimForReassign.intimationRef;

    this.mockData.claims.update(list => list.map(c => {
      if (c.id === ref || c.intimationRef === ref) {
        return {
          ...c,
          assignedHandler: this.newHandlerName
        };
      }
      return c;
    }));

    this.mockData.saveState();
    this.toast.success(`Claim reassigned to ${this.newHandlerName}.`, 'Handler Updated');
    this.reassignModalOpen = false;
  }
}
