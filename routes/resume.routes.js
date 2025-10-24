import express from "express";
import { createResume } from "../controllers/resume.controller.js";
// import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

router.post("/resume", createResume);

export default router;
