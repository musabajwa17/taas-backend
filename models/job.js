import mongoose from "mongoose";

const JobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
      maxlength: [5000, "Description cannot exceed 500 words"], // approx 500 words ~ 5000 chars
      trim: true,
    },
    experience: {
      type: String,
      enum: ["Fresher", "1-2 years", "3-4 years", "5-6 years", "6+ years"],
      required: [true, "Experience is required"],
    },
    qualification: {
      type: String,
      enum: [
        "BS in CS",
        "MS in CS",
        "BS in IT",
        "MS in IT",
        "BS in SE",
        "MS in SE",
        "Other",
      ],
      required: [true, "Qualification is required"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    salary: {
      type: String,
      enum: [
        "30-40k",
        "40-60k",
        "60-80k",
        "80-100k",
        "100-200k",
        "200-300k",
        "300-400k",
        "400-500k",
      ],
      required: [true, "Salary range is required"],
    },
    jobType: {
      type: String,
      enum: ["Full-time", "Part-time", "Contract", "Internship", "Other"],
      required: [true, "Job type is required"],
    },
    status: {
      type: String,
      enum: ["Active", "Closed", "Pending"],
      default: [true, "Status is required"],
    },
    requirements: {
      type: [String], // Array of skills
      required: [true, "Job requirements are required"],
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Job", JobSchema);
