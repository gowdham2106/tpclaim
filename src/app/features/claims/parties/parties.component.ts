import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { ClaimParty } from '../../../core/models/claim.model';

interface FlatParty extends ClaimParty {
  claimRef: string;
}

@Component({
  selector: 'app-parties',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent, StatusBadgeComponent],
  template: `
    <div class="parties-page">
      <div class="page-top-header">
        <div>
          <div class="page-eyebrow">Entities & Stakeholders</div>
          <h1 class="page-main-title">Claimant & Associated Parties Registry</h1>
          <p class="page-sub">Comprehensive roster of claimants, insured owners, drivers, eyewitnesses, and legal proxies.</p>
        </div>
        <div>
          <button (click)="openAddModal()" class="csp-btn csp-btn-primary">
            <app-icon name="plus" [size]="16"></app-icon>
            <span>Add Associated Party</span>
          </button>
        </div>
      </div>

      <!-- Toolbar -->
      <div class="csp-card toolbar-card">
        <div class="toolbar-flex">
          <div class="search-box">
            <app-icon name="search" [size]="16" class="s-icon"></app-icon>
            <input type="text" [(ngModel)]="searchQuery" placeholder="Search by name, phone, email, or role..." class="csp-input" style="padding-left:2.4rem;" />
          </div>
          <div class="filters-box">
            <select [(ngModel)]="roleFilter" class="csp-select" style="width:auto;">
              <option value="ALL">All Roles</option>
              <option value="Claimant">Claimant</option>
              <option value="Vehicle Owner">Vehicle Owner</option>
              <option value="Driver">Driver</option>
              <option value="Deceased">Deceased</option>
              <option value="Witness">Witness</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Parties Table -->
      <div class="csp-table-wrapper">
        <table class="csp-table">
          <thead>
            <tr>
              <th>Party Name</th>
              <th>Role in Claim</th>
              <th>Associated Claim</th>
              <th>Contact Details</th>
              <th>Residential / Business Address</th>
              <th>Verification Status</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let p of allParties">
              <td class="font-bold text-charcoal">
                <div style="display:flex; align-items:center; gap:0.5rem;">
                  <div class="avatar-circle">{{ getInitials(p.name) }}</div>
                  <div>{{ p.name }}</div>
                </div>
              </td>
              <td><span class="csp-badge csp-badge-ember">{{ p.role }}</span></td>
              <td>
                <a [routerLink]="['/ops/claim-360', p.claimRef]" class="claim-link font-mono font-bold">
                  {{ p.claimRef }}
                </a>
              </td>
              <td>
                <div style="font-weight: 600;">{{ p.phone }}</div>
                <div style="font-size: 0.76rem; color: var(--csp-warm-grey);">{{ p.email }}</div>
              </td>
              <td style="max-width: 240px; font-size: 0.84rem;">{{ p.address }}</td>
              <td>
                <span class="csp-badge" [ngClass]="p.isVerified ? 'csp-badge-sage' : 'csp-badge-clay'">
                  {{ p.isVerified ? 'Verified' : 'Pending Verification' }}
                </span>
              </td>
              <td style="text-align: right;">
                <button (click)="toggleVerify(p)" class="csp-btn csp-btn-secondary csp-btn-sm">
                  {{ p.isVerified ? 'Unmark' : 'Verify' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add Party Modal -->
      <div class="csp-modal-backdrop" *ngIf="isModalOpen" (click)="isModalOpen = false">
        <div class="csp-modal" (click)="$event.stopPropagation()">
          <div class="csp-card-header">
            <h3 style="margin:0; font-size:1.15rem;">Onboard New Associated Party</h3>
            <button (click)="isModalOpen = false" class="csp-btn csp-btn-secondary csp-btn-sm" style="border:none;">
              <app-icon name="x" [size]="16"></app-icon>
            </button>
          </div>
          <div class="csp-card-body">
            <div class="csp-form-group">
              <label class="csp-label">Associate to Claim</label>
              <select [(ngModel)]="newClaimRef" class="csp-select">
                <option *ngFor="let c of mockData.claims()" [value]="c.id || c.intimationRef">
                  {{ c.id || c.intimationRef }} ({{ c.claimantName }})
                </option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Party Full Name</label>
              <input type="text" [(ngModel)]="newName" placeholder="Full legal name" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Role in Occurrence</label>
              <select [(ngModel)]="newRole" class="csp-select">
                <option value="Injured Person">Injured Person</option>
                <option value="Vehicle Owner">Vehicle Owner</option>
                <option value="Driver">Driver</option>
                <option value="Property Owner">Property Owner</option>
                <option value="Legal Representative">Legal Representative</option>
                <option value="Witness">Witness</option>
              </select>
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Phone Number</label>
              <input type="tel" [(ngModel)]="newPhone" placeholder="+91 98400 12345" class="csp-input" />
            </div>
            <div class="csp-form-group">
              <label class="csp-label">Residential Address</label>
              <input type="text" [(ngModel)]="newAddress" placeholder="Street, City, State" class="csp-input" />
            </div>
          </div>
          <div class="csp-card-footer">
            <button (click)="isModalOpen = false" class="csp-btn csp-btn-secondary">Cancel</button>
            <button (click)="saveParty()" class="csp-btn csp-btn-primary">Add Party to Record</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .parties-page { display: flex; flex-direction: column; gap: 1.5rem; }
    .page-eyebrow { font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); letter-spacing: 0.05em; margin-bottom: 0.2rem; }
    .page-main-title { font-size: 1.8rem; font-weight: 800; color: var(--csp-charcoal); margin: 0; }
    .page-sub { color: var(--csp-warm-grey); font-size: 0.92rem; margin-top: 0.25rem; }

    .toolbar-card { padding: 1.25rem 1.5rem; }
    .toolbar-flex { display: flex; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
    .search-box { flex: 1; min-width: 280px; position: relative; }
    .s-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); }

    .avatar-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--csp-clay);
      color: var(--csp-charcoal);
      font-size: 0.72rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .claim-link { color: var(--csp-ember); text-decoration: none; }
    .claim-link:hover { text-decoration: underline; }
    .font-bold { font-weight: 700; }
    .font-mono { font-family: monospace; }
    .text-charcoal { color: var(--csp-charcoal); }
  `]
})
export class PartiesComponent {
  mockData = inject(MockDataService);
  private toast = inject(ToastService);

  searchQuery = '';
  roleFilter = 'ALL';

  isModalOpen = false;
  newClaimRef = 'TP-2026-001842';
  newName = '';
  newRole: any = 'Witness';
  newPhone = '';
  newAddress = '';

  get allParties(): FlatParty[] {
    const list: FlatParty[] = [];
    for (const c of this.mockData.claims()) {
      const ref = c.id || c.intimationRef;
      for (const p of c.parties) {
        list.push({ ...p, claimRef: ref });
      }
    }

    return list.filter(p => {
      const q = this.searchQuery.toLowerCase().trim();
      const matchesQ = !q || p.name.toLowerCase().includes(q) || p.phone.toLowerCase().includes(q) || p.claimRef.toLowerCase().includes(q);
      const matchesRole = this.roleFilter === 'ALL' || p.role === this.roleFilter;
      return matchesQ && matchesRole;
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  }

  toggleVerify(p: FlatParty) {
    p.isVerified = !p.isVerified;
    this.mockData.saveState();
    this.toast.success(`${p.name} marked as ${p.isVerified ? 'Verified' : 'Pending'}.`);
  }

  openAddModal() {
    this.newClaimRef = this.mockData.claims()[0]?.id || 'TP-2026-001842';
    this.newName = '';
    this.newRole = 'Witness';
    this.newPhone = '';
    this.newAddress = '';
    this.isModalOpen = true;
  }

  saveParty() {
    if (!this.newName.trim()) {
      this.toast.error('Please enter party name.');
      return;
    }
    this.mockData.addParty(this.newClaimRef, {
      name: this.newName,
      role: this.newRole,
      phone: this.newPhone,
      email: '',
      address: this.newAddress,
      isVerified: true
    });
    this.toast.success(`Added ${this.newRole}: ${this.newName} to claim records.`);
    this.isModalOpen = false;
  }
}
