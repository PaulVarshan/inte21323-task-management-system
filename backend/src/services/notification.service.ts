import prisma from "../config/prisma";
import { getIO } from "../utils/socket";

export const createNotification = async (
  userId: number,
  title: string,
  message: string,
  type: string
) => {
  // Save notification to database
  const notification = await prisma.notification.create({
    data: {
      user_id: userId,
      title,
      message,
      notification_type: type
    }
  });

  // Emit real-time event to the specific user's room
  try {
    const io = getIO();
    io.to(userId.toString()).emit("new-notification", notification);
  } catch (error) {
    console.error("Socket.io emit failed:", error);
  }

  return notification;
};

export const getUserNotifications = async (userId: number) => {
  return prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" }
  });
};

export const getUnreadCount = async (userId: number) => {
  const count = await prisma.notification.count({
    where: { user_id: userId, is_read: false }
  });
  return count;
};

export const markAsRead = async (notificationId: number, userId: number) => {
  // Ensure the notification belongs to the user
  const notification = await prisma.notification.findFirst({
    where: { notification_id: notificationId, user_id: userId }
  });

  if (!notification) {
    throw new Error("Notification not found or unauthorized");
  }

  return prisma.notification.update({
    where: { notification_id: notificationId },
    data: { is_read: true }
  });
};

export const markAllAsRead = async (userId: number) => {
  return prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true }
  });
};
