import { Request, Response } from "express";
import * as attachmentService from "../services/attachment.service";

interface AuthRequest extends Request {
  user?: any;
}

export const uploadAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId as string);
    const userId = parseInt(req.user.userId as string);

    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded or file type not allowed" });
    }

    // Build URL to access file statically
    const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const attachment = await attachmentService.createAttachment(
      userId,
      taskId,
      req.file.filename,
      fileUrl
    );

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: attachment
    });
  } catch (error: any) {
    if (error.message === "Task not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to upload file" });
  }
};

export const getTaskAttachments = async (req: AuthRequest, res: Response) => {
  try {
    const taskId = parseInt(req.params.taskId as string);

    if (isNaN(taskId)) {
      return res.status(400).json({ success: false, message: "Invalid Task ID" });
    }

    const attachments = await attachmentService.getTaskAttachments(taskId);

    return res.status(200).json({
      success: true,
      message: "Attachments retrieved successfully",
      data: attachments
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve attachments" });
  }
};

export const deleteAttachment = async (req: AuthRequest, res: Response) => {
  try {
    const attachmentId = parseInt(req.params.attachmentId as string);
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;

    if (isNaN(attachmentId)) {
      return res.status(400).json({ success: false, message: "Invalid Attachment ID" });
    }

    const result = await attachmentService.deleteAttachment(attachmentId, userId, role);

    return res.status(200).json(result);
  } catch (error: any) {
    if (error.message === "Attachment not found") {
      return res.status(404).json({ success: false, message: error.message });
    }
    if (error.message.includes("Unauthorized")) {
      return res.status(403).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: error.message || "Failed to delete attachment" });
  }
};
