// controllers/company.controller.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Company from "../models/company.js";
import Job from "../models/job.js";
import Fyp from "../models/fyp.js";

const hashRefreshToken = async (token) => await bcrypt.hash(token, 12);

const compareRefreshToken = async (token, hash) => await bcrypt.compare(token, hash);

// REGISTER
export const registerCompany = async (req, res) => {
  try {
    const { companyName, email, password, phone, address, website, description, industry, size, establishedYear, logo } = req.body;

    if (!companyName || !email || !password) return res.status(400).json({ success: false, message: "companyName, email and password are required" });

    const existing = await Company.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: "Company already registered with this email" });

    const company = await Company.create({ companyName, email, password, phone, address, website, description, industry, size, establishedYear, logo });

    // Generate tokens
    const accessToken = company.generateAccessToken();
    const refreshToken = company.generateRefreshToken();
    company.refreshTokenHash = await hashRefreshToken(refreshToken);
    // Save hashed refresh token without re-running validators for password hashing
    await company.save({ validateBeforeSave: false });

    // TODO: send verification email here (production)
    res.status(201).json({ success: true, message: "Company registered", accessToken, refreshToken, company: { ...company.toObject(), password: undefined, refreshTokenHash: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// LOGIN (with refresh token rotation)
export const loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "email and password required" });

    const company = await Company.findOne({ email });
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    const isMatch = await company.isPasswordCorrect(password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    // Create new tokens and rotate refresh token
    const accessToken = company.generateAccessToken();
    const newRefreshToken = company.generateRefreshToken();
    company.refreshTokenHash = await hashRefreshToken(newRefreshToken);
    await company.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: "Login successful", accessToken, refreshToken: newRefreshToken, company: { ...company.toObject(), password: undefined, refreshTokenHash: undefined } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// REFRESH TOKEN endpoint (rotate)
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(400).json({ success: false, message: "Refresh token required" });

    // verify token signature
    let payload;
    try {
      payload = mongoose.Types.ObjectId.isValid(refreshToken) ? null : require("jsonwebtoken").verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }

    const companyId = payload._id;
    if (!mongoose.Types.ObjectId.isValid(companyId)) return res.status(401).json({ success: false, message: "Invalid token payload" });

    const company = await Company.findById(companyId);
    if (!company || !company.refreshTokenHash) return res.status(401).json({ success: false, message: "Refresh token not recognized" });

    const isValid = await compareRefreshToken(refreshToken, company.refreshTokenHash);
    if (!isValid) return res.status(401).json({ success: false, message: "Refresh token mismatch" });

    // rotate: issue new refresh token and store its hash
    const newAccessToken = company.generateAccessToken();
    const newRefreshToken = company.generateRefreshToken();
    company.refreshTokenHash = await hashRefreshToken(newRefreshToken);
    await company.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// LOGOUT (must be authenticated and only allowed for own company)
export const logoutCompany = async (req, res) => {
  try {
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ success: false, message: "companyId required" });

    // ensure the requester is the same company (req.company set by auth middleware)
    if (!req.company || req.company._id.toString() !== companyId) return res.status(403).json({ success: false, message: "Forbidden" });

    await Company.findByIdAndUpdate(companyId, { $unset: { refreshTokenHash: "" } });
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET single company by ID (public read but hide sensitive)
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid company id" });

    const company = await Company.findById(id).select("-password -refreshTokenHash");
    if (!company) return res.status(404).json({ success: false, message: "Company not found" });

    res.status(200).json({ success: true, company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE company by ID (only owner)
export const updateCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ success: false, message: "Invalid company id" });

    // only allow company owner to update
    if (!req.company || req.company._id.toString() !== id) return res.status(403).json({ success: false, message: "Forbidden" });

    const allowedFields = ["companyName", "email", "phone", "address", "website", "description", "industry", "size", "plan", "establishedYear", "logo"];
    const updates = {};
    allowedFields.forEach((field) => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });

    const updatedCompany = await Company.findByIdAndUpdate(id, updates, { new: true, runValidators: true }).select("-password -refreshTokenHash");
    if (!updatedCompany) return res.status(404).json({ success: false, message: "Company not found" });

    res.status(200).json({ success: true, message: "Company updated", company: updatedCompany });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DASHBOARD: aggregated jobType counts + totals (jobs vs internships) + optional grouping
export const getCompanyDashboardData = async (req, res) => {
  try {
    const companyId = req.params.companyId;
    if (!companyId) return res.status(400).json({ success: false, message: "companyId is required" });
    if (!mongoose.Types.ObjectId.isValid(companyId)) return res.status(400).json({ success: false, message: "Invalid companyId format" });

    // 1) aggregated counts per jobType (returns array of { jobType, count })
    const jobTypeStats = await Job.aggregate([
      { $match: { postedBy: new mongoose.Types.ObjectId(companyId) } },
      { $group: { _id: "$jobType", count: { $sum: 1 } } },
      { $project: { _id: 0, jobType: "$_id", count: 1 } },
      { $sort: { count: -1 } }
    ]);

    // 2) totals: jobs (non-internship) and internships
    const totals = await Job.aggregate([
      { $match: { postedBy: new mongoose.Types.ObjectId(companyId) } },
      { $group: { _id: { isInternship: { $eq: ["$jobType", "Internship"] } }, count: { $sum: 1 } } }
    ]);
    // convert totals array to object
    let jobsCount = 0, internshipsCount = 0;
    totals.forEach(t => {
      if (t._id && t._id.isInternship) internshipsCount = t.count;
      else jobsCount = t.count;
    });

    // 3) fyp count from separate collection
    const fypsCount = await Fyp.countDocuments({ postedBy: companyId });

    res.status(200).json({
      success: true,
      data: {
        totals: { jobs: jobsCount, internships: internshipsCount, fyps: fypsCount },
        jobTypeStats
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
