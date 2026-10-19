import { Injectable, signal, computed } from '@angular/core';
import { ClaimRecord, ClaimStage, ClaimStatus, ClaimParty, ActivityLog, InternalNote } from '../models/claim.model';
import { DocumentItem, DocumentRequest } from '../models/document.model';
import { EvidenceItem, InvestigationRecord, LegalCaseRecord, LiabilityAssessment, CompensationAssessment, ApprovalRecord } from '../models/assessment.model';
import { SettlementRecord, PaymentTransaction } from '../models/settlement.model';
import { UserRecord, RolePermission, SystemSettings } from '../models/user.model';
import { TaskItem, NotificationItem, CommunicationLog } from '../models/task.model';

const STORAGE_KEY = 'claimshield_plus_demo_state_v1';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  // Signals for state
  claims = signal<ClaimRecord[]>([]);
  documents = signal<DocumentItem[]>([]);
  documentRequests = signal<DocumentRequest[]>([]);
  investigations = signal<InvestigationRecord[]>([]);
  evidenceItems = signal<EvidenceItem[]>([]);
  legalCases = signal<LegalCaseRecord[]>([]);
  liabilityAssessments = signal<LiabilityAssessment[]>([]);
  compensationAssessments = signal<CompensationAssessment[]>([]);
  approvals = signal<ApprovalRecord[]>([]);
  settlements = signal<SettlementRecord[]>([]);
  payments = signal<PaymentTransaction[]>([]);
  users = signal<UserRecord[]>([]);
  permissions = signal<RolePermission[]>([]);
  tasks = signal<TaskItem[]>([]);
  notifications = signal<NotificationItem[]>([]);
  communications = signal<CommunicationLog[]>([]);
  settings = signal<SystemSettings>({
    orgName: 'ClaimShield Plus Motor Assurance Operations',
    portalTitle: 'ClaimShield Plus Enterprise Portal',
    claimPrefix: 'TP-2026-',
    intimationPrefix: 'INT-2026-',
    slaDaysVerification: 3,
    slaDaysInvestigation: 14,
    slaDaysAssessment: 7,
    slaDaysSettlement: 5,
    emailNotifications: true,
    smsNotifications: true,
    autoAssignHandlers: true,
    highValueThreshold: 500000,
    allowReopeningClosedClaims: false
  });

  // Current logged in user (for staff demo role simulation)
  currentUser = signal<UserRecord>({
    id: 'USR-01',
    name: 'Ananya Raman',
    email: 'ananya.raman@claimshieldplus.internal',
    role: 'Claim Handler',
    department: 'Motor TP Claims Hub - South',
    avatarInitials: 'AR',
    isActive: true,
    assignedWorkload: 14,
    lastActive: 'Just now',
    phone: '+91 98401 23456'
  });

  // Computed metrics
  openClaimsCount = computed(() => this.claims().filter(c => c.status !== 'Closed').length);
  newIntimationsCount = computed(() => this.claims().filter(c => !c.id || c.status === 'New Intimation' || c.status === 'Registration Pending').length);
  awaitingDocsCount = computed(() => this.claims().filter(c => c.status === 'Awaiting Additional Documents').length);
  investigationsCount = computed(() => this.claims().filter(c => c.status === 'Investigation In Progress' || c.currentStage === 'Investigation').length);
  legalReviewsCount = computed(() => this.claims().filter(c => c.status === 'Legal Review Pending' || c.currentStage === 'Legal / MACT').length);
  pendingApprovalsCount = computed(() => this.claims().filter(c => c.status === 'Pending Approval' || c.currentStage === 'Approvals').length);
  settlementsInProgressCount = computed(() => this.claims().filter(c => c.status === 'Settlement Processing' || c.currentStage === 'Settlement Processing').length);
  closedThisMonthCount = computed(() => this.claims().filter(c => c.status === 'Closed').length);

  constructor() {
    this.initData();
  }

  private initData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.claims.set(parsed.claims || []);
        this.documents.set(parsed.documents || []);
        this.documentRequests.set(parsed.documentRequests || []);
        this.investigations.set(parsed.investigations || []);
        this.evidenceItems.set(parsed.evidenceItems || []);
        this.legalCases.set(parsed.legalCases || []);
        this.liabilityAssessments.set(parsed.liabilityAssessments || []);
        this.compensationAssessments.set(parsed.compensationAssessments || []);
        this.approvals.set(parsed.approvals || []);
        this.settlements.set(parsed.settlements || []);
        this.payments.set(parsed.payments || []);
        this.users.set(parsed.users || []);
        this.permissions.set(parsed.permissions || []);
        this.tasks.set(parsed.tasks || []);
        this.notifications.set(parsed.notifications || []);
        this.communications.set(parsed.communications || []);
        if (parsed.settings) this.settings.set(parsed.settings);
        if (parsed.currentUser) this.currentUser.set(parsed.currentUser);
        return;
      } catch (e) {
        console.warn('Failed parsing cached demo state, initializing fresh defaults', e);
      }
    }
    this.loadDefaultDemoData();
  }

  resetDemoData() {
    localStorage.removeItem(STORAGE_KEY);
    this.loadDefaultDemoData();
  }

  saveState() {
    const state = {
      claims: this.claims(),
      documents: this.documents(),
      documentRequests: this.documentRequests(),
      investigations: this.investigations(),
      evidenceItems: this.evidenceItems(),
      legalCases: this.legalCases(),
      liabilityAssessments: this.liabilityAssessments(),
      compensationAssessments: this.compensationAssessments(),
      approvals: this.approvals(),
      settlements: this.settlements(),
      payments: this.payments(),
      users: this.users(),
      permissions: this.permissions(),
      tasks: this.tasks(),
      notifications: this.notifications(),
      communications: this.communications(),
      settings: this.settings(),
      currentUser: this.currentUser()
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('Storage quota or storage failure', e);
    }
  }

  private loadDefaultDemoData() {
    const defaultClaims: ClaimRecord[] = [
      {
        id: 'TP-2026-001842',
        intimationRef: 'INT-2026-000184',
        dateReported: '2026-03-08',
        accidentDate: '2026-03-06',
        accidentTime: '18:45',
        accidentLocation: 'GST Road, Near Guindy Flyover',
        accidentCity: 'Chennai',
        accidentState: 'Tamil Nadu',
        policeStation: 'J-1 Saidapet Traffic PS',
        firNumber: 'FIR/124/2026',
        accidentDescription: 'Insured car struck claimant two-wheeler from rear while waiting at signal intersection causing fracture to right leg and vehicle damage.',
        claimantName: 'Ravi Kumar',
        claimantRole: 'Third-party injured person',
        claimantPhone: '+91 94441 58210',
        claimantEmail: 'ravi.kumar.tp@example.com',
        claimantAddress: '14/B, 2nd Cross Street, Alandur, Chennai, TN 600016',
        contactPreference: 'Phone',
        lossType: 'Bodily Injury',
        lossDetails: 'Fracture of right tibia-fibula, lacerations, 14 days inpatient hospitalisation.',
        insuredVehicleNumber: 'TN 09 AB 1234',
        vehicleMakeModel: 'Hyundai Creta 1.5 SX',
        vehicleType: 'Private Motor Car',
        policyNumber: 'CSP-MOT-2025-992184',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Karthik Sundaram',
        driverName: 'Suresh Babu',
        driverLicenseNo: 'TN-09-2018-0049182',
        thirdPartyVehicleNumber: 'TN 11 P 4021 (Honda Activa)',
        currentStage: 'Document Verification',
        status: 'Awaiting Additional Documents',
        priority: 'High',
        assignedHandler: 'Ananya Raman',
        assignedInvestigator: 'Dinesh Balan',
        assignedLegalOfficer: 'Adv. Meenakshi S.',
        lastUpdated: '2026-03-12 14:30',
        claimedAmount: 480000,
        assessedAmount: 375000,
        approvedAmount: 0,
        paidAmount: 0,
        parties: [
          {
            id: 'P-1',
            name: 'Ravi Kumar',
            role: 'Claimant',
            phone: '+91 94441 58210',
            email: 'ravi.kumar.tp@example.com',
            address: '14/B, 2nd Cross Street, Alandur, Chennai',
            isVerified: true
          },
          {
            id: 'P-2',
            name: 'Karthik Sundaram',
            role: 'Vehicle Owner',
            phone: '+91 98840 91820',
            email: 'karthik.sundaram@example.com',
            address: 'Plot 45, Anna Nagar West, Chennai',
            isVerified: true
          },
          {
            id: 'P-3',
            name: 'Suresh Babu',
            role: 'Driver',
            phone: '+91 97908 11200',
            email: 'suresh.babu.driver@example.com',
            address: '22, Medavakkam Main Road, Chennai',
            isVerified: true
          }
        ],
        activities: [
          {
            id: 'ACT-1',
            timestamp: '2026-03-08 10:15',
            actor: 'Ravi Kumar',
            actorRole: 'Claimant',
            action: 'Intimation Submitted',
            details: 'Public portal intimation recorded successfully with reference INT-2026-000184.',
            stage: 'Accident Intimation'
          },
          {
            id: 'ACT-2',
            timestamp: '2026-03-09 11:20',
            actor: 'Ananya Raman',
            actorRole: 'Claim Handler',
            action: 'Claim Registered',
            details: 'Intimation verified and registered as official TP claim TP-2026-001842.',
            stage: 'Claim Registration'
          },
          {
            id: 'ACT-3',
            timestamp: '2026-03-10 16:40',
            actor: 'Ananya Raman',
            actorRole: 'Claim Handler',
            action: 'Additional Documents Requested',
            details: 'Discharge summary and authentic pharmacy invoice receipts requested from claimant.',
            stage: 'Document Verification'
          }
        ],
        notes: [
          {
            id: 'NOTE-1',
            author: 'Ananya Raman',
            role: 'Claim Handler',
            date: '2026-03-09',
            content: 'Policy is active with no break-in. Valid commercial endorsements not required as vehicle is private. DL verified on Parivahan Sarathi.'
          }
        ]
      },
      {
        id: 'TP-2026-001955',
        intimationRef: 'INT-2026-000192',
        dateReported: '2026-03-01',
        accidentDate: '2026-02-27',
        accidentTime: '23:15',
        accidentLocation: 'Outer Ring Road, Near Rohini Sector 18',
        accidentCity: 'New Delhi',
        accidentState: 'Delhi',
        policeStation: 'Samaypur Badli PS',
        firNumber: 'FIR/89/2026',
        accidentDescription: 'Commercial truck hit pedestrian crossing the road. Victim succumbed to severe head trauma.',
        claimantName: 'Sunita Sharma',
        claimantRole: 'Representative of a deceased victim',
        claimantPhone: '+91 98112 34900',
        claimantEmail: 'sunita.sharma.tp@example.com',
        claimantAddress: 'H-19, Sector 15, Rohini, Delhi 110089',
        contactPreference: 'Phone',
        lossType: 'Fatal Accident',
        lossDetails: 'Victim age 42 years, sole earning member. Survived by spouse and two dependents.',
        insuredVehicleNumber: 'DL 01 CZ 4492',
        vehicleMakeModel: 'Tata 407 LPT Heavy Goods',
        vehicleType: 'Commercial Goods Carrier',
        policyNumber: 'CSP-COM-2025-110294',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Apex Logistics Pvt Ltd',
        driverName: 'Harpreet Singh',
        driverLicenseNo: 'DL-04-2015-8849201',
        thirdPartyVehicleNumber: 'N/A (Pedestrian)',
        currentStage: 'Investigation',
        status: 'Investigation In Progress',
        priority: 'Urgent',
        assignedHandler: 'Rajesh Menon',
        assignedInvestigator: 'Kavita Chhabra',
        assignedLegalOfficer: 'Adv. Harish Grover',
        lastUpdated: '2026-03-11 09:15',
        claimedAmount: 2500000,
        assessedAmount: 1850000,
        approvedAmount: 0,
        paidAmount: 0,
        parties: [
          {
            id: 'P-11',
            name: 'Sunita Sharma',
            role: 'Claimant',
            phone: '+91 98112 34900',
            email: 'sunita.sharma.tp@example.com',
            address: 'H-19, Sector 15, Rohini, Delhi',
            isVerified: true
          },
          {
            id: 'P-12',
            name: 'Late Rakesh Sharma',
            role: 'Deceased',
            phone: 'N/A',
            email: 'N/A',
            address: 'H-19, Sector 15, Rohini, Delhi',
            isVerified: true
          }
        ],
        activities: [
          {
            id: 'ACT-11',
            timestamp: '2026-03-01 14:00',
            actor: 'Sunita Sharma',
            actorRole: 'Claimant',
            action: 'Intimation Submitted',
            details: 'Fatal loss intimation received.',
            stage: 'Accident Intimation'
          },
          {
            id: 'ACT-12',
            timestamp: '2026-03-02 11:30',
            actor: 'Rajesh Menon',
            actorRole: 'Claim Handler',
            action: 'Investigator Assigned',
            details: 'Independent investigator Kavita Chhabra assigned for scene spot inspection and legal heir verification.',
            stage: 'Investigation'
          }
        ],
        notes: []
      },
      {
        id: 'TP-2026-002011',
        intimationRef: 'INT-2026-000205',
        dateReported: '2026-02-18',
        accidentDate: '2026-02-16',
        accidentTime: '08:30',
        accidentLocation: 'Eastern Express Highway, Mulund Toll Naka',
        accidentCity: 'Mumbai',
        accidentState: 'Maharashtra',
        policeStation: 'Navghar Police Station',
        firNumber: 'CR-No-72/2026',
        accidentDescription: 'Insured vehicle swerved abruptly and collided with claimant car, causing severe injuries to two passengers.',
        claimantName: 'Mohammed Arshad',
        claimantRole: 'Third-party injured person',
        claimantPhone: '+91 98205 66712',
        claimantEmail: 'arshad.mohd@example.com',
        claimantAddress: 'Flat 402, Al-Madina Heights, Kurla West, Mumbai 400070',
        contactPreference: 'Email',
        lossType: 'Bodily Injury',
        lossDetails: 'Pelvic bone displacement and cervical sprain. Underwent orthopedic intervention.',
        insuredVehicleNumber: 'MH 02 BK 7821',
        vehicleMakeModel: 'Maruti Suzuki Ertiga VXi',
        vehicleType: 'Private Motor Car',
        policyNumber: 'CSP-MOT-2025-449102',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Sunil Deshpande',
        driverName: 'Sunil Deshpande',
        driverLicenseNo: 'MH-02-2012-0038192',
        thirdPartyVehicleNumber: 'MH 03 DR 5591',
        currentStage: 'Legal / MACT',
        status: 'Legal Review Pending',
        priority: 'High',
        assignedHandler: 'Priya Deshmukh',
        assignedInvestigator: 'Nitin Kadam',
        assignedLegalOfficer: 'Adv. Sanjay Joshi',
        lastUpdated: '2026-03-10 17:00',
        claimedAmount: 850000,
        assessedAmount: 620000,
        approvedAmount: 0,
        paidAmount: 0,
        parties: [],
        activities: [],
        notes: []
      },
      {
        id: 'TP-2026-002104',
        intimationRef: 'INT-2026-000214',
        dateReported: '2026-02-10',
        accidentDate: '2026-02-09',
        accidentTime: '15:20',
        accidentLocation: 'Hosur Road, Near Silk Board Junction',
        accidentCity: 'Bengaluru',
        accidentState: 'Karnataka',
        policeStation: 'Madiwala Traffic Police Station',
        firNumber: 'FIR/312/2026',
        accidentDescription: 'Insured tipper truck lost brake pressure and rammed into boundary wall and parked luxury sedan.',
        claimantName: 'Venkatesh Iyer',
        claimantRole: 'Vehicle or property owner',
        claimantPhone: '+91 99801 44552',
        claimantEmail: 'venkat.iyer@example.com',
        claimantAddress: 'Villa 12, Sobha Morzaria Grandeur, Bannerghatta Road, Bengaluru 560029',
        contactPreference: 'Phone',
        lossType: 'Third-Party Property Damage',
        lossDetails: 'Total front structural damage to BMW 330i and compound gate destruction.',
        insuredVehicleNumber: 'KA 05 MC 3319',
        vehicleMakeModel: 'BharatBenz 1617R Tipper',
        vehicleType: 'Commercial Goods Carrier',
        policyNumber: 'CSP-COM-2025-667104',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Metro Infra Constructions',
        driverName: 'Manjunatha K.',
        driverLicenseNo: 'KA-05-2016-1192847',
        thirdPartyVehicleNumber: 'KA 01 MJ 0007',
        currentStage: 'Approvals',
        status: 'Pending Approval',
        priority: 'Medium',
        assignedHandler: 'Ananya Raman',
        assignedInvestigator: 'Gopal Hegde',
        assignedLegalOfficer: 'Adv. Shridhar Rao',
        lastUpdated: '2026-03-12 11:00',
        claimedAmount: 750000,
        assessedAmount: 580000,
        approvedAmount: 580000,
        paidAmount: 0,
        parties: [],
        activities: [],
        notes: []
      },
      {
        id: 'TP-2026-002189',
        intimationRef: 'INT-2026-000228',
        dateReported: '2026-01-20',
        accidentDate: '2026-01-18',
        accidentTime: '19:10',
        accidentLocation: 'GT Road, Near Jalandhar Bypass',
        accidentCity: 'Ludhiana',
        accidentState: 'Punjab',
        policeStation: 'Division No. 8 Police Station',
        firNumber: 'FIR/44/2026',
        accidentDescription: 'Sideswipe collision between insured bus and claimant motorcycle.',
        claimantName: 'Gurpreet Singh',
        claimantRole: 'Third-party injured person',
        claimantPhone: '+91 98765 22109',
        claimantEmail: 'gurpreet.singh@example.com',
        claimantAddress: 'Street 4, Model Town, Ludhiana, Punjab 141002',
        contactPreference: 'Phone',
        lossType: 'Bodily Injury',
        lossDetails: 'Collar bone fracture and soft tissue injury.',
        insuredVehicleNumber: 'PB 10 DJ 8912',
        vehicleMakeModel: 'Ashok Leyland Viking Bus',
        vehicleType: 'Passenger Carrying Vehicle',
        policyNumber: 'CSP-PCV-2025-881920',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Northern Travels Ltd',
        driverName: 'Kulwant Singh',
        driverLicenseNo: 'PB-10-2014-9920182',
        thirdPartyVehicleNumber: 'PB 10 EZ 3190',
        currentStage: 'Settlement Processing',
        status: 'Settlement Processing',
        priority: 'Medium',
        assignedHandler: 'Vikram Sethi',
        assignedInvestigator: 'Jatinder Pal',
        assignedLegalOfficer: 'Adv. Amarjit Gill',
        lastUpdated: '2026-03-12 16:00',
        claimedAmount: 320000,
        assessedAmount: 260000,
        approvedAmount: 260000,
        paidAmount: 0,
        parties: [],
        activities: [],
        notes: []
      },
      {
        id: 'TP-2026-001550',
        intimationRef: 'INT-2026-000140',
        dateReported: '2025-12-05',
        accidentDate: '2025-12-03',
        accidentTime: '12:30',
        accidentLocation: 'OMR, Sholinganallur Junction',
        accidentCity: 'Chennai',
        accidentState: 'Tamil Nadu',
        policeStation: 'Semmancheri Traffic Police Station',
        firNumber: 'FIR/502/2025',
        accidentDescription: 'Two-wheeler pillion rider fell due to insured car abrupt lane cut.',
        claimantName: 'Lakshmi Narayanan',
        claimantRole: 'Third-party injured person',
        claimantPhone: '+91 94440 19283',
        claimantEmail: 'lakshmi.n@example.com',
        claimantAddress: 'Plot 8, TNHB Colony, Sholinganallur, Chennai 600119',
        contactPreference: 'Phone',
        lossType: 'Bodily Injury',
        lossDetails: 'Ligament tear and minor abrasions.',
        insuredVehicleNumber: 'TN 02 XY 5522',
        vehicleMakeModel: 'Honda City i-VTEC',
        vehicleType: 'Private Motor Car',
        policyNumber: 'CSP-MOT-2025-102948',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Vasanth Raman',
        driverName: 'Vasanth Raman',
        driverLicenseNo: 'TN-02-2010-0029102',
        thirdPartyVehicleNumber: 'TN 07 BE 8812',
        currentStage: 'Claim Closure',
        status: 'Closed',
        priority: 'Low',
        assignedHandler: 'Rajesh Menon',
        assignedInvestigator: 'Dinesh Balan',
        assignedLegalOfficer: 'Adv. Meenakshi S.',
        lastUpdated: '2026-02-15 10:00',
        claimedAmount: 180000,
        assessedAmount: 145000,
        approvedAmount: 145000,
        paidAmount: 145000,
        parties: [],
        activities: [],
        notes: []
      },
      {
        id: '',
        intimationRef: 'INT-2026-000249',
        dateReported: '2026-03-12',
        accidentDate: '2026-03-11',
        accidentTime: '21:40',
        accidentLocation: 'SG Highway, Near ISKCON Cross Road',
        accidentCity: 'Ahmedabad',
        accidentState: 'Gujarat',
        policeStation: 'Satellite Police Station',
        firNumber: 'Pending / Not Recorded',
        accidentDescription: 'Hit-and-run: Unknown silver sedan hit claimant motorcycle and fled scene. Bystanders noted vehicle partial registration.',
        claimantName: 'Amit Patel',
        claimantRole: 'Third-party injured person',
        claimantPhone: '+91 98980 12345',
        claimantEmail: 'amit.patel.gj@example.com',
        claimantAddress: 'B-304, Shivalik Residency, Satellite, Ahmedabad 380015',
        contactPreference: 'Phone',
        lossType: 'Hit-and-Run',
        lossDetails: 'Severe ankle dislocation and deep abrasion injuries.',
        insuredVehicleNumber: 'GJ 01 KL 9012 (Reported Match)',
        vehicleMakeModel: 'Maruti Suzuki Dzire',
        vehicleType: 'Private Motor Car',
        policyNumber: 'CSP-MOT-2025-778219',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Under Verification',
        driverName: 'Unknown at this stage',
        driverLicenseNo: 'Pending Police Investigation',
        thirdPartyVehicleNumber: 'GJ 01 RR 4410',
        currentStage: 'Accident Intimation',
        status: 'Registration Pending',
        priority: 'Urgent',
        assignedHandler: 'Priya Deshmukh',
        lastUpdated: '2026-03-12 18:00',
        claimedAmount: 350000,
        assessedAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
        parties: [],
        activities: [
          {
            id: 'ACT-INT-1',
            timestamp: '2026-03-12 18:00',
            actor: 'Amit Patel',
            actorRole: 'Claimant',
            action: 'Intimation Submitted',
            details: 'Hit-and-run intimation submitted online. Awaiting handler triage and registration.',
            stage: 'Accident Intimation'
          }
        ],
        notes: []
      },
      {
        id: '',
        intimationRef: 'INT-2026-000255',
        dateReported: '2026-03-12',
        accidentDate: '2026-03-12',
        accidentTime: '07:15',
        accidentLocation: 'NH 48, Near Manesar Industrial Gate',
        accidentCity: 'Gurugram',
        accidentState: 'Haryana',
        policeStation: 'Manesar Police Station',
        firNumber: 'Under Process',
        accidentDescription: 'Multi-vehicle collision during dense morning fog involving insured commercial truck, auto-rickshaw and cyclist.',
        claimantName: 'Meera Chawla',
        claimantRole: 'Legal representative',
        claimantPhone: '+91 99100 88219',
        claimantEmail: 'meera.chawla.legal@example.com',
        claimantAddress: 'Sector 56, Golf Course Extension, Gurugram 122011',
        contactPreference: 'Email',
        lossType: 'Multiple Loss Types',
        lossDetails: 'Multiple injured persons, passenger disability and vehicle total write-off.',
        insuredVehicleNumber: 'HR 26 BE 7711',
        vehicleMakeModel: 'Eicher Pro 3015 Truck',
        vehicleType: 'Commercial Goods Carrier',
        policyNumber: 'CSP-COM-2025-559281',
        insurerName: 'ClaimShield Plus Assurance',
        insuredPersonName: 'Haryana Transways Corp',
        driverName: 'Ramphal Yadav',
        driverLicenseNo: 'HR-26-2017-0091823',
        thirdPartyVehicleNumber: 'HR 26 T 1120',
        currentStage: 'Accident Intimation',
        status: 'Registration Pending',
        priority: 'High',
        assignedHandler: 'Ananya Raman',
        lastUpdated: '2026-03-12 19:20',
        claimedAmount: 1400000,
        assessedAmount: 0,
        approvedAmount: 0,
        paidAmount: 0,
        parties: [],
        activities: [],
        notes: []
      }
    ];

    const defaultDocuments: DocumentItem[] = [
      {
        id: 'DOC-01',
        claimRef: 'TP-2026-001842',
        name: 'First Information Report (FIR Copy)',
        category: 'Police & FIR',
        fileName: 'FIR_124_Saidapet_Signed.pdf',
        fileSize: '1.8 MB',
        fileType: 'application/pdf',
        uploadDate: '2026-03-08',
        uploadedBy: 'Ravi Kumar (Claimant)',
        version: 1,
        status: 'Verified',
        verifiedBy: 'Ananya Raman',
        verifiedDate: '2026-03-09'
      },
      {
        id: 'DOC-02',
        claimRef: 'TP-2026-001842',
        name: 'Claimant Aadhaar ID Proof',
        category: 'Claimant Identity',
        fileName: 'Ravi_Kumar_Aadhaar_Masked.pdf',
        fileSize: '840 KB',
        fileType: 'application/pdf',
        uploadDate: '2026-03-08',
        uploadedBy: 'Ravi Kumar (Claimant)',
        version: 1,
        status: 'Verified',
        verifiedBy: 'Ananya Raman',
        verifiedDate: '2026-03-09'
      },
      {
        id: 'DOC-03',
        claimRef: 'TP-2026-001842',
        name: 'Hospital Inpatient Admission Sheet',
        category: 'Medical Records',
        fileName: 'MIOT_Hospital_Admission_Record.pdf',
        fileSize: '3.2 MB',
        fileType: 'application/pdf',
        uploadDate: '2026-03-08',
        uploadedBy: 'Ravi Kumar (Claimant)',
        version: 1,
        status: 'Under Review',
        notes: 'Final discharge summary still pending.'
      },
      {
        id: 'DOC-04',
        claimRef: 'TP-2026-001842',
        name: 'Accident Scene Photos (4 views)',
        category: 'Accident & Vehicle Photos',
        fileName: 'Scene_Photos_Guindy_GST.jpg',
        fileSize: '4.5 MB',
        fileType: 'image/jpeg',
        uploadDate: '2026-03-08',
        uploadedBy: 'Ravi Kumar (Claimant)',
        version: 1,
        status: 'Verified',
        verifiedBy: 'Dinesh Balan (Investigator)',
        verifiedDate: '2026-03-10'
      },
      {
        id: 'DOC-05',
        claimRef: 'TP-2026-001955',
        name: 'Post-Mortem & Death Certificate',
        category: 'Medical Records',
        fileName: 'PostMortem_Rohini_Mortuary.pdf',
        fileSize: '2.4 MB',
        fileType: 'application/pdf',
        uploadDate: '2026-03-01',
        uploadedBy: 'Sunita Sharma',
        version: 1,
        status: 'Verified',
        verifiedBy: 'Rajesh Menon',
        verifiedDate: '2026-03-03'
      },
      {
        id: 'DOC-06',
        claimRef: 'TP-2026-002104',
        name: 'Authorized Garage Structural Repair Estimate',
        category: 'Property Damage / Repair Estimate',
        fileName: 'BMW_Navnit_Repair_Quote_6512.pdf',
        fileSize: '1.9 MB',
        fileType: 'application/pdf',
        uploadDate: '2026-02-12',
        uploadedBy: 'Venkatesh Iyer',
        version: 1,
        status: 'Verified',
        verifiedBy: 'Ananya Raman',
        verifiedDate: '2026-02-15'
      }
    ];

    const defaultRequests: DocumentRequest[] = [
      {
        id: 'REQ-01',
        claimRef: 'TP-2026-001842',
        requestedDocument: 'Final Hospital Discharge Summary with Doctor Sign-off',
        category: 'Medical Records',
        reason: 'Initial admission sheet uploaded; final discharge summary needed to assess total disability & duration of immobilisation.',
        requestedDate: '2026-03-10',
        dueDate: '2026-03-24',
        claimantStatus: 'Requested',
        assignedHandler: 'Ananya Raman'
      },
      {
        id: 'REQ-02',
        claimRef: 'TP-2026-001842',
        requestedDocument: 'Original Pharmacy Invoices with GSTIN and Prescriptions',
        category: 'Medical Bills',
        reason: 'Uploaded pharmacy slips lack prescription cross-reference numbers needed for claims compliance.',
        requestedDate: '2026-03-10',
        dueDate: '2026-03-24',
        claimantStatus: 'Requested',
        assignedHandler: 'Ananya Raman'
      },
      {
        id: 'REQ-03',
        claimRef: 'TP-2026-001955',
        requestedDocument: 'Legal Heirship Certificate or Family Tree Affidavit',
        category: 'Legal & MACT Documents',
        reason: 'Required by MACT settlement bench to confirm all dependent legal representatives.',
        requestedDate: '2026-03-03',
        dueDate: '2026-03-31',
        claimantStatus: 'Submitted — Awaiting Review',
        assignedHandler: 'Rajesh Menon',
        submittedFile: 'Legal_Heir_Tahsildar_Certified.pdf',
        responseComments: 'Obtained certified extract from Delhi Revenue Sub-division.'
      }
    ];

    const defaultInvestigations: InvestigationRecord[] = [
      {
        id: 'INV-01',
        claimRef: 'TP-2026-001842',
        investigatorName: 'Dinesh Balan',
        assignedDate: '2026-03-09',
        status: 'Field Visit Scheduled',
        accidentChronology: '06-Mar-2026 18:45 hrs: Insured car was travelling southbound on GST Road. Claimant on two-wheeler was decelerating for red signal at Guindy junction. Car collided into two-wheeler tail.',
        policeFirDetails: 'FIR 124/2026 registered under Sections 279, 337 IPC at Saidapet PS. Insured car driver surrendered DL; breathalyzer test result negative.',
        witnessDetails: 'Traffic police constable PC-4412 witnessed impact. Statements recorded.',
        inspectionNotes: 'Two-wheeler damaged on rear fender, silencer, and chassis bend. Car sustained bumper cracked and license plate frame fracture.',
        findings: 'Prima facie rear-end collision indicates sole liability on insured motor vehicle. No contributory negligence detected.',
        internalNotes: 'Driver license was valid on date of accident. Commercial use excluded.',
        followUpTasks: 'Collect vehicle inspection report (Motor Vehicle Inspector - MVI certificate) from Guindy RTO.'
      },
      {
        id: 'INV-02',
        claimRef: 'TP-2026-001955',
        investigatorName: 'Kavita Chhabra',
        assignedDate: '2026-03-02',
        status: 'Report Submitted',
        accidentChronology: '27-Feb-2026 23:15 hrs: Commercial goods carrier travelling at high speed on ORR Rohini. Pedestrian crossing unlit segment.',
        policeFirDetails: 'FIR 89/2026 under Sections 279, 304A IPC. Truck impounded at Samaypur Badli PS.',
        witnessDetails: 'Dhaba owner at Sector 18 confirmed high speed of truck.',
        inspectionNotes: 'Heavy damage to front left radiator grille and bumper.',
        findings: 'Insured vehicle driver was on long interstate haul exceeding permissible driving shift. Route permit valid.',
        internalNotes: 'High liability exposure. Prepare for Section 166 MACT petition settlement.',
        followUpTasks: 'Secure fitness certificate and toll plaza RFID logs.'
      }
    ];

    const defaultEvidence: EvidenceItem[] = [
      {
        id: 'EVD-01',
        claimRef: 'TP-2026-001842',
        category: 'Accident Scene',
        description: 'Guindy Junction CCTV snapshot showing traffic stop and impact position.',
        source: 'Greater Chennai Traffic Police Control Room',
        receivedDate: '2026-03-10',
        reviewer: 'Dinesh Balan',
        reviewStatus: 'Verified',
        comments: 'Confirms claimant two-wheeler was stationary at stop line.'
      },
      {
        id: 'EVD-02',
        claimRef: 'TP-2026-001842',
        category: 'Vehicle Damage',
        description: 'MVI (Motor Vehicle Inspector) inspection certificate form 54.',
        source: 'RTO Chennai South (Guindy)',
        receivedDate: '2026-03-11',
        reviewer: 'Ananya Raman',
        reviewStatus: 'Verified',
        comments: 'Certified no mechanical defect caused the accident.'
      },
      {
        id: 'EVD-03',
        claimRef: 'TP-2026-001955',
        category: 'Witness Statement',
        description: 'Notarized statement of roadside eyewitness Satish Kumar.',
        source: 'Independent Investigation Fieldwork',
        receivedDate: '2026-03-04',
        reviewer: 'Kavita Chhabra',
        reviewStatus: 'Verified',
        comments: 'Corroborates truck speed and timing.'
      }
    ];

    const defaultLegalCases: LegalCaseRecord[] = [
      {
        id: 'LEG-01',
        claimRef: 'TP-2026-002011',
        caseReference: 'MACT-MUM-2026-0924',
        tribunalCourt: 'Motor Accidents Claims Tribunal, Mumbai City Civil Court',
        caseDate: '2026-02-28',
        petitioner: 'Mohammed Arshad & Anr.',
        respondents: ['Sunil Deshpande (Insured)', 'ClaimShield Plus Assurance Co.'],
        advocateName: 'Adv. Sanjay Joshi (Panel Advocate)',
        hearingDates: ['2026-03-05 (Appearance & Notice)', '2026-03-28 (Written Statement)'],
        nextHearingDate: '2026-03-28',
        caseStatus: 'Written Statement Filed',
        legalNotes: 'Section 166 petition filed claiming Rs 8,50,000. Defense draft prepared on medical multiplier grounds.',
        nextAction: 'File WS rebutting exaggerated pain and suffering claim with certified doctor opinion.'
      },
      {
        id: 'LEG-02',
        claimRef: 'TP-2026-001955',
        caseReference: 'MACT-DEL-2026-0312',
        tribunalCourt: 'Motor Accident Claims Tribunal, Rohini District Courts',
        caseDate: '2026-03-05',
        petitioner: 'Sunita Sharma & Ors.',
        respondents: ['Apex Logistics Pvt Ltd', 'ClaimShield Plus Assurance'],
        advocateName: 'Adv. Harish Grover',
        hearingDates: ['2026-03-15 (First Hearing)'],
        nextHearingDate: '2026-03-15',
        caseStatus: 'Notice Received',
        legalNotes: 'Pre-litigation conciliation recommended under Lok Adalat route to reduce interest accrual.',
        nextAction: 'Explore structured settlement under National Lok Adalat calendar.'
      }
    ];

    const defaultLiability: LiabilityAssessment[] = [
      {
        id: 'LIA-01',
        claimRef: 'TP-2026-001842',
        assessorName: 'Ananya Raman',
        assessmentDate: '2026-03-10',
        accidentCircumstances: 'Rear-end shunt at signalized road junction. Insured vehicle driver failed to maintain safe braking distance.',
        contributoryNegligence: 'Zero contributory negligence attributed to claimant two-wheeler rider.',
        policyBreachCheck: 'No Breach Found',
        liabilityPercentage: 100,
        rationale: 'Police FIR, CCTV footage, and MVI report clearly confirm insured vehicle struck stationary two-wheeler. Insured driver holds valid driving license and policy is in force.',
        reviewerComments: 'Full 100% statutory liability on insurer. Proceed with compensation assessment on submission of remaining hospital discharge summary.',
        status: 'Assessed & Verified'
      },
      {
        id: 'LIA-02',
        claimRef: 'TP-2026-002104',
        assessorName: 'Ananya Raman',
        assessmentDate: '2026-02-25',
        accidentCircumstances: 'Commercial tipper brake failure caused impact to parked luxury sedan and residential gate.',
        contributoryNegligence: 'Zero (Vehicle was lawfully parked in residential driveway).',
        policyBreachCheck: 'No Breach Found',
        liabilityPercentage: 100,
        rationale: 'Driver possessed valid transport license. Fitness certificate valid on date of accident.',
        reviewerComments: 'Liability confirmed. Property damage assessment capped under policy limits.',
        status: 'Assessed & Verified'
      }
    ];

    const defaultCompensation: CompensationAssessment[] = [
      {
        id: 'COM-01',
        claimRef: 'TP-2026-001842',
        claimedAmount: 480000,
        medicalExpensesClaimed: 240000,
        medicalExpensesAssessed: 195000,
        lossOfEarningsClaimed: 120000,
        lossOfEarningsAssessed: 80000,
        painAndSufferingAssessed: 60000,
        propertyRepairClaimed: 50000,
        propertyRepairAssessed: 40000,
        totalProposedAssessment: 375000,
        calculationSummary: 'Medical Inpatient: Rs 1,95,000 (after deducting non-medical hygiene charges) + Loss of Earnings for 2 months recovery @ Rs 40,000/mo + Pain & Suffering Rs 60,000 + Two-wheeler structural repairs Rs 40,000.',
        rationale: 'Claimant is a senior accounts executive earning Rs 45,000/mo (ITR verified). Two months sick leave verified from employer.',
        reviewerComments: 'Ready for submission to Senior Claims Approver upon receipt of discharge summary.',
        status: 'Draft'
      },
      {
        id: 'COM-02',
        claimRef: 'TP-2026-002104',
        claimedAmount: 750000,
        medicalExpensesClaimed: 0,
        medicalExpensesAssessed: 0,
        lossOfEarningsClaimed: 0,
        lossOfEarningsAssessed: 0,
        painAndSufferingAssessed: 0,
        propertyRepairClaimed: 750000,
        propertyRepairAssessed: 580000,
        totalProposedAssessment: 580000,
        calculationSummary: 'Depreciation applied on BMW rubber and plastic parts as per Indian Motor Tariff TP guidelines + masonry reconstruction of gate.',
        rationale: 'Surveyor depot assessment report finalized at Rs 5,80,000 with agreement from claimant vehicle owner.',
        reviewerComments: 'Recommended for approval.',
        status: 'Submitted for Approval'
      }
    ];

    const defaultApprovals: ApprovalRecord[] = [
      {
        id: 'APP-01',
        claimRef: 'TP-2026-002104',
        approverName: 'Manoj Vasudevan',
        approverRole: 'Senior Claims Approver & Zonal Head',
        decision: 'Approved',
        decisionDate: '2026-03-11',
        proposedAmount: 580000,
        approvedAmount: 580000,
        notes: 'Liability and surveyor depreciation verified. Settlement authorized for Rs 5,80,000 directly to vehicle repairer and property owner.',
        conditions: 'Obtain full and final discharge voucher on stamp paper before NEFT transfer.'
      },
      {
        id: 'APP-02',
        claimRef: 'TP-2026-002189',
        approverName: 'Manoj Vasudevan',
        approverRole: 'Senior Claims Approver & Zonal Head',
        decision: 'Approved',
        decisionDate: '2026-03-08',
        proposedAmount: 260000,
        approvedAmount: 260000,
        notes: 'Out-of-court mutual settlement agreed. All medical bills verified.',
        conditions: 'Standard Section 163A/166 consent memo to be signed.'
      }
    ];

    const defaultSettlements: SettlementRecord[] = [
      {
        id: 'SET-01',
        claimRef: 'TP-2026-002189',
        approvedAmount: 260000,
        beneficiaryName: 'Gurpreet Singh',
        beneficiaryBank: 'State Bank of India',
        accountNumberMasked: '•••• •••• 9921',
        ifscCode: 'SBIN0001428',
        mandateVerified: true,
        financeReviewStatus: 'Finance Approved',
        settlementStatus: 'Processing',
        transactionReference: 'TXN-CSP-2026-88192',
        initiatedDate: '2026-03-11',
        settlementNotes: 'Direct bank mandate validated with cancelled cheque copy. Payment batch queued for electronic RTGS dispatch.'
      },
      {
        id: 'SET-02',
        claimRef: 'TP-2026-001550',
        approvedAmount: 145000,
        beneficiaryName: 'Lakshmi Narayanan',
        beneficiaryBank: 'HDFC Bank',
        accountNumberMasked: '•••• •••• 5510',
        ifscCode: 'HDFC0000240',
        mandateVerified: true,
        financeReviewStatus: 'Finance Approved',
        settlementStatus: 'Completed',
        transactionReference: 'TXN-CSP-2026-44102',
        initiatedDate: '2026-02-10',
        completedDate: '2026-02-12',
        settlementNotes: 'Full settlement credited. Form 109 Discharge Voucher archived.'
      }
    ];

    const defaultPayments: PaymentTransaction[] = [
      {
        id: 'PAY-01',
        claimRef: 'TP-2026-001550',
        transactionRef: 'TXN-CSP-2026-44102',
        amount: 145000,
        beneficiaryName: 'Lakshmi Narayanan',
        paymentMode: 'NEFT',
        requestDate: '2026-02-10',
        completionDate: '2026-02-12',
        paymentStatus: 'Settled',
        utrNumber: 'HDFCR5202602120098412',
        remarks: 'Claimant compensation settlement for bodily injury claim.'
      },
      {
        id: 'PAY-02',
        claimRef: 'TP-2026-002189',
        transactionRef: 'TXN-CSP-2026-88192',
        amount: 260000,
        beneficiaryName: 'Gurpreet Singh',
        paymentMode: 'RTGS',
        requestDate: '2026-03-11',
        paymentStatus: 'In Process',
        remarks: 'Batch electronic credit awaiting clearing cycle.'
      }
    ];

    const defaultUsers: UserRecord[] = [
      {
        id: 'USR-01',
        name: 'Ananya Raman',
        email: 'ananya.raman@claimshieldplus.internal',
        role: 'Claim Handler',
        department: 'Motor TP Claims Hub - South',
        avatarInitials: 'AR',
        isActive: true,
        assignedWorkload: 14,
        lastActive: 'Just now',
        phone: '+91 98401 23456'
      },
      {
        id: 'USR-02',
        name: 'Rajesh Menon',
        email: 'rajesh.menon@claimshieldplus.internal',
        role: 'Claim Handler',
        department: 'Motor TP Claims Hub - North',
        avatarInitials: 'RM',
        isActive: true,
        assignedWorkload: 18,
        lastActive: '15 mins ago',
        phone: '+91 98110 98765'
      },
      {
        id: 'USR-03',
        name: 'Dinesh Balan',
        email: 'dinesh.balan@claimshieldplus.internal',
        role: 'Investigator',
        department: 'Field Investigation & Forensics',
        avatarInitials: 'DB',
        isActive: true,
        assignedWorkload: 9,
        lastActive: '1 hour ago',
        phone: '+91 94445 11223'
      },
      {
        id: 'USR-04',
        name: 'Adv. Meenakshi S.',
        email: 'meenakshi.legal@claimshieldplus.internal',
        role: 'Legal Officer',
        department: 'MACT Litigation & Conciliation',
        avatarInitials: 'MS',
        isActive: true,
        assignedWorkload: 22,
        lastActive: '30 mins ago',
        phone: '+91 98412 88990'
      },
      {
        id: 'USR-05',
        name: 'Manoj Vasudevan',
        email: 'manoj.vasudevan@claimshieldplus.internal',
        role: 'Approver',
        department: 'Zonal Operations & Underwriting Risk',
        avatarInitials: 'MV',
        isActive: true,
        assignedWorkload: 12,
        lastActive: '2 hours ago',
        phone: '+91 98200 44556'
      },
      {
        id: 'USR-06',
        name: 'Pooja Bhatt',
        email: 'pooja.bhatt@claimshieldplus.internal',
        role: 'Settlement / Finance Officer',
        department: 'Treasury & Claims Disbursement',
        avatarInitials: 'PB',
        isActive: true,
        assignedWorkload: 8,
        lastActive: '45 mins ago',
        phone: '+91 98980 66778'
      },
      {
        id: 'USR-07',
        name: 'Vikramaditya Rao',
        email: 'admin@claimshieldplus.internal',
        role: 'Administrator',
        department: 'Enterprise IT & Security Architecture',
        avatarInitials: 'VR',
        isActive: true,
        assignedWorkload: 0,
        lastActive: 'Today at 08:30',
        phone: '+91 99000 11224'
      }
    ];

    const defaultPermissions: RolePermission[] = [
      {
        role: 'Claim Handler',
        canViewClaims: true,
        canEditClaims: true,
        canReviewDocuments: true,
        canAssignStaff: true,
        canAssessLiability: true,
        canAssessCompensation: true,
        canApproveDecisions: false,
        canProcessSettlements: false,
        canManageUsers: false,
        description: 'End-to-end claim registration, party onboarding, document verification, and initial liability analysis.'
      },
      {
        role: 'Investigator',
        canViewClaims: true,
        canEditClaims: false,
        canReviewDocuments: true,
        canAssignStaff: false,
        canAssessLiability: false,
        canAssessCompensation: false,
        canApproveDecisions: false,
        canProcessSettlements: false,
        canManageUsers: false,
        description: 'Field inspection, police liaison, witness examination, forensic photography, and accident reconstruction.'
      },
      {
        role: 'Legal Officer',
        canViewClaims: true,
        canEditClaims: true,
        canReviewDocuments: true,
        canAssignStaff: false,
        canAssessLiability: true,
        canAssessCompensation: true,
        canApproveDecisions: false,
        canProcessSettlements: false,
        canManageUsers: false,
        description: 'MACT court appearances, written statement preparation, tribunal summons, and Lok Adalat compromise awards.'
      },
      {
        role: 'Approver',
        canViewClaims: true,
        canEditClaims: true,
        canReviewDocuments: true,
        canAssignStaff: true,
        canAssessLiability: true,
        canAssessCompensation: true,
        canApproveDecisions: true,
        canProcessSettlements: false,
        canManageUsers: false,
        description: 'Senior underwriting and risk authority reviewing proposed compensations up to institutional authority matrix.'
      },
      {
        role: 'Settlement / Finance Officer',
        canViewClaims: true,
        canEditClaims: true,
        canReviewDocuments: true,
        canAssignStaff: false,
        canAssessLiability: false,
        canAssessCompensation: false,
        canApproveDecisions: false,
        canProcessSettlements: true,
        canManageUsers: false,
        description: 'Bank mandate validation, electronic funds transfer (NEFT/RTGS), voucher reconciliation, and UTR tracking.'
      },
      {
        role: 'Administrator',
        canViewClaims: true,
        canEditClaims: true,
        canReviewDocuments: true,
        canAssignStaff: true,
        canAssessLiability: true,
        canAssessCompensation: true,
        canApproveDecisions: true,
        canProcessSettlements: true,
        canManageUsers: true,
        description: 'Enterprise governance, user provisioning, role-based authorization, system audit logs, and workflow SLA parameters.'
      }
    ];

    const defaultTasks: TaskItem[] = [
      {
        id: 'TSK-01',
        claimRef: 'TP-2026-001842',
        title: 'Review Hospital Discharge Summary',
        assignedUser: 'Ananya Raman',
        priority: 'High',
        dueDate: '2026-03-24',
        status: 'Pending',
        description: 'Examine medical discharge certificate once uploaded by Ravi Kumar to reconcile hospitalisation dates.',
        category: 'Document Follow-up'
      },
      {
        id: 'TSK-02',
        claimRef: 'TP-2026-001842',
        title: 'Collect Guindy RTO Form 54 Report',
        assignedUser: 'Dinesh Balan',
        priority: 'Medium',
        dueDate: '2026-03-20',
        status: 'In Progress',
        description: 'Liaise with Motor Vehicle Inspector for official physical mechanical fitness certification.',
        category: 'Investigation Visit'
      },
      {
        id: 'TSK-03',
        claimRef: 'TP-2026-001955',
        title: 'Submit Section 166 Defense WS Draft',
        assignedUser: 'Adv. Harish Grover',
        priority: 'Urgent',
        dueDate: '2026-03-15',
        status: 'Pending',
        description: 'Prepare written statement for Rohini MACT tribunal upcoming motion.',
        category: 'Legal Notice'
      },
      {
        id: 'TSK-04',
        claimRef: 'TP-2026-002189',
        title: 'Release RTGS Batch for Claimant Settlement',
        assignedUser: 'Pooja Bhatt',
        priority: 'High',
        dueDate: '2026-03-14',
        status: 'In Progress',
        description: 'Verify beneficiary Gurpreet Singh IFSC with SBI clearing gateway.',
        category: 'Settlement Mandate'
      }
    ];

    const defaultNotifications: NotificationItem[] = [
      {
        id: 'NOTIF-01',
        claimRef: 'INT-2026-000249',
        title: 'New Hit-and-Run Intimation Received',
        message: 'Amit Patel reported a hit-and-run incident in Ahmedabad. Immediate handler triage required.',
        category: 'Intimation',
        timestamp: '15 mins ago',
        isRead: false,
        priority: 'High',
        actionRoute: '/ops/claim-registration'
      },
      {
        id: 'NOTIF-02',
        claimRef: 'TP-2026-001955',
        title: 'Legal Heir Certificate Uploaded',
        message: 'Sunita Sharma uploaded Tahsildar certified legal heir certificate awaiting your review.',
        category: 'Document',
        timestamp: '2 hours ago',
        isRead: false,
        priority: 'Normal',
        actionRoute: '/ops/document-verification'
      },
      {
        id: 'NOTIF-03',
        claimRef: 'TP-2026-002104',
        title: 'Compensation Assessment Approved',
        message: 'Senior Approver Manoj Vasudevan approved Rs 5,80,000 for BMW property damage.',
        category: 'Approval',
        timestamp: 'Yesterday',
        isRead: true,
        priority: 'Normal',
        actionRoute: '/ops/settlement-processing'
      },
      {
        id: 'NOTIF-04',
        claimRef: 'TP-2026-002011',
        title: 'Upcoming MACT Hearing: 28-Mar-2026',
        message: 'Written statement filing deadline in Mumbai MACT tribunal.',
        category: 'Legal',
        timestamp: '2 days ago',
        isRead: true,
        priority: 'High',
        actionRoute: '/ops/legal-mact'
      }
    ];

    const defaultCommunications: CommunicationLog[] = [
      {
        id: 'COM-L1',
        claimRef: 'TP-2026-001842',
        date: '2026-03-10',
        time: '11:45 AM',
        type: 'Outbound Call',
        participants: 'Ananya Raman (Claim Handler) → Ravi Kumar (Claimant)',
        summary: 'Informed claimant that intimation was registered and requested him to upload hospital discharge certificate once received from hospital.',
        status: 'Connected',
        loggedBy: 'Ananya Raman'
      },
      {
        id: 'COM-L2',
        claimRef: 'TP-2026-001842',
        date: '2026-03-10',
        time: '11:50 AM',
        type: 'SMS',
        participants: 'System Gateway → Ravi Kumar',
        summary: 'Automated SMS notification dispatched with document upload link for ref INT-2026-000184.',
        status: 'Delivered',
        loggedBy: 'System'
      },
      {
        id: 'COM-L3',
        claimRef: 'TP-2026-001955',
        date: '2026-03-04',
        time: '03:15 PM',
        type: 'Inbound Call',
        participants: 'Sunita Sharma → Rajesh Menon',
        summary: 'Claimant inquired on status of police spot map and timeline for MACT Lok Adalat notice.',
        status: 'Connected',
        loggedBy: 'Rajesh Menon'
      }
    ];

    this.claims.set(defaultClaims);
    this.documents.set(defaultDocuments);
    this.documentRequests.set(defaultRequests);
    this.investigations.set(defaultInvestigations);
    this.evidenceItems.set(defaultEvidence);
    this.legalCases.set(defaultLegalCases);
    this.liabilityAssessments.set(defaultLiability);
    this.compensationAssessments.set(defaultCompensation);
    this.approvals.set(defaultApprovals);
    this.settlements.set(defaultSettlements);
    this.payments.set(defaultPayments);
    this.users.set(defaultUsers);
    this.permissions.set(defaultPermissions);
    this.tasks.set(defaultTasks);
    this.notifications.set(defaultNotifications);
    this.communications.set(defaultCommunications);
    this.saveState();
  }

  // --- Claim Query Helpers ---
  getClaimById(idOrRef: string): ClaimRecord | undefined {
    const term = idOrRef.trim().toUpperCase();
    return this.claims().find(c => 
      (c.id && c.id.toUpperCase() === term) || 
      (c.intimationRef && c.intimationRef.toUpperCase() === term)
    );
  }

  // --- Public Workflow Actions ---
  addIntimation(intimationData: Partial<ClaimRecord>): ClaimRecord {
    const year = new Date().getFullYear();
    const count = this.claims().length + 185;
    const intimationRef = `INT-${year}-000${count}`;

    const newRecord: ClaimRecord = {
      id: '', // Empty until registered by staff
      intimationRef: intimationRef,
      dateReported: new Date().toISOString().split('T')[0],
      accidentDate: intimationData.accidentDate || new Date().toISOString().split('T')[0],
      accidentTime: intimationData.accidentTime || '12:00',
      accidentLocation: intimationData.accidentLocation || '',
      accidentCity: intimationData.accidentCity || '',
      accidentState: intimationData.accidentState || '',
      policeStation: intimationData.policeStation || 'Not specified',
      firNumber: intimationData.firNumber || 'Pending',
      accidentDescription: intimationData.accidentDescription || '',
      claimantName: intimationData.claimantName || 'Third-Party Claimant',
      claimantRole: intimationData.claimantRole || 'Third-party injured person',
      claimantPhone: intimationData.claimantPhone || '',
      claimantEmail: intimationData.claimantEmail || '',
      claimantAddress: intimationData.claimantAddress || '',
      contactPreference: intimationData.contactPreference || 'Phone',
      lossType: intimationData.lossType || 'Bodily Injury',
      lossDetails: intimationData.lossDetails || '',
      insuredVehicleNumber: intimationData.insuredVehicleNumber || '',
      vehicleMakeModel: intimationData.vehicleMakeModel || 'Unknown Make/Model',
      vehicleType: intimationData.vehicleType || 'Private Motor Car',
      policyNumber: intimationData.policyNumber || 'CSP-MOT-2025-GEN' + Math.floor(1000 + Math.random() * 9000),
      insurerName: 'ClaimShield Plus Assurance',
      insuredPersonName: intimationData.insuredPersonName || 'Under Verification',
      driverName: intimationData.driverName || 'Under Verification',
      thirdPartyVehicleNumber: intimationData.thirdPartyVehicleNumber || '',
      currentStage: 'Accident Intimation',
      status: 'New Intimation',
      priority: intimationData.lossType === 'Fatal Accident' ? 'Urgent' : 'High',
      assignedHandler: 'Ananya Raman',
      lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
      claimedAmount: intimationData.claimedAmount || 150000,
      assessedAmount: 0,
      approvedAmount: 0,
      paidAmount: 0,
      parties: [
        {
          id: 'P-' + Math.random().toString(36).substr(2, 6),
          name: intimationData.claimantName || 'Claimant',
          role: 'Claimant',
          phone: intimationData.claimantPhone || '',
          email: intimationData.claimantEmail || '',
          address: intimationData.claimantAddress || '',
          isVerified: false
        }
      ],
      activities: [
        {
          id: 'ACT-' + Date.now(),
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          actor: intimationData.claimantName || 'Claimant',
          actorRole: 'Claimant',
          action: 'Intimation Submitted',
          details: `Accident intimation submitted via public portal with reference ${intimationRef}.`,
          stage: 'Accident Intimation'
        }
      ],
      notes: []
    };

    this.claims.update(list => [newRecord, ...list]);

    // Add notification for staff
    this.addNotification({
      claimRef: intimationRef,
      title: 'New Intimation Submitted',
      message: `${newRecord.claimantName} intimating ${newRecord.lossType} at ${newRecord.accidentCity}. Ref: ${intimationRef}`,
      category: 'Intimation',
      timestamp: 'Just now',
      isRead: false,
      priority: 'High',
      actionRoute: '/ops/claim-registration'
    });

    this.saveState();
    return newRecord;
  }

  // --- Staff Operations Actions ---
  registerClaim(intimationRef: string, handler: string = 'Ananya Raman'): ClaimRecord | null {
    let foundClaim: ClaimRecord | null = null;
    const year = new Date().getFullYear();
    const generatedId = `TP-${year}-00` + Math.floor(2200 + Math.random() * 800);

    this.claims.update(list => list.map(c => {
      if (c.intimationRef === intimationRef) {
        foundClaim = {
          ...c,
          id: generatedId,
          currentStage: 'Document Verification',
          status: 'Documents Under Review',
          assignedHandler: handler,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
          activities: [
            ...c.activities,
            {
              id: 'ACT-' + Date.now(),
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: handler,
              actorRole: 'Claim Handler',
              action: 'Claim Registered',
              details: `Intimation ${intimationRef} officially registered with Claim Number ${generatedId}. Assigned to ${handler}.`,
              stage: 'Claim Registration'
            }
          ]
        };
        return foundClaim;
      }
      return c;
    }));

    if (foundClaim) {
      this.addNotification({
        claimRef: generatedId,
        title: 'Claim Successfully Registered',
        message: `Claim ${generatedId} registered from intimation ${intimationRef}. Stage: Document Verification.`,
        category: 'Intimation',
        timestamp: 'Just now',
        isRead: false,
        priority: 'Normal',
        actionRoute: `/ops/claim-360/${generatedId}`
      });
      this.saveState();
    }

    return foundClaim;
  }

  updateClaimStage(claimIdOrRef: string, stage: ClaimStage, status: ClaimStatus, details?: string) {
    this.claims.update(list => list.map(c => {
      if (c.id === claimIdOrRef || c.intimationRef === claimIdOrRef) {
        const actor = this.currentUser().name;
        return {
          ...c,
          currentStage: stage,
          status: status,
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16),
          activities: [
            ...c.activities,
            {
              id: 'ACT-' + Date.now(),
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
              actor: actor,
              actorRole: this.currentUser().role,
              action: `Stage Changed to ${stage}`,
              details: details || `Status updated to ${status}.`,
              stage: stage
            }
          ]
        };
      }
      return c;
    }));
    this.saveState();
  }

  // --- Document Verification & Requests ---
  verifyDocument(docId: string) {
    const actor = this.currentUser().name;
    const now = new Date().toISOString().split('T')[0];
    let claimRef = '';

    this.documents.update(list => list.map(d => {
      if (d.id === docId) {
        claimRef = d.claimRef;
        return {
          ...d,
          status: 'Verified',
          verifiedBy: actor,
          verifiedDate: now
        };
      }
      return d;
    }));

    if (claimRef) {
      this.logActivity(claimRef, 'Document Verified', `Document ID ${docId} verified by ${actor}.`, 'Document Verification');
    }
    this.saveState();
  }

  rejectDocument(docId: string, reason: string) {
    const actor = this.currentUser().name;
    let claimRef = '';

    this.documents.update(list => list.map(d => {
      if (d.id === docId) {
        claimRef = d.claimRef;
        return {
          ...d,
          status: 'Rejected',
          rejectionReason: reason
        };
      }
      return d;
    }));

    if (claimRef) {
      this.logActivity(claimRef, 'Document Rejected', `Document ID ${docId} rejected with reason: ${reason}`, 'Document Verification');
    }
    this.saveState();
  }

  requestDocument(claimRef: string, requestedDoc: string, category: any, reason: string, dueDate: string) {
    const req: DocumentRequest = {
      id: 'REQ-' + Math.floor(100 + Math.random() * 900),
      claimRef,
      requestedDocument: requestedDoc,
      category,
      reason,
      requestedDate: new Date().toISOString().split('T')[0],
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      claimantStatus: 'Requested',
      assignedHandler: this.currentUser().name
    };

    this.documentRequests.update(list => [req, ...list]);
    this.updateClaimStage(claimRef, 'Document Verification', 'Awaiting Additional Documents', `Document requested: ${requestedDoc}`);
    this.logActivity(claimRef, 'Additional Document Requested', `${requestedDoc} requested from claimant. Reason: ${reason}`, 'Document Verification');
    this.saveState();
  }

  submitDocumentResponse(requestId: string, fileName: string, comments: string = '') {
    let claimRef = '';
    let docName = '';
    let category: any = 'Other Supporting';

    this.documentRequests.update(list => list.map(r => {
      if (r.id === requestId) {
        claimRef = r.claimRef;
        docName = r.requestedDocument;
        category = r.category;
        return {
          ...r,
          claimantStatus: 'Submitted — Awaiting Review',
          submittedFile: fileName,
          responseComments: comments
        };
      }
      return r;
    }));

    // Add to documents list
    const newDoc: DocumentItem = {
      id: 'DOC-' + Math.floor(10 + Math.random() * 90),
      claimRef: claimRef,
      name: docName,
      category: category,
      fileName: fileName,
      fileSize: '1.4 MB',
      fileType: 'application/pdf',
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Claimant (Portal)',
      version: 1,
      status: 'Submitted — Awaiting Review',
      notes: comments
    };

    this.documents.update(docs => [newDoc, ...docs]);
    if (claimRef) {
      this.logActivity(claimRef, 'Additional Document Submitted', `${docName} uploaded by claimant: ${fileName}`, 'Document Verification');
      this.updateClaimStage(claimRef, 'Document Verification', 'Documents Under Review');
    }
    this.saveState();
  }

  // --- Investigation ---
  updateInvestigation(inv: InvestigationRecord) {
    this.investigations.update(list => {
      const idx = list.findIndex(i => i.id === inv.id || i.claimRef === inv.claimRef);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = inv;
        return copy;
      }
      return [inv, ...list];
    });
    this.logActivity(inv.claimRef, 'Investigation Updated', `Status: ${inv.status}. Findings: ${inv.findings.substring(0, 60)}...`, 'Investigation');
    this.saveState();
  }

  addEvidence(evd: EvidenceItem) {
    this.evidenceItems.update(list => [evd, ...list]);
    this.logActivity(evd.claimRef, 'Evidence Logged', `${evd.category}: ${evd.description}`, 'Investigation');
    this.saveState();
  }

  // --- Legal / MACT ---
  updateLegalCase(leg: LegalCaseRecord) {
    this.legalCases.update(list => {
      const idx = list.findIndex(l => l.id === leg.id || l.claimRef === leg.claimRef);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = leg;
        return copy;
      }
      return [leg, ...list];
    });
    this.logActivity(leg.claimRef, 'Legal / MACT Record Updated', `Case ${leg.caseReference} status: ${leg.caseStatus}`, 'Legal / MACT');
    this.saveState();
  }

  // --- Liability Assessment ---
  saveLiabilityAssessment(assessment: LiabilityAssessment) {
    this.liabilityAssessments.update(list => {
      const idx = list.findIndex(a => a.id === assessment.id || a.claimRef === assessment.claimRef);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = assessment;
        return copy;
      }
      return [assessment, ...list];
    });

    this.logActivity(
      assessment.claimRef, 
      'Liability Assessment Saved', 
      `Assessed liability at ${assessment.liabilityPercentage}%. Policy breach check: ${assessment.policyBreachCheck}.`,
      'Liability Assessment'
    );
    this.saveState();
  }

  // --- Compensation Assessment ---
  saveCompensationAssessment(comp: CompensationAssessment) {
    this.compensationAssessments.update(list => {
      const idx = list.findIndex(c => c.id === comp.id || c.claimRef === comp.claimRef);
      if (idx >= 0) {
        const copy = [...list];
        copy[idx] = comp;
        return copy;
      }
      return [comp, ...list];
    });

    this.claims.update(list => list.map(c => {
      if (c.id === comp.claimRef || c.intimationRef === comp.claimRef) {
        return {
          ...c,
          assessedAmount: comp.totalProposedAssessment,
          currentStage: comp.status === 'Submitted for Approval' ? 'Approvals' : c.currentStage,
          status: comp.status === 'Submitted for Approval' ? 'Pending Approval' : c.status
        };
      }
      return c;
    }));

    this.logActivity(
      comp.claimRef, 
      'Compensation Assessment Updated', 
      `Proposed Demo Assessment: ₹${comp.totalProposedAssessment.toLocaleString('en-IN')}. Status: ${comp.status}`,
      'Compensation Assessment'
    );
    this.saveState();
  }

  // --- Approvals ---
  recordApprovalDecision(claimRef: string, decision: 'Approved' | 'Returned for Reassessment' | 'Information Requested' | 'Declined', notes: string, approvedAmount?: number) {
    const approver = this.currentUser().name;
    const record: ApprovalRecord = {
      id: 'APP-' + Math.floor(10 + Math.random() * 90),
      claimRef,
      approverName: approver,
      approverRole: this.currentUser().role,
      decision,
      decisionDate: new Date().toISOString().split('T')[0],
      proposedAmount: approvedAmount || 0,
      approvedAmount: decision === 'Approved' ? approvedAmount : 0,
      notes
    };

    this.approvals.update(list => [record, ...list]);

    if (decision === 'Approved') {
      this.claims.update(list => list.map(c => {
        if (c.id === claimRef || c.intimationRef === claimRef) {
          return {
            ...c,
            approvedAmount: approvedAmount || c.assessedAmount,
            currentStage: 'Settlement Processing',
            status: 'Approved — Ready for Settlement'
          };
        }
        return c;
      }));
      this.logActivity(claimRef, 'Claim Approved for Settlement', `Approved amount: ₹${(approvedAmount || 0).toLocaleString('en-IN')} by ${approver}.`, 'Approvals');
    } else {
      this.updateClaimStage(claimRef, 'Compensation Assessment', 'Assessment In Progress', `Decision: ${decision}. Notes: ${notes}`);
      this.logActivity(claimRef, `Approval Decision: ${decision}`, notes, 'Approvals');
    }

    this.saveState();
  }

  // --- Settlement & Payments ---
  processSettlement(record: Partial<SettlementRecord>) {
    const txnRef = 'TXN-CSP-2026-' + Math.floor(10000 + Math.random() * 90000);
    const newSettlement: SettlementRecord = {
      id: 'SET-' + Math.floor(10 + Math.random() * 90),
      claimRef: record.claimRef || '',
      approvedAmount: record.approvedAmount || 0,
      beneficiaryName: record.beneficiaryName || 'Claimant',
      beneficiaryBank: record.beneficiaryBank || 'State Bank of India',
      accountNumberMasked: record.accountNumberMasked || '•••• •••• ' + Math.floor(1000 + Math.random() * 9000),
      ifscCode: record.ifscCode || 'SBIN0001000',
      mandateVerified: true,
      financeReviewStatus: 'Finance Approved',
      settlementStatus: 'Completed',
      transactionReference: txnRef,
      initiatedDate: new Date().toISOString().split('T')[0],
      completedDate: new Date().toISOString().split('T')[0],
      settlementNotes: record.settlementNotes || 'Direct bank mandate transfer processed successfully in demonstration mode.'
    };

    this.settlements.update(list => [newSettlement, ...list]);

    // Create payment entry
    const payment: PaymentTransaction = {
      id: 'PAY-' + Math.floor(10 + Math.random() * 90),
      claimRef: newSettlement.claimRef,
      transactionRef: txnRef,
      amount: newSettlement.approvedAmount,
      beneficiaryName: newSettlement.beneficiaryName,
      paymentMode: 'NEFT',
      requestDate: newSettlement.initiatedDate,
      completionDate: newSettlement.completedDate,
      paymentStatus: 'Settled',
      utrNumber: 'CSPUTR' + Date.now().toString().substr(4),
      remarks: 'Simulated NEFT compensation transfer.'
    };

    this.payments.update(list => [payment, ...list]);

    // Update claim
    this.claims.update(list => list.map(c => {
      if (c.id === newSettlement.claimRef || c.intimationRef === newSettlement.claimRef) {
        return {
          ...c,
          paidAmount: newSettlement.approvedAmount,
          currentStage: 'Payment Tracking',
          status: 'Settlement Completed'
        };
      }
      return c;
    }));

    this.logActivity(
      newSettlement.claimRef, 
      'Settlement Processed & Dispatched', 
      `₹${newSettlement.approvedAmount.toLocaleString('en-IN')} transferred via NEFT. UTR: ${payment.utrNumber}`,
      'Settlement Processing'
    );
    this.saveState();
  }

  // --- Claim Closure ---
  closeClaim(claimRef: string, closureReason: string, notes: string) {
    this.claims.update(list => list.map(c => {
      if (c.id === claimRef || c.intimationRef === claimRef) {
        return {
          ...c,
          currentStage: 'Claim Closure',
          status: 'Closed',
          lastUpdated: new Date().toISOString().replace('T', ' ').substring(0, 16)
        };
      }
      return c;
    }));

    this.logActivity(
      claimRef, 
      'Claim Officially Closed', 
      `Reason: ${closureReason}. Notes: ${notes}. Closure checklist verified.`,
      'Claim Closure'
    );
    this.saveState();
  }

  // --- Parties & Notes ---
  addParty(claimRef: string, party: Omit<ClaimParty, 'id'>) {
    const newParty: ClaimParty = {
      id: 'P-' + Math.random().toString(36).substr(2, 6),
      ...party
    };
    this.claims.update(list => list.map(c => {
      if (c.id === claimRef || c.intimationRef === claimRef) {
        return {
          ...c,
          parties: [...c.parties, newParty]
        };
      }
      return c;
    }));
    this.logActivity(claimRef, 'Party Added', `${party.role}: ${party.name} added to claim records.`, 'Claim Registration');
    this.saveState();
  }

  addInternalNote(claimRef: string, content: string, isPrivate: boolean = false) {
    const newNote: InternalNote = {
      id: 'NOTE-' + Date.now(),
      author: this.currentUser().name,
      role: this.currentUser().role,
      date: new Date().toISOString().split('T')[0],
      content,
      isPrivate
    };

    this.claims.update(list => list.map(c => {
      if (c.id === claimRef || c.intimationRef === claimRef) {
        return {
          ...c,
          notes: [newNote, ...c.notes]
        };
      }
      return c;
    }));
    this.saveState();
  }

  // --- Tasks & Notifications ---
  addTask(task: Omit<TaskItem, 'id'>) {
    const newTask: TaskItem = {
      id: 'TSK-' + Math.floor(10 + Math.random() * 90),
      ...task
    };
    this.tasks.update(list => [newTask, ...list]);
    this.saveState();
  }

  toggleTaskStatus(taskId: string) {
    this.tasks.update(list => list.map(t => {
      if (t.id === taskId) {
        const nextStatus = t.status === 'Completed' ? 'Pending' : 'Completed';
        return { ...t, status: nextStatus };
      }
      return t;
    }));
    this.saveState();
  }

  addNotification(notif: Omit<NotificationItem, 'id'>) {
    const newNotif: NotificationItem = {
      id: 'NOTIF-' + Date.now(),
      ...notif
    };
    this.notifications.update(list => [newNotif, ...list]);
    this.saveState();
  }

  markNotificationRead(id: string) {
    this.notifications.update(list => list.map(n => n.id === id ? { ...n, isRead: true } : n));
    this.saveState();
  }

  markAllNotificationsRead() {
    this.notifications.update(list => list.map(n => ({ ...n, isRead: true })));
    this.saveState();
  }

  // --- Users & Settings ---
  updateUserRole(userId: string, newRole: any) {
    this.users.update(list => list.map(u => u.id === userId ? { ...u, role: newRole } : u));
    if (this.currentUser().id === userId) {
      this.currentUser.update(u => ({ ...u, role: newRole }));
    }
    this.saveState();
  }

  toggleUserActive(userId: string) {
    this.users.update(list => list.map(u => u.id === userId ? { ...u, isActive: !u.isActive } : u));
    this.saveState();
  }

  addUser(user: Omit<UserRecord, 'id' | 'avatarInitials'>) {
    const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    const newUser: UserRecord = {
      id: 'USR-' + Math.floor(10 + Math.random() * 90),
      avatarInitials: initials,
      ...user
    };
    this.users.update(list => [newUser, ...list]);
    this.saveState();
  }

  closeDocumentRequest(requestId: string, status: 'Completed' | 'Waived' = 'Completed') {
    this.documentRequests.update(list => list.map(r => r.id === requestId ? { ...r, claimantStatus: status } : r));
    this.saveState();
  }

  addCommunicationLog(comm: Omit<CommunicationLog, 'id'>) {
    const newComm: CommunicationLog = {
      id: 'COMM-' + Date.now(),
      ...comm
    };
    this.communications.update(list => [newComm, ...list]);
    this.saveState();
  }

  updateRolePermission(roleName: any, field: string, value: boolean) {
    this.permissions.update(list => list.map(p => {
      if (p.role === roleName) {
        return { ...p, [field]: value };
      }
      return p;
    }));
    this.saveState();
  }

  deleteTask(taskId: string) {
    this.tasks.update(list => list.filter(t => t.id !== taskId));
    this.saveState();
  }

  updateTask(updatedTask: TaskItem) {
    this.tasks.update(list => list.map(t => t.id === updatedTask.id ? updatedTask : t));
    this.saveState();
  }

  updateSettings(newSettings: SystemSettings) {
    this.settings.set(newSettings);
    this.saveState();
  }

  // Helper activity logger
  private logActivity(claimRef: string, action: string, details: string, stage?: ClaimStage) {
    const log: ActivityLog = {
      id: 'ACT-' + Date.now(),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      actor: this.currentUser().name,
      actorRole: this.currentUser().role,
      action,
      details,
      stage
    };

    this.claims.update(list => list.map(c => {
      if (c.id === claimRef || c.intimationRef === claimRef) {
        return {
          ...c,
          activities: [log, ...c.activities],
          lastUpdated: log.timestamp
        };
      }
      return c;
    }));
  }
}
