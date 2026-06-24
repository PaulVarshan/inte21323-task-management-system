import { PrismaClient } from './generated/prisma/client';
const prisma = new PrismaClient();

async function checkUser() {
    const user = await prisma.user.findUnique({
        where: { email: 'collab1@test.com' },
        include: {
            user_roles: {
                include: { role: true }
            }
        }
    });
    console.log(JSON.stringify(user, null, 2));
}

checkUser()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
