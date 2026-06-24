import prisma from "../config/prisma";
import { createNotification } from "./notification.service";

export const createComment = async (userId: number, taskId: number, commentText: string) => {
  if (!commentText.trim()) {
    throw new Error("Comment text cannot be empty");
  }

  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { task_id: taskId },
    include: { assignees: true }
  });
  if (!task) {
    throw new Error("Task not found");
  }

  const comment = await prisma.comment.create({
    data: {
      user_id: userId,
      task_id: taskId,
      comment_text: commentText
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

  // Notify task creator and assignees about the new comment
  const notifyUsers = new Set<number>();
  if (task.created_by !== userId) notifyUsers.add(task.created_by);
  task.assignees.forEach(a => {
    if (a.user_id !== userId) notifyUsers.add(a.user_id);
  });

  for (const uid of notifyUsers) {
    await createNotification(
      uid,
      "New Comment",
      `A new comment was added to task "${task.title}"`,
      "TASK_COMMENT"
    );
  }

  return comment;
};

export const getTaskComments = async (taskId: number) => {
  return prisma.comment.findMany({
    where: { task_id: taskId },
    orderBy: { created_at: "asc" },
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

export const updateComment = async (commentId: number, userId: number, role: string, commentText: string) => {
  if (!commentText.trim()) {
    throw new Error("Comment text cannot be empty");
  }

  const comment = await prisma.comment.findUnique({
    where: { comment_id: commentId }
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Permission check: Only Comment Owner or Admin can edit
  if (comment.user_id !== userId && role !== "Admin") {
    throw new Error("Unauthorized to edit this comment");
  }

  return prisma.comment.update({
    where: { comment_id: commentId },
    data: {
      comment_text: commentText
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

export const deleteComment = async (commentId: number, userId: number, role: string) => {
  const comment = await prisma.comment.findUnique({
    where: { comment_id: commentId }
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  // Permission check: Only Comment Owner or Admin can delete
  if (comment.user_id !== userId && role !== "Admin") {
    throw new Error("Unauthorized to delete this comment");
  }

  await prisma.comment.delete({
    where: { comment_id: commentId }
  });

  return { success: true, message: "Comment deleted successfully" };
};
