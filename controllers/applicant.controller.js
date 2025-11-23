import Applicant from "../models/applicant.js";
import User from "../models/user.js";
import {StudentResume} from "../models/studentResume.js";

// ✅ Create a new applicant
export const createApplicant = async (req, res) => {
  try {
    const { userId, jobId, resumeId } = req.body;

    if (!userId || !jobId || !resumeId) {
      return res.status(400).json({ success: false, message: "userId, jobId, and resumeId are required" });
    }

    const applicant = new Applicant({ userId, jobId, resumeId });
    await applicant.save();

    const populatedApplicant = await applicant
      .populate("userId", "name email") // include full resume snapshot if needed

    res.status(201).json({ success: true, applicant: populatedApplicant });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Get all applicants (optionally filter by jobId)
export const getApplicants = async (req, res) => {
  try {
    const filter = {};
    if (req.query.jobId) filter.jobId = req.query.jobId;

    const applicants = await Applicant.find(filter)
      .populate("userId", "name email")
      .populate("resumeId"); // full resume

    res.status(200).json({ success: true, applicants });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Get single applicant by ID
export const getApplicantById = async (req, res) => {
  try {
    const applicant = await Applicant.findById(req.params.id)
      .populate("userId", "name email")
      .populate("resumeId");

    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    res.status(200).json({ success: true, applicant });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update applicant status
export const updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const applicant = await Applicant.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email").populate("resumeId");

    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    res.status(200).json({ success: true, applicant });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// ✅ Delete applicant
export const deleteApplicant = async (req, res) => {
  try {
    const applicant = await Applicant.findByIdAndDelete(req.params.id);
    if (!applicant) return res.status(404).json({ message: "Applicant not found" });
    res.status(200).json({ success: true, message: "Applicant deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
