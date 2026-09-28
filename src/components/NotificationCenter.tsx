import React, { useState } from 'react';
import { Bell, CheckCheck, AlertTriangle, FileText, X } from 'lucide-react';
import { DailyFieldReport, SiteIncidentReport } from '@/types';

interface NotificationCenterProps {
  dailyReports: DailyFieldReport[];
  siteIncidents: SiteIncidentReport[];
  readIds: string[];
  onNavigate: (tab: 'daily_reports' | 'incidents', highlightId?: string) => void;
  onMarkAllRead: () => void;
  onMarkRead: (id: string) => void;
}

export default function NotificationCenter({
  dailyReports,
  siteIncidents,
  readIds,
  onNavigate,
  onMarkAllRead,
  onMarkRead,
}: NotificationCenterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const unreadIncidents = siteIncidents.filter((i) => !readIds.includes(i.id));
  const unreadReports = dailyReports.filter((r) => !readIds.includes(r.id));
  const totalUnread = unreadIncidents.length + unreadReports.length;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg text-stone-600 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        title="Notifications"
      >
        <Bell className="w-4 h-4" />
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4.5 min-w-4.5 px-1 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 border border-stone-200 dark:border-slate-800 shadow-xl z-50 p-4 animate-in fade-in zoom-in-95 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#541515] dark:text-rose-400" />
                <span className="font-bold text-sm text-stone-900 dark:text-slate-100">
                  Centre d'Alertes
                </span>
                {totalUnread > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#541515]/10 text-[#541515] dark:text-rose-400">
                    {totalUnread} non lue{totalUnread > 1 ? 's' : ''}
                  </span>
                )}
              </div>
              {totalUnread > 0 && (
                <button
                  onClick={onMarkAllRead}
                  className="flex items-center gap-1 text-[11px] font-semibold text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-slate-200 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Tout marquer lu
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-stone-100 dark:divide-slate-800/60 py-2">
              {unreadIncidents.length === 0 && unreadReports.length === 0 ? (
                <div className="py-8 text-center text-xs text-stone-400">
                  Aucune notification non lue
                </div>
              ) : (
                <>
                  {unreadIncidents.map((incident) => (
                    <div
                      key={incident.id}
                      onClick={() => {
                        onMarkRead(incident.id);
                        onNavigate('incidents', incident.id);
                        setIsOpen(false);
                      }}
                      className="p-2.5 hover:bg-stone-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-950/60 text-red-600 shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-900 dark:text-slate-100 truncate">
                            Incident : {incident.title}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-slate-400">
                            {incident.siteName} • {incident.workerName}
                          </p>
                          <span className="text-[10px] text-red-600 font-semibold uppercase">
                            Gravité : {incident.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                  {unreadReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => {
                        onMarkRead(report.id);
                        onNavigate('daily_reports', report.id);
                        setIsOpen(false);
                      }}
                      className="p-2.5 hover:bg-stone-50 dark:hover:bg-slate-800/60 rounded-xl cursor-pointer transition-colors"
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-stone-900 dark:text-slate-100 truncate">
                            Rapport : {report.siteName}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-slate-400">
                            Par {report.workerName} • Progression {report.progressPercent}%
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
