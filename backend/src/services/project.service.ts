import prisma from "../config/prisma";
import { createNotification } from "./notification.service";

// =======================
// PROJECT CRUD OPERATIONS
// =======================

export const createProject = async (data: any, userId: number) => {
  const project = await prisma.project.create({
    data: {
      project_name: data.project_name,
      description: data.description,
      start_date: new Date(data.start_date),
      end_date: data.end_date ? new Date(data.end_date) : null,
      status: data.status || "PLANNING",
      created_by: userId
    }
  });

  // Notify Admins
  const admins = await prisma.userRole.findMany({
    where: { role: { role_name: "Admin" } },
    select: { user_id: true }
  });

  for (const admin of admins) {
    if (admin.user_id !== userId) {
      await createNotification(
        admin.user_id,
        "New Project Created",
        `Project "${project.project_name}" has been created`,
        "PROJECT_CREATED"
      );
    }
  }

  return project;
};

export const getAllProjects = async (userId: number, role: string) => {
  // If Admin, return all projects. Else, return projects where user is creator or team member.
  if (role === "Admin") {
    return prisma.project.findMany({
      include: {
        creator: { select: { user_id: true, username: true, email: true } }
      }
    });
  }

  return prisma.project.findMany({
    where: {
      OR: [
        { created_by: userId },
        { team_members: { some: { user_id: userId } } }
      ]
    },
    include: {
      creator: { select: { user_id: true, username: true, email: true } }
    }
  });
};

export const getProjectById = async (projectId: number, userId: number, role: string) => {
  const project = await prisma.project.findUnique({
    where: { project_id: projectId },
    include: {
      creator: { select: { user_id: true, username: true, email: true } },
      team_members: {
        include: {
          user: { select: { user_id: true, username: true, email: true } }
        }
      }
    }
  });

  if (!project) {
    throw new Error("Project not found");
  }

  if (role !== "Admin" && project.created_by !== userId) {
    const isMember = project.team_members.some(member => member.user_id === userId);
    if (!isMember) {
      throw new Error("Unauthorized to view this project");
    }
  }

  return project;
};

export const updateProject = async (projectId: number, data: any, userId: number, role: string) => {
  const project = await prisma.project.findUnique({ where: { project_id: projectId } });
  
  if (!project) throw new Error("Project not found");
  if (role !== "Admin" && project.created_by !== userId) {
    throw new Error("Only the project creator or an Admin can update the project");
  }

  return prisma.project.update({
    where: { project_id: projectId },
    data: {
      project_name: data.project_name,
      description: data.description,
      start_date: data.start_date ? new Date(data.start_date) : undefined,
      end_date: data.end_date ? new Date(data.end_date) : undefined,
      status: data.status
    }
  });
};

export const deleteProject = async (projectId: number, userId: number, role: string) => {
  const project = await prisma.project.findUnique({ where: { project_id: projectId } });
  
  if (!project) throw new Error("Project not found");
  if (role !== "Admin" && project.created_by !== userId) {
    throw new Error("Only the project creator or an Admin can delete the project");
  }

  return prisma.project.delete({
    where: { project_id: projectId }
  });
};

// =======================
// TEAM MANAGEMENT
// =======================

export const addMemberToProject = async (projectId: number, targetUserId: number, projectRole: string, requesterId: number, requesterRole: string) => {
  const project = await prisma.project.findUnique({ where: { project_id: projectId } });
  
  if (!project) throw new Error("Project not found");
  if (requesterRole !== "Admin" && project.created_by !== requesterId) {
    throw new Error("Only the project creator or an Admin can add members");
  }

  const existingMember = await prisma.projectTeam.findUnique({
    where: {
      project_id_user_id: { project_id: projectId, user_id: targetUserId }
    }
  });

  if (existingMember) {
    throw new Error("User is already a member of this project");
  }

  const newMember = await prisma.projectTeam.create({
    data: {
      project_id: projectId,
      user_id: targetUserId,
      project_role: projectRole
    }
  });

  await createNotification(
    targetUserId,
    "Added to Project",
    `You have been added to project "${project.project_name}" as ${projectRole}`,
    "PROJECT_MEMBER_ADDED"
  );

  return newMember;
};

export const getProjectMembers = async (projectId: number, requesterId: number, requesterRole: string) => {
  // Wait, we can reuse getProjectById auth logic, but let's implement here
  const project = await prisma.project.findUnique({ 
    where: { project_id: projectId },
    include: { team_members: true }
  });
  
  if (!project) throw new Error("Project not found");

  if (requesterRole !== "Admin" && project.created_by !== requesterId) {
    const isMember = project.team_members.some(member => member.user_id === requesterId);
    if (!isMember) {
      throw new Error("Unauthorized to view members of this project");
    }
  }

  return prisma.projectTeam.findMany({
    where: { project_id: projectId },
    include: {
      user: { select: { user_id: true, username: true, email: true } }
    }
  });
};

export const getAllTeamMembers = async (requesterId: number, requesterRole: string) => {
  if (requesterRole === "Admin") {
    return prisma.projectTeam.findMany({
      include: {
        project: { select: { project_name: true } },
        user: { select: { user_id: true, username: true, email: true } }
      }
    });
  }

  return prisma.projectTeam.findMany({
    where: {
      OR: [
        { project: { created_by: requesterId } },
        { project: { team_members: { some: { user_id: requesterId } } } }
      ]
    },
    include: {
      project: { select: { project_name: true } },
      user: { select: { user_id: true, username: true, email: true } }
    }
  });
};

export const updateMemberRole = async (projectId: number, targetUserId: number, projectRole: string, requesterId: number, requesterRole: string) => {
  const project = await prisma.project.findUnique({ where: { project_id: projectId } });
  
  if (!project) throw new Error("Project not found");
  if (requesterRole !== "Admin" && project.created_by !== requesterId) {
    throw new Error("Only the project creator or an Admin can update member roles");
  }

  const existingMember = await prisma.projectTeam.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } }
  });

  if (!existingMember) {
    throw new Error("Member not found in this project");
  }

  return prisma.projectTeam.update({
    where: { project_team_id: existingMember.project_team_id },
    data: { project_role: projectRole }
  });
};

export const removeMemberFromProject = async (projectId: number, targetUserId: number, requesterId: number, requesterRole: string) => {
  const project = await prisma.project.findUnique({ where: { project_id: projectId } });
  
  if (!project) throw new Error("Project not found");
  if (requesterRole !== "Admin" && project.created_by !== requesterId) {
    throw new Error("Only the project creator or an Admin can remove members");
  }

  const existingMember = await prisma.projectTeam.findUnique({
    where: { project_id_user_id: { project_id: projectId, user_id: targetUserId } }
  });

  if (!existingMember) {
    throw new Error("Member not found in this project");
  }

  return prisma.projectTeam.delete({
    where: { project_team_id: existingMember.project_team_id }
  });
};