import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';
import { MockDataService } from '../../core/services/mock-data.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, StatusBadgeComponent, PriorityBadgeComponent],
  template: `
    <div class="dashboard-page">
      <!-- Welcome Header -->
      <div class="dash-header">
        <div>
          <div class="dash-subtitle">Enterprise Motor Claims Operations Center</div>
          <h1 class="dash-title">Claims Executive Dashboard</h1>
        </div>
        <div class="dash-header-actions">
          <a routerLink="/ops/claim-registration" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Register Intimation</span>
          </a>
          <a routerLink="/ops/reports-analytics" class="csp-btn csp-btn-secondary">
            <app-icon name="bar-chart" [size]="16"></app-icon>
            <span>Full Analytics</span>
          </a>
        </div>
      </div>

      <!-- 8 Key Metrics Grid -->
      <div class="metrics-grid">
        <div class="csp-stat-card" routerLink="/ops/work-queue">
          <div class="csp-stat-header">
            <span class="csp-stat-title">Total Open Claims</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-charcoal)">
              <app-icon name="clipboard-list" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value">{{ mockData.openClaimsCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-sage)">Active in operations</div>
        </div>

        <div class="csp-stat-card" routerLink="/ops/intimations">
          <div class="csp-stat-header">
            <span class="csp-stat-title">New Intimations</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-ember)">
              <app-icon name="file-text" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value" style="color:var(--csp-ember)">{{ mockData.newIntimationsCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-ember)">Pending registration</div>
        </div>

        <div class="csp-stat-card" routerLink="/ops/document-verification">
          <div class="csp-stat-header">
            <span class="csp-stat-title">Awaiting Docs</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-terracotta)">
              <app-icon name="upload" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value">{{ mockData.awaitingDocsCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-warm-grey)">Action on claimant</div>
        </div>

        <div class="csp-stat-card" routerLink="/ops/investigation">
          <div class="csp-stat-header">
            <span class="csp-stat-title">Investigations</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-ember)">
              <app-icon name="search" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value">{{ mockData.investigationsCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-warm-grey)">Fieldwork & spot checks</div>
        </div>

        <div class="csp-stat-card" routerLink="/ops/legal-mact">
          <div class="csp-stat-header">
            <span class="csp-stat-title">Legal / MACT</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-terracotta)">
              <app-icon name="scale" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value">{{ mockData.legalReviewsCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-terracotta)">Tribunals & WS motions</div>
        </div>

        <div class="csp-stat-card" routerLink="/ops/approvals">
          <div class="csp-stat-header">
            <span class="csp-stat-title">Awaiting Approvals</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-ember)">
              <app-icon name="check-circle" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value">{{ mockData.pendingApprovalsCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-ember)">Mandate authorization</div>
        </div>

        <div class="csp-stat-card" routerLink="/ops/settlement-processing">
          <div class="csp-stat-header">
            <span class="csp-stat-title">Settlements In Progress</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-sage)">
              <app-icon name="credit-card" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value">{{ mockData.settlementsInProgressCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-sage)">Direct NEFT pipeline</div>
        </div>

        <div class="csp-stat-card" routerLink="/ops/claim-closure">
          <div class="csp-stat-header">
            <span class="csp-stat-title">Closed This Month</span>
            <div class="csp-stat-icon-wrap" style="color:var(--csp-charcoal)">
              <app-icon name="lock" [size]="18"></app-icon>
            </div>
          </div>
          <div class="csp-stat-value">{{ mockData.closedThisMonthCount() }}</div>
          <div class="csp-stat-change" style="color:var(--csp-sage)">Vouchers reconciled</div>
        </div>
      </div>

      <!-- Charts Section: Strict non-blue warm palette -->
      <div class="charts-row">
        <!-- Chart 1: Claims by Stage -->
        <div class="csp-card chart-card">
          <div class="csp-card-header">
            <div>
              <h3 class="chart-title">Claims by Operational Stage</h3>
              <div class="chart-sub">Active distribution across processing workflow</div>
            </div>
            <span class="csp-badge csp-badge-charcoal">Real-time</span>
          </div>
          <div class="csp-card-body chart-body">
            <div class="bar-chart-container">
              <div *ngFor="let item of stageDistribution" class="bar-row">
                <div class="bar-label-col">
                  <span class="stage-name">{{ item.stage }}</span>
                  <span class="stage-count font-bold">{{ item.count }}</span>
                </div>
                <div class="bar-track">
                  <div 
                    class="bar-fill" 
                    [style.width.%]="(item.count / maxStageCount) * 100"
                    [style.background-color]="item.color"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Chart 2: Monthly Intake Trend -->
        <div class="csp-card chart-card">
          <div class="csp-card-header">
            <div>
              <h3 class="chart-title">Intake & Resolution Volume</h3>
              <div class="chart-sub">Six-month comparison (New vs Settled)</div>
            </div>
            <span class="csp-badge csp-badge-sage">FY 2025-26</span>
          </div>
          <div class="csp-card-body chart-body">
            <div class="intake-trend-visual">
              <div *ngFor="let m of monthlyData" class="month-column">
                <div class="bars-pair">
                  <!-- Intake Bar (Ember) -->
                  <div class="v-bar ember-bar" [style.height.px]="m.intake * 3.2" [title]="'Intake: ' + m.intake">
                    <span class="v-bar-val">{{ m.intake }}</span>
                  </div>
                  <!-- Settled Bar (Sage) -->
                  <div class="v-bar sage-bar" [style.height.px]="m.settled * 3.2" [title]="'Settled: ' + m.settled">
                    <span class="v-bar-val">{{ m.settled }}</span>
                  </div>
                </div>
                <div class="month-label">{{ m.month }}</div>
              </div>
            </div>

            <!-- Legend -->
            <div class="chart-legend">
              <div class="legend-item">
                <span class="legend-swatch" style="background:var(--csp-ember)"></span>
                <span>New Intimations Intake</span>
              </div>
              <div class="legend-item">
                <span class="legend-swatch" style="background:var(--csp-sage)"></span>
                <span>Claims Settled & Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Priority Work Queue & Tasks Row -->
      <div class="content-split-row">
        <!-- Priority Work Queue Table -->
        <div class="csp-card queue-card">
          <div class="csp-card-header">
            <div style="display:flex; align-items:center; gap:0.6rem;">
              <h3 class="card-head-title">Priority Claims Queue</h3>
              <span class="csp-badge csp-badge-ember">Needs Attention</span>
            </div>
            <a routerLink="/ops/work-queue" class="text-link">View Full Queue</a>
          </div>
          <div class="csp-card-body" style="padding:0;">
            <div class="table-scroll-container">
              <table class="csp-table">
                <thead>
                  <tr>
                    <th>Claim / Ref</th>
                    <th>Claimant & Vehicle</th>
                    <th>Loss Type</th>
                    <th>Priority</th>
                    <th>Stage & Status</th>
                    <th>Handler</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let claim of priorityClaims" (click)="openClaim(claim)" class="clickable-row">
                    <td>
                      <div class="ref-lead">{{ claim.id || claim.intimationRef }}</div>
                      <div class="ref-sub" *ngIf="claim.id">{{ claim.intimationRef }}</div>
                    </td>
                    <td>
                      <div style="font-weight: 600; color: var(--csp-charcoal);">{{ claim.claimantName }}</div>
                      <div style="font-size: 0.78rem; font-family: monospace; color: var(--csp-warm-grey);">
                        {{ claim.insuredVehicleNumber }}
                      </div>
                    </td>
                    <td>
                      <span style="font-size: 0.85rem;">{{ claim.lossType }}</span>
                    </td>
                    <td>
                      <app-priority-badge [priority]="claim.priority"></app-priority-badge>
                    </td>
                    <td>
                      <app-status-badge [status]="claim.status"></app-status-badge>
                    </td>
                    <td>
                      <span style="font-size: 0.85rem; font-weight: 600;">{{ claim.assignedHandler }}</span>
                    </td>
                    <td>
                      <button (click)="openClaim(claim); $event.stopPropagation()" class="csp-btn csp-btn-secondary csp-btn-sm">
                        <span>Workspace</span>
                        <app-icon name="arrow-right" [size]="12"></app-icon>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Right Side: Upcoming Tasks & Activity Log -->
        <div class="sidebar-tasks-col">
          <!-- Upcoming Tasks -->
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Upcoming Deadlines</h4>
              <a routerLink="/ops/tasks-reminders" class="text-link">All Tasks</a>
            </div>
            <div class="csp-card-body" style="padding:1rem;">
              <div *ngFor="let task of mockData.tasks().slice(0, 4)" class="task-row">
                <input 
                  type="checkbox" 
                  [checked]="task.status === 'Completed'" 
                  (change)="mockData.toggleTaskStatus(task.id)"
                  class="task-check"
                />
                <div class="task-info">
                  <div class="task-title" [class.done]="task.status === 'Completed'">{{ task.title }}</div>
                  <div class="task-meta">
                    <span>Due: {{ task.dueDate }}</span>
                    <span class="meta-dot">•</span>
                    <span>{{ task.assignedUser }}</span>
                  </div>
                </div>
                <app-priority-badge [priority]="task.priority"></app-priority-badge>
              </div>
            </div>
          </div>

          <!-- Loss Type Distribution Mini Card -->
          <div class="csp-card">
            <div class="csp-card-header">
              <h4 style="margin:0; font-size:1rem; font-weight:700;">Intake by Loss Type</h4>
            </div>
            <div class="csp-card-body" style="padding:1.25rem;">
              <div class="loss-dist-list">
                <div class="loss-dist-item">
                  <div class="dist-header">
                    <span>Bodily Injury Claims</span>
                    <strong>52% (38 claims)</strong>
                  </div>
                  <div class="dist-track"><div class="dist-fill" style="width:52%; background:var(--csp-ember);"></div></div>
                </div>

                <div class="loss-dist-item">
                  <div class="dist-header">
                    <span>Fatal Casualties (Sec 166)</span>
                    <strong>24% (18 claims)</strong>
                  </div>
                  <div class="dist-track"><div class="dist-fill" style="width:24%; background:var(--csp-terracotta);"></div></div>
                </div>

                <div class="loss-dist-item">
                  <div class="dist-header">
                    <span>Third-Party Property (TPPD)</span>
                    <strong>16% (12 claims)</strong>
                  </div>
                  <div class="dist-track"><div class="dist-fill" style="width:16%; background:var(--csp-clay-dark);"></div></div>
                </div>

                <div class="loss-dist-item">
                  <div class="dist-header">
                    <span>Hit-and-Run Unidentified</span>
                    <strong>8% (6 claims)</strong>
                  </div>
                  <div class="dist-track"><div class="dist-fill" style="width:8%; background:var(--csp-charcoal);"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard-page { display: flex; flex-direction: column; gap: 1.5rem; }

    .dash-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .dash-subtitle {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--csp-ember);
      margin-bottom: 0.2rem;
    }

    .dash-title {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }

    .dash-header-actions { display: flex; gap: 0.75rem; }

    /* Metrics Grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.25rem;
    }

    .csp-stat-card { cursor: pointer; }

    /* Charts */
    .charts-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .chart-card { display: flex; flex-direction: column; }
    .chart-title { font-size: 1.05rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }
    .chart-sub { font-size: 0.78rem; color: var(--csp-warm-grey); margin-top: 2px; }
    .chart-body { flex: 1; display: flex; flex-direction: column; justify-content: center; }

    /* Bar chart */
    .bar-chart-container { display: flex; flex-direction: column; gap: 0.75rem; }
    .bar-row { display: flex; flex-direction: column; gap: 0.25rem; }
    .bar-label-col { display: flex; justify-content: space-between; font-size: 0.82rem; }
    .stage-name { color: var(--csp-charcoal); font-weight: 600; }
    .stage-count { color: var(--csp-warm-grey); }
    .bar-track { width: 100%; height: 10px; background: var(--csp-ivory); border-radius: var(--csp-radius-pill); overflow: hidden; }
    .bar-fill { height: 100%; border-radius: var(--csp-radius-pill); transition: width 0.6s ease; }

    /* Trend visual */
    .intake-trend-visual {
      display: flex;
      justify-content: space-around;
      align-items: flex-end;
      height: 180px;
      padding-top: 20px;
      border-bottom: 2px solid var(--csp-border);
      margin-bottom: 1rem;
    }

    .month-column { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .bars-pair { display: flex; align-items: flex-end; gap: 4px; }
    .v-bar {
      width: 18px;
      border-radius: 4px 4px 0 0;
      position: relative;
      transition: height 0.4s ease;
      cursor: pointer;
    }
    .ember-bar { background: var(--csp-ember); }
    .sage-bar { background: var(--csp-sage); }
    .v-bar-val { display: none; }
    .v-bar:hover { opacity: 0.85; }
    .month-label { font-size: 0.75rem; font-weight: 600; color: var(--csp-warm-grey); }

    .chart-legend { display: flex; justify-content: center; gap: 1.5rem; font-size: 0.8rem; color: var(--csp-charcoal); }
    .legend-item { display: flex; align-items: center; gap: 0.4rem; }
    .legend-swatch { width: 12px; height: 12px; border-radius: 3px; }

    /* Split row */
    .content-split-row {
      display: grid;
      grid-template-columns: 1.5fr 0.9fr;
      gap: 1.5rem;
    }

    .card-head-title { font-size: 1.05rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }
    .text-link { font-size: 0.82rem; font-weight: 700; color: var(--csp-ember); }

    .clickable-row { cursor: pointer; }
    .clickable-row:hover { background-color: rgba(247, 241, 232, 0.6) !important; }
    .ref-lead { font-weight: 700; color: var(--csp-charcoal); }
    .ref-sub { font-size: 0.76rem; color: var(--csp-warm-grey); }

    .table-scroll-container { overflow-x: auto; }

    .sidebar-tasks-col { display: flex; flex-direction: column; gap: 1.5rem; }

    .task-row {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.6rem 0;
      border-bottom: 1px solid var(--csp-bg-soft);
    }
    .task-row:last-child { border-bottom: none; }
    .task-check { accent-color: var(--csp-ember); width: 16px; height: 16px; cursor: pointer; }
    .task-info { flex: 1; }
    .task-title { font-size: 0.85rem; font-weight: 600; color: var(--csp-charcoal); }
    .task-title.done { text-decoration: line-through; opacity: 0.6; }
    .task-meta { font-size: 0.75rem; color: var(--csp-warm-grey); display: flex; gap: 0.35rem; }

    .loss-dist-list { display: flex; flex-direction: column; gap: 0.85rem; }
    .dist-header { display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 0.25rem; }
    .dist-header span { color: var(--csp-charcoal); font-weight: 600; }
    .dist-track { width: 100%; height: 8px; background: var(--csp-ivory); border-radius: var(--csp-radius-pill); overflow: hidden; }
    .dist-fill { height: 100%; border-radius: var(--csp-radius-pill); }

    @media (max-width: 1200px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .charts-row { grid-template-columns: 1fr; }
      .content-split-row { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent {
  mockData = inject(MockDataService);
  private router = inject(Router);

  maxStageCount = 10;

  stageDistribution = [
    { stage: 'New Intimations Intake', count: 3, color: '#E85D32' },
    { stage: 'Document Verification', count: 4, color: '#C56A4A' },
    { stage: 'Site & Police Investigation', count: 2, color: '#252321' },
    { stage: 'Legal / MACT Proceedings', count: 2, color: '#756D65' },
    { stage: 'Liability Assessment', count: 3, color: '#F0D8CA' },
    { stage: 'Approvals & Mandate', count: 2, color: '#C56A4A' },
    { stage: 'Settlement & Disbursement', count: 2, color: '#55745F' }
  ];

  monthlyData = [
    { month: 'Oct 25', intake: 24, settled: 19 },
    { month: 'Nov 25', intake: 31, settled: 26 },
    { month: 'Dec 25', intake: 28, settled: 25 },
    { month: 'Jan 26', intake: 36, settled: 30 },
    { month: 'Feb 26', intake: 42, settled: 38 },
    { month: 'Mar 26', intake: 48, settled: 39 }
  ];

  get priorityClaims() {
    return this.mockData.claims().slice(0, 6);
  }

  openClaim(claim: any) {
    this.router.navigate(['/ops/claim-360', claim.id || claim.intimationRef]);
  }
}
