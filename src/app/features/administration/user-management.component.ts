import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { UserRecord, StaffRole } from '../../core/models/user.model';

@Component({
  selector: 'app-user-management',
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
            <span class="current">User Management</span>
          </div>
          <h1 class="page-title">Operations Staff & User Directory</h1>
          <p class="page-subtitle">Manage personnel accounts, operational roles, regional hub assignments, and active claim capacities.</p>
        </div>
        <div class="header-actions">
          <button (click)="openAddUserModal()" class="csp-btn csp-btn-primary">
            <app-icon name="user-plus" [size]="16"></app-icon>
            Add New Staff Member
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="user-stats-row">
        <div class="u-stat-card">
          <div class="u-stat-icon charcoal">
            <app-icon name="users" [size]="20"></app-icon>
          </div>
          <div class="u-stat-info">
            <div class="u-stat-val">{{ mockData.users().length }}</div>
            <div class="u-stat-lbl">Registered Personnel</div>
          </div>
        </div>
        <div class="u-stat-card">
          <div class="u-stat-icon sage">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="u-stat-info">
            <div class="u-stat-val">{{ activeUsersCount() }}</div>
            <div class="u-stat-lbl">Active Accounts</div>
          </div>
        </div>
        <div class="u-stat-card">
          <div class="u-stat-icon ember">
            <app-icon name="shield" [size]="20"></app-icon>
          </div>
          <div class="u-stat-info">
            <div class="u-stat-val">{{ handlersCount() }}</div>
            <div class="u-stat-lbl">Claim Handlers</div>
          </div>
        </div>
        <div class="u-stat-card">
          <div class="u-stat-icon terracotta">
            <app-icon name="scale" [size]="20"></app-icon>
          </div>
          <div class="u-stat-info">
            <div class="u-stat-val">{{ legalAndInvCount() }}</div>
            <div class="u-stat-lbl">Legal & Field Surveyors</div>
          </div>
        </div>
      </div>

      <!-- Filters & Search Toolbar -->
      <div class="csp-card filter-toolbar">
        <div class="search-box">
          <app-icon name="search" [size]="16" class="search-ico"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search users by name, email, role, or hub department..." 
            class="csp-input search-input"
          />
        </div>

        <div class="filter-group">
          <label>Role:</label>
          <select [(ngModel)]="roleFilter" class="csp-select">
            <option value="All">All Roles</option>
            <option value="Claim Handler">Claim Handler</option>
            <option value="Investigator">Investigator</option>
            <option value="Legal Officer">Legal Officer</option>
            <option value="Approver">Approver</option>
            <option value="Settlement / Finance Officer">Settlement / Finance Officer</option>
            <option value="Administrator">Administrator</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="statusFilter" class="csp-select">
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      <!-- Users Table -->
      <div class="csp-card table-card">
        <div class="table-responsive">
          <table class="csp-table">
            <thead>
              <tr>
                <th>Officer</th>
                <th>Role & Title</th>
                <th>Regional Hub</th>
                <th>Contact Details</th>
                <th>Workload</th>
                <th>Last Active</th>
                <th>Account Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers()">
                <td>
                  <div class="user-main-cell">
                    <span class="user-avatar-circle">{{ user.avatarInitials }}</span>
                    <div>
                      <strong class="user-name">{{ user.name }}</strong>
                      <span class="user-id">{{ user.id }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="role-pill" [ngClass]="getRoleClass(user.role)">{{ user.role }}</span>
                </td>
                <td>
                  <span class="dept-text">{{ user.department }}</span>
                </td>
                <td>
                  <div class="contact-cell">
                    <span>{{ user.email }}</span>
                    <span class="phone-sub">{{ user.phone }}</span>
                  </div>
                </td>
                <td>
                  <div class="workload-col">
                    <span class="workload-count">{{ user.assignedWorkload }} claims</span>
                    <div class="workload-bar">
                      <div class="workload-fill" [style.width.%]="Math.min(100, user.assignedWorkload * 5)"></div>
                    </div>
                  </div>
                </td>
                <td class="last-active-cell">{{ user.lastActive }}</td>
                <td>
                  <span class="status-indicator-tag" [class.active]="user.isActive">
                    <span class="dot"></span>
                    {{ user.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td style="text-align: right;">
                  <div class="action-btn-row">
                    <button (click)="openEditModal(user)" class="csp-btn-sm" title="Edit Staff Details">
                      <app-icon name="edit" [size]="13"></app-icon>
                      Edit
                    </button>
                    <button 
                      (click)="toggleActive(user)" 
                      class="csp-btn-sm" 
                      [class.danger]="user.isActive"
                      [title]="user.isActive ? 'Deactivate Account' : 'Activate Account'"
                    >
                      <app-icon [name]="user.isActive ? 'lock' : 'check'" [size]="13"></app-icon>
                      {{ user.isActive ? 'Deactivate' : 'Activate' }}
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredUsers().length === 0">
                <td colspan="8" class="empty-row">
                  <div class="empty-state">
                    <app-icon name="users" [size]="36" class="empty-ico"></app-icon>
                    <h3>No staff members found</h3>
                    <p>Adjust your search query or role filter.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Add / Edit User Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="user" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="modal-title">{{ isEditing ? 'Edit Staff Member' : 'Add New Staff Member' }}</h3>
                <p class="modal-subtitle">Provision credentials and operations portfolio capacity.</p>
              </div>
            </div>
            <button class="modal-close-btn" (click)="closeModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Full Name <span class="req">*</span></label>
              <input 
                type="text" 
                [(ngModel)]="activeUser.name" 
                placeholder="e.g. Radhika Menon" 
                class="csp-input w-full"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Email Address <span class="req">*</span></label>
                <input 
                  type="email" 
                  [(ngModel)]="activeUser.email" 
                  placeholder="radhika.menon@claimshieldplus.internal" 
                  class="csp-input w-full"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Mobile Phone <span class="req">*</span></label>
                <input 
                  type="text" 
                  [(ngModel)]="activeUser.phone" 
                  placeholder="+91 98400 11223" 
                  class="csp-input w-full"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Operational Role <span class="req">*</span></label>
                <select [(ngModel)]="activeUser.role" class="csp-select w-full">
                  <option value="Claim Handler">Claim Handler</option>
                  <option value="Investigator">Investigator</option>
                  <option value="Legal Officer">Legal Officer</option>
                  <option value="Approver">Approver</option>
                  <option value="Settlement / Finance Officer">Settlement / Finance Officer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Regional Hub / Department <span class="req">*</span></label>
                <select [(ngModel)]="activeUser.department" class="csp-select w-full">
                  <option value="Motor TP Claims Hub - South">Motor TP Claims Hub - South (Chennai)</option>
                  <option value="Motor TP Claims Hub - North">Motor TP Claims Hub - North (Delhi)</option>
                  <option value="Motor TP Claims Hub - West">Motor TP Claims Hub - West (Mumbai)</option>
                  <option value="Motor TP Claims Hub - East">Motor TP Claims Hub - East (Kolkata)</option>
                  <option value="Legal Litigation Directorate">Legal Litigation Directorate</option>
                  <option value="Central Settlement Operations">Central Settlement Operations</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Initial Workload Capacity (Claims)</label>
                <input 
                  type="number" 
                  [(ngModel)]="activeUser.assignedWorkload" 
                  class="csp-input w-full"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Account Status</label>
                <select [(ngModel)]="activeUser.isActive" class="csp-select w-full">
                  <option [ngValue]="true">Active</option>
                  <option [ngValue]="false">Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="closeModal()" class="csp-btn csp-btn-outline">Cancel</button>
            <button (click)="saveUser()" class="csp-btn csp-btn-primary">
              <app-icon name="check" [size]="15"></app-icon>
              {{ isEditing ? 'Update User' : 'Save Staff Account' }}
            </button>
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

    /* Stats */
    .user-stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .u-stat-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--csp-shadow-sm);
    }
    .u-stat-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .u-stat-icon.charcoal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }
    .u-stat-icon.sage { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .u-stat-icon.ember { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .u-stat-icon.terracotta { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }

    .u-stat-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--csp-charcoal);
    }
    .u-stat-lbl {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      font-weight: 600;
    }

    /* Filters */
    .filter-toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: center;
      padding: 1rem;
      margin-bottom: 1.25rem;
    }
    .search-box {
      position: relative;
      flex: 1;
      min-width: 260px;
    }
    .search-ico {
      position: absolute;
      left: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--csp-warm-grey);
    }
    .search-input {
      padding-left: 36px !important;
      width: 100%;
    }
    .filter-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }

    /* Table */
    .table-card {
      padding: 0;
      overflow: hidden;
    }
    .table-responsive {
      overflow-x: auto;
    }
    .user-main-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .user-avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: var(--csp-clay);
      color: var(--csp-charcoal);
      font-size: 0.8rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .user-name {
      display: block;
      color: var(--csp-charcoal);
      font-size: 0.9rem;
    }
    .user-id {
      font-size: 0.72rem;
      color: var(--csp-warm-grey);
      font-family: monospace;
    }
    .role-pill {
      font-size: 0.76rem;
      font-weight: 700;
      padding: 3px 8px;
      border-radius: 4px;
      display: inline-block;
    }
    .role-pill.handler { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .role-pill.investigator { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .role-pill.legal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }
    .role-pill.approver { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .role-pill.finance { background: rgba(117, 109, 101, 0.12); color: var(--csp-warm-grey); }
    .role-pill.admin { background: #252321; color: #FFF; }

    .dept-text {
      font-size: 0.82rem;
      color: var(--csp-charcoal);
    }
    .contact-cell {
      display: flex;
      flex-direction: column;
      font-size: 0.82rem;
      color: var(--csp-charcoal);
    }
    .phone-sub {
      font-size: 0.74rem;
      color: var(--csp-warm-grey);
    }
    .workload-col {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .workload-count {
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .workload-bar {
      width: 70px;
      height: 5px;
      background: var(--csp-border);
      border-radius: 3px;
      overflow: hidden;
    }
    .workload-fill {
      height: 100%;
      background: var(--csp-ember);
    }
    .last-active-cell {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
    }
    .status-indicator-tag {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 2px 7px;
      border-radius: 12px;
      background: var(--csp-ivory);
      color: var(--csp-warm-grey);
      border: 1px solid var(--csp-border);
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }
    .status-indicator-tag .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--csp-warm-grey);
    }
    .status-indicator-tag.active {
      background: rgba(85, 116, 95, 0.1);
      color: var(--csp-sage);
      border-color: rgba(85, 116, 95, 0.3);
    }
    .status-indicator-tag.active .dot {
      background: var(--csp-sage);
    }

    .action-btn-row {
      display: flex;
      justify-content: flex-end;
      gap: 0.35rem;
    }
    .csp-btn-sm {
      padding: 0.35rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: var(--csp-radius-sm);
      border: 1px solid var(--csp-border);
      background: var(--csp-white);
      color: var(--csp-charcoal);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.15s;
    }
    .csp-btn-sm:hover {
      background: var(--csp-ivory);
    }
    .csp-btn-sm.danger:hover {
      background: #FEE2E2;
      color: #B91C1C;
      border-color: #FECACA;
    }

    .empty-row {
      text-align: center;
      padding: 3rem 1.5rem;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--csp-warm-grey);
    }
    .empty-ico {
      color: var(--csp-clay);
    }

    /* Modal */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(37, 35, 33, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1050;
      padding: 1rem;
    }
    .modal-dialog {
      background: var(--csp-white);
      border-radius: var(--csp-radius-md);
      width: 100%;
      max-width: 600px;
      box-shadow: var(--csp-shadow-lg);
      border: 1px solid var(--csp-border);
      overflow: hidden;
    }
    .modal-header {
      padding: 1.25rem 1.5rem;
      border-bottom: 1px solid var(--csp-border);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      background: var(--csp-ivory-light);
    }
    .modal-title-wrap {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }
    .modal-icon-badge {
      width: 38px;
      height: 38px;
      border-radius: var(--csp-radius-sm);
      background: var(--csp-charcoal);
      color: var(--csp-white);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .modal-title {
      font-size: 1.15rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .modal-subtitle {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      margin: 0.15rem 0 0 0;
    }
    .modal-close-btn {
      background: none;
      border: none;
      color: var(--csp-warm-grey);
      cursor: pointer;
    }
    .modal-body {
      padding: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.1rem;
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
    .req {
      color: var(--csp-ember);
    }
    .w-full {
      width: 100%;
    }
    .modal-footer {
      padding: 1rem 1.5rem;
      background: var(--csp-ivory-light);
      border-top: 1px solid var(--csp-border);
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
    }
  `]
})
export class UserManagementComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);
  Math = Math;

  searchQuery = '';
  roleFilter = 'All';
  statusFilter = 'All';

  // Modal
  isModalOpen = false;
  isEditing = false;
  activeUser: any = {
    id: '',
    name: '',
    email: '',
    role: 'Claim Handler' as StaffRole,
    department: 'Motor TP Claims Hub - South',
    phone: '',
    assignedWorkload: 10,
    isActive: true
  };

  // Metrics
  activeUsersCount = computed(() => 
    this.mockData.users().filter(u => u.isActive).length
  );
  handlersCount = computed(() => 
    this.mockData.users().filter(u => u.role === 'Claim Handler').length
  );
  legalAndInvCount = computed(() => 
    this.mockData.users().filter(u => u.role === 'Legal Officer' || u.role === 'Investigator').length
  );

  filteredUsers = computed(() => {
    let list = this.mockData.users();
    if (this.roleFilter !== 'All') {
      list = list.filter(u => u.role === this.roleFilter);
    }
    if (this.statusFilter === 'Active') {
      list = list.filter(u => u.isActive);
    } else if (this.statusFilter === 'Inactive') {
      list = list.filter(u => !u.isActive);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(u => 
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    return list;
  });

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

  toggleActive(user: UserRecord) {
    this.mockData.toggleUserActive(user.id);
    this.toast.showSuccess(
      `Account Status Updated`,
      `User ${user.name} is now ${user.isActive ? 'Inactive' : 'Active'}.`
    );
  }

  openAddUserModal() {
    this.isEditing = false;
    this.activeUser = {
      id: '',
      name: '',
      email: '',
      role: 'Claim Handler',
      department: 'Motor TP Claims Hub - South',
      phone: '+91 ',
      assignedWorkload: 8,
      isActive: true
    };
    this.isModalOpen = true;
  }

  openEditModal(user: UserRecord) {
    this.isEditing = true;
    this.activeUser = { ...user };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveUser() {
    if (!this.activeUser.name || !this.activeUser.email || !this.activeUser.role) {
      this.toast.showError('Required Information Missing', 'Please fill in name, email, and operational role.');
      return;
    }

    if (this.isEditing) {
      this.mockData.users.update(list => 
        list.map(u => u.id === this.activeUser.id ? { ...this.activeUser } : u)
      );
      this.mockData.saveState();
      this.toast.showSuccess('User Profile Updated', `Account for ${this.activeUser.name} has been updated.`);
    } else {
      this.mockData.addUser({
        name: this.activeUser.name,
        email: this.activeUser.email,
        role: this.activeUser.role,
        department: this.activeUser.department,
        isActive: this.activeUser.isActive,
        assignedWorkload: this.activeUser.assignedWorkload,
        lastActive: 'Just added',
        phone: this.activeUser.phone
      });
      this.toast.showSuccess('Staff Account Created', `New user ${this.activeUser.name} added to ${this.activeUser.role}.`);
    }
    this.closeModal();
  }
}
