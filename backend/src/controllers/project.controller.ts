import { Request, Response } from "express";
import * as projectService from "../services/project.service";
import * as projectValidator from "../validators/project.validator";
import { z } from "zod";

interface AuthRequest extends Request {
  user?: any;
}

// =======================
// PROJECT CRUD OPERATIONS
// =======================

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = projectValidator.createProjectSchema.parse(req.body);
    const userId = parseInt(req.user.userId as string);
    
    const project = await projectService.createProject(validatedData, userId);
    
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to create project" });
  }
};

export const getAllProjects = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    const projects = await projectService.getAllProjects(userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Projects retrieved successfully",
      data: projects
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve projects" });
  }
};

export const getProjectById = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    const project = await projectService.getProjectById(projectId, userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Project retrieved successfully",
      data: project
    });
  } catch (error: any) {
    if (error.message === "Project not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Unauthorized")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve project" });
  }
};

export const updateProject = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const validatedData = projectValidator.updateProjectSchema.parse(req.body);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    const project = await projectService.updateProject(projectId, validatedData, userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      data: project
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    if (error.message === "Project not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Only the project creator")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to update project" });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;
    
    await projectService.deleteProject(projectId, userId, role);
    
    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
      data: {}
    });
  } catch (error: any) {
    if (error.message === "Project not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Only the project creator")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to delete project" });
  }
};

// =======================
// TEAM MANAGEMENT
// =======================

export const addMember = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const validatedData = projectValidator.addMemberSchema.parse(req.body);
    const requesterId = parseInt(req.user.userId as string);
    const requesterRole = req.user.role as string;
    
    const member = await projectService.addMemberToProject(projectId, validatedData.user_id, validatedData.project_role, requesterId, requesterRole);
    
    return res.status(201).json({
      success: true,
      message: "Member added to project successfully",
      data: member
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    if (error.message === "Project not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Only the project creator")) return res.status(403).json({ success: false, message: error.message });
    if (error.message.includes("already a member")) return res.status(409).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to add member" });
  }
};

export const getMembers = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const requesterId = parseInt(req.user.userId as string);
    const requesterRole = req.user.role as string;
    
    const members = await projectService.getProjectMembers(projectId, requesterId, requesterRole);
    
    return res.status(200).json({
      success: true,
      message: "Project members retrieved successfully",
      data: members
    });
  } catch (error: any) {
    if (error.message === "Project not found") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Unauthorized")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve members" });
  }
};

export const getAllTeamMembers = async (req: AuthRequest, res: Response) => {
  try {
    const requesterId = parseInt(req.user.userId as string);
    const requesterRole = req.user.role as string;
    
    const members = await projectService.getAllTeamMembers(requesterId, requesterRole);
    
    return res.status(200).json({
      success: true,
      message: "All team members retrieved successfully",
      data: members
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve members" });
  }
};

export const updateMemberRole = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);
    const validatedData = projectValidator.updateMemberRoleSchema.parse(req.body);
    const requesterId = parseInt(req.user.userId as string);
    const requesterRole = req.user.role as string;
    
    const updatedMember = await projectService.updateMemberRole(projectId, targetUserId, validatedData.project_role, requesterId, requesterRole);
    
    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data: updatedMember
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) return res.status(400).json({ success: false, message: (error as any).errors[0].message });
    if (error.message === "Project not found" || error.message === "Member not found in this project") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Only the project creator")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to update member role" });
  }
};

export const removeMember = async (req: AuthRequest, res: Response) => {
  try {
    const projectId = parseInt(req.params.id as string);
    const targetUserId = parseInt(req.params.userId as string);
    const requesterId = parseInt(req.user.userId as string);
    const requesterRole = req.user.role as string;
    
    await projectService.removeMemberFromProject(projectId, targetUserId, requesterId, requesterRole);
    
    return res.status(200).json({
      success: true,
      message: "Member removed from project successfully",
      data: {}
    });
  } catch (error: any) {
    if (error.message === "Project not found" || error.message === "Member not found in this project") return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("Only the project creator")) return res.status(403).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to remove member" });
  }
};