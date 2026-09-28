import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Client } from '@/types';
import { clientSchema, ClientFormData } from '@/schemas';
import { Plus, Search, Users, Phone, Mail, MapPin, Building, Edit2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ClientsProps {
  clients: Client[];
  onAddClient: (c: Client) => void;
  onUpdateClient: (c: Client) => void;
}

export default function Clients({ clients, onAddClient, onUpdateClient }: ClientsProps) {
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      nif: '',
      stat: '',
      notes: '',
    },
  });

  const openCreateModal = () => {
    setEditingClient(null);
    reset({
      name: '',
      email: '',
      phone: '',
      address: 'Antsirabe, Madagascar',
      nif: '',
      stat: '',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (c: Client) => {
    setEditingClient(c);
    reset({
      name: c.name,
      email: c.email || '',
      phone: c.phone || '',
      address: c.address || '',
      nif: c.nif || '',
      stat: c.stat || '',
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      onUpdateClient({
        ...editingClient,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        nif: data.nif || undefined,
        stat: data.stat || undefined,
        notes: data.notes || undefined,
      });
    } else {
      const newClient: Client = {
        id: `C-${String(clients.length + 1).padStart(3, '0')}`,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        nif: data.nif || undefined,
        stat: data.stat || undefined,
        notes: data.notes || undefined,
      };
      onAddClient(newClient);
    }
    setIsModalOpen(false);
  };

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.phone && c.phone.includes(search)) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 text-left">
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <CardTitle>Répertoire & CRM Clients</CardTitle>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Particuliers, entreprises industrielles, ONG et partenaires de Krukov Tek
            </p>
          </div>
          <Button variant="krukov" onClick={openCreateModal} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-1.5" /> Nouveau Client
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400" />
            <input
              type="text"
              placeholder="Rechercher par nom, téléphone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-[#541515]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:shadow-md transition-shadow relative group"
              >
                <button
                  onClick={() => openEditModal(c)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>

                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-[#541515]/10 dark:bg-rose-950/40 text-[#541515] dark:text-rose-400 flex items-center justify-center font-bold text-sm">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-slate-100">{c.name}</h4>
                    <span className="text-[10px] font-mono text-stone-400">Réf: {c.id}</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-stone-600 dark:text-slate-400">
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="font-mono">{c.phone}</span>
                    </div>
                  )}
                  {c.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{c.email}</span>
                    </div>
                  )}
                  {c.address && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{c.address}</span>
                    </div>
                  )}
                  {(c.nif || c.stat) && (
                    <div className="pt-2 border-t border-stone-100 dark:border-slate-800 text-[10px] font-mono text-stone-400">
                      {c.nif && `NIF: ${c.nif} `}
                      {c.stat && `STAT: ${c.stat}`}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal: Client Form */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Modifier le Client' : 'Nouveau Client'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
            <Input
              label="Nom complet ou Raison Sociale *"
              placeholder="ex: Société Madacom ou Mina Randriana"
              {...register('name')}
              error={errors.name?.message}
            />

            <Input
              label="Téléphone"
              placeholder="ex: 034 56 789 01"
              {...register('phone')}
              error={errors.phone?.message}
            />

            <Input
              label="Adresse e-mail"
              placeholder="ex: contact@client.mg"
              {...register('email')}
              error={errors.email?.message}
            />

            <Input
              label="Adresse physique / Chantier"
              placeholder="ex: Zone Industrielle Vatofotsy Antsirabe"
              {...register('address')}
              error={errors.address?.message}
            />

            <div className="grid grid-cols-2 gap-2">
              <Input
                label="NIF (facultatif)"
                placeholder="ex: 3001234567"
                {...register('nif')}
              />
              <Input
                label="STAT (facultatif)"
                placeholder="ex: 12345 11 2024"
                {...register('stat')}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" variant="krukov">
                {editingClient ? 'Enregistrer Modifications' : 'Ajouter le Client'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
