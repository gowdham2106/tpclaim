import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SystemSettings } from '../../core/models/user.model';

@Component({
  selector: 'app-system-settings',
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
            <span class="current">System Settings</span>
          </div>
          <h1 class="page-title">Operations & System Configuration</h1>
          <p class="page-subtitle">Configure organization profile, SLA compliance thresholds, numbering schemas, and notification triggers.</p>
        </div>
        <div class="header-actions">
          <button (click)="resetAllDemoData()" class="csp-btn csp-btn-outline danger-btn">
            <app-icon name="refresh-cw" [size]="15"></app-icon>
            Reset All Demo Data
          </button>
          <button (click)="saveSettings()" class="csp-btn csp-btn-primary">
            <app-icon name="check" [size]="15"></app-icon>
            Save Changes
          </button>
        </div>
      </div>

      <div class="settings-grid">
        <!-- Section 1: Organisation & Identity -->
        <div class="csp-card settings-card">
          <div class="card-head">
            <div class="head-icon ember">
              <app-icon name="shield" [size]="18"></app-icon>
            </div>
            <div>
              <h3 class="card-title">Organisation Identity & Branding</h3>
              <p class="card-subtitle">Enterprise labels displayed across internal portals and claimant documents.</p>
            </div>
          </div>

          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Organisation Legal Name</label>
              <input type="text" [(ngModel)]="form.orgName" class="csp-input w-full" />
            </div>

            <div class="form-group">
              <label class="form-label">Portal Application Title</label>
              <input type="text" [(ngModel)]="form.portalTitle" class="csp-input w-full" />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Intimation Reference Prefix</label>
                <input type="text" [(ngModel)]="form.intimationPrefix" class="csp-input w-full" />
                <span class="hint">e.g. INT-2026-</span>
              </div>
              <div class="form-group">
                <label class="form-label">Claim Reference Prefix</label>
                <input type="text" [(ngModel)]="form.claimPrefix" class="csp-input w-full" />
                <span class="hint">e.g. TP-2026-</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 2: SLA Timelines -->
        <div class="csp-card settings-card">
          <div class="card-head">
            <div class="head-icon terracotta">
              <app-icon name="clock" [size]="18"></app-icon>
            </div>
            <div>
              <h3 class="card-title">Service Level Agreement (SLA) Targets</h3>
              <p class="card-subtitle">Permitted turnaround duration before tasks and stages are flagged overdue.</p>
            </div>
          </div>

          <div class="card-body">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Document Verification (Days)</label>
                <input type="number" [(ngModel)]="form.slaDaysVerification" class="csp-input w-full" min="1" />
                <span class="hint">Target for reviewing claimant uploads</span>
              </div>
              <div class="form-group">
                <label class="form-label">Field Investigation (Days)</label>
                <input type="number" [(ngModel)]="form.slaDaysInvestigation" class="csp-input w-full" min="1" />
                <span class="hint">Target for scene survey & witness report</span>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Compensation Assessment (Days)</label>
                <input type="number" [(ngModel)]="form.slaDaysAssessment" class="csp-input w-full" min="1" />
                <span class="hint">Target for actuarial computation</span>
              </div>
              <div class="form-group">
                <label class="form-label">Settlement Execution (Days)</label>
                <input type="number" [(ngModel)]="form.slaDaysSettlement" class="csp-input w-full" min="1" />
                <span class="hint">Target for NEFT / RTGS payout dispatch</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 3: Governance & Financial Thresholds -->
        <div class="csp-card settings-card">
          <div class="card-head">
            <div class="head-icon sage">
              <app-icon name="dollar-sign" [size]="18"></app-icon>
            </div>
            <div>
              <h3 class="card-title">Financial Thresholds & Automation</h3>
              <p class="card-subtitle">Mandatory dual-sign-off rules and automatic operational assignment.</p>
            </div>
          </div>

          <div class="card-body">
            <div class="form-group">
              <label class="form-label">High-Value Claim Threshold (₹ INR)</label>
              <input type="number" [(ngModel)]="form.highValueThreshold" class="csp-input w-full" step="50000" />
              <span class="hint">Claims above this quantum require Senior Executive Approver sign-off.</span>
            </div>

            <div class="toggle-row">
              <div class="toggle-text">
                <strong>Automatic Handler Load Balancing</strong>
                <p>Automatically distribute new registered claims to handlers with lowest active caseload.</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="form.autoAssignHandlers" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-row">
              <div class="toggle-text">
                <strong>Allow Reopening of Closed Claims</strong>
                <p>Enable authorized legal officers to reopen settled claims upon Court / Tribunal writ appeal.</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="form.allowReopeningClosedClaims" />
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>

        <!-- Section 4: Notification Channels -->
        <div class="csp-card settings-card">
          <div class="card-head">
            <div class="head-icon charcoal">
              <app-icon name="bell" [size]="18"></app-icon>
            </div>
            <div>
              <h3 class="card-title">Communication & Notification Triggers</h3>
              <p class="card-subtitle">Automated communications sent to claimants and internal staff teams.</p>
            </div>
          </div>

          <div class="card-body">
            <div class="toggle-row">
              <div class="toggle-text">
                <strong>Simulated Email Notifications</strong>
                <p>Send acknowledgement emails, document request links, and stage progression alerts.</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="form.emailNotifications" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="toggle-row">
              <div class="toggle-text">
                <strong>Simulated SMS Alerts</strong>
                <p>Send instant SMS tracking links and verification PINs to claimant mobile phones.</p>
              </div>
              <label class="switch">
                <input type="checkbox" [(ngModel)]="form.smsNotifications" />
                <span class="slider"></span>
              </label>
            </div>

            <div class="banner-box">
              <app-icon name="info" [size]="16"></app-icon>
              <span>All notifications run in local demonstration mode. No real SMS or emails are transmitted.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1300px;
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

    .danger-btn:hover {
      background: #FEE2E2 !important;
      color: #B91C1C !important;
      border-color: #FECACA !important;
    }

    /* Grid */
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(540px, 1fr));
      gap: 1.5rem;
    }
    .settings-card {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .card-head {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--csp-border);
    }
    .head-icon {
      width: 40px;
      height: 40px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .head-icon.ember { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .head-icon.terracotta { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .head-icon.sage { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .head-icon.charcoal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }

    .card-title {
      font-size: 1.08rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .card-subtitle {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      margin: 0.15rem 0 0 0;
    }

    .card-body {
      display: flex;
      flex-direction: column;
      gap: 1.15rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .form-label {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .hint {
      font-size: 0.75rem;
      color: var(--csp-warm-grey);
    }
    .w-full {
      width: 100%;
    }

    .toggle-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1.5rem;
      padding: 0.75rem 0;
      border-top: 1px solid var(--csp-border-light);
    }
    .toggle-text strong {
      display: block;
      font-size: 0.88rem;
      color: var(--csp-charcoal);
    }
    .toggle-text p {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      margin: 0.15rem 0 0 0;
    }

    .banner-box {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.75rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.82rem;
      color: var(--csp-warm-grey-dark);
    }

    /* Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
      flex-shrink: 0;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: var(--csp-border);
      transition: 0.2s;
      border-radius: 22px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.2s;
      border-radius: 50%;
    }
    input:checked + .slider {
      background-color: var(--csp-ember);
    }
    input:checked + .slider:before {
      transform: translateX(18px);
    }
  `]
})
export class SystemSettingsComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  form: SystemSettings = { ...this.mockData.settings() };

  saveSettings() {
    this.mockData.updateSettings(this.form);
    this.toast.showSuccess(
      'System Settings Saved',
      'All operational SLA boundaries, prefixes, and thresholds updated successfully.'
    );
  }

  resetAllDemoData() {
    if (confirm('Are you sure you want to reset all mock claims, documents, and settings to original state?')) {
      this.mockData.resetDemoData();
      this.form = { ...this.mockData.settings() };
      this.toast.showInfo('Demo Reset Complete', 'All claims, tasks, and settings restored to factory defaults.');
    }
  }
}
