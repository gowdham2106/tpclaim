import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { ToastService } from '../../core/services/toast.service';
import { IconComponent } from '../../shared/components/icon/icon.component';

interface HelpFaq {
  category: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-internal-help',
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
            <span class="current">Staff Help Centre & SOPs</span>
          </div>
          <h1 class="page-title">Operations Manual & Knowledge Base</h1>
          <p class="page-subtitle">Standard operating procedures (SOPs), MACT tribunal protocols, fraud red-flags, and IT helpdesk.</p>
        </div>
      </div>

      <!-- Hero Search Banner -->
      <div class="csp-card help-hero-card">
        <h2 class="hero-title">How can we assist your claim investigation or settlement today?</h2>
        <p class="hero-desc">Search through 40+ standardized operational guidelines, tribunal reference guides, and actuarial templates.</p>
        
        <div class="hero-search-box">
          <app-icon name="search" [size]="18" class="hero-search-icon"></app-icon>
          <input 
            type="text" 
            [(ngModel)]="searchQuery" 
            placeholder="Search guidance (e.g. Sarla Verma multiplier, delayed FIR, Lok Adalat compromise, SoD threshold)..." 
            class="hero-search-input"
          />
        </div>
      </div>

      <!-- Category Filter Pills -->
      <div class="category-pills">
        <button 
          *ngFor="let cat of categories" 
          (click)="selectedCategory = cat"
          [class.active]="selectedCategory === cat"
          class="cat-btn"
        >
          {{ cat }}
        </button>
      </div>

      <div class="help-main-layout">
        <!-- FAQ Accordion List -->
        <div class="faq-list-col">
          <div 
            *ngFor="let faq of filteredFaqs(); let i = index" 
            class="csp-card faq-card"
            [class.open]="faq.isOpen"
          >
            <button class="faq-toggle-btn" (click)="toggleFaq(faq)">
              <div class="faq-q-wrap">
                <span class="faq-cat-tag">{{ faq.category }}</span>
                <span class="faq-question">{{ faq.question }}</span>
              </div>
              <app-icon [name]="faq.isOpen ? 'chevron-up' : 'chevron-down'" [size]="16" class="faq-chevron"></app-icon>
            </button>

            <div class="faq-answer" *ngIf="faq.isOpen">
              <p>{{ faq.answer }}</p>
            </div>
          </div>

          <div *ngIf="filteredFaqs().length === 0" class="csp-card empty-card">
            <app-icon name="help-circle" [size]="36" class="empty-ico"></app-icon>
            <h3>No knowledge articles found</h3>
            <p>Try searching for different terms or clear the filter.</p>
          </div>
        </div>

        <!-- Right Side: Internal Support Request Form -->
        <div class="support-form-col">
          <div class="csp-card support-card">
            <div class="support-head">
              <div class="support-icon">
                <app-icon name="message-square" [size]="18"></app-icon>
              </div>
              <div>
                <h3 class="support-title">Submit Operations Inquiry</h3>
                <p class="support-subtitle">Escalate technical or legal blockers directly to Central Hub Support.</p>
              </div>
            </div>

            <div class="support-body">
              <div class="form-group">
                <label class="form-label">Inquiry Category <span class="req">*</span></label>
                <select [(ngModel)]="ticket.category" class="csp-select w-full">
                  <option value="Workflow Guidance">Workflow & SOP Clarification</option>
                  <option value="Legal Opinion Requisition">Legal / Advocate Opinion Request</option>
                  <option value="IT Technical Issue">IT System / Upload Glitch</option>
                  <option value="Permission Elevation">Permission / SoD Elevation</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label">Associated Claim (Optional)</label>
                <input 
                  type="text" 
                  [(ngModel)]="ticket.claimRef" 
                  placeholder="e.g. TP-2026-001842" 
                  class="csp-input w-full"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Subject / Summary <span class="req">*</span></label>
                <input 
                  type="text" 
                  [(ngModel)]="ticket.subject" 
                  placeholder="Brief summary of the inquiry" 
                  class="csp-input w-full"
                />
              </div>

              <div class="form-group">
                <label class="form-label">Detailed Description <span class="req">*</span></label>
                <textarea 
                  rows="4" 
                  [(ngModel)]="ticket.description" 
                  placeholder="Explain the specific issue, circumstance, or guidance needed..." 
                  class="csp-textarea w-full"
                ></textarea>
              </div>

              <button (click)="submitTicket()" class="csp-btn csp-btn-primary w-full">
                <app-icon name="send" [size]="15"></app-icon>
                Submit Support Requisition
              </button>
            </div>
          </div>

          <!-- Quick Contacts Card -->
          <div class="csp-card contact-box-card">
            <h4 class="box-title">Central Operations Hub Contacts</h4>
            <div class="contact-line">
              <app-icon name="phone" [size]="14"></app-icon>
              <span>Legal Cell Desk: <strong>ext. 4410</strong></span>
            </div>
            <div class="contact-line">
              <app-icon name="mail" [size]="14"></app-icon>
              <span>IT Support: <strong>ops-tech&#64;claimshieldplus.internal</strong></span>
            </div>
            <div class="contact-line">
              <app-icon name="clock" [size]="14"></app-icon>
              <span>Support Hours: <strong>Mon - Sat, 09:00 - 18:00 IST</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page-container {
      max-width: 1300px;
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

    /* Hero Search */
    .help-hero-card {
      background: var(--csp-charcoal);
      color: var(--csp-white);
      padding: 2.25rem 2rem;
      border-radius: var(--csp-radius-md);
      margin-bottom: 1.5rem;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .hero-title {
      font-size: 1.45rem;
      font-weight: 800;
      margin: 0 0 0.5rem 0;
      color: var(--csp-white);
    }
    .hero-desc {
      font-size: 0.9rem;
      color: var(--csp-warm-grey-light);
      margin: 0 0 1.5rem 0;
      max-width: 600px;
    }
    .hero-search-box {
      width: 100%;
      max-width: 640px;
      position: relative;
    }
    .hero-search-icon {
      position: absolute;
      left: 16px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--csp-warm-grey);
    }
    .hero-search-input {
      width: 100%;
      padding: 0.85rem 1rem 0.85rem 48px;
      border-radius: 30px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      background: rgba(255, 255, 255, 0.1);
      color: var(--csp-white);
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }
    .hero-search-input:focus {
      background: var(--csp-white);
      color: var(--csp-charcoal);
      border-color: var(--csp-ember);
      box-shadow: 0 0 0 3px rgba(232, 93, 50, 0.2);
    }
    .hero-search-input::placeholder {
      color: var(--csp-warm-grey-light);
    }

    /* Category Pills */
    .category-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .cat-btn {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      padding: 0.45rem 1rem;
      border-radius: 20px;
      font-size: 0.84rem;
      font-weight: 600;
      color: var(--csp-warm-grey-dark);
      cursor: pointer;
      transition: all 0.15s;
    }
    .cat-btn:hover {
      background: var(--csp-ivory);
      color: var(--csp-charcoal);
    }
    .cat-btn.active {
      background: var(--csp-charcoal);
      color: var(--csp-white);
      border-color: var(--csp-charcoal);
    }

    /* Layout */
    .help-main-layout {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 1.5rem;
    }
    @media (max-width: 900px) {
      .help-main-layout {
        grid-template-columns: 1fr;
      }
    }

    /* FAQ List */
    .faq-list-col {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .faq-card {
      padding: 0;
      overflow: hidden;
      border: 1px solid var(--csp-border);
      transition: border-color 0.15s;
    }
    .faq-card.open {
      border-color: var(--csp-ember);
    }
    .faq-toggle-btn {
      width: 100%;
      background: var(--csp-white);
      border: none;
      padding: 1.15rem 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      cursor: pointer;
      gap: 1rem;
    }
    .faq-toggle-btn:hover {
      background: var(--csp-ivory-light);
    }
    .faq-q-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .faq-cat-tag {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      color: var(--csp-ember);
    }
    .faq-question {
      font-size: 0.94rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .faq-chevron {
      color: var(--csp-warm-grey);
      flex-shrink: 0;
    }
    .faq-answer {
      padding: 1rem 1.25rem 1.25rem 1.25rem;
      background: var(--csp-ivory-light);
      border-top: 1px solid var(--csp-border-light);
    }
    .faq-answer p {
      font-size: 0.88rem;
      color: var(--csp-warm-grey-dark);
      line-height: 1.55;
      margin: 0;
    }

    /* Support Form */
    .support-form-col {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .support-card {
      padding: 1.5rem;
    }
    .support-head {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      margin-bottom: 1.25rem;
      padding-bottom: 0.85rem;
      border-bottom: 1px solid var(--csp-border);
    }
    .support-icon {
      width: 38px;
      height: 38px;
      border-radius: var(--csp-radius-sm);
      background: var(--csp-ember);
      color: var(--csp-white);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .support-title {
      font-size: 1.05rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0;
    }
    .support-subtitle {
      font-size: 0.78rem;
      color: var(--csp-warm-grey);
      margin: 0.15rem 0 0 0;
    }
    .support-body {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }
    .form-label {
      font-size: 0.84rem;
      font-weight: 700;
      color: var(--csp-charcoal);
    }
    .req {
      color: var(--csp-ember);
    }
    .w-full {
      width: 100%;
    }

    .contact-box-card {
      padding: 1.25rem;
      background: var(--csp-ivory-light);
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }
    .box-title {
      font-size: 0.88rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin: 0 0 0.25rem 0;
    }
    .contact-line {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--csp-charcoal);
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
export class InternalHelpComponent {
  mockData = inject(MockDataService);
  toast = inject(ToastService);

  searchQuery = '';
  selectedCategory = 'All';

  categories = [
    'All',
    'Claim Lifecycle SOPs',
    'Investigation & Fraud Red Flags',
    'MACT Tribunal & Legal Procedures',
    'Compensation Computation',
    'System & SoD Governance'
  ];

  ticket = {
    category: 'Workflow Guidance',
    claimRef: '',
    subject: '',
    description: ''
  };

  faqs: HelpFaq[] = [
    {
      category: 'Claim Lifecycle SOPs',
      question: 'What is the mandatory timeline for first contact after intimation receipt?',
      answer: 'Under ClaimShield Plus SOP-01, the assigned handler must establish initial claimant communication within 24 operational hours of accident intimation. Verify basic details, reassure the third-party victim or their representative, and issue the initial document upload checklist.',
      isOpen: true
    },
    {
      category: 'Claim Lifecycle SOPs',
      question: 'How do I handle incomplete FIRs or missing police site plans?',
      answer: 'If the police FIR does not include Section 134/158 compliance or the site plan, trigger an Additional Document Request via Page 32, and assign a task to the panel investigator to collect certified copies directly from the jurisdictional station.',
      isOpen: false
    },
    {
      category: 'Investigation & Fraud Red Flags',
      question: 'What are key indicators of staged third-party collisions?',
      answer: 'Common fraud markers include: Unexplained delay of >30 days in filing FIR, vehicle damage inconsistent with reported point of impact (e.g. no paint transfer), driver substitution after incident, multiple claims involving identical vehicle registration, and witnesses related to claimant who were not named in initial police DDR.',
      isOpen: false
    },
    {
      category: 'Investigation & Fraud Red Flags',
      question: 'When should a mechanical spot survey be ordered?',
      answer: 'A mechanical inspection must be ordered for any claim where property damage exceeds ₹50,000 or where vehicle speed and brake failure are raised in the defence. The surveyor must verify chassis VIN stamping against policy records.',
      isOpen: false
    },
    {
      category: 'MACT Tribunal & Legal Procedures',
      question: 'What is the difference between Section 166 and Section 163A/164 claims?',
      answer: 'Section 166 claims are fault-based, requiring the claimant to establish driver negligence or rash driving under tort law. Section 163A (and amended Section 164) operates on a no-fault liability basis with fixed statutory compensation caps, eliminating the need to prove negligence.',
      isOpen: false
    },
    {
      category: 'MACT Tribunal & Legal Procedures',
      question: 'How should Lok Adalat pre-litigation compromises be documented?',
      answer: 'Any negotiated compromise in Lok Adalat requires a formal joint memo signed by the claimant, panel advocate, and Claims Approver. Once an Award is passed under Legal Services Authorities Act, 1987, it is non-appealable and final.',
      isOpen: false
    },
    {
      category: 'Compensation Computation',
      question: 'How is the Sarla Verma multiplier applied in dependency claims?',
      answer: 'Under Sarla Verma v. DTC (upheld in National Insurance Co. v. Pranay Sethi), the multiplier ranges from 18 (age 15-25) down to 5 (age 65+). Subtract personal expenses (1/3 for 2-3 dependents, 1/4 for 4-6 dependents) from ascertained net income before applying the age multiplier.',
      isOpen: false
    },
    {
      category: 'System & SoD Governance',
      question: 'Why am I unable to approve a claim I assessed?',
      answer: 'ClaimShield Plus enforces strict Segregation of Duties (SoD). An officer who authored the Liability or Compensation Assessment cannot self-approve the financial sanction. The claim must be routed to an authorized Approver on Page 26.',
      isOpen: false
    }
  ];

  filteredFaqs = () => {
    let list = this.faqs;
    if (this.selectedCategory !== 'All') {
      list = list.filter(f => f.category === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(f => 
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q)
      );
    }
    return list;
  };

  toggleFaq(faq: HelpFaq) {
    faq.isOpen = !faq.isOpen;
  }

  submitTicket() {
    if (!this.ticket.subject || !this.ticket.description) {
      this.toast.showError('Required Fields Missing', 'Please enter a subject and description for your inquiry.');
      return;
    }

    const ticketNo = 'TKT-' + Math.floor(1000 + Math.random() * 9000);
    this.toast.showSuccess(
      'Inquiry Submitted',
      `Ticket #${ticketNo} created. Central Hub Support will respond within 4 hours.`
    );
    this.ticket = {
      category: 'Workflow Guidance',
      claimRef: '',
      subject: '',
      description: ''
    };
  }
}
