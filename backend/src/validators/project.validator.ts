import { z } from "zod";

export const createProjectSchema = z.object({
  project_name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
  start_date: z.string().datetime({ message: "Invalid start date format" }).or(z.string()),
  end_date: z.string().datetime().or(z.string()).optional().nullable(),
  status: z.string().default("PLANNING")
}).refine((data) => {
  if (data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
    return false;
  }
  return true;
}, {
  message: "End date cannot be before start date",
  path: ["end_date"]
});

export const updateProjectSchema = z.object({
  project_name: z.string().min(1, "Project name cannot be empty").optional(),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional().nullable(),
  status: z.string().optional()
}).refine((data) => {
  if (data.start_date && data.end_date && new Date(data.end_date) < new Date(data.start_date)) {
    return false;
  }
  return true;
}, {
  message: "End date cannot be before start date",
  path: ["end_date"]
});

export const addMemberSchema = z.object({
  user_id: z.number(),
  project_role: z.enum(["INCHARGE", "MEMBER"])
});

export const updateMemberRoleSchema = z.object({
  project_role: z.enum(["INCHARGE", "MEMBER"])
});