export type SettlementStatus = 
  | 'Pending Review' 
  | 'Ready for Processing' 
  | 'Processing' 
  | 'Completed' 
  | 'Failed';

export interface SettlementRecord {
  id: string;
  claimRef: string;
  approvedAmount: number;
  beneficiaryName: string;
  beneficiaryBank: string;
  accountNumberMasked: string;
  ifscCode: string;
  mandateVerified: boolean;
  financeReviewStatus: 'Pending Review' | 'Finance Approved' | 'Correction Needed';
  settlementStatus: SettlementStatus;
  transactionReference: string; // e.g. "TXN-CSP-2026-90412"
  initiatedDate: string;
  completedDate?: string;
  settlementNotes: string;
}

export interface PaymentTransaction {
  id: string;
  claimRef: string;
  transactionRef: string;
  amount: number;
  beneficiaryName: string;
  paymentMode: 'NEFT' | 'RTGS' | 'Court Deposit' | 'Demand Draft';
  requestDate: string;
  completionDate?: string;
  paymentStatus: 'Pending' | 'In Process' | 'Settled' | 'Failed';
  utrNumber?: string;
  remarks: string;
}
