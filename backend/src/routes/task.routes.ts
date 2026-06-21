import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import * as commentController from "../controllers/comment.controller";
import * as attachmentController from "../controllers/attachment.controller";
import { upload } from "../config/multer";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.post("/", taskController.createTask);
router.get("/", taskController.getAllTasks);
router.get("/:id", taskController.getTaskById);
router.put("/:id", taskController.updateTask);
router.delete("/:id", taskController.deleteTask);

// Task Comments
router.post("/:taskId/comments", commentController.createComment);
router.get("/:taskId/comments", commentController.getTaskComments);

// Task Attachments
router.post("/:taskId/attachments", upload.single("file"), attachmentController.uploadAttachment);
router.get("/:taskId/attachments", attachmentController.getTaskAttachments);

export default router;
