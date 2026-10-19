import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';
import { StaffRole } from '../../../core/models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="login-wrapper">
      <div class="login-split-card">
        <!-- Left Side: Visual Branding & Value Prop -->
        <div class="login-visual-panel">
          <div class="visual-header">
            <a routerLink="/" class="brand-link">
              <div class="logo-box">
                <app-icon name="shield-check" [size]="24"></app-icon>
              </div>
              <div class="brand-text">
                <span class="brand-name">ClaimShield</span>
                <span class="brand-plus">PLUS</span>
              </div>
            </a>
          </div>

          <div class="visual-content">
            <h2 class="panel-headline">Motor TP Claims Operations Hub</h2>
            <p class="panel-sub">
              Unified enterprise platform for claims handlers, independent investigators, legal counsel, risk approvers, and settlement officers.
            </p>

            <div class="feature-bullets">
              <div class="bullet-item">
                <app-icon name="check-circle" [size]="16" class="bullet-icon"></app-icon>
                <span>Automated Parivahan & FIR Reconciliation</span>
              </div>
              <div class="bullet-item">
                <app-icon name="check-circle" [size]="16" class="bullet-icon"></app-icon>
                <span>Section 166 & Lok Adalat Legal Management</span>
              </div>
              <div class="bullet-item">
                <app-icon name="check-circle" [size]="16" class="bullet-icon"></app-icon>
                <span>Direct Electronic Settlement (NEFT / RTGS)</span>
              </div>
              <div class="bullet-item">
                <app-icon name="check-circle" [size]="16" class="bullet-icon"></app-icon>
                <span>Full Audit Trail & 360 Workspace</span>
              </div>
            </div>
          </div>

          <div class="visual-footer">
            <div class="disclaimer-text">
              Demonstration Environment • Strictly non-blue theme adherence • Simulated operations
            </div>
          </div>
        </div>

        <!-- Right Side: Login Form & One-Click Role Testing -->
        <div class="login-form-panel">
          <div class="form-header">
            <h1 class="form-title">Staff Portal Sign In</h1>
            <p class="form-subtitle">Enter your internal credentials or use quick-demo test roles below.</p>
          </div>

          <form (ngSubmit)="onLogin()" class="login-form">
            <div class="csp-form-group">
              <label class="csp-label">Internal Email Address</label>
              <div class="input-with-icon">
                <app-icon name="mail" [size]="16" class="field-icon"></app-icon>
                <input 
                  type="email" 
                  [(ngModel)]="email" 
                  name="email"
                  class="csp-input with-left-icon" 
                  required
                />
              </div>
            </div>

            <div class="csp-form-group">
              <div class="label-row">
                <label class="csp-label" style="margin-bottom:0;">Password</label>
                <a href="javascript:void(0)" (click)="forgotPassword()" class="forgot-link">Forgot Password?</a>
              </div>
              <div class="input-with-icon">
                <app-icon name="lock" [size]="16" class="field-icon"></app-icon>
                <input 
                  [type]="showPassword ? 'text' : 'password'" 
                  [(ngModel)]="password" 
                  name="password"
                  class="csp-input with-left-icon with-right-icon" 
                  required
                />
                <button type="button" (click)="showPassword = !showPassword" class="field-toggle-btn" title="Toggle visibility">
                  <app-icon [name]="showPassword ? 'x' : 'eye'" [size]="16"></app-icon>
                </button>
              </div>
            </div>

            <div class="checkbox-row">
              <label class="remember-label">
                <input type="checkbox" [(ngModel)]="rememberMe" name="rememberMe" />
                <span>Remember this terminal</span>
              </label>
            </div>

            <button type="submit" class="csp-btn csp-btn-primary csp-btn-lg submit-btn">
              <span>Sign In to Operations Workspace</span>
              <app-icon name="arrow-right" [size]="16"></app-icon>
            </button>
          </form>

          <!-- Quick Demo Role Switcher Bar -->
          <div class="demo-login-box">
            <div class="demo-box-label">
              <app-icon name="user" [size]="14"></app-icon>
              <span>Instant Demonstration Profiles (Click to login as):</span>
            </div>
            <div class="demo-roles-grid">
              <button 
                *ngFor="let role of demoRoles" 
                (click)="quickLoginAs(role)"
                class="role-test-btn"
                [class.active]="selectedRoleName === role.role"
              >
                <div class="role-btn-title">{{ role.role }}</div>
                <div class="role-btn-name">{{ role.name }}</div>
              </button>
            </div>
          </div>

          <div class="panel-bottom-link">
            <a routerLink="/" class="return-public-link">
              <app-icon name="arrow-left" [size]="14"></app-icon>
              <span>Return to Public Claimant Portal</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--csp-ivory);
      padding: 2rem 1rem;
    }

    .login-split-card {
      width: 100%;
      max-width: 1040px;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-xl);
      box-shadow: var(--csp-shadow-lg);
      display: grid;
      grid-template-columns: 1fr 1.2fr;
      overflow: hidden;
      min-height: 640px;
    }

    /* Left Panel */
    .login-visual-panel {
      background: var(--csp-charcoal);
      color: var(--csp-white);
      padding: 3rem 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      position: relative;
    }

    .brand-link { display: flex; align-items: center; gap: 0.75rem; text-decoration: none; }
    .logo-box {
      width: 40px;
      height: 40px;
      background: var(--csp-ember);
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--csp-white);
    }

    .brand-name { font-size: 1.3rem; font-weight: 800; color: var(--csp-white); }
    .brand-plus {
      font-size: 0.75rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      background: var(--csp-clay);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 0.25rem;
    }

    .panel-headline {
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--csp-white);
      margin-bottom: 1rem;
      line-height: 1.25;
    }

    .panel-sub {
      color: var(--csp-warm-grey-light);
      font-size: 0.95rem;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .feature-bullets { display: flex; flex-direction: column; gap: 0.85rem; }
    .bullet-item { display: flex; align-items: center; gap: 0.6rem; font-size: 0.88rem; color: #E5DDD3; }
    .bullet-icon { color: var(--csp-sage); flex-shrink: 0; }

    .disclaimer-text {
      font-size: 0.76rem;
      color: var(--csp-warm-grey-light);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.25rem;
    }

    /* Right Panel */
    .login-form-panel {
      padding: 3rem 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .form-header { margin-bottom: 1.75rem; }
    .form-title { font-size: 1.75rem; font-weight: 800; color: var(--csp-charcoal); margin: 0 0 0.35rem; }
    .form-subtitle { color: var(--csp-warm-grey); font-size: 0.9rem; }

    .input-with-icon { position: relative; }
    .field-icon { position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); pointer-events: none; }
    .with-left-icon { padding-left: 2.5rem !important; }
    .with-right-icon { padding-right: 2.5rem !important; }

    .field-toggle-btn {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: var(--csp-warm-grey);
      cursor: pointer;
      padding: 4px;
    }

    .label-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
    .forgot-link { font-size: 0.78rem; font-weight: 600; color: var(--csp-ember); }

    .checkbox-row { margin-bottom: 1.5rem; }
    .remember-label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; color: var(--csp-charcoal); cursor: pointer; }
    .remember-label input { accent-color: var(--csp-ember); }

    .submit-btn { width: 100%; margin-bottom: 2rem; }

    /* Demo Login Box */
    .demo-login-box {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.15rem;
      margin-bottom: 1.5rem;
    }

    .demo-box-label {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.76rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 0.75rem;
    }

    .demo-roles-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .role-test-btn {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.5rem 0.6rem;
      text-align: left;
      cursor: pointer;
      transition: var(--csp-transition);
    }
    .role-test-btn:hover {
      border-color: var(--csp-ember);
      background: var(--csp-bg-soft);
    }
    .role-test-btn.active {
      border-color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.08);
    }

    .role-btn-title { font-size: 0.76rem; font-weight: 700; color: var(--csp-charcoal); }
    .role-btn-name { font-size: 0.7rem; color: var(--csp-warm-grey); }

    .panel-bottom-link { text-align: center; }
    .return-public-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--csp-warm-grey);
    }
    .return-public-link:hover { color: var(--csp-ember); }

    @media (max-width: 900px) {
      .login-split-card { grid-template-columns: 1fr; }
      .login-visual-panel { display: none; }
      .login-form-panel { padding: 2rem; }
      .demo-roles-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class LoginComponent {
  private mockData = inject(MockDataService);
  private toast = inject(ToastService);
  private router = inject(Router);

  email = 'ananya.raman@claimshieldplus.internal';
  password = '••••••••••••';
  showPassword = false;
  rememberMe = true;
  selectedRoleName: StaffRole = 'Claim Handler';

  demoRoles = [
    { role: 'Claim Handler' as StaffRole, name: 'Ananya Raman', email: 'ananya.raman@claimshieldplus.internal' },
    { role: 'Investigator' as StaffRole, name: 'Dinesh Balan', email: 'dinesh.balan@claimshieldplus.internal' },
    { role: 'Legal Officer' as StaffRole, name: 'Adv. Meenakshi S.', email: 'meenakshi.legal@claimshieldplus.internal' },
    { role: 'Approver' as StaffRole, name: 'Manoj Vasudevan', email: 'manoj.vasudevan@claimshieldplus.internal' },
    { role: 'Settlement / Finance Officer' as StaffRole, name: 'Pooja Bhatt', email: 'pooja.bhatt@claimshieldplus.internal' },
    { role: 'Administrator' as StaffRole, name: 'Vikramaditya Rao', email: 'admin@claimshieldplus.internal' }
  ];

  quickLoginAs(profile: any) {
    this.email = profile.email;
    this.selectedRoleName = profile.role;
    const user = this.mockData.users().find(u => u.role === profile.role);
    if (user) {
      this.mockData.currentUser.set(user);
    }
    this.toast.success(`Active profile switched to ${profile.role} (${profile.name})`);
  }

  onLogin() {
    const user = this.mockData.users().find(u => u.email.toLowerCase() === this.email.toLowerCase()) || this.mockData.users()[0];
    this.mockData.currentUser.set(user);
    this.toast.success(`Welcome back, ${user.name}! Connected as ${user.role}.`, 'Staff Authenticated');
    this.router.navigate(['/ops/dashboard']);
  }

  forgotPassword() {
    this.toast.info('In demonstration mode, select any test profile above to sign in without password reset.');
  }
}
