import { PrismaClient } from "../src/generated/prisma/client";
import process from "process";

const prisma = new PrismaClient();

async function main() {
    const roles = ["Admin", "Project Manager", "Collaborator"];
    for (const role_name of roles) {
        await prisma.role.upsert({
            where: { role_name },
            update: {},
            create: { role_name },
        });
    }

    console.log("Roles seeded successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });