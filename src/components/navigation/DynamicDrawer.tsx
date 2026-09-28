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
  X,
  Smartphone
} from 'lucide-react';
import Logo from '@/components/Logo';
import { UserAccount, UserRole } from '@/types';

interface DynamicDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: UserAccount;
  getRoleBadgeLabel: (role: UserRole) => string;
  onOpenTerminal: () => void;
  onLogout: () => void;
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

export default function DynamicDrawer({
  isOpen,
  onClose,
  activeTab,
  onSelectTab,
  currentUser,
  getRoleBadgeLabel,
  onOpenTerminal,
  onLogout,
  permissions,
}: DynamicDrawerProps) {
  if (!isOpen) return null;

  const items = [
    { id: 'invoices', label: 'Factures & Règlements', icon: FileText, show: permissions.canAccessInvoices },
    { id: 'quotes', label: 'Devis & Proformas', icon: FileSpreadsheet, show: permissions.canAccessQuotes },
    { id: 'clients', label: 'Répertoire Clients', icon: Users, show: permissions.canAccessClients },
    { id: 'transactions', label: 'Journal Trésorerie & Caisse', icon: Landmark, show: permissions.canAccessTransactions },
    { id: 'missions', label: 'Ordres de Mission & Badges', icon: Briefcase, show: permissions.canAccessMissions },
    { id: 'reports', label: 'Rapports Terrain & Incidents', icon: ClipboardList, show: permissions.canAccessReports },
    { id: 'pointage', label: 'Pointage & Présences', icon: Clock, show: permissions.canAccessPointage },
    { id: 'salaires', label: 'Bulletins de Paie', icon: DollarSign, show: permissions.canAccessSalaires },
    { id: 'documents', label: 'Documents & Contrats', icon: Scale, show: permissions.canAccessLegalDocuments },
    { id: 'accounts', label: 'Gestion des Utilisateurs', icon: UserCog, show: permissions.canAccessAccounts },
    { id: 'whatsapp', label: 'WhatsApp Sync Hub', icon: MessageSquare, show: true },
    { id: 'settings', label: 'Paramètres Entreprise', icon: SettingsIcon, show: permissions.canAccessSettings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Drawer content */}
      <div className="relative w-4/5 max-w-xs bg-white dark:bg-slate-900 border-r border-stone-200 dark:border-slate-800 flex flex-col h-full shadow-2xl z-50 text-left">
        <div className="p-4 border-b border-stone-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Logo className="w-8 h-8" />
            <div>
              <span className="font-bold text-sm text-stone-900 dark:text-slate-100 block">
                KRUKOV TEK
              </span>
              <span className="text-[11px] text-stone-500 dark:text-slate-400 block">
                {currentUser.name}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Role Card */}
        <div className="px-4 py-3 bg-stone-50 dark:bg-slate-800/40 border-b border-stone-100 dark:border-slate-800">
          <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
            Rôle Actuel
          </span>
          <span className="text-xs font-bold text-[#541515] dark:text-rose-400 block">
            {getRoleBadgeLabel(currentUser.role)}
          </span>
          <span className="text-[11px] text-stone-500 font-mono block">
            Matricule: {currentUser.matricule}
          </span>
        </div>

        {/* Links */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.filter((i) => i.show).map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#541515] text-white'
                    : 'text-stone-700 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer actions */}
        <div className="p-3 border-t border-stone-100 dark:border-slate-800 space-y-2">
          <button
            onClick={() => {
              onOpenTerminal();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 text-stone-800 dark:text-slate-200 text-xs font-bold hover:bg-stone-200 cursor-pointer"
          >
            <Smartphone className="w-4 h-4 text-[#541515] dark:text-rose-400" />
            <span>Borne de Pointage Express</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-red-600 dark:text-red-400 text-xs font-bold hover:bg-red-50 dark:hover:bg-red-950/40 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </div>
    </div>
  );
}
