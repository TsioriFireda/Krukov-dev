import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WorkerSalaryPayment, UserAccount, CompanySettings } from '@/types';
import { salaryPaymentSchema, SalaryPaymentFormData } from '@/schemas';
import { formatAriary, formatDate } from '@/lib/utils';
import { 
  Plus, 
  DollarSign, 
  Printer, 
  Wallet, 
  CheckCircle2, 
  Calendar,
  UserCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TeamWageLedgerProps {
  salaryPayments: WorkerSalaryPayment[];
  userAccounts: UserAccount[];
  settings: CompanySettings;
  onAddSalaryPayment: (p: WorkerSalaryPayment) => void;
  currentUser: UserAccount;
}

export default function TeamWageLedger({
  salaryPayments,
  userAccounts,
  settings,
  onAddSalaryPayment,
  currentUser,
}: TeamWageLedgerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<WorkerSalaryPayment | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const staffList = userAccounts.filter((u) => u.active);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SalaryPaymentFormData>({
    resolver: zodResolver(salaryPaymentSchema),
    defaultValues: {
      workerId: staffList[0]?.id || '',
      workerName: staffList[0]?.name || '',
      period: 'Septembre 2026',
      paymentType: 'solde',
      amount: 350000,
      paymentMethod: 'mvola',
      reference: `PAY-${Date.now().toString().slice(-4)}`,
      notes: 'Règlement virement mobile certifié.',
    },
  });

  const openCreateModal = () => {
    reset({
      workerId: staffList[0]?.id || '',
      workerName: staffList[0]?.name || '',
      period: 'Septembre 2026',
      paymentType: 'solde',
      amount: 350000,
      paymentMethod: 'mvola',
      reference: `PAY-${Date.now().toString().slice(-4)}`,
      notes: 'Règlement de salaire.',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: SalaryPaymentFormData) => {
    const targetUser = userAccounts.find((u) => u.id === data.workerId);
    const newPayment: WorkerSalaryPayment = {
      id: `SAL-${Date.now().toString().slice(-6)}`,
      paymentDate: new Date().toISOString().split('T')[0],
      workerId: data.workerId,
      workerName: data.workerName,
      workerRole: targetUser?.role || 'employe',
      period: data.period,
      paymentType: data.paymentType,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      recordedBy: currentUser.name,
      notes: data.notes,
    };
    onAddSalaryPayment(newPayment);
    setIsModalOpen(false);
  };

  const totalPaidOut = salaryPayments.reduce((s, p) => s + p.amount, 0);

  return (
    <div className="space-y-6 text-left">
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Bulletins de Paie & Livre de Rémunération</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Historique des acomptes, salaires mensuels et primes versées aux équipes
            </p>
          </div>
          <Button variant="krukov" onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Enregistrer un Versement
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-slate-800/80 text-stone-500 font-bold border-b border-stone-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Réf.</th>
                  <th className="p-3">Collaborateur</th>
                  <th className="p-3">Période</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3 text-right">Montant</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60">
                {salaryPayments.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      Aucun versement de salaire consigné
                    </td>
                  </tr>
                ) : (
                  salaryPayments.map((p) => (
                    <tr key={p.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-stone-900 dark:text-slate-100">{p.id}</td>
                      <td className="p-3 font-semibold text-stone-900 dark:text-slate-100">{p.workerName}</td>
                      <td className="p-3 text-stone-500">{p.period}</td>
                      <td className="p-3">
                        <Badge variant="secondary" className="capitalize">
                          {p.paymentType}
                        </Badge>
                      </td>
                      <td className="p-3 uppercase font-mono text-[10px] text-stone-500">{p.paymentMethod}</td>
                      <td className="p-3 text-right font-mono font-black text-emerald-600">
                        {formatAriary(p.amount)}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedPayment(p);
                            setIsReceiptModalOpen(true);
                          }}
                          className="h-7 w-7 p-0"
                          title="Imprimer Reçu de Salaire"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: New Payment Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Versement Salaire / Acompte</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Collaborateur Bénéficiaire
              </label>
              <select
                {...register('workerId')}
                onChange={(e) => {
                  setValue('workerId', e.target.value);
                  const st = staffList.find((s) => s.id === e.target.value);
                  if (st) setValue('workerName', st.name);
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
              <Input
                label="Période Concernée *"
                placeholder="ex: Octobre 2026"
                {...register('period')}
                error={errors.period?.message}
              />
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">Type de Paiement</label>
                <select
                  {...register('paymentType')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="solde">Solde de Salaire</option>
                  <option value="acompte">Acompte Quinzaine</option>
                  <option value="prime">Prime d'Intervention</option>
                  <option value="journalier">Paiement Journalier</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label="Montant (Ariary) *"
                placeholder="ex: 350000"
                {...register('amount', { valueAsNumber: true })}
                error={errors.amount?.message}
              />
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">Mode de Versement</label>
                <select
                  {...register('paymentMethod')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="mvola">Mvola</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="especes">Espèces Caisse</option>
                  <option value="virement">Virement Bancaire</option>
                </select>
              </div>
            </div>

            <Input
              label="Référence Transaction (facultatif)"
              placeholder="ex: MVOLA-992140"
              {...register('reference')}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                Enregistrer le Règlement
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
