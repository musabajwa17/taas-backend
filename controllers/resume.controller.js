// import CV from "../models/resume.js";

// // 📌 Create or Update CV
// export const uploadCv = async (req, res) => {
//   try {
//     const { combinedData } = req.body;
//     console.log(combinedData)
//     if (!userId || !combinedData) {
//       return res.status(400).json({ message: "User ID and CV data are required" });
//     }

//     // Check if CV already exists for the user
//     let cv = await CV.findOne({ userId });

//     if (cv) {
//       // Update existing CV
//       cv = await CV.findOneAndUpdate({ userId }, { $set: combinedData }, { new: true });
//       return res.status(200).json({ message: "CV updated successfully", cv });
//     }

//     // Create new CV
//     const newCv = new CV({
//       userId,
//       combinedData,
//     });

//     await newCv.save();
//     res.status(201).json({ message: "CV uploaded successfully", cv: newCv });
//   } catch (error) {
//     console.error("Error uploading CV:", error.message);
// res.status(500).json({ message: "Internal Server Error", error: error.message });
//   }
// };

// // 📌 Get CV by User ID
// export const getCvByUserId = async (req, res) => {
//   try {
//     const { userId } = req.params;

//     const cv = await CV.findOne({ userId });

//     if (!cv) {
//       return res.status(404).json({ message: "CV not found for this user" });
//     }

//     res.status(200).json(cv);
//   } catch (error) {
//     console.error("Error fetching CV:", error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

// // 📌 Get All CVs (optional - admin use)
// // export const getAllCvs = async (req, res) => {
// //   try {
// //     const cvs = await Cv.find();
// //     res.status(200).json(cvs);
// //   } catch (error) {
// //     console.error("Error fetching all CVs:", error);
// //     res.status(500).json({ message: "Internal Server Error" });
// //   }
// // };


// import { Resume } from "../models/resume.model.js";
 import { Resume } from "../models/resume.js";

// export const createResume = async (req, res) => {
//   try {
//     const resume = await Resume.create({
//       userId: req.user._id, // from auth middleware
//       ...req.body,
//     });
//     res.status(201).json({
//       success: true,
//       message: "Resume created successfully",
//       data: resume,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ success: false, message: "Server Error" });
//   }
// };
export const  createResume = async (req, res) => {
  try {
    console.log("📩 Incoming Data:", req.body); // ✅ see what Postman sends

    const { userId } = req.body;

    if (!userId) {
      console.log("❌ userId missing in request body");
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const resume = await Resume.create(req.body);
    console.log("✅ Resume Saved:", resume);

    res.status(201).json({
      success: true,
      message: "Resume created successfully",
      data: resume,
    });
  } catch (error) {
    console.error("❌ Resume Creation Error:", error);
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};
