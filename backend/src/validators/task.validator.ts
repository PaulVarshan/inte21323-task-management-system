import { z } from "zod";

export const createTaskSchema = z.object({
  project_id: z.number(),
  title: z.string().min(1, "Task title is required"),
  description: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "DONE"]),
  due_date: z.string().datetime().or(z.string()).optional().nullable()
    .refine((val) => {
      if (!val) return true;
      let dateStr: string;
      if (val.includes('T')) {
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      } else {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
        const d = new Date(val);
        if (isNaN(d.getTime())) return false;
        dateStr = val;
      }
      const t = new Date();
      const todayStr = `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`;
      return dateStr >= todayStr;
    }, { message: "Due date cannot be in the past" }),
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
