import { Resume } from "../models/resume.js";
export const createResume = async (req, res) => {
  try {
    console.log("📩 Incoming Data:", req.body);

    const { userId, planType = "basic" } = req.body;

    if (!userId) {
      console.log("❌ userId missing in request body");
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // ✅ Check if the user already has a resume
    const existingResume = await Resume.findOne({ userId });

    // ✅ Restrict Basic Plan users to only one CV
    if (existingResume && planType === "basic") {
      console.log("⚠️ User already has a resume under Basic Plan");
      return res.status(403).json({
        success: false,
        message:
          "You have already uploaded a CV under your Basic Plan. Upgrade to Premium to add more.",
      });
    }

    let resume;
    if (existingResume) {
      // ✅ For Premium users or allowed updates
      resume = await Resume.findOneAndUpdate({ userId }, req.body, { new: true });
      console.log("✅ Resume Updated:", resume);
    } else {
      // ✅ Create a new resume
      resume = await Resume.create(req.body);
      console.log("✅ Resume Created:", resume);
    }

    res.status(201).json({
      success: true,
      message: existingResume ? "Resume updated successfully" : "Resume created successfully",
      data: resume,
    });
  } catch (error) {
    console.error("❌ Resume Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

