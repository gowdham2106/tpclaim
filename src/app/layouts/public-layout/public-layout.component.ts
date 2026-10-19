import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ToastContainerComponent } from '../../shared/components/toast-container/toast-container.component';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent, ToastContainerComponent],
  template: `
    <div class="public-shell">
      <!-- Public Header -->
      <header class="public-header">
        <div class="header-container">
          <!-- Logo & Brand -->
          <a routerLink="/" class="brand-logo">
            <div class="logo-icon-box">
              <app-icon name="shield-check" [size]="24" class="logo-icon"></app-icon>
            </div>
            <div class="brand-text">
              <span class="brand-name">ClaimShield</span>
              <span class="brand-plus">PLUS</span>
            </div>
          </a>

          <!-- Navigation Links -->
          <nav class="public-nav" [class.mobile-open]="isMobileMenuOpen">
            <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="closeMobileMenu()">Home</a>
            <a routerLink="/public/intimation" routerLinkActive="active" (click)="closeMobileMenu()">Report an Accident</a>
            <a routerLink="/public/track-claim" routerLinkActive="active" (click)="closeMobileMenu()">Track a Claim</a>
            <a routerLink="/public/help" routerLinkActive="active" (click)="closeMobileMenu()">Help Centre</a>
            <div class="nav-divider"></div>
            <a routerLink="/auth/login" class="csp-btn csp-btn-secondary csp-btn-sm staff-portal-btn" (click)="closeMobileMenu()">
              <app-icon name="lock" [size]="14"></app-icon>
              Staff Portal
            </a>
          </nav>

          <!-- Mobile Menu Toggle Button -->
          <button class="mobile-toggle" (click)="toggleMobileMenu()" aria-label="Toggle navigation">
            <app-icon [name]="isMobileMenuOpen ? 'x' : 'menu'" [size]="22"></app-icon>
          </button>
        </div>
      </header>

      <!-- Main Content Outlet -->
      <main class="public-main">
        <router-outlet></router-outlet>
      </main>

      <!-- Public Footer -->
      <footer class="public-footer">
        <div class="footer-container">
          <div class="footer-grid">
            <div class="footer-col brand-col">
              <div class="brand-logo footer-logo">
                <div class="logo-icon-box">
                  <app-icon name="shield-check" [size]="22" class="logo-icon"></app-icon>
                </div>
                <div class="brand-text">
                  <span class="brand-name">ClaimShield</span>
                  <span class="brand-plus">PLUS</span>
                </div>
              </div>
              <p class="footer-desc">
                Dedicated third-party motor insurance claims resolution portal. Providing transparent, fair, and guided assistance from accident intimation to final settlement.
              </p>
              <div class="disclaimer-chip">
                <app-icon name="alert-circle" [size]="14"></app-icon>
                Demonstration prototype with simulated processes and fictional records.
              </div>
            </div>

            <div class="footer-col">
              <h4 class="footer-title">Claimant Journey</h4>
              <ul class="footer-links">
                <li><a routerLink="/public/intimation">Report New Accident</a></li>
                <li><a routerLink="/public/track-claim">Track Claim Status</a></li>
                <li><a routerLink="/public/document-upload">Submit Documents</a></li>
                <li><a routerLink="/public/claim-details/TP-2026-001842">Sample Claim View</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4 class="footer-title">Support & Info</h4>
              <ul class="footer-links">
                <li><a routerLink="/public/help">Frequently Asked Questions</a></li>
                <li><a routerLink="/public/help">Required Document Checklist</a></li>
                <li><a routerLink="/public/help">MACT Tribunal Guidance</a></li>
                <li><a routerLink="/auth/login">Internal Staff Login</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4 class="footer-title">Emergency Assistance</h4>
              <p class="footer-text">Need immediate help intimating an accident?</p>
              <div class="contact-pill">
                <app-icon name="phone" [size]="16" class="contact-icon"></app-icon>
                <span>1800-CSP-MOTOR (Demo)</span>
              </div>
              <div style="margin-top: 1rem;">
                <button (click)="onResetDemo()" class="csp-btn csp-btn-secondary csp-btn-sm reset-btn">
                  <app-icon name="refresh-cw" [size]="13"></app-icon>
                  Reset Demo State
                </button>
              </div>
            </div>
          </div>

          <div class="footer-bottom">
            <div>© 2026 ClaimShield Plus. All rights reserved. For demonstration and workflow simulation only.</div>
            <div class="bottom-links">
              <span>Warm Palette Compliance: Charcoal & Ember Theme</span>
            </div>
          </div>
        </div>
      </footer>

      <!-- Global Toasts -->
      <app-toast-container></app-toast-container>
    </div>
  `,
  styles: [`
    .public-shell {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--csp-bg-soft);
    }

    .public-header {
      background: var(--csp-white);
      border-bottom: 1px solid var(--csp-border);
      position: sticky;
      top: 0;
      z-index: 100;
      box-shadow: var(--csp-shadow-sm);
    }

    .header-container {
      max-width: 1240px;
      margin: 0 auto;
      padding: 0.85rem 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
    }

    .logo-icon-box {
      width: 40px;
      height: 40px;
      background: var(--csp-charcoal);
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--csp-ember);
      box-shadow: 0 2px 6px rgba(37, 35, 33, 0.2);
    }

    .brand-text {
      display: flex;
      align-items: baseline;
      gap: 0.35rem;
    }

    .brand-name {
      font-family: var(--csp-font-heading);
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      letter-spacing: -0.02em;
    }

    .brand-plus {
      font-family: var(--csp-font-heading);
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--csp-white);
      background-color: var(--csp-ember);
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }

    .public-nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .public-nav a {
      font-weight: 600;
      font-size: 0.92rem;
      color: var(--csp-warm-grey);
      transition: var(--csp-transition);
      position: relative;
    }

    .public-nav a:hover {
      color: var(--csp-charcoal);
    }

    .public-nav a.active {
      color: var(--csp-ember);
    }

    .nav-divider {
      width: 1px;
      height: 22px;
      background: var(--csp-border);
    }

    .mobile-toggle {
      display: none;
      background: none;
      border: none;
      color: var(--csp-charcoal);
      cursor: pointer;
      padding: 6px;
    }

    .public-main {
      flex: 1;
    }

    /* Footer Styles */
    .public-footer {
      background: var(--csp-charcoal);
      color: var(--csp-white);
      padding: 3.5rem 1.5rem 1.5rem;
      margin-top: 4rem;
      border-top: 3px solid var(--csp-ember);
    }

    .footer-container {
      max-width: 1240px;
      margin: 0 auto;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1.3fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-logo .brand-name {
      color: var(--csp-white);
    }

    .footer-desc {
      color: var(--csp-warm-grey-light);
      font-size: 0.88rem;
      line-height: 1.6;
      margin-top: 1rem;
      margin-bottom: 1.2rem;
    }

    .disclaimer-chip {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 0.4rem 0.75rem;
      border-radius: var(--csp-radius-sm);
      font-size: 0.78rem;
      color: var(--csp-clay);
    }

    .footer-title {
      font-size: 0.95rem;
      color: var(--csp-white);
      margin-bottom: 1.1rem;
      font-weight: 700;
    }

    .footer-links {
      list-style: none;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    .footer-links a {
      color: var(--csp-warm-grey-light);
      font-size: 0.88rem;
      transition: var(--csp-transition);
    }

    .footer-links a:hover {
      color: var(--csp-ember);
      transform: translateX(3px);
    }

    .footer-text {
      color: var(--csp-warm-grey-light);
      font-size: 0.88rem;
      margin-bottom: 0.75rem;
    }

    .contact-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      background: var(--csp-charcoal-light);
      padding: 0.6rem 1rem;
      border-radius: var(--csp-radius-sm);
      color: var(--csp-white);
      font-weight: 600;
      font-size: 0.9rem;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .contact-icon {
      color: var(--csp-ember);
    }

    .reset-btn {
      font-size: 0.8rem;
      padding: 0.4rem 0.8rem;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.8rem;
      color: var(--csp-warm-grey-light);
      flex-wrap: wrap;
      gap: 1rem;
    }

    @media (max-width: 900px) {
      .footer-grid {
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .mobile-toggle {
        display: block;
      }

      .public-nav {
        display: none;
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background: var(--csp-white);
        flex-direction: column;
        padding: 1.5rem;
        border-bottom: 1px solid var(--csp-border);
        box-shadow: var(--csp-shadow-md);
        gap: 1rem;
        align-items: flex-start;
      }

      .public-nav.mobile-open {
        display: flex;
      }

      .footer-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PublicLayoutComponent {
  isMobileMenuOpen = false;
  private mockDataService = inject(MockDataService);
  private toastService = inject(ToastService);

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  onResetDemo() {
    this.mockDataService.resetDemoData();
    this.toastService.success('Demo sample data has been reset to defaults.', 'Data Reset');
  }
}
