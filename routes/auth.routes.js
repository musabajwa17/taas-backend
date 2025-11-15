import express from "express";
import {
  login,
  logout,
  getMe,
  registerUser,
  registerCompany,
} from "../controllers/auth.controller.js";

import { requireAuth } from "../middleware/requireAuth.js";

const router = express.Router();

// -------------------- PUBLIC ROUTES -------------------- //
// Login (all roles)
router.post("/login", login);

// Register user
router.post("/register/user", registerUser);

// Register company
router.post("/register/company", registerCompany);

// -------------------- PROTECTED ROUTES -------------------- //
// Get current logged-in user/company
router.get("/me", requireAuth, getMe);

// Logout
router.post("/logout", requireAuth, logout);

export default router;
