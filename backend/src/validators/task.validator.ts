import { z } from "zod";

export const createTaskSchema = z.object({
  project_id: z.number(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  due_date: z.string().datetime().or(z.string()).optional().nullable(),
  assignees: z.array(z.number()).optional()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, "Task title is required").optional(),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]).optional(),
  due_date: z.string().datetime().or(z.string()).optional().nullable(),
  assignees: z.array(z.number()).optional()
});
