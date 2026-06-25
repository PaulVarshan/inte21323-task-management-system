import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Apply auth middlewares
router.use(authenticate);
router.use(authorize("Admin", "Project Manager", "Collaborator"));

router.get("/overview", dashboardController.getOverview);
router.get("/project-progress", dashboardController.getProjectProgress);
router.get("/task-status", dashboardController.getTaskStatus);
router.get("/overdue-tasks", dashboardController.getOverdueTasks);
router.get("/upcoming-deadlines", dashboardController.getUpcomingDeadlines);
router.get("/team-workload", dashboardController.getTeamWorkload);
router.get("/recent-tasks", dashboardController.getRecentTasks);

export default router;
