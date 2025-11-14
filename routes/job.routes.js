import express from "express";
import {
  createJob,
  getJobs,
  deleteJob,
  updateJobStatus,
  getInternships
} from "../controllers/job.controller.js";

const router = express.Router();

router.post("/", createJob); // Create new job
router.get("/", getJobs); // Get all jobs
router.delete("/:id", deleteJob); // Delete job
router.put("/jobs/:id", updateJobStatus);
router.get("/internships", getInternships);
export default router;
