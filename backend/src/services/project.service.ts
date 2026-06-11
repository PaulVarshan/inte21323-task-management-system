import prisma from "../config/prisma";

export const createProject = async (
  data: any,
  userId: number
) => {
  return prisma.project.create({
    data: {
      project_name: data.project_name,
      description: data.description,
      start_date: new Date(data.start_date),
      end_date: data.end_date
        ? new Date(data.end_date)
        : null,
      status: "PLANNING",
      created_by: userId
    }
  });
};