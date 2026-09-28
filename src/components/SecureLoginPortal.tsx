import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserAccount, AccessLog } from '@/types';
import { loginSchema, LoginFormData } from '@/schemas';
import { Lock, User, Eye, EyeOff, ShieldCheck, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import Logo from '@/components/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SecureLoginPortalProps {
  userAccounts: UserAccount[];
  onLoginSuccess: (user: UserAccount, sessionDurationMinutes?: number) => void;
  onOpenWorkerTerminal: () => void;
  onLogAccess: (
    user: UserAccount | { username: string; name: string; role: string; id?: string },
    action: AccessLog['action'],
    status: AccessLog['status'],
    details?: string
  ) => void;
}

export default function SecureLoginPortal({
  userAccounts,
  onLoginSuccess,
  onOpenWorkerTerminal,
  onLogAccess,
}: SecureLoginPortalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
      sessionDuration: 480,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoginError(null);
    const cleanUsername = data.username.trim().toLowerCase();
    const cleanPassword = data.password.trim();

    // Look for matching user by username or matricule
    const foundUser = userAccounts.find(
      (u) =>
        (u.username.toLowerCase() === cleanUsername ||
          u.matricule.toLowerCase() === cleanUsername ||
          (u.email && u.email.toLowerCase() === cleanUsername)) &&
        u.password === cleanPassword
    );

    if (!foundUser) {
      setLoginError('Identifiant ou mot de passe incorrect.');
      onLogAccess(
        { username: data.username, name: 'Inconnu', role: 'inconnu' },
        'login',
        'failure',
        'Échec de connexion : mot de passe erroné'
      );
      return;
    }

    if (!foundUser.active) {
      setLoginError('Ce compte a été désactivé par la Direction.');
      onLogAccess(foundUser, 'login', 'failure', 'Tentative de connexion sur compte inactif');
      return;
    }

    // Success
    onLogAccess(foundUser, 'login', 'success', 'Connexion réussie');
    onLoginSuccess(foundUser, data.sessionDuration);
  };

  // Quick fill helper for demonstration / test accounts
  const quickFill = (u: string, p: string) => {
    setValue('username', u, { shouldValidate: true });
    setValue('password', p, { shouldValidate: true });
  };

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-[#0b0f19] flex flex-col justify-center items-center p-4 sm:p-6 text-stone-900 dark:text-slate-100">
      <div className="w-full max-w-md space-y-4">
        {/* Header bar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#541515] dark:text-rose-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Système Sécurisé Krukov Tek
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* Login Card */}
        <Card className="border-stone-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-[#541515] via-rose-700 to-amber-600" />
          
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <Logo className="w-14 h-14 text-lg shadow-md" />
            </div>
            <CardTitle className="text-xl sm:text-2xl font-black">
              KRUKOV TEK ANTSIRABE
            </CardTitle>
            <CardDescription className="text-xs">
              Portail Entreprise • Authentification & Gestion Opérationnelle
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 pt-2">
            {loginError && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-stone-400" /> Identifiant / Matricule
                </label>
                <Input
                  {...register('username')}
                  placeholder="ex: markov ou KT-2026-001"
                  autoComplete="username"
                  error={errors.username?.message}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-stone-400" /> Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="flex h-10 w-full rounded-lg border border-stone-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 pr-10 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#541515] dark:focus-visible:ring-rose-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600 dark:hover:text-slate-300 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600">{errors.password.message}</p>
                )}
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="krukov"
                  className="w-full h-11 text-sm font-bold shadow-md"
                  disabled={isSubmitting}
                >
                  <Lock className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Connexion en cours...' : 'Se connecter au portail'}
                </Button>
              </div>
            </form>

            {/* Quick Login Helper Shortcuts */}
            <div className="pt-3 border-t border-stone-100 dark:border-slate-800">
              <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Comptes de Démonstration Rapide :
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => quickFill('markov', 'markov2573890//')}
                  className="p-2 rounded-lg bg-stone-50 dark:bg-slate-800/60 hover:bg-stone-100 dark:hover:bg-slate-800 text-left border border-stone-200/50 dark:border-slate-700/50 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-[#541515] dark:text-rose-400 block truncate">
                    Direction (Markov)
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block">admin</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill('secretaire', 'sec123//')}
                  className="p-2 rounded-lg bg-stone-50 dark:bg-slate-800/60 hover:bg-stone-100 dark:hover:bg-slate-800 text-left border border-stone-200/50 dark:border-slate-700/50 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-stone-900 dark:text-slate-100 block truncate">
                    Secrétariat
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block">secretariat</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill('chef_terrain', 'chef123//')}
                  className="p-2 rounded-lg bg-stone-50 dark:bg-slate-800/60 hover:bg-stone-100 dark:hover:bg-slate-800 text-left border border-stone-200/50 dark:border-slate-700/50 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-stone-900 dark:text-slate-100 block truncate">
                    Chef d'Équipe
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block">chef_equipe</span>
                </button>

                <button
                  type="button"
                  onClick={() => quickFill('technicien1', 'tech123//')}
                  className="p-2 rounded-lg bg-stone-50 dark:bg-slate-800/60 hover:bg-stone-100 dark:hover:bg-slate-800 text-left border border-stone-200/50 dark:border-slate-700/50 cursor-pointer transition-colors"
                >
                  <span className="font-bold text-stone-900 dark:text-slate-100 block truncate">
                    Équipe Terrain
                  </span>
                  <span className="text-[10px] text-stone-500 font-mono block">technicien</span>
                </button>
              </div>
            </div>

            {/* Standalone Worker Terminal Entry Button */}
            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onOpenWorkerTerminal}
                className="w-full text-xs font-bold flex items-center justify-center gap-2 border-stone-300 dark:border-slate-700"
              >
                <Smartphone className="w-4 h-4 text-[#541515] dark:text-rose-400" />
                <span>Accéder à la Borne de Pointage Express</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Legal notice */}
        <p className="text-center text-[10px] text-stone-400 dark:text-slate-500">
          KRUKOV TEK • NIF : 63122 12 2024 0 01200 • STAT : 401 861 22 96 • Antsirabe, Madagascar
        </p>
      </div>
    </div>
  );
}
