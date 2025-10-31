import EmployeeResume from "../models/resume.js";

// Save or update a parsed resume
export const saveEmployeeResume = async (req, res) => {
  try {
    const { userId, ai_suggestions, ...data } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required." });
    }

    // Default AI suggestions if not provided
    const defaultAISuggestions = {
      missing_details: [],
      missing_sections: [],
      suggested_additions: [],
      summary_improvement: [],
    };

    const aiData = ai_suggestions || defaultAISuggestions;

    // Check if a resume already exists for this user and email
    const existing = await EmployeeResume.findOne({ userId, email: data.email });

    if (existing) {
      await EmployeeResume.updateOne(
        { _id: existing._id },
        { $set: { ...data, ai_suggestions: aiData } }
      );
      return res.status(200).json({ message: "Existing resume updated successfully." });
    }

    // Create new resume
    const newResume = new EmployeeResume({
      userId,
      ...data,
      ai_suggestions: aiData,
    });

    await newResume.save();

    res.status(201).json({ message: "Resume saved successfully.", resumeId: newResume._id });
  } catch (err) {
    console.error("❌ Error saving resume:", err);
    res.status(500).json({ error: err.message });
  }
};
