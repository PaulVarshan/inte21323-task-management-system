import { Request, Response } from "express";
import { registerUser, loginUser } from "../services/auth.service";

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;

        const user = await registerUser(
            username,
            email,
            password
        );

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: user,
        });

    } catch (error: any) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Normal login only allows Collaborator and Project Manager
    const allowedRoles = ["Collaborator", "Project Manager"];
    const result = await loginUser(email, password, allowedRoles);
    
    // Set HttpOnly cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, user: result.user });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    // Admin login only allows Admin
    const allowedRoles = ["Admin"];
    const result = await loginUser(email, password, allowedRoles);
    
    // Set HttpOnly cookie
    res.cookie("token", result.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, user: result.user });
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req: any, res: Response) => {
  // If the request makes it here, the auth.middleware verified the cookie
  res.json({ success: true, user: req.user });
};

import { PrismaClient } from "../generated/prisma/client";
const prisma = new PrismaClient();

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      where: { is_active: true },
      select: { 
        user_id: true, 
        username: true, 
        email: true,
        user_roles: {
          select: {
            role: {
              select: {
                role_name: true
              }
            }
          }
        }
      }
    });
    
    const mappedUsers = users.map(u => ({
      user_id: u.user_id,
      username: u.username,
      email: u.email,
      role: u.user_roles?.[0]?.role?.role_name || 'Collaborator'
    }));

    res.json({ success: true, data: mappedUsers });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};