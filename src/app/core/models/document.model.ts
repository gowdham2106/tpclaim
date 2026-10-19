export type DocumentCategory = 
  | 'Police & FIR' 
  | 'Claimant Identity' 
  | 'Medical Records' 
  | 'Medical Bills' 
  | 'Accident & Vehicle Photos' 
  | 'Property Damage / Repair Estimate' 
  | 'Legal & MACT Documents' 
  | 'Investigation Evidence' 
  | 'Settlement / Bank Mandate' 
  | 'Other Supporting';

export type DocumentReviewStatus = 
  | 'Pending Upload' 
  | 'Submitted — Awaiting Review' 
  | 'Under Review' 
  | 'Verified' 
  | 'Rejected' 
  | 'Replacement Requested';

export interface DocumentItem {
  id: string;
  claimRef: string; // e.g. TP-2026-001842 or INT-2026-000184
  name: string;
  category: DocumentCategory;
  fileName: string;
  fileSize: string;
  fileType: string;
  uploadDate: string;
  uploadedBy: string;
  version: number;
  status: DocumentReviewStatus;
  rejectionReason?: string;
  notes?: string;
  verifiedBy?: string;
  verifiedDate?: string;
}

export interface DocumentRequest {
  id: string;
  claimRef: string;
  requestedDocument: string;
  category: DocumentCategory;
  reason: string;
  requestedDate: string;
  dueDate: string;
  claimantStatus: 'Requested' | 'Submitted — Awaiting Review' | 'Completed' | 'Overdue' | 'Waived';
  assignedHandler: string;
  responseComments?: string;
  submittedFile?: string;
}
