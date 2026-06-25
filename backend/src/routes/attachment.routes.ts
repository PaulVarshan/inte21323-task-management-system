import { Router } from "express";
import * as attachmentController from "../controllers/attachment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.get("/", attachmentController.getAllAttachments);
router.delete("/:attachmentId", attachmentController.deleteAttachment);

export default router;
