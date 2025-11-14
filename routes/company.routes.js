// routes/company.routes.js
import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  registerCompany,
  loginCompany,
  refreshToken,
  logoutCompany,
  getCompanyById,
  updateCompanyById,
  getCompanyDashboardData
} from "../controllers/company.controller.js";

const router = express.Router();

// public
router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/refresh", refreshToken); // exchange/rotate refresh token

// dashboard route is more specific — place it before :id routes
router.get("/:companyId/dashboard", requireAuth, getCompanyDashboardData);

// protected actions: logout & update require authentication
router.post("/logout", requireAuth, logoutCompany);

// GET/PUT by id
router.route("/:id")
  .get(getCompanyById)              // public read
  .put(requireAuth, updateCompanyById); // protected update

export default router;
