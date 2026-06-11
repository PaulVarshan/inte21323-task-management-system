import { Request, Response } from "express";
import * as projectService from "../services/project.service";

interface AuthRequest extends Request {
  user?: any;
}

export const createProject = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const project =
      await projectService.createProject(
        req.body,
        req.user.user_id
      );

    res.status(201).json(project);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create project"
    });
  }
};