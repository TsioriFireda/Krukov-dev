import React, { useState } from 'react';
import { LegalDocument, CompanySettings, UserAccount } from '@/types';
import { formatDate, formatAriary } from '@/lib/utils';
import { 
  Scale, 
  Plus, 
  Printer, 
  FileCheck, 
  Trash2, 
  GraduationCap, 
  Briefcase, 
  Award,
  Receipt
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface LegalDocumentsProps {
  legalDocuments: LegalDocument[];
  settings: CompanySettings;
  onAddDocument: (doc: LegalDocument) => void;
  onUpdateDocument: (doc: LegalDocument) => void;
  onDeleteDocument: (id: string) => void;
  currentUser: UserAccount;
}

export default function LegalDocuments({
  legalDocuments,
  settings,
  onAddDocument,
  onDeleteDocument,
}: LegalDocumentsProps) {
  const [selectedDoc, setSelectedDoc] = useState<LegalDocument | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [docType, setDocType] = useState<LegalDocument['type']>('recu_formation');
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('Antsirabe');
  const [feePaid, setFeePaid] = useState<number>(250000);
  const [trainingTitle, setTrainingTitle] = useState('Formation Pratique Énergie Solaire & Onduleurs Hybrides');

  const handleCreateDoc = (e: React.FormEvent) => {
    e.preventDefault();
    const dateStr = new Date().toISOString().split('T')[0];
    const newDoc: LegalDocument = {
      id: `DOC-${Date.now().toString().slice(-6)}`,
      type: docType,
      title: docType === 'recu_formation' 
        ? 'Reçu de Règlement Formation Professionnelle'
        : docType === 'attestation_stage'
        ? 'Attestation de Stage Académique et Professionnel'
        : 'Contrat de Travail Droit Malagasy',
      createdAt: new Date().toISOString(),
      issueDate: dateStr,
      issuePlace: 'Antsirabe',
      recipientName: recipientName.trim(),
      recipientAddress,
      recipientPhone,
      trainingTitle,
      trainingFeePaid: feePaid,
      status: 'valide',
      signatoryName: settings.ownerName,
      signatoryTitle: 'Responsable Technique & Formateur',
    };
    onAddDocument(newDoc);
    setIsModalOpen(false);
    setRecipientName('');
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Documents Juridiques, Conventions & Attestations</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Conformes au Code du Travail de la République de Madagascar (Loi n° 2003-044)
            </p>
          </div>
          <Button variant="krukov" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Émettre un Document
          </Button>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {legalDocuments.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-stone-100 dark:bg-slate-800 text-[#541515] dark:text-rose-400">
                    {doc.type === 'recu_formation' ? (
                      <Receipt className="w-5 h-5" />
                    ) : doc.type.includes('stage') ? (
                      <GraduationCap className="w-5 h-5" />
                    ) : (
                      <Briefcase className="w-5 h-5" />
                    )}
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {doc.id}
                  </Badge>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100 line-clamp-1">
                    {doc.title}
                  </h4>
                  <p className="text-xs text-stone-500">
                    Bénéficiaire : <strong className="text-stone-700 dark:text-slate-300">{doc.recipientName}</strong>
                  </p>
                </div>

                <div className="text-[11px] text-stone-500 space-y-0.5">
                  <p>Émis à {doc.issuePlace || 'Antsirabe'} le {formatDate(doc.issueDate)}</p>
                  {doc.trainingFeePaid && (
                    <p className="font-mono font-bold text-emerald-600">
                      Montant reçu : {formatAriary(doc.trainingFeePaid)}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDoc(doc);
                      setIsPreviewOpen(true);
                    }}
                    className="h-7 text-xs"
                  >
                    <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer Acte
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDeleteDocument(doc.id)}
                    className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal: New Legal Document Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Émettre un Document Juridique Officiel</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateDoc} className="space-y-3.5">
            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Type de Document
              </label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as any)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              >
                <option value="recu_formation">Reçu de Règlement Formation Solaire</option>
                <option value="attestation_stage">Attestation de Stage Académique</option>
                <option value="contrat_stage_terrain">Convention de Stage Terrain Non Rémunéré</option>
                <option value="contrat_apprentissage">Contrat d'Apprentissage Professionnel</option>
                <option value="contrat_travail">Contrat de Travail CDD (Code du Travail Malagasy)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Nom complet du Bénéficiaire *
              </label>
              <input
                required
                type="text"
                placeholder="ex: Haja Razafimahatratra"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Téléphone
                </label>
                <input
                  type="text"
                  placeholder="034 55 678 90"
                  value={recipientPhone}
                  onChange={(e) => setRecipientPhone(e.target.value)}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Montant Reçu (Ar)
                </label>
                <input
                  type="number"
                  value={feePaid}
                  onChange={(e) => setFeePaid(Number(e.target.value))}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                Thème / Intitulé de la formation ou du poste
              </label>
              <input
                type="text"
                value={trainingTitle}
                onChange={(e) => setTrainingTitle(e.target.value)}
                className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                Générer & Signer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Document Preview / Print */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Acte Juridique Officiel</DialogTitle>
            <Button size="sm" variant="outline" onClick={() => window.print()} className="text-xs">
              <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer
            </Button>
          </DialogHeader>

          {selectedDoc && (
            <div className="p-6 bg-white text-stone-900 border rounded-xl space-y-5 font-serif text-xs leading-relaxed">
              <div className="text-center space-y-1 pb-4 border-b">
                <span className="font-sans font-black text-sm tracking-tight text-[#541515] uppercase">
                  {settings.companyName.toUpperCase()}
                </span>
                <p className="font-sans text-[10px] text-stone-500">
                  {settings.address} • NIF : {settings.nif} • STAT : {settings.stat}
                </p>
                <h2 className="text-base font-bold uppercase tracking-wide pt-2">
                  {selectedDoc.title}
                </h2>
              </div>

              <div className="space-y-3">
                <p>
                  Je soussigné, <strong>{settings.ownerName}</strong>, agissant en qualité de {selectedDoc.signatoryTitle || 'Responsable Technique Krukov Tek'},
                </p>
                <p>
                  Certifie et atteste par la présente que :
                </p>
                <div className="p-3 bg-stone-50 rounded-lg space-y-1 font-sans">
                  <p><strong>Nom et Prénom :</strong> {selectedDoc.recipientName}</p>
                  {selectedDoc.recipientPhone && <p><strong>Téléphone :</strong> {selectedDoc.recipientPhone}</p>}
                  {selectedDoc.trainingTitle && <p><strong>Intitulé / Session :</strong> {selectedDoc.trainingTitle}</p>}
                  {selectedDoc.trainingFeePaid && <p><strong>Règlement perçu :</strong> {formatAriary(selectedDoc.trainingFeePaid)}</p>}
                </div>
                <p>
                  En foi de quoi, la présente attestation est délivrée pour servir et valoir ce que de droit.
                </p>
              </div>

              <div className="pt-8 flex justify-between items-end font-sans">
                <div>
                  <span className="text-[10px] text-stone-400 font-mono">Réf: {selectedDoc.id}</span>
                </div>
                <div className="text-center space-y-6">
                  <p>Fait à {selectedDoc.issuePlace || 'Antsirabe'}, le {formatDate(selectedDoc.issueDate)}</p>
                  <p className="font-bold">{settings.ownerName}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
