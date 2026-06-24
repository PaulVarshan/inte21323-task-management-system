import prisma from "../config/prisma";
import { createNotification } from "./notification.service";
import { getIO } from "../utils/socket";

export const createTask = async (data: any, userId: number, role: string) => {
  const project = await prisma.project.findUnique({
    where: { project_id: data.project_id },
    include: { team_members: true }
  });

  if (!project) throw new Error("Project not found");

  if (role !== "Admin" && project.created_by !== userId) {
    const isMember = project.team_members.some(member => member.user_id === userId);
    if (!isMember) {
      throw new Error("Unauthorized to create tasks in this project");
    }
    // Only Admin, Creator or INCHARGE can create tasks
    const memberRole = project.team_members.find(m => m.user_id === userId)?.project_role;
    if (role !== "Project Manager" && memberRole !== "INCHARGE") {
      throw new Error("Only Project Managers or INCHARGE members can create tasks");
    }
  }

  const task = await prisma.task.create({
    data: {
      project_id: data.project_id,
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      due_date: data.due_date ? new Date(data.due_date) : null,
      created_by: userId
    }
  });

  if (data.assignees && data.assignees.length > 0) {
    const assigneesData = data.assignees.map((assigneeId: number) => ({
      task_id: task.task_id,
      user_id: assigneeId
    }));
    await prisma.taskAssigned.createMany({
      data: assigneesData
    });

    // Notify assignees
    for (const assigneeId of data.assignees) {
      if (assigneeId !== userId) {
        await createNotification(
          assigneeId,
          "New Task Assigned",
          `You have been assigned to task: "${task.title}"`,
          "TASK_ASSIGNED"
        );
      }
    }
  }

  return getTaskById(task.task_id, userId, role);
};

export const getAllTasks = async (userId: number, role: string) => {
  if (role === "Admin") {
    return prisma.task.findMany({
      include: {
        project: { select: { project_name: true } },
        assignees: { include: { user: { select: { user_id: true, username: true, email: true } } } },
        creator: { select: { user_id: true, username: true, email: true } }
      }
    });
  }

  if (role === "Collaborator") {
    return prisma.task.findMany({
      where: {
        assignees: { some: { user_id: userId } }
      },
      include: {
        project: { select: { project_name: true } },
        assignees: { include: { user: { select: { user_id: true, username: true, email: true } } } },
        creator: { select: { user_id: true, username: true, email: true } }
      }
    });
  }

  return prisma.task.findMany({
    where: {
      OR: [
        { project: { created_by: userId } },
        { project: { team_members: { some: { user_id: userId } } } },
        { assignees: { some: { user_id: userId } } }
      ]
    },
    include: {
      project: { select: { project_name: true } },
      assignees: { include: { user: { select: { user_id: true, username: true, email: true } } } },
      creator: { select: { user_id: true, username: true, email: true } }
    }
  });
};

export const getTaskById = async (taskId: number, userId: number, role: string) => {
  const task = await prisma.task.findUnique({
    where: { task_id: taskId },
    include: {
      project: {
        include: { team_members: true }
      },
      assignees: { include: { user: { select: { user_id: true, username: true, email: true } } } },
      creator: { select: { user_id: true, username: true, email: true } }
    }
  });

  if (!task) throw new Error("Task not found");

  if (role !== "Admin" && task.project.created_by !== userId) {
    const isMember = task.project.team_members.some(member => member.user_id === userId);
    if (!isMember) {
      throw new Error("Unauthorized to view this task");
    }
  }

  return task;
};

export const updateTask = async (taskId: number, data: any, userId: number, role: string) => {
  const task = await getTaskById(taskId, userId, role);

  // Check update permissions (Creator, Admin, PM, INCHARGE, or Assignee updating status)
  let canEditFull = false;
  let canEditStatus = false;

  if (role === "Admin" || task.project.created_by === userId || task.created_by === userId) {
    canEditFull = true;
  } else {
    const memberRole = task.project.team_members.find(m => m.user_id === userId)?.project_role;
    if (memberRole === "INCHARGE") {
      canEditFull = true;
    }
    
    // Any team member or assignee can edit status
    const isAssignee = task.assignees.some(a => a.user_id === userId);
    if (memberRole || isAssignee) {
      canEditStatus = true;
    }
  }

  if (!canEditFull && !canEditStatus) {
    throw new Error("Unauthorized to update this task");
  }

  if (!canEditFull && canEditStatus) {
    // Only allow status update
    const updated = await prisma.task.update({
      where: { task_id: taskId },
      data: { status: data.status || task.status }
    });

    if (data.status && data.status !== task.status) {
      // Notify creator, assignees, and project manager
      const notifyUsers = new Set<number>();
      if (task.created_by !== userId) notifyUsers.add(task.created_by);
      if (task.project.created_by !== userId) notifyUsers.add(task.project.created_by);
      task.assignees.forEach(a => { if (a.user_id !== userId) notifyUsers.add(a.user_id); });
      
      for (const uid of notifyUsers) {
        await createNotification(
          uid,
          "Task Status Updated",
          `Status of task "${task.title}" changed to ${data.status}`,
          "TASK_STATUS_CHANGED"
        );
      }
    }
    const finalTask = await getTaskById(taskId, userId, role);
    getIO().emit("task-updated", finalTask);
    return finalTask;
  }

  const updatedTask = await prisma.task.update({
    where: { task_id: taskId },
    data: {
      title: data.title,
      description: data.description,
      priority: data.priority,
      status: data.status,
      due_date: data.due_date ? new Date(data.due_date) : undefined
    }
  });

  if (data.assignees !== undefined) {
    // Delete existing
    await prisma.taskAssigned.deleteMany({
      where: { task_id: taskId }
    });
    // Add new
    if (data.assignees.length > 0) {
      const assigneesData = data.assignees.map((assigneeId: number) => ({
        task_id: taskId,
        user_id: assigneeId
      }));
      await prisma.taskAssigned.createMany({
        data: assigneesData
      });
      
      // Notify new assignees
      for (const assigneeId of data.assignees) {
        if (assigneeId !== userId) {
          await createNotification(
            assigneeId,
            "New Task Assigned",
            `You have been assigned to task: "${updatedTask.title}"`,
            "TASK_ASSIGNED"
          );
        }
      }
    }
  }

  if (data.status && data.status !== task.status) {
    // Notify creator, assignees, and project manager about status change
    const notifyUsers = new Set<number>();
    if (task.created_by !== userId) notifyUsers.add(task.created_by);
    if (task.project.created_by !== userId) notifyUsers.add(task.project.created_by);
    task.assignees.forEach(a => { if (a.user_id !== userId) notifyUsers.add(a.user_id); });
    
    for (const uid of notifyUsers) {
      await createNotification(
        uid,
        "Task Status Updated",
        `Status of task "${updatedTask.title}" changed to ${data.status}`,
        "TASK_STATUS_CHANGED"
      );
    }
  }

  const finalTask = await getTaskById(taskId, userId, role);
  getIO().emit("task-updated", finalTask);
  return finalTask;
};

export const deleteTask = async (taskId: number, userId: number, role: string) => {
  const task = await getTaskById(taskId, userId, role);

  let canDelete = false;
  if (role === "Admin" || task.project.created_by === userId || task.created_by === userId) {
    canDelete = true;
  } else {
    const memberRole = task.project.team_members.find(m => m.user_id === userId)?.project_role;
    if (memberRole === "INCHARGE") {
      canDelete = true;
    }
  }

  if (!canDelete) {
    throw new Error("Unauthorized to delete this task");
  }

  // Notify assignees about deletion
  for (const assignee of task.assignees) {
    if (assignee.user_id !== userId) {
      await createNotification(
        assignee.user_id,
        "Task Deleted",
        `The task "${task.title}" you were assigned to has been deleted.`,
        "TASK_DELETED"
      );
    }
  }

  return prisma.task.delete({
    where: { task_id: taskId }
  });
};
