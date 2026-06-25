import { Request, Response } from "express";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { registerUser, loginUser } from "../services/auth.service";
import { sendResetEmail } from "../utils/email";

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
    const { email, password, role } = req.body;
    // Normal login only allows Collaborator and Project Manager
    let allowedRoles = ["Collaborator", "Project Manager"];
    
    // If a specific role was requested from the UI dropdown, restrict login to that role
    if (role && allowedRoles.includes(role)) {
      allowedRoles = [role];
    }
    
    const result = await loginUser(email, password, allowedRoles);
    
    // Set HttpOnly cookies
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", result.refreshToken, {
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
    
    // Set HttpOnly cookies
    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.json({ success: true, user: result.user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const logout = async (req: Request, res: Response) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req: any, res: Response) => {
  try {
    const userId = parseInt(req.user.userId);
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    res.json({ 
      success: true, 
      user: {
        user_id: user.user_id,
        username: user.username,
        email: user.email,
        role: req.user.role
      } 
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

import { verifyRefreshToken, generateAccessToken } from "../utils/jwt";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient();

export const refresh = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: "No refresh token provided" });
    }

    const decoded: any = verifyRefreshToken(refreshToken);
    const userId = parseInt(decoded.userId);

    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: { user_id: true, user_roles: { select: { role: { select: { role_name: true } } } } }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const roleNames = user.user_roles?.map(ur => ur.role?.role_name) || [];
    let roleName = "Collaborator";
    if (roleNames.includes("Admin")) roleName = "Admin";
    else if (roleNames.includes("Project Manager")) roleName = "Project Manager";
    const newAccessToken = generateAccessToken(userId.toString(), roleName);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000 // 15 minutes
    });

    res.json({ success: true, message: "Token refreshed successfully" });
  } catch (error: any) {
    res.status(401).json({ success: false, message: "Invalid refresh token" });
  }
};

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

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    let { email, role } = req.body;
    
    if (!email || !role) {
      return res.status(400).json({ success: false, message: "Email and role are required" });
    }

    email = email.trim();

    if (role === "Admin") {
      return res.status(403).json({ success: false, message: "Email not found or reset not allowed" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { user_roles: { include: { role: true } } }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "Email not found or reset not allowed" });
    }

    const userRoles = user.user_roles.map(ur => ur.role.role_name);
    if (!userRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Email not found or reset not allowed" });
    }

    if (userRoles.includes("Admin")) {
      return res.status(403).json({ success: false, message: "Email not found or reset not allowed" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        reset_token: otpCode,
        reset_token_expires: resetTokenExpires
      }
    });

    await sendResetEmail(user.email, otpCode);

    res.json({ success: true, message: "Password reset OTP sent successfully" });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while processing your request" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: "Email, OTP, and new password are required" });
    }

    const user = await prisma.user.findFirst({
      where: {
        email: email.trim(),
        reset_token: otp.trim(),
        reset_token_expires: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        password_hash: hashedPassword,
        reset_token: null,
        reset_token_expires: null
      }
    });

    res.json({ success: true, message: "Password reset successfully" });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ success: false, message: "An error occurred while resetting your password" });
  }
};