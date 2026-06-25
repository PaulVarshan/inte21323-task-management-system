import 'dotenv/config';
import { PrismaClient } from './src/generated/prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = 'gtm5545@gmail.com';
  const roleName = 'Project Manager';

  // Find or create role
  let role = await prisma.role.findUnique({ where: { role_name: roleName } });
  if (!role) {
    role = await prisma.role.create({ data: { role_name: roleName } });
    console.log(`Created role: ${roleName}`);
  }

  // Check if user exists
  let user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('password123', salt);
    
    user = await prisma.user.create({
      data: {
        email,
        username: 'GTM Project Manager',
        password_hash,
        is_active: true,
      }
    });
    console.log(`Created new user: ${email} with password: password123`);
  } else {
    console.log(`User ${email} already exists.`);
  }

  // Check if user already has the role
  const existingUserRole = await prisma.userRole.findFirst({
    where: { user_id: user.user_id, role_id: role.role_id }
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        user_id: user.user_id,
        role_id: role.role_id
      }
    });
    console.log(`Assigned role '${roleName}' to ${email}`);
  } else {
    console.log(`User ${email} already has role '${roleName}'`);
  }
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
