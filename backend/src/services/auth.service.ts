import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { generateToken } from "../utils/jwt";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            email,
            password_hash: hashedPassword
        }
    });

    const collaboratorRole = await prisma.role.findUnique({
        where: { role_name: "Collaborator" }
    });

    if (!collaboratorRole) {
        throw new Error("Collaborator role not found");
    }

    await prisma.userRole.create({
        data: {
            user_id: user.user_id,
            role_id: collaboratorRole.role_id
        }
    });

    return {
        user_id: user.user_id,
        username: user.username,
        email: user.email
    };
};

export const loginUser = async (
  email: string,
  password: string,
  allowedRoles: string[]
) => {

  const user = await prisma.user.findUnique({
    where: {
      email
    }
  });

  if (!user) {
    throw new Error("Invalid credentials");
  }

  const validPassword = await bcrypt.compare(
    password,
    user.password_hash
  );

  if (!validPassword) {
    throw new Error("Invalid credentials");
  }

  const userRole = await prisma.userRole.findFirst({
    where: {
      user_id: user.user_id
    },
    include: {
      role: true
    }
  });

  const roleName = userRole?.role.role_name || "Collaborator";

  if (!allowedRoles.includes(roleName)) {
    throw new Error("Unauthorized role for this login portal");
  }

  const token = generateToken(
    user.user_id.toString(),
    roleName
  );

  return {
    token,
    user: {
      user_id: user.user_id,
      username: user.username,
      email: user.email,
      role: roleName
    }
  };
};