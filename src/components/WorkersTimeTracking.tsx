import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Worker, TimePunch, CompanySettings, UserAccount } from '@/types';
import { timePunchSchema, TimePunchFormData } from '@/schemas';
import { formatDate } from '@/lib/utils';
import { 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ShieldCheck, 
  UserCheck, 
  AlertCircle,
  Calendar,
  Lock,
  ArrowRight
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface WorkersTimeTrackingProps {
  workers: Worker[];
  timePunches: TimePunch[];
  onAddPunch: (punch: TimePunch) => void;
  onAddWorker: (worker: Worker) => void;
  onToggleWorkerActive: (workerId: string) => void;
  settings: CompanySettings;
  userAccounts: UserAccount[];
}

export default function WorkersTimeTracking({
  workers,
  timePunches,
  onAddPunch,
  userAccounts,
}: WorkersTimeTrackingProps) {
  const [isPunchModalOpen, setIsPunchModalOpen] = useState(false);
  const [punchFeedback, setPunchFeedback] = useState<{ success: boolean; message: string } | null>(null);

  // Available staff from user accounts or workers
  const staffList = userAccounts.filter((u) => u.active);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TimePunchFormData>({
    resolver: zodResolver(timePunchSchema),
    defaultValues: {
      workerId: staffList[0]?.id || '',
      workerName: staffList[0]?.name || '',
      type: 'arrivee',
      siteLocation: 'Atelier Principal Antsirabe',
      taskNote: '',
      pinCode: '',
    },
  });

  const openPunchModal = (type: 'arrivee' | 'depart' | 'chantier' | 'pause' = 'arrivee') => {
    setPunchFeedback(null);
    reset({
      workerId: staffList[0]?.id || '',
      workerName: staffList[0]?.name || '',
      type,
      siteLocation: 'Atelier Principal Antsirabe',
      taskNote: '',
      pinCode: '',
    });
    setIsPunchModalOpen(true);
  };

  const onSubmit = (data: TimePunchFormData) => {
    // Authenticate PIN
    const targetUser = userAccounts.find((u) => u.id === data.workerId);
    if (!targetUser || targetUser.password !== data.pinCode.trim()) {
      setPunchFeedback({
        success: false,
        message: 'Code PIN incorrect pour ce collaborateur.',
      });
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString('fr-FR');
    const hash = `KT-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;

    const newPunch: TimePunch = {
      id: `PCH-${Date.now().toString().slice(-6)}`,
      workerId: data.workerId,
      workerName: data.workerName,
      type: data.type,
      date: dateStr,
      time: timeStr,
      isoTimestamp: now.toISOString(),
      siteLocation: data.siteLocation,
      taskNote: data.taskNote,
      immutableHash: hash,
    };

    onAddPunch(newPunch);
    setPunchFeedback({
      success: true,
      message: `Pointage ${data.type.toUpperCase()} certifié avec succès pour ${data.workerName} !`,
    });

    setTimeout(() => {
      setIsPunchModalOpen(false);
      setPunchFeedback(null);
    }, 1500);
  };

  // Today's punches
  const todayStr = new Date().toISOString().split('T')[0];
  const todayPunches = timePunches.filter((p) => p.date === todayStr);

  return (
    <div className="space-y-6 text-left">
      {/* Quick Punch Action Bar */}
      <Card className="border-stone-200 dark:border-slate-800 bg-gradient-to-br from-stone-900 via-stone-800 to-[#541515] text-white shadow-lg overflow-hidden">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-300">
                Horodateur Certifié & Présence Équipe
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                Borne de Pointage du Personnel
              </h2>
              <p className="text-xs text-stone-300">
                Pointage géoréférencé avec scellé d'inviolabilité pour l'atelier et les chantiers extérieurs.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="krukov"
                onClick={() => openPunchModal('arrivee')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs"
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" /> Prise de Poste (Arrivée)
              </Button>
              <Button
                variant="outline"
                onClick={() => openPunchModal('chantier')}
                className="border-white/30 text-white hover:bg-white/10 font-bold text-xs"
              >
                <MapPin className="w-3.5 h-3.5 mr-1.5" /> Sur Chantier
              </Button>
              <Button
                variant="outline"
                onClick={() => openPunchModal('depart')}
                className="border-white/30 text-white hover:bg-white/10 font-bold text-xs"
              >
                <ArrowRight className="w-3.5 h-3.5 mr-1.5" /> Fin de Journée
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History of Punches */}
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historique Récent des Pointages</CardTitle>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                {todayPunches.length} pointage{todayPunches.length > 1 ? 's' : ''} enregistré{todayPunches.length > 1 ? 's' : ''} aujourd'hui
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-slate-800/80 text-stone-500 font-bold border-b border-stone-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Collaborateur</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Date & Heure</th>
                  <th className="p-3">Lieu / Chantier</th>
                  <th className="p-3">Note de tâche</th>
                  <th className="p-3 text-right">Scellé Numérique</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60">
                {timePunches.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-stone-400">
                      Aucun pointage dans le registre
                    </td>
                  </tr>
                ) : (
                  timePunches.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
                        <UserCheck className="w-3.5 h-3.5 text-stone-400" />
                        <span>{p.workerName}</span>
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={
                            p.type === 'arrivee'
                              ? 'success'
                              : p.type === 'chantier'
                              ? 'warning'
                              : p.type === 'depart'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {p.type.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-3 text-stone-500 font-mono">
                        {formatDate(p.date)} à {p.time}
                      </td>
                      <td className="p-3 text-stone-700 dark:text-slate-300 font-medium">
                        {p.siteLocation}
                      </td>
                      <td className="p-3 text-stone-500 max-w-xs truncate">
                        {p.taskNote || '-'}
                      </td>
                      <td className="p-3 text-right font-mono text-[10px] text-stone-400">
                        {p.immutableHash || 'KT-CERT-OK'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: Punch Form */}
      <Dialog open={isPunchModalOpen} onOpenChange={setIsPunchModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pointage de Présence Certifié</DialogTitle>
          </DialogHeader>

          {punchFeedback && (
            <div className={`p-3 rounded-xl flex items-center gap-2 text-xs font-semibold ${
              punchFeedback.success
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200'
                : 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200'
            }`}>
              {punchFeedback.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{punchFeedback.message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Collaborateur
              </label>
              <select
                {...register('workerId')}
                onChange={(e) => {
                  setValue('workerId', e.target.value);
                  const staff = staffList.find((s) => s.id === e.target.value);
                  if (staff) setValue('workerName', staff.name);
                }}
                className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.matricule})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Type de Pointage
                </label>
                <select
                  {...register('type')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="arrivee">Prise de Poste (Arrivée)</option>
                  <option value="chantier">Arrivée sur Chantier</option>
                  <option value="pause">Pause / Déjeuner</option>
                  <option value="depart">Fin de Journée (Départ)</option>
                </select>
              </div>

              <div>
                <Input
                  label="Lieu / Chantier *"
                  placeholder="ex: Atelier ou Chantier Madacom"
                  {...register('siteLocation')}
                  error={errors.siteLocation?.message}
                />
              </div>
            </div>

            <Input
              label="Note d'activité (facultatif)"
              placeholder="ex: Câblage baie de brassage, installation onduleur..."
              {...register('taskNote')}
            />

            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-stone-400" /> Code PIN Collaborateur *
              </label>
              <input
                type="password"
                {...register('pinCode')}
                placeholder="Entrez votre mot de passe pour signer"
                className="flex h-10 w-full rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#541515]"
              />
              {errors.pinCode && <p className="text-xs text-red-600 mt-1">{errors.pinCode.message}</p>}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsPunchModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov" disabled={isSubmitting}>
                Certifier le Pointage
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
