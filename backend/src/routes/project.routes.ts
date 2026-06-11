import { Router } from "express";
import * as projectController from "../controllers/project.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Apply authenticate middleware to all routes in this router
router.use(authenticate);

// =======================
// PROJECT CRUD OPERATIONS
// =======================

router.post("/", projectController.createProject);
router.get("/", projectController.getAllProjects);
router.get("/:id", projectController.getProjectById);
router.put("/:id", projectController.updateProject);
router.delete("/:id", projectController.deleteProject);

// =======================
// TEAM MANAGEMENT
// =======================

router.get("/all/members", projectController.getAllTeamMembers);

router.post("/:id/members", projectController.addMember);
router.get("/:id/members", projectController.getMembers);
router.put("/:id/members/:userId", projectController.updateMemberRole);
router.delete("/:id/members/:userId", projectController.removeMember);

export default router;