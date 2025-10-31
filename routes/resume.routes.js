import express from "express";
import { saveEmployeeResume } from "../controllers/resume.controller.js";
// import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/resume", saveEmployeeResume);

export default router;
