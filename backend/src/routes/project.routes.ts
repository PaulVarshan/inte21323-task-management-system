import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Apply authenticate middleware to all routes in this router
router.use(authenticate);

// =======================
// PROJECT CRUD OPERATIONS
// =======================

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: |
 *       Creates a new project.
 *       **Roles:** Admin, Project Manager
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectName, description, startDate, endDate]
 *             properties:
 *               projectName: { type: "string", example: "Website Redesign" }
 *               description: { type: "string", example: "Overhaul the main corporate website." }
 *               startDate: { type: "string", format: "date-time", example: "2023-11-01T00:00:00.000Z" }
 *               endDate: { type: "string", format: "date-time", example: "2023-12-31T23:59:59.000Z" }
 *     responses:
 *       201:
 *         description: Project created
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/", projectController.createProject);
/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all projects
 *     description: |
 *       Retrieves a list of all projects the user is a member of.
 *       **Roles:** Any Authenticated User
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of projects
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: "boolean", example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: "#/components/schemas/Project" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/", projectController.getAllProjects);
/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: |
 *       Retrieves details of a specific project.
 *       **Roles:** Any Authenticated User (must be member)
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Project ID
 *         example: 101
 *     responses:
 *       200:
 *         description: Project details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: "boolean", example: true }
 *                 data: { $ref: "#/components/schemas/Project" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:id", projectController.getProjectById);
/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update project details
 *     description: |
 *       Updates information of a specific project.
 *       **Roles:** Admin, Project Manager
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Project ID
 *         example: 101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               projectName: { type: "string", example: "Website Redesign v2" }
 *               status: { type: "string", example: "IN_PROGRESS" }
 *     responses:
 *       200:
 *         description: Project updated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.put("/:id", projectController.updateProject);
/**
 * @swagger
 * /api/projects/{id}:
 *   delete:
 *     summary: Delete a project
 *     description: |
 *       Deletes a specific project.
 *       **Roles:** Admin
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Project ID
 *         example: 101
 *     responses:
 *       200:
 *         description: Project deleted
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.delete("/:id", projectController.deleteProject);

// =======================
// TEAM MANAGEMENT
// =======================

/**
 * @swagger
 * /api/projects/all/members:
 *   get:
 *     summary: Get all team members across projects
 *     description: |
 *       Retrieves all team members.
 *       **Roles:** Any Authenticated User
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of all members
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/all/members", projectController.getAllTeamMembers);

/**
 * @swagger
 * /api/projects/{id}/members:
 *   post:
 *     summary: Add member to project
 *     description: |
 *       Assigns a user to a project with a specific role.
 *       **Roles:** Admin, Project Manager
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Project ID
 *         example: 101
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [userId, roleName]
 *             properties:
 *               userId: { type: "integer", example: 3 }
 *               roleName: { type: "string", example: "Collaborator" }
 *     responses:
 *       200:
 *         description: Member added
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/:id/members", projectController.addMember);
/**
 * @swagger
 * /api/projects/{id}/members:
 *   get:
 *     summary: Get project members
 *     description: |
 *       Retrieves all members assigned to a specific project.
 *       **Roles:** Any Authenticated User
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Project ID
 *         example: 101
 *     responses:
 *       200:
 *         description: List of members
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:id/members", projectController.getMembers);
/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   put:
 *     summary: Update project member role
 *     description: |
 *       Updates the role of a user in a specific project.
 *       **Roles:** Admin, Project Manager
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Project ID
 *         example: 101
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: "integer" }
 *         description: User ID
 *         example: 3
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [roleName]
 *             properties:
 *               roleName: { type: "string", example: "Project Manager" }
 *     responses:
 *       200:
 *         description: Member role updated
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.put("/:id/members/:userId", projectController.updateMemberRole);
/**
 * @swagger
 * /api/projects/{id}/members/{userId}:
 *   delete:
 *     summary: Remove member from project
 *     description: |
 *       Removes a user from a specific project.
 *       **Roles:** Admin, Project Manager
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Project ID
 *         example: 101
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: "integer" }
 *         description: User ID
 *         example: 3
 *     responses:
 *       200:
 *         description: Member removed
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.delete("/:id/members/:userId", projectController.removeMember);

export default router;