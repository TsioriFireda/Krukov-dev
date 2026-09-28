export type UserRole = 
  | 'admin' 
  | 'secretariat' 
  | 'chef_equipe' 
  | 'equipe_terrain' 
  | 'employe' 
  | 'stagiaire';

export interface UserAccount {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  matricule: string;
  cin?: string;
  qualification?: string;
  bloodGroup?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  healthNotes?: string;
  hourlyRate?: number;
  dailyRate?: number;
  rateType?: 'horaire' | 'journalier' | 'mensuel';
  monthlyBaseSalary?: number;
  active: boolean;
  createdDate?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  nif?: string;
  stat?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  unitPriceHT: number;
  quantity: number;
  vatRate: number;
}

export interface Invoice {
  id: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  totalHT: number;
  totalTTC: number;
  totalVAT: number;
  status: 'pending' | 'paid' | 'cancelled';
  items: InvoiceItem[];
  notes?: string;
  archived?: boolean;
  history?: Array<{
    timestamp: string;
    date: string;
    time: string;
    action: string;
    note: string;
    author: string;
  }>;
}

export interface QuoteItem {
  id: string;
  description: string;
  unitPriceHT: number;
  quantity: number;
  vatRate: number;
}

export interface Quote {
  id: string;
  clientId: string;
  clientName: string;
  issueDate: string;
  validUntil: string;
  totalHT: number;
  totalTTC: number;
  totalVAT: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'pending';
  items: QuoteItem[];
  notes?: string;
  archived?: boolean;
  history?: Array<{
    timestamp: string;
    date: string;
    time: string;
    action: string;
    note: string;
    author: string;
  }>;
}

export interface Transaction {
  id: string;
  date: string;
  type: 'recette' | 'depense';
  category: 'service' | 'achat_materiel' | 'salaire' | 'loyer' | 'carburant' | 'divers';
  description: string;
  amountHT: number;
  amountTTC: number;
  vatAmount: number;
  invoiceId?: string;
  paymentMethod: 'mvola' | 'orange_money' | 'airtel_money' | 'especes' | 'virement' | 'cheque';
  receiptRef?: string;
}

export interface Worker {
  id: string;
  name: string;
  role: string;
  pinCode: string;
  phone?: string;
  active: boolean;
  joinedDate?: string;
}

export interface TimePunch {
  id: string;
  workerId: string;
  workerName: string;
  type: 'arrivee' | 'depart' | 'chantier' | 'pause';
  date: string;
  time: string;
  isoTimestamp: string;
  siteLocation: string;
  taskNote?: string;
  immutableHash?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
}

export interface MissionOrder {
  id: string;
  reference: string;
  issueDate: string;
  startDate: string;
  endDate: string;
  destination: string;
  clientName: string;
  clientContact?: string;
  clientAddress?: string;
  objectOfMission: string;
  leadTechnicianId: string;
  leadTechnicianName: string;
  assignedWorkerIds: string[];
  assignedWorkerNames: string[];
  transportMode?: string;
  vehiclePlate?: string;
  allocatedExpenses?: number;
  equipmentList?: string;
  specialInstructions?: string;
  signedBy?: string;
  status: 'en_cours' | 'cloture' | 'annule';
}

export interface DailyFieldReport {
  id: string;
  date: string;
  time: string;
  workerId: string;
  workerName: string;
  workerRole: UserRole;
  siteName: string;
  clientName?: string;
  workDoneText: string;
  progressPercent: number;
  photos: string[];
  materialsUsed?: string;
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  createdAt: string;
}

export interface SiteIncidentReport {
  id: string;
  workerId: string;
  workerName: string;
  workerRole: UserRole;
  date: string;
  time: string;
  siteName: string;
  severity: 'mineur' | 'modere' | 'critique' | 'bloquant';
  title: string;
  description: string;
  status: 'signale' | 'en_cours' | 'resolu';
  gpsCoordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  resolutionNotes?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface WorkerSalaryPayment {
  id: string;
  paymentDate: string;
  workerId: string;
  workerName: string;
  workerRole: string;
  period: string;
  paymentType: 'acompte' | 'solde' | 'prime' | 'journalier';
  amount: number;
  paymentMethod: 'mvola' | 'orange_money' | 'especes' | 'virement';
  reference?: string;
  recordedBy?: string;
  notes?: string;
}

export interface LegalDocument {
  id: string;
  type: 
    | 'recu_formation' 
    | 'contrat_stage_terrain' 
    | 'contrat_apprentissage' 
    | 'attestation_stage' 
    | 'attestation_formation' 
    | 'contrat_travail' 
    | 'attestation_travail';
  title: string;
  createdAt: string;
  issueDate: string;
  issuePlace?: string;
  recipientName: string;
  recipientBirthDate?: string;
  recipientBirthPlace?: string;
  recipientCin?: string;
  recipientCinDate?: string;
  recipientCinPlace?: string;
  recipientAddress?: string;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientRoleOrTitle?: string;
  contractModel?: 'stage' | 'apprentissage' | 'cdd_standard' | 'cdi_standard';
  contractType?: string;
  contractPosition?: string;
  contractProfessionalCategory?: string;
  contractStartDate?: string;
  contractEndDate?: string;
  contractTrialPeriodMonths?: number;
  contractMonthlySalary?: number;
  contractWeeklyHours?: number;
  contractWorkplace?: string;
  contractTransportAllowance?: number;
  trainingTitle?: string;
  trainingSession?: string;
  trainingHoursTotal?: number;
  trainingStartDate?: string;
  trainingEndDate?: string;
  trainingGradeOrScore?: string;
  trainingModules?: string[];
  trainingFeeTotal?: number;
  trainingFeePaid?: number;
  trainingFeeRemaining?: number;
  paymentMethod?: string;
  paymentReference?: string;
  receiptType?: 'acompte' | 'solde' | 'totalite';
  institutionName?: string;
  studyField?: string;
  stageTheme?: string;
  stageStartDate?: string;
  stageEndDate?: string;
  stageDurationWeeksOrMonths?: string;
  stageSupervisorName?: string;
  stageAppreciation?: string;
  internshipSiteLocations?: string;
  internshipFieldSafetyAcknowledged?: boolean;
  apprenticeshipTrade?: string;
  apprenticeshipDurationMonths?: number;
  apprenticeshipSchool?: string;
  apprenticeshipMasterName?: string;
  apprenticeshipMonthlyAllowance?: number;
  apprenticeshipPracticalHours?: number;
  apprenticeshipTheoreticalHours?: number;
  employmentPositionHeld?: string;
  employmentStartDate?: string;
  employmentEndDate?: string;
  leavingReasonNotice?: string;
  status: 'valide' | 'brouillon' | 'archive';
  notes?: string;
  signatoryName?: string;
  signatoryTitle?: string;
}

export interface CompanySettings {
  siret?: string;
  vatNumber?: string;
  nif: string;
  stat: string;
  rcs?: string;
  cif?: string;
  address: string;
  ownerName: string;
  companyName: string;
  email: string;
  phone: string;
  phoneSecondary?: string;
  legalStatus: string;
  activityType: string;
  professionTitle?: string;
  vatRegime: string;
  taxSystem: string;
  autoArchiveEnabled?: boolean;
  archiveRetentionYears?: number;
  lastAutoArchiveDate?: string;
}

export interface AccessLog {
  id: string;
  userId?: string;
  username: string;
  name: string;
  role: string;
  timestamp: string;
  date: string;
  time: string;
  action: 'login' | 'logout' | 'pointage' | 'creation_compte' | 'ordre_mission' | 'rapport_chantier' | 'incident_signale' | 'comptes_utilisateurs';
  status: 'success' | 'failure';
  details?: string;
}

export interface AutoArchiveResult {
  invoicesArchived: number;
  quotesArchived: number;
  archivedInvoices: number;
  archivedQuotes: number;
  totalInvoicesCount: number;
  totalQuotesCount: number;
  executionTimestamp: string;
  cutoffDate: string;
}
