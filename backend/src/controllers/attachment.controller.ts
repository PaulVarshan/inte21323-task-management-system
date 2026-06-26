import { Request, Response } from "express";
import * as attachmentService from "../services/attachment.service";

interface AuthRequest extends Request {
  user?: any;
  file?: Express.Multer.File;
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

    const filename = (req.file as any).key || req.file.filename;

    let fileUrl = "";
    if ((req.file as any).key) {
      // It's S3. Convert the internal S3 API endpoint to the public Object URL
      const bucket = process.env.S3_BUCKET_NAME || "task-attachments";
      const s3Endpoint = process.env.S3_ENDPOINT || "https://vyxunfpwynglcmqdalto.storage.supabase.co/storage/v1/s3";
      const baseUrl = s3Endpoint.replace("/s3", "");
      fileUrl = `${baseUrl}/object/public/${bucket}/${filename}`;
    } else {
      // It's local
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;
    }

    const attachment = await attachmentService.createAttachment(
      userId,
      taskId,
      filename,
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

export const getAllAttachments = async (req: AuthRequest, res: Response) => {
  try {
    const userId = parseInt(req.user.userId as string);
    const role = req.user.role as string;

    const attachments = await attachmentService.getAllAttachments(userId, role);

    const formattedAttachments = attachments.map(a => ({
      attachment_id: a.attachment_id,
      file_name: a.file_name,
      file_url: a.file_url,
      uploaded_at: a.uploaded_at,
      uploaded_by: a.user?.username || "Unknown",
      task_name: a.task?.title || "Unknown Task",
      project_name: a.task?.project?.project_name || "Unknown Project"
    }));

    return res.status(200).json({
      success: true,
      message: "All attachments retrieved successfully",
      data: formattedAttachments
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || "Failed to retrieve attachments" });
  }
};
