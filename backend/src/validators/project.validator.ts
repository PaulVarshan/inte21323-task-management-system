

import { z } from "zod";

export const createProjectSchema = z.object({
  project_name: z.string().min(3),
  description: z.string().optional(),
  start_date: z.string(),
  end_date: z.string()
});