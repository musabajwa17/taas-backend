import express from "express";
import {
  createJob,
  getJobs,
  deleteJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.post("/", createJob); // Create new job
router.get("/", getJobs); // Get all jobs
router.delete("/:id", deleteJob); // Delete job

export default router;
