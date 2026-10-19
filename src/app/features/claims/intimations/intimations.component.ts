import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../../shared/components/priority-badge/priority-badge.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ClaimRecord, LossType, Priority } from '../../../core/models/claim.model';

@Component({
  selector: 'app-intimations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent, PriorityBadgeComponent],
  template: `
    <div class="intimations-page">
      <!-- Page Header -->
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Claim Intake & Triage</div>
          <h1 class="page-main-title">Accident Intimations Repository</h1>
          <p class="page-sub">Comprehensive intake roster of all third-party accident intimations reported via portal or call center.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/ops/claim-registration" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Register New Claim</span>
          </a>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="csp-card filter-toolbar-card">
        <div class="toolbar-row">
          <div class="search-field-box">
            <app-icon name="search" [size]="16" class="search-icon"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchTerm" 
              placeholder="Search by Intimation Ref, claimant, vehicle registration, location..."
              class="toolbar-search-input"
            />
          </div>

          <div class="filter-controls-group">
            <!-- Loss Type Filter -->
            <select [(ngModel)]="selectedLossType" class="toolbar-select">
              <option value="ALL">All Loss Types</option>
              <option value="Bodily Injury">Bodily Injury</option>
              <option value="Fatal Accident">Fatal Accident</option>
              <option value="Third-Party Property Damage">Property Damage (TPPD)</option>
              <option value="Hit-and-Run">Hit-and-Run</option>
              <option value="Multiple Loss Types">Multiple Loss Types</option>
            </select>

            <!-- Priority Filter -->
            <select [(ngModel)]="selectedPriority" class="toolbar-select">
              <option value="ALL">All Priorities</option>
              <option value="Urgent">Urgent</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <!-- Handler Filter -->
            <select [(ngModel)]="selectedHandler" class="toolbar-select">
              <option value="ALL">All Handlers</option>
              <option value="Ananya Raman">Ananya Raman</option>
              <option value="Rajesh Menon">Rajesh Menon</option>
              <option value="Priya Deshmukh">Priya Deshmukh</option>
              <option value="Vikram Sethi">Vikram Sethi</option>
            </select>
          </div>
        </div>

        <!-- Filter Count Strip -->
        <div class="filter-meta-bar">
          <div class="count-text">
            Showing <strong>{{ filteredClaims.length }}</strong> of <strong>{{ mockData.claims().length }}</strong> intimation records
          </div>
          <button *ngIf="isFiltered" (click)="resetFilters()" class="reset-filter-btn">
            <app-icon name="x" [size]="12"></app-icon>
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      <!-- Intimations Data Table -->
      <div class="csp-table-wrapper">
        <table class="csp-table">
          <thead>
            <tr>
              <th (click)="sort('intimationRef')" class="sortable-th">
                Intimation Ref
                <app-icon name="chevron-down" [size]="12" *ngIf="sortField === 'intimationRef'"></app-icon>
              </th>
              <th (click)="sort('dateReported')" class="sortable-th">
                Date Reported
                <app-icon name="chevron-down" [size]="12" *ngIf="sortField === 'dateReported'"></app-icon>
              </th>
              <th>Claimant & Contact</th>
              <th>Loss Type</th>
              <th>Accident Location</th>
              <th>Insured Vehicle</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Handler</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of filteredClaims" (click)="viewClaim(item)" class="interactive-row">
              <td>
                <div class="ref-link-text">{{ item.intimationRef }}</div>
                <div class="claim-badge-sm" *ngIf="item.id">{{ item.id }}</div>
                <div class="claim-badge-sm unreg" *ngIf="!item.id">Unregistered</div>
              </td>
              <td>
                <div class="date-text">{{ item.dateReported }}</div>
                <div class="sub-date">Accident: {{ item.accidentDate }}</div>
              </td>
              <td>
                <div class="claimant-name-cell">{{ item.claimantName }}</div>
                <div class="claimant-phone-cell">{{ item.claimantPhone }}</div>
              </td>
              <td>
                <span class="loss-tag">{{ item.lossType }}</span>
              </td>
              <td>
                <div class="location-cell">{{ item.accidentCity }}</div>
                <div class="sub-location">{{ item.accidentLocation }}</div>
              </td>
              <td>
                <div class="vehicle-no-cell font-mono">{{ item.insuredVehicleNumber }}</div>
                <div class="sub-vehicle">{{ item.vehicleMakeModel }}</div>
              </td>
              <td>
                <app-priority-badge [priority]="item.priority"></app-priority-badge>
              </td>
              <td>
                <app-status-badge [status]="item.status"></app-status-badge>
              </td>
              <td>
                <span class="handler-name">{{ item.assignedHandler }}</span>
              </td>
              <td style="text-align: right;" (click)="$event.stopPropagation()">
                <div class="action-buttons-group">
                  <!-- If not yet registered with TP claim ID -->
                  <a 
                    *ngIf="!item.id" 
                    [routerLink]="['/ops/claim-registration']" 
                    [queryParams]="{ ref: item.intimationRef }"
                    class="csp-btn csp-btn-primary csp-btn-sm"
                    title="Register as official TP claim"
                  >
                    <span>Register</span>
                  </a>

                  <!-- If already registered -->
                  <a 
                    *ngIf="item.id" 
                    [routerLink]="['/ops/claim-360', item.id]" 
                    class="csp-btn csp-btn-secondary csp-btn-sm"
                    title="Open Claim 360 Workspace"
                  >
                    <span>Claim 360</span>
                    <app-icon name="arrow-right" [size]="12"></app-icon>
                  </a>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .intimations-page { display: flex; flex-direction: column; gap: 1.5rem; }

    .page-top-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .filter-toolbar-card { padding: 1.25rem 1.5rem; }
    .toolbar-row {
      display: flex;
      gap: 1rem;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
    }

    .search-field-box {
      flex: 1;
      min-width: 280px;
      position: relative;
    }
    .search-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); }
    .toolbar-search-input {
      width: 100%;
      padding: 0.55rem 0.85rem 0.55rem 2.4rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      font-size: 0.88rem;
      outline: none;
    }
    .toolbar-search-input:focus { border-color: var(--csp-ember); }

    .filter-controls-group { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .toolbar-select {
      padding: 0.55rem 0.85rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--csp-charcoal);
      background: var(--csp-white);
      outline: none;
      cursor: pointer;
    }

    .filter-meta-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.85rem;
      padding-top: 0.85rem;
      border-top: 1px solid var(--csp-border);
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
    }

    .reset-filter-btn {
      background: none;
      border: none;
      color: var(--csp-ember);
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .sortable-th { cursor: pointer; user-select: none; }
    .sortable-th:hover { color: var(--csp-charcoal); }

    .interactive-row { cursor: pointer; }
    .interactive-row:hover { background-color: rgba(247, 241, 232, 0.5) !important; }

    .ref-link-text { font-weight: 700; color: var(--csp-charcoal); font-size: 0.9rem; }
    .claim-badge-sm {
      display: inline-block;
      font-size: 0.7rem;
      font-weight: 700;
      color: var(--csp-sage);
      background: var(--csp-sage-subtle);
      padding: 1px 6px;
      border-radius: 4px;
      margin-top: 2px;
    }
    .claim-badge-sm.unreg {
      color: var(--csp-terracotta);
      background: var(--csp-terracotta-subtle);
    }

    .date-text { font-weight: 600; color: var(--csp-charcoal); font-size: 0.85rem; }
    .sub-date { font-size: 0.74rem; color: var(--csp-warm-grey); }

    .claimant-name-cell { font-weight: 600; color: var(--csp-charcoal); }
    .claimant-phone-cell { font-size: 0.76rem; color: var(--csp-warm-grey); }

    .loss-tag { font-size: 0.82rem; color: var(--csp-charcoal); }
    .location-cell { font-weight: 600; color: var(--csp-charcoal); font-size: 0.85rem; }
    .sub-location { font-size: 0.75rem; color: var(--csp-warm-grey); max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    .vehicle-no-cell { font-size: 0.88rem; font-weight: 700; color: var(--csp-charcoal); }
    .sub-vehicle { font-size: 0.74rem; color: var(--csp-warm-grey); }
    .handler-name { font-size: 0.85rem; font-weight: 600; color: var(--csp-charcoal); }

    .action-buttons-group { display: flex; justify-content: flex-end; gap: 0.4rem; }
  `]
})
export class IntimationsComponent implements OnInit {
  mockData = inject(MockDataService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  searchTerm = '';
  selectedLossType = 'ALL';
  selectedPriority = 'ALL';
  selectedHandler = 'ALL';

  sortField = 'dateReported';
  sortAsc = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchTerm = params['q'];
      }
    });
  }

  get isFiltered(): boolean {
    return !!this.searchTerm || this.selectedLossType !== 'ALL' || this.selectedPriority !== 'ALL' || this.selectedHandler !== 'ALL';
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedLossType = 'ALL';
    this.selectedPriority = 'ALL';
    this.selectedHandler = 'ALL';
  }

  sort(field: string) {
    if (this.sortField === field) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortField = field;
      this.sortAsc = true;
    }
  }

  get filteredClaims(): ClaimRecord[] {
    let list = this.mockData.claims();

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase().trim();
      list = list.filter(c => 
        (c.intimationRef && c.intimationRef.toLowerCase().includes(q)) ||
        (c.id && c.id.toLowerCase().includes(q)) ||
        c.claimantName.toLowerCase().includes(q) ||
        c.insuredVehicleNumber.toLowerCase().includes(q) ||
        c.accidentCity.toLowerCase().includes(q)
      );
    }

    if (this.selectedLossType !== 'ALL') {
      list = list.filter(c => c.lossType === this.selectedLossType);
    }

    if (this.selectedPriority !== 'ALL') {
      list = list.filter(c => c.priority === this.selectedPriority);
    }

    if (this.selectedHandler !== 'ALL') {
      list = list.filter(c => c.assignedHandler === this.selectedHandler);
    }

    // Sort
    return [...list].sort((a: any, b: any) => {
      const valA = a[this.sortField] || '';
      const valB = b[this.sortField] || '';
      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });
  }

  viewClaim(claim: ClaimRecord) {
    this.router.navigate(['/ops/claim-360', claim.id || claim.intimationRef]);
  }
}
