import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DailyFieldReport, SiteIncidentReport, UserAccount } from '@/types';
import { dailyReportSchema, siteIncidentSchema, DailyReportFormData, SiteIncidentFormData } from '@/schemas';
import { formatDate } from '@/lib/utils';
import { 
  Plus, 
  ClipboardList, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Camera, 
  Calendar,
  Clock,
  ShieldAlert,
  Search,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface FieldReportsAndIncidentsProps {
  dailyReports: DailyFieldReport[];
  siteIncidents: SiteIncidentReport[];
  onAddDailyReport: (r: DailyFieldReport) => void;
  onAddSiteIncident: (i: SiteIncidentReport) => void;
  onUpdateIncidentStatus: (id: string, status: 'en_cours' | 'resolu', notes?: string) => void;
  currentUser: UserAccount;
  initialSubTab?: 'daily_reports' | 'incidents';
  highlightId?: string;
}

export default function FieldReportsAndIncidents({
  dailyReports,
  siteIncidents,
  onAddDailyReport,
  onAddSiteIncident,
  onUpdateIncidentStatus,
  currentUser,
  initialSubTab = 'daily_reports',
}: FieldReportsAndIncidentsProps) {
  const [subTab, setSubTab] = useState<'daily_reports' | 'incidents'>(initialSubTab);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);

  // Daily Report Form with Zod
  const reportForm = useForm<DailyReportFormData>({
    resolver: zodResolver(dailyReportSchema),
    defaultValues: {
      siteName: '',
      clientName: '',
      workDoneText: '',
      progressPercent: 50,
      materialsUsed: '',
    },
  });

  // Incident Form with Zod
  const incidentForm = useForm<SiteIncidentFormData>({
    resolver: zodResolver(siteIncidentSchema),
    defaultValues: {
      siteName: '',
      severity: 'modere',
      title: '',
      description: '',
    },
  });

  const onSubmitReport = (data: DailyReportFormData) => {
    const now = new Date();
    const newReport: DailyFieldReport = {
      id: `REP-${Date.now().toString().slice(-6)}`,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('fr-FR'),
      workerId: currentUser.id,
      workerName: currentUser.name,
      workerRole: currentUser.role,
      siteName: data.siteName,
      clientName: data.clientName,
      workDoneText: data.workDoneText,
      progressPercent: data.progressPercent,
      photos: [],
      materialsUsed: data.materialsUsed,
      gpsCoordinates: {
        latitude: -19.8659,
        longitude: 47.0333,
      },
      createdAt: now.toISOString(),
    };
    onAddDailyReport(newReport);
    setIsReportModalOpen(false);
    reportForm.reset();
  };

  const onSubmitIncident = (data: SiteIncidentFormData) => {
    const now = new Date();
    const newIncident: SiteIncidentReport = {
      id: `INC-${Date.now().toString().slice(-6)}`,
      workerId: currentUser.id,
      workerName: currentUser.name,
      workerRole: currentUser.role,
      date: now.toISOString().split('T')[0],
      time: now.toLocaleTimeString('fr-FR'),
      siteName: data.siteName,
      severity: data.severity,
      title: data.title,
      description: data.description,
      status: 'signale',
      gpsCoordinates: {
        latitude: -19.8659,
        longitude: 47.0333,
      },
    };
    onAddSiteIncident(newIncident);
    setIsIncidentModalOpen(false);
    incidentForm.reset();
  };

  return (
    <div className="space-y-6 text-left">
      {/* Subtab navigation */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setSubTab('daily_reports')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            subTab === 'daily_reports'
              ? 'bg-[#541515] text-white'
              : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <ClipboardList className="w-4 h-4" />
          <span>Rapports Journaliers de Terrain ({dailyReports.length})</span>
        </button>
        <button
          onClick={() => setSubTab('incidents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            subTab === 'incidents'
              ? 'bg-red-700 text-white'
              : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Signalement Incidents ({siteIncidents.filter((i) => i.status !== 'resolu').length} en cours)</span>
        </button>
      </div>

      {subTab === 'daily_reports' ? (
        <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Rapports d'Avancement Chantier</CardTitle>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                Compte-rendus journaliers des installations solaires et travaux réseaux
              </p>
            </div>
            <Button variant="krukov" onClick={() => setIsReportModalOpen(true)} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1.5" /> Rédiger un Rapport Terrain
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyReports.map((report) => (
                <div
                  key={report.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100">
                        {report.siteName}
                      </h4>
                      <p className="text-xs text-stone-500">
                        Rédigé par <strong className="text-stone-700 dark:text-slate-300">{report.workerName}</strong>
                      </p>
                    </div>
                    <Badge variant="krukov">
                      {report.progressPercent}% Terminé
                    </Badge>
                  </div>

                  <div className="w-full bg-stone-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all"
                      style={{ width: `${report.progressPercent}%` }}
                    />
                  </div>

                  <p className="text-xs text-stone-600 dark:text-slate-300 bg-stone-50 dark:bg-slate-800/50 p-3 rounded-lg leading-relaxed">
                    {report.workDoneText}
                  </p>

                  {report.materialsUsed && (
                    <div className="text-[11px] text-stone-500">
                      <strong>Fournitures utilisées :</strong> {report.materialsUsed}
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-stone-400 pt-2 border-t border-stone-100 dark:border-slate-800 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(report.date)} à {report.time}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>GPS -19.865, 47.033 (OK)</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Incidents Tab */
        <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Registre des Incidents & Risques Terrain</CardTitle>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                Signalement immédiat pour sécurité électrique, pannes et blocages chantiers
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setIsIncidentModalOpen(true)}
              className="w-full sm:w-auto font-bold"
            >
              <AlertTriangle className="w-4 h-4 mr-1.5" /> Déclarer un Incident
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {siteIncidents.map((incident) => (
                <div
                  key={incident.id}
                  className={`p-4 rounded-xl border space-y-3 ${
                    incident.status === 'resolu'
                      ? 'border-emerald-200 dark:border-emerald-950 bg-white dark:bg-slate-900'
                      : 'border-red-200 dark:border-red-950 bg-red-50/20 dark:bg-red-950/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-[10px] text-stone-400 block">{incident.id}</span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100">{incident.title}</h4>
                      <p className="text-xs text-stone-500">{incident.siteName} • par {incident.workerName}</p>
                    </div>
                    <Badge variant={incident.status === 'resolu' ? 'success' : 'destructive'}>
                      {incident.severity.toUpperCase()}
                    </Badge>
                  </div>

                  <p className="text-xs text-stone-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-3 rounded-lg border border-stone-100 dark:border-slate-800">
                    {incident.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800 text-xs">
                    <span className="text-[11px] text-stone-400 font-mono">
                      {formatDate(incident.date)} à {incident.time}
                    </span>
                    {incident.status !== 'resolu' ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateIncidentStatus(incident.id, 'resolu', 'Résolu et sécurisé par l\'équipe')}
                        className="text-xs h-7 text-emerald-600"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Marquer Résolu
                      </Button>
                    ) : (
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Résolu
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: New Daily Report Form */}
      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Soumettre un Rapport Journalier de Chantier</DialogTitle>
          </DialogHeader>

          <form onSubmit={reportForm.handleSubmit(onSubmitReport)} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Nom du Chantier / Site *"
                placeholder="ex: Chantier Solaire Vatofotsy"
                {...reportForm.register('siteName')}
                error={reportForm.formState.errors.siteName?.message}
              />
              <Input
                label="Nom du Client (facultatif)"
                placeholder="ex: Société Madacom"
                {...reportForm.register('clientName')}
              />
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Détail des Travaux Effectués Aujourd'hui *
              </label>
              <textarea
                rows={4}
                {...reportForm.register('workDoneText')}
                placeholder="Décrivez avec précision : câblage, raccordements, tests effectués, difficultés rencontrées..."
                className="w-full p-3 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#541515]"
              />
              {reportForm.formState.errors.workDoneText && (
                <p className="text-xs text-red-600 mt-1">{reportForm.formState.errors.workDoneText.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label="Progression Estimée (%) *"
                min={0}
                max={100}
                {...reportForm.register('progressPercent', { valueAsNumber: true })}
                error={reportForm.formState.errors.progressPercent?.message}
              />
              <Input
                label="Matériels utilisés"
                placeholder="ex: 12 connecteurs RJ45, 4 disjoncteurs"
                {...reportForm.register('materialsUsed')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsReportModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                Soumettre le Rapport
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Declare Incident Form */}
      <Dialog open={isIncidentModalOpen} onOpenChange={setIsIncidentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Déclaration d'Incident de Sécurité / Chantier</DialogTitle>
          </DialogHeader>

          <form onSubmit={incidentForm.handleSubmit(onSubmitIncident)} className="space-y-3.5">
            <Input
              label="Site / Chantier concerné *"
              placeholder="ex: Chantier Madacom"
              {...incidentForm.register('siteName')}
              error={incidentForm.formState.errors.siteName?.message}
            />

            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Niveau de Gravité *
              </label>
              <select
                {...incidentForm.register('severity')}
                className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="mineur">Mineur (Aucun impact sécurité)</option>
                <option value="modere">Modéré (Ralentissement des travaux)</option>
                <option value="critique">Critique (Risque électrique ou panne matériel)</option>
                <option value="bloquant">Bloquant (Arrêt d'urgence du chantier)</option>
              </select>
            </div>

            <Input
              label="Intitulé de l'incident *"
              placeholder="ex: Câble d'alimentation sectionné"
              {...incidentForm.register('title')}
              error={incidentForm.formState.errors.title?.message}
            />

            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Description détaillée des faits *
              </label>
              <textarea
                rows={3}
                {...incidentForm.register('description')}
                placeholder="Que s'est-il passé ? Quelles mesures immédiates ont été prises ?"
                className="w-full p-3 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
              {incidentForm.formState.errors.description && (
                <p className="text-xs text-red-600 mt-1">{incidentForm.formState.errors.description.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsIncidentModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="destructive">
                Diffuser l'Alerte Incident
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
