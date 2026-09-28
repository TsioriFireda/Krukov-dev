import React, { useState, useEffect } from 'react';
import { 
  CompanySettings, 
  Client, 
  Invoice, 
  Quote, 
  Transaction, 
  Worker, 
  TimePunch, 
  UserAccount, 
  AccessLog, 
  MissionOrder, 
  DailyFieldReport, 
  SiteIncidentReport, 
  WorkerSalaryPayment, 
  LegalDocument,
  AutoArchiveResult
} from './types';
import { isOlderThanYears, getArchiveCutoffDate } from './lib/utils';
import { realtimeSync } from './services/realtimeSync';
import AppRouter from './routes/AppRouter';

export default function App() {
  const [settings, setSettings] = useState<CompanySettings>({
    nif: '63122 12 2024 0 01200',
    stat: '401 861 22 96',
    rcs: 'RCS ANTSIRABE N° 2024-A-00142',
    cif: 'Centre Fiscal DGI Antsirabe I',
    address: 'LOT 0704 B410 Bis ANTSEVA AMBOHIMANARIVO ANTSIRABE I',
    ownerName: 'RATSIMBANANTENAINA TSINJO ANDERSON',
    companyName: 'Krukov tek',
    email: 'krukovtek@gmail.com',
    phone: '033-51-848-75',
    phoneSecondary: '038 85 430 13',
    legalStatus: 'micro-entreprise',
    activityType: 'service',
    professionTitle: 'Prestataire de service, FREELANCE',
    vatRegime: 'non-assujetti',
    taxSystem: 'standard',
    autoArchiveEnabled: true,
    archiveRetentionYears: 2,
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [timePunches, setTimePunches] = useState<TimePunch[]>([]);
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>([]);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);
  const [missionOrders, setMissionOrders] = useState<MissionOrder[]>([]);
  const [dailyReports, setDailyReports] = useState<DailyFieldReport[]>([]);
  const [siteIncidents, setSiteIncidents] = useState<SiteIncidentReport[]>([]);
  const [salaryPayments, setSalaryPayments] = useState<WorkerSalaryPayment[]>([]);
  const [legalDocuments, setLegalDocuments] = useState<LegalDocument[]>([]);
  const [readNotificationIds, setReadNotificationIds] = useState<string[]>(() => {
    const stored = localStorage.getItem('krukov_read_notifications');
    return stored ? JSON.parse(stored) : [];
  });

  // Current authenticated user state with session check
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const expireAt = localStorage.getItem('krukov_session_expire');
      if (expireAt && Date.now() > parseInt(expireAt, 10)) {
        localStorage.removeItem('krukov_current_user');
        localStorage.removeItem('krukov_session_expire');
        return null;
      }
      const stored = localStorage.getItem('krukov_current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Load initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const res = await fetch('/api/sync/all');
        if (res.ok) {
          const data = await res.json();
          if (data.state) {
            if (data.state.userAccounts?.length) setUserAccounts(data.state.userAccounts);
            if (data.state.invoices?.length) setInvoices(data.state.invoices);
            if (data.state.quotes?.length) setQuotes(data.state.quotes);
            if (data.state.clients?.length) setClients(data.state.clients);
            if (data.state.transactions?.length) setTransactions(data.state.transactions);
            if (data.state.timePunches?.length) setTimePunches(data.state.timePunches);
            if (data.state.missionOrders?.length) setMissionOrders(data.state.missionOrders);
            if (data.state.dailyReports?.length) setDailyReports(data.state.dailyReports);
            if (data.state.siteIncidents?.length) setSiteIncidents(data.state.siteIncidents);
            if (data.state.salaryPayments?.length) setSalaryPayments(data.state.salaryPayments);
            if (data.state.companySettings) setSettings(data.state.companySettings);
          }
        }
      } catch (err) {
        console.warn('Initial server sync:', err);
      }
    };
    fetchInitialData();

    // Default users if not yet loaded
    const storedUsers = localStorage.getItem('krukov_user_accounts');
    if (storedUsers) {
      try {
        setUserAccounts(JSON.parse(storedUsers));
      } catch {}
    } else {
      const defaultUsers: UserAccount[] = [
        {
          id: 'USR-ADMIN-01',
          username: 'markov',
          password: 'markov2573890//',
          name: 'TSINJO Anderson (Markov)',
          role: 'admin',
          phone: '033 51 848 75',
          email: 'tsinjomarkov0310@gmail.com',
          matricule: 'KT-2026-001',
          qualification: 'Ingénieur Électronique & Direction',
          bloodGroup: 'O+',
          emergencyContactPhone: '033 51 848 75',
          dailyRate: 60000,
          hourlyRate: 8000,
          rateType: 'journalier',
          monthlyBaseSalary: 1200000,
          active: true,
          createdDate: '2026-08-01',
        },
        {
          id: 'USR-SEC-01',
          username: 'secretaire',
          password: 'sec123//',
          name: 'Marie Ravelo (Secrétaire)',
          role: 'secretariat',
          phone: '038 85 430 13',
          email: 'secretariat.krukov@gmail.com',
          matricule: 'KT-2026-002',
          qualification: 'Administration & Facturation',
          bloodGroup: 'A+',
          emergencyContactPhone: '038 85 430 13',
          dailyRate: 30000,
          hourlyRate: 4000,
          rateType: 'mensuel',
          monthlyBaseSalary: 350000,
          active: true,
          createdDate: '2026-08-02',
        },
        {
          id: 'USR-CHEF-01',
          username: 'chef_terrain',
          password: 'chef123//',
          name: "RAKOTO Jean (Chef d'Équipe)",
          role: 'chef_equipe',
          phone: '034 11 222 33',
          matricule: 'KT-2026-003',
          qualification: 'Chef Électricien Solaire & Réseau',
          bloodGroup: 'B+',
          emergencyContactPhone: '034 11 222 34',
          dailyRate: 45000,
          hourlyRate: 6000,
          rateType: 'journalier',
          monthlyBaseSalary: 450000,
          active: true,
          createdDate: '2026-08-05',
        },
        {
          id: 'USR-TECH-01',
          username: 'technicien1',
          password: 'tech123//',
          name: 'RANDRIA Paul (Technicien)',
          role: 'equipe_terrain',
          phone: '032 44 555 66',
          matricule: 'KT-2026-004',
          qualification: 'Monteur Câbleur Solaire',
          bloodGroup: 'O+',
          emergencyContactPhone: '032 44 555 67',
          dailyRate: 35000,
          hourlyRate: 5000,
          rateType: 'journalier',
          monthlyBaseSalary: 350000,
          active: true,
          createdDate: '2026-08-10',
        },
      ];
      setUserAccounts(defaultUsers);
      localStorage.setItem('krukov_user_accounts', JSON.stringify(defaultUsers));
    }

    // Default Clients
    const storedClients = localStorage.getItem('krukov_clients');
    if (storedClients) {
      try {
        setClients(JSON.parse(storedClients));
      } catch {}
    } else {
      const defaultClients: Client[] = [
        {
          id: 'C-001',
          name: 'Mina Randriana',
          email: 'mina.randria@gmail.com',
          phone: '0345678901',
          address: 'Vatofotsy Antsirabe, Madagascar',
        },
        {
          id: 'C-002',
          name: 'Société Madacom',
          email: 'contact@madacom.mg',
          phone: '0204412345',
          address: 'Analakely Antananarivo, Madagascar',
        },
      ];
      setClients(defaultClients);
      localStorage.setItem('krukov_clients', JSON.stringify(defaultClients));
    }

    // Default Invoices
    const storedInvoices = localStorage.getItem('krukov_invoices');
    if (storedInvoices) {
      try {
        setInvoices(JSON.parse(storedInvoices));
      } catch {}
    } else {
      const defaultInvoices: Invoice[] = [
        {
          id: 'F2026-001',
          clientId: 'C-002',
          clientName: 'Société Madacom',
          issueDate: '2026-07-10',
          dueDate: '2026-08-10',
          totalHT: 450000,
          totalTTC: 450000,
          totalVAT: 0,
          status: 'paid',
          items: [
            {
              id: 'item-1',
              description: 'Installation de commutateurs réseau Cisco & Câblage Cat6 blindé',
              unitPriceHT: 450000,
              quantity: 1,
              vatRate: 0,
            },
          ],
          notes: 'Paiement reçu par Mvola au 033 51 848 75.',
        },
        {
          id: 'F2026-002',
          clientId: 'C-001',
          clientName: 'Mina Randriana',
          issueDate: '2026-07-12',
          dueDate: '2026-08-12',
          totalHT: 1200000,
          totalTTC: 1200000,
          totalVAT: 0,
          status: 'pending',
          items: [
            {
              id: 'item-2',
              description: 'Étude technique, fourniture et pose kit solaire autoconsommation 3kWp',
              unitPriceHT: 1200000,
              quantity: 1,
              vatRate: 0,
            },
          ],
          notes: 'En attente de règlement mobile money ou virement.',
        },
      ];
      setInvoices(defaultInvoices);
      localStorage.setItem('krukov_invoices', JSON.stringify(defaultInvoices));
    }

    // Default Quotes
    const storedQuotes = localStorage.getItem('krukov_quotes');
    if (storedQuotes) {
      try {
        setQuotes(JSON.parse(storedQuotes));
      } catch {}
    } else {
      const defaultQuotes: Quote[] = [
        {
          id: 'D2026-001',
          clientId: 'C-001',
          clientName: 'Mina Randriana',
          issueDate: '2026-07-15',
          validUntil: '2026-08-15',
          totalHT: 4800000,
          totalTTC: 4800000,
          totalVAT: 0,
          status: 'sent',
          items: [
            {
              id: 'q-1',
              description: "Fourniture & Pose kit solaire autoconsommation complet 3.0kWp (Panneaux, Onduleur hybride, Batteries)",
              unitPriceHT: 4800000,
              quantity: 1,
              vatRate: 0,
            },
          ],
          notes: "Matériel garanti 5 ans, main d'œuvre technique incluse.",
        },
      ];
      setQuotes(defaultQuotes);
      localStorage.setItem('krukov_quotes', JSON.stringify(defaultQuotes));
    }
  }, []);

  // Real-Time Pusher JS & Sync Listener
  useEffect(() => {
    const unsubscribe = realtimeSync.subscribe((event) => {
      if (event.type === 'user_updated' || event.type === 'user_created') {
        const user = event.data;
        setUserAccounts((prev) => {
          const idx = prev.findIndex((u) => u.id === user.id);
          const updated = idx >= 0 ? prev.map((u, i) => (i === idx ? user : u)) : [...prev, user];
          localStorage.setItem('krukov_user_accounts', JSON.stringify(updated));
          return updated;
        });
      } else if (event.type === 'new_punch') {
        const punch = event.data;
        setTimePunches((prev) => [punch, ...prev]);
      } else if (event.type === 'new_invoice') {
        const inv = event.data;
        setInvoices((prev) => {
          const idx = prev.findIndex((i) => i.id === inv.id);
          return idx >= 0 ? prev.map((i) => (i.id === inv.id ? inv : i)) : [inv, ...prev];
        });
      } else if (event.type === 'new_quote') {
        const q = event.data;
        setQuotes((prev) => {
          const idx = prev.findIndex((item) => item.id === q.id);
          return idx >= 0 ? prev.map((item) => (item.id === q.id ? q : item)) : [q, ...prev];
        });
      } else if (event.type === 'new_transaction') {
        const tx = event.data;
        setTransactions((prev) => [tx, ...prev]);
      } else if (event.type === 'new_report') {
        const rep = event.data;
        setDailyReports((prev) => [rep, ...prev]);
      } else if (event.type === 'new_incident') {
        const inc = event.data;
        setSiteIncidents((prev) => [inc, ...prev]);
      } else if (event.type === 'new_salary_payment') {
        const sal = event.data;
        setSalaryPayments((prev) => [sal, ...prev]);
      }
    });

    return () => unsubscribe();
  }, []);

  const logAccessEvent = (
    user: any,
    action: AccessLog['action'],
    status: AccessLog['status'],
    details?: string
  ) => {
    const now = new Date();
    const newLog: AccessLog = {
      id: `LOG-${Date.now().toString().slice(-6)}`,
      userId: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      timestamp: now.toISOString(),
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('fr-FR'),
      action,
      status,
      details,
    };
    setAccessLogs((prev) => [newLog, ...prev]);
  };

  const handleLogout = () => {
    if (currentUser) {
      logAccessEvent(currentUser, 'logout', 'success', 'Déconnexion manuelle');
    }
    setCurrentUser(null);
    localStorage.removeItem('krukov_current_user');
    localStorage.removeItem('krukov_session_expire');
  };

  const handleSaveSettings = (newSettings: CompanySettings) => {
    setSettings(newSettings);
    localStorage.setItem('krukov_settings', JSON.stringify(newSettings));
    realtimeSync.saveCompanySettings(newSettings);
  };

  const handleAddClient = (client: Client) => {
    setClients((prev) => [...prev, client]);
    realtimeSync.saveClient(client);
  };

  const handleUpdateClient = (client: Client) => {
    setClients((prev) => prev.map((c) => (c.id === client.id ? client : c)));
    realtimeSync.saveClient(client);
  };

  const handleAddInvoice = (invoice: Invoice) => {
    setInvoices((prev) => [invoice, ...prev]);
    realtimeSync.saveInvoice(invoice);
  };

  const handleUpdateInvoice = (invoice: Invoice) => {
    setInvoices((prev) => prev.map((i) => (i.id === invoice.id ? invoice : i)));
    realtimeSync.saveInvoice(invoice);
  };

  const handleAddQuote = (quote: Quote) => {
    setQuotes((prev) => [quote, ...prev]);
    realtimeSync.saveQuote(quote);
  };

  const handleUpdateQuote = (quote: Quote) => {
    setQuotes((prev) => prev.map((q) => (q.id === quote.id ? quote : q)));
    realtimeSync.saveQuote(quote);
  };

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    realtimeSync.saveTransaction(tx);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    realtimeSync.deleteTransaction(id);
  };

  const handleAddPunch = (punch: TimePunch) => {
    setTimePunches((prev) => [punch, ...prev]);
    realtimeSync.postTimePunch(punch);
  };

  const handleAddWorker = (worker: Worker) => {
    setWorkers((prev) => [...prev, worker]);
  };

  const handleToggleWorkerActive = (id: string) => {
    setWorkers((prev) => prev.map((w) => (w.id === id ? { ...w, active: !w.active } : w)));
  };

  const handleAddUserAccount = (account: UserAccount) => {
    setUserAccounts((prev) => [...prev, account]);
    realtimeSync.postUserAccount(account);
  };

  const handleUpdateUserAccount = (account: UserAccount) => {
    setUserAccounts((prev) => prev.map((u) => (u.id === account.id ? account : u)));
    if (currentUser?.id === account.id) {
      setCurrentUser(account);
      localStorage.setItem('krukov_current_user', JSON.stringify(account));
    }
    realtimeSync.postUserAccount(account);
  };

  const handleToggleUserActive = (id: string) => {
    setUserAccounts((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const mod = { ...u, active: !u.active };
          realtimeSync.postUserAccount(mod);
          return mod;
        }
        return u;
      })
    );
  };

  const handleDeleteUserAccount = (id: string) => {
    setUserAccounts((prev) => prev.filter((u) => u.id !== id));
    realtimeSync.deleteUserAccount(id);
  };

  const handleAddMissionOrder = (order: MissionOrder) => {
    setMissionOrders((prev) => [order, ...prev]);
    realtimeSync.saveMission(order);
  };

  const handleUpdateMissionStatus = (orderId: string, status: 'en_cours' | 'cloture' | 'annule') => {
    setMissionOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleAddDailyReport = (report: DailyFieldReport) => {
    setDailyReports((prev) => [report, ...prev]);
    realtimeSync.saveDailyReport(report);
  };

  const handleAddSiteIncident = (incident: SiteIncidentReport) => {
    setSiteIncidents((prev) => [incident, ...prev]);
    realtimeSync.saveIncident(incident);
  };

  const handleUpdateIncidentStatus = (id: string, status: 'en_cours' | 'resolu', notes?: string) => {
    setSiteIncidents((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status,
              resolutionNotes: notes,
              resolvedAt: new Date().toISOString(),
              resolvedBy: currentUser?.name || 'Direction',
            }
          : i
      )
    );
  };

  const handleAddSalaryPayment = (payment: WorkerSalaryPayment) => {
    setSalaryPayments((prev) => [payment, ...prev]);
    realtimeSync.postSalaryPayment(payment);
  };

  const handleAddLegalDocument = (doc: LegalDocument) => {
    setLegalDocuments((prev) => [doc, ...prev]);
    realtimeSync.saveLegalDocument(doc);
  };

  const handleUpdateLegalDocument = (doc: LegalDocument) => {
    setLegalDocuments((prev) => prev.map((d) => (d.id === doc.id ? doc : d)));
    realtimeSync.saveLegalDocument(doc);
  };

  const handleDeleteLegalDocument = (id: string) => {
    setLegalDocuments((prev) => prev.filter((d) => d.id !== id));
    realtimeSync.deleteLegalDocument(id);
  };

  const handleRunAutoArchive = async (years: number = 2): Promise<AutoArchiveResult> => {
    const cutoff = getArchiveCutoffDate(years);
    const nowStr = new Date().toISOString();
    let invCount = 0;
    let quoteCount = 0;

    setInvoices((prev) =>
      prev.map((inv) => {
        if (!inv.archived && isOlderThanYears(inv.issueDate, years)) {
          invCount++;
          return { ...inv, archived: true };
        }
        return inv;
      })
    );

    setQuotes((prev) =>
      prev.map((q) => {
        if (!q.archived && isOlderThanYears(q.issueDate, years)) {
          quoteCount++;
          return { ...q, archived: true };
        }
        return q;
      })
    );

    return {
      invoicesArchived: invCount,
      quotesArchived: quoteCount,
      archivedInvoices: invCount,
      archivedQuotes: quoteCount,
      totalInvoicesCount: invoices.length,
      totalQuotesCount: quotes.length,
      executionTimestamp: new Date().toLocaleTimeString('fr-FR'),
      cutoffDate: cutoff,
    };
  };

  const handleTriggerPaymentLogged = (inv: Invoice, method: string) => {
    const tx: Transaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      date: new Date().toISOString().split('T')[0],
      type: 'recette',
      category: 'service',
      description: `Règlement Facture ${inv.id} - ${inv.clientName}`,
      amountHT: inv.totalHT,
      amountTTC: inv.totalTTC,
      vatAmount: 0,
      invoiceId: inv.id,
      paymentMethod: method as any,
      receiptRef: `FAC-${inv.id}`,
    };
    handleAddTransaction(tx);
  };

  return (
    <AppRouter
      currentUser={currentUser}
      setCurrentUser={setCurrentUser}
      userAccounts={userAccounts}
      settings={settings}
      clients={clients}
      invoices={invoices}
      quotes={quotes}
      transactions={transactions}
      workers={workers}
      timePunches={timePunches}
      missionOrders={missionOrders}
      dailyReports={dailyReports}
      siteIncidents={siteIncidents}
      salaryPayments={salaryPayments}
      legalDocuments={legalDocuments}
      readNotificationIds={readNotificationIds}
      onLogout={handleLogout}
      onSaveSettings={handleSaveSettings}
      onAddClient={handleAddClient}
      onUpdateClient={handleUpdateClient}
      onAddInvoice={handleAddInvoice}
      onUpdateInvoice={handleUpdateInvoice}
      onAddQuote={handleAddQuote}
      onUpdateQuote={handleUpdateQuote}
      onAddTransaction={handleAddTransaction}
      onDeleteTransaction={handleDeleteTransaction}
      onAddPunch={handleAddPunch}
      onAddWorker={handleAddWorker}
      onToggleWorkerActive={handleToggleWorkerActive}
      onAddUserAccount={handleAddUserAccount}
      onUpdateUserAccount={handleUpdateUserAccount}
      onToggleUserActive={handleToggleUserActive}
      onDeleteUserAccount={handleDeleteUserAccount}
      onAddMissionOrder={handleAddMissionOrder}
      onUpdateMissionStatus={handleUpdateMissionStatus}
      onAddDailyReport={handleAddDailyReport}
      onAddSiteIncident={handleAddSiteIncident}
      onUpdateIncidentStatus={handleUpdateIncidentStatus}
      onAddSalaryPayment={handleAddSalaryPayment}
      onAddLegalDocument={handleAddLegalDocument}
      onUpdateLegalDocument={handleUpdateLegalDocument}
      onDeleteLegalDocument={handleDeleteLegalDocument}
      onRunAutoArchive={handleRunAutoArchive}
      onTriggerPaymentLogged={handleTriggerPaymentLogged}
      onNavigateFromNotification={() => {}}
      onMarkAllNotificationsRead={() => setReadNotificationIds([])}
      onMarkNotificationItemRead={(id) => setReadNotificationIds((p) => [...p, id])}
      logAccessEvent={logAccessEvent}
    />
  );
}
