import prisma from "../config/prisma";
import fs from "fs";
import path from "path";

export const createAttachment = async (userId: number, taskId: number, filename: string, fileUrl: string) => {
  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { task_id: taskId }
  });
  if (!task) {
    throw new Error("Task not found");
  }

  return prisma.attachment.create({
    data: {
      file_name: filename,
      uploaded_by_user_id: userId,
      task_id: taskId,
      file_url: fileUrl
    },
    include: {
      user: {
        select: {
          user_id: true,
          username: true,
          email: true
        }
      }
    }
  });
};

export const getTaskAttachments = async (taskId: number) => {
  return prisma.attachment.findMany({
    where: { task_id: taskId },
    orderBy: { uploaded_at: "asc" },
    include: {
      user: {
        select: {
          user_id: true,
          username: true,
          email: true
        }
      }
    }
  });
};

export const deleteAttachment = async (attachmentId: number, userId: number, role: string) => {
  const attachment = await prisma.attachment.findUnique({
    where: { attachment_id: attachmentId }
  });

  if (!attachment) {
    throw new Error("Attachment not found");
  }

  // Permission check: Only Attachment Creator (Owner) or Admin can delete
  if (attachment.uploaded_by_user_id !== userId && role !== "Admin") {
    throw new Error("Unauthorized to delete this attachment");
  }

  // Delete local file
  const filePath = path.join(process.cwd(), "uploads", attachment.file_name);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    console.error("Failed to delete physical file:", err);
  }

  await prisma.attachment.delete({
    where: { attachment_id: attachmentId }
  });

  return { success: true, message: "Attachment deleted successfully" };
};
