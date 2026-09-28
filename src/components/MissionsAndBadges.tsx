import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MissionOrder, UserAccount, CompanySettings } from '@/types';
import { missionOrderSchema, MissionOrderFormData } from '@/schemas';
import { formatDate, formatAriary } from '@/lib/utils';
import { 
  Plus, 
  Briefcase, 
  Search, 
  QrCode, 
  Printer, 
  Calendar, 
  MapPin, 
  Users, 
  Truck,
  CheckCircle,
  FileCheck
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface MissionsAndBadgesProps {
  missionOrders: MissionOrder[];
  userAccounts: UserAccount[];
  settings: CompanySettings;
  onAddMissionOrder: (order: MissionOrder) => void;
  onUpdateMissionStatus: (orderId: string, status: 'en_cours' | 'cloture' | 'annule') => void;
  currentUser: UserAccount;
}

export default function MissionsAndBadges({
  missionOrders,
  userAccounts,
  settings,
  onAddMissionOrder,
  onUpdateMissionStatus,
  currentUser,
}: MissionsAndBadgesProps) {
  const [activeSubTab, setActiveSubTab] = useState<'missions' | 'badges'>('missions');
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<MissionOrder | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedBadgeUser, setSelectedBadgeUser] = useState<UserAccount | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<MissionOrderFormData>({
    resolver: zodResolver(missionOrderSchema),
    defaultValues: {
      reference: `ODM-${new Date().getFullYear()}-${String(missionOrders.length + 1).padStart(3, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      destination: 'Antsirabe',
      clientName: '',
      clientContact: '',
      clientAddress: '',
      objectOfMission: '',
      leadTechnicianId: userAccounts[0]?.id || '',
      leadTechnicianName: userAccounts[0]?.name || '',
      assignedWorkerIds: [],
      assignedWorkerNames: [],
      transportMode: 'Véhicule de service Krukov Tek',
      vehiclePlate: '4521 TAB',
      allocatedExpenses: 50000,
      equipmentList: 'Valise outillage, échelles, testeur réseau, perceuse',
      specialInstructions: 'Port des chaussures de sécurité et gilets EPI obligatoire.',
      signedBy: 'RATSIMBANANTENAINA TSINJO ANDERSON — Direction Générale',
      status: 'en_cours',
    },
  });

  const openCreateModal = () => {
    reset({
      reference: `ODM-${new Date().getFullYear()}-${String(missionOrders.length + 1).padStart(3, '0')}`,
      issueDate: new Date().toISOString().split('T')[0],
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      destination: 'Antsirabe',
      clientName: '',
      clientContact: '',
      clientAddress: '',
      objectOfMission: '',
      leadTechnicianId: userAccounts[0]?.id || '',
      leadTechnicianName: userAccounts[0]?.name || '',
      assignedWorkerIds: [],
      assignedWorkerNames: [],
      transportMode: 'Véhicule de service Krukov Tek',
      vehiclePlate: '4521 TAB',
      allocatedExpenses: 50000,
      equipmentList: 'Valise outillage, échelles, testeur réseau, perceuse',
      specialInstructions: 'Port des chaussures de sécurité et gilets EPI obligatoire.',
      signedBy: 'RATSIMBANANTENAINA TSINJO ANDERSON — Direction Générale',
      status: 'en_cours',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: MissionOrderFormData) => {
    const newOrder: MissionOrder = {
      id: data.reference,
      reference: data.reference,
      issueDate: data.issueDate,
      startDate: data.startDate,
      endDate: data.endDate,
      destination: data.destination,
      clientName: data.clientName,
      clientContact: data.clientContact,
      clientAddress: data.clientAddress,
      objectOfMission: data.objectOfMission,
      leadTechnicianId: data.leadTechnicianId,
      leadTechnicianName: data.leadTechnicianName,
      assignedWorkerIds: data.assignedWorkerIds,
      assignedWorkerNames: data.assignedWorkerNames,
      transportMode: data.transportMode,
      vehiclePlate: data.vehiclePlate,
      allocatedExpenses: data.allocatedExpenses,
      equipmentList: data.equipmentList,
      specialInstructions: data.specialInstructions,
      signedBy: data.signedBy,
      status: data.status,
    };
    onAddMissionOrder(newOrder);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Subtab selection */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveSubTab('missions')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'missions'
              ? 'bg-[#541515] text-white'
              : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Ordres de Mission Officiels</span>
        </button>
        <button
          onClick={() => setActiveSubTab('badges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'badges'
              ? 'bg-[#541515] text-white'
              : 'text-stone-600 dark:text-slate-400 hover:bg-stone-100 dark:hover:bg-slate-800'
          }`}
        >
          <QrCode className="w-4 h-4" />
          <span>Badges Professionnels avec QR Code</span>
        </button>
      </div>

      {activeSubTab === 'missions' ? (
        <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle>Ordres de Mission Chantier</CardTitle>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
                Autorisations officielles de déplacement et habilitations d'intervention sur site client
              </p>
            </div>
            <Button variant="krukov" onClick={openCreateModal} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-1.5" /> Émettre Ordre de Mission
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missionOrders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono font-bold text-xs text-[#541515] dark:text-rose-400 block">
                        {order.reference}
                      </span>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100 mt-0.5">
                        Client : {order.clientName}
                      </h4>
                    </div>
                    <Badge variant={order.status === 'en_cours' ? 'warning' : 'success'}>
                      {order.status === 'en_cours' ? 'En mission' : 'Clôturé'}
                    </Badge>
                  </div>

                  <div className="space-y-1 text-xs text-stone-600 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{order.destination}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Du {formatDate(order.startDate)} au {formatDate(order.endDate)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>Chef : <strong>{order.leadTechnicianName}</strong></span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 dark:text-slate-300 bg-stone-50 dark:bg-slate-800/60 p-2.5 rounded-lg line-clamp-2">
                    {order.objectOfMission}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-slate-800 text-xs">
                    <span className="font-mono text-stone-500 font-semibold">
                      Frais : {formatAriary(order.allocatedExpenses || 0)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {order.status === 'en_cours' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateMissionStatus(order.id, 'cloture')}
                          className="h-7 text-xs text-emerald-600"
                        >
                          <CheckCircle className="w-3.5 h-3.5 mr-1" /> Clôturer
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedOrder(order);
                          setIsPrintModalOpen(true);
                        }}
                        className="h-7 text-xs"
                      >
                        <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Badges Tab */
        <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
          <CardHeader>
            <CardTitle>Badges Professionnels avec Scellé QR Code</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Badges officiels d'identification des techniciens avec contacts d'urgence et groupe sanguin
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {userAccounts.filter((u) => u.active).map((user) => (
                <div
                  key={user.id}
                  className="rounded-2xl border border-stone-200 dark:border-slate-800 bg-gradient-to-b from-white to-stone-50 dark:from-slate-900 dark:to-slate-950 p-4 shadow-md space-y-3 relative overflow-hidden"
                >
                  <div className="h-1.5 bg-[#541515] absolute top-0 left-0 right-0" />
                  
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-black text-[10px] tracking-tight text-[#541515] uppercase">
                      KRUKOV TEK ANTSIRABE
                    </span>
                    <span className="font-mono text-[10px] text-stone-400 font-bold">
                      {user.matricule}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="w-12 h-12 rounded-xl bg-[#541515] text-white font-black text-lg flex items-center justify-center shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100">{user.name}</h4>
                      <p className="text-xs text-stone-500 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-stone-100 dark:bg-slate-800/80 text-[11px] space-y-1 text-stone-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-stone-400">Groupe Sanguin :</span>
                      <strong className="text-red-600">{user.bloodGroup || 'O+'}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-400">Contact Urgence :</span>
                      <span>{user.emergencyContactPhone || user.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div className="p-1.5 bg-white rounded-lg border border-stone-200 shadow-xs">
                      {/* Stylized QR representation */}
                      <QrCode className="w-10 h-10 text-stone-900" />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedBadgeUser(user);
                        window.print();
                      }}
                      className="text-xs h-8"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" /> Imprimer Badge
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal: New Mission Order Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Émettre un Ordre de Mission Officiel</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Référence Ordre de Mission *"
                {...register('reference')}
                error={errors.reference?.message}
              />
              <Input
                label="Nom du Client / Site *"
                placeholder="ex: Société Madacom"
                {...register('clientName')}
                error={errors.clientName?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="date"
                label="Date de Début *"
                {...register('startDate')}
              />
              <Input
                type="date"
                label="Date de Fin Estimée *"
                {...register('endDate')}
              />
            </div>

            <Input
              label="Lieu / Destination exacte *"
              placeholder="ex: Zone Industrielle Vatofotsy, Antsirabe"
              {...register('destination')}
              error={errors.destination?.message}
            />

            <Input
              label="Objet Détaillé de la Mission *"
              placeholder="ex: Tirage câbles Cat6 blindés, pose panneaux solaires 3kWp..."
              {...register('objectOfMission')}
              error={errors.objectOfMission?.message}
            />

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Chef de Mission *
                </label>
                <select
                  {...register('leadTechnicianId')}
                  onChange={(e) => {
                    setValue('leadTechnicianId', e.target.value);
                    const u = userAccounts.find((acc) => acc.id === e.target.value);
                    if (u) setValue('leadTechnicianName', u.name);
                  }}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  {userAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.matricule})
                    </option>
                  ))}
                </select>
              </div>

              <Input
                type="number"
                label="Frais de Mission Alloués (Ar)"
                {...register('allocatedExpenses', { valueAsNumber: true })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                Signer & Émettre
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
