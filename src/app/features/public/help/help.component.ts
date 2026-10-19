import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ToastService } from '../../../core/services/toast.service';

interface FAQ {
  category: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-public-help',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  template: `
    <div class="help-page">
      <!-- Help Hero -->
      <section class="help-hero">
        <div class="help-container">
          <div class="hero-tag">ClaimShield Plus Guidance</div>
          <h1 class="hero-title">Public Claims Knowledge & Support</h1>
          <p class="hero-desc">
            Clear, accessible explanations of third-party motor insurance claims procedures, document requirements, and tribunal options.
          </p>

          <!-- Search Box -->
          <div class="help-search-box">
            <app-icon name="search" [size]="20" class="search-icon"></app-icon>
            <input 
              type="text" 
              [(ngModel)]="searchQuery" 
              placeholder="Search help topics, documents required, MACT procedure, FIR rules..."
              class="help-search-input"
            />
          </div>
        </div>
      </section>

      <div class="help-container help-body">
        <!-- Topic Categories Tabs -->
        <div class="category-chips-row">
          <button 
            *ngFor="let cat of categories" 
            class="cat-chip" 
            [class.active]="selectedCategory === cat"
            (click)="selectedCategory = cat"
          >
            {{ cat }}
          </button>
        </div>

        <div class="help-grid-layout">
          <!-- Main Content: FAQs -->
          <div class="faqs-column">
            <h3 class="section-subhead">
              Frequently Asked Questions ({{ filteredFaqs.length }})
            </h3>

            <div class="faq-accordion-list">
              <div 
                *ngFor="let faq of filteredFaqs" 
                class="csp-card faq-card"
                [class.open]="faq.isOpen"
              >
                <button class="faq-header-btn" (click)="faq.isOpen = !faq.isOpen">
                  <div class="faq-q-text">
                    <span class="faq-cat-tag">{{ faq.category }}</span>
                    <h4 class="faq-q-title">{{ faq.question }}</h4>
                  </div>
                  <app-icon [name]="faq.isOpen ? 'chevron-up' : 'chevron-down'" [size]="18"></app-icon>
                </button>
                <div class="faq-body" *ngIf="faq.isOpen">
                  <p class="faq-answer-text">{{ faq.answer }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Sidebar: Support Form & Checklist Guide -->
          <div class="sidebar-column">
            <!-- Stage Explanations Card -->
            <div class="csp-card guidance-card">
              <div class="csp-card-header">
                <h4 style="margin:0; font-size:1rem; display:flex; align-items:center; gap:0.4rem;">
                  <app-icon name="shield-check" [size]="16" style="color:var(--csp-ember)"></app-icon>
                  The Claims Milestones Explained
                </h4>
              </div>
              <div class="csp-card-body" style="padding:1.25rem;">
                <div class="milestone-item">
                  <strong>1. Accident Intimation:</strong>
                  <span>Your formal notice of an occurrence recorded on the portal.</span>
                </div>
                <div class="milestone-item">
                  <strong>2. Registration:</strong>
                  <span>Policy confirmation and issuance of formal TP claim number.</span>
                </div>
                <div class="milestone-item">
                  <strong>3. Investigation:</strong>
                  <span>Independent inspection of road site, MVI report, and police diaries.</span>
                </div>
                <div class="milestone-item">
                  <strong>4. Assessment & Settlement:</strong>
                  <span>Fair compensation determined under statutory formula and paid via NEFT.</span>
                </div>
              </div>
            </div>

            <!-- Contact Support Form Card -->
            <div class="csp-card support-form-card">
              <div class="csp-card-header">
                <h4 style="margin:0; font-size:1rem; display:flex; align-items:center; gap:0.4rem;">
                  <app-icon name="mail" [size]="16" style="color:var(--csp-charcoal)"></app-icon>
                  Have an Unresolved Question?
                </h4>
              </div>
              <div class="csp-card-body">
                <form (ngSubmit)="sendInquiry()">
                  <div class="csp-form-group">
                    <label class="csp-label">Your Name</label>
                    <input type="text" [(ngModel)]="supportName" name="supportName" class="csp-input" required />
                  </div>
                  <div class="csp-form-group">
                    <label class="csp-label">Email or Phone</label>
                    <input type="text" [(ngModel)]="supportContact" name="supportContact" class="csp-input" required />
                  </div>
                  <div class="csp-form-group">
                    <label class="csp-label">Intimation / Claim Number (if any)</label>
                    <input type="text" [(ngModel)]="supportRef" name="supportRef" placeholder="e.g. INT-2026-000184" class="csp-input" />
                  </div>
                  <div class="csp-form-group">
                    <label class="csp-label">Your Question</label>
                    <textarea rows="3" [(ngModel)]="supportMessage" name="supportMessage" placeholder="Ask about procedure, document submission, or hearing schedules..." class="csp-textarea" required></textarea>
                  </div>
                  <button type="submit" class="csp-btn csp-btn-primary" style="width:100%;">
                    <span>Submit Inquiry</span>
                    <app-icon name="arrow-right" [size]="14"></app-icon>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .help-page { padding-bottom: 5rem; }

    .help-hero {
      background: linear-gradient(180deg, var(--csp-ivory) 0%, var(--csp-bg-soft) 100%);
      border-bottom: 1px solid var(--csp-border);
      padding: 3.5rem 1.5rem 3rem;
      text-align: center;
    }

    .help-container { max-width: 1140px; margin: 0 auto; }
    .hero-tag { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--csp-ember); margin-bottom: 0.35rem; }
    .hero-title { font-size: 2.2rem; font-weight: 800; color: var(--csp-charcoal); margin-bottom: 0.5rem; }
    .hero-desc { color: var(--csp-warm-grey); font-size: 1rem; max-width: 600px; margin: 0 auto 2rem; line-height: 1.6; }

    .help-search-box {
      max-width: 640px;
      margin: 0 auto;
      position: relative;
    }

    .search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: var(--csp-warm-grey); }
    .help-search-input {
      width: 100%;
      padding: 0.95rem 1.25rem 0.95rem 3.25rem;
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-pill);
      font-size: 1rem;
      outline: none;
      background: var(--csp-white);
      box-shadow: var(--csp-shadow-sm);
      font-family: inherit;
    }
    .help-search-input:focus {
      border-color: var(--csp-ember);
      box-shadow: 0 0 0 3px rgba(232, 93, 50, 0.15);
    }

    .help-body { padding: 2.5rem 1.5rem 0; }

    .category-chips-row {
      display: flex;
      gap: 0.6rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .cat-chip {
      background: var(--csp-white);
      border: 1px solid var(--csp-border);
      border-radius: var(--csp-radius-pill);
      padding: 0.5rem 1.15rem;
      font-size: 0.86rem;
      font-weight: 600;
      color: var(--csp-charcoal);
      cursor: pointer;
      transition: var(--csp-transition);
    }
    .cat-chip:hover { border-color: var(--csp-clay-dark); }
    .cat-chip.active {
      background: var(--csp-charcoal);
      color: var(--csp-white);
      border-color: var(--csp-charcoal);
    }

    .help-grid-layout {
      display: grid;
      grid-template-columns: 1.3fr 0.7fr;
      gap: 2.5rem;
      align-items: flex-start;
    }

    .section-subhead {
      font-size: 1.2rem;
      font-weight: 800;
      color: var(--csp-charcoal);
      margin-bottom: 1.25rem;
    }

    .faq-accordion-list { display: flex; flex-direction: column; gap: 0.85rem; }
    .faq-card { overflow: hidden; }
    .faq-header-btn {
      width: 100%;
      background: none;
      border: none;
      padding: 1.25rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      text-align: left;
      cursor: pointer;
      font-family: inherit;
    }

    .faq-cat-tag { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--csp-ember); display: block; margin-bottom: 0.2rem; }
    .faq-q-title { font-size: 0.98rem; font-weight: 700; color: var(--csp-charcoal); margin: 0; }
    .faq-body { padding: 0 1.25rem 1.25rem; border-top: 1px solid var(--csp-bg-soft); }
    .faq-answer-text { color: var(--csp-warm-grey); font-size: 0.88rem; line-height: 1.6; margin: 0.75rem 0 0; }

    .sidebar-column { display: flex; flex-direction: column; gap: 1.5rem; }
    .milestone-item { margin-bottom: 0.85rem; font-size: 0.86rem; line-height: 1.5; }
    .milestone-item:last-child { margin-bottom: 0; }
    .milestone-item strong { color: var(--csp-charcoal); display: block; }
    .milestone-item span { color: var(--csp-warm-grey); }

    @media (max-width: 900px) {
      .help-grid-layout { grid-template-columns: 1fr; }
    }
  `]
})
export class PublicHelpComponent {
  private toast = inject(ToastService);

  searchQuery = '';
  selectedCategory = 'All Topics';

  categories = [
    'All Topics',
    'General Intimation',
    'Required Documents',
    'Bodily Injury & Medical',
    'Property Damage (TPPD)',
    'MACT & Lok Adalat'
  ];

  faqs: FAQ[] = [
    {
      category: 'General Intimation',
      question: 'Who is considered a "Third Party" in motor accidents?',
      answer: 'In motor insurance, the "First Party" is the policyholder/owner, the "Second Party" is the insurance provider, and the "Third Party" is any individual outside this contract who suffers bodily injury, demise, or property damage caused by the insured motor vehicle (such as pedestrians, occupants of other vehicles, or property owners).',
      isOpen: true
    },
    {
      category: 'Required Documents',
      question: 'Is an official police FIR strictly mandatory for third-party claims?',
      answer: 'An FIR or an attested copy of the station diary entry (CSR) is standard statutory proof of the accident. In hit-and-run incidents or major bodily injuries, an FIR is indispensable to establish the involvement of the insured vehicle and confirm the accident circumstances.',
      isOpen: false
    },
    {
      category: 'Bodily Injury & Medical',
      question: 'How are medical expenses reimbursed for injured third-party victims?',
      answer: 'Third-party claimants submit authenticated medical admission records, doctor prescription slips, and itemized pharmacy bills with GSTIN particulars. Once verified against hospital treatment summaries, fair compensation is assessed under Section 166 or Section 163A guidelines.',
      isOpen: false
    },
    {
      category: 'Property Damage (TPPD)',
      question: 'What is the maximum statutory coverage for Third-Party Property Damage?',
      answer: 'Under standard Indian Motor Tariff regulations, Third-Party Property Damage (TPPD) coverage is generally capped at ₹7,50,000 for private cars and commercial vehicles unless the policy explicitly includes higher contractual endorsements.',
      isOpen: false
    },
    {
      category: 'MACT & Lok Adalat',
      question: 'What is the role of National Lok Adalat in claim settlements?',
      answer: 'National Lok Adalats organized by District Legal Services Authorities (DLSA) facilitate speedy, amicable, and mutual conciliation between third-party victims and insurers, eliminating lengthy court trials and enabling direct compensation orders.',
      isOpen: false
    },
    {
      category: 'General Intimation',
      question: 'How do I know my claim handler has received my intimation?',
      answer: 'Upon submitting your intimation, an official tracking reference (e.g. INT-2026-000184) is instantly generated on the acknowledgement screen and logged in our system. You can verify progress anytime on the Track Claim page.',
      isOpen: false
    }
  ];

  get filteredFaqs(): FAQ[] {
    return this.faqs.filter(faq => {
      const matchesCat = this.selectedCategory === 'All Topics' || faq.category === this.selectedCategory;
      const q = this.searchQuery.toLowerCase().trim();
      const matchesSearch = !q || faq.question.toLowerCase().includes(q) || faq.answer.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }

  supportName = '';
  supportContact = '';
  supportRef = '';
  supportMessage = '';

  sendInquiry() {
    this.toast.success(
      `Inquiry received from ${this.supportName}. A claims specialist will follow up shortly.`,
      'Inquiry Submitted'
    );
    this.supportName = '';
    this.supportContact = '';
    this.supportRef = '';
    this.supportMessage = '';
  }
}
