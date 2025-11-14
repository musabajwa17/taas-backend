import mongoose from "mongoose";
import Job from "../models/job.js";

/* ============================================================
   CREATE JOB  (Enhanced validation, safer ObjectId handling)
   ============================================================ */
export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      experience,
      qualification,
      location,
      salary,
      jobType,
      requirements,
      status,
      postedBy: postedByFromFrontend,
    } = req.body;

    // 🔹 Validate required fields
    if (!postedByFromFrontend) {
      return res.status(400).json({
        success: false,
        message: "postedBy is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(postedByFromFrontend)) {
      return res.status(400).json({
        success: false,
        message: "Invalid postedBy ObjectId",
      });
    }

    const postedBy = new mongoose.Types.ObjectId(postedByFromFrontend);
    const postedByModel = "Company"; // dynamic if needed later (Employer/Company)

    const job = new Job({
      title,
      description,
      experience,
      qualification,
      location,
      salary,
      jobType,
      requirements,
      status,
      postedBy,
      postedByModel,
    });

    await job.save();

    res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("❌ Error creating job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create job",
      error: error.message,
    });
  }
};

/* ============================================================
   GET ALL JOBS (Enhanced populate, sorting, still compatible)
   ============================================================ */
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate({
        path: "postedBy",
        select: "companyName name email logo address",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Jobs fetched successfully",
      jobs,
    });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching jobs",
      error: error.message,
    });
  }
};

/* ============================================================
   DELETE JOB BY ID (No behavior change)
   ============================================================ */
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid job ID",
      });
    }

    await Job.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Job deleted successfully",
    });
  } catch (error) {
    console.error("❌ Error deleting job:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete job",
      error: error.message,
    });
  }
};

/* ============================================================
   UPDATE JOB STATUS (Enhanced validation)
   ============================================================ */
export const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["Active", "Closed", "Pending"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status. Allowed: Active, Closed, Pending.",
      });
    }

    const job = await Job.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job status updated successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating job status",
      error: error.message,
    });
  }
};

/* ============================================================
   GET INTERNSHIPS (Enhanced — now includes company populate)
   ============================================================ */
export const getInternships = async (req, res) => {
  try {
    const internships = await Job.find({ jobType: "Internship" })
      .populate({
        path: "postedBy",
        select: "companyName name email logo address",
        strictPopulate: false,
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: internships.length,
      data: internships,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch internships",
      error: error.message,
    });
  }
};
