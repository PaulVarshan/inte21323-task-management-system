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
    res.json(result);
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
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ success: false, message: error.message });
  }
};