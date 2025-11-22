import express from "express";
// import { createResume } from "../controllers/resume.controller.js";
// import { verifyToken } from "../middleware/auth.js";
import { createStudentResume, getStudentResume, updateResume } from "../controllers/studentResume.controller.js";
const router = express.Router();

router.post("/stdresume", createStudentResume);
router.get("/stdresume/:userId", getStudentResume);
router.put("/stdresume/:userId", updateResume);
export default router;