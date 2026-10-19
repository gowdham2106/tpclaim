import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-reports-analytics',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="breadcrumb-trail">
            <a routerLink="/ops/dashboard">Operations</a>
            <span class="sep">/</span>
            <span class="current">Reports & Analytics</span>
          </div>
          <h1 class="page-title">Claims Operations & Actuarial Analytics</h1>
          <p class="page-subtitle">Executive intelligence on intake velocity, stage bottlenecks, loss severity, tribunal caseload, and handler TAT.</p>
        </div>
        <div class="header-actions">
          <button (click)="exportReport()" class="csp-btn csp-btn-outline">
            <app-icon name="download" [size]="15"></app-icon>
            Export CSV Dataset
          </button>
          <button (click)="refreshMetrics()" class="csp-btn csp-btn-primary">
            <app-icon name="refresh-cw" [size]="15"></app-icon>
            Recalculate Metrics
          </button>
        </div>
      </div>

      <!-- Filter Controls Bar -->
      <div class="csp-card analytics-filter-card">
        <div class="filter-col">
          <label class="filter-lbl">Reporting Period:</label>
          <select [(ngModel)]="selectedPeriod" class="csp-select">
            <option value="30">Last 30 Days (Current Month)</option>
            <option value="90">Current Quarter (Q3 2026)</option>
            <option value="180">Last 6 Months</option>
            <option value="365">Full Year (FY 2025-26)</option>
          </select>
        </div>

        <div class="filter-col">
          <label class="filter-lbl">Loss Category:</label>
          <select [(ngModel)]="selectedLossType" class="csp-select">
            <option value="All">All Loss Classifications</option>
            <option value="Bodily Injury">Bodily Injury</option>
            <option value="Fatal Accident">Fatal Accident</option>
            <option value="Third-Party Property Damage">Third-Party Property Damage</option>
          </select>
        </div>

        <div class="filter-col">
          <label class="filter-lbl">Assigned Handler:</label>
          <select [(ngModel)]="selectedHandler" class="csp-select">
            <option value="All">All Operations Handlers</option>
            <option *ngFor="let u of mockData.users()" [value]="u.name">{{ u.name }} ({{ u.role }})</option>
          </select>
        </div>

        <div class="filter-col" style="justify-content: flex-end;">
          <span class="data-as-of">
            <app-icon name="clock" [size]="12"></app-icon>
            Live synced to local frontend state
          </span>
        </div>
      </div>

      <!-- Executive KPI Cards -->
      <div class="kpi-grid">
        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">Active Claim Portfolio</span>
            <span class="kpi-badge ember">+12.4% vs last mo</span>
          </div>
          <div class="kpi-value">{{ mockData.openClaimsCount() }}</div>
          <div class="kpi-subtext">Across 8 workflow stages in active adjudication</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">Settlement Outflow (YTD)</span>
            <span class="kpi-badge sage">100% Verified</span>
          </div>
          <div class="kpi-value">₹{{ formattedSettlementTotal() }}</div>
          <div class="kpi-subtext">Disbursed across {{ mockData.payments().length }} NEFT / RTGS transactions</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">Average Processing TAT</span>
            <span class="kpi-badge charcoal">Target: 45 Days</span>
          </div>
          <div class="kpi-value">38.2 <span class="unit">Days</span></div>
          <div class="kpi-subtext">Intimation to final payout execution</div>
        </div>

        <div class="kpi-card">
          <div class="kpi-top">
            <span class="kpi-title">MACT Tribunal Rate</span>
            <span class="kpi-badge terracotta">Litigated</span>
          </div>
          <div class="kpi-value">{{ tribunalRate() }}%</div>
          <div class="kpi-subtext">{{ mockData.legalCases().length }} claims in active court / tribunal dockets</div>
        </div>
      </div>

      <!-- Analytics Charts Section -->
      <div class="charts-row">
        <!-- Monthly Intake vs Resolution (SVG Bar Chart) -->
        <div class="csp-card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Intake Volume vs Closed Claims (6-Month Trend)</h3>
              <p class="chart-subtitle">Monthly registration pace compared against executed claim closures</p>
            </div>
            <div class="chart-legend">
              <span class="legend-item"><span class="legend-dot intake"></span> New Intake</span>
              <span class="legend-item"><span class="legend-dot settled"></span> Settled / Closed</span>
            </div>
          </div>

          <div class="chart-body svg-chart-container">
            <svg viewBox="0 0 540 220" class="svg-bar-chart">
              <!-- Grid Lines -->
              <line x1="40" y1="30" x2="520" y2="30" stroke="var(--csp-border)" stroke-dasharray="3,3" />
              <line x1="40" y1="80" x2="520" y2="80" stroke="var(--csp-border)" stroke-dasharray="3,3" />
              <line x1="40" y1="130" x2="520" y2="130" stroke="var(--csp-border)" stroke-dasharray="3,3" />
              <line x1="40" y1="180" x2="520" y2="180" stroke="var(--csp-border)" />

              <!-- Y-Axis Labels -->
              <text x="30" y="35" text-anchor="end" class="chart-axis-text">60</text>
              <text x="30" y="85" text-anchor="end" class="chart-axis-text">40</text>
              <text x="30" y="135" text-anchor="end" class="chart-axis-text">20</text>
              <text x="30" y="185" text-anchor="end" class="chart-axis-text">0</text>

              <!-- Bars (May) -->
              <rect x="70" y="70" width="22" height="110" rx="3" fill="#E85D32" />
              <rect x="96" y="100" width="22" height="80" rx="3" fill="#55745F" />
              <text x="94" y="200" text-anchor="middle" class="chart-axis-text">May</text>

              <!-- Bars (Jun) -->
              <rect x="150" y="55" width="22" height="125" rx="3" fill="#E85D32" />
              <rect x="176" y="90" width="22" height="90" rx="3" fill="#55745F" />
              <text x="174" y="200" text-anchor="middle" class="chart-axis-text">Jun</text>

              <!-- Bars (Jul) -->
              <rect x="230" y="60" width="22" height="120" rx="3" fill="#E85D32" />
              <rect x="256" y="75" width="22" height="105" rx="3" fill="#55745F" />
              <text x="254" y="200" text-anchor="middle" class="chart-axis-text">Jul</text>

              <!-- Bars (Aug) -->
              <rect x="310" y="45" width="22" height="135" rx="3" fill="#E85D32" />
              <rect x="336" y="80" width="22" height="100" rx="3" fill="#55745F" />
              <text x="334" y="200" text-anchor="middle" class="chart-axis-text">Aug</text>

              <!-- Bars (Sep) -->
              <rect x="390" y="40" width="22" height="140" rx="3" fill="#E85D32" />
              <rect x="416" y="65" width="22" height="115" rx="3" fill="#55745F" />
              <text x="414" y="200" text-anchor="middle" class="chart-axis-text">Sep</text>

              <!-- Bars (Oct - Live) -->
              <rect x="470" y="50" width="22" height="130" rx="3" fill="#E85D32" />
              <rect x="496" y="95" width="22" height="85" rx="3" fill="#55745F" />
              <text x="494" y="200" text-anchor="middle" class="chart-axis-text font-bold">Oct (Live)</text>
            </svg>
          </div>
        </div>

        <!-- Claims by Workflow Stage (SVG Donut Chart) -->
        <div class="csp-card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Claims Distribution by Stage</h3>
              <p class="chart-subtitle">Real-time status allocation of all active claims</p>
            </div>
          </div>

          <div class="donut-wrap">
            <svg viewBox="0 0 200 200" class="donut-svg">
              <!-- SVG Donut Segments (circumference ~ 440) -->
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#E5DDD3" stroke-width="26" />
              <!-- Verification (25% = 110) -->
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#E85D32" stroke-width="26" 
                      stroke-dasharray="110 330" stroke-dashoffset="0" />
              <!-- Investigation (22% = 96) -->
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#C56A4A" stroke-width="26" 
                      stroke-dasharray="96 344" stroke-dashoffset="-110" />
              <!-- Legal / MACT (18% = 79) -->
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#252321" stroke-width="26" 
                      stroke-dasharray="79 361" stroke-dashoffset="-206" />
              <!-- Assessment & Approvals (20% = 88) -->
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#55745F" stroke-width="26" 
                      stroke-dasharray="88 352" stroke-dashoffset="-285" />
              <!-- Settlement (15% = 66) -->
              <circle cx="100" cy="100" r="70" fill="transparent" stroke="#756D65" stroke-width="26" 
                      stroke-dasharray="66 374" stroke-dashoffset="-373" />
              
              <!-- Center Text -->
              <text x="100" y="96" text-anchor="middle" font-weight="800" font-size="20" fill="#252321">
                {{ mockData.claims().length }}
              </text>
              <text x="100" y="114" text-anchor="middle" font-size="10" fill="#756D65">
                Total Claims
              </text>
            </svg>

            <div class="stage-legend-list">
              <div class="s-legend-item">
                <span class="s-dot" style="background: #E85D32;"></span>
                <span class="s-name">Doc Verification</span>
                <span class="s-count">{{ mockData.awaitingDocsCount() + 1 }}</span>
              </div>
              <div class="s-legend-item">
                <span class="s-dot" style="background: #C56A4A;"></span>
                <span class="s-name">Investigation</span>
                <span class="s-count">{{ mockData.investigationsCount() }}</span>
              </div>
              <div class="s-legend-item">
                <span class="s-dot" style="background: #252321;"></span>
                <span class="s-name">Legal / MACT</span>
                <span class="s-count">{{ mockData.legalReviewsCount() }}</span>
              </div>
              <div class="s-legend-item">
                <span class="s-dot" style="background: #55745F;"></span>
                <span class="s-name">Assessment / Approval</span>
                <span class="s-count">{{ mockData.pendingApprovalsCount() + 1 }}</span>
              </div>
              <div class="s-legend-item">
                <span class="s-dot" style="background: #756D65;"></span>
                <span class="s-name">Settlement & Closed</span>
                <span class="s-count">{{ mockData.settlementsInProgressCount() + mockData.closedThisMonthCount() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Second Charts Row: Loss Type Severity & Handler Workload -->
      <div class="charts-row">
        <!-- Loss Types Breakdown -->
        <div class="csp-card chart-card">
          <div class="chart-header">
            <div>
              <h3 class="chart-title">Loss Classification Severity</h3>
              <p class="chart-subtitle">Distribution of loss types and average claimed quantum</p>
            </div>
          </div>

          <div class="loss-bars">
            <div class="loss-bar-group">
              <div class="l-bar-meta">
                <span class="l-title">Bodily Injury (Temporary & Permanent)</span>
                <span class="l-val">58% (Avg ₹3.8L)</span>
              </div>
              <div class="l-track">
                <div class="l-fill ember" style="width: 58%;"></div>
              </div>
            </div>

            <div class="loss-bar-group">
              <div class="l-bar-meta">
                <span class="l-title">Fatal Accident (Dependency Claims)</span>
                <span class="l-val">24% (Avg ₹18.5L)</span>
              </div>
              <div class="l-track">
                <div class="l-fill terracotta" style="width: 24%;"></div>
              </div>
            </div>

            <div class="loss-bar-group">
              <div class="l-bar-meta">
                <span class="l-title">Third-Party Property Damage (TPPD)</span>
                <span class="l-val">15% (Avg ₹1.2L)</span>
              </div>
              <div class="l-track">
                <div class="l-fill sage" style="width: 15%;"></div>
              </div>
            </div>

            <div class="loss-bar-group">
              <div class="l-bar-meta">
                <span class="l-title">Hit & Run / Solatium Scheme</span>
                <span class="l-val">3% (Fixed statutory)</span>
              </div>
              <div class="l-track">
                <div class="l-fill charcoal" style="width: 3%;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Handler Caseload Table -->
        <div class="csp-card chart-card" style="padding: 0; overflow: hidden;">
          <div class="chart-header" style="padding: 1.25rem 1.25rem 0.75rem 1.25rem;">
            <div>
              <h3 class="chart-title">Handler Workload & TAT Performance</h3>
              <p class="chart-subtitle">Caseload allocation and operational closure efficiency</p>
            </div>
          </div>

          <table class="csp-table" style="margin-top: 0.5rem;">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Role</th>
                <th>Open Cases</th>
                <th>Avg TAT</th>
                <th>Efficiency</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let u of mockData.users().slice(0, 5)">
                <td>
                  <div class="user-cell">
                    <span class="u-avatar">{{ u.avatarInitials }}</span>
                    <strong>{{ u.name }}</strong>
                  </div>
                </td>
                <td style="font-size: 0.8rem; color: var(--csp-warm-grey-dark);">{{ u.role }}</td>
                <td>
                  <span class="cases-count-badge">{{ u.assignedWorkload }}</span>
                </td>
                <td style="font-size: 0.82rem; font-weight: 600;">{{ getHandlerTat(u.role) }} days</td>
                <td>
                  <div class="mini-bar">
                    <div class="mini-fill" [style.width.%]="getEfficiency(u.assignedWorkload)"></div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1400px;
      margin: 0 auto;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
    }
    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      color: var(--csp-warm-grey);
      margin-bottom: 0.35rem;
    }
    .breadcrumb-trail a {
      color: var(--csp-warm-grey);
      text-decoration: none;
    }
    .breadcrumb-trail a:hover {
      color: var(--csp-ember);
    }
    .breadcrumb-trail .current {
      color: var(--csp-charcoal);
      font-weight: 600;
    }
    .page-title {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0 0 0.25rem 0;
    }
    .page-subtitle {
      color: var(--csp-warm-grey);
      font-size: 0.9rem;
      margin: 0;
    }

    /* Filter Controls */
    .analytics-filter-card {
      display: flex;
      flex-wrap: wrap;
      gap: 1.25rem;
      align-items: center;
      padding: 1rem 1.25rem;
      margin-bottom: 1.5rem;
      background: var(--csp-white);
    }
    .filter-col {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }
    .filter-lbl {
      white-space: nowrap;
    }
    .data-as-of {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    /* KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .kpi-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      box-shadow: var(--csp-shadow-sm);
    }
    .kpi-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }
    .kpi-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--csp-warm-grey-dark);
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .kpi-badge {
      font-size: 0.7rem;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
    }
    .kpi-badge.ember { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .kpi-badge.sage { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .kpi-badge.charcoal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }
    .kpi-badge.terracotta { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }

    .kpi-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin-bottom: 0.25rem;
    }
    .kpi-value .unit {
      font-size: 1rem;
      font-weight: 600;
      color: var(--csp-warm-grey);
    }
    .kpi-subtext {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
    }

    /* Charts Row */
    .charts-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(460px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }
    .chart-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      box-shadow: var(--csp-shadow-sm);
    }
    .chart-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    .chart-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .chart-subtitle {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      margin: 0.2rem 0 0 0;
    }
    .chart-legend {
      display: flex;
      gap: 0.75rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .legend-dot {
      width: 10px;
      height: 10px;
      border-radius: 2px;
    }
    .legend-dot.intake { background: #E85D32; }
    .legend-dot.settled { background: #55745F; }

    /* SVG Chart */
    .svg-chart-container {
      width: 100%;
      height: 220px;
    }
    .svg-bar-chart {
      width: 100%;
      height: 100%;
    }
    .chart-axis-text {
      font-size: 11px;
      fill: #756D65;
      font-family: inherit;
    }

    /* Donut Chart */
    .donut-wrap {
      display: flex;
      align-items: center;
      gap: 2rem;
      padding: 1rem 0;
    }
    .donut-svg {
      width: 170px;
      height: 170px;
      flex-shrink: 0;
    }
    .stage-legend-list {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }
    .s-legend-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 0.84rem;
      color: var(--csp-charcoal);
    }
    .s-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      margin-right: 8px;
    }
    .s-name {
      flex: 1;
      font-weight: 500;
    }
    .s-count {
      font-weight: 700;
      background: var(--csp-ivory);
      padding: 2px 7px;
      border-radius: 10px;
      border: 1px solid var(--csp-border);
      font-size: 0.78rem;
    }

    /* Loss Bars */
    .loss-bars {
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
      padding: 0.5rem 0;
    }
    .loss-bar-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .l-bar-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.84rem;
    }
    .l-title {
      font-weight: 600;
      color: var(--csp-charcoal);
    }
    .l-val {
      font-weight: 700;
      color: var(--csp-warm-grey-dark);
    }
    .l-track {
      height: 10px;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: 6px;
      overflow: hidden;
    }
    .l-fill {
      height: 100%;
      border-radius: 6px;
    }
    .l-fill.ember { background: var(--csp-ember); }
    .l-fill.terracotta { background: var(--csp-terracotta); }
    .l-fill.sage { background: var(--csp-sage); }
    .l-fill.charcoal { background: var(--csp-charcoal); }

    /* Handler Table */
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }
    .u-avatar {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--csp-clay);
      color: var(--csp-charcoal);
      font-size: 0.7rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .cases-count-badge {
      font-weight: 700;
      font-size: 0.82rem;
      padding: 2px 8px;
      border-radius: 10px;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
    }
    .mini-bar {
      width: 70px;
      height: 6px;
      background: var(--csp-border);
      border-radius: 3px;
      overflow: hidden;
    }
    .mini-fill {
      height: 100%;
      background: var(--csp-sage);
    }
  `]
})
export class ReportsAnalyticsComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  selectedPeriod = '30';
  selectedLossType = 'All';
  selectedHandler = 'All';

  formattedSettlementTotal = computed(() => {
    const total = this.mockData.payments().reduce((sum, p) => sum + p.amount, 0);
    return (total / 100000).toFixed(2) + ' Lakhs';
  });

  tribunalRate = computed(() => {
    const total = this.mockData.claims().length || 1;
    const litigated = this.mockData.legalCases().length;
    return Math.round((litigated / total) * 100);
  });

  getHandlerTat(role: string): number {
    switch (role) {
      case 'Claim Handler': return 32;
      case 'Investigator': return 14;
      case 'Legal Officer': return 48;
      case 'Approver': return 6;
      default: return 24;
    }
  }

  getEfficiency(workload: number): number {
    return Math.min(100, Math.max(30, 100 - workload * 2));
  }

  exportReport() {
    this.toast.showSuccess(
      'Analytics Export Generated',
      `Actuarial dataset for period "${this.selectedPeriod} Days" compiled to CSV format (simulated).`
    );
  }

  refreshMetrics() {
    this.toast.showInfo('Metrics Refreshed', 'Real-time telemetry and stage counters updated.');
  }
}
