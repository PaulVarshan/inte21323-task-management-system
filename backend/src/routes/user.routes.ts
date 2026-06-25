import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import {
  createUser,
  getAllUsers,
  getUserById,
  updateUserDetails,
  changeUserRole,
  changeUserStatus
} from "../controllers/user.controller";

const router = Router();

router.use(authenticate);

router.post("/", createUser);
router.get("/", getAllUsers);
router.get("/:id", getUserById);
router.put("/:id/role", changeUserRole);
router.put("/:id/status", changeUserStatus);
router.put("/:id", updateUserDetails);

export default router;
