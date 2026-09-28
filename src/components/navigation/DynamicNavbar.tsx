import React from 'react';
import { 
  FileText, 
  FileSpreadsheet, 
  Users, 
  Landmark, 
  Briefcase, 
  ClipboardList, 
  Clock, 
  DollarSign, 
  Scale, 
  UserCog, 
  Settings as SettingsIcon, 
  MessageSquare,
  LogOut, 
  Menu, 
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import NotificationCenter from '@/components/NotificationCenter';
import { UserAccount, UserRole, DailyFieldReport, SiteIncidentReport } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface DynamicNavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserAccount;
  getRoleBadgeLabel: (role: UserRole) => string;
  onOpenDrawer: () => void;
  isDrawerOpen: boolean;
  onOpenTerminal: () => void;
  onLogout: () => void;
  unresolvedIncidentsCount: number;
  pendingInvoicesCount: number;
  dailyReports: DailyFieldReport[];
  siteIncidents: SiteIncidentReport[];
  readNotificationIds: string[];
  onNavigateFromNotification: (tab: 'daily_reports' | 'incidents', highlightId?: string) => void;
  onMarkAllNotificationsRead: () => void;
  onMarkNotificationItemRead: (id: string) => void;
  permissions: {
    canAccessInvoices: boolean;
    canAccessQuotes: boolean;
    canAccessClients: boolean;
    canAccessTransactions: boolean;
    canAccessMissions: boolean;
    canAccessReports: boolean;
    canAccessAccounts: boolean;
    canAccessPointage: boolean;
    canAccessSalaires: boolean;
    canAccessLegalDocuments: boolean;
    canAccessSettings: boolean;
  };
}

export default function DynamicNavbar({
  activeTab,
  onSelectTab,
  currentUser,
  getRoleBadgeLabel,
  onOpenDrawer,
  onOpenTerminal,
  onLogout,
  pendingInvoicesCount,
  dailyReports,
  siteIncidents,
  readNotificationIds,
  onNavigateFromNotification,
  onMarkAllNotificationsRead,
  onMarkNotificationItemRead,
  permissions,
}: DynamicNavbarProps) {
  const navItems = [
    { id: 'invoices', label: 'Factures', icon: FileText, show: permissions.canAccessInvoices, badge: pendingInvoicesCount },
    { id: 'quotes', label: 'Devis', icon: FileSpreadsheet, show: permissions.canAccessQuotes },
    { id: 'clients', label: 'Clients', icon: Users, show: permissions.canAccessClients },
    { id: 'transactions', label: 'Trésorerie', icon: Landmark, show: permissions.canAccessTransactions },
    { id: 'missions', label: 'Missions', icon: Briefcase, show: permissions.canAccessMissions },
    { id: 'reports', label: 'Terrain', icon: ClipboardList, show: permissions.canAccessReports },
    { id: 'pointage', label: 'Pointage', icon: Clock, show: permissions.canAccessPointage },
    { id: 'salaires', label: 'Salaires', icon: DollarSign, show: permissions.canAccessSalaires },
    { id: 'documents', label: 'Contrats', icon: Scale, show: permissions.canAccessLegalDocuments },
    { id: 'accounts', label: 'Équipe', icon: UserCog, show: permissions.canAccessAccounts },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, show: true },
    { id: 'settings', label: 'Réglages', icon: SettingsIcon, show: permissions.canAccessSettings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-stone-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between h-16 gap-3">
        {/* Left: Logo & Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenDrawer}
            className="lg:hidden p-2 rounded-xl text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Menu de navigation"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => onSelectTab('invoices')}>
            <Logo className="w-8 h-8 sm:w-9 sm:h-9" />
            <div className="text-left">
              <span className="font-black text-sm sm:text-base tracking-tight text-stone-900 dark:text-slate-100 block">
                KRUKOV TEK
              </span>
              <span className="text-[10px] sm:text-xs text-stone-500 dark:text-slate-400 font-medium block">
                Antsirabe • Systèmes & Énergie
              </span>
            </div>
          </div>
        </div>

        {/* Center: Desktop Nav items */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.filter((i) => i.show).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`relative px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#541515] text-white shadow-xs'
                    : 'text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
                {item.badge && item.badge > 0 ? (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    isActive ? 'bg-white text-[#541515]' : 'bg-[#541515] text-white'
                  }`}>
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Terminal button, Notifications, User info, Theme, Logout */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenTerminal}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold"
            title="Borne de pointage express"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#541515] dark:text-rose-400" />
            <span>Borne Express</span>
          </Button>

          <NotificationCenter
            dailyReports={dailyReports}
            siteIncidents={siteIncidents}
            readIds={readNotificationIds}
            onNavigate={onNavigateFromNotification}
            onMarkAllRead={onMarkAllNotificationsRead}
            onMarkRead={onMarkNotificationItemRead}
          />

          <ThemeToggle />

          {/* User profile & role pill */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-stone-200 dark:border-slate-800 text-left">
            <div className="text-right">
              <span className="text-xs font-bold text-stone-900 dark:text-slate-100 block truncate max-w-[130px]">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-stone-500 dark:text-slate-400 block">
                {getRoleBadgeLabel(currentUser.role)}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-stone-200 dark:bg-slate-800 flex items-center justify-center font-black text-xs text-stone-700 dark:text-slate-300">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <button
            onClick={onLogout}
            className="p-2 rounded-xl text-stone-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
            title="Se déconnecter"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
