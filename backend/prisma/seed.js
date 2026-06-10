const { PrismaClient } = require("../src/generated/prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding Roles...");
  await prisma.role.createMany({
    data: [
      { role_name: "Admin" },
      { role_name: "Project Manager" },
      { role_name: "Collaborator" }
    ],
    skipDuplicates: true
  });

  const roles = await prisma.role.findMany();
  const adminRole = roles.find(r => r.role_name === "Admin");
  const pmRole = roles.find(r => r.role_name === "Project Manager");
  const collabRole = roles.find(r => r.role_name === "Collaborator");

  console.log("Hashing password...");
  const password_hash = await bcrypt.hash("password123", 10);

  const sampleUsers = [
    // Admins
    { username: "admin1", email: "admin1@test.com", role_id: adminRole.role_id },
    { username: "admin2", email: "admin2@test.com", role_id: adminRole.role_id },
    { username: "admin3", email: "admin3@test.com", role_id: adminRole.role_id },
    // Project Managers
    { username: "pm1", email: "pm1@test.com", role_id: pmRole.role_id },
    { username: "pm2", email: "pm2@test.com", role_id: pmRole.role_id },
    { username: "pm3", email: "pm3@test.com", role_id: pmRole.role_id },
    // Collaborators
    { username: "collab1", email: "collab1@test.com", role_id: collabRole.role_id },
    { username: "collab2", email: "collab2@test.com", role_id: collabRole.role_id },
    { username: "collab3", email: "collab3@test.com", role_id: collabRole.role_id },
  ];

  console.log("Creating 9 Sample Users...");
  for (const u of sampleUsers) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      const createdUser = await prisma.user.create({
        data: {
          username: u.username,
          email: u.email,
          password_hash
        }
      });
      await prisma.userRole.create({
        data: {
          user_id: createdUser.user_id,
          role_id: u.role_id
        }
      });
    }
  }

  console.log("✅ Seeding successfully finished with all sample users!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });