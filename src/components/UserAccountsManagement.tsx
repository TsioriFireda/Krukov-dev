import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserAccount, UserRole } from '@/types';
import { userAccountSchema, UserAccountFormData } from '@/schemas';
import { formatAriary } from '@/lib/utils';
import { 
  UserPlus, 
  Search, 
  UserCog, 
  ShieldCheck, 
  Key, 
  Phone, 
  Mail, 
  Edit3, 
  UserX, 
  UserCheck, 
  Trash2,
  DollarSign
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface UserAccountsManagementProps {
  userAccounts: UserAccount[];
  onAddAccount: (u: UserAccount) => void;
  onUpdateAccount: (u: UserAccount) => void;
  onToggleActive: (id: string) => void;
  onDeleteAccount: (id: string) => void;
  currentUser: UserAccount;
}

export default function UserAccountsManagement({
  userAccounts,
  onAddAccount,
  onUpdateAccount,
  onToggleActive,
  onDeleteAccount,
  currentUser,
}: UserAccountsManagementProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserAccountFormData>({
    resolver: zodResolver(userAccountSchema),
    defaultValues: {
      username: '',
      password: '',
      name: '',
      role: 'equipe_terrain',
      phone: '',
      email: '',
      matricule: `KT-${new Date().getFullYear()}-${String(userAccounts.length + 1).padStart(3, '0')}`,
      cin: '',
      qualification: '',
      bloodGroup: 'O+',
      emergencyContactName: '',
      emergencyContactPhone: '',
      dailyRate: 35000,
      hourlyRate: 5000,
      rateType: 'journalier',
      monthlyBaseSalary: 350000,
      active: true,
    },
  });

  const openCreateModal = () => {
    setEditingUser(null);
    reset({
      username: '',
      password: 'kt' + Math.floor(1000 + Math.random() * 9000),
      name: '',
      role: 'equipe_terrain',
      phone: '034 ',
      email: '',
      matricule: `KT-${new Date().getFullYear()}-${String(userAccounts.length + 1).padStart(3, '0')}`,
      cin: '',
      qualification: 'Technicien Photovoltaïque & Réseau',
      bloodGroup: 'O+',
      emergencyContactName: '',
      emergencyContactPhone: '',
      dailyRate: 35000,
      hourlyRate: 5000,
      rateType: 'journalier',
      monthlyBaseSalary: 350000,
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (u: UserAccount) => {
    setEditingUser(u);
    reset({
      username: u.username,
      password: u.password || '',
      name: u.name,
      role: u.role,
      phone: u.phone || '',
      email: u.email || '',
      matricule: u.matricule,
      cin: u.cin || '',
      qualification: u.qualification || '',
      bloodGroup: u.bloodGroup || 'O+',
      emergencyContactName: u.emergencyContactName || '',
      emergencyContactPhone: u.emergencyContactPhone || '',
      healthNotes: u.healthNotes || '',
      hourlyRate: u.hourlyRate || 0,
      dailyRate: u.dailyRate || 0,
      rateType: u.rateType || 'journalier',
      monthlyBaseSalary: u.monthlyBaseSalary || 0,
      active: u.active,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: UserAccountFormData) => {
    if (editingUser) {
      onUpdateAccount({
        ...editingUser,
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role,
        phone: data.phone,
        email: data.email || undefined,
        matricule: data.matricule,
        cin: data.cin || undefined,
        qualification: data.qualification || undefined,
        bloodGroup: data.bloodGroup || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        healthNotes: data.healthNotes || undefined,
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        rateType: data.rateType,
        monthlyBaseSalary: data.monthlyBaseSalary,
        active: data.active,
      });
    } else {
      const newUser: UserAccount = {
        id: `USR-${Date.now().toString().slice(-6)}`,
        name: data.name,
        username: data.username,
        password: data.password,
        role: data.role,
        phone: data.phone,
        email: data.email || undefined,
        matricule: data.matricule,
        cin: data.cin || undefined,
        qualification: data.qualification || undefined,
        bloodGroup: data.bloodGroup || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        healthNotes: data.healthNotes || undefined,
        hourlyRate: data.hourlyRate,
        dailyRate: data.dailyRate,
        rateType: data.rateType,
        monthlyBaseSalary: data.monthlyBaseSalary,
        active: data.active,
        createdDate: new Date().toISOString().split('T')[0],
      };
      onAddAccount(newUser);
    }
    setIsModalOpen(false);
  };

  const filteredUsers = userAccounts.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.matricule.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'admin': return 'Administrateur';
      case 'secretariat': return 'Secrétariat';
      case 'chef_equipe': return "Chef d'Équipe";
      case 'equipe_terrain': return 'Équipe Terrain';
      case 'employe': return 'Employé Atelier';
      case 'stagiaire': return 'Stagiaire';
      default: return role;
    }
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Gestion des Utilisateurs & Habilitations</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Contrôle d'accès strict, barèmes de rémunération et fiches médicales d'urgence
            </p>
          </div>
          <Button variant="krukov" onClick={openCreateModal} className="w-full sm:w-auto">
            <UserPlus className="w-4 h-4 mr-1.5" /> Nouveau Compte Collaborateur
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Rechercher utilisateur, matricule..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-[#541515]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className={`p-4 rounded-xl border transition-all relative ${
                  u.active
                    ? 'border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs'
                    : 'border-red-200 dark:border-red-950 bg-red-50/30 dark:bg-red-950/10 opacity-75'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-stone-100 dark:bg-slate-800 flex items-center justify-center font-black text-sm text-[#541515] dark:text-rose-400">
                      {u.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100">{u.name}</h4>
                      <span className="text-[11px] font-mono text-stone-500">@{u.username}</span>
                    </div>
                  </div>

                  <Badge variant={u.role === 'admin' ? 'krukov' : 'secondary'}>
                    {getRoleLabel(u.role)}
                  </Badge>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 dark:text-slate-400">
                  <div className="flex items-center justify-between font-mono text-[11px]">
                    <span className="text-stone-400">Matricule :</span>
                    <span className="font-bold text-stone-700 dark:text-slate-300">{u.matricule}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center justify-between">
                      <span className="text-stone-400">Téléphone :</span>
                      <span>{u.phone}</span>
                    </div>
                  )}
                  {u.qualification && (
                    <div className="text-[11px] text-stone-500 truncate pt-1">
                      {u.qualification}
                    </div>
                  )}
                  <div className="pt-2 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                    <span className="text-stone-400">Taux journalier :</span>
                    <span className="font-black font-mono text-emerald-600">
                      {formatAriary(u.dailyRate || 0)}
                    </span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-end gap-1.5 pt-3 mt-3 border-t border-stone-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onToggleActive(u.id)}
                    className="h-7 text-xs"
                    title={u.active ? 'Désactiver le compte' : 'Activer le compte'}
                  >
                    {u.active ? (
                      <span className="text-amber-600 flex items-center gap-1"><UserX className="w-3.5 h-3.5" /> Suspendre</span>
                    ) : (
                      <span className="text-emerald-600 flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" /> Réactiver</span>
                    )}
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditModal(u)}
                    className="h-7 w-7 p-0"
                    title="Modifier"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </Button>

                  {u.role !== 'admin' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeleteAccount(u.id)}
                      className="h-7 w-7 p-0 text-red-500 hover:text-red-700"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal: User Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>{editingUser ? "Modifier le Collaborateur" : "Nouveau Compte Collaborateur"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Nom complet *"
                placeholder="ex: Jean Rakotomalala"
                {...register('name')}
                error={errors.name?.message}
              />
              <Input
                label="Nom d'utilisateur / Login *"
                placeholder="ex: jean.terrain"
                {...register('username')}
                error={errors.username?.message}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                type="password"
                label="Mot de passe / Code PIN *"
                placeholder="••••••••"
                {...register('password')}
                error={errors.password?.message}
              />
              <div>
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block mb-1">
                  Rôle & Habilitation *
                </label>
                <select
                  {...register('role')}
                  className="w-full h-10 px-3 text-xs rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900"
                >
                  <option value="admin">Directeur / Administrateur</option>
                  <option value="secretariat">Secrétariat Administratif</option>
                  <option value="chef_equipe">Chef d'Équipe Chantier</option>
                  <option value="equipe_terrain">Équipe Terrain / Installateur</option>
                  <option value="employe">Employé Atelier</option>
                  <option value="stagiaire">Stagiaire</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Matricule Interne *"
                placeholder="ex: KT-2026-008"
                {...register('matricule')}
                error={errors.matricule?.message}
              />
              <Input
                label="Téléphone *"
                placeholder="ex: 034 11 222 33"
                {...register('phone')}
                error={errors.phone?.message}
              />
            </div>

            <Input
              label="Qualification / Titre professionnel"
              placeholder="ex: Monteur Câbleur Solaire & Réseaux"
              {...register('qualification')}
            />

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-slate-800">
              <Input
                type="number"
                label="Taux Journalier (Ar)"
                {...register('dailyRate', { valueAsNumber: true })}
              />
              <Input
                type="number"
                label="Salaire Base Mensuel (Ar)"
                {...register('monthlyBaseSalary', { valueAsNumber: true })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                {editingUser ? "Sauvegarder" : "Créer le Compte"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
