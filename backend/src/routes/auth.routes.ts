import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

import {
  register,
  login,
  adminLogin,
  logout,
  checkAuth,
  getAllUsers,
  refresh
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/adminLogin", adminLogin);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/checkAuth", authenticate, checkAuth);
router.get("/users", authenticate, getAllUsers);

export default router;