import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CompanySettings, AutoArchiveResult } from '@/types';
import { companySettingsSchema, CompanySettingsFormData } from '@/schemas';
import { 
  Building, 
  Save, 
  Archive, 
  Bot, 
  Sparkles, 
  Send, 
  Database, 
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SettingsProps {
  settings: CompanySettings;
  onSaveSettings: (newSettings: CompanySettings) => void;
  onRunAutoArchive: (years: number) => Promise<AutoArchiveResult>;
}

export default function Settings({ settings, onSaveSettings, onRunAutoArchive }: SettingsProps) {
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [archiveResult, setArchiveResult] = useState<AutoArchiveResult | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Gemini AI Advisor State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanySettingsFormData>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: {
      ownerName: settings.ownerName || 'RATSIMBANANTENAINA TSINJO ANDERSON',
      companyName: settings.companyName || 'Krukov tek',
      nif: settings.nif || '63122 12 2024 0 01200',
      stat: settings.stat || '401 861 22 96',
      rcs: settings.rcs || 'RCS ANTSIRABE N° 2024-A-00142',
      cif: settings.cif || 'Centre Fiscal DGI Antsirabe I',
      address: settings.address || 'LOT 0704 B410 Bis ANTSEVA AMBOHIMANARIVO ANTSIRABE I',
      phone: settings.phone || '033-51-848-75',
      phoneSecondary: settings.phoneSecondary || '038 85 430 13',
      email: settings.email || 'krukovtek@gmail.com',
      legalStatus: settings.legalStatus || 'micro-entreprise',
      activityType: settings.activityType || 'service',
      professionTitle: settings.professionTitle || 'Prestataire de service, FREELANCE',
      autoArchiveEnabled: settings.autoArchiveEnabled ?? true,
      archiveRetentionYears: settings.archiveRetentionYears || 2,
    },
  });

  const onSubmit = (data: CompanySettingsFormData) => {
    onSaveSettings({
      ...settings,
      ...data,
      vatRegime: settings.vatRegime || 'non-assujetti',
      taxSystem: settings.taxSystem || 'standard',
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleArchiveClick = async () => {
    setIsArchiving(true);
    try {
      const result = await onRunAutoArchive(settings.archiveRetentionYears || 2);
      setArchiveResult(result);
    } finally {
      setIsArchiving(false);
    }
  };

  const handleAskGemini = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;

    setIsAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/gemini/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          businessContext: {
            company: settings.companyName,
            activity: settings.professionTitle,
            location: 'Antsirabe, Madagascar',
          },
        }),
      });
      const data = await res.json();
      if (data.text) {
        setAiResponse(data.text);
      } else {
        setAiResponse(data.error || 'Erreur lors de la consultation.');
      }
    } catch {
      setAiResponse("L'assistant IA est temporairement indisponible.");
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader>
          <CardTitle>Identité Légale & Paramètres de l'Entreprise</CardTitle>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
            Mentions officielles apparaissant sur les factures, devis, ordres de mission et attestations
          </p>
        </CardHeader>

        <CardContent>
          {saveSuccess && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 text-emerald-700 dark:text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Paramètres enregistrés et synchronisés avec succès !</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Nom Commercial / Enseigne *"
                {...register('companyName')}
                error={errors.companyName?.message}
              />
              <Input
                label="Gérant / Titulaire Officiel *"
                {...register('ownerName')}
                error={errors.ownerName?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Numéro NIF *"
                {...register('nif')}
                error={errors.nif?.message}
              />
              <Input
                label="Numéro STAT *"
                {...register('stat')}
                error={errors.stat?.message}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="RCS (Registre du Commerce)"
                {...register('rcs')}
              />
              <Input
                label="Centre Fiscal / CIF"
                {...register('cif')}
              />
            </div>

            <Input
              label="Adresse Légale Complète *"
              {...register('address')}
              error={errors.address?.message}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Téléphone Principal *"
                {...register('phone')}
                error={errors.phone?.message}
              />
              <Input
                label="Téléphone Secondaire"
                {...register('phoneSecondary')}
              />
              <Input
                label="Adresse E-mail Officielle *"
                {...register('email')}
                error={errors.email?.message}
              />
            </div>

            <Input
              label="Titre / Activité Déclarée"
              {...register('professionTitle')}
            />

            <div className="flex justify-end pt-2">
              <Button type="submit" variant="krukov" className="font-bold">
                <Save className="w-4 h-4 mr-1.5" /> Enregistrer les Paramètres
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Regulatory Auto-Archive Box */}
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Archive className="w-4 h-4 text-[#541515] dark:text-rose-400" />
            <span>Archivage Réglementaire (+2 ans)</span>
          </CardTitle>
          <p className="text-xs text-stone-500">
            Conforme aux normes d'archivage des pièces comptables et devis échus
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-stone-600 dark:text-slate-400 leading-relaxed">
            Permet de basculer en archive sécurisée toutes les factures et devis de plus de 2 ans pour optimiser les performances de synchronisation en temps réel.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={handleArchiveClick}
            disabled={isArchiving}
            className="text-xs font-bold"
          >
            <Archive className="w-3.5 h-3.5 mr-1.5" />
            {isArchiving ? 'Archivage en cours...' : 'Exécuter l\'Archivage Réglementaire'}
          </Button>

          {archiveResult && (
            <div className="p-3 bg-stone-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-bold text-stone-900 dark:text-slate-100">Résultat de l'opération :</p>
              <p className="text-stone-500">
                {archiveResult.archivedInvoices} factures et {archiveResult.archivedQuotes} devis archivés à {archiveResult.executionTimestamp}.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Gemini AI Business Advisor Card */}
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Conseiller Technique & Fiscal IA (Gemini)</span>
          </CardTitle>
          <p className="text-xs text-stone-500">
            Assistance intelligente pour la rédaction d'avenants, calculs de rentabilité solaire ou relances
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <form onSubmit={handleAskGemini} className="flex gap-2">
            <input
              type="text"
              placeholder="ex: Rédige un modèle de relance cordiale pour facture impayée..."
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1 h-10 px-3.5 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-[#541515]"
            />
            <Button type="submit" variant="krukov" disabled={isAiLoading} className="h-10 text-xs">
              <Send className="w-3.5 h-3.5 mr-1" />
              {isAiLoading ? 'Analyse...' : 'Consulter'}
            </Button>
          </form>

          {aiResponse && (
            <div className="p-4 bg-stone-50 dark:bg-slate-800/60 rounded-xl border border-stone-200/60 dark:border-slate-800 text-xs leading-relaxed whitespace-pre-wrap">
              {aiResponse}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
