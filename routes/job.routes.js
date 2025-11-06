import express from "express";
import {
  createJob,
  getJobs,
  getJobById,
  updateJob,
  deleteJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.post("/", createJob); // Create new job
router.get("/", getJobs); // Get all jobs
router.get("/:id", getJobById); // Get single job
router.put("/:id", updateJob); // Update job
router.delete("/:id", deleteJob); // Delete job

export default router;
