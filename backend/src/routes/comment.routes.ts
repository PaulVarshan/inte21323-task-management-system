import { Router } from "express";
import * as commentController from "../controllers/comment.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.use(authenticate);

/**
 * @swagger
 * /api/comments/{commentId}:
 *   put:
 *     summary: Update a comment
 *     description: |
 *       Updates the content of an existing comment.
 *       **Roles:** Any Authenticated User (must be the comment author or Admin)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: "integer" }
 *         description: Comment ID
 *         example: 2001
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [content]
 *             properties:
 *               content: { type: "string", example: "Updated comment text." }
 *     responses:
 *       200:
 *         description: Comment updated
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
router.put("/:commentId", commentController.updateComment);
/**
 * @swagger
 * /api/comments/{commentId}:
 *   delete:
 *     summary: Delete a comment
 *     description: |
 *       Deletes an existing comment.
 *       **Roles:** Any Authenticated User (must be the comment author or Admin)
 *     tags: [Comments]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema: { type: "integer" }
 *         description: Comment ID
 *         example: 2001
 *     responses:
 *       200:
 *         description: Comment deleted
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
router.delete("/:commentId", commentController.deleteComment);

export default router;
