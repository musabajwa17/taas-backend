import { StudentResume } from "../models/studentResume.js";

export const createStudentResume = async (req, res) => {
  try {
    console.log("📩 Incoming Student Resume Data:", req.body);

    const { userId, name, email, summary, education, planType = "Basic", ...rest } = req.body;

    // ✅ Validate required fields
    if (!userId || !name || !email || !summary || !education) {
      return res.status(400).json({
        success: false,
        message: "userId, name, email, summary, and education are required.",
      });
    }

    // ✅ Check for existing resume
    const existingResume = await StudentResume.findOne({ userId });

    // ✅ Restrict Basic Plan users to one resume
    if (existingResume && planType.toLowerCase() === "basic") {
      console.log("⚠️ Basic plan user already has a resume.");
      return res.status(403).json({
        success: false,
        message:
          "You already have a resume under the Basic Plan. Upgrade to Premium to create or modify more resumes.",
      });
    }

    let resume;

    if (existingResume) {
      // ✅ For Premium users: update existing resume
      resume = await StudentResume.findOneAndUpdate({ userId }, req.body, { new: true });
      console.log("✅ Resume updated successfully:", resume);

      res.status(200).json({
        success: true,
        message: "Resume updated successfully (Premium Plan).",
        resume,
      });
    } else {
      // ✅ Create new resume
      resume = new StudentResume({
        userId,
        name,
        email,
        summary,
        education,
        planType,
        ...rest,
      });

      await resume.save();
      console.log("✅ New resume created:", resume);

      res.status(201).json({
        success: true,
        message:
          planType.toLowerCase() === "basic"
            ? "Resume created successfully under Basic Plan."
            : "Resume created successfully under Premium Plan.",
        resume,
      });
    }
  } catch (error) {
    // ✅ Handle duplicate userId errors
    if (error.code === 11000 && error.keyValue?.userId) {
      return res.status(409).json({
        success: false,
        message: "A resume already exists for this user (duplicate userId).",
      });
    }

    console.error("❌ Error creating student resume:", error);
    res.status(500).json({
      success: false,
      message: "Server error occurred.",
      error: error.message,
    });
  }
};
