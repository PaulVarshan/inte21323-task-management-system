import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post(
  "/",
  authenticate,
  projectController.createProject
);

export default router;