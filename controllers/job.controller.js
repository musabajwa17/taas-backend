import mongoose from "mongoose";
import Job from "../models/job.js";

export const createJob = async (req, res) => {
  try {
    const {
      title,
      description,
      experience,
      qualification,
      location,
      salary,
      type,
      requirements,
      status,
      postedBy: postedByFromFrontend
    } = req.body;

    if (!postedByFromFrontend) {
      return res.status(400).json({ success: false, message: "postedBy is required" });
    }

    // Use `new` when creating ObjectId
    const postedBy = new mongoose.Types.ObjectId(postedByFromFrontend);
    const postedByModel = "Company"; // or "Employer" depending on logged-in role

    const job = new Job({
      title,
      description,
      experience,
      qualification,
      location,
      salary,
      type,
      requirements,
      status,
      postedBy,
      postedByModel,
    });

    await job.save();

    res.status(201).json({ success: true, message: "Job posted successfully", job });
  } catch (error) {
    console.error("❌ Error creating job:", error);
    res.status(500).json({ success: false, message: "Failed to create job", error: error.message });
  }
};



// ✅ Get all Jobs with dynamic populate
export const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate({
        path: "postedBy",
        select: "companyName name email", // both Company and Employer fields
        strictPopulate: false, // avoids refPath strict issues
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, message: "Jobs fetched successfully", jobs });
  } catch (error) {
    console.error("❌ Error fetching jobs:", error);
    res.status(500).json({ success: false, message: "Error fetching jobs", error: error.message });
  }
};

// ✅ Delete a job by ID
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    await Job.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Job deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting job:", error);
    res.status(500).json({ success: false, message: "Failed to delete job", error: error.message });
  }
};
