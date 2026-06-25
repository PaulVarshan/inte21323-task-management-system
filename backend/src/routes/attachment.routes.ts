import { Router } from "express";
import * as attachmentController from "../controllers/attachment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/attachments:
 *   get:
 *     summary: Get all attachments
 *     description: |
 *       Retrieves all attachments globally.
 *       **Roles:** Admin
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
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
 *       403:
 *         $ref: "#/components/responses/Forbidden"
 *       500:
 *         $ref: "#/components/responses/ServerError"
 */
router.get("/", attachmentController.getAllAttachments);
/**
 * @swagger
 * /api/attachments/{attachmentId}:
 *   delete:
 *     summary: Delete an attachment
 *     description: |
 *       Deletes a file attachment and removes it from storage (S3/local).
 *       **Roles:** Admin, Project Manager, or Uploader
 *     tags: [Attachments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attachmentId
 *         required: true
 *         schema: { type: "integer" }
 *         description: Attachment ID
 *         example: 3001
 *     responses:
 *       200:
 *         description: Attachment deleted successfully
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
router.delete("/:attachmentId", attachmentController.deleteAttachment);

export default router;
