import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Transaction } from '@/types';
import { transactionSchema, TransactionFormData } from '@/schemas';
import { formatAriary, formatDate } from '@/lib/utils';
import { 
  Plus, 
  Search, 
  Landmark, 
  ArrowDownRight, 
  ArrowUpRight, 
  Trash2, 
  Wallet,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface TransactionsProps {
  transactions: Transaction[];
  onAddTransaction: (t: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
}

export default function Transactions({
  transactions,
  onAddTransaction,
  onDeleteTransaction,
}: TransactionsProps) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'recette' | 'depense'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      date: new Date().toISOString().split('T')[0],
      type: 'recette',
      category: 'service',
      description: '',
      amountHT: 0,
      paymentMethod: 'mvola',
      receiptRef: '',
    },
  });

  const openModal = () => {
    reset({
      date: new Date().toISOString().split('T')[0],
      type: 'recette',
      category: 'service',
      description: '',
      amountHT: 0,
      paymentMethod: 'mvola',
      receiptRef: `TX-REF-${Date.now().toString().slice(-4)}`,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: TransactionFormData) => {
    const newTx: Transaction = {
      id: `TX-${Date.now().toString().slice(-6)}`,
      date: data.date,
      type: data.type,
      category: data.category,
      description: data.description,
      amountHT: data.amountHT,
      amountTTC: data.amountHT,
      vatAmount: 0,
      paymentMethod: data.paymentMethod,
      receiptRef: data.receiptRef,
    };
    onAddTransaction(newTx);
    setIsModalOpen(false);
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesSearch =
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      (t.receiptRef && t.receiptRef.toLowerCase().includes(search.toLowerCase()));
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalRecettes = transactions
    .filter((t) => t.type === 'recette')
    .reduce((s, t) => s + t.amountTTC, 0);
  const totalDepenses = transactions
    .filter((t) => t.type === 'depense')
    .reduce((s, t) => s + t.amountTTC, 0);
  const soldeNet = totalRecettes - totalDepenses;

  return (
    <div className="space-y-6 text-left">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">Total Recettes</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{formatAriary(totalRecettes)}</p>
              <p className="text-[11px] text-stone-400">Encaissements clients & prestations</p>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">Total Dépenses</p>
              <p className="text-xl font-black text-red-600 dark:text-red-400">{formatAriary(totalDepenses)}</p>
              <p className="text-[11px] text-stone-400">Achats matériels, carburant & salaires</p>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-600">
              <TrendingDown className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-stone-200 dark:border-slate-800">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-500 dark:text-slate-400">Solde Net Trésorerie</p>
              <p className={`text-xl font-black font-mono ${soldeNet >= 0 ? 'text-stone-900 dark:text-slate-100' : 'text-red-600'}`}>
                {formatAriary(soldeNet)}
              </p>
              <p className="text-[11px] text-stone-400">Trésorerie disponible</p>
            </div>
            <div className="p-3 bg-stone-100 dark:bg-slate-800 rounded-xl text-stone-700 dark:text-slate-300">
              <Wallet className="w-5 h-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Journal de Trésorerie & Caisse</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Enregistrement des flux financiers Mvola, Orange Money, Caisse espèces et Banque
            </p>
          </div>
          <Button variant="krukov" onClick={openModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Nouvelle Écriture
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
              <input
                type="text"
                placeholder="Rechercher écriture..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-[#541515]"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto">
              {(['all', 'recette', 'depense'] as const).map((tp) => (
                <button
                  key={tp}
                  onClick={() => setTypeFilter(tp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-colors cursor-pointer ${
                    typeFilter === tp
                      ? 'bg-stone-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {tp === 'all' ? 'Tous les flux' : tp === 'recette' ? 'Recettes (+)' : 'Dépenses (-)'}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-stone-100 dark:border-slate-800">
            <table className="w-full text-xs text-left">
              <thead className="bg-stone-50 dark:bg-slate-800/80 text-stone-500 font-bold border-b border-stone-100 dark:border-slate-800">
                <tr>
                  <th className="p-3">Date</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Description</th>
                  <th className="p-3">Mode</th>
                  <th className="p-3">Réf / Pièce</th>
                  <th className="p-3 text-right">Montant</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-slate-800/60">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-stone-400">
                      Aucune transaction enregistrée
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-stone-500 font-mono">{formatDate(tx.date)}</td>
                      <td className="p-3">
                        <Badge variant={tx.type === 'recette' ? 'success' : 'destructive'}>
                          {tx.type === 'recette' ? '+ Recette' : '- Dépense'}
                        </Badge>
                      </td>
                      <td className="p-3 font-medium text-stone-900 dark:text-slate-100">{tx.description}</td>
                      <td className="p-3 uppercase font-mono text-[10px] text-stone-500">{tx.paymentMethod}</td>
                      <td className="p-3 font-mono text-stone-400">{tx.receiptRef || '-'}</td>
                      <td className={`p-3 text-right font-black font-mono ${
                        tx.type === 'recette' ? 'text-emerald-600' : 'text-red-600'
                      }`}>
                        {tx.type === 'recette' ? '+' : '-'}{formatAriary(tx.amountTTC)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1 rounded-md text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal: New Transaction Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle Écriture de Caisse</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">Type de Flux</label>
                <select
                  {...register('type')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="recette">Recette (Entrée d'argent)</option>
                  <option value="depense">Dépense (Sortie de caisse)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">Catégorie</label>
                <select
                  {...register('category')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="service">Prestation Solaire / Réseau</option>
                  <option value="achat_materiel">Achat Matériel & Câblage</option>
                  <option value="salaire">Salaires & Primes</option>
                  <option value="carburant">Carburant & Déplacement</option>
                  <option value="loyer">Loyer Atelier & Charges</option>
                  <option value="divers">Frais Divers</option>
                </select>
              </div>
            </div>

            <Input
              label="Description de l'opération *"
              placeholder="ex: Achat 2 bobines câble Cat6 blindé ou Règlement solde client"
              {...register('description')}
              error={errors.description?.message}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                label="Montant (Ariary) *"
                placeholder="ex: 180000"
                {...register('amountHT', { valueAsNumber: true })}
                error={errors.amountHT?.message}
              />

              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">Canal de Règlement</label>
                <select
                  {...register('paymentMethod')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="mvola">Mvola</option>
                  <option value="orange_money">Orange Money</option>
                  <option value="airtel_money">Airtel Money</option>
                  <option value="especes">Caisse Espèces</option>
                  <option value="virement">Virement Bancaire</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                label="Date de l'opération"
                {...register('date')}
              />
              <Input
                label="Réf. Reçu / N° Transaction"
                placeholder="ex: MV-99824"
                {...register('receiptRef')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                Valider l'Écriture
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
