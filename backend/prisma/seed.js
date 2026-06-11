import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  const roles = ['Admin', 'Project Manager', 'Collaborator']

  for (const role_name of roles) {
    await prisma.role.upsert({
      where: { role_name },
      update: {},
      create: { role_name },
    })
  }

  console.log('Roles seeded successfully')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())