export type StaffRole = 
  | 'Claim Handler' 
  | 'Investigator' 
  | 'Legal Officer' 
  | 'Approver' 
  | 'Settlement / Finance Officer' 
  | 'Administrator';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  department: string;
  avatarInitials: string;
  isActive: boolean;
  assignedWorkload: number;
  lastActive: string;
  phone: string;
}

export interface RolePermission {
  role: StaffRole;
  canViewClaims: boolean;
  canEditClaims: boolean;
  canReviewDocuments: boolean;
  canAssignStaff: boolean;
  canAssessLiability: boolean;
  canAssessCompensation: boolean;
  canApproveDecisions: boolean;
  canProcessSettlements: boolean;
  canManageUsers: boolean;
  description: string;
}

export interface SystemSettings {
  orgName: string;
  portalTitle: string;
  claimPrefix: string;
  intimationPrefix: string;
  slaDaysVerification: number;
  slaDaysInvestigation: number;
  slaDaysAssessment: number;
  slaDaysSettlement: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
  autoAssignHandlers: boolean;
  highValueThreshold: number;
  allowReopeningClosedClaims: boolean;
}
