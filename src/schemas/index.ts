import { z } from 'zod';

export const loginSchema = z.object({
  username: z.string().min(1, "Le nom d'utilisateur ou matricule est requis"),
  password: z.string().min(1, 'Le mot de passe est requis'),
  sessionDuration: z.number().default(480),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const clientSchema = z.object({
  name: z.string().min(2, 'Le nom du client est requis (minimum 2 caractères)'),
  email: z.string().email('Adresse e-mail invalide').or(z.literal('')).optional(),
  phone: z.string().min(6, 'Numéro de téléphone requis').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  nif: z.string().optional().or(z.literal('')),
  stat: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type ClientFormData = z.infer<typeof clientSchema>;

export const invoiceItemSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  description: z.string().min(1, 'Description requise'),
  unitPriceHT: z.number().min(0, 'Le prix doit être positif'),
  quantity: z.number().min(0.01, 'Quantité minimum 0.01'),
  vatRate: z.number().default(0),
});

export const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Sélectionnez un client'),
  clientName: z.string().min(1, 'Le nom du client est requis'),
  issueDate: z.string().min(10, "Date d'émission requise"),
  dueDate: z.string().min(10, "Date d'échéance requise"),
  items: z.array(invoiceItemSchema).min(1, 'Ajoutez au moins une prestation'),
  status: z.enum(['pending', 'paid', 'cancelled']).default('pending'),
  notes: z.string().optional(),
});

export type InvoiceFormData = z.infer<typeof invoiceSchema>;

export const quoteSchema = z.object({
  clientId: z.string().min(1, 'Sélectionnez un client'),
  clientName: z.string().min(1, 'Le nom du client est requis'),
  issueDate: z.string().min(10, "Date d'émission requise"),
  validUntil: z.string().min(10, 'Date de validité requise'),
  items: z.array(invoiceItemSchema).min(1, 'Ajoutez au moins un article ou prestation'),
  status: z.enum(['draft', 'sent', 'accepted', 'rejected', 'pending']).default('sent'),
  notes: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

export const transactionSchema = z.object({
  date: z.string().min(10, 'Date requise'),
  type: z.enum(['recette', 'depense']),
  category: z.enum(['service', 'achat_materiel', 'salaire', 'loyer', 'carburant', 'divers']),
  description: z.string().min(3, 'Description requise (minimum 3 caractères)'),
  amountHT: z.number().min(1, 'Montant requis'),
  paymentMethod: z.enum(['mvola', 'orange_money', 'airtel_money', 'especes', 'virement', 'cheque']),
  receiptRef: z.string().optional().or(z.literal('')),
  invoiceId: z.string().optional().or(z.literal('')),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const userAccountSchema = z.object({
  username: z.string().min(3, "Nom d'utilisateur requis (min 3 caractères)"),
  password: z.string().min(4, 'Mot de passe requis (min 4 caractères)'),
  name: z.string().min(2, 'Nom complet requis'),
  role: z.enum(['admin', 'secretariat', 'chef_equipe', 'equipe_terrain', 'employe', 'stagiaire']),
  phone: z.string().min(6, 'Numéro de téléphone requis'),
  email: z.string().email('E-mail invalide').or(z.literal('')).optional(),
  matricule: z.string().min(2, 'Matricule requis (ex: KT-2026-007)'),
  cin: z.string().optional().or(z.literal('')),
  qualification: z.string().optional().or(z.literal('')),
  bloodGroup: z.string().optional().or(z.literal('')),
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  healthNotes: z.string().optional().or(z.literal('')),
  hourlyRate: z.number().optional().default(0),
  dailyRate: z.number().optional().default(0),
  rateType: z.enum(['horaire', 'journalier', 'mensuel']).default('journalier'),
  monthlyBaseSalary: z.number().optional().default(0),
  active: z.boolean().default(true),
});

export type UserAccountFormData = z.infer<typeof userAccountSchema>;

export const timePunchSchema = z.object({
  workerId: z.string().min(1, 'Employé requis'),
  workerName: z.string().min(1, 'Nom requis'),
  type: z.enum(['arrivee', 'depart', 'chantier', 'pause']),
  siteLocation: z.string().min(2, 'Lieu de pointage / Chantier requis'),
  taskNote: z.string().optional().or(z.literal('')),
  pinCode: z.string().min(1, 'Code PIN requis pour certifier le pointage'),
});

export type TimePunchFormData = z.infer<typeof timePunchSchema>;

export const missionOrderSchema = z.object({
  reference: z.string().min(3, 'Référence requise (ex: ODM-2026-002)'),
  issueDate: z.string().min(10, 'Date requise'),
  startDate: z.string().min(10, 'Date début requise'),
  endDate: z.string().min(10, 'Date fin requise'),
  destination: z.string().min(2, 'Destination requise'),
  clientName: z.string().min(2, 'Nom client requis'),
  clientContact: z.string().optional().or(z.literal('')),
  clientAddress: z.string().optional().or(z.literal('')),
  objectOfMission: z.string().min(5, 'Objet de la mission détaillé requis'),
  leadTechnicianId: z.string().min(1, 'Chef de mission requis'),
  leadTechnicianName: z.string().min(1, 'Nom chef de mission requis'),
  assignedWorkerIds: z.array(z.string()).default([]),
  assignedWorkerNames: z.array(z.string()).default([]),
  transportMode: z.string().optional().or(z.literal('')),
  vehiclePlate: z.string().optional().or(z.literal('')),
  allocatedExpenses: z.number().min(0).default(0),
  equipmentList: z.string().optional().or(z.literal('')),
  specialInstructions: z.string().optional().or(z.literal('')),
  signedBy: z.string().default('TSINJO Anderson — Directeur Général'),
  status: z.enum(['en_cours', 'cloture', 'annule']).default('en_cours'),
});

export type MissionOrderFormData = z.infer<typeof missionOrderSchema>;

export const dailyReportSchema = z.object({
  siteName: z.string().min(2, 'Nom du site ou chantier requis'),
  clientName: z.string().optional().or(z.literal('')),
  workDoneText: z.string().min(10, 'Détail des travaux effectués requis (min 10 caractères)'),
  progressPercent: z.number().min(0).max(100),
  materialsUsed: z.string().optional().or(z.literal('')),
});

export type DailyReportFormData = z.infer<typeof dailyReportSchema>;

export const siteIncidentSchema = z.object({
  siteName: z.string().min(2, 'Nom du chantier requis'),
  severity: z.enum(['mineur', 'modere', 'critique', 'bloquant']),
  title: z.string().min(5, "Titre de l'incident requis"),
  description: z.string().min(10, 'Description détaillée requise'),
});

export type SiteIncidentFormData = z.infer<typeof siteIncidentSchema>;

export const salaryPaymentSchema = z.object({
  workerId: z.string().min(1, 'Employé requis'),
  workerName: z.string().min(1, 'Nom requis'),
  period: z.string().min(2, 'Période requise (ex: Octobre 2026)'),
  paymentType: z.enum(['acompte', 'solde', 'prime', 'journalier']),
  amount: z.number().min(1000, 'Montant minimum 1 000 Ar'),
  paymentMethod: z.enum(['mvola', 'orange_money', 'especes', 'virement']),
  reference: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
});

export type SalaryPaymentFormData = z.infer<typeof salaryPaymentSchema>;

export const companySettingsSchema = z.object({
  ownerName: z.string().min(2, 'Nom du propriétaire ou gérant requis'),
  companyName: z.string().min(2, "Nom de l'entreprise requis"),
  nif: z.string().min(5, 'Numéro NIF officiel requis'),
  stat: z.string().min(5, 'Numéro STAT officiel requis'),
  rcs: z.string().optional().or(z.literal('')),
  cif: z.string().optional().or(z.literal('')),
  address: z.string().min(5, 'Adresse légale requise'),
  phone: z.string().min(6, 'Téléphone principal requis'),
  phoneSecondary: z.string().optional().or(z.literal('')),
  email: z.string().email('Adresse e-mail valide requise'),
  legalStatus: z.string().default('micro-entreprise'),
  activityType: z.string().default('service'),
  professionTitle: z.string().default('Prestataire de service, FREELANCE'),
  autoArchiveEnabled: z.boolean().default(true),
  archiveRetentionYears: z.number().min(1).max(10).default(2),
});

export type CompanySettingsFormData = z.infer<typeof companySettingsSchema>;
