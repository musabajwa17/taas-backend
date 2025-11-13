import express from "express";
import { registerCompany, loginCompany, logoutCompany, getCompanyById, updateCompanyById, getCompanyDashboardData } from "../controllers/company.controller.js";
const router = express.Router();

router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/logout", logoutCompany);
// GET single company
router.get("/:id", getCompanyById);
// PUT update company
router.put("/:id", updateCompanyById);
// routes/companyRoutes.js
router.get("/:companyId/dashboard", getCompanyDashboardData);

export default router;
