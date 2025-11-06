import Fyp from "../models/fyp.js";

// ✅ Create a new FYP
export const createFyp = async (req, res) => {
  try {
    const fyp = new Fyp(req.body);
    await fyp.save();
    res.status(201).json({ success: true, fyp });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating FYP", error: error.message });
  }
};

// ✅ Get all FYPs
export const getFyps = async (req, res) => {
  try {
    const fyps = await Fyp.find().populate("postedBy", "companyName email");
    res.status(200).json({ success: true, fyps });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching FYPs", error: error.message });
  }
};

// ✅ Get FYP by ID
export const getFypById = async (req, res) => {
  try {
    const fyp = await Fyp.findById(req.params.id).populate("postedBy", "companyName email");
    if (!fyp) return res.status(404).json({ success: false, message: "FYP not found" });
    res.status(200).json({ success: true, fyp });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching FYP", error: error.message });
  }
};

// ✅ Delete FYP
export const deleteFyp = async (req, res) => {
  try {
    const deleted = await Fyp.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: "FYP not found" });
    res.status(200).json({ success: true, message: "FYP deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error deleting FYP", error: error.message });
  }
};
