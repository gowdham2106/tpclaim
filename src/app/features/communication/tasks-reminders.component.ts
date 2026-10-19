import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { PriorityBadgeComponent } from '../../shared/components/priority-badge/priority-badge.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { TaskItem } from '../../core/models/task.model';

@Component({
  selector: 'app-tasks-reminders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, IconComponent, PriorityBadgeComponent, StatusBadgeComponent],
  template: `
    <div class="page-container">
      <!-- Page Header -->
      <div class="page-header">
        <div>
          <div class="breadcrumb-trail">
            <a routerLink="/ops/dashboard">Operations</a>
            <span class="sep">/</span>
            <span class="current">Tasks & Reminders</span>
          </div>
          <h1 class="page-title">Tasks & Reminders</h1>
          <p class="page-subtitle">Track operational action items, field visits, MACT tribunal deadlines, and settlement requisitions.</p>
        </div>
        <div class="header-actions">
          <button (click)="openCreateModal()" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="16"></app-icon>
            Create New Task
          </button>
        </div>
      </div>

      <!-- Quick Summary Row -->
      <div class="task-stats-row">
        <div class="t-stat-card">
          <div class="t-stat-icon charcoal">
            <app-icon name="clipboard-list" [size]="20"></app-icon>
          </div>
          <div class="t-stat-info">
            <div class="t-stat-val">{{ mockData.tasks().length }}</div>
            <div class="t-stat-lbl">Total Tasks</div>
          </div>
        </div>
        <div class="t-stat-card">
          <div class="t-stat-icon ember">
            <app-icon name="clock" [size]="20"></app-icon>
          </div>
          <div class="t-stat-info">
            <div class="t-stat-val">{{ pendingCount() }}</div>
            <div class="t-stat-lbl">Pending & In Progress</div>
          </div>
        </div>
        <div class="t-stat-card">
          <div class="t-stat-icon terracotta">
            <app-icon name="alert-triangle" [size]="20"></app-icon>
          </div>
          <div class="t-stat-info">
            <div class="t-stat-val">{{ overdueCount() }}</div>
            <div class="t-stat-lbl">Overdue Action Items</div>
          </div>
        </div>
        <div class="t-stat-card">
          <div class="t-stat-icon sage">
            <app-icon name="check-circle" [size]="20"></app-icon>
          </div>
          <div class="t-stat-info">
            <div class="t-stat-val">{{ completedCount() }}</div>
            <div class="t-stat-lbl">Completed Tasks</div>
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
            placeholder="Search tasks by title, claim ID, or assignee..." 
            class="csp-input search-input"
          />
        </div>
        
        <div class="filter-group">
          <label>Status:</label>
          <select [(ngModel)]="statusFilter" class="csp-select">
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Priority:</label>
          <select [(ngModel)]="priorityFilter" class="csp-select">
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div class="filter-group">
          <label>Assignee:</label>
          <select [(ngModel)]="assigneeFilter" class="csp-select">
            <option value="All">All Staff</option>
            <option *ngFor="let u of mockData.users()" [value]="u.name">{{ u.name }}</option>
          </select>
        </div>
      </div>

      <!-- Tasks List Table -->
      <div class="csp-card table-card">
        <div class="table-responsive">
          <table class="csp-table">
            <thead>
              <tr>
                <th style="width: 44px; text-align: center;">Done</th>
                <th>Task Details</th>
                <th>Claim Ref</th>
                <th>Category</th>
                <th>Assignee</th>
                <th>Due Date</th>
                <th>Priority</th>
                <th>Status</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of filteredTasks()" [class.task-done-row]="task.status === 'Completed'">
                <td style="text-align: center;">
                  <input 
                    type="checkbox" 
                    [checked]="task.status === 'Completed'" 
                    (change)="toggleDone(task)"
                    class="task-check"
                    title="Mark task as done"
                  />
                </td>
                <td>
                  <div class="task-cell-main">
                    <span class="task-title" [class.line-through]="task.status === 'Completed'">{{ task.title }}</span>
                    <span class="task-desc" *ngIf="task.description">{{ task.description }}</span>
                  </div>
                </td>
                <td>
                  <a [routerLink]="['/ops/claim-360', task.claimRef]" class="claim-link">
                    {{ task.claimRef }}
                  </a>
                </td>
                <td>
                  <span class="cat-chip">{{ task.category }}</span>
                </td>
                <td>
                  <div class="user-chip-sm">
                    <span class="avatar-init">{{ getInitials(task.assignedUser) }}</span>
                    <span>{{ task.assignedUser }}</span>
                  </div>
                </td>
                <td>
                  <div class="date-col" [class.is-overdue]="checkIsOverdue(task)">
                    <app-icon name="calendar" [size]="12"></app-icon>
                    <span>{{ task.dueDate }}</span>
                    <span *ngIf="checkIsOverdue(task)" class="overdue-tag">Overdue</span>
                  </div>
                </td>
                <td>
                  <app-priority-badge [priority]="task.priority"></app-priority-badge>
                </td>
                <td>
                  <app-status-badge [status]="task.status"></app-status-badge>
                </td>
                <td style="text-align: right;">
                  <div class="row-actions">
                    <button (click)="openEditModal(task)" class="btn-icon" title="Edit / Reassign Task">
                      <app-icon name="edit" [size]="14"></app-icon>
                    </button>
                    <button (click)="deleteTask(task)" class="btn-icon danger" title="Delete Task">
                      <app-icon name="trash" [size]="14"></app-icon>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="filteredTasks().length === 0">
                <td colspan="9" class="empty-row">
                  <div class="empty-state">
                    <app-icon name="calendar" [size]="36" class="empty-ico"></app-icon>
                    <h3>No tasks match your criteria</h3>
                    <p>Change your filter options or add a new operational task.</p>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Create / Edit Task Modal -->
      <div class="modal-backdrop" *ngIf="isModalOpen">
        <div class="modal-dialog">
          <div class="modal-header">
            <div class="modal-title-wrap">
              <div class="modal-icon-badge">
                <app-icon name="clipboard-list" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="modal-title">{{ isEditing ? 'Edit Task' : 'Create Operational Task' }}</h3>
                <p class="modal-subtitle">Assign deadlines and track follow-ups across claim workflow stages.</p>
              </div>
            </div>
            <button class="modal-close-btn" (click)="closeModal()">
              <app-icon name="x" [size]="18"></app-icon>
            </button>
          </div>

          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Task Title <span class="req">*</span></label>
              <input 
                type="text" 
                [(ngModel)]="activeTask.title" 
                placeholder="e.g. Conduct second physical site verification at Guindy junction" 
                class="csp-input w-full"
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Associated Claim <span class="req">*</span></label>
                <select [(ngModel)]="activeTask.claimRef" class="csp-select w-full">
                  <option value="">-- Select Claim --</option>
                  <option *ngFor="let c of mockData.claims()" [value]="c.id">
                    {{ c.id }} — {{ c.claimantName }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Task Category <span class="req">*</span></label>
                <select [(ngModel)]="activeTask.category" class="csp-select w-full">
                  <option value="Document Follow-up">Document Follow-up</option>
                  <option value="Investigation Visit">Investigation Visit</option>
                  <option value="Legal Notice">Legal Notice</option>
                  <option value="Assessment Review">Assessment Review</option>
                  <option value="Settlement Mandate">Settlement Mandate</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Assigned User <span class="req">*</span></label>
                <select [(ngModel)]="activeTask.assignedUser" class="csp-select w-full">
                  <option *ngFor="let u of mockData.users()" [value]="u.name">
                    {{ u.name }} ({{ u.role }})
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Due Date <span class="req">*</span></label>
                <input 
                  type="date" 
                  [(ngModel)]="activeTask.dueDate" 
                  class="csp-input w-full"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Priority <span class="req">*</span></label>
                <select [(ngModel)]="activeTask.priority" class="csp-select w-full">
                  <option value="Urgent">Urgent</option>
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Status</label>
                <select [(ngModel)]="activeTask.status" class="csp-select w-full">
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Description / Work Instructions</label>
              <textarea 
                rows="3" 
                [(ngModel)]="activeTask.description" 
                placeholder="Specific guidance, context, contact details, or background information..." 
                class="csp-textarea w-full"
              ></textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button (click)="closeModal()" class="csp-btn csp-btn-outline">Cancel</button>
            <button (click)="saveTask()" class="csp-btn csp-btn-primary">
              <app-icon name="check" [size]="15"></app-icon>
              {{ isEditing ? 'Save Changes' : 'Create Task' }}
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

    /* Task Stats */
    .task-stats-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .t-stat-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: var(--csp-shadow-sm);
    }
    .t-stat-icon {
      width: 44px;
      height: 44px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .t-stat-icon.charcoal { background: rgba(37, 35, 33, 0.08); color: var(--csp-charcoal); }
    .t-stat-icon.ember { background: rgba(232, 93, 50, 0.12); color: var(--csp-ember); }
    .t-stat-icon.terracotta { background: rgba(197, 106, 74, 0.12); color: var(--csp-terracotta); }
    .t-stat-icon.sage { background: rgba(85, 116, 95, 0.12); color: var(--csp-sage); }

    .t-stat-val {
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--csp-charcoal);
    }
    .t-stat-lbl {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      font-weight: 600;
    }

    /* Filter Toolbar */
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
      min-width: 250px;
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
    .task-check {
      width: 17px;
      height: 17px;
      cursor: pointer;
      accent-color: var(--csp-ember);
    }
    .task-cell-main {
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }
    .task-title {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--csp-charcoal);
    }
    .task-title.line-through {
      text-decoration: line-through;
      color: var(--csp-warm-grey);
    }
    .task-desc {
      font-size: 0.8rem;
      color: var(--csp-warm-grey);
      max-width: 320px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .task-done-row {
      background: rgba(85, 116, 95, 0.04);
      opacity: 0.85;
    }
    .claim-link {
      font-weight: 700;
      color: var(--csp-ember);
      text-decoration: none;
      font-family: monospace;
    }
    .claim-link:hover {
      text-decoration: underline;
    }
    .cat-chip {
      font-size: 0.75rem;
      padding: 2px 7px;
      border-radius: 12px;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      color: var(--csp-charcoal);
      white-space: nowrap;
    }
    .user-chip-sm {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      font-size: 0.84rem;
      color: var(--csp-charcoal);
      font-weight: 500;
    }
    .avatar-init {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--csp-clay);
      color: var(--csp-charcoal);
      font-size: 0.68rem;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .date-col {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.82rem;
      color: var(--csp-charcoal);
      white-space: nowrap;
    }
    .date-col.is-overdue {
      color: #B91C1C;
      font-weight: 700;
    }
    .overdue-tag {
      font-size: 0.68rem;
      background: #FEE2E2;
      color: #B91C1C;
      padding: 1px 5px;
      border-radius: 4px;
      font-weight: 700;
    }
    .row-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.35rem;
    }
    .btn-icon {
      background: none;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--csp-warm-grey);
      cursor: pointer;
      transition: all 0.15s;
    }
    .btn-icon:hover {
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
    }
    .btn-icon.danger:hover {
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
export class TasksRemindersComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  searchQuery = '';
  statusFilter = 'All';
  priorityFilter = 'All';
  assigneeFilter = 'All';

  // Modal
  isModalOpen = false;
  isEditing = false;
  activeTask: any = {
    id: '',
    claimRef: '',
    title: '',
    assignedUser: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Pending',
    description: '',
    category: 'Document Follow-up'
  };

  // Metrics
  pendingCount = computed(() => 
    this.mockData.tasks().filter(t => t.status === 'Pending' || t.status === 'In Progress').length
  );
  overdueCount = computed(() => 
    this.mockData.tasks().filter(t => this.checkIsOverdue(t)).length
  );
  completedCount = computed(() => 
    this.mockData.tasks().filter(t => t.status === 'Completed').length
  );

  filteredTasks = computed(() => {
    let list = this.mockData.tasks();
    if (this.statusFilter !== 'All') {
      list = list.filter(t => t.status === this.statusFilter);
    }
    if (this.priorityFilter !== 'All') {
      list = list.filter(t => t.priority === this.priorityFilter);
    }
    if (this.assigneeFilter !== 'All') {
      list = list.filter(t => t.assignedUser === this.assigneeFilter);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(t => 
        t.title.toLowerCase().includes(q) ||
        t.claimRef.toLowerCase().includes(q) ||
        t.assignedUser.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return list;
  });

  checkIsOverdue(task: TaskItem): boolean {
    if (task.status === 'Completed') return false;
    const due = new Date(task.dueDate);
    return due.getTime() < Date.now();
  }

  getInitials(name: string): string {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  toggleDone(task: TaskItem) {
    this.mockData.toggleTaskStatus(task.id);
    const next = task.status === 'Completed' ? 'Pending' : 'Completed';
    this.toast.showSuccess(
      `Task ${next === 'Completed' ? 'Completed' : 'Reopened'}`,
      `Task "${task.title}" updated to ${next}.`
    );
  }

  openCreateModal() {
    this.isEditing = false;
    this.activeTask = {
      id: '',
      claimRef: this.mockData.claims()[0]?.id || 'TP-2026-001842',
      title: '',
      assignedUser: this.mockData.currentUser().name,
      priority: 'Medium',
      dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      status: 'Pending',
      description: '',
      category: 'Document Follow-up'
    };
    this.isModalOpen = true;
  }

  openEditModal(task: TaskItem) {
    this.isEditing = true;
    this.activeTask = { ...task };
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  saveTask() {
    if (!this.activeTask.title || !this.activeTask.claimRef || !this.activeTask.dueDate) {
      this.toast.showError('Missing Information', 'Please provide a task title, claim ID, and due date.');
      return;
    }

    if (this.isEditing) {
      this.mockData.updateTask(this.activeTask);
      this.toast.showSuccess('Task Updated', `Task "${this.activeTask.title}" has been updated.`);
    } else {
      this.mockData.addTask({
        claimRef: this.activeTask.claimRef,
        title: this.activeTask.title,
        assignedUser: this.activeTask.assignedUser,
        priority: this.activeTask.priority,
        dueDate: this.activeTask.dueDate,
        status: this.activeTask.status,
        description: this.activeTask.description,
        category: this.activeTask.category
      });
      this.toast.showSuccess('Task Created', `New task assigned to ${this.activeTask.assignedUser}.`);
    }
    this.closeModal();
  }

  deleteTask(task: TaskItem) {
    if (confirm(`Are you sure you want to delete task "${task.title}"?`)) {
      this.mockData.deleteTask(task.id);
      this.toast.showSuccess('Task Removed', 'The task has been deleted.');
    }
  }
}
