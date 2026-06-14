import { Request, Response } from "express";
import * as commentService from "../services/comment.service";

interface AuthRequest extends Request {
  user?: any;
}

export const createComment = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId as string);
    const { comment_text } = req.body;
    const userId = parseInt(req.user.userId as string);

    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text cannot be empty" });
    }

    const comment = await commentService.createComment(userId, taskId, comment_text);

    return res.status(201).json({
      success: true,
      message: "Comment posted successfully",
      data: comment
    });
  } catch (error: any) {
    if (error.message === "Task not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to post comment" });
  }
};

export const getTaskComments = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId as string);

    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    const comments = await commentService.getTaskComments(taskId);

    return res.status(200).json({
      success: true,
      message: "Comments retrieved successfully",
      data: comments
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve comments" });
  }
};

export const updateComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId as string);
    const { comment_text } = req.body;
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;

    if (isNaN(commentId)) {
      return res.status(400).json({ success: false, message: "Invalid Comment ID" });
    }

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ success: false, message: "Comment text cannot be empty" });
    }

    const updatedComment = await commentService.updateComment(commentId, userId, role, comment_text);

    return res.status(200).json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment
    });
  } catch (error: any) {
    if (error.message === "Comment not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to update comment" });
  }
};

export const deleteComment = async (req: AuthRequest, res: Response) => {
  try {
    const commentId = parseInt(req.params.commentId as string);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;

    if (isNaN(commentId)) {
      return res.status(400).json({ success: false, message: "Invalid Comment ID" });
    }

    const result = await commentService.deleteComment(commentId, userId, role);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Comment not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to delete comment" });
  }
};
