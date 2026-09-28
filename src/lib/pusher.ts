import Pusher from 'pusher-js';

// Server-side Pusher initialization (used in Node / Express)
let serverPusher: any = null;

export function getServerPusher() {
  if (typeof window !== 'undefined') {
    return null; // Not on server
  }
  if (!serverPusher) {
    try {
      // Dynamic import or require for server environment
      const PusherServer = (Pusher as any).default || Pusher;
      const appId = process.env.PUSHER_APP_ID || '1789421';
      const key = process.env.PUSHER_KEY || '9a4b2c1e8f7d6a5c3b1e';
      const secret = process.env.PUSHER_SECRET || '5d4c3b2a1f0e9d8c7b6a';
      const cluster = process.env.PUSHER_CLUSTER || 'eu';

      // We dynamically load the 'pusher' node package on the server
      const PusherNode = (globalThis as any)._pusherNodeInstance;
      if (PusherNode) {
        serverPusher = PusherNode;
      }
    } catch (e) {
      console.warn('[Pusher Server] Notice:', e);
    }
  }
  return serverPusher;
}

// Client-side Pusher Client initialization
let clientPusherInstance: Pusher | null = null;

export const PUSHER_CHANNEL_NAME = 'krukov-tek-realtime';

export const PUSHER_EVENTS = {
  USER_UPDATED: 'user_updated',
  USER_DELETED: 'user_deleted',
  NEW_PUNCH: 'new_punch',
  NEW_MESSAGE: 'new_message',
  NEW_SALARY_PAYMENT: 'new_salary_payment',
  NEW_INVOICE: 'new_invoice',
  NEW_QUOTE: 'new_quote',
  NEW_REPORT: 'new_report',
  NEW_INCIDENT: 'new_incident',
  NEW_TRANSACTION: 'new_transaction',
  FULL_SYNC: 'full_sync_updated',
} as const;

export function getClientPusher(): Pusher | null {
  if (typeof window === 'undefined') return null;

  if (!clientPusherInstance) {
    const key = 
      (import.meta as any).env?.VITE_PUSHER_KEY || 
      (import.meta as any).env?.NEXT_PUBLIC_PUSHER_KEY || 
      '9a4b2c1e8f7d6a5c3b1e';
    const cluster = 
      (import.meta as any).env?.VITE_PUSHER_CLUSTER || 
      (import.meta as any).env?.NEXT_PUBLIC_PUSHER_CLUSTER || 
      'eu';

    try {
      clientPusherInstance = new Pusher(key, {
        cluster: cluster,
        forceTLS: true,
      });
      console.log('[Pusher Client] Initialized with cluster:', cluster);
    } catch (err) {
      console.warn('[Pusher Client] Fallback mode active:', err);
    }
  }
  return clientPusherInstance;
}
