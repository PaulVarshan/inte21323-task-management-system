import { Request, Response } from "express";
import * as taskService from "../services/task.service";
import * as taskValidator from "../validators/task.validator";
import { z } from "zod";

interface AuthRequest extends Request {
  user?: any;
}

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = taskValidator.createTaskSchema.parse(req.body);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    const task = await taskService.createTask(validatedData, userId, role);
    
    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    if (error.message.includes("Unauthorized")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to create task" });
  }
};

export const getAllTasks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    const tasks = await taskService.getAllTasks(userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Tasks retrieved successfully",
      data: tasks
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve tasks" });
  }
};

export const getTaskById = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    const task = await taskService.getTaskById(taskId, userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Task retrieved successfully",
      data: task
    });
  } catch (error: any) {
    if (error.message === "Task not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Unauthorized")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve task" });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const validatedData = taskValidator.updateTaskSchema.parse(req.body);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    const task = await taskService.updateTask(taskId, validatedData, userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    if (error.message === "Task not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Unauthorized") || error.message.includes("Only")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to update task" });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.id as string);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    await taskService.deleteTask(taskId, userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Task deleted successfully",
      data: {}
    });
  } catch (error: any) {
    if (error.message === "Task not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Unauthorized") || error.message.includes("Only")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to delete task" });
  }
};
