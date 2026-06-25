import { PrismaClient } from './src/generated/prisma/client';
const prisma = new PrismaClient();
prisma.task.findMany({ include: { assignees: true } }).then(t => console.dir(t, {depth: null}));
