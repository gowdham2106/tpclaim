export type LossType = 
  | 'Bodily Injury' 
  | 'Fatal Accident' 
  | 'Third-Party Property Damage' 
  | 'Hit-and-Run' 
  | 'Multiple Loss Types';

export type ClaimStage = 
  | 'Accident Intimation'
  | 'Claim Registration'
  | 'Document Verification'
  | 'Investigation'
  | 'Legal / MACT'
  | 'Liability Assessment'
  | 'Compensation Assessment'
  | 'Approvals'
  | 'Settlement Processing'
  | 'Payment Tracking'
  | 'Claim Closure';

export type ClaimStatus = 
  | 'New Intimation'
  | 'Registration Pending'
  | 'Awaiting Additional Documents'
  | 'Documents Under Review'
  | 'Investigation In Progress'
  | 'Legal Review Pending'
  | 'Assessment In Progress'
  | 'Pending Approval'
  | 'Approved — Ready for Settlement'
  | 'Settlement Processing'
  | 'Settlement Completed'
  | 'Closed';

export type Priority = 'Urgent' | 'High' | 'Medium' | 'Low';

export interface ActivityLog {
  id: string;
  timestamp: string;
  actor: string;
  actorRole: string;
  action: string;
  details: string;
  stage?: ClaimStage;
}

export interface InternalNote {
  id: string;
  author: string;
  role: string;
  date: string;
  content: string;
  isPrivate?: boolean;
}

export interface ClaimParty {
  id: string;
  name: string;
  role: 'Claimant' | 'Injured Person' | 'Deceased' | 'Vehicle Owner' | 'Driver' | 'Property Owner' | 'Legal Representative' | 'Witness';
  phone: string;
  email: string;
  address: string;
  isVerified: boolean;
  notes?: string;
}

export interface ClaimRecord {
  id: string; // e.g. "TP-2026-001842" or empty if unassigned
  intimationRef: string; // e.g. "INT-2026-000184"
  dateReported: string;
  accidentDate: string;
  accidentTime: string;
  accidentLocation: string;
  accidentCity: string;
  accidentState: string;
  policeStation?: string;
  firNumber?: string;
  accidentDescription: string;
  
  claimantName: string;
  claimantRole: string;
  claimantPhone: string;
  claimantEmail: string;
  claimantAddress: string;
  contactPreference: 'Phone' | 'Email' | 'SMS' | 'WhatsApp';
  
  lossType: LossType;
  lossDetails?: string;
  
  insuredVehicleNumber: string;
  vehicleMakeModel: string;
  vehicleType: string;
  policyNumber: string;
  insurerName: string;
  insuredPersonName: string;
  driverName?: string;
  driverLicenseNo?: string;
  thirdPartyVehicleNumber?: string;
  
  currentStage: ClaimStage;
  status: ClaimStatus;
  priority: Priority;
  assignedHandler: string;
  assignedInvestigator?: string;
  assignedLegalOfficer?: string;
  lastUpdated: string;
  
  // Financial Demo figures
  claimedAmount: number;
  assessedAmount: number;
  approvedAmount: number;
  paidAmount: number;
  
  parties: ClaimParty[];
  activities: ActivityLog[];
  notes: InternalNote[];
}
