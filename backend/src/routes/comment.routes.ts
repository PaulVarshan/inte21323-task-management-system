import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

router.put("/:commentId", commentController.updateComment);
router.delete("/:commentId", commentController.deleteComment);

export default router;
