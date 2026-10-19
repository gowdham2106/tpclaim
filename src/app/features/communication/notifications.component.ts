import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { NotificationItem } from '../../core/models/task.model';

@Component({
  selector: 'app-notifications',
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
            <span class="current">Notifications & Alerts</span>
          </div>
          <h1 class="page-title">Operations Notifications</h1>
          <p class="page-subtitle">Real-time alerts for intimations, document uploads, tribunal hearings, approvals, and stage updates.</p>
        </div>
        <div class="header-actions">
          <button (click)="markAllAsRead()" class="csp-btn csp-btn-outline" [disabled]="unreadCount() === 0">
            <app-icon name="check-circle" [size]="15"></app-icon>
            Mark All as Read
          </button>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="notif-metrics">
        <div class="metric-box">
          <div class="m-val">{{ mockData.notifications().length }}</div>
          <div class="m-lbl">Total Alerts</div>
        </div>
        <div class="metric-box alert-box">
          <div class="m-val">{{ unreadCount() }}</div>
          <div class="m-lbl">Unread Notifications</div>
        </div>
        <div class="metric-box priority-box">
          <div class="m-val">{{ highPriorityCount() }}</div>
          <div class="m-lbl">High Priority / Urgent</div>
        </div>
      </div>

      <!-- Category Filter Pills & Search -->
      <div class="csp-card filter-card">
        <div class="category-tabs">
          <button 
            *ngFor="let tab of categories" 
            (click)="selectedCategory = tab.id"
            [class.active]="selectedCategory === tab.id"
            class="tab-btn"
          >
            {{ tab.label }}
            <span class="tab-count" *ngIf="tab.count > 0">{{ tab.count }}</span>
          </button>
        </div>

        <div class="search-filter-row">
          <div class="search-box">
            <app-icon name="search" [size]="16" class="search-ico"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search notifications by claim ID, text, or title..." 
              class="csp-input search-input"
            />
          </div>
          <div class="status-toggle">
            <label>
              <input type="checkbox" [(ngModel)]="onlyUnread" />
              <span>Show only unread</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Notifications List -->
      <div class="notifs-list">
        <div 
          *ngFor="let notif of filteredNotifications()" 
          class="notif-card" 
          [class.unread]="!notif.isRead"
          [class.urgent]="notif.priority === 'High'"
        >
          <div class="notif-icon-col" [ngClass]="getCategoryClass(notif.category)">
            <app-icon [name]="getCategoryIcon(notif.category)" [size]="20"></app-icon>
          </div>

          <div class="notif-content-col">
            <div class="notif-header-line">
              <div class="notif-title-wrap">
                <span class="category-tag">{{ notif.category }}</span>
                <span *ngIf="notif.priority === 'High'" class="urgent-tag">High Priority</span>
                <h4 class="notif-title">{{ notif.title }}</h4>
              </div>
              <div class="notif-time">{{ notif.timestamp }}</div>
            </div>

            <p class="notif-desc">{{ notif.message }}</p>

            <div class="notif-footer-line">
              <div class="claim-chip" *ngIf="notif.claimRef">
                <span class="chip-label">Claim:</span>
                <span class="chip-val">{{ notif.claimRef }}</span>
              </div>

              <div class="notif-actions">
                <button 
                  (click)="toggleReadStatus(notif)" 
                  class="action-link"
                  title="Toggle read status"
                >
                  <app-icon [name]="notif.isRead ? 'eye-off' : 'check'" [size]="14"></app-icon>
                  {{ notif.isRead ? 'Mark as Unread' : 'Mark as Read' }}
                </button>

                <button 
                  (click)="navigateToClaim(notif)" 
                  class="action-btn-primary"
                >
                  View Details
                  <app-icon name="arrow-right" [size]="13"></app-icon>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div *ngIf="filteredNotifications().length === 0" class="csp-card empty-card">
          <app-icon name="bell" [size]="40" class="empty-ico"></app-icon>
          <h3>No notifications found</h3>
          <p>You have cleared all alerts or none match the selected filter.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1200px;
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

    /* Metrics */
    .notif-metrics {
      display: flex;
      gap: 1rem;
      margin-bottom: 1.25rem;
    }
    .metric-box {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1rem 1.5rem;
      flex: 1;
      box-shadow: var(--csp-shadow-sm);
    }
    .metric-box.alert-box {
      border-left: 4px solid var(--csp-ember);
    }
    .metric-box.priority-box {
      border-left: 4px solid var(--csp-terracotta);
    }
    .m-val {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--csp-charcoal);
    }
    .m-lbl {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    /* Filter Card */
    .filter-card {
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .category-tabs {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      border-bottom: 1px solid var(--csp-border);
      padding-bottom: 0.75rem;
    }
    .tab-btn {
      background: none;
      border: 1px solid transparent;
      padding: 0.4rem 0.85rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--csp-warm-grey-dark);
      border-radius: 20px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.4rem;
      transition: all 0.15s;
    }
    .tab-btn:hover {
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
    }
    .tab-btn.active {
      background: var(--csp-charcoal);
      color: var(--csp-white);
    }
    .tab-count {
      font-size: 0.72rem;
      background: rgba(255, 255, 255, 0.2);
      padding: 1px 6px;
      border-radius: 10px;
    }
    .tab-btn:not(.active) .tab-count {
      background: var(--csp-border);
      color: var(--csp-charcoal);
    }
    .search-filter-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
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
    .status-toggle label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--csp-charcoal);
      cursor: pointer;
    }

    /* List of Cards */
    .notifs-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .notif-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      display: flex;
      gap: 1.25rem;
      transition: all 0.2s ease;
      box-shadow: var(--csp-shadow-sm);
    }
    .notif-card:hover {
      box-shadow: var(--csp-shadow-md);
      border-color: var(--csp-warm-grey-light);
    }
    .notif-card.unread {
      background: #FFFDFB;
      border-left: 4px solid var(--csp-ember);
    }
    .notif-card.urgent {
      background: #FFFBF9;
      border-left: 4px solid var(--csp-terracotta);
    }

    .notif-icon-col {
      width: 44px;
      height: 44px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .notif-icon-col.intimation { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .notif-icon-col.document { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .notif-icon-col.investigation { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }
    .notif-icon-col.legal { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }
    .notif-icon-col.approval { background: rgba(232, 93, 50, 0.15); color: var(--csp-ember); }
    .notif-icon-col.settlement { background: rgba(85, 116, 95, 0.15); color: var(--csp-sage); }
    .notif-icon-col.task { background: rgba(117, 109, 101, 0.12); color: var(--csp-warm-grey); }

    .notif-content-col {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .notif-header-line {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .notif-title-wrap {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .category-tag {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
      border: 1px solid var(--csp-border);
      padding: 2px 7px;
      border-radius: 4px;
    }
    .urgent-tag {
      font-size: 0.72rem;
      font-weight: 700;
      background: rgba(232, 93, 50, 0.15);
      color: var(--csp-ember);
      border: 1px solid rgba(232, 93, 50, 0.3);
      padding: 2px 7px;
      border-radius: 4px;
    }
    .notif-title {
      font-size: 0.96rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .notif-time {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
      white-space: nowrap;
    }
    .notif-desc {
      font-size: 0.86rem;
      color: var(--csp-warm-grey-dark);
      margin: 0;
      line-height: 1.45;
    }

    .notif-footer-line {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid var(--csp-border-light);
    }
    .claim-chip {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
      display: flex;
      align-items: center;
      gap: 0.35rem;
    }
    .chip-val {
      font-weight: 700;
      color: var(--csp-charcoal);
      font-family: monospace;
    }
    .notif-actions {
      display: flex;
      align-items: center;
      gap: 0.85rem;
    }
    .action-link {
      background: none;
      border: none;
      color: var(--csp-warm-grey);
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: color 0.15s;
    }
    .action-link:hover {
      color: var(--csp-charcoal);
    }
    .action-btn-primary {
      background: var(--csp-charcoal);
      color: var(--csp-white);
      border: none;
      padding: 0.35rem 0.75rem;
      border-radius: var(--csp-radius-sm);
      font-size: 0.78rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.35rem;
      transition: background 0.15s;
    }
    .action-btn-primary:hover {
      background: var(--csp-ember);
    }

    .empty-card {
      text-align: center;
      padding: 3rem 1.5rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      color: var(--csp-warm-grey);
    }
    .empty-ico {
      color: var(--csp-clay);
    }
  `]
})
export class NotificationsComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);
  router = inject(Router);

  selectedCategory = 'All';
  searchQuery = '';
  onlyUnread = false;

  unreadCount = computed(() => 
    this.mockData.notifications().filter(n => !n.isRead).length
  );
  highPriorityCount = computed(() => 
    this.mockData.notifications().filter(n => n.priority === 'High').length
  );

  categories = [
    { id: 'All', label: 'All Alerts', count: 0 },
    { id: 'Intimation', label: 'Intimations', count: 0 },
    { id: 'Document', label: 'Documents', count: 0 },
    { id: 'Investigation', label: 'Investigation', count: 0 },
    { id: 'Legal', label: 'Legal / MACT', count: 0 },
    { id: 'Approval', label: 'Approvals', count: 0 },
    { id: 'Settlement', label: 'Settlements', count: 0 },
    { id: 'Task', label: 'Tasks', count: 0 },
  ];

  filteredNotifications = computed(() => {
    let list = this.mockData.notifications();
    if (this.selectedCategory !== 'All') {
      list = list.filter(n => n.category === this.selectedCategory);
    }
    if (this.onlyUnread) {
      list = list.filter(n => !n.isRead);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(n => 
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.claimRef.toLowerCase().includes(q)
      );
    }
    return list;
  });

  getCategoryIcon(cat: string): string {
    switch (cat) {
      case 'Intimation': return 'file-text';
      case 'Document': return 'files';
      case 'Investigation': return 'search';
      case 'Legal': return 'scale';
      case 'Approval': return 'check-circle';
      case 'Settlement': return 'credit-card';
      case 'Task': return 'calendar';
      default: return 'bell';
    }
  }

  getCategoryClass(cat: string): string {
    return cat.toLowerCase();
  }

  toggleReadStatus(notif: NotificationItem) {
    if (notif.isRead) {
      this.mockData.notifications.update(list => 
        list.map(n => n.id === notif.id ? { ...n, isRead: false } : n)
      );
      this.mockData.saveState();
    } else {
      this.mockData.markNotificationRead(notif.id);
    }
  }

  markAllAsRead() {
    this.mockData.markAllNotificationsRead();
    this.toast.showSuccess('All Notifications Read', 'All pending operations alerts have been marked as read.');
  }

  navigateToClaim(notif: NotificationItem) {
    this.mockData.markNotificationRead(notif.id);
    if (notif.actionRoute) {
      this.router.navigateByUrl(notif.actionRoute);
    } else if (notif.claimRef) {
      this.router.navigate(['/ops/claim-360', notif.claimRef]);
    }
  }
}
