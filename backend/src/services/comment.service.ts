import prisma from "../config/prisma";

export const createComment = async (userId: number, taskId: number, commentText: string) => {
  if (!commentText.trim()) {
    throw new Error("Comment text cannot be empty");
  }

  // Verify task exists
  const task = await prisma.task.findUnique({
    where: { task_id: taskId }
  });
  if (!task) {
    throw new Error("Task not found");
  }

  return prisma.comment.create({
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
