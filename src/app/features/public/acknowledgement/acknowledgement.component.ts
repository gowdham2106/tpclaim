import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-acknowledgement',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="ack-page">
      <div class="ack-container">
        <!-- Compact 3-Stage Progress Timeline (All Completed) -->
        <div class="csp-stepper compact-stepper">
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">
              <span class="step-num">Step 1 of 3</span>
              <span class="step-name">Accident & Parties Data</span>
            </div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">
              <span class="step-num">Step 2 of 3</span>
              <span class="step-name">Document Upload</span>
            </div>
            <div class="csp-step-line filled"></div>
          </div>
          <div class="csp-step-item completed">
            <div class="csp-step-circle">✓</div>
            <div class="csp-step-label">
              <span class="step-num">Step 3 of 3</span>
              <span class="step-name">Review & Declaration</span>
            </div>
          </div>
        </div>

        <div class="csp-card ack-card">
          <!-- Step 4 Pill -->
          <div class="step-4-badge">
            <span class="step-pill">Step 4: Confirmation & Receipt</span>
          </div>

          <!-- Success Graphic Badge -->
          <div class="ack-badge-box">
            <app-icon name="check" [size]="36" class="check-icon"></app-icon>
          </div>

          <h1 class="ack-title">Accident Intimation Received</h1>
          <p class="ack-subtitle">
            Your third-party motor accident report has been officially registered in the ClaimShield Plus intake portal.
          </p>

          <!-- Reference Number Highlight Box -->
          <div class="reference-banner">
            <div class="ref-label">Your Intimation Reference Number</div>
            <div class="ref-number">{{ intimationRef }}</div>
            <div class="ref-meta">
              <span>Submitted: {{ submissionTimestamp }}</span>
              <span class="meta-dot">•</span>
              <span>Intake Hub: South Zonal TP Operations</span>
            </div>
          </div>

          <!-- Important Disclaimer Alert Box -->
          <div class="legal-notice-box">
            <app-icon name="alert-circle" [size]="20" class="alert-icon"></app-icon>
            <div class="notice-text">
              <strong>Notice of Statutory Non-Admission:</strong>
              Submission of this intimation creates an official inquiry file and does not constitute acceptance of liability, approval of claim, or a guarantee of financial compensation. Entitlement is subject to policy verification, evidence review, and statutory motor accident tribunal guidelines.
            </div>
          </div>

          <!-- What Happens Next? Timeline Cards -->
          <div class="next-steps-section">
            <h3 class="steps-heading">What Happens Next?</h3>
            <div class="steps-grid">
              <div class="step-card">
                <div class="step-circle">1</div>
                <div class="step-card-content">
                  <h4 class="step-card-title">Policy & FIR Verification</h4>
                  <p class="step-card-desc">
                    Our intake officers verify insurance cover on Parivahan Sarathi and authenticate FIR particulars (within 24-48 business hours).
                  </p>
                </div>
              </div>

              <div class="step-card">
                <div class="step-circle">2</div>
                <div class="step-card-content">
                  <h4 class="step-card-title">Handler Assignment & Claim ID</h4>
                  <p class="step-card-desc">
                    A dedicated claims handler is assigned and converts this intimation into an active claim file (e.g. TP-2026-XXXXXX).
                  </p>
                </div>
              </div>

              <div class="step-card">
                <div class="step-circle">3</div>
                <div class="step-card-content">
                  <h4 class="step-card-title">Evidence Review & Direct Assessment</h4>
                  <p class="step-card-desc">
                    Medical bills, loss of income records, or property repair estimates are reviewed for fair settlement or tribunal representation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="ack-actions">
            <a [routerLink]="['/public/track-claim']" [queryParams]="{ ref: intimationRef }" class="csp-btn csp-btn-primary csp-btn-lg">
              <app-icon name="search" [size]="16"></app-icon>
              <span>Track this Claim</span>
            </a>
            <a [routerLink]="['/public/claim-details', intimationRef]" class="csp-btn csp-btn-secondary csp-btn-lg">
              <app-icon name="eye" [size]="16"></app-icon>
              <span>View Submitted Summary</span>
            </a>
            <a routerLink="/" class="csp-btn csp-btn-secondary csp-btn-lg">
              <span>Return to Home</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ack-page {
      padding: 2.5rem 1rem 4.5rem;
      background: var(--csp-bg-soft);
      min-height: calc(100vh - 200px);
    }

    .ack-container {
      max-width: 860px;
      margin: 0 auto;
    }

    /* 3-Stage Stepper */
    .compact-stepper {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      position: relative;
    }
    .csp-step-item {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      position: relative;
      flex: 1;
    }
    .csp-step-item:last-child {
      flex: 0 0 auto;
    }
    .csp-step-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--csp-ivory);
      border: 2px solid var(--csp-border);
      color: var(--csp-warm-grey);
      font-weight: 800;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      z-index: 2;
    }
    .csp-step-item.completed .csp-step-circle {
      background: var(--csp-sage);
      border-color: var(--csp-sage);
      color: var(--csp-white);
    }
    .csp-step-label {
      display: flex;
      flex-direction: column;
    }
    .step-num {
      font-size: 0.68rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.05em;
      color: var(--csp-warm-grey);
    }
    .step-name {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .csp-step-line {
      flex: 1;
      height: 2px;
      background: var(--csp-border);
      margin: 0 0.85rem;
    }
    .csp-step-line.filled {
      background: var(--csp-sage);
    }

    .step-4-badge {
      margin-bottom: 1.25rem;
    }
    .step-pill {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--csp-sage);
      background: rgba(85, 116, 95, 0.12);
      padding: 3px 12px;
      border-radius: var(--csp-radius-pill);
      display: inline-block;
      border: 1px solid rgba(85, 116, 95, 0.25);
    }

    .ack-card {
      padding: 2.75rem 2.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--csp-white);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-sm);
      border: 1px solid var(--csp-border);
    }

    .ack-badge-box {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: var(--csp-sage-subtle);
      border: 3px solid var(--csp-sage);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      animation: popIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .check-icon {
      color: var(--csp-sage);
    }

    @keyframes popIn {
      0% { transform: scale(0.6); opacity: 0; }
      100% { transform: scale(1); opacity: 1; }
    }

    .ack-title {
      font-size: 2.1rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin-bottom: 0.6rem;
    }

    .ack-subtitle {
      color: var(--csp-warm-grey);
      font-size: 1rem;
      max-width: 580px;
      line-height: 1.6;
      margin-bottom: 2rem;
    }

    .reference-banner {
      width: 100%;
      background: var(--csp-ivory);
      border: 2px dashed var(--csp-clay-dark);
      border-radius: var(--csp-radius-md);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .ref-label {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--csp-warm-grey);
      margin-bottom: 0.35rem;
    }

    .ref-number {
      font-family: var(--csp-font-heading);
      font-size: 2rem;
      font-weight: 800;
      color: var(--csp-ember);
      letter-spacing: 0.03em;
    }

    .ref-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      font-size: 0.82rem;
      color: var(--csp-warm-grey);
      margin-top: 0.4rem;
    }

    .legal-notice-box {
      display: flex;
      align-items: flex-start;
      gap: 0.85rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.25rem;
      text-align: left;
      margin-bottom: 2.5rem;
      box-shadow: var(--csp-shadow-sm);
    }

    .alert-icon {
      color: var(--csp-terracotta);
      flex-shrink: 0;
      margin-top: 2px;
    }

    .notice-text {
      font-size: 0.84rem;
      line-height: 1.6;
      color: var(--csp-warm-grey);
    }

    .steps-heading {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 1.25rem;
      text-align: left;
    }

    .steps-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
      text-align: left;
      margin-bottom: 2.5rem;
    }

    .step-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      background: var(--csp-bg-soft);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 1rem 1.25rem;
    }

    .step-circle {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: var(--csp-charcoal);
      color: var(--csp-white);
      font-weight: 700;
      font-size: 0.82rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .step-card-title {
      font-size: 0.95rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin: 0 0 0.25rem;
    }

    .step-card-desc {
      font-size: 0.85rem;
      color: var(--csp-warm-grey);
      margin: 0;
      line-height: 1.5;
    }

    .ack-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
      width: 100%;
    }

    @media (max-width: 600px) {
      .ack-card { padding: 1.75rem 1.25rem; }
      .ref-number { font-size: 1.6rem; }
      .ack-actions { flex-direction: column; }
      .ack-actions a { width: 100%; }
    }
  `]
})
export class AcknowledgementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mockData = inject(MockDataService);

  intimationRef = 'INT-2026-000184';
  submissionTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['ref']) {
        this.intimationRef = params['ref'];
      }
    });
  }
}
