import { PrismaClient } from './src/generated/prisma/client';
const prisma = new PrismaClient();
prisma.notification.findMany({ orderBy: { created_at: "desc" }, take: 10 }).then(t => console.dir(t, {depth: null}));
