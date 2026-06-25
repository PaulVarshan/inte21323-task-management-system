import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'gtm5545@gmail.com' },
    include: { user_roles: { include: { role: true } } }
  });
  console.dir(user, { depth: null });
}
main().finally(() => prisma.$disconnect());
