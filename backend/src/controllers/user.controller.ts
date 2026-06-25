import { Request, Response } from "express";
import * as userService from "../services/user.service";
import { sendWelcomeEmail } from "../utils/email";

interface AuthRequest extends Request {
  user?: any;
}

// Helper to check admin role
const requireAdmin = (req: AuthRequest, res: Response) => {
  if (req.user.role !== "Admin") {
    res.status(403).json({ success: false, message: "Forbidden: Admin access required" });
    return false;
  }
  return true;
};

export const createUser = async (req: AuthRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const { username, email, role } = req.body;
    
    if (!username || !email || !role) {
      return res.status(400).json({ success: false, message: "Username, email, and role are required" });
    }

    // Generate a strong random password
    const plainTextPassword = require('crypto').randomBytes(8).toString('hex') + 'Aa1!';
    const passwordHash = await require('bcryptjs').hash(plainTextPassword, 10);

    const user = await userService.createUser(username, email, role, passwordHash);

    // Send welcome email with generated password
    await sendWelcomeEmail(email, username, plainTextPassword);

    return res.status(201).json({ success: true, message: "User created successfully", data: user });
  } catch (error: any) {
    if (error.message.includes("already exists")) return res.status(400).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to create user" });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const users = await userService.getAllUsers();
    return res.status(200).json({ success: true, data: users });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch users" });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const userId = parseInt(req.params.id as string);
    const user = await userService.getUserById(userId);
    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    if (error.message === "User not found") return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to fetch user" });
  }
};

export const updateUserDetails = async (req: AuthRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const userId = parseInt(req.params.id as string);
    const { username, email } = req.body;
    const user = await userService.updateUserDetails(userId, { username, email });
    return res.status(200).json({ success: true, message: "User updated successfully", data: user });
  } catch (error: any) {
    if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
    if (error.message.includes("already in use")) return res.status(400).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to update user" });
  }
};

export const changeUserRole = async (req: AuthRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const userId = parseInt(req.params.id as string);
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: "Role is required" });
    
    const user = await userService.changeUserRole(userId, role);
    return res.status(200).json({ success: true, message: "User role updated", data: user });
  } catch (error: any) {
    if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to update role" });
  }
};

export const changeUserStatus = async (req: AuthRequest, res: Response) => {
  if (!requireAdmin(req, res)) return;
  try {
    const userId = parseInt(req.params.id as string);
    const { is_active } = req.body;
    if (typeof is_active !== 'boolean') return res.status(400).json({ success: false, message: "is_active boolean is required" });
    
    const user = await userService.changeUserStatus(userId, is_active);
    return res.status(200).json({ success: true, message: `User ${is_active ? 'activated' : 'deactivated'}`, data: user });
  } catch (error: any) {
    if (error.message.includes("not found")) return res.status(404).json({ success: false, message: error.message });
    return res.status(500).json({ success: false, message: error.message || "Failed to change status" });
  }
};
