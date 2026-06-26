import prisma from "../config/prisma";
import fs from "fs";
import path from "path";
import { createNotification } from "./notification.service";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Config } from "../config/multer";

export const createAttachment = async (userId: number, taskId: number, filename: string, fileUrl: string) => {
  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { task_id: taskId },
    include: {
      assignees: true,
      project: {
        select: {
          created_by: true
        }
      }
    }
  });
  if (!task) {
    throw new Error("Task not found");
  }

  const attachment = await prisma.attachment.create({
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

  // --- Notifications ---
  // Get all admins
  const adminUsers = await prisma.user.findMany({
    where: {
      user_roles: {
        some: {
          role: {
            role_name: "Admin"
          }
        }
      }
    }
  });

  const notifyUserIds = new Set<number>();
  
  // 1. Task assignees
  task.assignees.forEach(a => notifyUserIds.add(a.user_id));
  
  // 2. Project Manager (creator of the project)
  if (task.project?.created_by) {
    notifyUserIds.add(task.project.created_by);
  }
  
  // 3. Admins
  adminUsers.forEach(admin => notifyUserIds.add(admin.user_id));

  // Remove the user who uploaded the document so they don't notify themselves
  notifyUserIds.delete(userId);

  // Send notifications
  const notifyPromises = Array.from(notifyUserIds).map(id =>
    createNotification(
      id,
      "New Document Uploaded",
      `A new document "${filename}" was added to task "${task.title}".`,
      "document"
    )
  );
  await Promise.all(notifyPromises);

  return attachment;
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

  // Delete from S3 if configured
  if (process.env.S3_ACCESS_KEY_ID) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME || "task-attachments",
        Key: attachment.file_name
      });
      await s3Config.send(command);
    } catch (err) {
      console.error("Failed to delete from S3:", err);
    }
  }

  // Delete local file (fallback for old files)
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

export const getAllAttachments = async (userId: number, role: string) => {
  let projectFilter: any = {};
  let taskFilter: any = {};

  if (role === "Admin") {
    // Admin sees all
  } else if (role === "Project Manager") {
    projectFilter = {
      OR: [
        { created_by: userId },
        { team_members: { some: { user_id: userId } } }
      ]
    };
    taskFilter = { project: projectFilter };
  } else if (role === "Collaborator") {
    taskFilter = { assignees: { some: { user_id: userId } } };
  }

  const whereClause = role === "Admin" ? {} : { task: taskFilter };

  return prisma.attachment.findMany({
    where: whereClause,
    orderBy: { uploaded_at: "desc" },
    include: {
      user: {
        select: {
          username: true
        }
      },
      task: {
        select: {
          title: true,
          project: {
            select: {
              project_name: true
            }
          }
        }
      }
    }
  });
};