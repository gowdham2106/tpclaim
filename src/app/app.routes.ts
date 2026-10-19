import { Routes } from '@angular/router';

// Layouts
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { StaffLayoutComponent } from './layouts/staff-layout/staff-layout.component';

// Public Portal Pages (1 - 13)
import { LandingComponent } from './features/public/landing/landing.component';
import { RoleSelectionComponent } from './features/public/role-selection/role-selection.component';
import { IntimationComponent } from './features/public/intimation/intimation.component';
import { LossTypeComponent } from './features/public/loss-type/loss-type.component';
import { ClaimantInfoComponent } from './features/public/claimant-info/claimant-info.component';
import { VehicleDetailsComponent } from './features/public/vehicle-details/vehicle-details.component';
import { DocumentUploadComponent } from './features/public/document-upload/document-upload.component';
import { ReviewComponent } from './features/public/review/review.component';
import { AcknowledgementComponent } from './features/public/acknowledgement/acknowledgement.component';
import { TrackClaimComponent } from './features/public/track-claim/track-claim.component';
import { ClaimDetailsComponent } from './features/public/claim-details/claim-details.component';
import { AdditionalDocumentsComponent } from './features/public/additional-documents/additional-documents.component';
import { PublicHelpComponent } from './features/public/help/help.component';

// Authentication (Page 14)
import { LoginComponent } from './features/auth/login/login.component';

// Staff Operations Portal Pages (15 - 40)
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { IntimationsComponent } from './features/claims/intimations/intimations.component';
import { WorkQueueComponent } from './features/claims/work-queue/work-queue.component';
import { ClaimRegistrationComponent } from './features/claims/claim-registration/claim-registration.component';
import { Claim360Component } from './features/claims/claim-360/claim-360.component';
import { InvestigationComponent } from './features/investigation/investigation.component';
import { EvidenceComponent } from './features/evidence/evidence.component';
import { PartiesComponent } from './features/claims/parties/parties.component';
import { LegalMactComponent } from './features/legal/legal-mact.component';
import { LiabilityAssessmentComponent } from './features/assessment/liability-assessment.component';
import { CompensationAssessmentComponent } from './features/assessment/compensation-assessment.component';
import { ApprovalsComponent } from './features/approvals/approvals.component';
import { SettlementProcessingComponent } from './features/settlement/settlement-processing.component';
import { PaymentTrackingComponent } from './features/settlement/payment-tracking.component';
import { ClaimClosureComponent } from './features/claims/claim-closure/claim-closure.component';
import { DocumentCentreComponent } from './features/documents/document-centre.component';
import { DocumentVerificationComponent } from './features/documents/document-verification.component';
import { DocumentRequestsComponent } from './features/documents/document-requests.component';
import { NotificationsComponent } from './features/communication/notifications.component';
import { TasksRemindersComponent } from './features/communication/tasks-reminders.component';
import { CommunicationHistoryComponent } from './features/communication/communication-history.component';
import { ReportsAnalyticsComponent } from './features/analytics/reports-analytics.component';
import { UserManagementComponent } from './features/administration/user-management.component';
import { RolesPermissionsComponent } from './features/administration/roles-permissions.component';
import { SystemSettingsComponent } from './features/administration/system-settings.component';
import { InternalHelpComponent } from './features/help/internal-help.component';

const publicChildRoutes: Routes = [
  { path: '', component: LandingComponent, title: 'ClaimShield Plus | Third-Party Motor Insurance Portal' },
  { path: 'role-selection', component: RoleSelectionComponent, title: 'Select Claimant Role | ClaimShield Plus' },
  { path: 'intimation', component: IntimationComponent, title: 'Report Accident Intimation | ClaimShield Plus' },
  { path: 'loss-type', component: LossTypeComponent, title: 'Select Loss Classification | ClaimShield Plus' },
  { path: 'claimant-info', component: ClaimantInfoComponent, title: 'Claimant Particulars | ClaimShield Plus' },
  { path: 'vehicle-details', component: VehicleDetailsComponent, title: 'Vehicle & Accident Details | ClaimShield Plus' },
  { path: 'document-upload', component: DocumentUploadComponent, title: 'Upload Supporting Documents | ClaimShield Plus' },
  { path: 'review', component: ReviewComponent, title: 'Review & Declaration | ClaimShield Plus' },
  { path: 'acknowledgement', component: AcknowledgementComponent, title: 'Submission Confirmed | ClaimShield Plus' },
  { path: 'track-claim', component: TrackClaimComponent, title: 'Track Claim Status | ClaimShield Plus' },
  { path: 'claim-details/:id', component: ClaimDetailsComponent, title: 'Claim Details & Progress | ClaimShield Plus' },
  { path: 'additional-documents', component: AdditionalDocumentsComponent, title: 'Submit Requested Documents | ClaimShield Plus' },
  { path: 'additional-documents/:requestId', component: AdditionalDocumentsComponent, title: 'Submit Requested Document | ClaimShield Plus' },
  { path: 'help', component: PublicHelpComponent, title: 'Help & Claimant Guidance | ClaimShield Plus' }
];

export const routes: Routes = [
  // Authentication (Page 14)
  { path: 'auth/login', component: LoginComponent, title: 'Staff Login | ClaimShield Plus' },

  // Public Claimant Journey (Pages 1 to 13) - Accessible via root paths
  {
    path: '',
    component: PublicLayoutComponent,
    children: publicChildRoutes
  },

  // Public Claimant Journey (Pages 1 to 13) - Also accessible via /public/ prefix
  {
    path: 'public',
    component: PublicLayoutComponent,
    children: publicChildRoutes
  },

  // Internal Operations Portal (Pages 15 to 40)
  {
    path: 'ops',
    component: StaffLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent, title: 'Operations Dashboard | ClaimShield Plus' },
      { path: 'intimations', component: IntimationsComponent, title: 'Claim Intimations | ClaimShield Plus' },
      { path: 'work-queue', component: WorkQueueComponent, title: 'Claims Work Queue | ClaimShield Plus' },
      { path: 'claim-registration', component: ClaimRegistrationComponent, title: 'Register Claim | ClaimShield Plus' },
      { path: 'claim-registration/:intimationRef', component: ClaimRegistrationComponent, title: 'Register Claim | ClaimShield Plus' },
      { path: 'claim-360', redirectTo: 'claim-360/TP-2026-001842', pathMatch: 'full' },
      { path: 'claim-360/:id', component: Claim360Component, title: 'Claim 360 Workspace | ClaimShield Plus' },
      { path: 'investigation', component: InvestigationComponent, title: 'Investigation & Field Survey | ClaimShield Plus' },
      { path: 'evidence', component: EvidenceComponent, title: 'Evidence Management Repository | ClaimShield Plus' },
      { path: 'parties', component: PartiesComponent, title: 'Claimant & Parties Directory | ClaimShield Plus' },
      { path: 'legal-mact', component: LegalMactComponent, title: 'Legal & MACT Tribunal Management | ClaimShield Plus' },
      { path: 'liability-assessment', component: LiabilityAssessmentComponent, title: 'Liability Assessment | ClaimShield Plus' },
      { path: 'compensation-assessment', component: CompensationAssessmentComponent, title: 'Compensation Assessment | ClaimShield Plus' },
      { path: 'approvals', component: ApprovalsComponent, title: 'Approvals & Governance Mandates | ClaimShield Plus' },
      { path: 'settlement-processing', component: SettlementProcessingComponent, title: 'Settlement Processing | ClaimShield Plus' },
      { path: 'payment-tracking', component: PaymentTrackingComponent, title: 'Payment & Payout Tracking | ClaimShield Plus' },
      { path: 'claim-closure', component: ClaimClosureComponent, title: 'Claim Closure & Discharge | ClaimShield Plus' },
      { path: 'document-centre', component: DocumentCentreComponent, title: 'Document Centre Repository | ClaimShield Plus' },
      { path: 'document-verification', component: DocumentVerificationComponent, title: 'Document Verification | ClaimShield Plus' },
      { path: 'document-requests', component: DocumentRequestsComponent, title: 'Additional Document Requests | ClaimShield Plus' },
      { path: 'notifications', component: NotificationsComponent, title: 'Operations Notifications | ClaimShield Plus' },
      { path: 'tasks-reminders', component: TasksRemindersComponent, title: 'Tasks & Reminders | ClaimShield Plus' },
      { path: 'communication-history', component: CommunicationHistoryComponent, title: 'Communication History | ClaimShield Plus' },
      { path: 'reports-analytics', component: ReportsAnalyticsComponent, title: 'Reports & Analytics | ClaimShield Plus' },
      { path: 'user-management', component: UserManagementComponent, title: 'User Management | ClaimShield Plus' },
      { path: 'roles-permissions', component: RolesPermissionsComponent, title: 'Roles & Permissions Matrix | ClaimShield Plus' },
      { path: 'system-settings', component: SystemSettingsComponent, title: 'System Settings & SLA Configuration | ClaimShield Plus' },
      { path: 'internal-help', component: InternalHelpComponent, title: 'Internal Operations SOPs & Help | ClaimShield Plus' }
    ]
  },

  // Fallback
  { path: '**', redirectTo: '' }
];
