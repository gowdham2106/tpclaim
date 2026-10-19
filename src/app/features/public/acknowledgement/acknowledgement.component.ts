import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MockDataService } from '../../../core/services/mock-data.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-acknowledgement',
  standalone: true,
  imports: [CommonModule, RouterModule, IconComponent],
  template: `
    <div class="ack-page">
      <div class="ack-container">
        <!-- Symmetrical 3-Stage Progress Timeline (All 3 Completed) -->
        <div class="stepper-grid">
          <div class="step-card completed">
            <div class="step-badge">✓</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 1 of 3</span>
              <span class="step-title">Accident & Parties Data</span>
            </div>
          </div>
          <div class="step-card completed">
            <div class="step-badge">✓</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 2 of 3</span>
              <span class="step-title">Document Upload</span>
            </div>
          </div>
          <div class="step-card completed">
            <div class="step-badge">✓</div>
            <div class="step-text-col">
              <span class="step-kicker">Step 3 of 3</span>
              <span class="step-title">Review & Declaration</span>
            </div>
          </div>
        </div>

        <div class="csp-card ack-card">
          <!-- Step 4 Pill -->
          <div class="step-4-badge">
            <span class="step-pill">Stage 4: Intake Confirmed & Registered</span>
          </div>

          <!-- Success Icon Graphic -->
          <div class="ack-badge-box">
            <app-icon name="check" [size]="32" class="check-icon"></app-icon>
          </div>

          <h1 class="ack-title">Accident Intimation Confirmed</h1>
          <p class="ack-subtitle">
            Your third-party motor insurance intimation has been officially recorded in the ClaimShield Plus claims registry.
          </p>

          <!-- Reference Number Highlight Box -->
          <div class="reference-banner">
            <div class="ref-label">Official Intimation Reference Number</div>
            <div class="ref-number-row">
              <span class="ref-number">{{ intimationRef }}</span>
              <button type="button" (click)="copyReference()" class="copy-btn" title="Copy Reference to Clipboard">
                <app-icon [name]="isCopied ? 'check' : 'copy'" [size]="14"></app-icon>
                <span>{{ isCopied ? 'Copied' : 'Copy' }}</span>
              </button>
            </div>
            <div class="ref-meta">
              <span class="meta-item">
                <app-icon name="calendar" [size]="13"></app-icon>
                <span>Submitted: {{ submissionTimestamp }}</span>
              </span>
              <span class="meta-dot">•</span>
              <span class="meta-item">
                <app-icon name="map-pin" [size]="13"></app-icon>
                <span>Intake Hub: South Zonal TP Operations</span>
              </span>
              <span class="meta-dot">•</span>
              <span class="meta-item">
                <app-icon name="clock" [size]="13"></app-icon>
                <span>Initial Verification SLA: 24–48h</span>
              </span>
            </div>
          </div>

          <!-- Important Statutory Legal Notice Box -->
          <div class="legal-notice-box">
            <app-icon name="alert-circle" [size]="18" class="alert-icon"></app-icon>
            <div class="notice-text">
              <strong>Notice of Statutory Non-Admission:</strong>
              Submission of this intimation creates an official inquiry file and does not constitute acceptance of liability, approval of claim, or a guarantee of financial compensation. Final settlement is determined following policy validation, field investigation, and motor accident claims tribunal guidelines.
            </div>
          </div>

          <!-- What Happens Next: 3 Equal Symmetrical Columns -->
          <div class="next-steps-section">
            <h3 class="steps-heading">What Happens Next in the Claims Workflow?</h3>
            <div class="next-steps-grid">
              <div class="next-step-card">
                <div class="step-circle-badge">1</div>
                <div class="next-step-content">
                  <h4 class="next-step-title">Policy & FIR Verification</h4>
                  <p class="next-step-desc">
                    Intake officers authenticate insurance cover on Parivahan Sarathi and cross-verify police FIR details within 24–48 business hours.
                  </p>
                </div>
              </div>

              <div class="next-step-card">
                <div class="step-circle-badge">2</div>
                <div class="next-step-content">
                  <h4 class="next-step-title">Claims Handler & Official ID</h4>
                  <p class="next-step-desc">
                    A dedicated claims handler is assigned and converts this intimation into a registered claim file (e.g. TP-2026-XXXXXX).
                  </p>
                </div>
              </div>

              <div class="next-step-card">
                <div class="step-circle-badge">3</div>
                <div class="next-step-content">
                  <h4 class="next-step-title">Evidence Review & Settlement</h4>
                  <p class="next-step-desc">
                    Submitted evidence and medical records are reviewed for direct out-of-court settlement or MACT tribunal representation.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Symmetrical Action Buttons -->
          <div class="ack-actions">
            <a [routerLink]="['/public/track-claim']" [queryParams]="{ ref: intimationRef }" class="csp-btn csp-btn-primary">
              <app-icon name="search" [size]="15"></app-icon>
              <span>Track Claim Status</span>
            </a>
            <a [routerLink]="['/public/claim-details', intimationRef]" class="csp-btn csp-btn-secondary">
              <app-icon name="eye" [size]="15"></app-icon>
              <span>View Submitted Summary</span>
            </a>
            <a routerLink="/" class="csp-btn csp-btn-secondary">
              <app-icon name="home" [size]="15"></app-icon>
              <span>Return to Home</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .ack-page {
      padding: 1.25rem 0.75rem 2.5rem;
      background: var(--csp-bg-soft);
      min-height: calc(100vh - 180px);
    }

    .ack-container {
      max-width: 1060px;
      margin: 0 auto;
      width: 100%;
      box-sizing: border-box;
    }

    /* Symmetrical 3-Stage Progress Timeline with 3 Equal Columns */
    .stepper-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 0.95rem;
      width: 100%;
      box-sizing: border-box;
    }
    .step-card {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.85rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      box-sizing: border-box;
      transition: var(--csp-transition);
    }
    .step-card.completed {
      border-color: rgba(85, 116, 95, 0.45);
      background: #F6F9F7;
    }
    .step-badge {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--csp-sage);
      border: 1.5px solid var(--csp-sage);
      color: var(--csp-white);
      font-weight: 800;
      font-size: 0.76rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .step-text-col {
      display: flex;
      flex-direction: column;
      overflow: hidden;
      min-width: 0;
    }
    .step-kicker {
      font-size: 0.65rem;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 0.04em;
      color: var(--csp-sage);
      line-height: 1.2;
    }
    .step-title {
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      line-height: 1.2;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .ack-card {
      padding: 2rem 2.25rem 2.25rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      background: var(--csp-white);
      border-radius: var(--csp-radius-md);
      box-shadow: var(--csp-shadow-sm);
      border: 1px solid var(--csp-border);
      width: 100%;
      box-sizing: border-box;
    }

    .step-4-badge {
      margin-bottom: 0.85rem;
    }
    .step-pill {
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--csp-sage);
      background: rgba(85, 116, 95, 0.12);
      padding: 3px 10px;
      border-radius: var(--csp-radius-pill);
      display: inline-block;
      border: 1px solid rgba(85, 116, 95, 0.25);
    }

    .ack-badge-box {
      width: 58px;
      height: 58px;
      border-radius: 50%;
      background: var(--csp-sage-subtle);
      border: 2.5px solid var(--csp-sage);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
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
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0 0 0.4rem 0;
    }

    .ack-subtitle {
      color: var(--csp-warm-grey);
      font-size: 0.88rem;
      max-width: 620px;
      line-height: 1.5;
      margin: 0 0 1.35rem 0;
    }

    /* Reference Number Banner with Symmetrical Box-Sizing */
    .reference-banner {
      width: 100%;
      box-sizing: border-box;
      background: var(--csp-ivory);
      border: 1.5px dashed var(--csp-clay-dark);
      border-radius: var(--csp-radius-sm);
      padding: 1.15rem 1.5rem;
      margin-bottom: 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .ref-label {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--csp-warm-grey);
      margin-bottom: 0.35rem;
    }

    .ref-number-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .ref-number {
      font-family: var(--csp-font-heading);
      font-size: 1.85rem;
      font-weight: 800;
      color: var(--csp-ember);
      letter-spacing: 0.04em;
      line-height: 1.2;
    }

    .copy-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.25rem 0.6rem;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-pill);
      cursor: pointer;
      transition: var(--csp-transition);
    }
    .copy-btn:hover {
      border-color: var(--csp-ember);
      color: var(--csp-ember);
      background: rgba(232, 93, 50, 0.06);
    }

    .ref-meta {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.65rem;
      font-size: 0.76rem;
      color: var(--csp-warm-grey);
      margin-top: 0.5rem;
      flex-wrap: wrap;
    }
    .meta-item {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
    }
    .meta-dot {
      color: var(--csp-border-dark);
    }

    /* Legal Notice Box */
    .legal-notice-box {
      width: 100%;
      box-sizing: border-box;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.85rem 1.1rem;
      text-align: left;
      margin-bottom: 1.35rem;
      box-shadow: var(--csp-shadow-sm);
    }
    .alert-icon {
      color: var(--csp-terracotta);
      flex-shrink: 0;
      margin-top: 2px;
    }
    .notice-text {
      font-size: 0.78rem;
      line-height: 1.5;
      color: var(--csp-warm-grey);
    }

    /* What Happens Next: 3 Equal Columns */
    .next-steps-section {
      width: 100%;
      box-sizing: border-box;
      text-align: left;
      margin-bottom: 1.5rem;
    }
    .steps-heading {
      font-size: 0.92rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin: 0 0 0.65rem 0;
      text-align: left;
    }
    .next-steps-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      width: 100%;
      box-sizing: border-box;
    }
    .next-step-card {
      display: flex;
      align-items: flex-start;
      gap: 0.65rem;
      background: var(--csp-bg-soft);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      padding: 0.75rem 0.85rem;
      box-sizing: border-box;
    }
    .step-circle-badge {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--csp-charcoal);
      color: var(--csp-white);
      font-weight: 700;
      font-size: 0.74rem;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      margin-top: 1px;
    }
    .next-step-content {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .next-step-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin: 0 0 0.2rem 0;
    }
    .next-step-desc {
      font-size: 0.74rem;
      color: var(--csp-warm-grey);
      margin: 0;
      line-height: 1.4;
    }

    /* Action Buttons */
    .ack-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      flex-wrap: wrap;
      width: 100%;
      box-sizing: border-box;
      padding-top: 0.75rem;
      border-top: 1px solid var(--csp-border);
    }
    .ack-actions .csp-btn {
      height: 36px;
      padding: 0 1rem;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      gap: 0.45rem;
      box-sizing: border-box;
    }

    @media (max-width: 860px) {
      .stepper-grid {
        grid-template-columns: 1fr;
        gap: 0.5rem;
      }
      .next-steps-grid {
        grid-template-columns: 1fr;
        gap: 0.6rem;
      }
    }

    @media (max-width: 600px) {
      .ack-card { padding: 1.25rem 1rem; }
      .ref-number { font-size: 1.45rem; }
      .ack-actions { flex-direction: column; }
      .ack-actions .csp-btn { width: 100%; justify-content: center; }
    }
  `]
})
export class AcknowledgementComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private mockData = inject(MockDataService);
  private toast = inject(ToastService);

  intimationRef = 'INT-2026-000184';
  submissionTimestamp = new Date().toISOString().replace('T', ' ').substring(0, 16);
  isCopied = false;

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['ref']) {
        this.intimationRef = params['ref'];
      }
    });
  }

  copyReference() {
    navigator.clipboard.writeText(this.intimationRef);
    this.isCopied = true;
    this.toast.showSuccess('Copied to Clipboard', `Reference ${this.intimationRef} has been copied.`);
    setTimeout(() => {
      this.isCopied = false;
    }, 2500);
  }
}
