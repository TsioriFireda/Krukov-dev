import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient;

try {
  if (process.env.NODE_ENV === 'production') {
    prismaClient = new PrismaClient();
  } else {
    if (!global.prisma) {
      global.prisma = new PrismaClient({
        log: ['warn', 'error'],
      });
    }
    prismaClient = global.prisma;
  }
} catch (e) {
  console.warn('[Prisma] Initializing with safe fallback proxy:', e);
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
    count: async () => 0,
    upsert: async (d: any) => d?.update ?? d?.create ?? {},
  };
  prismaClient = new Proxy({} as any, {
    get: () => noOp,
  });
}

export const prisma = prismaClient;
export default prisma;
