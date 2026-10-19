import { Component, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { MockDataService } from '../../../core/services/mock-data.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="landing-page">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="landing-container hero-grid">
          <div class="hero-content">
            <div class="hero-pill">
              <span class="pill-dot"></span>
              <span>Third-Party Motor Insurance Claims Portal</span>
            </div>
            <h1 class="hero-title">
              Guidance and Support When You Need It Most.
            </h1>
            <p class="hero-subtitle">
              If you or your property has been affected by an accident involving a motor vehicle covered under third-party insurance, ClaimShield Plus offers a clear, structured, and compassionate path to resolution.
            </p>

            <div class="hero-actions">
              <a routerLink="/public/intimation" class="csp-btn csp-btn-primary csp-btn-lg">
                <app-icon name="plus" [size]="18"></app-icon>
                <span>Report an Accident</span>
              </a>
              <a routerLink="/public/track-claim" class="csp-btn csp-btn-secondary csp-btn-lg">
                <app-icon name="search" [size]="18"></app-icon>
                <span>Track My Claim</span>
              </a>
            </div>

            <!-- Quick Track Input -->
            <div class="quick-track-card">
              <div class="quick-track-title">Quick Intimation Lookup:</div>
              <div class="quick-track-form">
                <input 
                  type="text" 
                  [(ngModel)]="quickRef" 
                  placeholder="e.g. INT-2026-000184 or TP-2026-001842" 
                  (keyup.enter)="onQuickLookup()"
                  class="quick-input"
                />
                <button (click)="onQuickLookup()" class="csp-btn csp-btn-charcoal csp-btn-sm">
                  Check Status
                </button>
              </div>
            </div>
          </div>

          <!-- Hero Graphic / Interactive Robo Head -->
          <div class="hero-visual" (click)="onRoboClick()" title="Interactive ClaimBot: move your mouse or click me!">
            <div class="claims-graphic-card robo-interactive-card">
              <div class="card-accent-badge">
                <span class="pulse-beacon"></span>
                <span>ClaimShield AI Guide</span>
              </div>

              <!-- Interactive Speech Bubble -->
              <div class="robo-speech-bubble">
                <app-icon name="sparkles" [size]="13" class="sparkle-ico"></app-icon>
                <span>{{ speechBubbleText }}</span>
              </div>

              <!-- Interactive Robot Head Stage -->
              <div class="robo-stage">
                <div 
                  class="robo-head"
                  [style.transform]="'perspective(650px) rotateX(' + roboRotateX + 'deg) rotateY(' + roboRotateY + 'deg) translate3d(' + roboTranslateX + 'px, ' + roboTranslateY + 'px, 0px)'"
                >
                  <!-- Antenna with Glowing Pulsing Beacon -->
                  <div class="robo-antenna">
                    <div class="antenna-beacon"></div>
                    <div class="antenna-stem"></div>
                  </div>

                  <!-- Ear Sensors -->
                  <div class="robo-ear ear-left"></div>
                  <div class="robo-ear ear-right"></div>

                  <!-- Main Face Chassis -->
                  <div class="robo-face-chassis">
                    <!-- Forehead Status Sensor Bars -->
                    <div class="robo-forehead-bars">
                      <span class="f-bar"></span>
                      <span class="f-bar mid"></span>
                      <span class="f-bar"></span>
                    </div>

                    <!-- Glowing Digital Visor -->
                    <div class="robo-visor">
                      <!-- Left Eye -->
                      <div class="robo-eye-socket" [class.blinking]="isBlinking">
                        <div 
                          class="robo-pupil"
                          [style.transform]="'translate(' + eyeOffsetX + 'px, ' + eyeOffsetY + 'px)'"
                        >
                          <div class="pupil-glint"></div>
                        </div>
                      </div>

                      <!-- Right Eye -->
                      <div class="robo-eye-socket" [class.blinking]="isBlinking">
                        <div 
                          class="robo-pupil"
                          [style.transform]="'translate(' + eyeOffsetX + 'px, ' + eyeOffsetY + 'px)'"
                        >
                          <div class="pupil-glint"></div>
                        </div>
                      </div>
                    </div>

                    <!-- Audio Grille & Smile Mouth -->
                    <div class="robo-mouth-row">
                      <div class="robo-cheek cheek-left"></div>
                      <div class="robo-mouth">
                        <span class="m-wave" [style.transform]="'scaleY(' + (0.8 + Math.abs(eyeOffsetY) * 0.1) + ')'"></span>
                        <span class="m-wave tall" [style.transform]="'scaleY(' + (1.1 + Math.abs(eyeOffsetX) * 0.1) + ')'"></span>
                        <span class="m-wave tall" [style.transform]="'scaleY(' + (1.1 + Math.abs(eyeOffsetX) * 0.1) + ')'"></span>
                        <span class="m-wave" [style.transform]="'scaleY(' + (0.8 + Math.abs(eyeOffsetY) * 0.1) + ')'"></span>
                      </div>
                      <div class="robo-cheek cheek-right"></div>
                    </div>
                  </div>

                  <!-- Neck Connector -->
                  <div class="robo-neck"></div>
                </div>

                <!-- Floor Shadow tracking motion -->
                <div 
                  class="robo-shadow"
                  [style.transform]="'translate(' + (roboTranslateX * 0.6) + 'px, ' + (roboTranslateY * 0.25) + 'px) scale(' + (1 - roboTranslateY * 0.015) + ')'"
                ></div>
              </div>

              <!-- Visual Features -->
              <div class="visual-features">
                <div class="visual-feat-item">
                  <app-icon name="check" [size]="14" class="check-icon"></app-icon>
                  <span>100% Digital Intimation</span>
                </div>
                <div class="visual-feat-item">
                  <app-icon name="check" [size]="14" class="check-icon"></app-icon>
                  <span>Direct Document Uploads</span>
                </div>
                <div class="visual-feat-item">
                  <app-icon name="check" [size]="14" class="check-icon"></app-icon>
                  <span>Transparent Stage Tracking</span>
                </div>
                <div class="visual-feat-item">
                  <app-icon name="check" [size]="14" class="check-icon"></app-icon>
                  <span>Lok Adalat & MACT Support</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Key Capabilities / Feature Cards -->
      <section class="section features-section">
        <div class="landing-container">
          <div class="section-header">
            <div class="section-tag">Empowering Claimants</div>
            <h2 class="section-title">Designed for Ease, Transparency, and Care</h2>
            <p class="section-desc">Everything you need to initiate and follow your third-party claim without complex legal jargon.</p>
          </div>

          <div class="feature-grid">
            <div class="feature-card">
              <div class="feature-icon-wrap ember">
                <app-icon name="clipboard-list" [size]="24"></app-icon>
              </div>
              <h3 class="feature-title">Guided Accident Intimation</h3>
              <p class="feature-text">
                Step-by-step assisted reporting that collects essential accident facts, vehicle registrations, and police FIR details cleanly.
              </p>
              <a routerLink="/public/intimation" class="card-link">
                Start Intimation <app-icon name="arrow-right" [size]="14"></app-icon>
              </a>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap sage">
                <app-icon name="upload" [size]="24"></app-icon>
              </div>
              <h3 class="feature-title">Direct Document Submission</h3>
              <p class="feature-text">
                Upload medical bills, identity proofs, vehicle damage estimates, and FIR records securely from your computer or smartphone.
              </p>
              <a routerLink="/public/document-upload" class="card-link">
                Upload Documents <app-icon name="arrow-right" [size]="14"></app-icon>
              </a>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap charcoal">
                <app-icon name="clock" [size]="24"></app-icon>
              </div>
              <h3 class="feature-title">Real-Time Stage Tracking</h3>
              <p class="feature-text">
                Know where your claim stands at every milestone: from registration and surveyor inspection to legal assessment and settlement.
              </p>
              <a routerLink="/public/track-claim" class="card-link">
                Track Online <app-icon name="arrow-right" [size]="14"></app-icon>
              </a>
            </div>

            <div class="feature-card">
              <div class="feature-icon-wrap terracotta">
                <app-icon name="help-circle" [size]="24"></app-icon>
              </div>
              <h3 class="feature-title">Dedicated Claim Assistance</h3>
              <p class="feature-text">
                Access comprehensive explanations of third-party rights, compensation guidelines, and tribunal procedural support.
              </p>
              <a routerLink="/public/help" class="card-link">
                Visit Help Centre <app-icon name="arrow-right" [size]="14"></app-icon>
              </a>
            </div>
          </div>
        </div>
      </section>

      <!-- How It Works / Process Timeline -->
      <section class="section process-section">
        <div class="landing-container">
          <div class="section-header">
            <div class="section-tag">Workflow Overview</div>
            <h2 class="section-title">The Four-Stage Claims Journey</h2>
            <p class="section-desc">A structured and fair roadmap from first notice to final resolution.</p>
          </div>

          <div class="process-timeline-grid">
            <div class="process-step">
              <div class="step-num">01</div>
              <div class="step-icon-box">
                <app-icon name="file-text" [size]="20"></app-icon>
              </div>
              <h4 class="step-title">Accident Intimation</h4>
              <p class="step-desc">
                Submit basic accident circumstances, vehicle numbers, and FIR details to receive your formal tracking reference number.
              </p>
            </div>

            <div class="process-step">
              <div class="step-num">02</div>
              <div class="step-icon-box">
                <app-icon name="shield-check" [size]="20"></app-icon>
              </div>
              <h4 class="step-title">Claim Registration</h4>
              <p class="step-desc">
                Our operations team verifies policy validity and assigns a dedicated claims handler to review your documentation.
              </p>
            </div>

            <div class="process-step">
              <div class="step-num">03</div>
              <div class="step-icon-box">
                <app-icon name="search" [size]="20"></app-icon>
              </div>
              <h4 class="step-title">Review & Investigation</h4>
              <p class="step-desc">
                Independent investigators and assessors review medical records, vehicle inspection reports, and legal merits.
              </p>
            </div>

            <div class="process-step">
              <div class="step-num">04</div>
              <div class="step-icon-box">
                <app-icon name="check-circle" [size]="20"></app-icon>
              </div>
              <h4 class="step-title">Decision & Settlement</h4>
              <p class="step-desc">
                Fair compensation assessment is agreed via mutual conciliation or tribunal proceedings, followed by direct electronic disbursement.
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Interactive FAQ Accordion -->
      <section class="section faq-section">
        <div class="landing-container">
          <div class="section-header">
            <div class="section-tag">Frequently Asked Questions</div>
            <h2 class="section-title">Common Third-Party Questions</h2>
          </div>

          <div class="faq-list">
            <div *ngFor="let item of faqs; let i = index" class="faq-item" [class.open]="item.isOpen">
              <button class="faq-question-btn" (click)="toggleFaq(item)">
                <span>{{ item.question }}</span>
                <app-icon [name]="item.isOpen ? 'chevron-up' : 'chevron-down'" [size]="18"></app-icon>
              </button>
              <div class="faq-answer" *ngIf="item.isOpen">
                <p>{{ item.answer }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .landing-page {
      display: flex;
      flex-direction: column;
    }

    .landing-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 1.5rem;
    }

    /* Hero */
    .hero-section {
      padding: 4.5rem 0 3.5rem;
      background: linear-gradient(180deg, var(--csp-ivory) 0%, var(--csp-bg-soft) 100%);
      border-bottom: 1px solid var(--csp-border);
    }

    .hero-grid {
      display: grid;
      grid-template-columns: 1.2fr 0.8fr;
      gap: 3.5rem;
      align-items: center;
    }

    .hero-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(232, 93, 50, 0.1);
      border: 1px solid rgba(232, 93, 50, 0.25);
      padding: 0.35rem 0.85rem;
      border-radius: var(--csp-radius-pill);
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--csp-ember);
      margin-bottom: 1.2rem;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .pill-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--csp-ember);
    }

    .hero-title {
      font-size: 2.75rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      letter-spacing: -0.025em;
      line-height: 1.15;
      margin-bottom: 1.2rem;
    }

    .hero-subtitle {
      font-size: 1.05rem;
      color: var(--csp-warm-grey);
      line-height: 1.65;
      margin-bottom: 2rem;
      max-width: 580px;
    }

    .hero-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
      margin-bottom: 2rem;
    }

    .quick-track-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1rem 1.25rem;
      box-shadow: var(--csp-shadow-sm);
      max-width: 480px;
    }

    .quick-track-title {
      font-size: 0.82rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 0.5rem;
    }

    .quick-track-form {
      display: flex;
      gap: 0.5rem;
    }

    .quick-input {
      flex: 1;
      font-size: 0.88rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-sm);
      outline: none;
      font-family: inherit;
    }
    .quick-input:focus {
      border-color: var(--csp-ember);
    }

    /* Hero Graphic / Interactive Robo Card */
    .claims-graphic-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-xl);
      padding: 2.25rem 2rem;
      box-shadow: var(--csp-shadow-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      position: relative;
    }

    .robo-interactive-card {
      cursor: pointer;
      user-select: none;
      transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease;
    }
    .robo-interactive-card:hover {
      box-shadow: 0 20px 40px rgba(37, 35, 33, 0.12);
    }

    .card-accent-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      padding: 0.4rem 0.85rem;
      border-radius: var(--csp-radius-pill);
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 1rem;
    }

    .pulse-beacon {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--csp-sage);
      box-shadow: 0 0 0 0 rgba(85, 116, 95, 0.7);
      animation: pulseGreen 2s infinite;
    }

    @keyframes pulseGreen {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(85, 116, 95, 0.7); }
      70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(85, 116, 95, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(85, 116, 95, 0); }
    }

    /* Speech Bubble */
    .robo-speech-bubble {
      background: var(--csp-ivory);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-pill);
      padding: 0.35rem 0.85rem;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--csp-charcoal);
      margin-bottom: 1.25rem;
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      box-shadow: var(--csp-shadow-sm);
      animation: floatBubble 3s ease-in-out infinite alternate;
    }
    .sparkle-ico {
      color: var(--csp-ember);
    }

    @keyframes floatBubble {
      0% { transform: translateY(0); }
      100% { transform: translateY(-3px); }
    }

    /* Robo Stage & 3D Container */
    .robo-stage {
      position: relative;
      width: 220px;
      height: 190px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      perspective: 700px;
      margin-bottom: 1.75rem;
    }

    .robo-head {
      position: relative;
      width: 145px;
      height: 130px;
      display: flex;
      flex-direction: column;
      align-items: center;
      transform-style: preserve-3d;
      transition: transform 0.08s ease-out;
      will-change: transform;
      z-index: 2;
    }

    /* Antenna */
    .robo-antenna {
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-bottom: -2px;
      z-index: 1;
    }
    .antenna-beacon {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: var(--csp-ember);
      box-shadow: 0 0 12px var(--csp-ember);
      animation: beaconBlink 1.8s ease-in-out infinite alternate;
    }
    .antenna-stem {
      width: 4px;
      height: 18px;
      background: linear-gradient(180deg, var(--csp-charcoal-light), var(--csp-charcoal));
      border-radius: 2px;
    }

    @keyframes beaconBlink {
      0% { opacity: 0.6; transform: scale(0.9); }
      100% { opacity: 1; transform: scale(1.1); box-shadow: 0 0 16px rgba(232, 93, 50, 0.9); }
    }

    /* Ears */
    .robo-ear {
      position: absolute;
      top: 48px;
      width: 10px;
      height: 24px;
      background: linear-gradient(180deg, var(--csp-clay), var(--csp-terracotta));
      border: 1px solid var(--csp-charcoal);
      border-radius: 4px;
    }
    .ear-left {
      left: -6px;
    }
    .ear-right {
      right: -6px;
    }

    /* Face Chassis */
    .robo-face-chassis {
      width: 140px;
      height: 110px;
      background: linear-gradient(145deg, #2D2A28 0%, #1E1C1A 100%);
      border: 2px solid var(--csp-terracotta);
      border-radius: 26px;
      box-shadow: 0 10px 25px rgba(37, 35, 33, 0.35), inset 0 2px 4px rgba(255, 255, 255, 0.15);
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 8px 12px;
      gap: 7px;
    }

    /* Forehead Sensor Bars */
    .robo-forehead-bars {
      display: flex;
      gap: 4px;
      margin-top: 2px;
    }
    .f-bar {
      width: 14px;
      height: 2px;
      background: var(--csp-clay);
      border-radius: 1px;
      opacity: 0.6;
    }
    .f-bar.mid {
      width: 22px;
      background: var(--csp-ember);
      opacity: 0.9;
    }

    /* Glowing Digital Visor */
    .robo-visor {
      width: 116px;
      height: 48px;
      background: #121110;
      border: 1.5px solid #383431;
      border-radius: 16px;
      box-shadow: inset 0 2px 8px rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 16px;
    }

    .robo-eye-socket {
      width: 32px;
      height: 28px;
      border-radius: 10px;
      background: rgba(232, 93, 50, 0.08);
      border: 1.5px solid rgba(232, 93, 50, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      transition: transform 0.12s ease;
    }
    .robo-eye-socket.blinking {
      transform: scaleY(0.08);
    }

    .robo-pupil {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      background: radial-gradient(circle, #FFA07A 0%, #E85D32 55%, #C56A4A 100%);
      box-shadow: 0 0 10px rgba(232, 93, 50, 0.85);
      position: relative;
      transition: transform 0.04s ease-out;
      will-change: transform;
    }
    .pupil-glint {
      position: absolute;
      top: 3px;
      left: 3px;
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background: #FFFFFF;
    }

    /* Mouth Row */
    .robo-mouth-row {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      width: 100%;
      margin-top: 1px;
    }
    .robo-cheek {
      width: 8px;
      height: 5px;
      border-radius: 4px;
      background: var(--csp-clay);
      opacity: 0.5;
    }
    .robo-mouth {
      display: flex;
      gap: 3px;
      align-items: center;
      height: 12px;
    }
    .m-wave {
      width: 3px;
      height: 6px;
      background: var(--csp-ember);
      border-radius: 2px;
      opacity: 0.75;
      transition: transform 0.05s ease-out;
    }
    .m-wave.tall {
      height: 10px;
      opacity: 0.95;
    }

    /* Neck */
    .robo-neck {
      width: 30px;
      height: 10px;
      background: linear-gradient(180deg, var(--csp-charcoal), #161514);
      border-radius: 0 0 6px 6px;
      border: 1px solid var(--csp-charcoal-light);
      margin-top: -2px;
    }

    /* Shadow */
    .robo-shadow {
      position: absolute;
      bottom: 8px;
      width: 110px;
      height: 14px;
      background: radial-gradient(ellipse, rgba(37, 35, 33, 0.25) 0%, rgba(37, 35, 33, 0) 70%);
      border-radius: 50%;
      transition: transform 0.08s ease-out;
      will-change: transform;
    }

    .visual-features {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      width: 100%;
      text-align: left;
    }

    .visual-feat-item {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--csp-charcoal);
    }

    .check-icon {
      color: var(--csp-sage);
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    /* Sections */
    .section {
      padding: 4.5rem 0;
    }

    .section-header {
      text-align: center;
      max-width: 680px;
      margin: 0 auto 3.5rem;
    }

    .section-tag {
      font-size: 0.8rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: var(--csp-ember);
      margin-bottom: 0.5rem;
    }

    .section-title {
      font-size: 2rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin-bottom: 0.75rem;
    }

    .section-desc {
      color: var(--csp-warm-grey);
      font-size: 0.95rem;
      line-height: 1.6;
    }

    /* Feature Grid */
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .feature-card {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      padding: 1.8rem;
      display: flex;
      flex-direction: column;
      box-shadow: var(--csp-shadow-card);
      transition: var(--csp-transition);
    }

    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--csp-shadow-md);
      border-color: var(--csp-border-dark);
    }

    .feature-icon-wrap {
      width: 48px;
      height: 48px;
      border-radius: var(--csp-radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.25rem;
    }

    .feature-icon-wrap.ember { background: var(--csp-ember-subtle); color: var(--csp-ember); }
    .feature-icon-wrap.sage { background: var(--csp-sage-subtle); color: var(--csp-sage); }
    .feature-icon-wrap.charcoal { background: rgba(37,35,33,0.08); color: var(--csp-charcoal); }
    .feature-icon-wrap.terracotta { background: var(--csp-terracotta-subtle); color: var(--csp-terracotta); }

    .feature-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 0.6rem;
    }

    .feature-text {
      color: var(--csp-warm-grey);
      font-size: 0.88rem;
      line-height: 1.6;
      flex: 1;
      margin-bottom: 1.2rem;
    }

    .card-link {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-weight: 700;
      font-size: 0.85rem;
      color: var(--csp-ember);
    }

    /* Process Grid */
    .process-section {
      background: var(--csp-white);
      border-top: 1px solid var(--csp-border);
      border-bottom: 1px solid var(--csp-border);
    }

    .process-timeline-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      position: relative;
    }

    .process-step {
      display: flex;
      flex-direction: column;
      position: relative;
    }

    .step-num {
      font-family: var(--csp-font-heading);
      font-size: 2.2rem;
      font-weight: 800;
      color: var(--csp-clay);
      line-height: 1;
      margin-bottom: 0.75rem;
    }

    .step-icon-box {
      width: 40px;
      height: 40px;
      border-radius: var(--csp-radius-sm);
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      border: 1px solid var(--csp-border);
    }

    .step-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      margin-bottom: 0.5rem;
    }

    .step-desc {
      color: var(--csp-warm-grey);
      font-size: 0.86rem;
      line-height: 1.55;
    }

    /* FAQ */
    .faq-list {
      max-width: 800px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .faq-item {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-md);
      overflow: hidden;
      transition: var(--csp-transition);
    }

    .faq-item.open {
      border-color: var(--csp-border-dark);
      box-shadow: var(--csp-shadow-sm);
    }

    .faq-question-btn {
      width: 100%;
      background: none;
      border: none;
      padding: 1.25rem 1.5rem;
      text-align: left;
      font-family: inherit;
      font-size: 0.98rem;
      font-weight: 700;
      color: var(--csp-charcoal);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }

    .faq-answer {
      padding: 0 1.5rem 1.25rem;
      color: var(--csp-warm-grey);
      font-size: 0.9rem;
      line-height: 1.6;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .hero-grid { grid-template-columns: 1fr; gap: 2.5rem; }
      .feature-grid { grid-template-columns: 1fr 1fr; }
      .process-timeline-grid { grid-template-columns: 1fr 1fr; }
    }

    @media (max-width: 640px) {
      .hero-title { font-size: 2.1rem; }
      .feature-grid { grid-template-columns: 1fr; }
      .process-timeline-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class LandingComponent {
  quickRef = '';
  Math = Math;
  private router = inject(Router);

  // Mouse tracking state for interactive Robo Head
  roboRotateX = 0;
  roboRotateY = 0;
  roboTranslateX = 0;
  roboTranslateY = 0;
  eyeOffsetX = 0;
  eyeOffsetY = 0;
  isBlinking = false;
  speechBubbleText = 'Hello! Move your cursor to look around.';

  @HostListener('window:mousemove', ['$event'])
  onWindowMouseMove(event: MouseEvent) {
    if (typeof window === 'undefined') return;
    const w = window.innerWidth || 1200;
    const h = window.innerHeight || 800;

    // Relative coordinates (-1 to 1) from screen center
    const nx = (event.clientX / w) * 2 - 1;
    const ny = (event.clientY / h) * 2 - 1;

    // 3D rotation of head (-18deg to 18deg)
    this.roboRotateY = Math.round(nx * 18 * 10) / 10;
    this.roboRotateX = Math.round(-ny * 16 * 10) / 10;

    // Head position translation (-9px to 9px)
    this.roboTranslateX = Math.round(nx * 9 * 10) / 10;
    this.roboTranslateY = Math.round(ny * 9 * 10) / 10;

    // Eye pupils follow mouse (-7px to 7px)
    this.eyeOffsetX = Math.round(nx * 7 * 10) / 10;
    this.eyeOffsetY = Math.round(ny * 6 * 10) / 10;
  }

  onRoboClick() {
    this.isBlinking = true;
    const quotes = [
      'Ready to assist your motor insurance claim!',
      'Report an accident in under 5 minutes!',
      'Tracking your claim status live 24/7.',
      'Checking document compliance in real-time!',
      'I am watching your cursor! Move around!'
    ];
    this.speechBubbleText = quotes[Math.floor(Math.random() * quotes.length)];
    setTimeout(() => {
      this.isBlinking = false;
    }, 280);
  }

  faqs = [
    {
      question: 'What is Third-Party (TP) motor insurance coverage?',
      answer: 'Under statutory motor vehicle legislation, third-party insurance covers legal liability for bodily injury, fatal casualties, or property damage caused to a third party (any person other than the policyholder or driver) by the insured motor vehicle.',
      isOpen: true
    },
    {
      question: 'Does submitting an accident intimation guarantee compensation?',
      answer: 'No. Submitting an intimation records the accident facts and initiates formal review. Compensation entitlement is determined following evidence verification, liability assessment, and either mutual conciliation or tribunal adjudication.',
      isOpen: false
    },
    {
      question: 'What documents are required to initiate a claim?',
      answer: 'Key documents include a copy of the First Information Report (FIR) or police station diary entry, government identity proof of the claimant, medical bills or doctor reports (for bodily injury), and authorized repair estimates (for property damage).',
      isOpen: false
    },
    {
      question: 'Can a family member report on behalf of an injured or deceased victim?',
      answer: 'Yes. Legally authorized representatives, next of kin, or registered legal heirs can file an intimation on behalf of the victim by providing relationship particulars and legal heirship documentation.',
      isOpen: false
    }
  ];

  toggleFaq(faq: any) {
    faq.isOpen = !faq.isOpen;
  }

  onQuickLookup() {
    const q = this.quickRef.trim();
    if (q) {
      this.router.navigate(['/public/track-claim'], { queryParams: { ref: q } });
    } else {
      this.router.navigate(['/public/track-claim']);
    }
  }
}
