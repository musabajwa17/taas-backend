import mongoose from "mongoose";

const applicantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
    },
    jobTitle: {
      type: String,
      required: true,
    },
    experience: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Shortlisted", "Rejected", "Hired"],
      default: "Pending",
    },
    resumeUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Applicant = mongoose.model("Applicant", applicantSchema);
export default Applicant;