import React from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate, 
  useLocation,
  Outlet 
} from 'react-router-dom';
import { 
  UserAccount, 
  CompanySettings, 
  Client, 
  Invoice, 
  Quote, 
  Transaction, 
  Worker, 
  TimePunch, 
  MissionOrder, 
  DailyFieldReport, 
  SiteIncidentReport, 
  WorkerSalaryPayment, 
  LegalDocument,
  AutoArchiveResult
} from '@/types';

// Components
import SecureLoginPortal from '@/components/SecureLoginPortal';
import DynamicNavbar from '@/components/navigation/DynamicNavbar';
import DynamicDrawer from '@/components/navigation/DynamicDrawer';
import DynamicTaskbar from '@/components/navigation/DynamicTaskbar';
import Invoices from '@/components/Invoices';
import Quotes from '@/components/Quotes';
import Clients from '@/components/Clients';
import Transactions from '@/components/Transactions';
import WorkersTimeTracking from '@/components/WorkersTimeTracking';
import UserAccountsManagement from '@/components/UserAccountsManagement';
import MissionsAndBadges from '@/components/MissionsAndBadges';
import FieldReportsAndIncidents from '@/components/FieldReportsAndIncidents';
import TeamWageLedger from '@/components/TeamWageLedger';
import WhatsAppSyncHub from '@/components/WhatsAppSyncHub';
import LegalDocuments from '@/components/LegalDocuments';
import Settings from '@/components/Settings';
import ThemeToggle from '@/components/ThemeToggle';
import Logo from '@/components/Logo';

interface AppRouterProps {
  currentUser: UserAccount | null;
  setCurrentUser: (u: UserAccount | null) => void;
  userAccounts: UserAccount[];
  settings: CompanySettings;
  clients: Client[];
  invoices: Invoice[];
  quotes: Quote[];
  transactions: Transaction[];
  workers: Worker[];
  timePunches: TimePunch[];
  missionOrders: MissionOrder[];
  dailyReports: DailyFieldReport[];
  siteIncidents: SiteIncidentReport[];
  salaryPayments: WorkerSalaryPayment[];
  legalDocuments: LegalDocument[];
  readNotificationIds: string[];
  // Handlers
  onLogout: () => void;
  onSaveSettings: (s: CompanySettings) => void;
  onAddClient: (c: Client) => void;
  onUpdateClient: (c: Client) => void;
  onAddInvoice: (i: Invoice) => void;
  onUpdateInvoice: (i: Invoice) => void;
  onAddQuote: (q: Quote) => void;
  onUpdateQuote: (q: Quote) => void;
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onAddPunch: (p: TimePunch) => void;
  onAddWorker: (w: Worker) => void;
  onToggleWorkerActive: (id: string) => void;
  onAddUserAccount: (u: UserAccount) => void;
  onUpdateUserAccount: (u: UserAccount) => void;
  onToggleUserActive: (id: string) => void;
  onDeleteUserAccount: (id: string) => void;
  onAddMissionOrder: (m: MissionOrder) => void;
  onUpdateMissionStatus: (id: string, s: 'en_cours' | 'cloture' | 'annule') => void;
  onAddDailyReport: (r: DailyFieldReport) => void;
  onAddSiteIncident: (i: SiteIncidentReport) => void;
  onUpdateIncidentStatus: (id: string, s: 'en_cours' | 'resolu', notes?: string) => void;
  onAddSalaryPayment: (p: WorkerSalaryPayment) => void;
  onAddLegalDocument: (d: LegalDocument) => void;
  onUpdateLegalDocument: (d: LegalDocument) => void;
  onDeleteLegalDocument: (id: string) => void;
  onRunAutoArchive: (years: number) => Promise<AutoArchiveResult>;
  onTriggerPaymentLogged: (i: Invoice, m: string) => void;
  onNavigateFromNotification: (tab: 'daily_reports' | 'incidents', id?: string) => void;
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationItemRead: (id: string) => void;
  logAccessEvent: (user: any, action: any, status: any, details?: string) => void;
}

// Protected layout wrapper
function ProtectedAppLayout({
  currentUser,
  children,
  onLogout,
  dailyReports,
  siteIncidents,
  readNotificationIds,
  onNavigateFromNotification,
  onMarkAllNotificationsRead,
  onMarkNotificationItemRead,
  invoices,
  quotes,
  clients,
  transactions,
}: any) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false);

  // Extract current active tab from pathname
  const activePath = location.pathname.replace('/', '') || 'invoices';

  const role = currentUser.role;
  const permissions = {
    canAccessInvoices: role === 'admin' || role === 'secretariat',
    canAccessQuotes: role === 'admin' || role === 'secretariat' || role === 'chef_equipe',
    canAccessClients: role === 'admin' || role === 'secretariat' || role === 'chef_equipe',
    canAccessTransactions: role === 'admin',
    canAccessMissions: role === 'admin' || role === 'secretariat' || role === 'chef_equipe' || role === 'equipe_terrain',
    canAccessReports: true,
    canAccessAccounts: role === 'admin',
    canAccessPointage: true,
    canAccessSalaires: true,
    canAccessLegalDocuments: role === 'admin' || role === 'secretariat' || role === 'chef_equipe',
    canAccessSettings: role === 'admin',
  };

  const getRoleBadgeLabel = (r: string) => {
    switch (r) {
      case 'admin': return 'Directeur / Administrateur';
      case 'secretariat': return 'Secrétariat';
      case 'chef_equipe': return "Chef d'Équipe";
      case 'equipe_terrain': return 'Équipe Terrain';
      case 'employe': return 'Employé Atelier';
      case 'stagiaire': return 'Stagiaire';
      default: return r;
    }
  };

  const handleSelectTab = (tab: string) => {
    navigate(`/${tab}`);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 dark:bg-[#0b0f19] flex flex-col font-sans text-stone-900 dark:text-slate-100 text-left">
      <DynamicNavbar
        activeTab={activePath}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        getRoleBadgeLabel={getRoleBadgeLabel}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        isDrawerOpen={isDrawerOpen}
        onOpenTerminal={() => navigate('/terminal')}
        onLogout={onLogout}
        unresolvedIncidentsCount={siteIncidents.filter((i: any) => i.status !== 'resolu').length}
        pendingInvoicesCount={invoices.filter((i: any) => i.status === 'pending').length}
        dailyReports={dailyReports}
        siteIncidents={siteIncidents}
        readNotificationIds={readNotificationIds}
        onNavigateFromNotification={onNavigateFromNotification}
        onMarkAllNotificationsRead={onMarkAllNotificationsRead}
        onMarkNotificationItemRead={onMarkNotificationItemRead}
        permissions={permissions}
      />

      {/* Main Screen Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-5 lg:p-7 pb-24 xl:pb-10 transition-all">
        {children}
      </main>

      {/* Mobile Bottom Taskbar */}
      <DynamicTaskbar
        activeTab={activePath}
        onSelectTab={handleSelectTab}
        onOpenDrawer={() => setIsDrawerOpen(true)}
        permissions={permissions}
      />

      {/* Mobile Drawer */}
      <DynamicDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activePath}
        onSelectTab={handleSelectTab}
        currentUser={currentUser}
        getRoleBadgeLabel={getRoleBadgeLabel}
        onOpenTerminal={() => navigate('/terminal')}
        onLogout={onLogout}
        permissions={permissions}
      />
    </div>
  );
}

// Route Guard component
function ProtectedRoute({ currentUser, children }: { currentUser: UserAccount | null; children: React.ReactNode }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

export default function AppRouter(props: AppRouterProps) {
  const { currentUser, setCurrentUser, onLogout, logAccessEvent } = props;

  // Determine landing route based on role
  const getDefaultLandingRoute = () => {
    if (!currentUser) return '/login';
    if (currentUser.role === 'admin' || currentUser.role === 'secretariat') return '/invoices';
    if (currentUser.role === 'chef_equipe') return '/quotes';
    if (currentUser.role === 'equipe_terrain') return '/reports';
    return '/pointage';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Authentication Route */}
        <Route
          path="/login"
          element={
            currentUser ? (
              <Navigate to={getDefaultLandingRoute()} replace />
            ) : (
              <SecureLoginPortal
                userAccounts={props.userAccounts}
                onLoginSuccess={(user, duration) => {
                  setCurrentUser(user);
                  localStorage.setItem('krukov_current_user', JSON.stringify(user));
                  if (duration) {
                    const expireAt = Date.now() + duration * 60 * 1000;
                    localStorage.setItem('krukov_session_expire', expireAt.toString());
                  }
                }}
                onOpenWorkerTerminal={() => {
                  window.location.href = '/terminal';
                }}
                onLogAccess={logAccessEvent}
              />
            )
          }
        />

        {/* Standalone Worker Terminal Route */}
        <Route
          path="/terminal"
          element={
            <div className="min-h-screen bg-stone-100 dark:bg-[#0b0f19] text-stone-900 dark:text-slate-100 flex flex-col font-sans p-4 sm:p-6 text-left">
              <div className="max-w-4xl mx-auto w-full space-y-4">
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 p-3 rounded-xl shadow-xs">
                  <div className="flex items-center gap-2">
                    <Logo className="w-8 h-8" />
                    <div>
                      <span className="font-bold text-stone-900 dark:text-slate-100 text-xs">
                        BORNE DE POINTAGE DU PERSONNEL
                      </span>
                      <p className="text-[10px] text-stone-500 dark:text-slate-400">
                        Krukov Tek Antsirabe • Prise de poste certifiée pour tous
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                      onClick={() => (window.location.href = '/login')}
                      className="px-3 py-1.5 bg-stone-800 dark:bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-stone-900 cursor-pointer"
                    >
                      ← Retour au Portail
                    </button>
                  </div>
                </div>

                <WorkersTimeTracking
                  workers={props.workers}
                  timePunches={props.timePunches}
                  onAddPunch={props.onAddPunch}
                  onAddWorker={props.onAddWorker}
                  onToggleWorkerActive={props.onToggleWorkerActive}
                  settings={props.settings}
                  userAccounts={props.userAccounts}
                />
              </div>
            </div>
          }
        />

        {/* Protected Application Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <ProtectedAppLayout {...props}>
                <Routes>
                  {/* Default root redirects to default landing page */}
                  <Route path="/" element={<Navigate to={getDefaultLandingRoute()} replace />} />
                  
                  {/* Invoices */}
                  <Route
                    path="/invoices"
                    element={
                      <Invoices
                        invoices={props.invoices}
                        clients={props.clients}
                        settings={props.settings}
                        onAddInvoice={props.onAddInvoice}
                        onUpdateInvoice={props.onUpdateInvoice}
                        onTriggerPaymentLogged={props.onTriggerPaymentLogged}
                      />
                    }
                  />
                  <Route path="/factures" element={<Navigate to="/invoices" replace />} />

                  {/* Quotes */}
                  <Route
                    path="/quotes"
                    element={
                      <Quotes
                        quotes={props.quotes}
                        clients={props.clients}
                        settings={props.settings}
                        onAddQuote={props.onAddQuote}
                        onUpdateQuote={props.onUpdateQuote}
                      />
                    }
                  />
                  <Route path="/devis" element={<Navigate to="/quotes" replace />} />

                  {/* Clients */}
                  <Route
                    path="/clients"
                    element={
                      <Clients
                        clients={props.clients}
                        onAddClient={props.onAddClient}
                        onUpdateClient={props.onUpdateClient}
                      />
                    }
                  />

                  {/* Transactions */}
                  <Route
                    path="/transactions"
                    element={
                      <Transactions
                        transactions={props.transactions}
                        onAddTransaction={props.onAddTransaction}
                        onDeleteTransaction={props.onDeleteTransaction}
                      />
                    }
                  />

                  {/* Missions & Badges */}
                  <Route
                    path="/missions"
                    element={
                      <MissionsAndBadges
                        missionOrders={props.missionOrders}
                        userAccounts={props.userAccounts}
                        settings={props.settings}
                        onAddMissionOrder={props.onAddMissionOrder}
                        onUpdateMissionStatus={props.onUpdateMissionStatus}
                        currentUser={currentUser!}
                      />
                    }
                  />

                  {/* Reports & Incidents */}
                  <Route
                    path="/reports"
                    element={
                      <FieldReportsAndIncidents
                        dailyReports={props.dailyReports}
                        siteIncidents={props.siteIncidents}
                        onAddDailyReport={props.onAddDailyReport}
                        onAddSiteIncident={props.onAddSiteIncident}
                        onUpdateIncidentStatus={props.onUpdateIncidentStatus}
                        currentUser={currentUser!}
                      />
                    }
                  />
                  <Route path="/rapports" element={<Navigate to="/reports" replace />} />

                  {/* Time Punch */}
                  <Route
                    path="/pointage"
                    element={
                      <WorkersTimeTracking
                        workers={props.workers}
                        timePunches={props.timePunches}
                        onAddPunch={props.onAddPunch}
                        onAddWorker={props.onAddWorker}
                        onToggleWorkerActive={props.onToggleWorkerActive}
                        settings={props.settings}
                        userAccounts={props.userAccounts}
                      />
                    }
                  />

                  {/* Wage Ledger */}
                  <Route
                    path="/salaires"
                    element={
                      <TeamWageLedger
                        salaryPayments={props.salaryPayments}
                        userAccounts={props.userAccounts}
                        settings={props.settings}
                        onAddSalaryPayment={props.onAddSalaryPayment}
                        currentUser={currentUser!}
                      />
                    }
                  />

                  {/* Legal Documents */}
                  <Route
                    path="/documents"
                    element={
                      <LegalDocuments
                        legalDocuments={props.legalDocuments}
                        settings={props.settings}
                        onAddDocument={props.onAddLegalDocument}
                        onUpdateDocument={props.onUpdateLegalDocument}
                        onDeleteDocument={props.onDeleteLegalDocument}
                        currentUser={currentUser!}
                      />
                    }
                  />

                  {/* Accounts Management */}
                  <Route
                    path="/accounts"
                    element={
                      <UserAccountsManagement
                        userAccounts={props.userAccounts}
                        onAddAccount={props.onAddUserAccount}
                        onUpdateAccount={props.onUpdateUserAccount}
                        onToggleActive={props.onToggleUserActive}
                        onDeleteAccount={props.onDeleteUserAccount}
                        currentUser={currentUser!}
                      />
                    }
                  />
                  <Route path="/comptes" element={<Navigate to="/accounts" replace />} />

                  {/* WhatsApp Sync Hub */}
                  <Route
                    path="/whatsapp"
                    element={<WhatsAppSyncHub currentUser={currentUser!} />}
                  />

                  {/* Settings */}
                  <Route
                    path="/settings"
                    element={
                      <Settings
                        settings={props.settings}
                        onSaveSettings={props.onSaveSettings}
                        onRunAutoArchive={props.onRunAutoArchive}
                      />
                    }
                  />
                  <Route path="/parametres" element={<Navigate to="/settings" replace />} />

                  {/* Catch all redirect */}
                  <Route path="*" element={<Navigate to={getDefaultLandingRoute()} replace />} />
                </Routes>
              </ProtectedAppLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
