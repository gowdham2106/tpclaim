import { Injectable, signal } from '@angular/core';
import { LossType, ClaimRecord } from '../../core/models/claim.model';

export interface WizardDraft {
  claimantRole: string;
  accidentDate: string;
  accidentTime: string;
  accidentLocation: string;
  accidentCity: string;
  accidentState: string;
  policeStation: string;
  firNumber: string;
  accidentDescription: string;
  contactPreference: 'Phone' | 'Email' | 'SMS' | 'WhatsApp';
  lossType: LossType;
  lossDetails: string;
  claimantName: string;
  claimantPhone: string;
  claimantEmail: string;
  claimantAddress: string;
  claimantCity: string;
  claimantState: string;
  claimantPincode: string;
  representativeDetails: string;
  insuredVehicleNumber: string;
  vehicleMakeModel: string;
  vehicleType: string;
  policyNumber: string;
  insuredPersonName: string;
  driverName: string;
  thirdPartyVehicleNumber: string;
  uploadedFiles: { id: string; name: string; category: string; size: string; status: string }[];
  declarationAccepted: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class IntimationWizardService {
  draft = signal<WizardDraft>({
    claimantRole: 'Third-party injured person',
    accidentDate: '2026-03-12',
    accidentTime: '15:30',
    accidentLocation: 'Anna Salai, Near Mount Road Intersection',
    accidentCity: 'Chennai',
    accidentState: 'Tamil Nadu',
    policeStation: 'E-1 Mylapore Police Station',
    firNumber: 'FIR/198/2026',
    accidentDescription: 'Insured car failed to stop at zebra crossing and collided with my two-wheeler while taking a U-turn.',
    contactPreference: 'Phone',
    lossType: 'Bodily Injury',
    lossDetails: 'Ligament tear in left knee and shoulder dislocation.',
    claimantName: 'Kavitha Ramachandran',
    claimantPhone: '+91 98410 44321',
    claimantEmail: 'kavitha.ram@example.com',
    claimantAddress: '42/1, Oliver Road, Mylapore',
    claimantCity: 'Chennai',
    claimantState: 'Tamil Nadu',
    claimantPincode: '600004',
    representativeDetails: '',
    insuredVehicleNumber: 'TN 07 CQ 8819',
    vehicleMakeModel: 'Maruti Suzuki Swift Dzire',
    vehicleType: 'Private Motor Car',
    policyNumber: 'CSP-MOT-2025-441092',
    insuredPersonName: 'Sanjay Kumar Verma',
    driverName: 'Sanjay Kumar Verma',
    thirdPartyVehicleNumber: 'TN 07 BM 3310 (Honda Activa)',
    uploadedFiles: [
      { id: 'F1', name: 'FIR_Mylapore_Station_Certified.pdf', category: 'Police & FIR', size: '1.2 MB', status: 'Uploaded' },
      { id: 'F2', name: 'Aadhaar_Card_Kavitha_Masked.pdf', category: 'Claimant Identity', size: '650 KB', status: 'Uploaded' },
      { id: 'F3', name: 'Mylapore_Orthocare_Hospital_Bill.pdf', category: 'Medical Records', size: '2.1 MB', status: 'Uploaded' }
    ],
    declarationAccepted: false
  });

  updateDraft(partial: Partial<WizardDraft>) {
    this.draft.update(d => ({ ...d, ...partial }));
  }

  resetDraft() {
    this.draft.set({
      claimantRole: 'Third-party injured person',
      accidentDate: '',
      accidentTime: '',
      accidentLocation: '',
      accidentCity: '',
      accidentState: '',
      policeStation: '',
      firNumber: '',
      accidentDescription: '',
      contactPreference: 'Phone',
      lossType: 'Bodily Injury',
      lossDetails: '',
      claimantName: '',
      claimantPhone: '',
      claimantEmail: '',
      claimantAddress: '',
      claimantCity: '',
      claimantState: '',
      claimantPincode: '',
      representativeDetails: '',
      insuredVehicleNumber: '',
      vehicleMakeModel: '',
      vehicleType: 'Private Motor Car',
      policyNumber: '',
      insuredPersonName: '',
      driverName: '',
      thirdPartyVehicleNumber: '',
      uploadedFiles: [],
      declarationAccepted: false
    });
  }
}
