import { Request, Response } from "express";
import * as notificationService from "../services/notification.service";

interface AuthRequest extends Request {
  user?: any;
}

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const notifications = await notificationService.getUserNotifications(userId);
    
    return res.status(200).json({
      success: true,
      message: "Notifications retrieved successfully",
      data: notifications
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve notifications" });
  }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const count = await notificationService.getUnreadCount(userId);
    
    return res.status(200).json({
      success: true,
      message: "Unread count retrieved",
      data: { count }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve unread count" });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const notificationId = parseInt(req.params.id as string);
    const userId = parseInt(req.user.userId as string);
    
    const notification = await notificationService.markAsRead(notificationId, userId);
    
    return res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification
    });
  } catch (error: any) {
    if (error.message.includes("not found")) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to mark as read" });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    await notificationService.markAllAsRead(userId);
    
    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
      data: {}
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to mark all as read" });
  }
};
