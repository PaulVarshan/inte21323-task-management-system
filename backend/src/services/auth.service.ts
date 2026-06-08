import bcrypt from "bcryptjs";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

export const registerUser = async (
    username: string,
    email: string,
    password: string
) => {

    // Check email already exists
    const existingUser = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (existingUser) {
        throw new Error("Email already exists");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
        data: {
            username,
            email,
            password_hash: hashedPassword
        }
    });

    // Find Collaborator role
    const collaboratorRole = await prisma.role.findUnique({
        where: {
            role_name: "Collaborator"
        }
    });

    if (!collaboratorRole) {
        throw new Error("Collaborator role not found");
    }

    // Assign Collaborator role
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

