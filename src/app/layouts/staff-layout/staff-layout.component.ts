import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { StaffRole } from '../../core/models/user.model';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

interface NavGroup {
  title: string;
  isExpanded: boolean;
  items: NavItem[];
}

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, ToastContainerComponent],
  template: `
    <div class="staff-shell" [class.sidebar-collapsed]="isSidebarCollapsed">
      <!-- Backdrop for mobile drawer -->
      <div 
        class="mobile-backdrop" 
        *ngIf="isMobileSidebarOpen" 
        (click)="closeMobileSidebar()"
      ></div>

      <!-- Persistent Sidebar -->
      <aside class="staff-sidebar" [class.mobile-open]="isMobileSidebarOpen">
        <!-- Sidebar Brand -->
        <div class="sidebar-header">
          <a routerLink="/ops/dashboard" class="brand-link" (click)="closeMobileSidebar()">
            <div class="logo-box">
              <app-icon name="shield-check" [size]="20" class="logo-icon"></app-icon>
            </div>
            <div class="brand-titles">
              <span class="brand-title">ClaimShield</span>
              <span class="brand-badge">PLUS OPS</span>
            </div>
          </a>
          <button class="collapse-toggle" (click)="toggleSidebarCollapse()" title="Toggle Sidebar">
            <app-icon [name]="isSidebarCollapsed ? 'chevron-right' : 'arrow-left'" [size]="16"></app-icon>
          </button>
        </div>

        <!-- Sidebar Navigation Groups -->
        <div class="sidebar-scroll">
          <div *ngFor="let group of navGroups; let i = index" class="nav-group">
            <button class="group-title-btn" (click)="toggleGroup(group)">
              <span class="group-label">{{ group.title }}</span>
              <app-icon [name]="group.isExpanded ? 'chevron-up' : 'chevron-down'" [size]="13"></app-icon>
            </button>

            <div class="group-items" *ngIf="group.isExpanded">
              <a 
                *ngFor="let item of group.items" 
                [routerLink]="item.route" 
                routerLinkActive="active" 
                [routerLinkActiveOptions]="{exact: item.route === '/ops/dashboard'}"
                class="nav-item-link"
                (click)="closeMobileSidebar()"
              >
                <app-icon [name]="item.icon" [size]="16" class="nav-item-icon"></app-icon>
                <span class="nav-item-text">{{ item.label }}</span>
                <span class="nav-item-badge" *ngIf="item.badge">{{ item.badge }}</span>
              </a>
            </div>
          </div>

          <!-- Direct Claim 360 Workspace Link -->
          <div class="nav-group" style="margin-top: 0.5rem; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 0.75rem;">
            <a 
              routerLink="/ops/claim-360/TP-2026-001842" 
              routerLinkActive="active" 
              class="nav-item-link workspace-link"
              (click)="closeMobileSidebar()"
            >
              <app-icon name="layers" [size]="16" class="nav-item-icon"></app-icon>
              <span class="nav-item-text">Claim 360 Workspace</span>
            </a>
          </div>
        </div>

        <!-- Sidebar Footer / Demo Role Indicator -->
        <div class="sidebar-footer">
          <div class="user-chip">
            <div class="user-avatar">{{ mockData.currentUser().avatarInitials }}</div>
            <div class="user-info">
              <div class="user-name">{{ mockData.currentUser().name }}</div>
              <div class="user-role">{{ mockData.currentUser().role }}</div>
            </div>
          </div>
          <button (click)="logout()" class="logout-btn" title="Sign Out">
            <app-icon name="log-out" [size]="16"></app-icon>
          </button>
        </div>
      </aside>

      <!-- Main Layout Column -->
      <div class="staff-main-wrap">
        <!-- Top Navigation Bar -->
        <header class="staff-topbar">
          <div class="topbar-left">
            <button class="mobile-menu-btn" (click)="toggleMobileSidebar()">
              <app-icon name="menu" [size]="20"></app-icon>
            </button>

            <!-- Global Claim Search -->
            <div class="global-search-container">
              <app-icon name="search" [size]="16" class="search-icon"></app-icon>
              <input 
                type="text" 
                [(ngModel)]="searchQuery" 
                (keyup.enter)="onGlobalSearch()"
                placeholder="Search claim (e.g. TP-2026-001842, INT-2026-000184, Ravi)..."
                class="global-search-input"
              />
            </div>
          </div>

          <div class="topbar-right">
            <!-- Demo Role Switcher -->
            <div class="role-switcher-box">
              <span class="role-label">Role:</span>
              <select [ngModel]="mockData.currentUser().role" (ngModelChange)="switchRole($event)" class="role-select">
                <option value="Claim Handler">Claim Handler</option>
                <option value="Investigator">Investigator</option>
                <option value="Legal Officer">Legal Officer</option>
                <option value="Approver">Approver</option>
                <option value="Settlement / Finance Officer">Settlement Officer</option>
                <option value="Administrator">Administrator</option>
              </select>
            </div>

            <!-- Notifications Dropdown Button -->
            <div class="notif-wrapper">
              <button class="icon-btn notif-btn" (click)="toggleNotifDropdown()">
                <app-icon name="bell" [size]="18"></app-icon>
                <span class="badge-count" *ngIf="unreadNotifsCount() > 0">{{ unreadNotifsCount() }}</span>
              </button>

              <!-- Notifications Popup -->
              <div class="notif-dropdown" *ngIf="isNotifDropdownOpen">
                <div class="notif-dropdown-header">
                  <span style="font-weight: 700;">Notifications</span>
                  <button (click)="markAllRead()" class="text-link-btn">Mark all read</button>
                </div>
                <div class="notif-dropdown-body">
                  <div 
                    *ngFor="let notif of mockData.notifications().slice(0, 5)" 
                    class="notif-dropdown-item"
                    [class.unread]="!notif.isRead"
                    (click)="openNotif(notif)"
                  >
                    <div style="font-weight: 600; font-size: 0.85rem; color: var(--csp-charcoal);">{{ notif.title }}</div>
                    <div style="font-size: 0.78rem; color: var(--csp-warm-grey); margin-top: 2px;">{{ notif.message }}</div>
                    <div style="font-size: 0.72rem; color: var(--csp-warm-grey-light); margin-top: 4px;">{{ notif.timestamp }}</div>
                  </div>
                </div>
                <div class="notif-dropdown-footer">
                  <a routerLink="/ops/notifications" (click)="isNotifDropdownOpen = false">View All Notifications</a>
                </div>
              </div>
            </div>

            <!-- Reset Demo State -->
            <button (click)="onResetDemo()" class="csp-btn csp-btn-secondary csp-btn-sm" title="Reset all changes to default state">
              <app-icon name="refresh-cw" [size]="13"></app-icon>
              <span>Reset State</span>
            </button>

            <!-- Public Portal Link -->
            <a routerLink="/" class="csp-btn csp-btn-outline-ember csp-btn-sm" title="View Public Claimant Experience">
              <span>Claimant View</span>
              <app-icon name="arrow-right" [size]="13"></app-icon>
            </a>
          </div>
        </header>

        <!-- Breadcrumbs & Workspace Subheader -->
        <div class="staff-breadcrumbs">
          <div class="breadcrumb-trail">
            <a routerLink="/ops/dashboard" class="bc-link">Operations</a>
            <span class="bc-sep">/</span>
            <span class="bc-current">{{ currentRouteName }}</span>
          </div>

          <div class="demo-tag">
            <span class="tag-dot"></span>
            Simulated Claims Environment — No Real Financials
          </div>
        </div>

        <!-- Main Workspace Area -->
        <main class="staff-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Toast Alerts -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .staff-shell {
      display: flex;
      min-height: 100vh;
      background-color: var(--csp-bg-soft);
    }

    /* Sidebar */
    .staff-sidebar {
      width: 260px;
      background: var(--csp-charcoal);
      color: var(--csp-white);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      position: sticky;
      top: 0;
      height: 100vh;
      transition: width 0.2s ease;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 1rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      background: var(--csp-charcoal-dark);
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      text-decoration: none;
    }

    .logo-box {
      width: 34px;
      height: 34px;
      background: var(--csp-ember);
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--csp-white);
    }

    .brand-titles {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-family: var(--csp-font-heading);
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--csp-white);
      letter-spacing: -0.01em;
    }

    .brand-badge {
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--csp-clay);
    }

    .collapse-toggle {
      background: none;
      border: none;
      color: var(--csp-warm-grey-light);
      cursor: pointer;
      padding: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: color 0.15s;
    }
    .collapse-toggle:hover { color: var(--csp-white); }

    .sidebar-scroll {
      flex: 1;
      overflow-y: auto;
      padding: 0.75rem 0.6rem;
    }

    .nav-group {
      margin-bottom: 0.5rem;
    }

    .group-title-btn {
      width: 100%;
      background: none;
      border: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.45rem 0.6rem;
      color: var(--csp-warm-grey-light);
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      cursor: pointer;
      border-radius: 4px;
      transition: background 0.15s;
    }
    .group-title-btn:hover { background: rgba(255, 255, 255, 0.04); color: var(--csp-white); }

    .group-items {
      display: flex;
      flex-direction: column;
      gap: 2px;
      margin-top: 2px;
    }

    .nav-item-link {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.5rem 0.75rem;
      border-radius: var(--csp-radius-sm);
      color: #D3CDC6;
      font-size: 0.85rem;
      font-weight: 500;
      text-decoration: none;
      transition: var(--csp-transition);
      position: relative;
    }

    .nav-item-link:hover {
      background-color: rgba(255, 255, 255, 0.07);
      color: var(--csp-white);
    }

    .nav-item-link.active {
      background-color: var(--csp-ember);
      color: var(--csp-white);
      font-weight: 600;
      box-shadow: 0 2px 6px rgba(232, 93, 50, 0.35);
    }

    .nav-item-icon {
      color: inherit;
    }

    .nav-item-text {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .nav-item-badge {
      background: rgba(255, 255, 255, 0.2);
      color: var(--csp-white);
      font-size: 0.7rem;
      font-weight: 700;
      padding: 1px 6px;
      border-radius: var(--csp-radius-pill);
    }

    .workspace-link {
      background: rgba(232, 93, 50, 0.12);
      border: 1px dashed rgba(232, 93, 50, 0.4);
      color: var(--csp-clay);
    }
    .workspace-link:hover {
      background: rgba(232, 93, 50, 0.25);
      color: var(--csp-white);
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 0.85rem 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      background: var(--csp-charcoal-dark);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
    }

    .user-chip {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      overflow: hidden;
    }

    .user-avatar {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--csp-terracotta);
      color: var(--csp-white);
      font-weight: 700;
      font-size: 0.8rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .user-name {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--csp-white);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      font-size: 0.7rem;
      color: var(--csp-clay);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      background: none;
      border: none;
      color: var(--csp-warm-grey-light);
      cursor: pointer;
      padding: 6px;
      transition: color 0.15s;
    }
    .logout-btn:hover { color: var(--csp-error); }

    /* Main Area */
    .staff-main-wrap {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .staff-topbar {
      height: 60px;
      background: var(--csp-white);
      border-bottom: 1px solid var(--csp-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1.5rem;
      gap: 1.5rem;
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .topbar-left {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
      max-width: 520px;
    }

    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      color: var(--csp-charcoal);
      cursor: pointer;
      padding: 6px;
    }

    .global-search-container {
      position: relative;
      width: 100%;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--csp-warm-grey);
    }

    .global-search-input {
      width: 100%;
      padding: 0.5rem 0.85rem 0.5rem 2.25rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      font-size: 0.88rem;
      background: var(--csp-bg-soft);
      outline: none;
      transition: var(--csp-transition);
    }

    .global-search-input:focus {
      border-color: var(--csp-ember);
      background: var(--csp-white);
      box-shadow: 0 0 0 3px rgba(232, 93, 50, 0.12);
    }

    .topbar-right {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }

    .role-switcher-box {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.2rem 0.5rem;
    }

    .role-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--csp-warm-grey);
      text-transform: uppercase;
    }

    .role-select {
      border: none;
      background: none;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--csp-charcoal);
      cursor: pointer;
      outline: none;
    }

    .icon-btn {
      background: none;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
      color: var(--csp-charcoal);
      transition: var(--csp-transition);
    }
    .icon-btn:hover { background: var(--csp-ivory); }

    .badge-count {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--csp-ember);
      color: var(--csp-white);
      font-size: 0.68rem;
      font-weight: 700;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Notif dropdown */
    .notif-wrapper {
      position: relative;
    }

    .notif-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      right: 0;
      width: 320px;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-lg);
      z-index: 1000;
      overflow: hidden;
    }

    .notif-dropdown-header {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--csp-border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: var(--csp-ivory);
    }

    .text-link-btn {
      background: none;
      border: none;
      font-size: 0.75rem;
      color: var(--csp-ember);
      cursor: pointer;
      font-weight: 600;
    }

    .notif-dropdown-body {
      max-height: 300px;
      overflow-y: auto;
    }

    .notif-dropdown-item {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--csp-border);
      cursor: pointer;
      transition: background 0.15s;
    }
    .notif-dropdown-item:hover { background: var(--csp-bg-soft); }
    .notif-dropdown-item.unread { background: rgba(232, 93, 50, 0.05); }

    .notif-dropdown-footer {
      padding: 0.6rem 1rem;
      text-align: center;
      background: var(--csp-bg-soft);
      font-size: 0.8rem;
      font-weight: 600;
    }

    /* Breadcrumbs */
    .staff-breadcrumbs {
      padding: 0.75rem 1.5rem;
      background: var(--csp-bg-soft);
      border-bottom: 1px solid var(--csp-border);
      display: flex;
      align-items: center;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.75rem;
    }

    .breadcrumb-trail {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
    }

    .bc-link {
      color: var(--csp-warm-grey);
      font-weight: 500;
    }

    .bc-sep {
      color: var(--csp-border-dark);
    }

    .bc-current {
      color: var(--csp-charcoal);
      font-weight: 700;
    }

    .demo-tag {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.76rem;
      color: var(--csp-warm-grey);
      background: var(--csp-ivory);
      padding: 0.25rem 0.65rem;
      border-radius: var(--csp-radius-pill);
      border: 1px solid var(--csp-border);
    }

    .tag-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--csp-sage);
    }

    /* Content Area */
    .staff-content {
      flex: 1;
      padding: 1.5rem;
      max-width: 1440px;
      width: 100%;
      margin: 0 auto;
    }

    /* Mobile Responsive */
    @media (max-width: 1024px) {
      .staff-sidebar {
        position: fixed;
        left: -280px;
        top: 0;
        bottom: 0;
        width: 280px;
        transition: left 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .staff-sidebar.mobile-open {
        left: 0;
      }

      .mobile-menu-btn {
        display: block;
      }

      .mobile-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(37, 35, 33, 0.5);
        z-index: 999;
      }
    }
  `]
})
export class StaffLayoutComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);
  router = inject(Router);

  isSidebarCollapsed = false;
  isMobileSidebarOpen = false;
  isNotifDropdownOpen = false;
  searchQuery = '';
  currentRouteName = 'Dashboard';

  // Computed unread notifications
  unreadNotifsCount = () => this.mockData.notifications().filter(n => !n.isRead).length;

  navGroups: NavGroup[] = [
    {
      title: 'Overview',
      isExpanded: true,
      items: [
        { label: 'Dashboard', route: '/ops/dashboard', icon: 'bar-chart' }
      ]
    },
    {
      title: 'Claim Intake',
      isExpanded: true,
      items: [
        { label: 'Claim Intimations', route: '/ops/intimations', icon: 'file-text' },
        { label: 'Claims Work Queue', route: '/ops/work-queue', icon: 'clipboard-list' },
        { label: 'Claim Registration', route: '/ops/claim-registration', icon: 'plus' }
      ]
    },
    {
      title: 'Claim Investigation',
      isExpanded: true,
      items: [
        { label: 'Investigation', route: '/ops/investigation', icon: 'search' },
        { label: 'Evidence Management', route: '/ops/evidence', icon: 'files' },
        { label: 'Claimant & Parties', route: '/ops/parties', icon: 'users' }
      ]
    },
    {
      title: 'Legal & Assessment',
      isExpanded: true,
      items: [
        { label: 'Legal / MACT Management', route: '/ops/legal-mact', icon: 'scale' },
        { label: 'Liability Assessment', route: '/ops/liability-assessment', icon: 'shield-check' },
        { label: 'Compensation Assessment', route: '/ops/compensation-assessment', icon: 'dollar-sign' }
      ]
    },
    {
      title: 'Decision & Settlement',
      isExpanded: true,
      items: [
        { label: 'Approvals', route: '/ops/approvals', icon: 'check-circle' },
        { label: 'Settlement Processing', route: '/ops/settlement-processing', icon: 'credit-card' },
        { label: 'Payment Tracking', route: '/ops/payment-tracking', icon: 'clock' },
        { label: 'Claim Closure', route: '/ops/claim-closure', icon: 'lock' }
      ]
    },
    {
      title: 'Document Management',
      isExpanded: true,
      items: [
        { label: 'Document Centre', route: '/ops/document-centre', icon: 'files' },
        { label: 'Document Verification', route: '/ops/document-verification', icon: 'check' },
        { label: 'Additional Document Requests', route: '/ops/document-requests', icon: 'upload' }
      ]
    },
    {
      title: 'Communication',
      isExpanded: true,
      items: [
        { label: 'Notifications', route: '/ops/notifications', icon: 'bell' },
        { label: 'Tasks & Reminders', route: '/ops/tasks-reminders', icon: 'calendar' },
        { label: 'Communication History', route: '/ops/communication-history', icon: 'message-square' }
      ]
    },
    {
      title: 'Analytics',
      isExpanded: true,
      items: [
        { label: 'Reports & Analytics', route: '/ops/reports-analytics', icon: 'pie-chart' }
      ]
    },
    {
      title: 'Administration',
      isExpanded: true,
      items: [
        { label: 'User Management', route: '/ops/user-management', icon: 'user' },
        { label: 'Roles & Permissions', route: '/ops/roles-permissions', icon: 'shield' },
        { label: 'System Settings', route: '/ops/system-settings', icon: 'settings' },
        { label: 'Help Centre', route: '/ops/internal-help', icon: 'help-circle' }
      ]
    }
  ];

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateCurrentRouteName(event.urlAfterRedirects);
    });
  }

  updateCurrentRouteName(url: string) {
    for (const group of this.navGroups) {
      for (const item of group.items) {
        if (url.includes(item.route)) {
          this.currentRouteName = item.label;
          return;
        }
      }
    }
    if (url.includes('claim-360')) {
      this.currentRouteName = 'Claim 360 Workspace';
    } else {
      this.currentRouteName = 'Operations Workspace';
    }
  }

  toggleGroup(group: NavGroup) {
    group.isExpanded = !group.isExpanded;
  }

  toggleSidebarCollapse() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  toggleMobileSidebar() {
    this.isMobileSidebarOpen = !this.isMobileSidebarOpen;
  }

  closeMobileSidebar() {
    this.isMobileSidebarOpen = false;
  }

  toggleNotifDropdown() {
    this.isNotifDropdownOpen = !this.isNotifDropdownOpen;
  }

  markAllRead() {
    this.mockData.markAllNotificationsRead();
    this.toast.success('All notifications marked as read.');
  }

  openNotif(notif: any) {
    this.mockData.markNotificationRead(notif.id);
    this.isNotifDropdownOpen = false;
    if (notif.actionRoute) {
      this.router.navigateByUrl(notif.actionRoute);
    }
  }

  switchRole(roleName: StaffRole) {
    const user = this.mockData.users().find(u => u.role === roleName);
    if (user) {
      this.mockData.currentUser.set(user);
      this.toast.info(`Switched role to ${roleName} (${user.name})`);
    }
  }

  onGlobalSearch() {
    const q = this.searchQuery.trim();
    if (!q) return;
    const found = this.mockData.getClaimById(q);
    if (found) {
      this.toast.success(`Claim found: ${found.id || found.intimationRef}`);
      this.router.navigate(['/ops/claim-360', found.id || found.intimationRef]);
    } else {
      // Find in list
      const match = this.mockData.claims().find(c => 
        c.claimantName.toLowerCase().includes(q.toLowerCase()) || 
        c.insuredVehicleNumber.toLowerCase().includes(q.toLowerCase())
      );
      if (match) {
        this.toast.success(`Found matching record for ${match.claimantName}`);
        this.router.navigate(['/ops/claim-360', match.id || match.intimationRef]);
      } else {
        this.toast.warning(`No claim found matching "${q}". Opening Claim Intimations.`);
        this.router.navigate(['/ops/intimations'], { queryParams: { q } });
      }
    }
  }

  onResetDemo() {
    this.mockData.resetDemoData();
    this.toast.success('Demo environment state restored to original records.');
  }

  logout() {
    this.toast.info('Signed out of staff session.');
    this.router.navigate(['/auth/login']);
  }
}
