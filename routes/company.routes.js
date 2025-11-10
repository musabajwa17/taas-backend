import express from "express";
import { registerCompany, loginCompany, logoutCompany } from "../controllers/company.controller.js";
import {
  getCompanyById,
  updateCompanyById,
} from "../controllers/company.controller.js";
const router = express.Router();

router.post("/register", registerCompany);
router.post("/login", loginCompany);
router.post("/logout", logoutCompany);
// GET single company
router.get("/:id", getCompanyById);

// PUT update company
router.put("/:id", updateCompanyById);
export default router;
