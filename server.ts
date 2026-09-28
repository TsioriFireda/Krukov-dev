import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import Pusher from 'pusher';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// 1. Prisma Client Initialization with In-Memory Safe Fallback
let prisma: PrismaClient;
try {
  prisma = new PrismaClient();
  console.log('[Prisma] Connected to PostgreSQL driver');
} catch (e) {
  console.warn('[Prisma] Safe fallback mode active:', e);
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  prisma = new Proxy({} as any, { get: () => noOp });
}

// 2. Pusher Server Initialization
let pusher: Pusher | null = null;
try {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID || '1789421',
    key: process.env.PUSHER_KEY || '9a4b2c1e8f7d6a5c3b1e',
    secret: process.env.PUSHER_SECRET || '5d4c3b2a1f0e9d8c7b6a',
    cluster: process.env.PUSHER_CLUSTER || 'eu',
    useTLS: true,
  });
  console.log('[Pusher Server] Initialized with cluster:', process.env.PUSHER_CLUSTER || 'eu');
} catch (err) {
  console.warn('[Pusher Server] Failed to initialize:', err);
}

// Local File Database backup
const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'krukov_db.json');

const DEFAULT_USERS = [
  {
    id: 'USR-ADMIN-01',
    username: 'markov',
    password: 'markov2573890//',
    name: 'TSINJO Anderson (Markov)',
    role: 'admin',
    phone: '033 51 848 75',
    email: 'tsinjomarkov0310@gmail.com',
    matricule: 'KT-2026-001',
    qualification: 'Ingénieur Électronique & Direction',
    bloodGroup: 'O+',
    emergencyContactPhone: '033 51 848 75',
    hourlyRate: 8000,
    dailyRate: 60000,
    rateType: 'journalier',
    monthlyBaseSalary: 1200000,
    active: true,
    createdDate: '2026-08-01',
  },
  {
    id: 'USR-SEC-01',
    username: 'secretaire',
    password: 'sec123//',
    name: 'Marie Ravelo (Secrétaire)',
    role: 'secretariat',
    phone: '038 85 430 13',
    email: 'secretariat.krukov@gmail.com',
    matricule: 'KT-2026-002',
    qualification: 'Administration & Facturation',
    bloodGroup: 'A+',
    emergencyContactPhone: '038 85 430 13',
    hourlyRate: 4000,
    dailyRate: 30000,
    rateType: 'mensuel',
    monthlyBaseSalary: 350000,
    active: true,
    createdDate: '2026-08-02',
  },
  {
    id: 'USR-CHEF-01',
    username: 'chef_terrain',
    password: 'chef123//',
    name: "RAKOTO Jean (Chef d'Équipe)",
    role: 'chef_equipe',
    phone: '034 11 222 33',
    matricule: 'KT-2026-003',
    qualification: 'Chef Électricien Solaire & Réseau',
    bloodGroup: 'B+',
    emergencyContactPhone: '034 11 222 34',
    hourlyRate: 6000,
    dailyRate: 45000,
    rateType: 'journalier',
    monthlyBaseSalary: 450000,
    active: true,
    createdDate: '2026-08-05',
  },
  {
    id: 'USR-TECH-01',
    username: 'technicien1',
    password: 'tech123//',
    name: 'RANDRIA Paul (Technicien)',
    role: 'equipe_terrain',
    phone: '032 44 555 66',
    matricule: 'KT-2026-004',
    qualification: 'Monteur Câbleur Solaire',
    bloodGroup: 'O+',
    emergencyContactPhone: '032 44 555 67',
    hourlyRate: 5000,
    dailyRate: 35000,
    rateType: 'journalier',
    monthlyBaseSalary: 350000,
    active: true,
    createdDate: '2026-08-10',
  },
];

interface ServerState {
  userAccounts: any[];
  chatMessages: any[];
  timePunches: any[];
  missionOrders: any[];
  dailyReports: any[];
  siteIncidents: any[];
  salaryPayments: any[];
  invoices: any[];
  quotes: any[];
  clients: any[];
  transactions: any[];
  legalDocuments: any[];
  companySettings: any;
  version: number;
}

function initDatabase(): ServerState {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (fs.existsSync(DB_FILE)) {
      const fileData = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(fileData);
      return {
        userAccounts: parsed.userAccounts || [...DEFAULT_USERS],
        chatMessages: parsed.chatMessages || [],
        timePunches: parsed.timePunches || [],
        missionOrders: parsed.missionOrders || [],
        dailyReports: parsed.dailyReports || [],
        siteIncidents: parsed.siteIncidents || [],
        salaryPayments: parsed.salaryPayments || [],
        invoices: parsed.invoices || [],
        quotes: parsed.quotes || [],
        clients: parsed.clients || [],
        transactions: parsed.transactions || [],
        legalDocuments: parsed.legalDocuments || [],
        companySettings: parsed.companySettings || null,
        version: parsed.version || 1,
      };
    }
  } catch (err) {
    console.warn('[DB File] Initializing new storage:', err);
  }

  const initial: ServerState = {
    userAccounts: [...DEFAULT_USERS],
    chatMessages: [],
    timePunches: [],
    missionOrders: [],
    dailyReports: [],
    siteIncidents: [],
    salaryPayments: [],
    invoices: [],
    quotes: [],
    clients: [],
    transactions: [],
    legalDocuments: [],
    companySettings: null,
    version: 1,
  };
  saveDatabase(initial);
  return initial;
}

function saveDatabase(dataToSave: ServerState) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DB_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tmp, DB_FILE);
  } catch (err) {
    console.error('Save error:', err);
  }
}

const state: ServerState = initDatabase();

// Helper to broadcast Pusher + SSE events
const sseClients: { id: string; res: express.Response }[] = [];

function broadcastRealtime(event: string, data: any) {
  state.version += 1;
  saveDatabase(state);

  // 1. Pusher JS Broadcast
  if (pusher) {
    try {
      pusher.trigger('krukov-tek-realtime', event, data);
    } catch (e) {
      console.warn('[Pusher Trigger Error]:', e);
    }
  }

  // 2. SSE Broadcast Fallback
  const payload = JSON.stringify({ type: event, data, version: state.version, timestamp: Date.now() });
  sseClients.forEach((client) => {
    try {
      client.res.write(`data: ${payload}\n\n`);
    } catch {}
  });
}

// --- SSE Endpoint ---
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');

  const clientId = `client-${Date.now()}`;
  sseClients.push({ id: clientId, res });

  res.write(`data: ${JSON.stringify({ type: 'init_sync', data: state, version: state.version })}\n\n`);

  const ping = setInterval(() => {
    try {
      res.write(': ping\n\n');
    } catch {
      clearInterval(ping);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(ping);
    const idx = sseClients.findIndex((c) => c.id === clientId);
    if (idx !== -1) sseClients.splice(idx, 1);
  });
});

// --- Sync state ---
app.get('/api/sync/all', (req, res) => {
  res.json({ success: true, state, version: state.version });
});

// --- Users Endpoints (Prisma-backed) ---
app.get('/api/users', async (req, res) => {
  try {
    const users = await prisma.userAccount.findMany().catch(() => state.userAccounts);
    res.json({ success: true, users: users.length ? users : state.userAccounts });
  } catch {
    res.json({ success: true, users: state.userAccounts });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const user = req.body;
    if (!user || !user.name || !user.username) {
      return res.status(400).json({ error: 'Données utilisateur invalides' });
    }

    try {
      await prisma.userAccount.upsert({
        where: { username: user.username },
        update: user,
        create: user,
      });
    } catch {}

    const idx = state.userAccounts.findIndex((u) => u.id === user.id || u.username === user.username);
    if (idx !== -1) state.userAccounts[idx] = { ...state.userAccounts[idx], ...user };
    else state.userAccounts.push(user);

    broadcastRealtime('user_updated', user);
    res.json({ success: true, user });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    try {
      await prisma.userAccount.delete({ where: { id } });
    } catch {}
    state.userAccounts = state.userAccounts.filter((u) => u.id !== id);
    broadcastRealtime('user_deleted', { id });
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Invoices Endpoints ---
app.get('/api/invoices', async (req, res) => {
  try {
    const invoices = await prisma.invoice.findMany({ include: { items: true } }).catch(() => state.invoices);
    res.json({ success: true, invoices });
  } catch {
    res.json({ success: true, invoices: state.invoices });
  }
});

app.post('/api/invoices', async (req, res) => {
  try {
    const invoice = req.body;
    const idx = state.invoices.findIndex((i) => i.id === invoice.id);
    if (idx !== -1) state.invoices[idx] = invoice;
    else state.invoices.unshift(invoice);

    broadcastRealtime('new_invoice', invoice);
    res.json({ success: true, invoice });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Quotes Endpoints ---
app.get('/api/quotes', async (req, res) => {
  try {
    const quotes = await prisma.quote.findMany({ include: { items: true } }).catch(() => state.quotes);
    res.json({ success: true, quotes });
  } catch {
    res.json({ success: true, quotes: state.quotes });
  }
});

app.post('/api/quotes', async (req, res) => {
  try {
    const quote = req.body;
    const idx = state.quotes.findIndex((q) => q.id === quote.id);
    if (idx !== -1) state.quotes[idx] = quote;
    else state.quotes.unshift(quote);

    broadcastRealtime('new_quote', quote);
    res.json({ success: true, quote });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Clients Endpoints ---
app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany().catch(() => state.clients);
    res.json({ success: true, clients });
  } catch {
    res.json({ success: true, clients: state.clients });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const client = req.body;
    const idx = state.clients.findIndex((c) => c.id === client.id);
    if (idx !== -1) state.clients[idx] = client;
    else state.clients.push(client);

    broadcastRealtime('client_updated', client);
    res.json({ success: true, client });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Transactions Endpoints ---
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await prisma.transaction.findMany().catch(() => state.transactions);
    res.json({ success: true, transactions });
  } catch {
    res.json({ success: true, transactions: state.transactions });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const tx = req.body;
    state.transactions.unshift(tx);
    broadcastRealtime('new_transaction', tx);
    res.json({ success: true, transaction: tx });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { id } = req.params;
    state.transactions = state.transactions.filter((t) => t.id !== id);
    broadcastRealtime('transaction_deleted', { id });
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Punches Endpoints ---
app.get('/api/punches', (req, res) => {
  res.json({ success: true, punches: state.timePunches });
});

app.post('/api/punches', (req, res) => {
  try {
    const punch = req.body;
    state.timePunches.unshift(punch);
    broadcastRealtime('new_punch', punch);
    res.json({ success: true, punch });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Missions Endpoints ---
app.post('/api/missions', (req, res) => {
  try {
    const mission = req.body;
    const idx = state.missionOrders.findIndex((m) => m.id === mission.id);
    if (idx !== -1) state.missionOrders[idx] = mission;
    else state.missionOrders.unshift(mission);
    broadcastRealtime('mission_updated', mission);
    res.json({ success: true, mission });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Reports & Incidents ---
app.post('/api/reports', (req, res) => {
  try {
    const report = req.body;
    state.dailyReports.unshift(report);
    broadcastRealtime('new_report', report);
    res.json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/incidents', (req, res) => {
  try {
    const incident = req.body;
    const idx = state.siteIncidents.findIndex((i) => i.id === incident.id);
    if (idx !== -1) state.siteIncidents[idx] = incident;
    else state.siteIncidents.unshift(incident);
    broadcastRealtime('new_incident', incident);
    res.json({ success: true, incident });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Salaries ---
app.post('/api/salary-payments', (req, res) => {
  try {
    const payment = req.body;
    state.salaryPayments.unshift(payment);
    broadcastRealtime('new_salary_payment', payment);
    res.json({ success: true, payment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Legal Documents ---
app.post('/api/legal-documents', (req, res) => {
  try {
    const doc = req.body;
    const idx = state.legalDocuments.findIndex((d) => d.id === doc.id);
    if (idx !== -1) state.legalDocuments[idx] = doc;
    else state.legalDocuments.unshift(doc);
    broadcastRealtime('legal_document_saved', doc);
    res.json({ success: true, document: doc });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/legal-documents/:id', (req, res) => {
  try {
    const { id } = req.params;
    state.legalDocuments = state.legalDocuments.filter((d) => d.id !== id);
    broadcastRealtime('legal_document_deleted', { id });
    res.json({ success: true, deletedId: id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Settings ---
app.post('/api/settings', (req, res) => {
  try {
    state.companySettings = req.body;
    broadcastRealtime('settings_updated', state.companySettings);
    res.json({ success: true, settings: state.companySettings });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- Gemini AI Endpoint ---
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: { 'User-Agent': 'aistudio-build' },
  },
});

app.post('/api/gemini/analyze', async (req, res) => {
  try {
    const { prompt, businessContext } = req.body;
    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        text: 'Conseil IA : Pour vos chantiers solaires à Antsirabe, assurez-vous de toujours dimensionner un coefficient de sécurité de 20% sur la capacité de stockage lithium et respectez la norme NF C 15-100 pour les protections DC/AC.',
      });
    }

    const systemInstruction = `
Tu es un conseiller expert pour les entrepreneurs et entreprises à Madagascar (KRUKOV TEK ANTSIRABE).
Tu conseilles sur la gestion des chantiers solaires, installations réseaux Cisco, la facturation sous statut micro-entreprise (art. CGI malagasy) et les contrats de travail (loi 2003-044).
Réponds en français avec clarté, professionnalisme et précision.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Contexte entreprise : ${JSON.stringify(businessContext)}\n\nDemande : ${prompt}` }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ text: response.text });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Erreur IA' });
  }
});

// Start Server with Vite Middleware
async function startServer() {
  const distPath = path.join(process.cwd(), 'dist');
  const hasBuiltAssets = fs.existsSync(path.join(distPath, 'index.html'));

  if (process.env.NODE_ENV !== 'production' && !hasBuiltAssets) {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: '0.0.0.0' },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[KRUKOV TEK] Server with React Router, Prisma & Pusher running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
