import express from "express";
// import { createResume } from "../controllers/resume.controller.js";
// import { verifyToken } from "../middleware/auth.js";
import { createStudentResume } from "../controllers/studentResume.controller.js";
const router = express.Router();

router.post("/stdresume", createStudentResume);

export default router;