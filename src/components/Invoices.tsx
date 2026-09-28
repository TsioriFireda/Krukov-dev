import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Invoice, Client, CompanySettings, InvoiceItem } from '@/types';
import { invoiceSchema, InvoiceFormData } from '@/schemas';
import { formatAriary, formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  FileText, 
  CheckCircle, 
  Clock, 
  Printer, 
  Trash2, 
  DollarSign, 
  Eye, 
  AlertCircle,
  FileCheck,
  Building
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface InvoicesProps {
  invoices: Invoice[];
  clients: Client[];
  settings: CompanySettings;
  onAddInvoice: (inv: Invoice) => void;
  onUpdateInvoice: (inv: Invoice) => void;
  onTriggerPaymentLogged: (inv: Invoice, method: string) => void;
}

export default function Invoices({
  invoices,
  clients,
  settings,
  onAddInvoice,
  onUpdateInvoice,
  onTriggerPaymentLogged,
}: InvoicesProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid' | 'cancelled'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mvola' | 'orange_money' | 'especes' | 'virement'>('mvola');

  // React Hook Form with Zod validation
  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: 'item-1',
          description: 'Fourniture & Pose kit solaire autoconsommation',
          unitPriceHT: 1200000,
          quantity: 1,
          vatRate: 0,
        },
      ],
      status: 'pending',
      notes: 'Règlement par Mvola au 033 51 848 75 ou virement bancaire.',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const watchedItems = watch('items') || [];
  const totalCalculated = watchedItems.reduce(
    (sum, item) => sum + (Number(item.unitPriceHT) || 0) * (Number(item.quantity) || 0),
    0
  );

  const openNewInvoiceModal = () => {
    reset({
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: Math.random().toString(36).substring(2, 9),
          description: '',
          unitPriceHT: 0,
          quantity: 1,
          vatRate: 0,
        },
      ],
      status: 'pending',
      notes: 'Règlement par Mvola au 033 51 848 75 ou espèces.',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: InvoiceFormData) => {
    const totalHT = data.items.reduce((s, it) => s + it.unitPriceHT * it.quantity, 0);
    const totalTTC = totalHT; // Micro-entreprise non assujettie à la TVA

    const newInvoice: Invoice = {
      id: `F${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      clientId: data.clientId,
      clientName: data.clientName,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      totalHT,
      totalTTC,
      totalVAT: 0,
      status: data.status,
      items: data.items.map((it, idx) => ({
        id: it.id || `item-${idx + 1}`,
        description: it.description,
        unitPriceHT: it.unitPriceHT,
        quantity: it.quantity,
        vatRate: it.vatRate || 0,
      })),
      notes: data.notes,
    };

    onAddInvoice(newInvoice);
    setIsModalOpen(false);
  };

  const handleMarkPaid = (inv: Invoice, method: string) => {
    const updated = { ...inv, status: 'paid' as const };
    onUpdateInvoice(updated);
    onTriggerPaymentLogged(inv, method);
    setIsPaymentModalOpen(false);
  };

  // Filtered list
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalInvoiced = invoices.reduce((sum, i) => sum + i.totalTTC, 0);
  const totalPaid = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.totalTTC, 0);
  const totalPending = invoices.filter((i) => i.status === 'pending').reduce((sum, i) => sum + i.totalTTC, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">Total Facturé</p>
              <p className="text-xl font-black text-stone-900 dark:text-slate-100">{formatAriary(totalInvoiced)}</p>
              <p className="text-[11px] text-stone-400">{invoices.length} factures émises</p>
            </div>
            <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-xl text-stone-700 dark:text-slate-300">
              <FileText className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">Encaissé</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatAriary(totalPaid)}</p>
              <p className="text-[11px] text-stone-400">{invoices.filter((i) => i.status === 'paid').length} réglées</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">En Attente</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">{formatAriary(totalPending)}</p>
              <p className="text-[11px] text-stone-400">{invoices.filter((i) => i.status === 'pending').length} non soldées</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Facturation Client & Encaissements</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Gestion certifiée des factures conformes à la réglementation malagasy (TVA non assujettie)
            </p>
          </div>
          <Button variant="krukov" onClick={openNewInvoiceModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Nouvelle Facture
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Controls: Search + Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher par N° ou client..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-[#541515]"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
              {(['all', 'pending', 'paid', 'cancelled'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st === 'all' ? 'Toutes' : st === 'pending' ? 'En attente' : st === 'paid' ? 'Payées' : 'Annulées'}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-slate-800/80 text-stone-500 font-bold border-b border-stone-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Numéro</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Émission</th>
                  <th className="p-3">Échéance</th>
                  <th className="p-3 text-right">Montant TTC</th>
                  <th className="p-3 text-center">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60">
                {filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      Aucune facture trouvée
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-stone-900 dark:text-slate-100">{inv.id}</td>
                      <td className="p-3 font-semibold text-stone-900 dark:text-slate-100">{inv.clientName}</td>
                      <td className="p-3 text-stone-500">{formatDate(inv.issueDate)}</td>
                      <td className="p-3 text-stone-500">{formatDate(inv.dueDate)}</td>
                      <td className="p-3 text-right font-black text-stone-900 dark:text-slate-100 font-mono">
                        {formatAriary(inv.totalTTC)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            inv.status === 'paid'
                              ? 'success'
                              : inv.status === 'pending'
                              ? 'warning'
                              : 'destructive'
                          }
                        >
                          {inv.status === 'paid' ? 'Payée' : inv.status === 'pending' ? 'En attente' : 'Annulée'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {inv.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedInvoice(inv);
                              setIsPaymentModalOpen(true);
                            }}
                            className="text-xs h-7 text-emerald-600 hover:text-emerald-700"
                            title="Encaisser"
                          >
                            <DollarSign className="w-3.5 h-3.5 mr-1" /> Encaisser
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedInvoice(inv);
                            setIsPrintModalOpen(true);
                          }}
                          className="h-7 w-7 p-0"
                          title="Imprimer / Télécharger"
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

      {/* Modal: New Invoice Form with React Hook Form + Zod */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Émettre une Nouvelle Facture</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Client Bénéficiaire
                </label>
                <select
                  {...register('clientId')}
                  onChange={(e) => {
                    setValue('clientId', e.target.value);
                    const c = clients.find((cl) => cl.id === e.target.value);
                    if (c) setValue('clientName', c.name);
                  }}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Date d'Émission
                </label>
                <input
                  type="date"
                  {...register('issueDate')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Date Limite de Règlement
                </label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Statut Initial
                </label>
                <select
                  {...register('status')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="pending">En attente de paiement</option>
                  <option value="paid">Payée immédiatement</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-stone-500">Articles & Prestations</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      id: Math.random().toString(36).substring(2, 9),
                      description: '',
                      unitPriceHT: 0,
                      quantity: 1,
                      vatRate: 0,
                    })
                  }
                  className="text-xs"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" /> Ajouter Ligne
                </Button>
              </div>

              {fields.map((field, idx) => (
                <div key={field.id} className="flex items-start gap-2 p-2 rounded-xl bg-stone-50 dark:bg-slate-800/40">
                  <div className="flex-1">
                    <input
                      {...register(`items.${idx}.description`)}
                      placeholder="Description des travaux, matériel ou main-d'œuvre..."
                      className="w-full h-8 px-2.5 text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                    />
                  </div>
                  <div className="w-28">
                    <input
                      type="number"
                      {...register(`items.${idx}.unitPriceHT`, { valueAsNumber: true })}
                      placeholder="Prix Unit. (Ar)"
                      className="w-full h-8 px-2 text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-right"
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      step="0.1"
                      {...register(`items.${idx}.quantity`, { valueAsNumber: true })}
                      placeholder="Qté"
                      className="w-full h-8 px-2 text-xs rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center"
                    />
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(idx)}
                      className="p-1.5 text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Total summary */}
            <div className="p-3 rounded-xl bg-[#541515]/5 dark:bg-rose-950/20 border border-[#541515]/20 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-slate-300">
                Total Net à Payer (Ariary) :
              </span>
              <span className="text-lg font-black text-[#541515] dark:text-rose-400 font-mono">
                {formatAriary(totalCalculated)}
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                Créer la Facture
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Quick Payment Logging */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Enregistrer le Règlement</DialogTitle>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4">
              <div className="p-3 bg-stone-50 dark:bg-slate-800/60 rounded-xl space-y-1">
                <p className="text-xs text-stone-500">Facture : <span className="font-bold text-stone-900 dark:text-slate-100">{selectedInvoice.id}</span></p>
                <p className="text-xs text-stone-500">Client : <span className="font-bold text-stone-900 dark:text-slate-100">{selectedInvoice.clientName}</span></p>
                <p className="text-sm font-black text-emerald-600 font-mono">Montant : {formatAriary(selectedInvoice.totalTTC)}</p>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Mode de Paiement Réceptionné
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="mvola">Mvola (033 51 848 75)</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="especes">Espèces (Caisse locale)</option>
                  <option value="virement">Virement Bancaire (Dépôt direct)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                  Annuler
                </Button>
                <Button
                  variant="krukov"
                  onClick={() => handleMarkPaid(selectedInvoice, paymentMethod)}
                >
                  Confirmer et Enregistrer en Caisse
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal: Print / PDF Document Preview */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Aperçu Facture Conforme</DialogTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.print()}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer
            </Button>
          </DialogHeader>

          {selectedInvoice && (
            <div className="p-6 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 border border-stone-200 dark:border-slate-800 rounded-xl space-y-6 font-sans">
              {/* Header */}
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-xl font-black text-[#541515] tracking-tight">{settings.companyName.toUpperCase()}</h1>
                  <p className="text-xs text-stone-600 dark:text-slate-400 font-medium">{settings.professionTitle}</p>
                  <p className="text-xs text-stone-500">{settings.address}</p>
                  <p className="text-xs text-stone-500 font-mono">Tél : {settings.phone} / {settings.phoneSecondary || '038 85 430 13'}</p>
                  <p className="text-xs text-stone-500">Email : {settings.email}</p>
                  <p className="text-[11px] text-stone-400 mt-1 font-mono">
                    NIF: {settings.nif} • STAT: {settings.stat}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black font-mono block text-stone-900 dark:text-slate-100">
                    FACTURE {selectedInvoice.id}
                  </span>
                  <span className="text-xs text-stone-500 block">Date : {formatDate(selectedInvoice.issueDate)}</span>
                  <span className="text-xs text-stone-500 block">Échéance : {formatDate(selectedInvoice.dueDate)}</span>
                </div>
              </div>

              {/* Client Info */}
              <div className="p-3 bg-stone-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Facturé à :</span>
                <span className="font-bold text-sm text-stone-900 dark:text-slate-100 block">{selectedInvoice.clientName}</span>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-stone-400 font-bold uppercase text-[10px]">
                    <th className="py-2 text-left">Désignation</th>
                    <th className="py-2 text-right">Prix Unitaire HT</th>
                    <th className="py-2 text-center">Quantité</th>
                    <th className="py-2 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                  {selectedInvoice.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium">{it.description}</td>
                      <td className="py-2.5 text-right font-mono">{formatAriary(it.unitPriceHT)}</td>
                      <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatAriary(it.unitPriceHT * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end pt-2 border-t">
                <div className="w-64 space-y-1.5 text-right text-xs">
                  <div className="flex justify-between text-stone-500">
                    <span>Total HT :</span>
                    <span className="font-mono">{formatAriary(selectedInvoice.totalHT)}</span>
                  </div>
                  <div className="flex justify-between text-stone-500">
                    <span>TVA (0% - Non assujetti) :</span>
                    <span className="font-mono">0 Ar</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-[#541515] dark:text-rose-400 pt-1 border-t">
                    <span>NET À PAYER :</span>
                    <span className="font-mono">{formatAriary(selectedInvoice.totalTTC)}</span>
                  </div>
                </div>
              </div>

              {/* Notes & Legal mention */}
              <div className="pt-4 border-t text-[10px] text-stone-500 space-y-1">
                <p><strong>Conditions de règlement :</strong> {selectedInvoice.notes || 'Paiement à réception par Mvola ou virement.'}</p>
                <p className="italic">
                  * Conformément au Code Général des Impôts malagasy : TVA non applicable, prestataire sous régime micro-entreprise.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
