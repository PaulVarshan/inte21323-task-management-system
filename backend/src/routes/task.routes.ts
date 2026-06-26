import { Router } from "express";
import * as taskController from "../controllers/task.controller";
import * as commentController from "../controllers/comment.controller";
import * as attachmentController from "../controllers/attachment.controller";
import { upload } from "../config/multer";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     description: |
 *       Creates a new task within a project.
 *       **Roles:** Admin, Project Manager
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, title, priority]
 *             properties:
 *               projectId: { type: "integer", example: 101 }
 *               title: { type: "string", example: "Implement Login Interface" }
 *               description: { type: "string", example: "Build the React components for the login page." }
 *               priority: { type: "string", example: "HIGH" }
 *               dueDate: { type: "string", format: "date-time", example: "2023-11-15T00:00:00.000Z" }
 *     responses:
 *       201:
 *         description: Task created
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
router.post("/", taskController.createTask);
/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     description: |
 *       Retrieves a list of tasks.
 *       **Roles:** Any Authenticated User
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: "boolean", example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: "#/components/schemas/Task" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/", taskController.getAllTasks);
/**
 * @swagger
 * /api/tasks/{id}:
 *   get:
 *     summary: Get task by ID
 *     description: |
 *       Retrieves details of a specific task.
 *       **Roles:** Any Authenticated User
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Task ID
 *         example: 501
 *     responses:
 *       200:
 *         description: Task details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: "boolean", example: true }
 *                 data: { $ref: "#/components/schemas/Task" }
 *       401:
 *         $ref: "#/components/responses/Unauthorized"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:id", taskController.getTaskById);
/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update task details and status
 *     description: |
 *       Updates task information.
 *       
 *       **Roles for general updates:** Admin, Project Manager
 *       
 *       **Roles for Status updates:**
 *       - Collaborators can move: `To Do → In Progress`, `In Progress → Review`
 *       - Project Managers/Admins can move: `Review → Completed`, `Review → In Progress`
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Task ID
 *         example: 501
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title: { type: "string", example: "Implement Login Interface (Updated)" }
 *               priority: { type: "string", example: "LOW" }
 *               status: { type: "string", example: "REVIEW" }
 *     responses:
 *       200:
 *         description: Task updated
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
router.put("/:id", taskController.updateTask);
/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     description: |
 *       Deletes a specific task.
 *       **Roles:** Admin, Project Manager
 *     tags: [Tasks]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: "integer" }
 *         description: Task ID
 *         example: 501
 *     responses:
 *       200:
 *         description: Task deleted
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
router.delete("/:id", taskController.deleteTask);

// Task Comments
/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   post:
 *     summary: Add a comment to a task
 *     description: |
 *       Creates a new comment on a specific task.
 *       **Roles:** Any Authenticated User
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: "integer" }
 *         description: Task ID
 *         example: 501
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: "string", example: "Working on this now." }
 *     responses:
 *       201:
 *         description: Comment added
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/:taskId/comments", commentController.createComment);
/**
 * @swagger
 * /api/tasks/{taskId}/comments:
 *   get:
 *     summary: Get all comments for a task
 *     description: |
 *       Retrieves all comments associated with a specific task.
 *       **Roles:** Any Authenticated User
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: "integer" }
 *         description: Task ID
 *         example: 501
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: "boolean", example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: "#/components/schemas/Comment" }
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:taskId/comments", commentController.getTaskComments);

// Task Attachments
/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   post:
 *     summary: Upload a file attachment to a task
 *     description: |
 *       Uploads a file and attaches it to the specified task. Supports S3 multipart upload.
 *       **Roles:** Any Authenticated User
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: "integer" }
 *         description: Task ID
 *         example: 501
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (e.g., PDF, Image)
 *     responses:
 *       201:
 *         description: Attachment uploaded successfully
 *         content:
 *           application/json:
 *             schema: { $ref: "#/components/schemas/SuccessResponse" }
 *       400:
 *         $ref: "#/components/responses/BadRequest"
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.post("/:taskId/attachments", upload.single("file"), attachmentController.uploadAttachment);
/**
 * @swagger
 * /api/tasks/{taskId}/attachments:
 *   get:
 *     summary: Get all attachments for a task
 *     description: |
 *       Retrieves all file attachments associated with a specific task.
 *       **Roles:** Any Authenticated User
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema: { type: "integer" }
 *         description: Task ID
 *         example: 501
 *     responses:
 *       200:
 *         description: List of attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: "boolean", example: true }
 *                 data:
 *                   type: array
 *                   items: { $ref: "#/components/schemas/Attachment" }
 *       404:
 *         $ref: "#/components/responses/NotFound"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/:taskId/attachments", attachmentController.getTaskAttachments);

export default router;
