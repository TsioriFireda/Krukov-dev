import React from 'react';
import { FileText, FileSpreadsheet, Users, ClipboardList, Clock, MoreHorizontal } from 'lucide-react';

interface DynamicTaskbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenDrawer: () => void;
  permissions: {
    canAccessInvoices: boolean;
    canAccessQuotes: boolean;
    canAccessClients: boolean;
    canAccessReports: boolean;
    canAccessPointage: boolean;
  };
}

export default function DynamicTaskbar({
  activeTab,
  onSelectTab,
  onOpenDrawer,
  permissions,
}: DynamicTaskbarProps) {
  const tabs = [
    { id: 'invoices', label: 'Factures', icon: FileText, show: permissions.canAccessInvoices },
    { id: 'quotes', label: 'Devis', icon: FileSpreadsheet, show: permissions.canAccessQuotes },
    { id: 'clients', label: 'Clients', icon: Users, show: permissions.canAccessClients },
    { id: 'reports', label: 'Terrain', icon: ClipboardList, show: permissions.canAccessReports },
    { id: 'pointage', label: 'Pointage', icon: Clock, show: permissions.canAccessPointage },
  ].filter((t) => t.show);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-stone-200 dark:border-slate-800 xl:hidden px-2 py-1.5 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer ${
              isActive
                ? 'text-[#541515] dark:text-rose-400 font-bold scale-105'
                : 'text-stone-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Icon className="w-4.5 h-4.5" />
            <span className="text-[10px] tracking-tight mt-0.5">{tab.label}</span>
          </button>
        );
      })}
      
      <button
        onClick={onOpenDrawer}
        className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-stone-500 dark:text-slate-400 font-medium hover:text-stone-900 cursor-pointer"
      >
        <MoreHorizontal className="w-4.5 h-4.5" />
        <span className="text-[10px] tracking-tight mt-0.5">Plus</span>
      </button>
    </div>
  );
}
