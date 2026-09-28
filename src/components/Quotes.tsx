import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Quote, Client, CompanySettings, Invoice } from '@/types';
import { quoteSchema, QuoteFormData } from '@/schemas';
import { formatAriary, formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  FileSpreadsheet, 
  CheckCircle, 
  Printer, 
  Trash2, 
  ArrowRight,
  Send,
  Calendar,
  Layers
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface QuotesProps {
  quotes: Quote[];
  clients: Client[];
  settings: CompanySettings;
  onAddQuote: (q: Quote) => void;
  onUpdateQuote: (q: Quote) => void;
  onConvertToInvoice?: (q: Quote) => void;
}

export default function Quotes({
  quotes,
  clients,
  settings,
  onAddQuote,
  onUpdateQuote,
  onConvertToInvoice,
}: QuotesProps) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'sent' | 'accepted' | 'rejected'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: 'q-1',
          description: "Fourniture & Pose kit solaire autoconsommation complet 3.0kWp",
          unitPriceHT: 4800000,
          quantity: 1,
          vatRate: 0,
        },
      ],
      status: 'sent',
      notes: "Matériel garanti 5 ans, main d'œuvre technique incluse.",
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

  const openNewQuoteModal = () => {
    reset({
      clientId: clients[0]?.id || '',
      clientName: clients[0]?.name || '',
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      items: [
        {
          id: Math.random().toString(36).substring(2, 9),
          description: '',
          unitPriceHT: 0,
          quantity: 1,
          vatRate: 0,
        },
      ],
      status: 'sent',
      notes: 'Proposition valable 30 jours. Acompte de 50% à la commande.',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: QuoteFormData) => {
    const totalHT = data.items.reduce((s, it) => s + it.unitPriceHT * it.quantity, 0);
    const totalTTC = totalHT;

    const newQuote: Quote = {
      id: `D${new Date().getFullYear()}-${String(quotes.length + 1).padStart(3, '0')}`,
      clientId: data.clientId,
      clientName: data.clientName,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      totalHT,
      totalTTC,
      totalVAT: 0,
      status: data.status,
      items: data.items.map((it, idx) => ({
        id: it.id || `q-${idx + 1}`,
        description: it.description,
        unitPriceHT: it.unitPriceHT,
        quantity: it.quantity,
        vatRate: it.vatRate || 0,
      })),
      notes: data.notes,
    };

    onAddQuote(newQuote);
    setIsModalOpen(false);
  };

  const filteredQuotes = quotes.filter((q) => {
    const matchesSearch =
      q.id.toLowerCase().includes(search.toLowerCase()) ||
      q.clientName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || q.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalQuotesAmount = quotes.reduce((sum, q) => sum + q.totalTTC, 0);
  const totalAcceptedAmount = quotes
    .filter((q) => q.status === 'accepted')
    .reduce((sum, q) => sum + q.totalTTC, 0);

  return (
    <div className="space-y-6 text-left">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">Total Proposé</p>
              <p className="text-xl font-black text-stone-900 dark:text-slate-100">{formatAriary(totalQuotesAmount)}</p>
              <p className="text-[11px] text-stone-400">{quotes.length} devis émis</p>
            </div>
            <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-xl text-stone-700 dark:text-slate-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">Devis Acceptés</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatAriary(totalAcceptedAmount)}</p>
              <p className="text-[11px] text-stone-400">{quotes.filter((q) => q.status === 'accepted').length} acceptés</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">En Négociation</p>
              <p className="text-xl font-black text-amber-600 dark:text-amber-400">
                {quotes.filter((q) => q.status === 'sent').length} dossiers
              </p>
              <p className="text-[11px] text-stone-400">En attente accord client</p>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl text-amber-600">
              <Send className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Devis Estimatifs & Proformas</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Élaboration de chiffrages solaires, réseaux et contrats de prestation
            </p>
          </div>
          <Button variant="krukov" onClick={openNewQuoteModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Nouveau Devis
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher devis..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-[#541515]"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
              {(['all', 'draft', 'sent', 'accepted', 'rejected'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    statusFilter === st
                      ? 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st === 'all' ? 'Tous' : st === 'draft' ? 'Brouillon' : st === 'sent' ? 'Envoyé' : st === 'accepted' ? 'Accepté' : 'Refusé'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-slate-800/80 text-stone-500 font-bold border-b border-stone-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Numéro</th>
                  <th className="p-3">Client</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Validité</th>
                  <th className="p-3 text-right">Montant TTC</th>
                  <th className="p-3 text-center">Statut</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60">
                {filteredQuotes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      Aucun devis trouvé
                    </td>
                  </tr>
                ) : (
                  filteredQuotes.map((q) => (
                    <tr key={q.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-mono font-bold text-stone-900 dark:text-slate-100">{q.id}</td>
                      <td className="p-3 font-semibold text-stone-900 dark:text-slate-100">{q.clientName}</td>
                      <td className="p-3 text-stone-500">{formatDate(q.issueDate)}</td>
                      <td className="p-3 text-stone-500">{formatDate(q.validUntil)}</td>
                      <td className="p-3 text-right font-black text-stone-900 dark:text-slate-100 font-mono">
                        {formatAriary(q.totalTTC)}
                      </td>
                      <td className="p-3 text-center">
                        <Badge
                          variant={
                            q.status === 'accepted'
                              ? 'success'
                              : q.status === 'sent'
                              ? 'warning'
                              : q.status === 'draft'
                              ? 'secondary'
                              : 'destructive'
                          }
                        >
                          {q.status === 'accepted' ? 'Accepté' : q.status === 'sent' ? 'Envoyé' : q.status === 'draft' ? 'Brouillon' : 'Refusé'}
                        </Badge>
                      </td>
                      <td className="p-3 text-right space-x-1.5">
                        {q.status === 'sent' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onUpdateQuote({ ...q, status: 'accepted' })}
                            className="text-xs h-7 text-emerald-600 hover:text-emerald-700"
                            title="Marquer accepté"
                          >
                            <CheckCircle className="w-3.5 h-3.5 mr-1" /> Valider
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setSelectedQuote(q);
                            setIsPrintModalOpen(true);
                          }}
                          className="h-7 w-7 p-0"
                          title="Imprimer"
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

      {/* Modal: New Quote Form with React Hook Form + Zod */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Établir un Nouveau Devis</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Client Cible
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
                  Valable Jusqu'au
                </label>
                <input
                  type="date"
                  {...register('validUntil')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Statut
                </label>
                <select
                  {...register('status')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="sent">Envoyé au client</option>
                  <option value="draft">Brouillon interne</option>
                  <option value="accepted">Accepté directement</option>
                </select>
              </div>
            </div>

            {/* Line Items */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase text-stone-500">Postes de Chiffrage</span>
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
                      placeholder="Désignation de la fourniture ou prestation..."
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

            <div className="p-3 rounded-xl bg-[#541515]/5 dark:bg-rose-950/20 border border-[#541515]/20 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-700 dark:text-slate-300">
                Estimation Totale (Ariary) :
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
                Enregistrer le Devis
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Print Preview */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Devis Proforma Officiel</DialogTitle>
            <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
              <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer
            </Button>
          </DialogHeader>

          {selectedQuote && (
            <div className="p-6 bg-white dark:bg-slate-900 text-stone-900 dark:text-slate-100 border border-stone-200 dark:border-slate-800 rounded-xl space-y-6 font-sans">
              <div className="flex justify-between items-start border-b pb-4">
                <div>
                  <h1 className="text-xl font-black text-[#541515] tracking-tight">{settings.companyName.toUpperCase()}</h1>
                  <p className="text-xs text-stone-600 dark:text-slate-400 font-medium">{settings.professionTitle}</p>
                  <p className="text-xs text-stone-500">{settings.address}</p>
                  <p className="text-xs text-stone-500 font-mono">Tél : {settings.phone} / {settings.phoneSecondary || '038 85 430 13'}</p>
                  <p className="text-xs text-stone-500">Email : {settings.email}</p>
                </div>

                <div className="text-right">
                  <span className="text-xl font-black font-mono block text-stone-900 dark:text-slate-100">
                    DEVIS {selectedQuote.id}
                  </span>
                  <span className="text-xs text-stone-500 block">Émis le : {formatDate(selectedQuote.issueDate)}</span>
                  <span className="text-xs text-stone-500 block">Valable jusqu'au : {formatDate(selectedQuote.validUntil)}</span>
                </div>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-slate-800/40 rounded-lg">
                <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">Devis destiné à :</span>
                <span className="font-bold text-sm text-stone-900 dark:text-slate-100 block">{selectedQuote.clientName}</span>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b text-stone-400 font-bold uppercase text-[10px]">
                    <th className="py-2 text-left">Désignation</th>
                    <th className="py-2 text-right">Prix Unitaire</th>
                    <th className="py-2 text-center">Quantité</th>
                    <th className="py-2 text-right">Montant Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-slate-800">
                  {selectedQuote.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 font-medium">{it.description}</td>
                      <td className="py-2.5 text-right font-mono">{formatAriary(it.unitPriceHT)}</td>
                      <td className="py-2.5 text-center font-mono">{it.quantity}</td>
                      <td className="py-2.5 text-right font-mono font-bold">{formatAriary(it.unitPriceHT * it.quantity)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-2 border-t">
                <div className="w-64 space-y-1.5 text-right text-xs">
                  <div className="flex justify-between text-base font-black text-[#541515] dark:text-rose-400 pt-1 border-t">
                    <span>MONTANT ESTIMÉ :</span>
                    <span className="font-mono">{formatAriary(selectedQuote.totalTTC)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t text-[10px] text-stone-500 space-y-1">
                <p><strong>Note :</strong> {selectedQuote.notes || 'Matériel garanti, assistance technique sur site comprise.'}</p>
                <p className="italic">
                  * Proposition sous réserve de faisabilité technique finale après visite sur toiture / site.
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
