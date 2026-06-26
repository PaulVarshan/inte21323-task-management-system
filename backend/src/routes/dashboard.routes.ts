import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

// Apply auth middlewares
router.use(authenticate);
router.use(authorize("Admin", "Project Manager", "Collaborator"));

/**
 * @swagger
 * /api/dashboard/overview:
 *   get:
 *     summary: Get dashboard overview metrics
 *     description: |
 *       Retrieves top-level metrics for the dashboard.
 *       **Roles:** Admin, Project Manager, Collaborator
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Overview metrics
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/overview", dashboardController.getOverview);
/**
 * @swagger
 * /api/dashboard/project-progress:
 *   get:
 *     summary: Get project progress
 *     description: |
 *       Retrieves progress metrics for active projects.
 *       **Roles:** Admin, Project Manager, Collaborator
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Project progress metrics
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/project-progress", dashboardController.getProjectProgress);
/**
 * @swagger
 * /api/dashboard/task-status:
 *   get:
 *     summary: Get task status distribution
 *     description: |
 *       Retrieves distribution of tasks by status.
 *       **Roles:** Admin, Project Manager, Collaborator
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Task status metrics
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/task-status", dashboardController.getTaskStatus);
/**
 * @swagger
 * /api/dashboard/overdue-tasks:
 *   get:
 *     summary: Get overdue tasks
 *     description: |
 *       Retrieves a list of tasks that have passed their deadline.
 *       **Roles:** Admin, Project Manager, Collaborator
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Overdue tasks
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/overdue-tasks", dashboardController.getOverdueTasks);
/**
 * @swagger
 * /api/dashboard/upcoming-deadlines:
 *   get:
 *     summary: Get upcoming deadlines
 *     description: |
 *       Retrieves tasks with deadlines approaching soon.
 *       **Roles:** Admin, Project Manager, Collaborator
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Upcoming deadlines
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/upcoming-deadlines", dashboardController.getUpcomingDeadlines);
/**
 * @swagger
 * /api/dashboard/team-workload:
 *   get:
 *     summary: Get team workload
 *     description: |
 *       Retrieves workload distribution across team members.
 *       **Roles:** Admin, Project Manager, Collaborator
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Team workload metrics
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/team-workload", dashboardController.getTeamWorkload);
/**
 * @swagger
 * /api/dashboard/recent-tasks:
 *   get:
 *     summary: Get recent tasks
 *     description: |
 *       Retrieves the most recently created or updated tasks.
 *       **Roles:** Admin, Project Manager, Collaborator
 *     tags: [Dashboard]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Recent tasks
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/recent-tasks", dashboardController.getRecentTasks);

export default router;
