// routes/resume.routes.js
import express from "express";
import { saveEmployeeResume, getEmployeeResume, updateEmployeeResume } from "../controllers/resume.controller.js";

const router = express.Router();

// Save (already done)
router.post("/resume", saveEmployeeResume);

// NEW — Get resume by userId
router.get("/resume/:userId", getEmployeeResume);

// NEW — Update resume by userId
router.put("/resume/:userId", updateEmployeeResume);

export default router;
