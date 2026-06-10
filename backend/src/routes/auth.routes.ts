import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";

import {
  register,
  login,
  adminLogin,
  logout,
  checkAuth
} from "../controllers/auth.controller";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/adminLogin", adminLogin);
router.post("/logout", logout);
router.get("/checkAuth", authenticate, checkAuth);

export default router;