import React, { useState } from 'react';
import { MessageSquare, Send, CheckCheck, User, Sparkles } from 'lucide-react';
import { UserAccount } from '@/types';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface WhatsAppSyncHubProps {
  currentUser: UserAccount;
}

export default function WhatsAppSyncHub({ currentUser }: WhatsAppSyncHubProps) {
  const [messages, setMessages] = useState([
    {
      id: 'msg-1',
      sender: 'TSINJO Anderson (Markov)',
      role: 'admin',
      text: 'Bienvenue sur la plateforme KRUKOV TEK ANTSIRABE. Synchronisation temps réel Pusher JS active.',
      time: '08:30',
      isMe: false,
    },
    {
      id: 'msg-2',
      sender: 'Marie Ravelo (Secrétariat)',
      role: 'secretariat',
      text: 'Facture F2026-001 soldée par Mvola auprès du client Société Madacom.',
      time: '09:15',
      isMe: false,
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `msg-${Date.now()}`,
      sender: currentUser.name,
      role: currentUser.role,
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');
  };

  return (
    <div className="space-y-6 text-left">
      <Card className="border-stone-200 dark:border-slate-800 shadow-xs h-[650px] flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-base">Canal de Coordination Terrain & WhatsApp Hub</CardTitle>
              <p className="text-xs text-stone-500">Messagerie instantanée interne synchronisée avec les équipes</p>
            </div>
          </div>
        </CardHeader>

        {/* Message Thread */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${m.isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-md rounded-2xl px-4 py-2.5 text-xs shadow-xs space-y-1 ${
                  m.isMe
                    ? 'bg-[#541515] text-white rounded-br-xs'
                    : 'bg-stone-100 dark:bg-slate-800 text-stone-900 dark:text-slate-100 rounded-bl-xs'
                }`}
              >
                {!m.isMe && (
                  <span className="font-bold text-[10px] text-stone-500 dark:text-slate-400 block">
                    {m.sender}
                  </span>
                )}
                <p className="leading-relaxed">{m.text}</p>
                <div className="flex items-center justify-end gap-1 text-[10px] opacity-70">
                  <span>{m.time}</span>
                  {m.isMe && <CheckCheck className="w-3 h-3 text-emerald-400" />}
                </div>
              </div>
            </div>
          ))}
        </CardContent>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2">
          <input
            type="text"
            placeholder="Transmettre une consigne ou mise à jour chantier..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            className="flex-1 h-10 px-3.5 text-xs rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#541515]"
          />
          <Button type="submit" variant="krukov" className="h-10 px-4">
            <Send className="w-4 h-4 mr-1.5" /> Envoyer
          </Button>
        </form>
      </Card>
    </div>
  );
}
