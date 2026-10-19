export interface EvidenceItem {
  id: string;
  claimRef: string;
  category: 'Accident Scene' | 'Vehicle Damage' | 'CCTV Footage' | 'Witness Statement' | 'Police Spot Map' | 'Forensic Report';
  description: string;
  source: string;
  receivedDate: string;
  reviewer: string;
  reviewStatus: 'Received' | 'Under Review' | 'Verified' | 'Rejected';
  comments: string;
  fileUrl?: string;
}

export interface InvestigationRecord {
  id: string;
  claimRef: string;
  investigatorName: string;
  assignedDate: string;
  status: 'Assigned' | 'Field Visit Scheduled' | 'Site Inspected' | 'Report Submitted' | 'Closed';
  accidentChronology: string;
  policeFirDetails: string;
  witnessDetails: string;
  inspectionNotes: string;
  findings: string;
  internalNotes: string;
  followUpTasks: string;
}

export interface LegalCaseRecord {
  id: string;
  claimRef: string;
  caseReference: string; // e.g. "MACT-CHN-2026-0492"
  tribunalCourt: string;
  caseDate: string;
  petitioner: string;
  respondents: string[];
  advocateName: string;
  hearingDates: string[];
  nextHearingDate: string;
  caseStatus: 'Notice Received' | 'Written Statement Filed' | 'Evidence Stage' | 'Arguments Scheduled' | 'Award Pronounced' | 'Out of Court Settlement';
  legalNotes: string;
  nextAction: string;
}

export interface LiabilityAssessment {
  id: string;
  claimRef: string;
  assessorName: string;
  assessmentDate: string;
  accidentCircumstances: string;
  contributoryNegligence: string;
  policyBreachCheck: 'No Breach Found' | 'Suspected Drunk Driving' | 'Invalid DL' | 'Permit Lapsed' | 'Under Investigation';
  liabilityPercentage: number; // e.g. 100% or 80%
  rationale: string;
  reviewerComments: string;
  status: 'Draft' | 'Further Investigation Required' | 'Assessed & Verified';
}

export interface CompensationAssessment {
  id: string;
  claimRef: string;
  claimedAmount: number;
  medicalExpensesClaimed: number;
  medicalExpensesAssessed: number;
  lossOfEarningsClaimed: number;
  lossOfEarningsAssessed: number;
  painAndSufferingAssessed: number;
  propertyRepairClaimed: number;
  propertyRepairAssessed: number;
  totalProposedAssessment: number;
  calculationSummary: string;
  rationale: string;
  reviewerComments: string;
  status: 'Draft' | 'Submitted for Approval' | 'Approved' | 'Revision Requested';
}

export interface ApprovalRecord {
  id: string;
  claimRef: string;
  approverName: string;
  approverRole: string;
  decision: 'Pending' | 'Approved' | 'Returned for Reassessment' | 'Information Requested' | 'Declined';
  decisionDate?: string;
  proposedAmount: number;
  approvedAmount?: number;
  notes: string;
  conditions?: string;
}
