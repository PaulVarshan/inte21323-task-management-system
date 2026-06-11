import prisma from "../config/prisma";

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
    return prisma.task.update({
      where: { task_id: taskId },
      data: { status: data.status || task.status }
    });
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
    }
  }

  return getTaskById(taskId, userId, role);
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

  return prisma.task.delete({
    where: { task_id: taskId }
  });
};
