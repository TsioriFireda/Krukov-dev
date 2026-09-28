import { getClientPusher, PUSHER_CHANNEL_NAME, PUSHER_EVENTS } from '@/lib/pusher';
import { 
  UserAccount, 
  Invoice, 
  Quote, 
  Client, 
  Transaction, 
  TimePunch, 
  MissionOrder, 
  DailyFieldReport, 
  SiteIncidentReport, 
  WorkerSalaryPayment, 
  LegalDocument,
  CompanySettings 
} from '@/types';

type Listener = (event: { type: string; data: any; version?: number }) => void;

class RealtimeSyncService {
  private listeners: Listener[] = [];
  private eventSource: EventSource | null = null;
  private broadcastChannel: BroadcastChannel | null = null;
  private pusherChannel: any = null;

  constructor() {
    this.initPusher();
    this.initSSE();
    this.initBroadcastChannel();
  }

  // 1. Pusher JS Integration (Client-Side)
  private initPusher() {
    try {
      const pusher = getClientPusher();
      if (pusher) {
        this.pusherChannel = pusher.subscribe(PUSHER_CHANNEL_NAME);

        // Bind all real-time events
        Object.values(PUSHER_EVENTS).forEach((eventName) => {
          this.pusherChannel.bind(eventName, (data: any) => {
            console.log(`[Pusher Event] ${eventName}:`, data);
            this.notifyListeners({ type: eventName, data });
          });
        });

        this.pusherChannel.bind('pusher:subscription_succeeded', () => {
          console.log('[Pusher] Successfully connected to channel:', PUSHER_CHANNEL_NAME);
        });
      }
    } catch (e) {
      console.warn('[Pusher] Error subscribing:', e);
    }
  }

  // 2. Server-Sent Events Fallback
  private initSSE() {
    if (typeof window === 'undefined') return;
    try {
      this.eventSource = new EventSource('/api/realtime/stream');
      this.eventSource.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          this.notifyListeners(payload);
        } catch {
          // ignore heartbeat / ping
        }
      };
      this.eventSource.onerror = () => {
        // Will auto reconnect
      };
    } catch (err) {
      console.warn('[SSE] Not available:', err);
    }
  }

  // 3. Multi-Tab BroadcastChannel
  private initBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      this.broadcastChannel = new BroadcastChannel('krukov_realtime_sync');
      this.broadcastChannel.onmessage = (event) => {
        if (event.data) {
          this.notifyListeners(event.data);
        }
      };
    }
  }

  public subscribe(listener: Listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notifyListeners(event: { type: string; data: any; version?: number }) {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in sync listener:', err);
      }
    });
  }

  public broadcast(type: string, data: any) {
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage({ type, data, timestamp: Date.now() });
    }
    this.notifyListeners({ type, data });
  }

  // API Calls backed by Prisma Client & Pusher broadcasts
  async postUserAccount(user: UserAccount) {
    this.broadcast('user_updated', user);
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async deleteUserAccount(userId: string) {
    this.broadcast('user_deleted', { id: userId, userId });
    try {
      await fetch(`/api/users/${userId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async postTimePunch(punch: TimePunch) {
    this.broadcast('new_punch', punch);
    try {
      await fetch('/api/punches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(punch),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveInvoice(invoice: Invoice) {
    this.broadcast('new_invoice', invoice);
    try {
      await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoice),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveQuote(quote: Quote) {
    this.broadcast('new_quote', quote);
    try {
      await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(quote),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveClient(client: Client) {
    this.broadcast('client_updated', client);
    try {
      await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveTransaction(tx: Transaction) {
    this.broadcast('new_transaction', tx);
    try {
      await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tx),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async deleteTransaction(txId: string) {
    this.broadcast('transaction_deleted', { id: txId });
    try {
      await fetch(`/api/transactions/${txId}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveMission(mission: MissionOrder) {
    this.broadcast('mission_updated', mission);
    try {
      await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mission),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveDailyReport(report: DailyFieldReport) {
    this.broadcast('new_report', report);
    try {
      await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(report),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveIncident(incident: SiteIncidentReport) {
    this.broadcast('new_incident', incident);
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(incident),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async postSalaryPayment(payment: WorkerSalaryPayment) {
    this.broadcast('new_salary_payment', payment);
    try {
      await fetch('/api/salary-payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveLegalDocument(doc: LegalDocument) {
    this.broadcast('legal_document_saved', doc);
    try {
      await fetch('/api/legal-documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async deleteLegalDocument(id: string) {
    this.broadcast('legal_document_deleted', { id });
    try {
      await fetch(`/api/legal-documents/${id}`, { method: 'DELETE' });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }

  async saveCompanySettings(settings: CompanySettings) {
    this.broadcast('settings_updated', settings);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
    } catch (e) {
      console.warn('[Sync] Offline/API error:', e);
    }
  }
}

export const realtimeSync = new RealtimeSyncService();
export default realtimeSync;
