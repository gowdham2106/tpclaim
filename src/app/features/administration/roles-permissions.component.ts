import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { RolePermission, StaffRole } from '../../core/models/user.model';

@Component({
  selector: 'app-roles-permissions',
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
            <a routerLink="/ops/user-management">Administration</a>
            <span class="sep">/</span>
            <span class="current">Roles & Permissions</span>
          </div>
          <h1 class="page-title">Access Control & Role Matrix</h1>
          <p class="page-subtitle">Configure governance boundaries, authorization thresholds, and segregation of duties (SoD) across operations.</p>
        </div>
        <div class="header-actions">
          <button (click)="resetDefaults()" class="csp-btn csp-btn-outline">
            <app-icon name="refresh-cw" [size]="15"></app-icon>
            Reset to Standard SoD Matrix
          </button>
        </div>
      </div>

      <!-- Compliance Notice Banner -->
      <div class="csp-card notice-card">
        <div class="notice-icon">
          <app-icon name="shield-check" [size]="22"></app-icon>
        </div>
        <div class="notice-content">
          <h4>Segregation of Duties (SoD) Active</h4>
          <p>Motor TP Claims guidelines mandate that officers assessing compensation cannot approve payments exceeding statutory limits. Modifying permissions here takes effect immediately in your local demo environment.</p>
        </div>
      </div>

      <!-- Permission Matrix Table Card -->
      <div class="csp-card matrix-card">
        <div class="matrix-header">
          <h3 class="matrix-title">Operational Capability Matrix</h3>
          <span class="matrix-hint">Click any capability toggle to adjust permissions for that functional role.</span>
        </div>

        <div class="table-responsive">
          <table class="csp-table matrix-table">
            <thead>
              <tr>
                <th style="min-width: 220px;">Role & Profile</th>
                <th class="perm-col">View Claims</th>
                <th class="perm-col">Edit Claims</th>
                <th class="perm-col">Review Docs</th>
                <th class="perm-col">Assign Staff</th>
                <th class="perm-col">Assess Liability</th>
                <th class="perm-col">Assess Compensation</th>
                <th class="perm-col">Approve Mandates</th>
                <th class="perm-col">Process Settlement</th>
                <th class="perm-col">Manage Users</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let perm of mockData.permissions()" [class.selected-role-row]="selectedRole === perm.role">
                <td>
                  <div class="role-desc-cell" (click)="selectRole(perm)">
                    <div class="role-title-line">
                      <span class="role-badge" [ngClass]="getRoleClass(perm.role)">{{ perm.role }}</span>
                    </div>
                    <p class="role-desc-text">{{ perm.description }}</p>
                  </div>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canViewClaims" 
                      (change)="togglePermission(perm.role, 'canViewClaims', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canEditClaims" 
                      (change)="togglePermission(perm.role, 'canEditClaims', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canReviewDocuments" 
                      (change)="togglePermission(perm.role, 'canReviewDocuments', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canAssignStaff" 
                      (change)="togglePermission(perm.role, 'canAssignStaff', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canAssessLiability" 
                      (change)="togglePermission(perm.role, 'canAssessLiability', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canAssessCompensation" 
                      (change)="togglePermission(perm.role, 'canAssessCompensation', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canApproveDecisions" 
                      (change)="togglePermission(perm.role, 'canApproveDecisions', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canProcessSettlements" 
                      (change)="togglePermission(perm.role, 'canProcessSettlements', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>

                <td class="perm-col">
                  <label class="switch">
                    <input 
                      type="checkbox" 
                      [checked]="perm.canManageUsers" 
                      (change)="togglePermission(perm.role, 'canManageUsers', $event)" 
                    />
                    <span class="slider"></span>
                  </label>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Role Profile Detail Card -->
      <div class="csp-card role-detail-card" *ngIf="selectedPermRecord()">
        <div class="role-detail-header">
          <div class="role-icon-box">
            <app-icon name="shield" [size]="20"></app-icon>
          </div>
          <div>
            <h3 class="role-detail-title">{{ selectedPermRecord()?.role }} Scope & Delegated Authority</h3>
            <p class="role-detail-subtitle">Audited operational boundary in accordance with Third-Party Motor Insurance Standards.</p>
          </div>
        </div>

        <div class="authority-grid">
          <div class="auth-item">
            <div class="auth-label">Functional Jurisdiction:</div>
            <div class="auth-val">{{ getJurisdiction(selectedPermRecord()?.role) }}</div>
          </div>
          <div class="auth-item">
            <div class="auth-label">Discretionary Settlement Limit:</div>
            <div class="auth-val">{{ getDiscretionaryLimit(selectedPermRecord()?.role) }}</div>
          </div>
          <div class="auth-item">
            <div class="auth-label">Tribunal Appearance Mandate:</div>
            <div class="auth-val">{{ getTribunalMandate(selectedPermRecord()?.role) }}</div>
          </div>
          <div class="auth-item">
            <div class="auth-label">Audit Trail Requirement:</div>
            <div class="auth-val">Mandatory immutable event log for every state transition</div>
          </div>
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

    /* Notice Card */
    .notice-card {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-left: 4px solid var(--csp-ember);
      padding: 1.25rem 1.5rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      margin-bottom: 1.5rem;
    }
    .notice-icon {
      color: var(--csp-ember);
      flex-shrink: 0;
    }
    .notice-content h4 {
      font-size: 0.95rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0 0 0.25rem 0;
    }
    .notice-content p {
      font-size: 0.85rem;
      color: var(--csp-warm-grey-dark);
      margin: 0;
      line-height: 1.45;
    }

    /* Matrix Card */
    .matrix-card {
      padding: 0;
      overflow: hidden;
      margin-bottom: 1.5rem;
    }
    .matrix-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--csp-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--csp-white);
    }
    .matrix-title {
      font-size: 1.1rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .matrix-hint {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
    }
    .table-responsive {
      overflow-x: auto;
    }
    .matrix-table th {
      font-size: 0.78rem;
      padding: 0.85rem 0.75rem;
      background: var(--csp-ivory-light);
      text-align: center;
    }
    .matrix-table th:first-child {
      text-align: left;
    }
    .matrix-table td {
      padding: 0.85rem 0.75rem;
      vertical-align: middle;
    }
    .perm-col {
      text-align: center;
      width: 95px;
    }

    .role-desc-cell {
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .role-badge {
      font-size: 0.82rem;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .role-badge.handler { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .role-badge.investigator { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .role-badge.legal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }
    .role-badge.approver { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .role-badge.finance { background: rgba(117, 109, 101, 0.12); color: var(--csp-warm-grey); }
    .role-badge.admin { background: #252321; color: #FFF; }

    .role-desc-text {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
      margin: 0;
      line-height: 1.35;
    }

    /* Switch */
    .switch {
      position: relative;
      display: inline-block;
      width: 36px;
      height: 20px;
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
      border-radius: 20px;
    }
    .slider:before {
      position: absolute;
      content: "";
      height: 14px;
      width: 14px;
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
      transform: translateX(16px);
    }

    /* Detail Card */
    .role-detail-card {
      padding: 1.5rem;
    }
    .role-detail-header {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.25rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--csp-border);
    }
    .role-icon-box {
      width: 44px;
      height: 44px;
      border-radius: var(--csp-radius-sm);
      background: var(--csp-ember);
      color: var(--csp-white);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .role-detail-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .role-detail-subtitle {
      font-size: 0.82rem;
      color: var(--csp-warm-grey);
      margin: 0.2rem 0 0 0;
    }
    .authority-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1.25rem;
    }
    .auth-item {
      background: var(--csp-ivory-light);
      padding: 1rem;
      border-radius: var(--csp-radius-sm);
      border: 1px solid var(--csp-border);
    }
    .auth-label {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.25rem;
    }
    .auth-val {
      font-size: 0.9rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
  `]
})
export class RolesPermissionsComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  selectedRole = 'Claim Handler';

  selectedPermRecord = computed(() => 
    this.mockData.permissions().find(p => p.role === this.selectedRole) || this.mockData.permissions()[0]
  );

  getRoleClass(role: string): string {
    switch (role) {
      case 'Claim Handler': return 'handler';
      case 'Investigator': return 'investigator';
      case 'Legal Officer': return 'legal';
      case 'Approver': return 'approver';
      case 'Settlement / Finance Officer': return 'finance';
      case 'Administrator': return 'admin';
      default: return 'handler';
    }
  }

  selectRole(perm: RolePermission) {
    this.selectedRole = perm.role;
  }

  togglePermission(role: StaffRole, field: string, event: Event) {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.mockData.updateRolePermission(role, field, isChecked);
    this.toast.showSuccess(
      'Permission Modified',
      `${field} set to ${isChecked ? 'Granted' : 'Revoked'} for ${role}.`
    );
  }

  resetDefaults() {
    this.mockData.resetDemoData();
    this.toast.showInfo('Permissions Restored', 'Standard Segregation of Duties matrix reloaded.');
  }

  getJurisdiction(role?: string): string {
    switch (role) {
      case 'Claim Handler': return 'Initial intimation review, document requisitions, and registration';
      case 'Investigator': return 'Accident scene inspection, witness statements, and FIR verification';
      case 'Legal Officer': return 'Tribunal representation, written statements, and settlement compromises';
      case 'Approver': return 'High-value assessment sign-off and exception approvals';
      case 'Settlement / Finance Officer': return 'Beneficiary account verification and payment batch execution';
      case 'Administrator': return 'System governance, user lifecycle, and compliance audit';
      default: return 'Operations Support';
    }
  }

  getDiscretionaryLimit(role?: string): string {
    switch (role) {
      case 'Claim Handler': return 'Up to ₹2,50,000 (Property / Minor Injury)';
      case 'Investigator': return 'No financial sanction authority';
      case 'Legal Officer': return 'Up to ₹15,00,000 (Tribunal Compromise Settlement)';
      case 'Approver': return 'Up to ₹50,00,000 (Permanent Disability / Fatal Cases)';
      case 'Settlement / Finance Officer': return 'Execution of authorized mandates only';
      case 'Administrator': return 'Full organizational configuration authority';
      default: return 'None';
    }
  }

  getTribunalMandate(role?: string): string {
    switch (role) {
      case 'Legal Officer': return 'Authorized to execute Section 166/163A Compromise Writs';
      default: return 'Non-litigation operational role';
    }
  }
}
