import prisma from "../config/prisma";

export const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      user_id: true,
      username: true,
      email: true,
      is_active: true,
      created_at: true,
      user_roles: {
        include: {
          role: true
        }
      }
    },
    orderBy: { created_at: "desc" }
  });
};

export const getUserById = async (userId: number) => {
  const user = await prisma.user.findUnique({
    where: { user_id: userId },
    select: {
      user_id: true,
      username: true,
      email: true,
      is_active: true,
      created_at: true,
      user_roles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user) throw new Error("User not found");
  return user;
};

export const updateUserDetails = async (userId: number, data: { username?: string; email?: string }) => {
  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) throw new Error("User not found");

  if (data.email && data.email !== user.email) {
    const existingEmail = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingEmail) throw new Error("Email already in use");
  }

  return prisma.user.update({
    where: { user_id: userId },
    data: {
      username: data.username,
      email: data.email
    },
    select: {
      user_id: true,
      username: true,
      email: true,
      is_active: true
    }
  });
};

export const changeUserRole = async (userId: number, roleName: string) => {
  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) throw new Error("User not found");

  const role = await prisma.role.findUnique({ where: { role_name: roleName } });
  if (!role) throw new Error("Role not found");

  // Remove existing roles
  await prisma.userRole.deleteMany({
    where: { user_id: userId }
  });

  // Add new role
  await prisma.userRole.create({
    data: {
      user_id: userId,
      role_id: role.role_id
    }
  });

  return getUserById(userId);
};

export const changeUserStatus = async (userId: number, isActive: boolean) => {
  const user = await prisma.user.findUnique({ where: { user_id: userId } });
  if (!user) throw new Error("User not found");

  return prisma.user.update({
    where: { user_id: userId },
    data: { is_active: isActive },
    select: {
      user_id: true,
      username: true,
      email: true,
      is_active: true
    }
  });
};
