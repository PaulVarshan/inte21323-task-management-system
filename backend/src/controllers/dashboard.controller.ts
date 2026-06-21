import { Request, Response } from "express";
import prisma from "../config/prisma";

interface AuthRequest extends Request {
  user?: any;
}

const getFilters = (role: string, userId: number) => {
  let projectFilter: any = {};
  let taskFilter: any = {};

  if (role === "Admin") {
    projectFilter = {};
    taskFilter = {};
  } else if (role === "Project Manager") {
    projectFilter = {
      OR: [
        { created_by: userId },
        { team_members: { some: { user_id: userId } } }
      ]
    };
    taskFilter = {
      project: projectFilter
    };
  } else if (role === "Collaborator") {
    projectFilter = {
      team_members: { some: { user_id: userId } }
    };
    taskFilter = {
      assignees: { some: { user_id: userId } }
    };
  }

  return { projectFilter, taskFilter };
};

export const getOverview = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    const { projectFilter, taskFilter } = getFilters(role, userId);

    const now = new Date();

    const [totalProjects, activeProjects, totalTasks, completedTasks, inProgressTasks, overdueTasks] = await Promise.all([
      prisma.project.count({ where: projectFilter }),
      prisma.project.count({
        where: { ...projectFilter, NOT: { status: "COMPLETED" } }
      }),
      prisma.task.count({ where: taskFilter }),
      prisma.task.count({
        where: { ...taskFilter, status: "DONE" }
      }),
      prisma.task.count({
        where: { ...taskFilter, status: { in: ["IN_PROGRESS", "REVIEW"] } }
      }),
      prisma.task.count({
        where: {
          ...taskFilter,
          NOT: { status: "DONE" },
          due_date: { lt: now }
        }
      })
    ]);

    return res.status(200).json({
      success: true,
      message: "Overview statistics retrieved successfully",
      data: {
        total_projects: totalProjects,
        active_projects: activeProjects,
        total_tasks: totalTasks,
        completed_tasks: completedTasks,
        in_progress_tasks: inProgressTasks,
        overdue_tasks: overdueTasks
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve overview stats" });
  }
};

export const getProjectProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    const { projectFilter } = getFilters(role, userId);

    const projects = await prisma.project.findMany({
      where: projectFilter,
      select: {
        project_id: true,
        project_name: true,
        tasks: {
          where: role === "Collaborator" ? { assignees: { some: { user_id: userId } } } : undefined,
          select: {
            status: true
          }
        }
      }
    });

    const progressData = projects.map(p => {
      const total = p.tasks.length;
      const completed = p.tasks.filter(t => t.status === "DONE").length;
      const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
      return {
        project_id: p.project_id,
        project_name: p.project_name,
        total_tasks: total,
        completed_tasks: completed,
        progress_percentage: percentage
      };
    });

    return res.status(200).json({
      success: true,
      message: "Project progress retrieved successfully",
      data: progressData
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve project progress" });
  }
};

export const getTaskStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    const { taskFilter } = getFilters(role, userId);

    const statusCounts = await prisma.task.groupBy({
      by: ["status"],
      where: taskFilter,
      _count: {
        status: true
      }
    });

    const counts = {
      TODO: 0,
      IN_PROGRESS: 0,
      REVIEW: 0,
      DONE: 0
    };

    statusCounts.forEach(sc => {
      if (sc.status in counts) {
        counts[sc.status as keyof typeof counts] = sc._count.status;
      }
    });

    return res.status(200).json({
      success: true,
      message: "Task status distribution retrieved successfully",
      data: counts
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve task status stats" });
  }
};

export const getOverdueTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    const { taskFilter } = getFilters(role, userId);

    const now = new Date();
    const overdue = await prisma.task.findMany({
      where: {
        ...taskFilter,
        NOT: { status: "DONE" },
        due_date: { lt: now }
      },
      include: {
        project: { select: { project_name: true } },
        assignees: { include: { user: { select: { username: true, email: true } } } }
      },
      orderBy: { due_date: "asc" }
    });

    const mappedTasks = overdue.map(t => ({
      task_id: t.task_id,
      title: t.title,
      project_name: t.project?.project_name || "N/A",
      due_date: t.due_date,
      status: t.status,
      priority: t.priority,
      assignees: t.assignees.map(a => a.user?.username).filter(Boolean)
    }));

    return res.status(200).json({
      success: true,
      message: "Overdue tasks retrieved successfully",
      data: mappedTasks
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve overdue tasks" });
  }
};

export const getUpcomingDeadlines = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    const { taskFilter } = getFilters(role, userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const in3Days = new Date(today);
    in3Days.setDate(today.getDate() + 3);
    in3Days.setHours(23, 59, 59, 999);

    const in7Days = new Date(today);
    in7Days.setDate(today.getDate() + 7);
    in7Days.setHours(23, 59, 59, 999);

    const upcomingTasks = await prisma.task.findMany({
      where: {
        ...taskFilter,
        NOT: { status: "DONE" },
        due_date: { gte: today, lte: in7Days }
      },
      include: {
        project: { select: { project_name: true } }
      },
      orderBy: { due_date: "asc" }
    });

    const bucketed = {
      today: [] as any[],
      next3Days: [] as any[],
      next7Days: [] as any[]
    };

    upcomingTasks.forEach(task => {
      if (!task.due_date) return;
      const due = new Date(task.due_date);
      const mapped = {
        task_id: task.task_id,
        title: task.title,
        project_name: task.project?.project_name || "N/A",
        due_date: task.due_date
      };

      if (due <= endOfToday) {
        bucketed.today.push(mapped);
      } else if (due <= in3Days) {
        bucketed.next3Days.push(mapped);
      } else {
        bucketed.next7Days.push(mapped);
      }
    });

    return res.status(200).json({
      success: true,
      message: "Upcoming deadlines retrieved successfully",
      data: bucketed
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve upcoming deadlines" });
  }
};

export const getTeamWorkload = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;

    const users = await prisma.user.findMany({
      where: {
        is_active: true,
        ...(role === "Collaborator" ? { user_id: userId } : {}),
        user_roles: {
          some: {
            role: {
              role_name: { in: ["Collaborator", "Project Manager"] }
            }
          }
        }
      },
      select: {
        user_id: true,
        username: true,
        email: true,
        assigned_tasks: {
          where: {
            task: {
              NOT: {
                status: "DONE"
              }
            }
          },
          select: {
            task_id: true
          }
        }
      }
    });

    const workload = users.map(u => ({
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      assigned_tasks_count: u.assigned_tasks.length
    })).sort((a, b) => b.assigned_tasks_count - a.assigned_tasks_count);

    return res.status(200).json({
      success: true,
      message: "Team workload retrieved successfully",
      data: workload
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve team workload" });
  }
};

export const getRecentTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    const { taskFilter } = getFilters(role, userId);

    const recent = await prisma.task.findMany({
      where: taskFilter,
      orderBy: { updated_at: "desc" },
      take: 10,
      include: {
        project: { select: { project_name: true } },
        assignees: { include: { user: { select: { username: true } } } }
      }
    });

    const mappedRecent = recent.map(t => ({
      task_id: t.task_id,
      title: t.title,
      project_name: t.project?.project_name || "N/A",
      status: t.status,
      updated_at: t.updated_at,
      assignees: t.assignees.map(a => a.user?.username).filter(Boolean)
    }));

    return res.status(200).json({
      success: true,
      message: "Recent tasks retrieved successfully",
      data: mappedRecent
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve recent tasks" });
  }
};
